var util = require('util');
var bleno = require('bleno');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var MotorControlCharacteristic = function() {
    MotorControlCharacteristic.super_.call(this, {
        uuid: '2B18',
        properties: ['read'],
        descriptors: [
          new Descriptor({
            uuid: '2901',
            value: 'Motor speed'
          })
        ]
    });
};

util.inherits(MotorControlCharacteristic, Characteristic);

MotorControlCharacteristic.prototype.onReadRequest = function(offset, cb) {
  console.log('On read request received');
};

module.exports = MotorControlCharacteristic;
