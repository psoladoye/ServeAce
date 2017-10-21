const http = require('http');

module.exports = function() {
  ServeAce_Server = http.createServer((req, res) => {
    let body = [];

    req.on('data', (data) => {
      console.log('json data: ', data);
      body.push(data);
    }).on('end', () => {
      body = Buffer.concat(body);
      console.log('end',JSON.parse(body)); 
      req.emit('dataReceived', JSON.parse(body));
    });

    response.writeHead(200, {
      'content-type':'application/json'
    });
    response.end();
  });

  ServeAce_Server.listen(8282);
  return ServeAce_Server;
}