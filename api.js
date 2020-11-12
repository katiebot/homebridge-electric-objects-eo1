let Cookie = require('tough-cookie')//.Cookie
let request = require('request-promise-native')
let memoize = require('memoizee')
let eo = require('electric-objects')

let Api = function (log, username, password) {
  this.log = log
  this.username = username
  this.password = password

  // Memoize methods
  this.logIn = memoize(
    this.logIn.bind(this),
    {
      promise: true,
      maxAge: 14 * 24 * 60 * 60 * 1000 /* 14 days */
    })
}

Api.prototype.logIn = async function () {
  this.log('Setting up new EO1 session')
  let eoClient = eo(this.username, this.password)

  return eoClient.getCookies()
}

Api.prototype.devices = async function () {
  this.log('Getting EO1 devices')
  let devices = this.fetch('/api/v6/user/devices', false)

  return devices
}

Api.prototype.turnOn = async function (deviceId) {
  this.log('Turning on EO1 device', deviceId)
  return this.fetch(`/api/v6/devices/${deviceId}?backlight_state=true`, true)
}

Api.prototype.turnOff = async function (deviceId) {
  this.log('Turning off EO1 device', deviceId)
  return this.fetch(`/api/v6/devices/${deviceId}?backlight_state=false`, true)
}

Api.prototype.fetch = async function (path, put) {
  let cookies = await this.logIn()
  let cookiejar = request.jar()
  for (var i in cookies) {
    let cookie = Cookie.Cookie.parse(cookies[i])
    if (cookie && cookie.key === 'remember_user_token') {
      cookiejar.setCookie(cookie.toString(), 'https://www.electricobjects.com', function() {
        // do nothing
      });
    }
  }

  if (put === true) {
    return request.put({
      json: true,
      uri: Api.prototype.endpoint(path),
      jar: cookiejar
    })
  }

  return request.get({
    json: true,
    uri: Api.prototype.endpoint(path),
    jar: cookiejar
  })
}

Api.prototype.endpoint = function (path) {
  return 'https://www.electricobjects.com' + path
}

module.exports = {
  Api: Api
}
