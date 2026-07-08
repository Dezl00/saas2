const fs = require('fs');
const path = require('path');

const baseImports = `"use server";\n\nimport { prisma } from "@/lib/prisma";\nimport { auth } from "@/lib/auth";\nimport { revalidatePath } from "next/cache";\n`;

function splitActionFile(filePath, customImports = '') {
  if (!fs.existsSync(filePath)) return;
  
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const actionsDir = path.join(dir, 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    fs.mkdirSync(actionsDir);
  }

  // Regex to match exported functions
  const regex = /export async function (\w+)\s*\(([\s\S]*?^})/gm;
  
  let match;
  const createdFiles = [];
  
  while ((match = regex.exec(content)) !== null) {
    const funcName = match[1];
    const funcBody = match[0];
    
    // Create new file for the function
    const fileName = funcName.replace(/([A-Z])/g, '-$1').toLowerCase() + '.ts';
    const newFilePath = path.join(actionsDir, fileName);
    
    const fileContent = `${baseImports}${customImports}\n${funcBody}\n`;
    fs.writeFileSync(newFilePath, fileContent);
    createdFiles.push({ funcName, fileName });
    console.log(`Created ${newFilePath}`);
  }
  
  return createdFiles;
}

// Split coupons
splitActionFile(
  path.join(__dirname, 'src/app/(dashboard)/dashboard/marketing/coupons/actions.ts'),
  'import { CouponType } from "@prisma/client";\n'
);

// Split banners
splitActionFile(
  path.join(__dirname, 'src/app/(dashboard)/dashboard/marketing/banners/actions.ts')
);

// After splitting, we need to update the imports in components that use them.
// Let's print the created files to know what to update.
console.log("Done splitting.");
