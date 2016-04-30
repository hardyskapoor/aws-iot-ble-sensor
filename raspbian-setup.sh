#!/bin/bash
#
# Script to install aws-iot-ble-sensor onto a Raspbian Jessie system.
#
# curl -sL https://raw.githubusercontent.com/kkonstan/aws-iot-ble-sensor/master/raspbian-setup.sh | sudo -E bash -
#

DISTRO=$(lsb_release -c -s 2>/dev/null)

if [ "X${DISTRO}" != "Xjessie" ]; then
	echo "This installer only supports Raspbian Jessie, aborting."
	exit 1
fi

export DEBIAN_FRONTEND=noninteractive

# Install the NodeSource Node.js 6.x repo
curl -sL https://deb.nodesource.com/setup_6.x | bash -

# Upgrade all packages
apt-get update ; apt-get upgrade -y

# Install Node.js, Git and other dependencies
apt-get install -y nodejs git libudev-dev

# Install aws-iot-ble-sensor app
cd /opt
git clone https://github.com/kkonstan/aws-iot-ble-sensor.git
cd /opt/aws-iot-ble-sensor
npm install

# Prepare /boot/setup/certs (FAT on Raspbian) for the AWS IoT certs
mkdir -p /boot/setup/certs
ln -s /boot/setup/certs /opt/aws-iot-ble-sensor/certs

echo "Don't forget to install the certificates in /boot/setup/certs"
