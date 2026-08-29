import http from 'http';

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
          resolve(JSON.parse(data));
        } catch (e) {
          resolve(data);
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
    console.log('1. Login as Officer...');
    const loginRes = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'riya.officer@vendorbridge.com',
      password: 'SecurePass@123'
    });
    const token = loginRes.data.accessToken;
    console.log('Login Success');

    console.log('\n2. Create DRAFT RFQ...');
    const createRes = await fetchJson('http://localhost:3000/api/v1/rfqs', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      title: 'Procurement of Server Racks',
      description: 'Need 10 server racks for the new datacenter',
      itemDetails: [
        { name: 'Server Rack 42U', quantity: 10, unit: 'units' }
      ],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      publish: false
    });
    console.log('Create Response:', JSON.stringify(createRes, null, 2));
    const rfqId = createRes.data.id;

    console.log('\n3. Assign Vendors...');
    // I know that Nova Electronics is `6a873d1aa6e5fe7ecabd4938`
    const assignRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/vendors`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    }, {
      vendorIds: ['6a873d1aa6e5fe7ecabd4938']
    });
    console.log('Assign Response:', JSON.stringify(assignRes, null, 2));

    console.log('\n4. Publish RFQ...');
    const publishRes = await fetchJson(`http://localhost:3000/api/v1/rfqs/${rfqId}/publish`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Publish Response:', JSON.stringify(publishRes, null, 2));

    console.log('\n5. List RFQs...');
    const listRes = await fetchJson('http://localhost:3000/api/v1/rfqs', {
      method: 'GET',
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('List RFQs Count:', listRes.data.length);
  } catch (error) {
    console.error('Test Error:', error);
  }
};

runTests();
