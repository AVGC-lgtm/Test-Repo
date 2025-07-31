#!/bin/bash
# Navigate to the backend application directory
cd /var/www/nodejs-app/server

# Install Node.js backend dependencies (if not included in artifact, or for fresh install)
npm install

# Start the Node.js application using PM2
pm2 start server.js --name "my-node-app" # Replace app.js with your main entry file
pm2 save

# Configure and start Nginx for frontend
# Copy Nginx config from deployed location to active Nginx config directory
# For Ubuntu, Nginx typically uses /etc/nginx/sites-available/ and symlinks to sites-enabled/
sudo cp /var/www/nodejs-app/nginx/default.conf /etc/nginx/sites-available/
sudo ln -sf /etc/nginx/sites-available/default.conf /etc/nginx/sites-enabled/default.conf
sudo systemctl restart nginx # Restart Nginx to apply new config
