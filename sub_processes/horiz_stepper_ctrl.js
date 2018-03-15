'use strict';

const Gpio            = require('onoff').Gpio;
const log           	= require('../utils/logger')('H_STEPPER');
const Stepper       	= require('../models/HStepper');
const TimeUtils     	= require('../utils/time');
const INTL_TAGS       = require('../common/constants').INTL_TAGS;
const COMM_TAGS     	= require('../common/constants').COMM_TAGS;
const SERVE_LOCATION	= require('../common/constants').SERVE_LOC;
const ASSIGNED_PINS   = require('../common/constants').ASSIGNED_PINS;

let currentProfile    = { serveLocation: 0 };

let EN                = new Gpio(ASSIGNED_PINS.H_MOTOR_EN, 'out');
let DIR               = new Gpio(ASSIGNED_PINS.H_MOTOR_DIR, 'out');
let PULSE             = new Gpio(ASSIGNED_PINS.H_MOTOR_STEP, 'out');

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
			log.info('profile', currentProfile);

    	if(currentProfile.serveLocation === msg.val.serveLocation)
    		return;

			if(EN.readSync()) {
				let dir = currentProfile.serveLocation - msg.val.serveLocation;
				let loop = Math.abs(dir);

				for(let i  = 0; i < loop; i++) {
					moveStepper(dir,msg.val.serveLocation);
				}
				currentProfile = msg.val;
			}

    	break;
    }

		case INTL_TAGS.SET_HORIZ_MOTOR_DIR: {
			log.info(msg);
			moveStepper(msg.val.dir, msg.val.serveLocation);
			currentProfile.serveLocation = msg.val.serveLocation;
			break;
		}

		case INTL_TAGS.SET_SERVE_LOCATION: {
			log.info('Set serve locaiton');
			if(currentProfile.serveLocation === msg.serveLocation)
    		return;

			if(EN.readSync()) {
				let dir = currentProfile.serveLocation - msg.serveLocation;
				let loop = Math.abs(dir);

				for(let i  = 0; i < loop; i++) {
					moveStepper(dir,msg.serveLocation);
				}
				currentProfile.serveLocation = msg.serveLocation;
			}
			break;
		}

    default: log.error(': Unknown tag');
  }
});

function moveStepper(dir, serveLocation) {
	let dirCalc = (dir < 0 ? 0 : 1 );
	log.info(dir);
	DIR.writeSync(dir);
	log.info('PULSING.....')
	for(let i = 0; i < 300; i++) {
		PULSE.writeSync(1);
		TimeUtils.sleepMillis(2);
		PULSE.writeSync(0);
		TimeUtils.sleepMillis(2);
	}
	log.info('DONE PULSING');

	let angle = 0;

	if(serveLocation === -1) {
		angle = -3.8;
	} else if(serveLocation === 0) {
		angle = 0;
	} else if(serveLocation === 1) {
		angle = 3.8;
	}

  process.send({
  	tag: INTL_TAGS.NOTIFY_HORIZ_ANGLE,
    val: { tag: COMM_TAGS.HORIZ_MOTOR_ANGLE_FEEDBACK, angle: angle}
  });
}

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down horiztontal rotator');

	if(PULSE) PULSE.unexport();
	if(EN) EN.unexport();
	if(DIR) DIR.unexport();

  TimeUtils.sleepMillis(1500);
  process.exit();
});

