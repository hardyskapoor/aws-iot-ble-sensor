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

const offlineThreshold = 180;
const statusFile = '/var/www/html/status.html';


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

// check for offline sensors every 10 seconds
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

// report active sensors every 10 seconds to a file
report = setInterval(function() {
    now = new Date();

    if (options.verbose) {
      // also log to console
      console.log('Reporting to file at', now.toJSON());
    }

    var counter = 0;

    var fs = require('fs');
    var stream = fs.createWriteStream(statusFile);
    stream.once('open', function(fd) {
      stream.write('<html><head><title>Status of sensors</title><meta http-equiv=\"refresh\" content=\"10\"></head><body><h1>Status of sensors as of ' + now.toJSON() + '</h1><table>\n');

      map.forEach(function(timestamp, sensor) {
        last = new Date(timestamp);
        // calculate how many seconds since the last timestamp
        age = parseInt((now - last)/1000);

        stream.write('<tr><td>' + sensor + '</td><td>' + last.toISOString() + '</td></tr>');
        counter++;
      });
      stream.write('</table><p>' + counter + ' sensors active during last ' + offlineThreshold + ' sec</p></body></html>\n');
      stream.end();
    });
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
