const http = require('http');

const options = {
  hostname: '167.71.49.217',
  port: 5678,
  path: '/api/v1/workflows/P41C3bhHxo75ep0m',
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    const workflow = JSON.parse(data);
    
    // Fix Memory Node
    const memoryNode = workflow.nodes.find(n => n.name === 'Window Buffer Memory');
    if (memoryNode) {
      memoryNode.parameters.sessionId = '={{ $json.body.phone }}';
    }

    // Fix Tool Node
    const toolNode = workflow.nodes.find(n => n.name === 'Create Store API Tool');
    if (toolNode) {
      toolNode.parameters.specifyBody = 'keypair';
      delete toolNode.parameters.jsonBody; // Remove old bad json body
      toolNode.parameters.bodyParameters = {
        parameters: [
          { name: 'store_name', value: '={{$fromAI("store_name", "The name of the store")}}' },
          { name: 'address', value: '={{$fromAI("address", "The address of the store")}}' },
          { name: 'phone_number', value: '={{$fromAI("phone_number", "The phone number of the store")}}' },
          { name: 'logo_url', value: '={{$fromAI("logo_url", "The logo URL link")}}' },
          { name: 'store_slug', value: '={{$fromAI("store_slug", "The URL slug for the store")}}' },
          { name: 'whatsapp_number', value: '={{$fromAI("whatsapp_number", "The whatsapp number of the store")}}' }
        ]
      };
    }

    const payload = {
      name: workflow.name,
      nodes: workflow.nodes,
      connections: workflow.connections,
      settings: {}
    };

    // Now PUT it back
    const putOptions = {
      hostname: '167.71.49.217',
      port: 5678,
      path: '/api/v1/workflows/P41C3bhHxo75ep0m',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
      }
    };

    const putReq = http.request(putOptions, (putRes) => {
      let putData = '';
      putRes.on('data', (c) => putData += c);
      putRes.on('end', () => console.log('UPDATE SUCCESS:', putData));
    });
    
    putReq.write(JSON.stringify(payload));
    putReq.end();
  });
});

req.end();
