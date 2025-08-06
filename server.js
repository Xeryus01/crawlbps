const express = require('express');
const fetch = require('node-fetch');
const fs = require('fs');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/rules-scrap.json', (req, res) => {
  const rulesPath = './rules scrap.json';
  res.setHeader('Access-Control-Allow-Origin', '*'); // <-- tambahkan baris ini
  if (fs.existsSync(rulesPath)) {
    res.setHeader('Content-Type', 'application/json');
    res.send(fs.readFileSync(rulesPath, 'utf8'));
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.post('/add-rule', (req, res) => {
  const { url, xpath } = req.body;
  const rulesPath = './rules scrap.json';
  let rules = [];
  if (fs.existsSync(rulesPath)) {
    rules = JSON.parse(fs.readFileSync(rulesPath));
  }
  if (!rules.some(rule => rule.url === url && rule.xpath === xpath)) {
    rules.push({ url, xpath });
    fs.writeFileSync(rulesPath, JSON.stringify(rules, null, 2));
    res.json({ success: true });
  } else {
    res.json({ success: false, message: 'Rule sudah ada.' });
  }
});

app.get('/proxy', async (req, res) => {
  const url = req.query.url;
  console.log(`Received request to proxy URL: ${url}`);
  try {
    // Forward headers and cookies from client if available
    const headers = {
      'User-Agent': req.headers['user-agent'] || 'Mozilla/5.0',
      'Accept': req.headers['accept'] || 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': req.headers['accept-language'] || 'en-US,en;q=0.5',
      'Referer': req.headers['referer'] || url,
      'Cookie': req.headers['cookie'] || ''
    };

    const response = await fetch(url, { headers });
    console.log(`Fetching URL: ${url} with headers:`, headers);
    const text = await response.text();
    console.log(`Response status: ${response.status}, content-type: ${response.headers.get('content-type')}`);

    // Forward response headers (except some restricted ones)
    res.set('Access-Control-Allow-Origin', '*');
    res.set('Content-Type', response.headers.get('content-type') || 'text/html');
    res.send(text);
  } catch (err) {
    res.status(500).send('Proxy error');
    console.error(`Error fetching URL: ${url}`, err);
  }
});

app.listen(3000, () => console.log('Proxy server running on port 3000'));