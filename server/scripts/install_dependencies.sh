#!/bin/bash
# Update system packages for Ubuntu
sudo apt-get update -y

# Install Node.js and npm (if not already present) for Ubuntu
# Add Node.js PPA for a specific version (e.g., Node.js 18.x)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 (Process Manager for Node.js applications) globally
sudo npm install -g pm2

# Install Nginx (for serving React frontend) for Ubuntu
sudo apt-get install -y nginx

# Ensure Nginx starts on boot
sudo systemctl enable nginx
