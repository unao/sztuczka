import * as WebSocket from 'ws'
import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

import { localIP } from './utils'
import { Role, ServerToControl } from '../common'

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

  const conn: { [K in Role]?: WebSocket } = {}
  const sendConn = () =>
    conn.control &&
    conn.control.send(
      JSON.stringify({
        type: 'conn',
        payload: Object.keys(conn)
      } as ServerToControl)
    )

  wss.on('connection', (ws, req) => {
    const role = req.url!.split('role=')[1] as Role
    console.log('joined:', role)
    conn[role] = ws
    sendConn()
    ws.on('close', () => {
      console.log('left:', role)
      delete conn[role]
      sendConn()
    })
    ws.on('message', m => {
      console.log('MSG', (m as string).substr(0, 16))
      wss.clients.forEach(w => w.send(m))
      // conn['screen'] && conn['screen'].send(m)
    })
  })
}

run()
