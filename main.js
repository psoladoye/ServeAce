'use strict';

const ipc = require('node-ipc');
const path = require('path');
const fs = require('fs');
const fork = require('child_process').fork;
const os = require('os');
const log = require('./utils/logger')('MAIN');

const PLATFORM = os.platform();
const WIN32 = 'win32';
const BLE = process.env.BLE || null;

let mCtrl_process = null;
let sCtrl_process = null;

let BLECommandCenter = null;
let RemoteService = null;
let remoteService = null;

const def_config = fs.readFileSync('./config/def-conf.json');

if (BLE  && (PLATFORM !== WIN32)) {
  BLECommandCenter = require('bleno');
  RemoteService = require('./gatt_services/remote-service');
  remoteService = new RemoteService();
  
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
      BLECommandCenter.setServices([remoteService], function(error) {
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
} else {
  // TODO: Use ad-hoc wifi
  const server = require('./server/server.js')();
  mCtrl_process = fork('./sub_processes/motor_ctrl.js');
  sCtrl_process = fork('./sub_processes/stepper_ctrl.js');
  const COMM_TAGS = require('./common/constants').COMM_TAGS;

  server.on('dataReceived', function(data) {
    log.info('data received:',data);
    switch(data.tag) {
      case COMM_TAGS.DEV_POWER: {
        mCtrl_process.send({ tag:'POWER', val: data.val });
        sCtrl_process.send({ tag:'STATE', val: data.val });
        break;
      }

      case COMM_TAGS.DEV_PLAY_PAUSE: {
        sCtrl_process.send({ tag:'STATE', val: data.val });
        break;
      }

      default: {
        log.error("Unknown data tag");
      }
    }
  });
}


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
}

process.on('SIGINT', () => {
  cleanUp();
  process.exit();
});
