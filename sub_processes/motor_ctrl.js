'use strict';

const SerialPort = require('serialport');
const os = require('os');
const Board = require('firmata');
const Motor = require('../models/Motor');
const CONST = require('../common/constants');
const log = require('../utils/logger')('MOTOR');
const TimeUtils = require('../utils/time');
const POWER = CONST.DEV_STATES;

let motor = null;
let board_port = (os.platform() === 'win32')? 'COM4':'/dev/ttyACM0';
let board = new Board(new SerialPort(board_port, {baudRate: 57600}),
  {reportVersionTimeout: 1000}, (err) => {
  if (err) {
    log.error('Error on board connection: ', err.message);
  } else {
    log.info('[motor-control]: Arduino ready');
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

/*board.on('reportversion', () => {
  log.error(`Firmware version: ${board.version.major}.${board.version.minor}`);
});*/

process.on('message', (msg) => {
  log.info('Incoming message => ', msg);

  switch(msg.tag) {

    case 'POWER': {
      log.info(`Motor power state ${msg.val}`);
      if(motor) {
        motor.power(msg.val);
      } else {
        log.error('Null motor ref');
      }
      break;
    }

    case 'SET_SERVEACE': {
      if(motor) motor.setServeAce(msg);
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
