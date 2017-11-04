

const comm_tags = {
  DEV_POWER: 1,
  DEV_PLAY_PAUSE:2,
  SETT_SERVE_PROF:3,
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
  TOPSPIN_S: 2,
  H_TOPSPIN_S: 3
};

const pins = {
  PLAY_PAUSE: uno.pins.A2,
  MOTOR_1_PWM: 6,
  MOTOR_1_DIR: 7,
  MOTOR_2_PWM: 5,
  MOTOR_2_DIR: 11,
  STEPPER_MOTOR_DIR: uno.pins.A0,
  STEPPER_MOTOR_STEP: uno.pins.A1
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

module.exports = {
  COMM_TAGS: comm_tags,
  DEV_STATES: dev_states,
  MOTOR_SPEEDS: motor_speeds,
  SERVE_TYPE: serve_type,
  ASSIGNED_PINS: pins
}
