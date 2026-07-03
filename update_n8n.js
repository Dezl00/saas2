const http = require('http');

const options = {
  hostname: '167.71.49.217',
  port: 5678,
  path: '/api/v1/workflows/dBgs1Zkxg3z8QHnR',
  method: 'GET',
  headers: {
    'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => {
    let workflow = JSON.parse(data);
    
    let geminiNode = workflow.nodes.find(n => n.name === 'Gemini AI (HTTP)');
    if (geminiNode) {
      geminiNode.parameters.jsonBody = "{\n  \"contents\": [\n    {\n      \"parts\": [\n        {\n          \"text\": \"أنت مساعد ذكي مخصص لتحليل رسائل العملاء لاستخراج تفاصيل المتاجر. اقرأ الرسالة التالية واستخرج البيانات بصيغة JSON حصراً تحتوي على: store_name, logo_url, address, phone_number, whatsapp_number, store_slug. الرسالة هي: {{$json.body.message.replace(/\\\"/g, \\\"'\\\").replace(/\\\\n/g, \\\" \\\")}}\"\n        }\n      ]\n    }\n  ],\n  \"generationConfig\": {\n    \"responseMimeType\": \"application/json\"\n  }\n}";
    }

    let replyNode = workflow.nodes.find(n => n.name === 'WhatsApp Reply (HTTP)');
    if (replyNode) {
      replyNode.parameters.jsonBody = "{\n  \"messaging_product\": \"whatsapp\",\n  \"to\": \"{{$node['WhatsApp Webhook'].json.body.phone}}\",\n  \"type\": \"text\",\n  \"text\": {\n    \"body\": \"مرحباً! تم إنشاء متجرك بنجاح 🚀\\nاسم المتجر: {{$json.data.storeName}}\\nرابط المتجر: {{$json.data.storeUrl}}\\nالبريد الإلكتروني للوحة التحكم: {{$json.data.adminEmail}}\\nكلمة المرور: {{$json.data.adminPassword}}\"\n  }\n}";
    }

    const payload = {
        name: workflow.name,
        nodes: workflow.nodes,
        connections: workflow.connections
    };

    const putOptions = {
      hostname: '167.71.49.217',
      port: 5678,
      path: '/api/v1/workflows/dBgs1Zkxg3z8QHnR',
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'X-N8N-API-KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiI1Y2JmZDM2Yi0wYTA5LTQ1YjEtOWRhMy04Zjc4NjA2MDkyOTYiLCJpc3MiOiJuOG4iLCJhdWQiOiJwdWJsaWMtYXBpIiwianRpIjoiNTFjOWI0ZTMtNzJmNS00ZjBhLThlN2ItZGNlMTllM2MyNzY2IiwiaWF0IjoxNzgyODk0MjI2fQ.Ec1r4k1KTLve64PWQRoEzLWV1itlmDtuEnm6clY5nvg'
      }
    };

    const putReq = http.request(putOptions, (putRes) => {
      let putData = '';
      putRes.on('data', (chunk) => putData += chunk);
      putRes.on('end', () => console.log('UPDATE SUCCESS:', putData));
    });

    putReq.write(JSON.stringify(payload));
    putReq.end();
  });
});
req.end();
