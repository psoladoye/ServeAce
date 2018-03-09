'use strict';
const log               = require('../utils/logger')('CAROUSEL_STEPPER');
const Stepper           = require('../models/BallFeeder');
const TimeUtils         = require('../utils/time');
const ASSIGNED_PINS     = require('../common/constants').ASSIGNED_PINS;
const INTL_TAGS         = require('../common/constants').INTL_TAGS;
const Gpio 							= require('onoff').Gpio;

let currentProfile = {};

let DIR 								= new Gpio(5, 'out');
let STEP								= new Gpio(6, 'out');
/*let ballFeeder = new Stepper({
  dirPin:ASSIGNED_PINS.S_MOTOR_DIR,
  stepPin: ASSIGNED_PINS.S_MOTOR_STEP
});


// Update main on BALL_COUNT
ballFeeder.on('ballCountUpdate', (value) => {
  log.info('Button pressed listener');
	process.send({ tag: 'BALL_COUNT', val: {tag: 5, numOfBalls: value} });
});*/


// Incoming messaage handler
process.on('message', function(msg) {
  switch(msg.tag) {
    case INTL_TAGS.POWER : {
			log.info('power');
      if(msg.val) {
				DIR.writeSync(1);
        //ballFeeder.init();
      } else {
        log.info('stop ball feeder');
        //ballFeeder.stop();
      }
      break;
    }

    case INTL_TAGS.STATE: {
			log.info('state');
      if(msg.val) {
				log.info('start pulsing.....');
				for(var i = 0; i < 400; i++) {
					STEP.writeSync(1);
					TimeUtils.sleepMillis(1);
					STEP.writeSync(0);
					TimeUtils.sleepMillis(1);
				}
				log.info('Stop pulsing...');
        //ballFeeder.run();
      } else {
        //ballFeeder.stop();
      }
      break;
    }

    case INTL_TAGS.PROFILE: {
			log.info('profile');
      currentProfile = msg.val;
      //ballFeeder.delay = parseInt(currentProfile.delay) * 1000;
      //ballFeeder.ballCount = parseInt(currentProfile.ballCount);
      break;
    }

    default: log.error(': Unknown tag');
  }
});


// Cleanup process
process.on('SIGINT', () => {
  log.info('SIGINT Shutting down carousel');
  //ballFeeder.shutDown();
	if(DIR) DIR.unexport();
	if(STEP) STEP.unexport();
  TimeUtils.sleepMillis(200);
  process.exit();
});
