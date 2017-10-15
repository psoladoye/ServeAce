var path = require('path');
var fork = require('child_process').fork;
var bleno = require('bleno');

var RemoteService = require('./remote-service');
var primaryService = new RemoteService();

bleno.on('stateChange', function(state) {
  if(state  === 'poweredOn') {
    bleno.startAdvertising('ServeAce',[primaryService.uuid]);
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if(!error) {
		bleno.setServices([primaryService], function(error) {
			console.log('setServices: ' + (error ? 'error ' + error : 'success'));
		});    
  }
});

