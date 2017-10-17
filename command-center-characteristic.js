var util = require('util');
var bleno = require('bleno');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var CommandCenterCharacteristic = function() {
    CommandCenterCharacteristic.super_.call(this, {
        uuid: '2D18',
        properties: ['write'],
        descriptors: [
          new Descriptor({
            uuid: '2903',
            value: 'Send remote commands'
          })
        ]
    });
};

util.inherits(CommandCenterCharacteristic, Characteristic);

CommandCenterCharacteristic.prototype.onReadRequest = function(offset, cb) {
  console.log('On write request received');
  cb(this.RESULT_SUCCESS);
};

CommandCenterCharacteristic.prototype.onWriteRequest = function(data, offset,
  withoutResponse, cb) {
  console.log('Command received: ',data);
  cb(this.RESULT_SUCCESS);
};

//module.exports = CommandCenterCharacteristic;
export { CommandCenterCharacteristic };
