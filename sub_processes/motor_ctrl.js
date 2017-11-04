const SerialPort = require('serialport');
const Board = require('firmata');
const Motor = require('../models/Motor');
const CONST = require('../common/constants');

let motor = null;
let board_port = '/dev/ttyACM0';
let board = new Board(new SerialPort(board_port, {baudRate: 57600}),
  {reportVersionTimeout: 1500}, (err) => {
  if (err) {
    console.log('[motor-control]: Error on board connection: ', err.message);
  } else {
    console.log('[motor-control]: Arduino ready');
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
  console.log('[motor-control]: Error: ', err.message);
});


process.on('message', (msg) => {
  console.log('[motor-control]: ', msg);
  switch(msg.tag) {
    case 'POWER': {
      console.log(`[motor-control]: Motor power state ${msg.val}`);
      motor.power(msg.val);
      break;
    }
    default: console.log('[motor-control]: Unknown option.');
  }
});
