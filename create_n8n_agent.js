const http = require('http');

const payload = {
  name: "AI Store Agent",
  settings: {},
  nodes: [
    {
      parameters: {
        httpMethod: "POST",
        path: "whatsapp-ai",
        responseMode: "onReceived",
        options: {}
      },
      id: "webhook",
      name: "WhatsApp Webhook",
      type: "n8n-nodes-base.webhook",
      typeVersion: 1.1,
      position: [0, 0]
    },
    {
      parameters: {
        text: "={{ $json.body.message }}",
        options: {
          systemMessage: "أنت موظف مبيعات ذكي لمنصة Menura. مهمتك جمع 5 معلومات: اسم المتجر، العنوان، رقم الهاتف، رابط الشعار، اسم الرابط المفضل. اسأل عن معلومة واحدة في كل مرة بأسلوب ودي جداً. لا تسأل عن كل المعلومات دفعة واحدة. بعد جمعها كلها، استخدم أداة CreateStoreAPI لتمرير هذه البيانات."
        }
      },
      id: "agent",
      name: "AI Agent",
      type: "@n8n/n8n-nodes-langchain.agent",
      typeVersion: 1.6,
      position: [250, 0]
    },
    {
      parameters: {
        modelName: "models/gemini-1.5-flash"
      },
      id: "model",
      name: "Gemini Chat Model",
      type: "@n8n/n8n-nodes-langchain.lmChatGoogleGemini",
      typeVersion: 1,
      position: [200, 200]
    },
    {
      parameters: {
        sessionId: "={{ $node['WhatsApp Webhook'].json.body.phone }}"
      },
      id: "memory",
      name: "Window Buffer Memory",
      type: "@n8n/n8n-nodes-langchain.memoryBufferWindow",
      typeVersion: 1.2,
      position: [350, 200]
    },
    {
      parameters: {
        name: "CreateStoreAPI",
        description: "Call this tool to create a store when you have all 5 parameters. Parameters required: store_name, address, phone_number, logo_url, store_slug.",
        method: "POST",
        url: "https://menura.site/api/n8n/create-store",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: "Bearer my-super-secret-n8n-key-123"
            }
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={\n  \"store_name\": \"{{$fromAI('store_name')}}\",\n  \"address\": \"{{$fromAI('address')}}\",\n  \"phone_number\": \"{{$fromAI('phone_number')}}\",\n  \"logo_url\": \"{{$fromAI('logo_url')}}\",\n  \"store_slug\": \"{{$fromAI('store_slug')}}\"\n}"
      },
      id: "tool",
      name: "Create Store API Tool",
      type: "@n8n/n8n-nodes-langchain.toolHttpRequest",
      typeVersion: 1.1,
      position: [500, 200]
    },
    {
      parameters: {
        method: "POST",
        url: "http://209.38.197.49:3000/api/send",
        sendHeaders: true,
        headerParameters: {
          parameters: [
            {
              name: "Authorization",
              value: "Bearer 42ee3e2654f38487bbe02fe681b0ad9e1cff68aa680997a6a28b3d06b11a5790"
            }
          ]
        },
        sendBody: true,
        specifyBody: "json",
        jsonBody: "={\n  \"phone\": \"{{$node['WhatsApp Webhook'].json.body.phone}}\",\n  \"message\": \"{{$json.output}}\"\n}"
      },
      id: "reply",
      name: "WhatsApp Reply",
      type: "n8n-nodes-base.httpRequest",
      typeVersion: 4.1,
      position: [500, 0]
    }
  ],
  connections: {
    "WhatsApp Webhook": {
      "main": [
        [
          {
            "node": "AI Agent",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Gemini Chat Model": {
      "ai_languageModel": [
        [
          {
            "node": "AI Agent",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "Window Buffer Memory": {
      "ai_memory": [
        [
          {
            "node": "AI Agent",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Create Store API Tool": {
      "ai_tool": [
        [
          {
            "node": "AI Agent",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "AI Agent": {
      "main": [
        [
          {
            "node": "WhatsApp Reply",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  }
};

const options = {
  hostname: '167.71.49.217',
  port: 5678,
  path: '/api/v1/workflows',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('CREATE SUCCESS:', data));
});

req.on('error', (e) => {
  console.error('Request Error:', e);
});

req.write(JSON.stringify(payload));
req.end();
