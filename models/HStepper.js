'use strict';

const util = require('util');
const EventEmitter = require('events');
const TimeUtil = require('../utils/time');
const Gpio = require('onoff').Gpio;
const log = require('../utils/logger')('HORIZ_STEPPER');

function HStepper () {
  this.pin = 25;
  this.delay = 2000;
  this.intervalId = null;
}

HStepper.prototype.init = function () {
  log.info('Initializing horizontal stepper...');
 
};

HStepper.prototype.move = function () {
  rotateDeg.call(this);
};

HStepper.prototype.stop = function () {
  if(this.intervalId) clearInterval(this.intervalId);
};

HStepper.prototype.shutDown = function () {
  this.stop();
};

function rotateDeg(deg, speed) {
  // set direction
  let steps = deg*(1/0.255);
  let delay = (1/speed) * 70 * 1E-3;
 
  this.intervalId = setInterval(() => {

  }, 1000);
}

util.inherits(HStepper, EventEmitter);

module.exports = HStepper;
