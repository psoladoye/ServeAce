process.on('message', function(msg) {
	console.log(`[stepper-control]: message from remote-service => ${msg}`);
});
