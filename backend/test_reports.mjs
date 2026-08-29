import http from 'http';
import fs from 'fs';

const fetchRaw = (url, options) => {
  return new Promise((resolve, reject) => {
    const req = http.request(url, options, (res) => {
      const isJson = res.headers['content-type']?.includes('application/json');
      let data = [];
      res.on('data', chunk => data.push(chunk));
      res.on('end', () => {
        const buf = Buffer.concat(data);
        resolve({
          status: res.statusCode,
          contentType: res.headers['content-type'],
          data: isJson ? JSON.parse(buf.toString()) : buf.toString()
        });
      });
    });
    req.on('error', reject);
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('--- SETUP ---');
    const login = await fetchRaw('http://localhost:3000/api/v1/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    // Re-fetch with body
    const token = await new Promise((res, rej) => {
      const req = http.request('http://localhost:3000/api/v1/auth/login', { method: 'POST', headers: { 'Content-Type': 'application/json' } }, (r) => {
        let d = ''; r.on('data', c => d += c); r.on('end', () => res(JSON.parse(d).data.accessToken));
      });
      req.on('error', rej);
      req.write(JSON.stringify({ email: 'admin3@vendorbridge.com', password: 'SecurePass@123' }));
      req.end();
    });
    const AUTH = { Authorization: `Bearer ${token}` };

    console.log('\n--- TEST: GET /reports/dashboard-summary ---');
    const dash = await fetchRaw('http://localhost:3000/api/v1/reports/dashboard-summary', { headers: AUTH });
    console.log('Status:', dash.status, '| Keys:', Object.keys(dash.data.data || {}).join(', '));

    console.log('\n--- TEST: GET /reports/spend ---');
    const spend = await fetchRaw('http://localhost:3000/api/v1/reports/spend', { headers: AUTH });
    console.log('Status:', spend.status);
    console.log('Rows:', JSON.stringify(spend.data.data?.slice(0, 2), null, 2));

    console.log('\n--- TEST: GET /reports/vendor-performance ---');
    const perf = await fetchRaw('http://localhost:3000/api/v1/reports/vendor-performance', { headers: AUTH });
    console.log('Status:', perf.status);
    console.log('Rows:', JSON.stringify(perf.data.data?.slice(0, 2), null, 2));

    console.log('\n--- TEST: GET /reports/trends ---');
    const trends = await fetchRaw('http://localhost:3000/api/v1/reports/trends', { headers: AUTH });
    console.log('Status:', trends.status);
    console.log('Rows:', JSON.stringify(trends.data.data?.slice(0, 3), null, 2));

    console.log('\n--- TEST: GET /reports/spend?format=csv ---');
    const spendCsv = await fetchRaw('http://localhost:3000/api/v1/reports/spend?format=csv', { headers: AUTH });
    console.log('Status:', spendCsv.status, '| Content-Type:', spendCsv.contentType);
    console.log('CSV Preview (first 300 chars):');
    console.log(spendCsv.data.slice(0, 300));
    fs.writeFileSync('spend-analytics.csv', spendCsv.data, 'utf8');
    console.log('Saved to spend-analytics.csv');

    console.log('\n--- TEST: GET /reports/vendor-performance?format=csv ---');
    const perfCsv = await fetchRaw('http://localhost:3000/api/v1/reports/vendor-performance?format=csv', { headers: AUTH });
    console.log('Status:', perfCsv.status, '| Content-Type:', perfCsv.contentType);
    fs.writeFileSync('vendor-performance.csv', perfCsv.data, 'utf8');
    console.log('Saved to vendor-performance.csv');

    console.log('\n--- TEST: GET /reports/trends?format=csv ---');
    const trendsCsv = await fetchRaw('http://localhost:3000/api/v1/reports/trends?format=csv', { headers: AUTH });
    console.log('Status:', trendsCsv.status, '| Content-Type:', trendsCsv.contentType);
    fs.writeFileSync('procurement-trends.csv', trendsCsv.data, 'utf8');
    console.log('Saved to procurement-trends.csv');

    console.log('\nAll Phase 11 tests finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
};

runTests();
