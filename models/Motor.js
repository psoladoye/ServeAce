const CONST = require('../common/constants');
const SPEEDS = CONST.MOTOR_SPEEDS;
const SERVE_TYPE = CONST.SERVE_TYPE;
const POWER = CONST.DEV_STATES;

function Motor(options, board) {
  this.pwm1 = options.pwm1;
  this.dir1 = options.dir1;
  this.speed1 = 0;
  this.pwm2 = options.pwm2;
  this.dir2 = options.dir2;
  this.speed2 = 0;
  this.arduino = board;
};

Motor.prototype.init = function () {
  console.log('[Motor]: Initializing motors...');
  // Motor 1
  this.arduino.pinMode(this.dir1, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm1, this.arduino.MODES.OUTPUT);
  this.arduino.digitalWrite(this.dir1, this.arduino.LOW);

  // Motor 2
  this.arduino.pinMode(this.dir2, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm2, this.arduino.MODES.OUTPUT);
  this.arduino.digitalWrite(this.dir1, this.arduino.HIGH);
};

Motor.prototype.power = function (state) {
  switch (state) {
    case POWER.ON: {
      speedUp.call(this,SPEEDS.FLAT_S,1);
      speedUp.call(this,SPEEDS.FLAT_S,2);
      break;
    }
    case POWER.OFF: {
      speedUp.call(this,0,1);
      speedUp.call(this,0,2);
      break;
    }
    default:console.log('Unknow device state');
  }
};

Motor.prototype.setServe = function (serve) {
  switch (serve) {
    case SERVE_TYPE.FLAT_S: {
      speedUp.call(this,SPEEDS.FLAT_S,1);
      speedUp.call(this,SPEEDS.FLAT_S,2);
      break;
    }
    case SERVE_TYPE.TOPSPIN_S: {
      speedUp.call(this,SPEEDS.TOPSPIN_S,1);
      speedUp.call(this,SPEEDS.TOPSPIN_S,2);
      break;
    }
    case SERVE_TYPE.H_TOPSPIN_S: {
      speedUp.call(this,SPEEDS.H_TOPSPIN_S,1);
      speedUp.call(this,SPEEDS.H_TOPSPIN_S,2);
      break;
    }
    default: console.log('unknown serve type');
  }
};

let speedUp = function(speed, m) {
  console.log(`[Motor::speedUp]: Speeding up motor${m} to speed: ${speed}`);
  console.log('[Motor::speedUp]: current speed: ',this["speed"+m]);
  for (var i = this["speed"+m]; i < speed; i++) {
    ((index) => {
      setTimeout(() => {
        console.log('[Motor::speedUp]: motor'+m,this["pwm"+m]);
        console.log(`[Motor::speedUp]: motor${m}: ${i}`);
        this.arduino.analogWrite(this["pwm"+m],i);
        this["speed"+m] = i;
      }, 300);
    })(i);
  }
};

let slowDown = function(speed, m) {
  console.log(`[Motor]: Slowing down motor${m} to speed: ${speed}`);
  for (var i = this["speed"+m]; i > speed; i--) {
    setTimeout(() => {
      this.arduino.analogWrite(this["pwm"+m],i);
    }, 100);
  }
};

module.exports = Motor;
