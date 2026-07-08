const fs = require('fs');
const path = require('path');

const baseDir = path.join(__dirname, 'src', 'app');
const dashboardDir = path.join(baseDir, '(dashboard)', 'dashboard');
const adminDir = path.join(baseDir, '(admin)', 'admin');

const dirsToCreate = [
  'catalog/import-export/components'
];

dirsToCreate.forEach(dir => {
  const fullPath = path.join(dashboardDir, dir);
  if (!fs.existsSync(fullPath)) {
    fs.mkdirSync(fullPath, { recursive: true });
    console.log(`Created: ${fullPath}`);
  }
});

const filesToMove = [
  // Move import-export to catalog
  { from: 'settings/import-export/ImportExportClient.tsx', to: 'catalog/import-export/components/ImportExportClient.tsx', isDashboard: true },

  // Dashboard Settings components
  { from: 'settings/appearance/AppearanceClient.tsx', to: 'settings/appearance/components/AppearanceClient.tsx', isDashboard: true },
  { from: 'settings/billing/[planId]/CheckoutForm.tsx', to: 'settings/billing/[planId]/components/CheckoutForm.tsx', isDashboard: true },
  { from: 'settings/domain-actions.ts', to: 'settings/domains/actions.ts', isDashboard: true }, // will split later
  
  // Orders
  { from: 'orders/[orderId]/ClientOrderMasterDetail.tsx', to: 'orders/components/OrderMasterDetail.tsx', isDashboard: true },

  // Admin Stores
  { from: 'stores/StoreActions.tsx', to: 'stores/components/StoreActions.tsx', isDashboard: false },
  { from: 'stores/StoreTabs.tsx', to: 'stores/components/StoreTabs.tsx', isDashboard: false },
  
  // Admin Users
  { from: 'users/UserDeleteButton.tsx', to: 'users/components/UserDeleteButton.tsx', isDashboard: false },
  { from: 'users/UserToggleStatus.tsx', to: 'users/components/UserToggleStatus.tsx', isDashboard: false },
  
  // Admin Plans
  { from: 'plans/new/PlanForm.tsx', to: 'plans/new/components/PlanForm.tsx', isDashboard: false },
  
  // Admin Payment Requests
  { from: 'payment-requests/[id]/ProcessButtons.tsx', to: 'payment-requests/[id]/components/ProcessButtons.tsx', isDashboard: false },
];

filesToMove.forEach(file => {
  const basePath = file.isDashboard ? dashboardDir : adminDir;
  const fromPath = path.join(basePath, file.from);
  const toPath = path.join(basePath, file.to);
  
  if (fs.existsSync(fromPath)) {
    fs.renameSync(fromPath, toPath);
    console.log(`Moved: ${file.from} -> ${file.to}`);
  } else {
    console.log(`Not found: ${fromPath}`);
  }
});

// Clean up old directories
const dirsToRemove = [
  { path: 'menu/banners', isDashboard: true },
  { path: 'menu/coupons', isDashboard: true },
  { path: 'menu/categories', isDashboard: true },
  { path: 'menu', isDashboard: true },
  { path: 'settings/push-notifications', isDashboard: true },
  { path: 'settings/import-export', isDashboard: true }
];

dirsToRemove.forEach(dir => {
  const fullPath = path.join(dir.isDashboard ? dashboardDir : adminDir, dir.path);
  if (fs.existsSync(fullPath)) {
    try {
      fs.rmdirSync(fullPath);
      console.log(`Removed dir: ${fullPath}`);
    } catch (e) {
      console.log(`Could not remove dir (might not be empty): ${fullPath}`);
    }
  }
});

console.log("File movements completed.");
