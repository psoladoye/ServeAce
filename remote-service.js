var util = require('util');
var bleno = require('bleno');
var PrimaryService = bleno.PrimaryService;

var MotorControlCharacteristic = require('./motor-control-characteristic');
var StepperControlCharacteristic = require('./stepper-control-characteristic');
var CommandCenterCharacteristic = require('./command-center-characteristic');

var mCtrlChar = new MotorControlCharacteristic();
var sCtrlChar = new StepperControlCharacteristic();
var cCenterChar = new CommandCenterCharacteristic();

sCtrlChar.on('onReadRequest', function(state) {
  console.log('state event watch test');
});

function RemoteService() {
  RemoteService.super_.call(this, {
    uuid: 'd270',
    characteristics: [
      mCtrlChar,
      sCtrlChar,
      cCenterChar
    ]
  });
}

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
