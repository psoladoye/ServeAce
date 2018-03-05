'use strict';

const util              = require('util');
const EventEmitter      = require('events');
const TimeUtil          = require('../utils/time');
const Gpio              = require('onoff').Gpio;
const log               = require('../utils/logger')('BALL_FEEDER');
//const AccelStepperClass = require('../helper_libs/AccelStepper');
//const StepperMotor			= require('../helper_libs/StepperLib');

function BallFeeder (options) {
  this.dirPin         = options.dirPin;
  this.stepPin        = options.stepPin;
  this.delay          = options.delay || 3000;
  this.ballCount      = options.ballCount || 0;
  this.intervalId     = null;
	this.testpin = new Gpio(24, 'out');
  //this.stepperMotor   = new StepperMotor({dirPin:options.dirPin, stepPin:options.stepPin});
}

/**
 * [init description]
 * @return {[type]} [description]
 */
BallFeeder.prototype.init = function () {
  log.info('Initializing ball feeder...');
	//this.stepperMotor.init();
};

BallFeeder.prototype.start = function () {
  log.info('start');
	this.testpin.writeSync(1);
	//this.stepperMotor.step(null, 90);
};

BallFeeder.prototype.shutDown = function () {
	//this.stepperMotor.shutdown();
	this.testpin.unexport();
};

BallFeeder.prototype.stop = function () {
	log.info('stop');
	this.testpin.writeSync(0);
  if(this.intervalId) clearInterval(this.intervalId);
};

util.inherits(BallFeeder, EventEmitter);
module.exports = BallFeeder;
