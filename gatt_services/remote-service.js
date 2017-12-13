'use strict';

var util = require('util');
var bleno = require('bleno');
var PrimaryService = bleno.PrimaryService;
var fork = require('child_process').fork;
const log = require('../utils/logger')('REMOTE_SERVICE');

var BallCountCharacteristic = require('../gatt_characteristics/ball-count-characteristic');
var CommandCenterCharacteristic = require('../gatt_characteristics/command-center-characteristic');

var cCenterChar = new CommandCenterCharacteristic();
var bCountChar = new BallCountCharacteristic();

var mCtrl_process = null;
var sCtrl_process = null;
const COMM_TAGS = require('../common/constants').COMM_TAGS;
const DEV_STATES = require('../common/constants').DEV_STATES;

process.on('message', function(msg) {
  log.info(msg);
});

cCenterChar.on('dataReceived', function(data) {
  let parsedData = JSON.parse(data);
  log.info('Parsed Data: ',parsedData);

  switch(parseInt(parsedData.tag)) {
    case COMM_TAGS.DEV_POWER: {
      mCtrl_process.send({ tag:'POWER', val: parsedData.val });
      sCtrl_process.send({ tag:'POWER', val: parsedData.val });
      break;
    }

    case COMM_TAGS.DEV_PLAY_PAUSE: {
      sCtrl_process.send({ tag:'STATE', val: parsedData.val });
      break;
    }

    default: log.error('Unknown data');
  }
});

function RemoteService() {
  RemoteService.super_.call(this, {
    uuid: 'd270',
    characteristics: [
      cCenterChar,
      bCountChar
    ]
  });
}

RemoteService.prototype.initSubprocesses = function () {
  mCtrl_process = fork('./sub_processes/motor_ctrl.js');
  sCtrl_process = fork('./sub_processes/stepper_ctrl.js');
};

RemoteService.prototype.ballFeederUpdate = function (value) {
  bCountChar.onBallCountChange(value);
};

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
