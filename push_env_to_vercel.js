const fs = require('fs');

async function pushEnvToVercel() {
  const envContent = fs.readFileSync('.env', 'utf-8');
  
  const extractEnv = (key) => {
    const match = envContent.match(new RegExp(`${key}="(.*?)"`)) || envContent.match(new RegExp(`${key}=(.*)`));
    return match ? match[1].trim() : null;
  };

  const VERCEL_TOKEN = extractEnv('VERCEL_ACCESS_TOKEN');
  const PROJECT_ID = extractEnv('VERCEL_PROJECT_ID');
  const PUBLIC_KEY = extractEnv('NEXT_PUBLIC_VAPID_PUBLIC_KEY');
  const PRIVATE_KEY = extractEnv('VAPID_PRIVATE_KEY');
  const SUBJECT = extractEnv('VAPID_SUBJECT');

  if (!VERCEL_TOKEN || !PROJECT_ID) {
    console.error("Vercel token or project ID missing");
    return;
  }

  const variablesToPush = [
    { key: "NEXT_PUBLIC_VAPID_PUBLIC_KEY", value: PUBLIC_KEY },
    { key: "VAPID_PRIVATE_KEY", value: PRIVATE_KEY },
    { key: "VAPID_SUBJECT", value: SUBJECT },
  ];

  for (const v of variablesToPush) {
    console.log(`Pushing ${v.key} to Vercel...`);
    const res = await fetch(`https://api.vercel.com/v9/projects/${PROJECT_ID}/env`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${VERCEL_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        key: v.key,
        value: v.value,
        type: 'plain',
        target: ['production', 'preview', 'development']
      })
    });
    
    if (res.ok) {
      console.log(`✅ Success: ${v.key}`);
    } else {
      const errorData = await res.json();
      if (errorData.error && errorData.error.code === 'ENV_ALREADY_EXISTS') {
         console.log(`ℹ️ ${v.key} already exists. Skipping.`);
      } else {
         console.error(`❌ Failed: ${v.key}`, errorData);
      }
    }
  }
}

pushEnvToVercel();
