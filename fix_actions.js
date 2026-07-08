const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = dir + '/' + file;
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk('src/app/(dashboard)/dashboard/catalog/categories/actions');
files.forEach(f => {
  let c = fs.readFileSync(f, 'utf8');
  let orig = c;
  c = c.replace(/revalidatePath\(\"\/dashboard\/menu\/categories\"\);/g, 'revalidatePath("/dashboard/catalog/categories");\n    revalidatePath("/dashboard/catalog");');
  c = c.replace(/\(revalidateTag as any\)\(\`store-\$\{session\.user\.storeId\}\`, \"default\"\);/g, '');
  if(c !== orig) fs.writeFileSync(f, c);
});
