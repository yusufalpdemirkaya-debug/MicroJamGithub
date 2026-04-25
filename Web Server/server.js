const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Security: Use a strong secret key. 
// This MUST be the same key used inside your game's source code.
const SECRET_KEY = 'DIH'; 

app.use(cors());
app.use(express.json());

// Serve static files (HTML, CSS, JS, etc.) from the current directory
app.use(express.static(__dirname));

// Serve main.html as the landing page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'main.html'));
});

// In-memory database for the project stand. 
// For a permanent solution, you would use SQLite or MongoDB.
let leaderboardData = [];

/**
 * GET /stats
 * Used by the website to fetch the leaderboard.
 */
app.get('/stats', (req, res) => {
    res.json(leaderboardData);
});

/**
 * POST /stats
 * Used by the game to submit a new completion time.
 */
app.post('/stats', (req, res) => {
    const { username, time, timestamp, signature } = req.body;

    // 1. Basic validation
    if (!username || !time || !timestamp || !signature) {
        return res.status(400).json({ error: 'Incomplete data.' });
    }

    // 2. Anti-Replay Check: Reject requests older than 2 minutes
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > 120) {
        return res.status(403).json({ error: 'Request expired. Check system clock.' });
    }

    // 3. Signature Verification (HMAC-SHA256)
    // We recreate the signature using the data received and our secret key.
    const message = `${username}${time}${timestamp}`;
    const expectedSignature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(message)
        .digest('hex');

    if (signature !== expectedSignature) {
        console.warn(`Unauthorized attempt from user: ${username}`);
        return res.status(403).json({ error: 'Invalid signature. Access denied.' });
    }

    // 4. Data is valid. Save it.
    leaderboardData.push({ username, time });
    console.log(`Score recorded: ${username} finished in ${time}`);

    res.status(201).json({ message: 'Success! Score recorded.' });
});

app.listen(PORT, () => console.log(`Atom Heart Ant Backend running on http://localhost:${PORT}`));