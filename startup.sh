#! /bin/sh
BLE=1 LOG=BALL_FEEDER,STEPPER,MAIN,REMOTE_SERVICE,MOTOR,MOTOR_MODEL pm2 start proc_management/pm2-app.json
