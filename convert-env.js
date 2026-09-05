const fs = require('fs');
const env = fs.readFileSync('c:/xampp/htdocs/saas/.env', 'utf8');
const secrets = {};
env.split('\n').forEach(line => {
  const m = line.match(/^([^=]+)=(.*)$/);
  if(m) {
    let v = m[2].trim();
    if(v.startsWith('"') && v.endsWith('"')) v = v.slice(1, -1);
    v = v.replace(/\\n/g, '\n');
    secrets[m[1].trim()] = v;
  }
});
fs.writeFileSync('secrets.json', JSON.stringify(secrets, null, 2));
