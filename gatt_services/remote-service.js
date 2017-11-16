'use strict';

var util = require('util');
var bleno = require('bleno');
var PrimaryService = bleno.PrimaryService;
var fork = require('child_process').fork;

var BallCountCharacteristic = require('../gatt_characteristics/ball-count-characteristic');
var CommandCenterCharacteristic = require('../gatt_characteristics/command-center-characteristic');

var cCenterChar = new CommandCenterCharacteristic();
var bCountChar = new BallCountCharacteristic();

var mCtrl_process = null;
var sCtrl_process = null;
const COMM_TAGS = require('../common/constants').COMM_TAGS;
const DEV_STATES = require('../common/constants').DEV_STATES;

const ServeAce_dev = {
  power: DEV_STATES.OFF,
  isFeedingBall: false
};

cCenterChar.on('dataReceived', function(data) {
  console.log('data received: ',data);

  switch(parseInt(data)) {
    case 1: {
      if(mCtrl_process) mCtrl_process.send('Change to slice serve');
      break;
    }

    case 2: {
      if(sCtrl_process) sCtrl_process.send('set delay to 10 s');
      break;
    }

    default: console.log('Unknown data');
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

RemoteService.prototype.initSubprocesses = function() {
  mCtrl_process = fork('./sub_processes/motor_ctrl.js');
  sCtrl_process = fork('./sub_processes/stepper_ctrl.js');
};

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
