#!/bin/bash
# Navigate to the backend application directory
cd /var/www/nodejs-app/server

# Stop the Node.js application using PM2
pm2 stop server.js # Use the name defined in start_application.sh
#pm2 delete 
pm2 save

# Stop Nginx
sudo systemctl stop nginx