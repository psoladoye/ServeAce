'use strict';

const util = require('util');
const bleno = require('bleno');
const log = require('../utils/logger')('MOTOR_FEEDBACK');

let Descriptor = bleno.Descriptor;
let Characteristic = bleno.Characteristic;

let MotorFeedbackCharacteristic = function() {
	MotorFeedbackCharacteristic.super_.call(this, {
		uuid: '2F18',
		properties: ['notify'],
		descriptors: [
			new Descriptor({
				uuid: '2905',
				value: 'Indicate various motor speeds'
			})
		]
	});
};

util.inherits(MotorFeedbackCharacteristic, Characteristic);

MotorFeedbackCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
	log.info('onSubscribe');
	this.updateValueCallback = updateValueCallback;
};

MotorFeedbackCharacteristic.prototype.onUnsubscribe = function() {
	log.info('onUnsubscribe');
	this.updateValueCallback = null;
};

MotorFeedbackCharacteristic.prototype.onNotify = function() {
	log.info('onNotify');
};

MotorFeedbackCharacteristic.prototype.onMotorFeedbackChange = function(feedback) {
	log.info('onMotorFeedbackChange', feedback);
	if(this.updateValueCallback) {
		this.updateValueCallback(new Buffer(feedback));
	}
};

module.exports = MotorFeedbackCharacteristic;