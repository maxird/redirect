# Redirect

Redirect is a very simple node-based application that
is intended to provide a root page forwarder when used
in conjunction with a proxy server that routes requests
that are on non-rooted pages.

## Configuration

Configuration is performed via environment variables as
detailed below:

- `PORT` - tcp port to listen for requests
- `REDIRECT_name` - full URL to perform a 302 redirect against
  for any request that reaches this server

## Example

export PORT=3000
export REDIRECT_1=https://hostname/path
export REDIRECT_two=https://hostname2/path
node index.js
