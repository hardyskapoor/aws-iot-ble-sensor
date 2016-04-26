# aws-iot-ble-sensor

This is a simple AWS IoT Device app that continuously scans for and reports detected iBeacons.

## Usage


### aws-iot-ble-sensor.js

This script listens for ibeacons and reports them to the topic ‘detection’ and also sends a heartbeat every 5 seconds to topic ‘heartbeat’.

### aws-iot-ble-receiver.js

This script subscribes to both topics and just prints out the messages it receives.

This is what a detection message looks like:
```json
{
  "timestamp": "2016-04-26T16:42:26.065Z",
  "type": "detection",
  "sensor": "hostname",
  "uuidmm": "699ebc80e1f311e39a0f0cf3ee3bc012:1/40173",
  "proximity": "near"
}
```

This is what a heartbeat message looks like:
```json
{
  "timestamp": "2016-04-26T16:42:20.152Z",
  "type": "heartbeat",
  "sensor": "wks52157.local",
  "loadavg": [
    1.72021484375,
    1.7294921875,
    1.5888671875
  ],
  "uptime": 84597
}
```
