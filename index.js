'use strict'
const http = require('http')
const URL = require('url')

const PORT = process.env.PORT || 3000

const redirects = {}

Object.keys(process.env)
  .filter(k => /^REDIRECT_.*$/.test(k))
  .forEach(k => {
    const target = process.env[k]
    const url = URL.parse(target)
    redirects[url.hostname] = target
  })

const REDIRECT_COUNT = Object.keys(redirects).length

if (REDIRECT_COUNT <= 0) {
  console.error('error: no REDIRECT_name keys found')
  process.exit(1)
}

process.on('SIGINT', () => process.exit(0))

const log = message => {
  const time = (new Date()).toISOString()
  console.log(`${time}: ${message}`)
}

const handler = (req, res) => {
  const agent = req.headers['user-agent']
  if (agent === 'ELB-HealthChecker/2.0') {
    res.writeHead(200, {
      'Content-Length': 0,
      Connection: 'close'
    })
    res.end()
    return
  }

  const hostname = req.headers.host
  const target = redirects[hostname] ? redirects[hostname] : null

  if (!target) {
    log(`no target to redirect for ${hostname}`)
    Object.keys(req.headers).forEach(key => {
      const v = req.headers[key]
      if (v) {
        const text = v.replace(/[^\x20-\x7F]/g, '?')
        log(`header[${key}]:[${text}]`)
      }
    })
    res.writeHead(400, {
      'Content-Length': 0,
      Connection: 'close'
    })
    res.end()
    return
  }

  log(`redirect ${hostname}${req.url} to ${target}`)
  res.writeHead(302, {
    Location: target,
    'Content-Length': 0,
    Connection: 'close'
  })
  res.end()
}

const server = http.createServer(handler)
server.listen(PORT, err => {
  if (err) {
    log('error: ${err}')
    process.exit(1)
  }
  log(`listening on ${PORT}`)
  Object.keys(redirects)
    .forEach(k => {
      const target = redirects[k]
      log(`redirecting ${k} to ${target}`)
    })
})
