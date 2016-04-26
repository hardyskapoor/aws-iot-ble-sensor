// AWS IoT Device app that continuously scans for and reports detected iBeacons 

var awsIot = require('aws-iot-device-sdk');
var ble = require('bleacon');
var os = require('os');



// use the hostname to identify this instance of the sensor
const sensor = os.hostname();

// use this topic to publish heartbeats
const topicHeartbeat = 'sensor-heartbeat';

// use this topic to publish detections
const topicDetection = 'sensor-detection';



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
        sensor: sensor,
        timestamp: new Date().toJSON(),
        type: 'heartbeat',
        loadavg: os.loadavg(),
        uptime: os.uptime(),
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
            sensor: sensor,
            timestamp: new Date().toJSON(),
            type: 'detection',
            beacon: beacon
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
