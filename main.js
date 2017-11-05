'use strict';

const path = require('path');
const fs = require('fs');
const fork = require('child_process').fork;
const os = require('os');
const WIN32 = 'win32';

let mCtrl_process = null;
let sCtrl_process = null;

process.env['BLENO_DEVICE_NAME'] = 'ServeAce_V1';

const def_config = fs.readFileSync('./config/def-conf.json');

if (process.env.BLE  && os.platform() !== WIN32) {
  const BLECommandCenter = require('bleno');
  const RemoteService = require('./gatt_services/remote-service');
  const remoteService = new RemoteService();

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
} else {
  const server = require('./server/server.js')();
  mCtrl_process = fork('./sub_processes/motor_ctrl.js');
  sCtrl_process = fork('./sub_processes/stepper_ctrl.js');
  const COMM_TAGS = require('./common/constants').COMM_TAGS;

  server.on('dataReceived', function(data) {
    console.log('data received:',data);
    switch(data.tag) {
      case COMM_TAGS.DEV_POWER: {
        mCtrl_process.send({
          tag:"POWER",
          val: data.value
        });
        break;
      }

      case COMM_TAGS.DEV_PLAY_PAUSE: {
        sCtrl_process.send({
          tag:"STATE",
          val: data.value
        });
        break;
      }

      default: {
        console.log("Unknown data tag");
      }
    }
  });
}

function cleanUp() {
  if(mCtrl_process !== null) {
    mCtrl_process.send({
      tag:"POWER",
      val: 0
    });
  }
}

process.on('exit', () => {
  cleanUp();
});

process.on('SIGINT', () => {
  cleanUp();
});
