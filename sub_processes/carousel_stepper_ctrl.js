'use strict';
const log = require('../utils/logger')('CAROUSEL_STEPPER');
const Stepper = require('../models/BallFeeder');
const TimeUtils = require('../utils/time');
const ASSIGNED_PINS = require('../common/constants').ASSIGNED_PINS;

let ballFeeder = new Stepper({
  dirPin:ASSIGNED_PINS.S_MOTOR_DIR,
  stepPin: ASSIGNED_PINS.S_MOTOR_STEP
});

let currentProfile = {};

// Update main on BALL_COUNT
ballFeeder.on('button_pressed', () => {
  log.info('Button pressed listener');
	process.send({tag: 'BALL_COUNT'});
});


// Incoming messaage handler
process.on('message', function(msg) {
  log.info('Message from remote-service => ', msg);
  switch(msg.tag) {
    case 'POWER' : {
      if(msg.val) {
        ballFeeder.init();
      } else {
        log.info('Shutting down ball feeder');
        ballFeeder.shutDown();
      }
      break;
    }

    case 'STATE': {
      if(parseInt(msg.val)) {
        ballFeeder.start();
      } else {
        ballFeeder.stop();
      }
      break;
    }

    case 'PROFILE': {
      currentProfile = msg.val;
      ballFeeder.delay = parseInt(currentProfile.delay) * 1000;
      ballFeeder.ballCount = parseInt(currentProfile.ballCount);
      break;
    }

    default: log.error(': Unknown tag');
  }
});


// Cleanup process
process.on('SIGINT', () => {
  log.info('SIGINT Shutting down stepper');
  ballFeeder.shutDown();
  TimeUtils.sleep(1000);
  process.exit();
});
