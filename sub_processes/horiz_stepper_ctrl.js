'use strict';

const log = require('../utils/logger')('H_STEPPER');
const Stepper = require('../models/HStepper');
const TimeUtils = require('../utils/time');

let currentProfile = {};
let horizStepper = new Stepper();

horizStepper.on('button_pressed', () => {
  log.info('Button pressed listener');
	process.send({tag: 'HORIZ'});
});

process.on('message', function(msg) {
  log.info('Message from remote-service => ', msg);
  switch(msg.tag) {
    case 'POWER' : {
      if(msg.val) {
        horizStepper.init();
      } else {
        log.info('Shutting down ball feeder');
        horizStepper.shutDown();
      }
      break;
    }

    case 'PROFILE': {
    	if(currentProfile.serveLocation === msg.val.serveLocation)
    		return;
    	currentProfile = msg.val;
    	horizStepper.move(currentProfile.serveLocation);
    	break;
    }

    default: log.error(': Unknown tag');
  }
});

process.on('SIGINT', () => {
  log.info('SIGINT Shutting down stepper');
  horizStepper.shutDown();
  TimeUtils.sleep(1000);
  process.exit();
});

