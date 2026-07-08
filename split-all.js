const fs = require('fs');
const path = require('path');

const baseImports = `"use server";\n\nimport { prisma } from "@/lib/prisma";\nimport { auth } from "@/lib/auth";\nimport { revalidatePath } from "next/cache";\n`;

function toKebabCase(str) {
  return str.replace(/([A-Z])/g, '-$1').toLowerCase();
}

function processActionFile(filePath, extraImports = '') {
  if (!fs.existsSync(filePath)) {
      console.log(`Not found: ${filePath}`);
      return [];
  }
  
  const content = fs.readFileSync(filePath, 'utf8');
  const dir = path.dirname(filePath);
  const actionsDir = path.join(dir, 'actions');
  
  if (!fs.existsSync(actionsDir)) {
    fs.mkdirSync(actionsDir, { recursive: true });
  }

  // Find all exported functions
  const regex = /export async function (\w+)\s*\(([\s\S]*?^})/gm;
  
  let match;
  const createdFiles = [];
  
  // also find all imports in the original file to put them in the new file, 
  // but it's simpler to just grab all top level imports (except use server).
  const importsRegex = /^import\s+.*?from\s+['"].*?['"];/gm;
  let allImports = '';
  let importMatch;
  while ((importMatch = importsRegex.exec(content)) !== null) {
      allImports += importMatch[0] + '\n';
  }

  while ((match = regex.exec(content)) !== null) {
    const funcName = match[1];
    const funcBody = match[0];
    
    const fileName = toKebabCase(funcName) + '.ts';
    const newFilePath = path.join(actionsDir, fileName);
    
    // Combine standard imports + any extra imports that were in the original file
    // To avoid duplicates we could parse them, but for now we just dump allImports
    const fileContent = `"use server";\n\n${allImports}\n${funcBody}\n`;
    fs.writeFileSync(newFilePath, fileContent);
    createdFiles.push({ funcName, fileName, originalPath: filePath });
    console.log(`Created ${newFilePath}`);
  }
  
  // delete original actions.ts
  fs.unlinkSync(filePath);
  
  return createdFiles;
}

const filesToProcess = [
  'src/app/(dashboard)/dashboard/catalog/actions.ts',
  'src/app/(dashboard)/dashboard/catalog/categories/actions.ts',
  'src/app/(dashboard)/dashboard/settings/actions.ts',
  'src/app/(dashboard)/dashboard/settings/domains/actions.ts',
  'src/app/(dashboard)/dashboard/settings/billing/actions.ts',
  'src/app/(admin)/admin/plans/actions.ts',
  'src/app/(admin)/admin/users/actions.ts',
  'src/app/(admin)/admin/stores/actions.ts',
  'src/app/(admin)/admin/stores/new/actions.ts',
  'src/app/(admin)/admin/payment-requests/actions.ts',
  'src/app/(dashboard)/dashboard/orders/actions.ts'
];

let allCreated = [];

filesToProcess.forEach(f => {
    const full = path.join(__dirname, f);
    allCreated = allCreated.concat(processActionFile(full));
});

// Phase 2: find all tsx files and replace the imports
function updateImports(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            updateImports(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let modified = false;

            // Simple brute force: for each created action, if the file imports it from an actions.ts
            // import { x, y } from ".../actions" -> we split them.
            // A safer regex replacement:
            // Find any import that ends with /actions or ./actions or ../actions
            const importStmtRegex = /import\s+{([^}]+)}\s+from\s+['"]([^'"]*?\/actions|[^'"]*?actions)['"];/g;
            
            let match;
            let replacements = [];
            while ((match = importStmtRegex.exec(content)) !== null) {
                const importedItems = match[1].split(',').map(s => s.trim()).filter(s => s);
                const importPath = match[2];
                
                let newImports = '';
                let hasMatched = false;
                
                for (const item of importedItems) {
                    const found = allCreated.find(c => c.funcName === item);
                    if (found) {
                        hasMatched = true;
                        // Determine new path
                        // e.g. importPath is "../actions"
                        // new path is "../actions/file-name"
                        let newImportPath = importPath;
                        if (importPath.endsWith('actions')) {
                             newImportPath = importPath + '/' + found.fileName.replace('.ts', '');
                        }
                        newImports += `import { ${item} } from "${newImportPath}";\n`;
                    } else {
                        // Keep it as is if it wasn't an action we split
                        newImports += `import { ${item} } from "${importPath}";\n`;
                    }
                }
                
                if (hasMatched) {
                    replacements.push({ original: match[0], replacement: newImports.trim() });
                }
            }
            
            if (replacements.length > 0) {
                for (const rep of replacements) {
                    content = content.replace(rep.original, rep.replacement);
                }
                fs.writeFileSync(fullPath, content);
                console.log(`Updated imports in ${fullPath}`);
            }
        }
    }
}

updateImports(path.join(__dirname, 'src'));

console.log("All actions split and imports updated.");
