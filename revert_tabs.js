const fs = require('fs');

const files = [
  'src/app/(dashboard)/dashboard/settings/layout.tsx',
  'src/app/(dashboard)/dashboard/catalog/layout.tsx',
  'src/app/(dashboard)/dashboard/marketing/layout.tsx'
];

files.forEach(f => {
  if (fs.existsSync(f)) {
    let c = fs.readFileSync(f, 'utf8');
    
    // Replace the cn(...) part completely
    c = c.replace(/className=\{cn\([\s\S]*?\"flex items-center gap-2 px-6 py-2\.5 rounded-full text-sm font-bold transition-all whitespace-nowrap\",[\s\S]*?isActive[\s\S]*?\? \"bg-white text-primary-600 border border-surface-200\/60\"[\s\S]*?: \"text-surface-500 hover:text-surface-950 hover:bg-surface-200\/50\"[\s\S]*?\)\}/g, 'className={cn("flex items-center gap-2 px-5 py-2.5 rounded-2xl text-sm font-bold transition-all whitespace-nowrap", isActive ? "bg-primary-600 text-white" : "bg-surface-100 text-surface-600 hover:text-surface-950 hover:bg-surface-200")}');
    
    // Replace the icon
    c = c.replace(/className=\{cn\(\"w-4 h-4\", isActive \? \"text-primary-600\" : \"text-surface-400\"\)\}/g, 'className={cn("w-4 h-4", isActive ? "text-white" : "text-surface-500")}');
    
    // Replace the wrapper
    c = c.replace(/className=\"flex w-max gap-1 p-1\.5 bg-surface-100 rounded-full border border-surface-200\/50\"/g, 'className="flex w-max min-w-full gap-2"');
    
    fs.writeFileSync(f, c);
    console.log('Fixed ' + f);
  }
});
