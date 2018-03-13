 'use strict';

const comm_tags = {
  POWER: 1,
  PLAY_PAUSE:2,
  SYNC_SERVE_PROFILE:3,
  CHANGE_MOTOR_SPEED: 4,
  ROTATE_HORIZ_MOTOR: 5,
	DC_MOTOR_SPEED_FEEDBACK: 6,
	DC_MOTORS_INITIALIZER: 7,
  BALL_COUNT_FEEDBACK: 8,
  HORIZ_MOTOR_ANGLE_FEEDBACK: 9,
  DC_MOTOR_SPEED_FEEDBACK2: 10
};

const internal_tags = {
  POWER: 1,
  STATE: 2,
  PROFILE: 3,
  SET_MOTOR_SPEED: 4,
  SET_HORIZ_MOTOR_DIR: 5,
  NOTIFY_DC_MOTORS_INIT: 6,
  NOTIFY_MOTOR_SPEED_CHANGE: 7,
  NOTIFY_BALL_COUNT: 8,
  NOTIFY_HORIZ_ANGLE: 9
};

const dev_states = {
  ON:1,
  OFF:0
};

const motor_speeds = {
  FLAT_S: 128,
  TOPSPIN_S: 190,
  H_TOPSPIN_S: 230
};

const serve_type = {
  FLAT_B: 5,
	FLAT_I: 6,
	FLAT_A: 7,
  TOPSPIN_B: 10,
	TOPSPIN_I: 12,
	TOPSPIN_A: 14
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
  C_MOTOR_DIR: 5,
  C_MOTOR_STEP: 6,
  H_MOTOR_EN: 18,
  H_MOTOR_DIR: 23,
  H_MOTOR_STEP: 24,
  DEV_STATE_LED: 4
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
