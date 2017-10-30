const motor1 = new require('onoff').Gpio(23,'out');

process.on('message', (msg) => {
  console.log('[motor-control]: Message remote-service => ', msg); 
  switch(msg.tag) {
    case 'POWER': {
      console.log('[motor-control]: powering on device...',motor1);
      motor1.writeSync(msg.val);
      break;
    }
    default: console.log('[motor-control]: Unknown option.');
  }
});


