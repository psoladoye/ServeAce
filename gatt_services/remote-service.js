'use strict';

const util                        = require('util');
const bleno                       = require('bleno');
const PrimaryService              = bleno.PrimaryService;
const fork                        = require('child_process').fork;
const log                         = require('../utils/logger')('REMOTE_SERVICE');

const COMM_TAGS                   = require('../common/constants').COMM_TAGS;
const INTL_TAGS                   = require('../common/constants').INTL_TAGS;
const DEV_STATES                  = require('../common/constants').DEV_STATES;
const BallCountCharacteristic     = require('../gatt_characteristics/ball-count-characteristic');
const CommandCenterCharacteristic = require('../gatt_characteristics/command-center-characteristic');
const MotorFeedbackCharacteristic = require('../gatt_characteristics/motor-feedback-characteristic');

let cCenterChar                   = new CommandCenterCharacteristic();
let bCountChar                    = new BallCountCharacteristic();
let mFeedbackChar                 = new MotorFeedbackCharacteristic();

let dc_motor_control_process                 = null;
let carousel_control_process                 = null;
let horizontal_control_process               = null;

/**
 * {Gatt_Characteristic}
 * Handles incoming BLE commands
 * @param  {Buffer} data
 */
cCenterChar.on('dataReceived', function(data) {
  let parsedData = JSON.parse(data);
  log.info('Parsed Data: ', parsedData);

  switch(parseInt(parsedData.tag)) {
    case COMM_TAGS.POWER: { // Initializes all motors
      dc_motor_control_process.send({ tag:INTL_TAGS.POWER, val: parsedData.val });
      carousel_control_process.send({ tag:INTL_TAGS.POWER, val: parsedData.val });
      horizontal_control_process.send({ tag:INTL_TAGS.POWER, val: parsedData.val });
      break;
    }

    case COMM_TAGS.PLAY_PAUSE: {
      carousel_control_process.send({ tag:INTL_TAGS.STATE, val: parsedData.val });
      break;
    }

    case COMM_TAGS.SYNC_SERVE_PROFILE: {
      dc_motor_control_process.send({ tag:INTL_TAGS.PROFILE, val: parsedData.val });
      carousel_control_process.send({ tag:INTL_TAGS.PROFILE, val: parsedData.val });
      horizontal_control_process.send({ tag:INTL_TAGS.PROFILE, val: parsedData.val });
      break;
    }

    case COMM_TAGS.CHANGE_MOTOR_SPEED: {
      dc_motor_control_process.send({ tag:INTL_TAGS.SET_MOTOR_SPEED, params: parsedData.val });
      break;
    }

    case COMM_TAGS.ROTATE_HORIZ_MOTOR: {
			log.info('Horizontal rotation: ', INTL_TAGS.SET_HORIZ_MOTOR_DIR);
      horizontal_control_process.send({ tag:INTL_TAGS.SET_HORIZ_MOTOR_DIR, val: parsedData.val });
      break;
    }

		case COMM_TAGS.PLAYER_LEVEL: {
			log.info('player level update');
			dc_motor_control_process.send({ tag: INTL_TAGS.SET_PLAYER_LEVEL, playerLevel: parsedData.playerLevel})
			break;
		}

		case COMM_TAGS.SERVE_LOCATION: {
			log.info('Serve location update');
			horizontal_control_process.send({ tag: INTL_TAGS.SET_SERVE_LOCATION, serveLocation: parsedData.serveLocation });
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
      bCountChar,
      mFeedbackChar
    ]
  });
}

RemoteService.prototype.initSubprocesses = function () {

  /**
   * {Subprocess} Handles firing-motor commands
   */
  dc_motor_control_process = fork('./sub_processes/dc_motors_ctrl.js');

	dc_motor_control_process.on('message', (msg) => {
		log.info(msg);
    switch(parseInt(msg.tag)) {
      case INTL_TAGS.NOTIFY_MOTOR_SPEED_CHANGE: {
        mFeedbackChar.onMotorFeedbackChange(JSON.stringify(msg.val));
        break;
      }

			case INTL_TAGS.NOTIFY_DC_MOTORS_INIT: {
				mFeedbackChar.onMotorFeedbackChange(JSON.stringify(msg.val));
				break;
			}

      default: log.info('Unknown tag');
    }
	});

	dc_motor_control_process.on('error', (err) => {
		log.error(err);
	});


  /**
   * {Subprocess} Handles carousel stepper-motor commands
   */
  carousel_control_process = fork('./sub_processes/carousel_stepper_ctrl.js');
	carousel_control_process.on('message', (msg) => {
		switch(msg.tag) {
			case INTL_TAGS.NOTIFY_BALL_COUNT: {
				bCountChar.onBallCountChange(JSON.stringify(msg.val));
				break;
			}

			default: log.info('Uknown tag');
		}
	});
	carousel_control_process.on('error', (err) => {
		log.error(err);
	});

  /**
   * {Subprocess} Handles horizontal-rotator commands
   */
  horizontal_control_process = fork('./sub_processes/horiz_stepper_ctrl.js');
  horizontal_control_process.on('message', msg => {
    log.info(msg);
    switch(parseInt(msg.tag)) {
      case INTL_TAGS.NOTIFY_HORIZ_ANGLE: {
        mFeedbackChar.onMotorFeedbackChange(JSON.stringify(msg.val));
        break;
      }

      default: log.info('Unknown tag');
    }
  });

	horizontal_control_process.on('error', (err) => {
		log.error(err);
	});
};

/**
 * [deInit description]
 * @return {[type]} [description]
 */
RemoteService.prototype.deInit = function () {
  mFeedbackChar.onMotorFeedbackChange(JSON.stringify({
    tag: COMM_TAGS.DC_MOTORS_INITIALIZER,
    motorState: 0
  }));
};

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
