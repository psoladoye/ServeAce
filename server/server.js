'use strict';

const http = require('http');

module.exports = function() {
  let ServeAce_Server = http.createServer((req, res) => {
    let body = [];
    req.on('data', (data) => {
      body.push(data);
    }).on('end', () => {
      body = Buffer.concat(body);
      ServeAce_Server.emit('dataReceived', JSON.parse(body));
    });

    res.writeHead(200, {
      'content-type':'application/json'
    });
    res.end();
  });

  ServeAce_Server.listen(8282);
  return ServeAce_Server;
}
