var Service, Characteristic
let Api = require('./api.js').Api

module.exports = function (homebridge) {
  Service = homebridge.hap.Service
  Characteristic = homebridge.hap.Characteristic
  homebridge.registerAccessory('homebridge-electric-objects-eo1', 'EO1', EO1, true)
}

let EO1 = function (log, config, api) {
  this.log = log
  this.api = api
  this.name = config['name']
  this.serial = config['serial']
  this.model = config['model']
  this.backend = new Api(log, config['username'], config['password'])

  this.log(`Adding Electric Objects ${this.model} (${this.serial})`)
}

EO1.prototype.getBacklightStateWithCallback = function (callback) {
  this.getBacklightState()
    .then(val => callback(null, val))
    .catch(err => {
      this.log(err)
      callback(err)
  })
}

EO1.prototype.getBacklightState = async function () {
  let devices = await this.backend.devices()
  for (var i in devices) {
    if ((devices[i].name === this.name)) {
      return Promise.resolve(devices[i].backlight_state)
    }
  }

  return Promise.reject(new Error(`Device with name ${this.name} not found`))
}

EO1.prototype.setBacklightStateWithCallback = function (state, callback) {
  this.setBacklightState(state)
    .then(val => callback(null, val))
    .catch(err => {
      this.log(err)
      callback(err)
  })
}

EO1.prototype.setBacklightState = async function (state) {
  let devices = await this.backend.devices()
  for (var i in devices) {
    if ((devices[i].name === this.name)) {
      if (state == true) {
        this.log(`Setting backlight state to on for device ID ${devices[i].id}`)
        await this.backend.turnOn(devices[i].id);
      }
      else {
        this.log(`Setting backlight state to off for device ID ${devices[i].id}`)
        await this.backend.turnOff(devices[i].id);
      }
      return Promise.resolve(devices[i].backlight_state)
    }
  }

  return Promise.reject(new Error(`Device with name ${this.name} not found`))
}

EO1.prototype.getServices = function () {
  let info = new Service.AccessoryInformation()

  info
    .setCharacteristic(Characteristic.Manufacturer, 'Electric Objects')
    .setCharacteristic(Characteristic.Model, this.model)
    .setCharacteristic(Characteristic.SerialNumber, this.serial)

  let status = new Service.Switch(this.name)

  status
    .getCharacteristic(Characteristic.On)
    .on('get', this.getBacklightStateWithCallback.bind(this))
    .on('set', this.setBacklightStateWithCallback.bind(this))

  let services = [info, status]

  return services
}
