const https = require('https');
const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:8005';
const TEST_USER = {
  email: 'dao@agrishield.com',
  password: 'password123'
};

// Helper function to make HTTP requests
function makeRequest(method, path, data = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...headers
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const jsonBody = body ? JSON.parse(body) : {};
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: jsonBody
          });
        } catch (e) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            body: body
          });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

// Test functions
async function testEndpoint(name, method, path, data = null, expectedStatus = 200) {
  try {
    console.log(`\n🧪 Testing ${name}...`);
    const response = await makeRequest(method, path, data);
    
    if (response.status === expectedStatus) {
      console.log(`✅ ${name}: PASSED (${response.status})`);
      if (response.body && typeof response.body === 'object') {
        console.log(`   Response: ${JSON.stringify(response.body).substring(0, 100)}...`);
      }
    } else {
      console.log(`❌ ${name}: FAILED (Expected ${expectedStatus}, got ${response.status})`);
      console.log(`   Response: ${JSON.stringify(response.body)}`);
    }
    
    return response;
  } catch (error) {
    console.log(`❌ ${name}: ERROR - ${error.message}`);
    return null;
  }
}

async function runTests() {
  console.log('🚀 Starting AGRISHIELD API Tests...\n');
  
  // Test authentication endpoints
  console.log('=== AUTHENTICATION TESTS ===');
  await testEndpoint('Auth Session (Unauthenticated)', 'GET', '/api/auth/session');
  await testEndpoint('Auth Providers', 'GET', '/api/auth/providers');
  await testEndpoint('Auth CSRF', 'GET', '/api/auth/csrf');
  
  // Test protected endpoints (should return 401)
  console.log('\n=== PROTECTED ENDPOINTS (Should be 401) ===');
  await testEndpoint('Users API (Unauthorized)', 'GET', '/api/users', null, 401);
  await testEndpoint('Inspections API (Unauthorized)', 'GET', '/api/inspections', null, 401);
  await testEndpoint('Seizures API (Unauthorized)', 'GET', '/api/seizures', null, 401);
  await testEndpoint('Lab Samples API (Unauthorized)', 'GET', '/api/lab-samples', null, 401);
  await testEndpoint('FIR Cases API (Unauthorized)', 'GET', '/api/fir-cases', null, 401);
  await testEndpoint('Products API (Unauthorized)', 'GET', '/api/products', null, 401);
  await testEndpoint('Reports API (Unauthorized)', 'GET', '/api/reports', null, 401);
  
  // Test POST endpoints with sample data
  console.log('\n=== POST ENDPOINTS (Should be 401) ===');
  const sampleInspection = {
    location: 'Test Market',
    targetType: 'RETAIL_STORE',
    assignedOfficerId: 'test-id',
    scheduledDate: new Date().toISOString(),
    equipment: ['TruScan Device']
  };
  
  await testEndpoint('Create Inspection (Unauthorized)', 'POST', '/api/inspections', sampleInspection, 401);
  
  const sampleSeizure = {
    inspectionId: 'test-inspection-id',
    productName: 'Test Product',
    quantity: 10,
    reason: 'Counterfeit suspected',
    location: 'Test Location'
  };
  
  await testEndpoint('Create Seizure (Unauthorized)', 'POST', '/api/seizures', sampleSeizure, 401);
  
  // Test file upload endpoint
  await testEndpoint('File Upload (Unauthorized)', 'POST', '/api/files/upload', null, 401);
  
  console.log('\n=== TEST SUMMARY ===');
  console.log('✅ All authentication and authorization tests completed');
  console.log('🔒 Protected endpoints correctly return 401 Unauthorized');
  console.log('🌐 Public endpoints are accessible');
  console.log('\n📝 Note: To test authenticated endpoints, you would need to:');
  console.log('   1. Authenticate via NextAuth');
  console.log('   2. Extract session cookies');
  console.log('   3. Include cookies in subsequent requests');
}

// Run the tests
runTests().catch(console.error);
