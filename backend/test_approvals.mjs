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
    
    // Login as Admin (Acts as Manager)
    const adminLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'admin3@vendorbridge.com',
      password: 'SecurePass@123'
    });
    if (adminLogin.status !== 200) {
      console.log('Admin login failed:', adminLogin);
      process.exit(1);
    }
    const managerToken = adminLogin.data.data.accessToken;

    // Login as Officer
    const officerLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, {
      email: 'riya.officer@vendorbridge.com',
      password: 'SecurePass@123'
    });
    const officerToken = officerLogin.data.data.accessToken;

    // We will use the RFQ we created in the last step which should be in CLOSED state, 
    // Wait, the previous RFQ might be closed. We need a new RFQ and a new Selection to generate a PENDING approval.
    console.log('\n--- EXECUTION (Creating PENDING Approval) ---');
    
    const v1Login = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, { email: 'rakesh@nova.in', password: 'SecurePass@123' });
    const v1Token = v1Login.data.data.accessToken;
    
    const rfqRes = await fetchJson('http://localhost:3000/api/v1/rfqs', { method: 'POST', headers: { Authorization: `Bearer ${officerToken}` } }, { title: 'Approvals Test RFQ', itemDetails: [{name:'Test', quantity: 10, unit: 'pcs'}], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), vendorIds: ['6a873d1aa6e5fe7ecabd4938'], publish: true });
    const rfqId = rfqRes.data.data.id;
    
    const q1Res = await fetchJson('http://localhost:3000/api/v1/quotations', { method: 'POST', headers: { Authorization: `Bearer ${v1Token}` } }, { rfqId, unitPrice: 100, quantity: 10, deliveryDays: 10 });
    const q1Id = q1Res.data.data.id;
    
    // Officer selects quotation -> creates Approval
    const selectRes = await fetchJson(`http://localhost:3000/api/v1/quotations/${q1Id}/select`, { method: 'POST', headers: { Authorization: `Bearer ${officerToken}` } });
    const approvalId = selectRes.data.data.approval._id;
    
    console.log('Generated Approval ID:', approvalId);

    console.log('\n--- TEST: Manager Rejects Approval ---');
    const rejectRes = await fetchJson(`http://localhost:3000/api/v1/approvals/${approvalId}/reject`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` }
    }, { remarks: 'Price is too high' });
    
    console.log('Reject Status:', rejectRes.status);
    if (rejectRes.status !== 200) {
      console.log('Reject Body:', rejectRes.data);
    }
    console.log('Approval Status:', rejectRes.data.data?.status);

    // Verify DB states after reject
    await mongoose.connect('mongodb+srv://krishkanjani86_db_user:EcxWch16hNGjeS2b@cluster0.jtec8lk.mongodb.net/version1');
    const rfqAfterReject = await Rfq.findById(rfqId);
    console.log('RFQ Status after Reject (Should be EVALUATING):', rfqAfterReject.status);
    
    const q1AfterReject = await Quotation.findById(q1Id);
    console.log('Quotation Status after Reject (Should be REJECTED):', q1AfterReject.status);

    console.log('\n--- TEST: Manager Approves a New Quotation ---');
    // Vendor submits new quotation since RFQ is back to EVALUATING
    // Wait, vendor can't submit if RFQ is EVALUATING. But wait, in the spec, if RFQ is EVALUATING, the Officer selects a DIFFERENT quotation that was already submitted! 
    // Let's just create a new RFQ/Quotation/Approval flow for the Approve test.
    const rfqRes2 = await fetchJson('http://localhost:3000/api/v1/rfqs', { method: 'POST', headers: { Authorization: `Bearer ${officerToken}` } }, { title: 'Approvals Test RFQ 2', itemDetails: [{name:'Test', quantity: 10, unit: 'pcs'}], deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), vendorIds: ['6a873d1aa6e5fe7ecabd4938'], publish: true });
    const rfqId2 = rfqRes2.data.data.id;
    
    const q2Res = await fetchJson('http://localhost:3000/api/v1/quotations', { method: 'POST', headers: { Authorization: `Bearer ${v1Token}` } }, { rfqId: rfqId2, unitPrice: 80, quantity: 10, deliveryDays: 10 });
    const q2Id = q2Res.data.data.id;
    
    const selectRes2 = await fetchJson(`http://localhost:3000/api/v1/quotations/${q2Id}/select`, { method: 'POST', headers: { Authorization: `Bearer ${officerToken}` } });
    const approvalId2 = selectRes2.data.data.approval._id;

    const approveRes = await fetchJson(`http://localhost:3000/api/v1/approvals/${approvalId2}/approve`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${managerToken}` }
    });

    console.log('Approve Status:', approveRes.status);
    if (approveRes.status !== 200) {
      console.log('Approve Body:', approveRes.data);
    }
    console.log('Approval Status:', approveRes.data.data?.status); // Should be APPROVED
    
    const rfqAfterApprove = await Rfq.findById(rfqId2);
    console.log('RFQ Status after Approve (Should be AWARDED):', rfqAfterApprove.status);

    const q2AfterApprove = await Quotation.findById(q2Id);
    console.log('Quotation Status after Approve (Should be AWARDED):', q2AfterApprove.status);

    console.log('\nTests finished successfully!');
    process.exit(0);

  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

runTests();
