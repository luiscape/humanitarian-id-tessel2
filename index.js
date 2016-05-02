/*

  SERVER
  ------

  Starts a Humanitarian RFID server on a Tessel 2.
  Code could be easily coupled to use a different
  method.

  The most important pieces here outlined are
  the HTTP interface with the Humanitarian ID application
  -- which is here configured in the CONFIGURATION section.
  Also, one has to chose which crisis users are signing
  into based on a list of IDs available in Humanitarian ID.
  This is done to facilitate the configuration of
  the device.

*/

var path = require('path')
var tessel = require('tessel')
var express = require('express')
var rfidlib = require('rfid-pn532')
var request = require('request-json')

/*

  CONFIGURATION
  -------------

  Here is configured the application essential
  parameters.

*/

var number_of_cards = 0
var CONFIG = {
  'country': 'Syria',
  'iso': 'SYR',
  'mode': 'check-in',
  'version': 'v0.0.1',
  'url': 'http://192.168.0.6:3000',
  'cards': {
    'read': null,
    'failed': null
  }
}

var app = express()
var rfid = rfidlib.use(tessel.port['A'])
var client = request.createClient(CONFIG.url)

/*

  ROUTES
  ------

  Here the application routes are configured. These
  routes are used for configuring the Tessel locally,
  if needed.

*/

app.get('/', function (req, res) {
  options.cards.read = number_of_cards
  res.json(options)
})

var server = app.listen(3000, function () {
  console.log('ADDRESS: ' + require('os').networkInterfaces().wlan0[0].address)
  console.log('PORT: ' + server.address().port)

  rfid.on('ready', function (version) {
    console.log('Ready to read RFID card')

    rfid.on('data', function (card) {
      number_of_cards += 1

      /* Blinking lights to indicate activity. */
      for (var i = 0; i >= 3; i++) {
        tessel.led[2].toggle()
      }
      tessel.led[2].off()

      /* Sending the card ID for the server. */
      var d = { 'id': card.uid.toString('hex') }
      client.post('/', d, function (err, res, body) {
        if (res !== undefined) {
          console.log(res.body)
        /*

          SCREEN
          ------

          Here the Tessel will interact with the screen
          based on the server response. It should generate
          render information about the logged-in user.

        */
        } else {
          console.log('Failed to connect to server.')
        }
      })
    })
  })
})

rfid.on('error', function (err) {
  console.error(err)
})
