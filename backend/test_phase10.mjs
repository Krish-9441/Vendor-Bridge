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
      res.on('end', () => resolve({ status: res.statusCode, data: data ? JSON.parse(data) : {} }));
    });

    req.on('error', reject);
    if (body) req.write(JSON.stringify(body));
    req.end();
  });
};

const runTests = async () => {
  try {
    console.log('--- SETUP ---');
    const adminLogin = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, { email: 'admin3@vendorbridge.com', password: 'SecurePass@123' });
    const adminToken = adminLogin.data.data.accessToken;

    const v1Login = await fetchJson('http://localhost:3000/api/v1/auth/login', { method: 'POST' }, { email: 'rakesh@nova.in', password: 'SecurePass@123' });
    const v1Token = v1Login.data.data.accessToken;

    console.log('\n--- TEST: Notifications (Vendor) ---');
    // Fetch notifications
    const notifs = await fetchJson('http://localhost:3000/api/v1/notifications', { method: 'GET', headers: { Authorization: `Bearer ${v1Token}` } });
    console.log('Get Notifications Status:', notifs.status);
    console.log(`Found ${notifs.data.data?.notifications?.length || 0} notifications.`);
    
    const unreadCount = await fetchJson('http://localhost:3000/api/v1/notifications/unread-count', { method: 'GET', headers: { Authorization: `Bearer ${v1Token}` } });
    console.log('Unread Count:', unreadCount.data.data?.count);

    if (notifs.data.data?.notifications?.length > 0) {
      const firstId = notifs.data.data.notifications[0]._id;
      const readRes = await fetchJson(`http://localhost:3000/api/v1/notifications/${firstId}/read`, { method: 'PATCH', headers: { Authorization: `Bearer ${v1Token}` } });
      console.log('Mark One as Read Status:', readRes.status);
      console.log('Notification isRead:', readRes.data.data?.isRead);
      
      const readAllRes = await fetchJson(`http://localhost:3000/api/v1/notifications/read-all`, { method: 'PATCH', headers: { Authorization: `Bearer ${v1Token}` } });
      console.log('Mark All as Read Status:', readAllRes.status);
      console.log('Updated Count:', readAllRes.data.data?.updatedCount);
    }

    console.log('\n--- TEST: Activity Logs (Admin) ---');
    const logsRes = await fetchJson('http://localhost:3000/api/v1/activity-logs', { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
    console.log('Get Activity Logs Status:', logsRes.status);
    console.log(`Found ${logsRes.data.data?.logs?.length || 0} logs.`);
    
    if (logsRes.data.data?.logs?.length > 0) {
      const entityType = logsRes.data.data.logs[0].entityType;
      const entityId = logsRes.data.data.logs[0].entityId;
      console.log(`Testing get logs for entity ${entityType} - ${entityId}`);
      
      const entityLogsRes = await fetchJson(`http://localhost:3000/api/v1/activity-logs/${entityType}/${entityId}`, { method: 'GET', headers: { Authorization: `Bearer ${adminToken}` } });
      console.log('Get Entity Logs Status:', entityLogsRes.status);
      console.log(`Found ${entityLogsRes.data.data?.length || 0} logs for entity.`);
    }

    console.log('\nTests finished successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Script Error:', err);
    process.exit(1);
  }
};

runTests();
