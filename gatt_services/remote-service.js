var util = require('util');
var bleno = require('bleno');
var PrimaryService = bleno.PrimaryService;
var fork = require('child_process').fork;
const server = require('../server/server.js')();

var BallCountCharacteristic = require('../gatt_characteristics/ball-count-characteristic');
var MotorControlCharacteristic = require('../gatt_characteristics/motor-control-characteristic');
var StepperControlCharacteristic = require('../gatt_characteristics/stepper-control-characteristic');
var CommandCenterCharacteristic = require('../gatt_characteristics/command-center-characteristic');

var mCtrlChar = new MotorControlCharacteristic();
var sCtrlChar = new StepperControlCharacteristic();
var cCenterChar = new CommandCenterCharacteristic();
var bCountChar = new BallCountCharacteristic();

var mCtrl_process = fork('./sub_processes/motor_ctrl.js');
var sCtrl_process = fork('./sub_processes/stepper_ctrl.js');

const DEV_STATES = {
  ON:1,
  OFF:0
};

const ServeAce_dev = {
  power: DEV_STATES.OFF,
  isFeedingBall: false/*,
  led: new Gpio(24, 'out')*/
};

const COMM_TAGS = {
  DEV_POWER: 1,
  DEV_PLAY_PAUSE:2,
  SETT_SERVE_PROF:3,
}

/*cCenterChar.on('dataReceived', function(data) {
  console.log(`data received: ${data}`);
  
  switch(parseInt(data)) {
    case 1: {
      mCtrl_process.send('Change to slice serve');
      break;        
    }

    case 2: {
      sCtrl_process.send('set delay to 10 s');
      break;
    }

    default: console.log('Unknown data'); 
  }
});*/

server.on('dataReceived', function(data) {
  console.log('data received:',data);
  switch(data.tag) {
    case COMM_TAGS.DEV_POWER: {
			// power device
			//ServeAce_dev.power = parseInt(data.value);
			mCtrl_process.send({
				tag:"POWER", 
				val: data.value,
				serveAce: ServeAce_dev
			});
			break;
    }
    
    case COMM_TAGS.DEV_PLAY_PAUSE: {
			sCtrl_process.send({
				tag:"STATE", 
				val: data.value,
				serveAce: ServeAce_dev
			});
			break;
		}
		
		default: {
			console.log("Unknown data tag");
		}
  }
});

function RemoteService() {
  RemoteService.super_.call(this, {
    uuid: 'd270',
    characteristics: [
      mCtrlChar,
      sCtrlChar,
      cCenterChar,
			bCountChar
    ]
  });
}

util.inherits(RemoteService, PrimaryService);
module.exports = RemoteService;
