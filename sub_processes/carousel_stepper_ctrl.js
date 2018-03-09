'use strict';

const log               = require('../utils/logger')('CAROUSEL_STEPPER');
const Stepper           = require('../models/BallFeeder');
const TimeUtils         = require('../utils/time');
const ASSIGNED_PINS     = require('../common/constants').ASSIGNED_PINS;
const INTL_TAGS         = require('../common/constants').INTL_TAGS;
const COMM_TAGS         = require('../common/constants').COMM_TAGS;
const Gpio 							= require('onoff').Gpio;

let currentProfile      = {};

let DIR 								= new Gpio(ASSIGNED_PINS.C_MOTOR_DIR, 'out');
let STEP								= new Gpio(ASSIGNED_PINS.C_MOTOR_STEP, 'out');

let intervalID          = null;


// Incoming messaage handler
process.on('message', function(msg) {
  switch(msg.tag) {
    case INTL_TAGS.POWER : {
			log.info('power');
      if(msg.val) {
        log.info('Setting BallFeeder direction...')
				DIR.writeSync(1);

      } else {
        log.info('stop ball feeder');
        if(intervalID) clearInterval(intervalID);
      }
      break;
    }

    case INTL_TAGS.STATE: {
			log.info('state');
      if(msg.val) {

        intervalID = setInterval(() => {
          log.info('start pulsing.....');
          for(let i = 0; i < 400; i++) {
            STEP.writeSync(1);
            TimeUtils.sleepMillis(1);
            STEP.writeSync(0);
            TimeUtils.sleepMillis(1);
          }
          log.info('Stop pulsing...');
          currentProfile.ballCount -= 1; 

          process.send({
            tag: INTL_TAGS.NOTIFY_BALL_COUNT, 
            val: {
              tag: COMM_TAGS.BALL_COUNT,
              numOfBalls: currentProfile.ballCount
            } 
          });

        }, parseInt(currentProfile.delay) * 1000);
      } else {
        clearInterval(intervalID);
        intervalID = null;
      }
      break;
    }

    case INTL_TAGS.PROFILE: {
			log.info('profile', currentProfile);
      currentProfile = msg.val;
      break;
    }

    default: log.error(': Unknown tag');
  }
});

// Cleanup process
process.on('SIGINT', () => {
  log.info('SIGINT Shutting down carousel');
  if(intervalID) clearInterval(intervalID);
	if(DIR) DIR.unexport();
	if(STEP) STEP.unexport();
  TimeUtils.sleepMillis(200);
  process.exit();
});
