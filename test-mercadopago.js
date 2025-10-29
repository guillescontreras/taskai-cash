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

async function testMercadoPago() {
  console.log('🇦🇷 Testing MercadoPago Integration...\n');

  // 1. Test payout request
  console.log('1. 💰 Testing payout request...');
  const payoutResponse = await makeRequest('/payments/payout', 'POST', {
    amount: 15000, // $150 ARS in centavos
    cbu: '1234567890123456789012',
    accountHolder: 'Juan Pérez Test'
  });
  
  console.log(`Status: ${payoutResponse.status}`);
  if (payoutResponse.data.message) {
    console.log(`Message: ${payoutResponse.data.message}`);
  }
  if (payoutResponse.data.transferId) {
    console.log(`Transfer ID: ${payoutResponse.data.transferId}`);
  }
  if (payoutResponse.data.error) {
    console.log(`Error: ${payoutResponse.data.error}`);
  }

  console.log('\n2. 📋 Testing payment history...');
  const historyResponse = await makeRequest('/payments/history', 'GET');
  console.log(`Status: ${historyResponse.status}`);
  console.log(`Records: ${historyResponse.data.history?.length || 0}`);

  console.log('\n🎉 MercadoPago test completed!');
  console.log('\n📝 Datos de prueba MercadoPago:');
  console.log('Tarjeta: 4509 9535 6623 3704');
  console.log('Vencimiento: 11/25');
  console.log('CVV: 123');
  console.log('Nombre: APRO (para aprobar)');
}

testMercadoPago().catch(console.error);