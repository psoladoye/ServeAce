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

	process.send({ 
    tag: INTL_TAGS.NOTIFY_DC_MOTORS_INIT,
		val: { tag: COMM_TAGS.DC_MOTORS_INITIALIZER, motorState: 1 } 
  });
};

Motor.prototype.power = function (state) {
  switch (state) {
    case POWER.ON: {
      this.arduino.digitalWrite(this.dir1, this.arduino.HIGH);
      this.arduino.digitalWrite(this.dir2, this.arduino.HIGH);

      this.motorsRunning = true;
      this.setServe(this.currentServeType);

      break;
    }
    case POWER.OFF: {
      this.arduino.digitalWrite(this.dir1, this.arduino.LOW);
      this.arduino.digitalWrite(this.dir2, this.arduino.LOW);

      TimeUtils.sleepMillis(100);

      changeSpeed.call(this,0,1);
      changeSpeed.call(this,0,2);

      this.motorsRunning = false;

      break;
    }
    default:log('Unknow device state');
  }
};

Motor.prototype.setServe = function (serve) {
  this.currentServeType = serve;

  if(!this.motorsRunning) return;

  switch (this.currentServeType) {
    case SERVE_TYPE.FLAT_B: {
			log.info('Serve type: Beginner flat serve');
      changeSpeed.call(this, 179, 1);
      changeSpeed.call(this, 179 ,2);
      break;
    }

		case SERVE_TYPE.FLAT_I: {
			log.info('Serve type: Intermediate flat serve');
			changeSpeed.call(this, 204, 1);
			changeSpeed.call(this, 204, 2);
			break;
		}

		case SERVE_TYPE.FLAT_A: {
			log.info('Serve type: Advanced flat serve');
			changeSpeed.call(this, 222, 1);
			changeSpeed.call(this, 222, 2);
			break;
		}

    case SERVE_TYPE.TOPSPIN_B: {
			log.info('Serve type: Beginner topsin');
      changeSpeed.call(this, 166, 1);
      changeSpeed.call(this, 191, 2);
      break;
    }

		case SERVE_TYPE.TOPSPIN_I: {
			log.info('Serve type: Intermediate topspin');
			changeSpeed.call(this, 204, 1);
			changeSpeed.call(this, 230, 2);
			break;
		}

		case SERVE_TYPE.TOPSPIN_A: {
			log.info('Serve type: Advanced topspin');
			changeSpeed.call(this, 186, 1);
			changeSpeed.call(this, 222, 2);
			break;
		}

    default: log.error('unknown serve type', this.currentserveType);
  }
};

Motor.prototype.setSpeed = function(speed, motorNum) {
  log.info(`Set speed : ${speed} motor: ${motorNum}`);
	changeSpeed.call(this, speed, motorNum);
};

let changeSpeed = function (speed, m) {
  if(this["speed"+m] === speed) return;
  if(this["speed"+m] < speed) {
    log.info(`[Motor::speedUp]: Speeding up motor${m} to speed: ${speed}`);
    log.info('[Motor::speedUp]: current speed: ',this["speed"+m]);

    for (var i = this["speed"+m]; i <= speed; i++) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;

      TimeUtils.sleepMillis(1000/60);
    }

		process.send({
			tag: INTL_TAGS.NOTIFY_MOTOR_SPEED_CHANGE,
			val: { tag: COMM_TAGS.DC_MOTOR_SPEED_FEEDBACK, motorNum: m, speed: parseInt((this["speed"+m]/255) * 100) }
		});
  } else {
    log.info(`[Motor]: Slowing down motor${m} to speed: ${speed}`);
    log.info('[Motor::slowDown]: current speed: ',this["speed"+m]);

    for (var i = this["speed"+m]; i >= speed; i--) {
      this.arduino.analogWrite(this["pwm"+m],i);
      this["speed"+m] = i;

      TimeUtils.sleepMillis(1000/60);
    }

		process.send({
			tag: INTL_TAGS.NOTIFY_MOTOR_SPEED_CHANGE,
			val: { tag: COMM_TAGS.DC_MOTOR_SPEED_FEEDBACK, motorNum: m, speed: parseInt((this["speed"+m]/255) * 100) }
		});
  }
};
module.exports = Motor;
