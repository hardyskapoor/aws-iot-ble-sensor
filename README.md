# aws-iot-ble-sensor

This is a simple AWS IoT Device app that continuously scans for and reports detected iBeacons.
Rules can then be setup to send the data to Amazon DynamoDB, Elasticsearch Service, Kinesis or Machine Learning.

## Installation

This app is intended to be run on Raspberry Pi 3 running Raspbian Jessie. 

- Download the Raspbian Jessie Lite image from the [official downloads page](https://www.raspberrypi.org/downloads/raspbian/)
- Install Raspbian image to an SD card following the [installation guide](https://www.raspberrypi.org/documentation/installation/installing-images/README.md)
- Boot the device, login and run the automated setup script: ```curl -sL https://raw.githubusercontent.com/kkonstan/aws-iot-ble-sensor/master/raspbian-setup.sh | sudo -E bash -```
- Copy AWS IoT certificates to ```/boot/setup/aws-iot-cert/```
- Set a unique hostname (will be used as AWS IoT clientId) in ```/boot/setup/hostname```
- Optionally setup WiFi in ```/boot/setup/wifi/wpa_supplicant.conf```

Example ```wpa_supplicant.conf```:
```country=GB
ctrl_interface=DIR=/var/run/wpa_supplicant GROUP=netdev
update_config=1
network={
	ssid=“My Network”
	psk=“My Pre-Shared Key”
}
```

## Usage

For testing purposes the scripts can also be run on OS X and Linux.

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
