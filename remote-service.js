var util = require('util');
var bleno = require('bleno');
var PrimaryService = bleno.PrimaryService;

var MotorControlCharacteristic = require('./motor-control-characteristic');
var StepperControlCharacteristic = require('./stepper-control-characteristic');

function RemoteService() {
  RemoteService.super_.call(this, {
    uuid: '180F',
    characteristics: [
      new MotorControlCharacteristic(),
      new StepperControlCharacteristic()
    ]
  });
}

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;