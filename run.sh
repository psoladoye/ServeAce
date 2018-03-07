#! /bin/bash
[[ $((pm2 info remote-service || echo 'status|stopped') | grep status) =~ 'stopped' ]] && \
BLE=1 LOG=MAIN,REMOTE_SERVICE,DC_MOTORS,MOTOR_MODEL,MOTOR_FEEDBACK_CHAR \
pm2 start proc_management/pm2-app.json
