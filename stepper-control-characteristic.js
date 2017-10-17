var util = require('util');
var bleno = require('bleno');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var StepperControlCharacteristic = function() {
    StepperControlCharacteristic.super_.call(this, {
        uuid: '2C18',
        properties: ['read'],
        descriptors: [
          new Descriptor({
            uuid: '2902',
            value: 'Stepper position'
          })
        ]
    });
};

util.inherits(StepperControlCharacteristic, Characteristic);

StepperControlCharacteristic.prototype.onReadRequest = function(offset, cb) {
  console.log('On read request received');
};

module.exports = StepperControlCharacteristic;
