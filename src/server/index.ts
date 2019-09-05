import * as WebSocket from 'ws'
import * as fs from 'fs'
import * as https from 'https'
import * as path from 'path'

import { localIP } from './utils'

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

  wss.on('connection', (ws, req) => {
    const role = req.url!.split('role=')[1]
    console.log('CONN', role)
    ws.on('close', () => console.log('CLOSED', role))
  })
}

run()
