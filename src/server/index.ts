import * as WebSocket from 'ws'

import { localIP } from './utils'

const run = (port = 3356) => {
  const host = localIP()
  const wss = new WebSocket.Server({
    host: '0.0.0.0',
    port,
    path: '/ws'
  })

  console.log(`Server listening on ${host}:${port}`)

  wss.on('connection', (ws, req) => console.log('connection', req.url))
}

run()
