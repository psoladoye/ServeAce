'use strict';

const SerialPort = require('serialport');
const os = require('os');
const Board = require('firmata');
const Motor = require('../models/Motor');
const CONST = require('../common/constants');
const log = require('../utils/logger')('DC_MOTORS');
const TimeUtils = require('../utils/time');
const POWER = CONST.DEV_STATES;
const INTL_TAGS = CONST.INTL_TAGS;

let motor = null;
let board_port = (os.platform() === 'win32')? 'COM4':'/dev/ttyACM0';

let board = new Board(new SerialPort(board_port, {baudRate: 57600}),
  {reportVersionTimeout: 1000}, (err) => {
  if (err) {
    log.error('Error on board connection: ', err.message);
  } else {
    log.info('Arduino ready');
    motor = new Motor({
      pwm1: CONST.ASSIGNED_PINS.MOTOR_1_PWM,
      dir1: CONST.ASSIGNED_PINS.MOTOR_1_DIR,
      pwm2: CONST.ASSIGNED_PINS.MOTOR_2_PWM,
      dir2: CONST.ASSIGNED_PINS.MOTOR_2_DIR
    }, board);
    motor.init();
  }
});

board.on('error', (err) => {
  log.error('Error: ', err.message);
});

let currentProfile = {};

/*board.on('reportversion', () => {
  log.error(`Firmware version: ${board.version.major}.${board.version.minor}`);
});*/

process.on('message', (msg) => {
  log.info('Incoming message => ', msg);

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
      log.info(`Profile command ${msg.val}`)
      currentProfile = msg.val;
      motor.setServe(parseInt(currentProfile.serveType));
      break;
    }

    default: log.error('Unknown option.');

  }
});

function cleanUp() {
  log.info('Killing process by SIGINT');
  if(motor) motor.power(POWER.OFF);
}

process.on('SIGINT', () => {
  cleanUp();
  TimeUtils.sleep(1000);
  process.exit();
});
