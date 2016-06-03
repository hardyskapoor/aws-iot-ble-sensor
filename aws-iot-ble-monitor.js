// AWS IoT Device app that continuously scans for heartbeat



//
// Parse command line arguments
//

var commandLineArgs = require('command-line-args');

var args = commandLineArgs([
  { name: 'verbose', alias: 'v', type: Boolean, defaultValue: false },
])

var options = args.parse()

// keep a hash map of sensors with the last timestamp
var HashMap = require('hashmap');
var map = new HashMap();

const offlineThreshold = 15;


//
// AWS IoT connection
//

// use the hostname to identify this instance of the monitor
var os = require('os');
const monitor = os.hostname().split('.').shift() + '-monitor';

// use this topic for heartbeats
const topicHeartbeat = 'heartbeat';

// connect to AWS IoT
var awsIot = require('aws-iot-device-sdk');
const aws = awsIot.device({
    keyPath: './certs/private.pem.key',
    certPath: './certs/certificate.pem.crt',
    caPath: './certs/root-CA.crt',
    region: 'eu-west-1',
    clientId: monitor
});

// check for offline sensors every 60 seconds
offline = setInterval(function() {
    now = new Date();

    if (options.verbose) {
      // also log to console
      console.log('Sensor check at', now.toJSON());
    }
    map.forEach(function(timestamp, sensor) {
      last = new Date(timestamp);
      // calculate how many seconds since the last timestamp
      age = parseInt((now - last)/1000);

      if (age > offlineThreshold) {
         // if sensor hasn'd reported recently announce it as newly offline
         console.log('Sensor', sensor, 'now offline at', now.toISOString(), '(last heartbeat', age, 'sec ago, threshold is', offlineThreshold + 'sec)');
         // and remove it form the list
         map.remove(sensor);
      }

      if (options.verbose) {
        // log to console each sensor and timestamp/seconds since last heard
        console.log(sensor, last.toISOString(), age, 'sec ago');
      }
    });
}, 10000);


// report active sensors every 60 seconds

report = setInterval(function() {
    now = new Date();
    var counter = 0;

    console.log('Status as of', now.toJSON());

    map.forEach(function(timestamp, sensor) {
      last = new Date(timestamp);
      // calculate how many seconds since the last timestamp
      age = parseInt((now - last)/1000);

      console.log(sensor, 'last heartbeat at' , last.toISOString());
      counter++;
    });
    console.log('' + counter, 'sensors active during last', offlineThreshold, 'sec');
    console.log('');
}, 10000);

// subscribe to the topic
aws.subscribe(topicHeartbeat);



// 
// AWS IoT event handlers
//

aws
    .on('connect', function() {
        console.log('AWS IoT Device Gateway: Connected');
    });
aws
    .on('close', function() {
        console.log('AWS IoT Device Gateway: Closed');
    });
aws
    .on('reconnect', function() {
        console.log('AWS IoT Device Gateway: Reconnected');
    });
aws
    .on('offline', function() {
        console.log('AWS IoT Device Gateway: Offline');
    });
aws
    .on('error', function(error) {
        console.log('AWS IoT Device Gateway: Error -', error);
    });
aws
    .on('message', function(topic, payload) {
       if (options.verbose) {
         // also log to consolepp
         console.log(payload.toString());
       } 

       // parse payload
       heartbeat = JSON.parse(payload);

       if (! map.has(heartbeat.sensor)) {
         // if sensor is not on our list announce it as newly online
         console.log('Sensor', heartbeat.sensor, 'now  online at', heartbeat.timestamp, '(uptime', parseInt(heartbeat.uptime/60), 'minutes)');
       }

       // update the last heard from timestamp
       map.set(heartbeat.sensor, heartbeat.timestamp);
    });
