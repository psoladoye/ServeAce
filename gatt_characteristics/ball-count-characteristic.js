'use strict';

const util = require('util');
var bleno = require('bleno');

var Descriptor = bleno.Descriptor;
var Characteristic = bleno.Characteristic;

var BallCountCharacteristic = function() {
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
	console.log('onSubscribe');
	this.updateValueCallback = updateValueCallback;
};

BallCountCharacteristic.prototype.onUnsubscribe = function() {
	console.log('onUnsubscribe');
	this.updateValueCallback = null;
};

BallCountCharacteristic.prototype.onNotify = function() {
	console.log('onNotify');
};

BallCountCharacteristic.prototype.onBallCountChange = function(ballCount) {
	if(this.updateValueCallback) {
		this.updateValueCallback(new Buffer(ballCount));
	}
};

module.exports = BallCountCharacteristic;
