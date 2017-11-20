'use strict';

const Stepper = require('../models/BallFeeder');

let ballFeeder = new Stepper();

process.on('message', function(msg) {
  console.log('[stepper-control]: message from remote-service => ', msg);
  switch(msg.tag) {
    case 'POWER' : {
      ballFeeder.init();
      break;
    }

    default: console.log('[stepper-control]: Unknown tag');
  }
	
});

process.on('SIGINT', () => {
  console.log('[stepper-control]: Shutting down stepper');
  ballFeeder.shutDown();
});
