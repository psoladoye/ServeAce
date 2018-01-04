'use strict';

const util = require('util');
const bleno = require('bleno');
const log = require('../utils/logger')('BALL_COUNT');

let Descriptor = bleno.Descriptor;
let Characteristic = bleno.Characteristic;

let BallCountCharacteristic = function() {
	BallCountCharacteristic.super_.call(this, {
		uuid: '2E18',
		properties: ['notify']
		descriptors: [
			new Descriptor({
				uuid: '2904',
				value: 'Indicate number of balls left'
			})
		]
	});
};

util.inherits(BallCountCharacteristic, Characteristic);

BallCountCharacteristic.prototype.onSubscribe = function(maxValueSize, updateValueCallback) {
	log.info('onSubscribe');
	this.updateValueCallback = updateValueCallback;
};

BallCountCharacteristic.prototype.onUnsubscribe = function() {
	log.info('onUnsubscribe');
	this.updateValueCallback = null;
};

BallCountCharacteristic.prototype.onNotify = function() {
	log.info('onNotify');
};

BallCountCharacteristic.prototype.onBallCountChange = function(ballCount) {
	if(this.updateValueCallback) {
		this.updateValueCallback(new Buffer(ballCount));
	}
};

module.exports = BallCountCharacteristic;
