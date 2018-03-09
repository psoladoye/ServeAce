'use strict';

const Gpio            = require('onoff').Gpio;
const log           	= require('../utils/logger')('H_STEPPER');
const Stepper       	= require('../models/HStepper');
const TimeUtils     	= require('../utils/time');
const INTL_TAGS       = require('../common/constants').INTL_TAGS;
const COMM_TAGS     	= require('../common/constants').COMM_TAGS;
const SERVE_LOCATION	= require('../common/constants').SERVE_LOC;

let currentProfile    = {};

let EN                = new Gpio(H_MOTOR_EN, 'out');
let DIR               = new Gpio(H_MOTOR_DIR, 'out');
let PULSE             = new Gpio(H_MOTOR_PULSE, 'out');

process.on('message', (msg) => {
	log.info('Incoming message to rotator: => ');
	log.info(msg);
  switch(parseInt(msg.tag)) {
    case INTL_TAGS.POWER: {
			log.info('power');

      if(msg.val) {
        log.info('Enable horiztontal rotator');
				EN.writeSync(1);
      } else {
        log.info('Stop horiz motor');
				EN.writeSync(0);
      }
      break;
    }

    case INTL_TAGS.PROFILE: {
			log.info('profile');

    	if(currentProfile.serveLocation === msg.val.serveLocation)
    		return;

    	currentProfile = msg.val;
      let position = 0;

      if(currentProfile.serveLocation === SERVE_LOCATION.LEFT) {
        position = -90;
      } else if(currentProfile.serveLocation === SERVE_LOCATION.CENTER) {
        position = 0;
      } else if(currentProfile.serveLocation === SERVE_LOCATION.RIGHT) {
        position = 90;
      }

    	// Move stepper into position
    	break;
    }

		case INTL_TAGS.SET_HORIZ_MOTOR_DIR: {
			log.info(msg);
			let dir = (parseInt(msg.val) < 0 ? 0 : 1 );
			log.info(dir);
			DIR.writeSync(dir); 
			log.info('PULSING.....')
			for(let i = 0; i < 500; i++) {
				PULSE.writeSync(1);
				TimeUtils.sleepMillis(0.1);
				PULSE.writeSync(0);
				TimeUtils.sleepMillis(0.1);
			}
			log.info('DONE PULSING');

      process.send({
        tag: INTL_TAGS.NOTIFY_HORIZ_ANGLE,
        val: { tag: COMM_TAGS.HORIZ_MOTOR_ANGLE_FEEDBACK, angle: (dir === 1) ? 3.8 : -3.8}
      });
			break;
		}

    default: log.error(': Unknown tag');
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down horiztontal rotator');
  
	if(PULSE) PULSE.unexport();
	if(EN) EN.unexport();
	if(DIR) DIR.unexport();

  TimeUtils.sleepMillis(200);
  process.exit();
});

