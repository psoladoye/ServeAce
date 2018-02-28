#! /bin/bash
[[ $((pm2 info remote-service || echo 'status|stopped') | grep status) =~ 'stopped' ]] && \
BLE=1 LOG=BALL_FEEDER,CAROUSEL_STEPPER,MAIN,REMOTE_SERVICE,DC_MOTORS,MOTOR_MODEL,\
AccelStepper,HORIZ_STEPPER,H_STEPPER pm2 start proc_management/pm2-app.json
