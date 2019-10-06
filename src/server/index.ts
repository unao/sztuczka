import * as WebSocket from 'ws'
import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

import { localIP } from './utils'
import { Role, Message } from '../common'

const inAssets = (s: string) => path.resolve(__dirname, '../assets', s)

const initSelfie = () => {
  if (!fs.existsSync(inAssets('selfie'))) {
    fs.mkdirSync(inAssets('selfie'))
  }
  const sessionId = Date.now()
  let fileId = 0
  fs.mkdirSync(inAssets(`selfie/${sessionId}`))
  return (img: string) =>
    fs.writeFile(
      inAssets(`selfie/${sessionId}/${fileId++}.png`),
      img.replace(/^data:image\/png;base64,/, ''),
      'base64',
      () => null
    )
}

const run = (port = 3356) => {
  const host = localIP()
  const server = https.createServer({
    key: fs.readFileSync(path.resolve(__dirname, '../../cert/key.pem')),
    cert: fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem'))
  })
  const wss = new WebSocket.Server({
    server,
    path: '/ws'
  })

  server.listen(port, '0.0.0.0')
  console.log(`Server listening on ${host}:${port}`)

  const saveSelfie = initSelfie()

  const conn: { [K in Role]?: WebSocket } = {}
  const sendConn = () =>
    conn.control &&
    conn.control.send(
      JSON.stringify({
        type: 'conn',
        payload: Object.keys(conn)
      })
    )

  let lastTxt: any
  wss.on('connection', (ws, req) => {
    const role = req.url!.split('role=')[1] as Role
    console.log('joined:', role)
    conn[role] = ws
    sendConn()
    lastTxt && ws.send(lastTxt)
    ws.on('close', () => {
      console.log('left:', role)
      delete conn[role]
      sendConn()
    })
    ws.on('message', m => {
      const msg = JSON.parse(m as string) as Message & { to?: string }

      if (msg.type === 'txt') {
        lastTxt = m
      }

      if (msg.to && conn[msg.to as Role]) {
        conn[msg.to as Role]!.send(m)
      }

      if (!msg.to) {
        wss.clients.forEach(w => w.send(m))
      }

      if (msg.type === 'img') {
        saveSelfie((msg as Message<'img'>).payload.url)
      }
    })
  })
}

run()
