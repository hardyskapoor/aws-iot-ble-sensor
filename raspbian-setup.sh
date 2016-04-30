#!/bin/bash
#
# Script to install aws-iot-ble-sensor onto a Raspbian Jessie system.
#
# curl -sL https://raw.githubusercontent.com/kkonstan/aws-iot-ble-sensor/master/raspbian-setup.sh | sudo -E bash -
#

export DEBIAN_FRONTEND=noninteractive

print_status() {
    echo
    echo "## $1"
    echo
}

bail() {
    echo 'Error executing command, exiting'
    exit 1
}

exec_cmd_nobail() {
    echo "+ $1"
    bash -c "$1"
}

exec_cmd() {
    exec_cmd_nobail "$1" || bail
}

# Install the NodeSource Node.js 6.x repo
curl -sL https://deb.nodesource.com/setup_6.x | bash -

print_status "Running apt-get upgrade..."
exec_cmd 'apt-get upgrade -y'

print_status "Installing Node.js, Supervisor, Git and other dependencies..."
exec_cmd 'apt-get install -y nodejs supervisor git libudev-dev'

print_status "Checking out aws-iot-ble-sensor..."
cd /opt
exec_cmd 'git clone https://github.com/kkonstan/aws-iot-ble-sensor.git'

print_status "Installing aws-iot-ble-sensor dependencies..."
cd /opt/aws-iot-ble-sensor
exec_cmd 'npm install'

print_status "Preparing /boot/setup/aws-iot-cert/ for the AWS IoT cert..."
mkdir -p /boot/setup/aws-iot-cert
exec_cmd 'ln -s /boot/setup/aws-iot-cert /opt/aws-iot-ble-sensor/certs'

print_status "Preparing /boot/setup/wifi/ for the WiFi config..."
mkdir -p /boot/setup/wifi
touch /boot/setup/wifi/wpa_supplicant.conf 
rm -rf /etc/wpa_supplicant/wpa_supplicant.conf
exec_cmd 'ln -s /boot/setup/wifi/wpa_supplicant.conf /etc/wpa_supplicant/wpa_supplicant.conf'

print_status "Preparing /boot/setup/hostname for the hostname/clientId setup..."
touch /boot/setup/hostname
rm -rf /etc/hostname
exec_cmd 'ln -s /boot/setup/hostname /etc/hostname'

print_status "Setting up Supervisor to startup and monitor aws-iot-ble-sensor..."
cat >/etc/supervisor/conf.d/aws-iot-ble-sensor.conf <<EOF
[program:aws-iot-ble-sensor]
directory=/opt/aws-iot-ble-sensor/
command=/usr/bin/nodejs /opt/aws-iot-ble-sensor/aws-iot-ble-sensor.js -l
EOF
