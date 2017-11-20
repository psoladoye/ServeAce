'use strict';

const CONST = require('../common/constants');
const SPEEDS = CONST.MOTOR_SPEEDS;
const SERVE_TYPE = CONST.SERVE_TYPE;
const POWER = CONST.DEV_STATES;
const TimeUtils = require('../utils/time');

function Motor(options, board) {
  this.pwm1 = options.pwm1;
  this.dir1 = options.dir1;
  this.speed1 = 0;
  this.pwm2 = options.pwm2;
  this.dir2 = options.dir2;
  this.speed2 = 0;
  this.arduino = board;
  this.serveAce = null;
};

Motor.prototype.init = function () {
  console.log('[Motor]: Initializing motors...');
  // Motor 1
  this.arduino.pinMode(this.dir1, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm1, this.arduino.MODES.PWM);
  this.arduino.digitalWrite(this.dir1, this.arduino.HIGH); // change dir to low

  // Motor 2
  this.arduino.pinMode(this.dir2, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm2, this.arduino.MODES.PWM);
  this.arduino.digitalWrite(this.dir2, this.arduino.HIGH);
};

Motor.prototype.setServeAce (serveAce) {
  this.serveAce = serveAce;
};

Motor.prototype.power = function (state) {
  switch (state) {
    case POWER.ON: {
      this.arduino.digitalWrite(this.dir1, this.arduino.HIGH);
      this.arduino.digitalWrite(this.dir2, this.arduino.HIGH);
      changeSpeed.call(this,SPEEDS.FLAT_S,1);
      changeSpeed.call(this,SPEEDS.FLAT_S,2);

      break;
    }
    case POWER.OFF: {
      this.arduino.digitalWrite(this.dir1, this.arduino.LOW);
      this.arduino.digitalWrite(this.dir2, this.arduino.LOW);
      changeSpeed.call(this,0,1);
      changeSpeed.call(this,0,2);

      break;
    }
    default:console.log('Unknow device state');
  }
};

Motor.prototype.setServe = function (serve) {
  switch (serve) {
    case SERVE_TYPE.FLAT_S: {
      changeSpeed.call(this,SPEEDS.FLAT_S,1);
      changeSpeed.call(this,SPEEDS.FLAT_S,2);
      break;
    }
    case SERVE_TYPE.TOPSPIN_S: {
      changeSpeed.call(this,SPEEDS.TOPSPIN_S,1);
      changeSpeed.call(this,SPEEDS.TOPSPIN_S,2);
      break;
    }
    case SERVE_TYPE.H_TOPSPIN_S: {
      changeSpeed.call(this,SPEEDS.H_TOPSPIN_S,1);
      changeSpeed.call(this,SPEEDS.H_TOPSPIN_S,2);
      break;
    }
    default: console.log('unknown serve type');
  }
};

let changeSpeed = function (speed, m) {
  if(this["speed"+m] === speed) return;
  if(this["speed"+m] < speed) {
    console.log(`[Motor::speedUp]: Speeding up motor${m} to speed: ${speed}`);
    console.log('[Motor::speedUp]: current speed: ',this["speed"+m]);

    for (var i = this["speed"+m]; i <= speed; i++) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;
      TimeUtils.sleep(1000/60);
    }
  } else {
    console.log(`[Motor]: Slowing down motor${m} to speed: ${speed}`);
    console.log('[Motor::slowDown]: current speed: ',this["speed"+m]);

    for (var i = this["speed"+m]; i >= speed; i--) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;
      TimeUtils.sleep(1000/60);
    }
  }
};
module.exports = Motor;
