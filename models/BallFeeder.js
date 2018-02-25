'use strict';

const util = require('util');
const EventEmitter = require('events');
const TimeUtil = require('../utils/time');
const Gpio = require('onoff').Gpio;
const log = require('../utils/logger')('BALL_FEEDER');
const AccelStepperClass = require('../helper_libs/AccelStepper');


function BallFeeder (options) {
  this.dirPin = options.dirPin;
  this.stepPin = options.stepPin;
  this.delay = options.delay || 3000;
  this.ballCount = options.ballCount || 0;
  this.intervalId = null;
  this.accelStepper = new AccelStepperClass(this.dirPin, this.stepPin);
}

/**
 * [init description]
 * @return {[type]} [description]
 */
BallFeeder.prototype.init = function () {
  log.info('Initializing ball feeder...');

  this.accelStepper.setMotorSpeed(1);
  this.accelStepper.setMaxMotorSpeed(5);

};

BallFeeder.prototype.start = function () {
  this.accelStepper.run();
}

BallFeeder.prototype.shutDown = function () {
  this.accelStepper.stop();
	this.accelStepper.shutDown();
};

BallFeeder.prototype.stop = function () {
  if(this.intervalId) clearInterval(this.intervalId);
}

/*function rotateDeg(deg, speed) {
  // set direction
  let steps = deg*(1/0.255);
  let delay = (1/speed) * 70 * 1E-3;

  this.intervalId = setInterval(() => {

  }, 1000);

  /*for(var i=0; i < steps; i++) {
    // write to stepper
    //TimeUtil.sleep(delay);

    // write low to stepper
    // TimeUtil.sleep(delay);
  }
}*/

util.inherits(BallFeeder, EventEmitter);

module.exports = BallFeeder;
