import http from 'http';
import fs from 'fs';

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

    console.log('\n--- EXECUTION (Generating RFQ -> Quote -> Approval -> PO) ---');
    const rfqRes = await fetchJson('http://localhost:3000/api/v1/rfqs', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }, { title: 'Invoice Test RFQ', itemDetails: [{name:'Laptop', quantity: 5, unit: 'pcs'}], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), vendorIds: ['6a873d1aa6e5fe7ecabd4938'], publish: true });
    const rfqId = rfqRes.data.data.id;
    
    const qRes = await fetchJson('http://localhost:3000/api/v1/quotations', { method: 'POST', headers: { Authorization: `Bearer ${v1Token}` } }, { rfqId, unitPrice: 1000, quantity: 5, deliveryDays: 14 });
    const qId = qRes.data.data.id;
    
    const selectRes = await fetchJson(`http://localhost:3000/api/v1/quotations/${qId}/select`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    const approvalId = selectRes.data.data.approval._id;
    
    await fetchJson(`http://localhost:3000/api/v1/approvals/${approvalId}/approve`, { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } });
    const poRes = await fetchJson('http://localhost:3000/api/v1/purchase-orders', { method: 'POST', headers: { Authorization: `Bearer ${adminToken}` } }, { approvalId });
    const poId = poRes.data.data._id;
    await fetchJson(`http://localhost:3000/api/v1/purchase-orders/${poId}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${v1Token}` } }, { status: 'ACKNOWLEDGED' });

    console.log('PO Status: ACKNOWLEDGED');

    console.log('\n--- TEST: Vendor Generates Invoice ---');
    const invRes = await fetchJson('http://localhost:3000/api/v1/invoices', {
      method: 'POST',
      headers: { Authorization: `Bearer ${v1Token}` }
    }, { purchaseOrderId: poId, taxRate: 10 });
    
    console.log('Generate Invoice Status:', invRes.status);
    if (invRes.status !== 201) console.log(invRes.data);
    const invoiceId = invRes.data.data._id;
    console.log('Invoice ID:', invoiceId);
    console.log('Invoice Number:', invRes.data.data.invoiceNumber);
    console.log('Invoice Subtotal:', invRes.data.data.subtotal);
    console.log('Invoice Tax Amount:', invRes.data.data.taxAmount);
    console.log('Invoice Total Amount:', invRes.data.data.totalAmount);
    console.log('Invoice Status:', invRes.data.data.status);

    console.log('\n--- TEST: Generate PDF Stream ---');
    const pdfRes = await fetchJson(`http://localhost:3000/api/v1/invoices/${invoiceId}/pdf`, {
      method: 'GET',
      headers: { Authorization: `Bearer ${adminToken}` }
    });

    console.log('PDF Status:', pdfRes.status);
    console.log('Content-Type:', pdfRes.headers['content-type']);
    if (pdfRes.status === 200 && pdfRes.headers['content-type'] === 'application/pdf') {
      fs.writeFileSync('test-invoice.pdf', pdfRes.buffer);
      console.log('PDF successfully saved to test-invoice.pdf (Size:', pdfRes.buffer.length, 'bytes)');
    } else {
      console.log('Failed to generate PDF:', pdfRes.data);
    }

    console.log('\n--- TEST: Send Invoice Email ---');
    const sendRes = await fetchJson(`http://localhost:3000/api/v1/invoices/${invoiceId}/send`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${v1Token}` }
    });

    console.log('Send Email Status:', sendRes.status);
    if (sendRes.status === 200) {
      console.log('Ethereal Preview URL:', sendRes.data.data.emailResult.previewUrl);
      console.log('New Invoice Status:', sendRes.data.data.invoice.status);
    } else {
      console.log('Send Email Error:', sendRes.data);
    }

    console.log('\n--- TEST: Mark as Paid ---');
    const paidRes = await fetchJson(`http://localhost:3000/api/v1/invoices/${invoiceId}/status`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${adminToken}` }
    }, { status: 'PAID' });
    console.log('Paid Status:', paidRes.status);
    console.log('Final Status:', paidRes.data.data?.status);


    console.log('\nTests finished successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

runTests();
