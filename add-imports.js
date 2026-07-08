const fs = require('fs');

function prependToFile(file, code) {
  let content = fs.readFileSync(file, 'utf8');
  content = content.replace(/"use server";\r?\n/, `"use server";\n${code}\n`);
  fs.writeFileSync(file, content);
}

prependToFile('src/app/(admin)/admin/stores/new/actions/create-store-from-admin-action.ts', "import { createStoreSchema } from '@/lib/validations';");

const banners = ['create-banner', 'update-banner', 'delete-banner', 'toggle-banner-status'];
banners.forEach(b => {
  prependToFile(`src/app/(dashboard)/dashboard/marketing/banners/actions/${b}.ts`, "import { revalidateTag } from 'next/cache';\nimport { uploadImageToCloudinary } from '@/lib/cloudinary';");
});

const settings = ['update-contact-settings', 'update-store-settings', 'update-subdomain'];
settings.forEach(s => {
  prependToFile(`src/app/(dashboard)/dashboard/settings/actions/${s}.ts`, "import { revalidateTag } from 'next/cache';");
});
