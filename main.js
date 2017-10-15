var path = require('path');
var fork = require('child_process').fork;
var bleno = require('bleno');


bleno.on('stateChange', function(state) => {
  if(state  === 'poweredOn') {
    bleno.startAdvertising('ServeAce');
  } else {
    bleno.stopAdvertising();
  }
});

bleno.on('advertisingStart', function(error) {
  console.log('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if(!error) {
    
  }
});

