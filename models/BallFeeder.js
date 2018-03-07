'use strict';

const util              = require('util');
const EventEmitter      = require('events');
const TimeUtil          = require('../utils/time');
const Gpio              = require('onoff').Gpio;
const log               = require('../utils/logger')('BALL_FEEDER');
const StepperMotor			= require('../helper_libs/StepperLib');

function BallFeeder (options) {
  this.dirPin         = options.dirPin;
  this.stepPin        = options.stepPin;
  this.delay          = options.delay || 3000;
  this.ballCount      = options.ballCount || 0;
  this.stepperMotor   = new StepperMotor({dirPin:options.dirPin, stepPin:options.stepPin});
  this.shouldRun      = false;
}

/**
 * [init description]
 * @return {[type]} [description]
 */
BallFeeder.prototype.init = function () {
  log.info('Initializing ball feeder...');
};

BallFeeder.prototype.run = function () {
  log.info('run carousel');
  this.shouldRun = true;
	while(shouldRun) {
    this.stepperMotor.step(null, 90);
    TimeUtil.sleepMillis(this.delay);
    this.ballCount -= 1;

    if(this.ballCount <= 0) {
      shouldRun = false;
    } else {
      this.emit('ballCountUpdate', this.ballCount);
    }
  }
};

BallFeeder.prototype.shutDown = function () {
	this.stepperMotor.shutdown();
};

BallFeeder.prototype.stop = function () {
	log.info('stop');
  this.shouldRun = false;
};

util.inherits(BallFeeder, EventEmitter);
module.exports = BallFeeder;
