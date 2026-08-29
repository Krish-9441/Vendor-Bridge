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
      const isJson = res.headers['content-type'] && res.headers['content-type'].includes('application/json');
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buffer = Buffer.concat(data);
        if (isJson) {
          try {
            resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(buffer.toString()) });
          } catch (e) {
            resolve({ status: res.statusCode, headers: res.headers, data: buffer.toString() });
          }
        } else {
          resolve({ status: res.statusCode, headers: res.headers, buffer });
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
    
    // Login as Admin
    const adminLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, { email: 'admin3@vendorbridge.com', password: 'SecurePass@123' });
    const adminToken = adminLogin.data.data.accessToken;

    // Login as Vendor 1
    const v1Login = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, { email: 'rakesh@nova.in', password: 'SecurePass@123' });
    const v1Token = v1Login.data.data.accessToken;

    console.log('\n--- EXECUTION (Generating RFQ -> Quote -> Approval) ---');
    const rfqRes = await fetchJson('http://localhost:3000/api/v1/rfqs', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }, { title: 'PO Test RFQ', itemDetails: [{name:'Laptop', quantity: 5, unit: 'pcs'}], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), vendorIds: ['6a873d1aa6e5fe7ecabd4938'], publish: true });
    const rfqId = rfqRes.data.data.id;
    
    const qRes = await fetchJson('http://localhost:3000/api/v1/quotations', { method: 'POST', headers: { Authorization: `Bearer ${v1Token}` } }, { rfqId, unitPrice: 1000, quantity: 5, deliveryDays: 14 });
    const qId = qRes.data.data.id;
    
    const selectRes = await fetchJson(`http://localhost:3000/api/v1/quotations/${qId}/select`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    const approvalId = selectRes.data.data.approval._id;
    
    const approveRes = await fetchJson(`http://localhost:3000/api/v1/approvals/${approvalId}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });

    console.log('Approval Status:', approveRes.data.data.status);

    console.log('\n--- TEST: Officer Generates PO ---');
    const poRes = await fetchJson('http://localhost:3000/api/v1/purchase-orders', {
      method: 'POST',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { approvalId });
    
    console.log('Generate PO Status:', poRes.status);
    if (poRes.status !== 201) console.log(poRes.data);
    const poId = poRes.data.data._id;
    console.log('PO ID:', poId);
    console.log('PO Number:', poRes.data.data.poNumber);
    console.log('PO Status:', poRes.data.data.status);

    console.log('\n--- TEST: Vendor Acknowledges PO ---');
    const ackRes = await fetchJson(`http://localhost:3000/api/v1/purchase-orders/${poId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${v1Token}` }
    }, { status: 'ACKNOWLEDGED' });
    
    console.log('Ack Status:', ackRes.status);
    console.log('PO Status:', ackRes.data.data?.status);

    console.log('\n--- TEST: Generate PDF Stream ---');
    const pdfRes = await fetchJson(`http://localhost:3000/api/v1/purchase-orders/${poId}/pdf`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('PDF Status:', pdfRes.status);
    console.log('Content-Type:', pdfRes.headers['content-type']);
    if (pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf') {
      fs.writeFileSync('test-po.pdf', pdfRes.buffer);
      console.log('PDF successfully saved to test-po.pdf (Size:', pdfRes.buffer.length, 'bytes)');
    } else {
      console.log('Failed to generate PDF:', pdfRes.data);
    }

    console.log('\nTests finished successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

runTests();
