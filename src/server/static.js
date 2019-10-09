const fs = require('fs')
const https = require('https')
const express = require('express')
const path = require('path')

const app = express()
app.use(express.static(process.env.SERVE_DIRECTORY || 'build'))

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../../cert/key.pem'), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem'), 'utf8')
}
const server = https.createServer(options, app)

server.listen(3355, () => console.log('Listening...'))
