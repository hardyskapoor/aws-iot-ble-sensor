// AWS IoT Device app that continuously scans for and reports detected iBeacons - Sensor

var os = require('os');
var awsIot = require('aws-iot-device-sdk');
var ble = require('bleacon');



// use the hostname to identify this instance of the sensor
const sensor = os.hostname().split('.').shift();

// use this topic for heartbeats
const topicHeartbeat = 'heartbeat';

// use this topic for detections
const topicDetection = 'detection';



// connect to AWS IoT
const aws = awsIot.device({
    keyPath: './certs/private.pem.key',
    certPath: './certs/certificate.pem.crt',
    clientId: sensor,
    caPath: './certs/root-CA.crt',
    region: 'eu-central-1'
});



// publish a heartbeat every 5 seconds
timeout = setInterval(function() {

    // prepare JSON message
    var message = JSON.stringify({
        timestamp: new Date().toJSON(),
        type: 'heartbeat',
        uptime: os.uptime(),
        loadavg: os.loadavg(),
        sensor: sensor,
    })

    // publish to the heartbeat topic
    aws.publish(topicHeartbeat, message);

    // also log to console
    console.log(message);
}, 5000);


// start scanning for iBeacons
ble.startScanning();



//
//   Bleacon event handlers
//

ble
    .on('discover', function(beacon) {

        // prepare JSON message
        var message = JSON.stringify({
            timestamp: new Date().toJSON(),
            type: 'detection',
            uuidmm: beacon.uuid + ':' + beacon.major + '/' + beacon.minor,
            proximity: beacon.proximity,
            sensor: sensor
        });

        // publish to the detection topic
        aws.publish(topicDetection, message);

        // also log to console
        console.log(message);
    });



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
       console.log(payload.toString());
    });
