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
      headers: { 'Content-Type': 'application/json' }
    };

    if (data) {
      options.headers['Content-Length'] = Buffer.byteLength(JSON.stringify(data));
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(body) });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
};

async function testAllAPIs() {
  console.log('🧪 Testing TaskAI Cash Complete APIs...\n');

  // 1. AI Task Generation
  console.log('1. 🤖 Testing AI task generation...');
  const aiResponse = await makeRequest('/ai', 'POST', {
    category: 'surveys',
    difficulty: 'easy'
  });
  console.log(`Status: ${aiResponse.status}`);
  console.log(`Tasks generated: ${aiResponse.data.tasks?.length || 0}\n`);

  // 2. Ad Monetization
  console.log('2. 📱 Testing ad configuration...');
  const adConfigResponse = await makeRequest('/ads/config', 'GET');
  console.log(`Status: ${adConfigResponse.status}`);
  console.log(`Ad units available: ${Object.keys(adConfigResponse.data.adUnits || {}).length}\n`);

  // 3. Ad Reward
  console.log('3. 💰 Testing ad reward...');
  const adRewardResponse = await makeRequest('/ads/reward', 'POST', {
    adType: 'rewarded',
    adId: 'test-ad-123',
    watchTime: 30
  });
  console.log(`Status: ${adRewardResponse.status}`);
  console.log(`Reward: $${(adRewardResponse.data.reward || 0) / 100}\n`);

  // 4. Payment History
  console.log('4. 💳 Testing payment history...');
  const paymentHistoryResponse = await makeRequest('/payments/history', 'GET');
  console.log(`Status: ${paymentHistoryResponse.status}`);
  console.log(`Payment records: ${paymentHistoryResponse.data.history?.length || 0}\n`);

  // 5. Notifications
  console.log('5. 🔔 Testing notifications...');
  const notificationResponse = await makeRequest('/notifications/subscribe', 'POST', {
    deviceToken: 'test-device-token-123',
    platform: 'web'
  });
  console.log(`Status: ${notificationResponse.status}`);
  console.log(`Message: ${notificationResponse.data.message}\n`);

  // 6. Analytics
  console.log('6. 📊 Testing analytics...');
  const analyticsResponse = await makeRequest('/analytics', 'POST', {
    userId: 'test-user-123',
    eventType: 'app_opened',
    properties: {
      platform: 'web',
      version: '1.0.0'
    }
  });
  console.log(`Status: ${analyticsResponse.status}`);
  console.log(`Event tracked: ${analyticsResponse.data.eventType}\n`);

  console.log('🎉 All API tests completed!');
}

testAllAPIs().catch(console.error);