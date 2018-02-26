 'use strict';

const comm_tags = {
  DEV_POWER: 1,
  DEV_PLAY_PAUSE:2,
  SYNC_SERVE_PROFILE:3,
  CHANGE_MOTOR_SPEED: 4,
  ROTATE_HORIZ_MOTOR: 5
};

const dev_states = {
  ON:1,
  OFF:0
};

const motor_speeds = {
  FLAT_S: 64,
  TOPSPIN_S: 127,
  H_TOPSPIN_S: 191
};

const serve_type = {
  FLAT_S: 1,
  TOPSPIN_S: 2
};

const serve_loc = {
  LEFT: 1,
  CENTER: 2,
  RIGHT: 3
};

const uno = {
  pins: {
    A0: 14,
    A1: 15,
    A2: 16,
    A3: 17,
    A4: 18,
    A5: 19
  }
};

const pins = {
  BALL_SPEED: 16,
  MOTOR_1_PWM: 5,
  MOTOR_1_DIR: 4,
  MOTOR_2_PWM: 9,
  MOTOR_2_DIR: 8,
  S_MOTOR_DIR: 23,
  S_MOTOR_STEP: 24,
  H_MOTOR_DIR: 5,
  H_MOTOR_STEP: 6
};

const internal_tags = {
  POWER: 1,
  STATE: 2,
  PROFILE: 3,
  SET_MOTOR_SPEED: 4,
  SET_HORIZ_MOTOR_DIR: 5
};

module.exports = {
  COMM_TAGS: comm_tags,
  DEV_STATES: dev_states,
  MOTOR_SPEEDS: motor_speeds,
  SERVE_TYPE: serve_type,
  ASSIGNED_PINS: pins,
  INTL_TAGS: internal_tags,
  SERVE_LOC: serve_loc
}
