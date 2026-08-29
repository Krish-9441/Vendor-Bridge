import http from 'http';
import mongoose from 'mongoose';
import { Rfq } from './src/modules/rfq/rfq.model.js';
import { Quotation } from './src/modules/quotations/quotation.model.js';
import { Approval } from './src/modules/approvals/approval.model.js';

const fetchJson = (url, options, body = null) => {
  return new Promise((resolve, reject) => {
    const reqOptions = { ...options };
    if (body) {
      reqOptions.headers = { ...reqOptions.headers, 'Content-Type': 'application/json' };
    }
    
    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('--- SETUP ---');
    // Connect to DB for direct verification later
    await mongoose.connect('mongodb://localhost:27017/vendorbridge');
    // Note: Use direct MongoDB atlas URI if localhost is not correct, wait, localhost was working for nodemon but I should just use the atlas URI if the local node doesn't know it. Actually, I don't need mongoose for validation if the API returns enough data. But let's check it anyway.
    
    // Login as Officer
    const officerLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'riya.officer@vendorbridge.com',
      password: 'SecurePass@123'
    });
    const officerToken = officerLogin.data.data.accessToken;

    // Login as Vendor 1 (Nova Electronics: 6a873d1aa6e5fe7ecabd4938)
    const v1Login = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'rakesh@nova.in',
      password: 'SecurePass@123'
    });
    const v1Token = v1Login.data.data.accessToken;

    const randomEmail = `vendor2_${Date.now()}@test.com`;
    const v2Signup = await fetchJson('http://localhost:3000/api/v1/auth/signup', { method: 'POST' }, {
      name: 'Test Vendor 2',
      email: randomEmail,
      password: 'SecurePass@123',
      role: 'VENDOR',
      companyName: `Test Vendor 2 Inc ${Date.now()}`,
      gstNumber: `11ABCD${Date.now().toString().slice(-4)}F1Z1`,
      category: 'Test',
      phone: '1234567890'
    });
    console.log('Signup Result:', JSON.stringify(v2Signup, null, 2));
    
    
    // Admin needs to approve the vendor to be ACTIVE
    const adminLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'admin3@vendorbridge.com',
      password: 'SecurePass@123'
    });
    const adminToken = adminLogin.data.data.accessToken;
    
    await fetchJson(`http://localhost:3000/api/v1/vendors/${v2Signup.data.data.vendor.id}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { status: 'ACTIVE' });

    const v2Login = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: randomEmail,
      password: 'SecurePass@123'
    });
    const v2Token = v2Login.data.data.accessToken;
    const v2VendorId = v2Signup.data.data.vendor.id;

    console.log('\n--- EXECUTION ---');
    console.log('1. Officer Creates RFQ');
    const rfqRes = await fetchJson('http://localhost:3000/api/v1/rfqs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${officerToken}` }
    }, {
      title: 'Comparison Test RFQ',
      itemDetails: [{ name: 'Test', quantity: 10, unit: 'pcs' }],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      vendorIds: ['6a873d1aa6e5fe7ecabd4938', v2VendorId],
      publish: true
    });
    const rfqId = rfqRes.data.data.id;
    console.log('RFQ ID:', rfqId);

    console.log('\n2. Vendor 1 Submits (Lowest Price: 100, Delivery: 10 days)');
    const q1Res = await fetchJson('http://localhost:3000/api/v1/quotations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${v1Token}` }
    }, {
      rfqId, unitPrice: 100, quantity: 10, deliveryDays: 10
    });
    const q1Id = q1Res.data.data.id;

    console.log('\n3. Vendor 2 Submits (Price: 150, Fastest Delivery: 5 days)');
    const q2Res = await fetchJson('http://localhost:3000/api/v1/quotations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${v2Token}` }
    }, {
      rfqId, unitPrice: 150, quantity: 10, deliveryDays: 5
    });
    const q2Id = q2Res.data.data.id;

    console.log('\n4. Officer Fetches Comparison');
    const compareRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/compare`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${officerToken}` }
    });
    
    const comparison = compareRes.data.data;
    console.log('Metrics:', comparison.metrics);
    console.log('Q1 is Lowest Price?', comparison.quotations.find(q => q.id === q1Id).isLowestPrice);
    console.log('Q2 is Fastest Delivery?', comparison.quotations.find(q => q.id === q2Id).isFastestDelivery);

    console.log('\n--- VERIFICATION ---');
    console.log('Skipping selection to keep RFQ open for user testing.');
    process.exit(0);

  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

runTests();
