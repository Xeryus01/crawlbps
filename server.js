const express = require('express');
const fetch = require('node-fetch');
const app = express();

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
