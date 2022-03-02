//               _ _                                      _
//  _ __ ___  __| (_)___    _____  ____ _ _ __ ___  _ __ | | ___
// | '__/ _ \/ _` | / __|  / _ \ \/ / _` | '_ ` _ \| '_ \| |/ _ \
// | | |  __/ (_| | \__ \ |  __/>  < (_| | | | | | | |_) | |  __/
// |_|  \___|\__,_|_|___/  \___/_/\_\__,_|_| |_| |_| .__/|_|\___|
//                                                 |_|

//  Bootstraping const & vars
const app             = require('express')();
const redis_conn_obj  = {
  url: "redis://"+process.env.REDIS_HOST+":"+process.env.REDIS_PORT
}
const redis           = require('redis')
const redis_client    = redis.createClient(redis_conn_obj);
const axios           = require('axios');
const crypto          = require("crypto");
const expirationTime  = 90; // seconds
const reconnect_time  = 150000;
var api_server_port   = (process.env.SERVER_PORT || 8001);

reconnect = function(){
  redis_client = redis.createClient(redis_conn_obj);
}

// initialize connection
redis_client.connect();

// redis client on envent functions
redis_client.on('connect', () => {
  console.log('redis connection is ready to rumble!!');
});

redis_client.on('error',  (err) => {
  console.log( (new Date()) + " Redis - disconnected");
  console.log(err)
  setTimeout(reconnect, reconnect_time);
});

// REST definitions
app.post("/v1/token/:userid", async function (req, res) {
  var userid = req.params.userid
  console.log('creating token for %s ', userid)
  var token_hash = crypto.randomBytes(16).toString('hex');
  var token = await redis_client.set(userid, token_hash)
  redis_client.expire(userid, expirationTime);
  if (token) {
    res.send({ success: true, msg: "token created", token: token });
  } else {
    const { data } = await axios.get(
      "https://jsonplaceholder.typicode.com/token"
    );
    res.json(data);
  }
});

app.get("/v1/tokens", async function (req, res) {
  console.log('fetching all created tokens')
  var tokens = []
  const token_keys = await redis_client.keys("*");
  if (token_keys) {
    for ( var i=0; i< token_keys.length; i++ ){
      var token_ttl = await redis_client.ttl(token_keys[i]);
      var token_hash = await redis_client.get(token_keys[i]);
      var token_map = {
        token: token_keys[i],
        token_hash: token_hash,
        token_ttl: token_ttl
      }
      tokens.push(token_map)
    }
    res.json(tokens)
  } else {
    try {
      const { data } = await axios.get(
        "https://jsonplaceholder.typicode.com/tokens"
      );
      res.json(data);
    } catch(error) {
      console.error(error)
      res.json({data: error})
    }
  }
});

app.listen(api_server_port, () => {
    console.log('App listening on port %s ', api_server_port.toString());
    console.log("using redis on host: %s  --  port: %d", process.env.REDIS_HOST, parseInt(process.env.REDIS_PORT))
});
