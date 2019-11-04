const fs = require('fs')
const https = require('https')
const express = require('express')
const bodyParser = require('body-parser')
const path = require('path')

try {
  fs.mkdirSync(path.resolve(__dirname, `../../build/selfie`))
} catch (err) {
  _
}

const app = express()
app.use(express.static(process.env.SERVE_DIRECTORY || 'build'))
app.use(bodyParser.text({ limit: '10mb' }))
app.post('/selfie/:id', (req, res) => {
  const i = req.body.replace(/^data:image\/png;base64,/, '')
  fs.writeFile(
    path.resolve(__dirname, `../../build/selfie/${req.params.id}`),
    i,
    'base64',
    err => {
      err ? console.error(err) : res.end()
    }
  )
})

const options = {
  key: fs.readFileSync(path.resolve(__dirname, '../../cert/key.pem'), 'utf8'),
  cert: fs.readFileSync(path.resolve(__dirname, '../../cert/cert.pem'), 'utf8')
}
const server = https.createServer(options, app)

server.listen(3355, () => console.log('Listening...'))
