# homebridge-electric-objects-eo1
Homebridge plugin for Electric Objects EO1

## Installation
`sudo npm install -g --unsafe-perm homebridge-electric-objects-eo1`

## Configuration
Add to the accessories in your `config.json`
```
{
  "name": "Electric Objects EO1",
  "accessory": "Electric Objects",
  "model": "EO1",
  "serial": "<serial>",
  "username": "<username>",
  "password": "<password>",
  "pollingInterval": 300
}
```

## Credits
Uses a modified version of [jed/electric-objects](https://github.com/jed/electric-objects) for authentication.
