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
  this.led = new Gpio(this.pin, 'out');
  this.button = new Gpio(4, 'in', 'falling');

  this.button.watch((err, val) => {
    if (err) { throw err; }
    log.info(`Button val: ${val}`);
    this.led.writeSync(val ^ 1);
    this.emit('button_pressed');
  });
};

HStepper.prototype.move = function () {
  rotateDeg.call(this);
};

HStepper.prototype.stop = function () {
  if(this.intervalId) clearInterval(this.intervalId);
};

HStepper.prototype.shutDown = function () {
  this.stop();
  if(this.led) this.led.unexport();
  if(this.button) this.button.unexport();
};

function rotateDeg(deg, speed) {
  // set direction
  let steps = deg*(1/0.255);
  let delay = (1/speed) * 70 * 1E-3;
  var led_val = false;

  this.intervalId = setInterval(() => {
    led_val = !led_val;
    this.led.writeSync(led_val);
  }, 1000);
}

util.inherits(HStepper, EventEmitter);

module.exports = HStepper;
