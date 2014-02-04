var express = require('express'),
  Rdio = require('./rdio')
  api = express();

// api middleware
api.use(express.logger('dev'));
api.use(express.bodyParser());

/**
 * CORS support.
 */

api.all('*', function(req, res, next){
  if (!req.get('Origin')) return next();
  // use "*" here to accept any origin
  res.set('Access-Control-Allow-Origin', 'http://localhost:8000');
  res.set('Access-Control-Allow-Methods', 'GET, POST');
  res.set('Access-Control-Allow-Headers', 'X-Requested-With, Content-Type');
  // res.set('Access-Control-Allow-Max-Age', 3600);
  if ('OPTIONS' == req.method) return res.send(200);
  next();
});

/**
 * POST a user.
 */

api.get('/', function(req, res){
  var rdio = new Rdio([process.env.RDIO_CONSUMER_KEY, process.env.RDIO_CONSUMER_SECRET]);

  //TODO only parse valid querystring params for rdio API instead of just blanketly accepting params?
  var newParams = req.query;
  if(!req.query.user){
    newParams["user"] = process.env.DEFAULT_USERKEY;
  }

  var rdioApiCall = "getHeavyRotation"; //default
  if(req.query.apiCall){
    rdioApiCall = req.query.apiCall;
    delete newParams["apiCall"]; //remove this from the params list because it's not an actual rdio param
  }

  console.log("apiCall: " + rdioApiCall);
  console.log("userKey: " + newParams.user);
  console.log("params: " + JSON.stringify(newParams));

  rdio.call(rdioApiCall,newParams, function(err, data) {
    if (err) {
      console.log(err);
      res.send(new Error("Error getting heavy rotation"));
    }

    res.json(data);
  });
});

api.listen(process.env.PORT || 5000);