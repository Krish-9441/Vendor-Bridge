import http from 'http';
import fs from 'fs';
import path from 'path';

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

const runAllTests = async () => {
  try {
    console.log('--- STARTING COMPREHENSIVE RFQ TESTS ---');

    console.log('\n1. Login as Officer...');
    const loginRes = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'riya.officer@vendorbridge.com',
      password: 'SecurePass@123'
    });
    const token = loginRes.data.data.accessToken;
    console.log('Login Status:', loginRes.status);

    console.log('\n2. Create DRAFT RFQ...');
    const createRes = await fetchJson('http://localhost:3000/api/v1/rfqs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      title: 'Comprehensive Test RFQ',
      description: 'Testing all endpoints',
      itemDetails: [{ name: 'Test Item', quantity: 5, unit: 'pcs' }],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      publish: false
    });
    console.log('Create Status:', createRes.status);
    const rfqId = createRes.data.data.id;

    console.log('\n3. Get Single RFQ (GET /rfqs/:id)...');
    const getRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Get Single Status:', getRes.status);

    console.log('\n4. Update RFQ (PATCH /rfqs/:id)...');
    const updateRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      title: 'Updated Comprehensive Test RFQ'
    });
    console.log('Update Status:', updateRes.status);

    console.log('\n5. Assign Vendors (POST /rfqs/:id/vendors)...');
    const assignRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/vendors`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      vendorIds: ['6a873d1aa6e5fe7ecabd4938']
    });
    console.log('Assign Status:', assignRes.status);

    console.log('\n6. Upload Attachment (POST /rfqs/:id/attachments)...');
    // For raw HTTP multipart form data without a library
    const boundary = '----WebKitFormBoundary7MA4YWxkTrZu0gW';
    const postData = 
      '--' + boundary + '\r\n' +
      'Content-Disposition: form-data; name="file"; filename="test.txt"\r\n' +
      'Content-Type: text/plain\r\n\r\n' +
      'This is a test attachment file.\r\n' +
      '--' + boundary + '--\r\n';

    const attachRes = await new Promise((resolve) => {
      const req = http.request(`http://localhost:3000/api/v1/rfqs/${rfqId}/attachments`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
          'Content-Length': Buffer.byteLength(postData)
        }
      }, (res) => {
        let data = '';
        res.on('data', chunk => data += chunk);
        res.on('end', () => resolve({ status: res.statusCode, data: JSON.parse(data) }));
      });
      req.write(postData);
      req.end();
    });
    console.log('Attachment Status:', attachRes.status);

    console.log('\n7. Publish RFQ (POST /rfqs/:id/publish)...');
    const publishRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Publish Status:', publishRes.status);

    console.log('\n8. Cancel RFQ (POST /rfqs/:id/cancel)...');
    const cancelRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      reason: 'Testing cancellation flow'
    });
    console.log('Cancel Status:', cancelRes.status);

    console.log('\n--- ALL TESTS COMPLETED ---');

  } catch (error) {
    console.error('Test Error:', error);
  }
};

runAllTests();
