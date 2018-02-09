'use strict';
const log = require('../utils/logger')('STEPPER');
const Stepper = require('../models/BallFeeder');
const TimeUtils = require('../utils/time');

let ballFeeder = new Stepper();
let currentProfile = {};

ballFeeder.on('button_pressed', () => {
  log.info('Button pressed listener');
	process.send({tag: 'BALL_COUNT'});
});

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
      if(msg.val) {
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

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down stepper');
  ballFeeder.shutDown();
  TimeUtils.sleep(1000);
  process.exit();
});
