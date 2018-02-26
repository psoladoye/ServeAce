'use strict';

const log           = require('../utils/logger')('H_STEPPER');
const Stepper       = require('../models/HStepper');
const TimeUtils     = require('../utils/time');
const INTL_TAGS     = require('../common/constants').INTL_TAGS;

let currentProfile  = {};
let horizStepper    = new Stepper();

process.on('message', function(msg) {
  switch(msg.tag) {
    case INTL_TAGS.POWER: {
			log.info('power');

      if(msg.val) {
        horizStepper.init();
      } else {
        log.info('Shutting down ball feeder');
        horizStepper.shutDown();
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

    	horizStepper.move(position);
    	break;
    }

    default: log.error(': Unknown tag');
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down stepper');
  horizStepper.shutDown();
  TimeUtils.sleepMillis(1000);
  process.exit();
});

