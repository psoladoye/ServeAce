'use strict';

const SerialPort            = require('serialport');
const Board                 = require('firmata');
const Motor                 = require('../models/Motor');
const CONST                 = require('../common/constants');
const log                   = require('../utils/logger')('DC_MOTORS');
const TimeUtils             = require('../utils/time');
const Gpio                  = require('onoff').Gpio;
const POWER                 = CONST.DEV_STATES;
const INTL_TAGS             = CONST.INTL_TAGS;
const COMM_TAGS 						=	CONST.COMM_TAGS;
const ASSIGNED_PINS         = CONST.ASSIGNED_PINS;

let currentProfile          = {};
let motor                   = null;
let board_port              = '/dev/ttyACM0';
let devStateLed             = new Gpio(ASSIGNED_PINS.DEV_STATE_LED, 'out');

let board                   = new Board(new SerialPort(board_port, {baudRate: 57600}),
  {reportVersionTimeout: 1000}, (err) => {
  if (err) {
    log.error('Error on board connection: ', err.message);
  } else {
    log.info('Arduino ready');
    motor = new Motor({
      pwm1: ASSIGNED_PINS.MOTOR_1_PWM,
      dir1: ASSIGNED_PINS.MOTOR_1_DIR,
      pwm2: ASSIGNED_PINS.MOTOR_2_PWM,
      dir2: ASSIGNED_PINS.MOTOR_2_DIR
    }, board);
    motor.init();
		devStateLed.writeSync(1);
  }
});

board.on('error', (err) => {
  log.error('Error: ', err.message);
});

/*board.on('reportversion', () => {
  log.error(`Firmware version: ${board.version.major}.${board.version.minor}`);
});*/

process.on('message', (msg) => {

  switch(msg.tag) {

    case INTL_TAGS.POWER: {
      log.info(`Motor power state ${msg.val}`);
      if(motor) {
        motor.power(msg.val);
      } else {
        log.error('Null motor ref');
      }
      break;
    }

    case INTL_TAGS.PROFILE: {
      log.info('Profile command', msg.val);
			if(!motor) return;

      currentProfile = msg.val;
      motor.setServe(parseInt(currentProfile.serveType) * parseInt(currentProfile.playerLevel));
      break;
    }

    case INTL_TAGS.SET_MOTOR_SPEED: {
      log.info(`Set motor speed command ${msg.params}`);

			if(!motor) return;

			let params = msg.params;
			let speed = motor["speed"+params.motorNum];
			log.info(`Speed: ${speed}`);

      if(params.direction > 0) {
        speed += 5.1; // 2%
      } else if(params.direction < 0) {
        speed -= 5.1; // -2%
      }

			if(speed > 250 || speed <= 0 ) {
        log.info('Speed is at max or min');
        return;
      }

      motor.setSpeed(speed, params.motorNum);
      break;
    }

		case INTL_TAGS.SET_PLAYER_LEVEL: {
			log.info('Setting player level...');
			if(currentProfile && currentProfile.playerLevel === msg.playerLevel) return;

			currentProfile.playerLevel = msg.playerLevel;
			motor.setServe(currentProfile.serveType * currentProfile.playerLevel);
			break;
		}

    default: log.error('Unknown option.');
  }
});

function cleanUp() {
  log.info('Killing process by SIGINT');

	if(devStateLed) {
		devStateLed.writeSync(0);
		devStateLed.unexport();
	}

  if(motor) {
    motor.power(POWER.OFF);
		TimeUtils.sleepMillis(50);
    motor.deInit();
		TimeUtils.sleepMillis(50);
  }

	if(board && board.transport.isOpen) {
		TimeUtils.sleepMillis(300);
    board.transport.flush((err) => {
      log.error(err);
    });

    TimeUtils.sleepMillis(50);
    board.transport.close((err) => {
      log.error(err);
    });
	}
}

process.on('SIGINT', () => {
  cleanUp();
  TimeUtils.sleepMillis(1500);
  process.exit();
});
