'use strict';

const SerialPort = require('serialport');
const os = require('os');
const Board = require('firmata');
const Motor = require('../models/Motor');
const CONST = require('../common/constants');
const log = require('util').debuglog('MOTOR');

let motor = null;
let board_port = (os.platform() === 'win32')? 'COM4':'/dev/ttyACM0';
let board = new Board(new SerialPort(board_port, {baudRate: 57600}),
  {reportVersionTimeout: 3000}, (err) => {
  if (err) {
    log('[motor-control]: Error on board connection: ', err.message);
  } else {
    log('[motor-control]: Arduino ready');
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
  log('[motor-control]: Error: ', err.message);
});

board.on('reportversion', () => {
  log(`[motor-control]: Firmware version: ${board.version.major}.${board.version.minor}`);
});

process.on('message', (msg) => {
  log('[motor-control]: ', msg);
  switch(msg.tag) {
    case 'POWER': {
      log(`[motor-control]: Motor power state ${msg.val}`);
      if(motor) {
        motor.power(msg.val);
      } else {
        log('[motor-control]: Null motor ref');
      }
      break;
    }

    case 'SET_SERVEACE': {
      if(motor) motor.setServeAce(msg);
    }
    default: log('[motor-control]: Unknown option.');
  }
});

function cleanUp() {

}

process.on('SIGINT', () => {
  log('Killing process by SIGINT');
  cleanUp();
  process.exit();
});
