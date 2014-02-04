var Hapi = require('hapi'),
    Rdio = require('./rdio')

var server = new Hapi.Server(+process.env.PORT, '0.0.0.0');

server.route({
  method: 'GET',
  path: '/',
  handler: function (request) {
    var rdio = new Rdio([process.env.RDIO_CONSUMER_KEY, process.env.RDIO_CONSUMER_SECRET]);

    var newParams = request.query;
    if(!request.query.user){
      newParams["user"] = process.env.DEFAULT_USERKEY;
    }

    var rdioApiCall = "getHeavyRotation"; //default
    if(request.query.apiCall){
      rdioApiCall = request.query.apiCall;
      delete newParams["apiCall"]; //remove this from the params list because it's not an actual rdio param
    }

    console.log("apiCall: " + rdioApiCall);
    console.log("userKey: " + newParams.user);
    console.log("params: " + JSON.stringify(newParams));

    rdio.call(rdioApiCall,newParams, function(err, data) {
      if (err) {
        console.log(err);
        request.reply(new Error("Error getting heavy rotation"));
      }

      var body = [];
      body.push(JSON.stringify(data));

      request.reply(body.join('\n'));
    });
  }
});

server.start(function () {
  server.settings.uri = process.env.HOST ? 'http://' + process.env.HOST + ':' + process.env.PORT : server.settings.uri;
  console.log('Server started at ' + server.settings.uri);
});
