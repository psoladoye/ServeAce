'use strict';

const CONST             = require('../common/constants');
const SPEEDS            = CONST.MOTOR_SPEEDS;
const SERVE_TYPE        = CONST.SERVE_TYPE;
const POWER             = CONST.DEV_STATES;
const INTL_TAGS         = CONST.INTL_TAGS;
const COMM_TAGS         = CONST.COMM_TAGS;
const TimeUtils         = require('../utils/time');
const log               = require('../utils/logger')('MOTOR_MODEL');

function Motor(options, board) {
  this.pwm1             = options.pwm1;
  this.dir1             = options.dir1;
  this.speed1           = 0;
  this.pwm2             = options.pwm2;
  this.dir2             = options.dir2;
  this.speed2           = 0;
  this.arduino          = board;
  this.motorsRunning    = false;
  this.currentServeType = SERVE_TYPE.FLAT_S;
};

Motor.prototype.init = function () {
  log.info('Initializing motors...');
  // Motor 1
  this.arduino.pinMode(this.dir1, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm1, this.arduino.MODES.PWM);

  // Motor 2
  this.arduino.pinMode(this.dir2, this.arduino.MODES.OUTPUT);
  this.arduino.pinMode(this.pwm2, this.arduino.MODES.PWM);

	this.arduino.digitalWrite(this.dir1, this.arduino.HIGH);
	this.arduino.digitalWrite(this.dir2, this.arduino.HIGH);

	TimeUtils.sleepMillis(50);
	process.send({
    tag: INTL_TAGS.NOTIFY_DC_MOTORS_INIT,
		val: { tag: COMM_TAGS.DC_MOTORS_INITIALIZER, motorState: 1 } 
  });
};

Motor.prototype.power = function (state) {
  switch (state) {
    case POWER.ON: {
			log.info('Powering On...');
      this.motorsRunning = true;
      this.setServe(this.currentServeType);

      break;
    }
    case POWER.OFF: {
			log.info('Powering off...');
      changeMotorSpeed2.call(this,0,0);
      this.motorsRunning = false;

      break;
    }
    default:log('Unknow device state');
  }
};

Motor.prototype.deInit = function() {
  this.arduino.digitalWrite(this.dir1, this.arduino.LOW);
  this.arduino.digitalWrite(this.dir2, this.arduino.LOW);
}

Motor.prototype.setServe = function (serve) {
  this.currentServeType = serve;

  if(!this.motorsRunning) return;

  switch (this.currentServeType) {
    case SERVE_TYPE.FLAT_B: {
			log.info('Serve type: Beginner flat serve');
      changeMotorSpeed2.call(this, 179, 179);
      break;
    }

		case SERVE_TYPE.FLAT_I: {
			log.info('Serve type: Intermediate flat serve');
			changeMotorSpeed2.call(this, 204, 204);
			break;
		}

		case SERVE_TYPE.FLAT_A: {
			log.info('Serve type: Advanced flat serve');
			changeMotorSpeed2.call(this, 222, 222);
			break;
		}

    case SERVE_TYPE.TOPSPIN_B: {
			log.info('Serve type: Beginner topsin');
      changeMotorSpeed2.call(this, 166, 191);
      break;
    }

		case SERVE_TYPE.TOPSPIN_I: {
			log.info('Serve type: Intermediate topspin');
			changeMotorSpeed2.call(this, 204, 230);
			break;
		}

		case SERVE_TYPE.TOPSPIN_A: {
			log.info('Serve type: Advanced topspin');
			changeMotorSpeed2.call(this, 186, 222);
			break;
		}

    default: log.error('unknown serve type', this.currentserveType);
  }
};

Motor.prototype.setSpeed = function(speed, motorNum) {
  log.info(`Set speed : ${speed} motor: ${motorNum}`);
	changeSpeed.call(this, speed, motorNum);
};

/**
 * [changeMotorSpeed2 description]
 * @param  {[type]} speed1 [description]
 * @param  {[type]} speed2 [description]
 * @return {[type]}        [description]
 */
let changeMotorSpeed2 = function( speed1, speed2 ) {
  let maxSteps = Math.round(Math.max( Math.abs(speed1 - this.speed1), Math.abs(speed2 - this.speed2) ));
  let step = 0.1;

	log.info('max steps: ',maxSteps);
	log.info(`Speed1: ${this.speed1} Target speed1: ${speed1} Speed2: ${this.speed2} Target speed2: ${speed2}`);

  if(this.speed1 === speed1 && this.speed2 === speed2) return;

  for(let i = 0; i < maxSteps; i = i + step) {
    if(this.speed1 !== speed1) {

      if(this.speed1 < speed1) {
        this.speed1 += step; // Speed up motor
      } else {
        this.speed1 -= step;
      }

      this.arduino.analogWrite(this.pwm1, this.speed1);
      TimeUtils.sleepMillis(1);

      if(this.speed2 !== speed2) {
        if(this.speed2 < speed2) {
          this.speed2 += step; // Speed up motor
        } else {
          this.speed2 -= step;
        }

        this.arduino.analogWrite(this.pwm2, this.speed2);
        TimeUtils.sleepMillis(1);
      }
    }
  }

	this.speed1 = Math.round(this.speed1);
	this.speed2 = Math.round(this.speed2);
	log.info(`Speed1: ${this.speed1} Speed2: ${this.speed2}`);

  process.send({
    tag: INTL_TAGS.NOTIFY_MOTOR_SPEED_CHANGE,
    val: {
      tag: COMM_TAGS.DC_MOTOR_SPEED_FEEDBACK2,
      topMotor: Math.round((this.speed2/255) * 100),
      bottomMotor: Math.round((this.speed1/255) * 100)
    }
  });
}

let changeSpeed = function (speed, m) {
  if(this["speed"+m] === speed) return;

  if(this["speed"+m] < speed) {
    log.info('[Motor::speedUp]: current speed: ',this["speed"+m]);
    log.info(`[Motor::speedUp]: Speeding up motor${m} to speed: ${speed}`);

    for (var i = this["speed"+m]; i <= speed; i = i + 0.1) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;

      TimeUtils.sleepMillis(1);
    }

  } else {
    log.info('[Motor::slowDown]: current speed: ',this["speed"+m]);
    log.info(`[Motor]: Slowing down motor${m} to speed: ${speed}`);

    for (var i = this["speed"+m]; i >= speed; i = i - 0.1) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;

      TimeUtils.sleepMillis(1);
    }
  }

	this["speed"+m] = Math.round(this["speed"+m]);
	process.send({
		tag: INTL_TAGS.NOTIFY_MOTOR_SPEED_CHANGE,
		val: {
      tag: COMM_TAGS.DC_MOTOR_SPEED_FEEDBACK,
      motorNum: m,
      speed: Math.round((this["speed"+m]/255) * 100)
    }
	});
};
module.exports = Motor;
