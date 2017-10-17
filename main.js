const path = require('path');
const fs = require('fs');
const fork = require('child_process').fork;

var BLECommandCenter = require('bleno');
var RemoteService = require('./gatt_services/remote-service');
process.env['BLENO_DEVICE_NAME'] = 'ServeAce';
var remoteService = new RemoteService();

var def_config = fs.readFileSync('./config/def-conf.json');

var ServeAce_dev = {
  isOn: false,
  isFeedingBall: false
};

BLECommandCenter.on('stateChange', function(state) {
  switch (state) {
    case 'poweredOn':{
      BLECommandCenter.startAdvertising('ServeAce',[remoteService.uuid]);
      break;
    }
    case 'unauthorized': {
      console.log('Current user not authorized');
      break;
    }
    case 'unsupported': {
      console.log('Device does not support BLE');
      break;
    }
    default: {
      BLECommandCenter.stopAdvertising();
    }
  }
});

BLECommandCenter.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if(!error) {
		BLECommandCenter.setServices([remoteService], function(error) {
			console.log('setServices: ' + (error ? 'error ' + error : 'success'));
		});
  }
});

BLECommandCenter.on('accept', (clientAddress) => {
  console.log(`Connected client address: ${clientAddress}`);
});

BLECommandCenter.on('disconnect', (clientAddress) => {
  console.log(`Client disconnected: ${clientAddress}`);
});
