'use strict'

const Gpio 							= require('onoff').Gpio;
const deg_per_step 			= 1.8;
const TimeUtil					= require('../utils/time');

function StepperMotor(settings) {
	this.settings = settings;
	init.call(this);
}

let init = function() {
	console.log(this.settings);
	this.dirPin 		= new Gpio(this.settings.dirPin, 'out');
	this.stepPin 		= new Gpio(this.settings.stepPin, 'out');
};

StepperMotor.prototype.shutdown = function() {
	this.dirPin.unexport();
	this.stepPin.unexport();
};

StepperMotor.prototype.step = function(dir, angle) {
	let steps = parseInt(angle/deg_per_step);

	for(let i = 0; i < steps; i++) {
		this.stepPin.writeSync(1);
		TimeUtil.sleepMillis(200);
		this.stepPin.writeSync(0);
	}
};

module.exports = StepperMotor;
