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
  "sensor": "hostname",
  "timestamp": "2016-04-26T14:26:15.336Z",
  "type": "detection",
  "beacon": {
    "uuid": "699ebc80e1f311e39a0f0cf3ee3bc012",
    "major": 65535,
    "minor": 1,
    "measuredPower": -77,
    "rssi": -47,
    "accuracy": 0.23405054750959978,
    "proximity": "immediate"
  }
}
```

This is what a heartbeat message looks like:
```json
{
  "sensor": "hostname",
  "timestamp": "2016-04-26T14:24:58.993Z",
  "type": "heartbeat",
  "loadavg": [
    1.27978515625,
    1.41064453125,
    1.47900390625
  ],
  "uptime": 76355
}
```
