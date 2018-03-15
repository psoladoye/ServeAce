#! /bin/bash
[[ $((pm2 info remote-service || echo 'status|stopped') | grep status) =~ 'stopped' ]] && \
LOG=MAIN,REMOTE_SERVICE,DC_MOTORS,MOTOR_MODEL \
pm2 start proc_management/pm2-app.json
