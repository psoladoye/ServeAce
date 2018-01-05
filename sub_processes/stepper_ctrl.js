'use strict';
const log = require('../utils/logger')('STEPPER');
const Stepper = require('../models/BallFeeder');
const TimeUtils = require('../utils/time');

let ballFeeder = new Stepper();

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

    default: log.error(': Unknown tag');
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down stepper');
  ballFeeder.shutDown();
  TimeUtils.sleep(1000);
  process.exit();
});
