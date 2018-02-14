'use strict';

const util = require('util');
const bleno = require('bleno');
const PrimaryService = bleno.PrimaryService;
const fork = require('child_process').fork;
const log = require('../utils/logger')('REMOTE_SERVICE');

const COMM_TAGS = require('../common/constants').COMM_TAGS;
const DEV_STATES = require('../common/constants').DEV_STATES;
const BallCountCharacteristic = require('../gatt_characteristics/ball-count-characteristic');
const CommandCenterCharacteristic = require('../gatt_characteristics/command-center-characteristic');

let cCenterChar = new CommandCenterCharacteristic();
let bCountChar = new BallCountCharacteristic();
let mCtrl_process = null;
let sCtrl_process = null;
let hCtrl_process = null;

cCenterChar.on('dataReceived', function(data) {
  let parsedData = JSON.parse(data);
  log.info('Parsed Data: ',parsedData);

  switch(parseInt(parsedData.tag)) {
    case COMM_TAGS.DEV_POWER: { // Initializes all motors
      mCtrl_process.send({ tag:'POWER', val: parsedData.val });
      //sCtrl_process.send({ tag:'POWER', val: parsedData.val });
      //hCtrl_process.send({ tag:'POWER', val: parsedData.val });
      break;
    }

    case COMM_TAGS.DEV_PLAY_PAUSE: {
      //sCtrl_process.send({ tag:'STATE', val: parsedData.val });
      break;
    }

    case COMM_TAGS.SYNC_SERVE_PROFILE: {
      mCtrl_process.send({ tag:'PROFILE', val: parsedData.val });
      //sCtrl_process.send({ tag:'PROFILE', val: parsedData.val });
      //hCtrl_process.send({ tag:'PROFILE', val: parsedData.val });
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
  mCtrl_process = fork('./sub_processes/dc_motors_ctrl.js');
	mCtrl_process.on('message', msg => {
		log.info(msg);
	});

  /*sCtrl_process = fork('./sub_processes/carousel_stepper_ctrl.js');
	sCtrl_process.on('message', msg => {
		switch(msg.tag) {
			case 'BALL_COUNT': {
				bCountChar.onBallCountChange(JSON.stringify(msg.val));
				break;
			}

			default: log.info('Uknown tag');
		}
	});

  hCtrl_process = fork('./sub_processes/horiz_stepper_ctrl.js');
  hCtrl_process.on('message', msg => {
    log.info(msg);
  });*/
};

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
