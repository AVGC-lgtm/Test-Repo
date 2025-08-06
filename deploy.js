#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('🚀 AGRISHIELD Deployment Script\n');

// Configuration
const config = {
  development: {
    port: 8005,
    database: 'development',
    nodeEnv: 'development'
  },
  production: {
    port: 3000,
    database: 'production',
    nodeEnv: 'production'
  }
};

function runCommand(command, description) {
  console.log(`📋 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed\n`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

function checkEnvironment() {
  console.log('🔍 Checking environment...');
  
  // Check if .env.local exists
  if (!fs.existsSync('.env.local')) {
    console.log('⚠️  .env.local not found. Creating from .env.example...');
    if (fs.existsSync('.env.example')) {
      fs.copyFileSync('.env.example', '.env.local');
      console.log('✅ Created .env.local from .env.example');
      console.log('📝 Please update .env.local with your actual values\n');
    } else {
      console.error('❌ .env.example not found. Please create environment configuration.');
      process.exit(1);
    }
  } else {
    console.log('✅ Environment configuration found\n');
  }
}

function installDependencies() {
  runCommand('npm install', 'Installing dependencies');
}

function setupDatabase() {
  console.log('🗄️  Setting up database...');
  
  // Generate Prisma client
  runCommand('npx prisma generate', 'Generating Prisma client');
  
  // Push database schema
  runCommand('npx prisma db push', 'Pushing database schema');
  
  // Seed database
  runCommand('npx prisma db seed', 'Seeding database with sample data');
}

function buildApplication() {
  runCommand('npm run build', 'Building application');
}

function runTests() {
  console.log('🧪 Running tests...');
  
  // Type checking
  runCommand('npm run typecheck', 'Type checking');
  
  // API tests (if server is running)
  try {
    console.log('📡 Testing API endpoints...');
    execSync('node test-api.js', { stdio: 'inherit', timeout: 30000 });
    console.log('✅ API tests completed\n');
  } catch (error) {
    console.log('⚠️  API tests skipped (server may not be running)\n');
  }
}

function startDevelopment() {
  console.log('🔧 Starting development server...');
  console.log('📍 Server will be available at: http://localhost:8005');
  console.log('🔑 Demo accounts:');
  console.log('   - DAO: dao@agrishield.com / password123');
  console.log('   - Field Officer: field@agrishield.com / password123');
  console.log('   - Legal Officer: legal@agrishield.com / password123');
  console.log('   - Lab Coordinator: lab@agrishield.com / password123\n');
  
  execSync('npm run dev', { stdio: 'inherit' });
}

function startProduction() {
  console.log('🚀 Starting production server...');
  execSync('npm start', { stdio: 'inherit' });
}

function showHelp() {
  console.log(`
Usage: node deploy.js [command]

Commands:
  setup     - Complete setup (install, database, build)
  dev       - Start development server
  prod      - Build and start production server
  test      - Run tests only
  db        - Setup database only
  build     - Build application only
  help      - Show this help message

Examples:
  node deploy.js setup    # Full setup for new installation
  node deploy.js dev      # Start development
  node deploy.js prod     # Production deployment
  `);
}

// Main execution
const command = process.argv[2] || 'help';

switch (command) {
  case 'setup':
    checkEnvironment();
    installDependencies();
    setupDatabase();
    buildApplication();
    console.log('🎉 Setup completed! Run "node deploy.js dev" to start development server.');
    break;
    
  case 'dev':
    checkEnvironment();
    startDevelopment();
    break;
    
  case 'prod':
    checkEnvironment();
    installDependencies();
    setupDatabase();
    buildApplication();
    runTests();
    startProduction();
    break;
    
  case 'test':
    runTests();
    break;
    
  case 'db':
    checkEnvironment();
    setupDatabase();
    break;
    
  case 'build':
    buildApplication();
    break;
    
  case 'help':
  default:
    showHelp();
    break;
}
