'use strict';

const Gpio = require('onoff').Gpio;

function computeNewSpeed() {
	let distanceTo = this.getDistanceToGo();

	let requiredSpeed = 0;

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
		this._speed = speed;
		this._stepInterval = Math.abs(1000.0/this._speed);
	}

	setMaxMotorSpeed(speed) {
		this._maxSpeed = speed
		this.setMotorSpeed(this.computeNewSpeed());

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

	disableOutputs() {

	}

	enableOutputs() {

	}
};

module.exports = AccelStepper;