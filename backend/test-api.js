const https = require('https');

const API_URL = 'https://zvc196ajpj.execute-api.us-east-1.amazonaws.com/prod';

const makeRequest = (path, method = 'GET', data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(API_URL + path);
    const options = {
      hostname: url.hostname,
      port: 443,
      path: url.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };

    if (data) {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

async function testAPIs() {
  console.log('🧪 Testing TaskAI Cash APIs...\n');

  // Test AI endpoint
  console.log('1. Testing AI task generation...');
  try {
    const aiResponse = await makeRequest('/ai', 'POST', {
      category: 'surveys',
      difficulty: 'easy'
    });
    console.log('✅ AI API Status:', aiResponse.status);
    console.log('📝 Generated tasks:', aiResponse.data.tasks?.length || 0);
  } catch (error) {
    console.log('❌ AI API Error:', error.message);
  }

  console.log('\n2. Testing Tasks endpoint...');
  try {
    const tasksResponse = await makeRequest('/tasks', 'GET');
    console.log('✅ Tasks API Status:', tasksResponse.status);
    console.log('📋 Response:', tasksResponse.data);
  } catch (error) {
    console.log('❌ Tasks API Error:', error.message);
  }

  console.log('\n3. Testing Auth signup...');
  try {
    const authResponse = await makeRequest('/auth/signup', 'POST', {
      email: 'test@example.com',
      password: 'TestPass123!',
      name: 'Test User'
    });
    console.log('✅ Auth API Status:', authResponse.status);
    console.log('👤 Response:', authResponse.data);
  } catch (error) {
    console.log('❌ Auth API Error:', error.message);
  }

  console.log('\n🎉 API testing completed!');
}

testAPIs();