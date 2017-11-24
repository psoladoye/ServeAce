#! /bin/sh
BLE=1 NODE_DEBUG=BALL_FEEDER,STEPPER,MAIN pm2 start proc_management/pm2-app.json
