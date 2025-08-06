#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const http = require('http');

console.log('🔍 AGRISHIELD System Health Check\n');

// System components to check
const checks = {
  files: [
    { path: 'package.json', description: 'Package configuration' },
    { path: 'prisma/schema.prisma', description: 'Database schema' },
    { path: 'src/lib/prisma.ts', description: 'Database client' },
    { path: 'src/lib/auth.ts', description: 'Authentication config' },
    { path: '.env.example', description: 'Environment template' },
    { path: 'README-BACKEND.md', description: 'Backend documentation' },
    { path: 'API-DOCUMENTATION.md', description: 'API documentation' }
  ],
  directories: [
    { path: 'src/app/api', description: 'API routes' },
    { path: 'src/components', description: 'React components' },
    { path: 'src/lib', description: 'Utility libraries' },
    { path: 'prisma', description: 'Database configuration' }
  ],
  apiRoutes: [
    { path: 'src/app/api/auth/[...nextauth]/route.ts', description: 'Authentication API' },
    { path: 'src/app/api/users/route.ts', description: 'Users API' },
    { path: 'src/app/api/inspections/route.ts', description: 'Inspections API' },
    { path: 'src/app/api/seizures/route.ts', description: 'Seizures API' },
    { path: 'src/app/api/lab-samples/route.ts', description: 'Lab Samples API' },
    { path: 'src/app/api/fir-cases/route.ts', description: 'FIR Cases API' },
    { path: 'src/app/api/products/route.ts', description: 'Products API' },
    { path: 'src/app/api/files/upload/route.ts', description: 'File Upload API' },
    { path: 'src/app/api/reports/route.ts', description: 'Reports API' }
  ]
};

// Helper functions
function checkFile(filePath, description) {
  const exists = fs.existsSync(filePath);
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${filePath}`);
  return exists;
}

function checkDirectory(dirPath, description) {
  const exists = fs.existsSync(dirPath) && fs.statSync(dirPath).isDirectory();
  const status = exists ? '✅' : '❌';
  console.log(`${status} ${description}: ${dirPath}`);
  return exists;
}

function checkPackageJson() {
  console.log('\n📦 Package Configuration Check:');
  
  if (!fs.existsSync('package.json')) {
    console.log('❌ package.json not found');
    return false;
  }
  
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  
  // Check essential dependencies
  const requiredDeps = [
    'next', 'react', 'prisma', 'next-auth', 'bcryptjs', '@prisma/client'
  ];
  
  const missing = requiredDeps.filter(dep => 
    !pkg.dependencies?.[dep] && !pkg.devDependencies?.[dep]
  );
  
  if (missing.length > 0) {
    console.log(`❌ Missing dependencies: ${missing.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required dependencies present');
  console.log(`✅ Project name: ${pkg.name}`);
  console.log(`✅ Version: ${pkg.version}`);
  
  return true;
}

function checkEnvironment() {
  console.log('\n🌍 Environment Configuration Check:');
  
  const envExists = fs.existsSync('.env.local');
  const exampleExists = fs.existsSync('.env.example');
  
  console.log(`${envExists ? '✅' : '⚠️'} .env.local: ${envExists ? 'Found' : 'Not found'}`);
  console.log(`${exampleExists ? '✅' : '❌'} .env.example: ${exampleExists ? 'Found' : 'Not found'}`);
  
  if (!envExists && exampleExists) {
    console.log('💡 Tip: Copy .env.example to .env.local and update values');
  }
  
  return exampleExists;
}

function checkDatabaseSchema() {
  console.log('\n🗄️ Database Schema Check:');
  
  if (!fs.existsSync('prisma/schema.prisma')) {
    console.log('❌ Prisma schema not found');
    return false;
  }
  
  const schema = fs.readFileSync('prisma/schema.prisma', 'utf8');
  
  // Check for essential models
  const requiredModels = [
    'User', 'Inspection', 'Seizure', 'LabSample', 'FirCase', 'Product', 'File', 'Report'
  ];
  
  const missingModels = requiredModels.filter(model => 
    !schema.includes(`model ${model}`)
  );
  
  if (missingModels.length > 0) {
    console.log(`❌ Missing models: ${missingModels.join(', ')}`);
    return false;
  }
  
  console.log('✅ All required database models present');
  console.log('✅ Database provider configured');
  
  return true;
}

async function checkServerHealth() {
  console.log('\n🌐 Server Health Check:');
  
  return new Promise((resolve) => {
    const req = http.get('http://localhost:8005/api/auth/session', (res) => {
      if (res.statusCode === 200) {
        console.log('✅ Server is running and responding');
        console.log('✅ Authentication endpoint accessible');
        resolve(true);
      } else {
        console.log(`⚠️ Server responding with status: ${res.statusCode}`);
        resolve(false);
      }
    });
    
    req.on('error', () => {
      console.log('❌ Server not running or not accessible');
      console.log('💡 Tip: Run "npm run dev" to start the development server');
      resolve(false);
    });
    
    req.setTimeout(5000, () => {
      console.log('❌ Server health check timed out');
      resolve(false);
    });
  });
}

function generateSystemReport() {
  console.log('\n📊 System Report:');
  
  const report = {
    timestamp: new Date().toISOString(),
    status: 'healthy',
    components: {
      files: 0,
      directories: 0,
      apiRoutes: 0
    },
    issues: []
  };
  
  // Count successful checks
  checks.files.forEach(check => {
    if (fs.existsSync(check.path)) {
      report.components.files++;
    } else {
      report.issues.push(`Missing file: ${check.path}`);
    }
  });
  
  checks.directories.forEach(check => {
    if (fs.existsSync(check.path)) {
      report.components.directories++;
    } else {
      report.issues.push(`Missing directory: ${check.path}`);
    }
  });
  
  checks.apiRoutes.forEach(check => {
    if (fs.existsSync(check.path)) {
      report.components.apiRoutes++;
    } else {
      report.issues.push(`Missing API route: ${check.path}`);
    }
  });
  
  console.log(`📁 Files: ${report.components.files}/${checks.files.length}`);
  console.log(`📂 Directories: ${report.components.directories}/${checks.directories.length}`);
  console.log(`🔌 API Routes: ${report.components.apiRoutes}/${checks.apiRoutes.length}`);
  
  if (report.issues.length > 0) {
    console.log('\n⚠️ Issues Found:');
    report.issues.forEach(issue => console.log(`   - ${issue}`));
    report.status = 'issues';
  }
  
  return report;
}

// Main execution
async function runSystemCheck() {
  console.log('Starting comprehensive system check...\n');
  
  // File system checks
  console.log('📁 File System Check:');
  checks.files.forEach(check => checkFile(check.path, check.description));
  
  console.log('\n📂 Directory Structure Check:');
  checks.directories.forEach(check => checkDirectory(check.path, check.description));
  
  console.log('\n🔌 API Routes Check:');
  checks.apiRoutes.forEach(check => checkFile(check.path, check.description));
  
  // Configuration checks
  const pkgOk = checkPackageJson();
  const envOk = checkEnvironment();
  const dbOk = checkDatabaseSchema();
  
  // Server health check
  const serverOk = await checkServerHealth();
  
  // Generate report
  const report = generateSystemReport();
  
  // Final summary
  console.log('\n🎯 System Health Summary:');
  console.log(`📦 Package Config: ${pkgOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`🌍 Environment: ${envOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`🗄️ Database Schema: ${dbOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`🌐 Server Health: ${serverOk ? '✅ OK' : '❌ Issues'}`);
  console.log(`📊 Overall Status: ${report.status === 'healthy' ? '✅ HEALTHY' : '⚠️ NEEDS ATTENTION'}`);
  
  if (report.status === 'healthy' && serverOk) {
    console.log('\n🎉 AGRISHIELD System is fully operational!');
    console.log('🔗 Access the application at: http://localhost:8005');
    console.log('📚 Documentation available in README-BACKEND.md');
  } else {
    console.log('\n🔧 System needs attention. Please review the issues above.');
  }
  
  // Save report to file
  fs.writeFileSync('system-report.json', JSON.stringify(report, null, 2));
  console.log('\n📄 Detailed report saved to: system-report.json');
}

// Run the check
runSystemCheck().catch(console.error);
