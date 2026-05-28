const express = require('express');
const fetch = require('node-fetch');
const path = require('path');
require('dotenv').config();

const app = express();
const PORT = process.env.BACKEND_PORT || 3000;
const GORQ_KEY = process.env.GORQ_API_KEY || '';

app.use(express.json());

// Simple CORS allowing the configured front-end origin, if provided
const FRONT = process.env.FRONT_BASE_URL || '*';
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', FRONT);
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

// Proxy endpoint for Gorq AI
app.post('/api/gorq', async (req, res) => {
  try {
    const gorqUrl = process.env.GORQ_API_URL || 'https://api.gorq.ai/v1/generate';
    const headers = {'Content-Type': 'application/json'};
    if (GORQ_KEY) headers['Authorization'] = 'Bearer ' + GORQ_KEY;

    const gorqRes = await fetch(gorqUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(req.body)
    });

    const data = await gorqRes.text();
    // Try to return JSON, but preserve raw body if not JSON
    try { return res.status(gorqRes.status).json(JSON.parse(data)); }
    catch(_) { return res.status(gorqRes.status).send(data); }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Optional: serve static files (so you can host the HTML from the same server)
app.use(express.static(path.join(__dirname, '..')));

app.listen(PORT, () => {
  console.log(`Gorq proxy listening on http://0.0.0.0:${PORT}`);
});
