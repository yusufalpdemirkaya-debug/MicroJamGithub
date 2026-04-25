const http = require('http');
const crypto = require('crypto');

const SECRET_KEY = 'DIH'; // Must match server.js
const HOST = 'localhost';
const PORT = 3000;

const payload = {
    username: 'SpeedyAnt_76' + Math.floor(Math.random() * 1000),
    time: '01:00', // MM:SS format
    timestamp: Math.floor(Date.now() / 1000)
};

// Generate signature: HMAC-SHA256(username + time + timestamp, secret)
const message = `${payload.username}${payload.time}${payload.timestamp}`;
payload.signature = crypto
    .createHmac('sha256', SECRET_KEY)
    .update(message)
    .digest('hex');

const data = JSON.stringify(payload);

const options = {
    hostname: HOST,
    port: PORT,
    path: '/stats',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
        'Content-Length': data.length
    }
};

const req = http.request(options, (res) => {
    console.log(`Status Code: ${res.statusCode}`);
    res.on('data', (d) => {
        process.stdout.write(d);
    });
});

req.on('error', (error) => {
    console.error('Error connecting to backend. Is server.js running?');
    console.error(error);
});

console.log('Sending test score to leaderboard...');
req.write(data);
req.end();