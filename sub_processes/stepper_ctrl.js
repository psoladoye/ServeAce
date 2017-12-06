'use strict';
const log = require('util').debuglog('STEPPER');
const Stepper = require('../models/BallFeeder');

let ballFeeder = new Stepper();

ballFeeder.on('button_pressed', () => {
  log('Button pressed registered');
  //process.send({ tag:'BALL_FEEDER', val: 22});
  process.send('Hello Parenet');
});

process.on('message', function(msg) {
  log('[stepper-control]: message from remote-service => ', msg);
  switch(msg.tag) {
    case 'POWER' : {
      if(msg.val) {
        ballFeeder.init();
        process.send('Sending on power');
      } else {
        log('[stepper-control]: Shutting down ball feeder');
        ballFeeder.shutDown();
      }
      break;
    }

    default: log('[stepper-control]: Unknown tag');
  }
});

process.on('SIGINT', () => {
  log('[stepper-control]: Shutting down stepper');
  ballFeeder.shutDown();
  process.exit();
});
