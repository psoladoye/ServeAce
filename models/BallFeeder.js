'use strict';

const util = require('util');
const EventEmitter = require('events');
const TimeUtil = require('../utils/time');
const Gpio = require('onoff').Gpio;
const log = util.debuglog('BALL_FEEDER');

function BallFeeder () {
  this.pin = 25;
  this.delay = 2000;
  this.intervalId = null;
}

BallFeeder.prototype.init = function () {
  log('[ball-feeder]: Initializing ball feeder...');
  this.led = new Gpio(this.pin, 'out');
  this.button = new Gpio(4, 'in', 'falling');

  this.button.watch((err, val) => {
    if (err) { throw err; }
    log(`Button val: ${val}`);
    this.led.writeSync(val ^ 1);
    this.emit('button_pressed');
  });
};

BallFeeder.prototype.start = function () {
  rotateDeg.call(this);
}

BallFeeder.prototype.shutDown = function () {
  this.stop();
  if(this.led) this.led.unexport();
  if(this.button) this.button.unexport();
};

BallFeeder.prototype.stop = function () {
  if(this.intervalId) clearInterval(this.intervalId);
}

function rotateDeg(deg, speed) {
  // set direction
  let steps = deg*(1/0.255);
  let delay = (1/speed) * 70 * 1E-3;
  var led_val = false;

  this.intervalId = setInterval(() => {
    led_val = !led_val;
    this.led.writeSync(led_val);
  }, 1000);

  /*for(var i=0; i < steps; i++) {
    // write to stepper
    //TimeUtil.sleep(delay);

    // write low to stepper
    // TimeUtil.sleep(delay);
  }*/
}

util.inherits(BallFeeder, EventEmitter);

module.exports = BallFeeder;
