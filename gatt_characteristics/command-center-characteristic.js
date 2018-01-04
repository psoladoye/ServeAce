'use strict';

const util = require('util');
const bleno = require('bleno');

let Descriptor = bleno.Descriptor;
let Characteristic = bleno.Characteristic;

let CommandCenterCharacteristic = function() {
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

CommandCenterCharacteristic.prototype.onWriteRequest = function(data, offset,
  withoutResponse, cb) {
  cb(this.RESULT_SUCCESS);
  this.emit('dataReceived',data);
};

module.exports = CommandCenterCharacteristic;
