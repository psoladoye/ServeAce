var path = require('path');
var fork = require('child_process').fork;
var BLECommandCenter = require('bleno');
process.env['BLENO_DEVICE_NAME'] = 'ServeAce_V1';

var RemoteService = require('./remote-service');
var primaryService = new RemoteService();

BLECommandCenter.on('stateChange', function(state) {
  switch (state) {
    case 'poweredOn':{
      BLECommandCenter.startAdvertising('ServeAce',[primaryService.uuid]);
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
		BLECommandCenter.setServices([primaryService], function(error) {
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
