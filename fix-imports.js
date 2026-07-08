const fs = require('fs');

const replacements = [
  // Admin
  {
    file: 'src/app/(admin)/admin/payment-requests/[id]/components/ProcessButtons.tsx',
    find: `from "../actions"`,
    replace: `from "../../actions"`
  },
  {
    file: 'src/app/(admin)/admin/payment-requests/[id]/page.tsx',
    find: `from "./ProcessButtons"`,
    replace: `from "./components/ProcessButtons"`
  },
  {
    file: 'src/app/(admin)/admin/plans/[id]/page.tsx',
    find: `from "../new/PlanForm"`,
    replace: `from "../new/components/PlanForm"`
  },
  {
    file: 'src/app/(admin)/admin/plans/new/components/PlanForm.tsx',
    find: `from "../actions"`,
    replace: `from "../../actions"`
  },
  {
    file: 'src/app/(admin)/admin/plans/new/page.tsx',
    find: `from "./PlanForm"`,
    replace: `from "./components/PlanForm"`
  },
  {
    file: 'src/app/(admin)/admin/stores/components/StoreActions.tsx',
    find: `from "./new/actions"`,
    replace: `from "../new/actions"`
  },
  {
    file: 'src/app/(admin)/admin/stores/page.tsx',
    find: `from "./StoreActions"`,
    replace: `from "./components/StoreActions"`
  },
  {
    file: 'src/app/(admin)/admin/stores/page.tsx',
    find: `from "./StoreTabs"`,
    replace: `from "./components/StoreTabs"`
  },
  {
    file: 'src/app/(admin)/admin/users/components/UserDeleteButton.tsx',
    find: `from "./actions"`,
    replace: `from "../actions"`
  },
  {
    file: 'src/app/(admin)/admin/users/components/UserToggleStatus.tsx',
    find: `from "./actions"`,
    replace: `from "../actions"`
  },
  {
    file: 'src/app/(admin)/admin/users/page.tsx',
    find: `from "./UserToggleStatus"`,
    replace: `from "./components/UserToggleStatus"`
  },
  {
    file: 'src/app/(admin)/admin/users/page.tsx',
    find: `from "./UserDeleteButton"`,
    replace: `from "./components/UserDeleteButton"`
  },

  // Dashboard
  {
    file: 'src/app/(dashboard)/dashboard/catalog/categories/components/CategoriesClient.tsx',
    find: `from "./actions"`,
    replace: `from "../actions"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/catalog/categories/page.tsx',
    find: `from "./CategoriesClient"`,
    replace: `from "./components/CategoriesClient"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/catalog/import-export/page.tsx',
    find: `from "./ImportExportClient"`,
    replace: `from "./components/ImportExportClient"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/marketing/banners/components/BannersClient.tsx',
    find: `from "./actions"`,
    replace: `from "../actions"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/marketing/banners/page.tsx',
    find: `from "./BannersClient"`,
    replace: `from "./components/BannersClient"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/marketing/push-notifications/page.tsx',
    find: `from "./PushNotificationsClient"`,
    replace: `from "./components/PushNotificationsClient"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/orders/[orderId]/page.tsx',
    find: `from "./ClientOrderMasterDetail"`,
    replace: `from "../components/OrderMasterDetail"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/orders/[orderId]/page.tsx',
    find: `<ClientOrderMasterDetail`,
    replace: `<OrderMasterDetail`
  },
  {
    file: 'src/app/(dashboard)/dashboard/orders/components/OrderMasterDetail.tsx',
    find: `export function ClientOrderMasterDetail`,
    replace: `export function OrderMasterDetail`
  },
  {
    file: 'src/app/(dashboard)/dashboard/settings/appearance/components/AppearanceClient.tsx',
    find: `from "./actions"`,
    replace: `from "../actions"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/settings/appearance/page.tsx',
    find: `from "./AppearanceClient"`,
    replace: `from "./components/AppearanceClient"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/settings/billing/[planId]/components/CheckoutForm.tsx',
    find: `from "../actions"`,
    replace: `from "../../actions"`
  },
  {
    file: 'src/app/(dashboard)/dashboard/settings/billing/[planId]/page.tsx',
    find: `from "./CheckoutForm"`,
    replace: `from "./components/CheckoutForm"`
  },

  // Shared
  {
    file: 'src/components/dashboard/AIMenuScanner.tsx',
    find: `@/app/(dashboard)/dashboard/menu/ai-actions`,
    replace: `@/app/(dashboard)/dashboard/catalog/actions/import-ai-items`
  },
  {
    file: 'src/components/dashboard/CustomDomainWizard.tsx',
    find: `@/app/(dashboard)/dashboard/settings/domain-actions`,
    replace: `@/app/(dashboard)/dashboard/settings/domains/actions`
  },
  {
    file: 'src/components/dashboard/MenuItemForm.tsx',
    find: `@/app/(dashboard)/dashboard/menu/actions`,
    replace: `@/app/(dashboard)/dashboard/catalog/actions`
  },
  {
    file: 'src/components/dashboard/MenuItemsGrid.tsx',
    find: `@/app/(dashboard)/dashboard/menu/actions`,
    replace: `@/app/(dashboard)/dashboard/catalog/actions`
  }
];

replacements.forEach(rep => {
  if (fs.existsSync(rep.file)) {
    let content = fs.readFileSync(rep.file, 'utf8');
    content = content.replace(new RegExp(rep.find.replace(/[.*+?^\${}()|[\]\\]/g, '\\$&'), 'g'), rep.replace);
    fs.writeFileSync(rep.file, content);
    console.log(`Updated ${rep.file}`);
  } else {
    console.log(`Not found: ${rep.file}`);
  }
});
