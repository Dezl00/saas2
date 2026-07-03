const http = require('http');

const payload = {
  name: "Gemini API Key",
  type: "googleGeminiApi",
  data: {
    apiKey: "YOUR_API_KEY_HERE"
  }
};

const options = {
  hostname: '167.71.49.217',
  port: 5678,
  path: '/api/v1/credentials',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('CREDENTIAL RESPONSE:', data));
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(JSON.stringify(payload));
req.end();
