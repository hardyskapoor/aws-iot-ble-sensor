# aws-iot-ble-sensor

This is a simple AWS IoT Device app that continuously scans for and reports detected iBeacons.
Rules can then be setup to send the data to Amazon DynamoDB, Elasticsearch Service, Kinesis or Machine Learning.

## Usage


### aws-iot-ble-sensor.js

This script listens for ibeacons and reports them to the topic ‘detection’ and also sends a heartbeat every 5 seconds to topic ‘heartbeat’.

### aws-iot-ble-receiver.js

This script subscribes to both topics and just prints out the messages it receives.

This is what a detection message looks like:
```json
{
  "timestamp": "2016-04-26T17:46:34.527Z",
  "type": "detection",
  "uuidmm": "699ebc80e1f311e39a0f0cf3ee3bc012:0/65535",
  "proximity": "near",
  "sensor": "hostname"
}
```

This is what a heartbeat message looks like:
```json
{
  "timestamp": "2016-04-26T17:47:28.361Z",
  "type": "heartbeat",
  "uptime": 78440,
  "loadavg": [
    0.794921875,
    0.83349609375,
    0.875
  ],
  "sensor": "hostname"
}
```
