'use strict';

const log = require('../utils/logger')('AccelStepper');
const Gpio = require('onoff').Gpio;

function computeNewSpeed() {
	log.info('Computing new speed');
	let distanceTo = this.getDistanceToGo();

	let requiredSpeed = 0;
	let _acceleration = 1;

	if(distanceTo === 0) {
		return 0;
	} else if (distanceTo > 0) { // clockwise
		requiredSpeed = Math.sqrt(2.0 * distanceTo * _acceleration);
	} else { // Anti-clockwise
		requiredSpeed = -Math.sqrt(2.0 * -distanceTo * _acceleration);
	}

	if (requiredSpeed > this._speed) {

		// Need to accelerate in clockwire direction
		if(this._speed === 0) {
			requiredSpeed = Math.sqrt(2.0 * _acceleration);	
		} else {
			requiredSpeed = this._speed + abs(_acceleration / this._speed);
		}

		if(requiredSpeed > this._maxSpeed) {
			requiredSpeed = this._maxSpeed;
		}
	} else if(requiredSpeed < this._speed) {

		// Need to accelerate in anticlockwise direction

		if (this._speed == 0) {
		    requiredSpeed = -Math.sqrt(2.0 * _acceleration);
		} else {
		    requiredSpeed = this._speed - Math.abs(_acceleration / this._speed);
		} 

		if (requiredSpeed < - this._maxSpeed) {
		    requiredSpeed = - this._maxSpeed;
		}
	}

	return requiredSpeed;
}

class AccelStepper {
	constructor(dirPin, controlPin) {
		this._dirPin = new Gpio(dirPin, 'out');
		this._controlPin = new Gpio(controlPin, 'out');
		this._speed = 0; 					// steps per second
		this._currentPosition = 0; 			// steps
		this._targetPosition = 0; 			// steps
		this._stepInterval = 0; 			// millis
	}

	/**
	 * @param {number}
	 */
	setMotorSpeed(speed) {
		log.info('Setting motor speed');
		this._speed = speed;
		this._stepInterval = Math.abs(1000.0/this._speed);
	}

	setMaxMotorSpeed(speed) {
		this._maxSpeed = speed
		this.setMotorSpeed(computeNewSpeed.call(this));
	}

	/**
	 * @param  {number}
	 * @return {[type]}
	 */
	moveTo(absolute_dis) {
		this._targetPosition = absolute_dis;
	}

	/**
	 * @param  {number}
	 */
	move(relative_dis) {
		this.moveTo(_currentPosition + relative_dis);
	}

	/**
	 * @return {boolean}
	 */
	run() {
		log.info('AccelStepper::run');
		this._dirPin.writeSync(1);
		this._controlPin.writeSync(1);
	}

  stop() {
		log.info('AccelStepper::stop');
  	this._dirPin.writeSync(0);
  	this._controlPin.writeSync(0);
  }

	runToPosition() {

	}

	/**
	 * The distance from the current position to the target position.
	 * @return {number}
	 */
	getDistanceToGo() {
		return (this._targetPosition - this._currentPosition);
	}

	/**
	 * The most recently set target position.
	 * @return {number}
	 */
	getTargetPosition() {
		return this._targetPosition;
	}

	setCurrentPosition(position) {
		this._currentPosition = position;
	}

  shutDown() {
   	log.info('AccelStepper::shutDown');
		this._dirPin.unexport();
		this._controlPin.unexport();
  }
};

module.exports = AccelStepper;
