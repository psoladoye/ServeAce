'use strict';

const path              = require('path');
const fs                = require('fs');
const fork              = require('child_process').fork;
const log               = require('./utils/logger')('MAIN');
const TimeUtils 				= require('./utils/time');

let mCtrl_process       = null;
let sCtrl_process       = null;

let BLECommandCenter    = null;
let RemoteService       = null;
let remoteService       = null;

BLECommandCenter        = require('bleno');
RemoteService           = require('./gatt_services/remote-service');
remoteService           = new RemoteService();

BLECommandCenter.on('stateChange', (state) => {
  switch (state) {
    case 'poweredOn':{
      BLECommandCenter.startAdvertising('ServeAce',[remoteService.uuid]);
      remoteService.initSubprocesses();
      break;
    }
    case 'unauthorized': {
      log.warn('Current user not authorized');
      break;
    }
    case 'unsupported': {
      log.warn('Device does not support BLE');
      break;
    }
    default: {
      BLECommandCenter.stopAdvertising();
    }
  }
});

BLECommandCenter.on('advertisingStart', (error) => {
  log.info('on -> advertisingStart: ' + (error ? 'error ' + error : 'success'));

  if( !error ) {
    BLECommandCenter.setServices([remoteService], (error) => {
      log.info('setServices: ' + (error ? 'error ' + error : 'success'));
    });
  }
});

BLECommandCenter.on('accept', (clientAddress) => {
  log.info(`Connected client address: ${clientAddress}`);
});

BLECommandCenter.on('disconnect', (clientAddress) => {
  log.info(`Client disconnected: ${clientAddress}`);
});


process.on('message', (msg) => {
  log.info(msg);
  switch(msg.tag) {

    case 'BALL_FEEDER': {
      log.info('Update ball feeder update');
      if(remoteService) remoteService.ballFeederUpdate(msg.val);
      break;
    }

    default: log.error(' Unknown tag');

  }
});

function cleanUp() {
  log.info('cleaning up');
  remoteService.deInit();
}

process.on('SIGINT', () => {
  cleanUp();
	TimeUtils.sleepMillis(5000);
  process.exit();
});
