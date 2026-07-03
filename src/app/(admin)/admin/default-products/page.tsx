import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { Plus, PackageSearch, Store } from "lucide-react";
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { AIMenuScanner } from "@/components/dashboard/AIMenuScanner";
import { MenuItemsGrid } from "@/components/dashboard/MenuItemsGrid";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import { createDefaultCategory, toggleDefaultCategoryStatus, deleteDefaultCategory } from "./actions";
import { DefaultProductsTabs } from "./DefaultProductsTabs";

export const metadata = {
  title: "المنتجات الافتراضية | لوحة الإدارة",
};

export const maxDuration = 60;

import { connection } from "next/server";

export default async function DefaultProductsPage(props: {
  searchParams: Promise<{ tab?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  // Ensure DEFAULT_STORE and its user exists
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@menura.site' },
    update: {},
    create: {
      email: 'system@menura.site',
      name: 'System Admin',
      password: 'none', // Dummy password, cannot login
      role: 'ADMIN',
      status: 'ACTIVE',
    }
  });

  await prisma.store.upsert({
    where: { id: 'DEFAULT_STORE' },
    update: {},
    create: {
      id: 'DEFAULT_STORE',
      name: 'المنتجات الافتراضية (النظام)',
      subdomain: 'default-system-template',
      userId: systemUser.id,
      type: 'RESTAURANT',
      showDefaultProducts: false, // System store itself doesn't show defaults
    }
  });

  const currentTab = searchParams.tab || 'menu';

  // Fetch DEFAULT_STORE data
  const [menuItems, categories, allStores] = await Promise.all([
    prisma.menuItem.findMany({
      where: { storeId: 'DEFAULT_STORE' },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'asc' },
        { id: 'asc' }
      ],
      include: { category: true, sizes: true, addons: true }
    }),
    prisma.category.findMany({
      where: { storeId: 'DEFAULT_STORE' },
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { items: true } } }
    }),
    prisma.store.findMany({
      where: { id: { not: 'DEFAULT_STORE' } },
      select: {
        id: true,
        name: true,
        subdomain: true,
        showDefaultProducts: true,
        categories: { select: { id: true } }
      },
      orderBy: { createdAt: 'desc' }
    })
  ]);

  return (
    <div className="animate-fade-in pb-10">
      <Breadcrumb title="إدارة المنتجات الافتراضية" />
      
      <p className="text-surface-500 mt-2 mb-6">
        هنا يمكنك إضافة أصناف وأقسام تظهر تلقائياً للمتاجر الجديدة، ويمكنك التحكم في تفعيل أو إيقاف هذه الميزة لكل متجر.
      </p>

      <DefaultProductsTabs currentTab={currentTab} />

      {currentTab === 'menu' && (
        <div className="mt-6 animate-fade-in">
          <div className="flex justify-end px-1 mb-6">
            <AIMenuScanner storeId="DEFAULT_STORE" />
          </div>
          
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
            {/* نموذج إضافة صنف */}
            <div className="xl:col-span-1">
              <div className="bg-surface-50 rounded-[32px] border-2 border-surface-100 p-6 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
                <h3 className="text-xl font-black text-surface-950 mb-6 flex items-center gap-2">
                  <Plus className="w-6 h-6 text-primary-500" />
                  إضافة صنف افتراضي
                </h3>
                
                {categories.length === 0 ? (
                  <div className="p-5 bg-primary-50 text-primary-800 rounded-2xl font-bold border-2 border-primary-100 mb-6">
                    يجب إضافة قسم واحد على الأقل للمتجر الافتراضي لكي تتمكن من إضافة أصناف.
                  </div>
                ) : null}

                <MenuItemForm 
                  storeId="DEFAULT_STORE"
                  categories={categories.map(c => ({ id: c.id, name: c.name }))} 
                />
              </div>
            </div>

            {/* قائمة الأصناف */}
            <div className="xl:col-span-2">
              <MenuItemsGrid 
                storeId="DEFAULT_STORE"
                menuItems={menuItems} 
                categories={categories.map(c => ({ id: c.id, name: c.name }))} 
              />
            </div>
          </div>
        </div>
      )}

      {currentTab === 'categories' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6 animate-fade-in">
          {/* Add Category Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl border border-surface-200 p-6 sticky top-6 max-h-[calc(100vh-2rem)] overflow-y-auto scrollbar-hide">
              <h3 className="text-lg font-bold text-surface-950 mb-4 flex items-center gap-2">
                <Plus className="w-5 h-5 text-primary-500" />
                إضافة قسم افتراضي
              </h3>
              
              <form action={createDefaultCategory as any} className="space-y-4">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-surface-950 mb-1">اسم القسم *</label>
                  <input type="text" id="name" name="name" required placeholder="مثال: مقبلات" className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-surface-950 mb-1">الوصف (اختياري)</label>
                  <textarea id="description" name="description" rows={2} className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                </div>
                <div>
                  <label htmlFor="sortOrder" className="block text-sm font-medium text-surface-950 mb-1">الترتيب</label>
                  <input type="number" id="sortOrder" name="sortOrder" defaultValue="0" className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none" />
                </div>
                <SubmitButton className="w-full py-2.5 px-4 bg-primary-600 hover:bg-primary-700 text-white rounded-xl font-bold transition-all">حفظ القسم</SubmitButton>
              </form>
            </div>
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-start">
                  <thead>
                    <tr className="bg-surface-50 border-b border-surface-200">
                      <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">اسم القسم</th>
                      <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">عدد الأصناف</th>
                      <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">الحالة</th>
                      <th className="px-6 py-4 text-end text-sm font-bold text-surface-950">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-surface-100">
                    {categories.length === 0 ? (
                      <tr><td colSpan={4} className="px-6 py-8 text-center text-surface-500">لا يوجد أقسام بعد.</td></tr>
                    ) : (
                      categories.map((category: any) => (
                        <tr key={category.id} className="hover:bg-surface-50/50 transition-colors">
                          <td className="px-6 py-4">
                            <p className="font-bold text-surface-950">{category.name}</p>
                            {category.description && <p className="text-xs text-surface-500 mt-1 line-clamp-1">{category.description}</p>}
                          </td>
                          <td className="px-6 py-4"><span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-surface-100 text-surface-800">{category._count?.items || 0} أصناف</span></td>
                          <td className="px-6 py-4">
                            <form action={toggleDefaultCategoryStatus.bind(null, category.id, category.isActive) as any}>
                                <button type="submit" className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${category.isActive ? 'bg-success-500' : 'bg-surface-300'}`}>
                                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${category.isActive ? '-translate-x-6' : '-translate-x-1'}`} />
                                </button>
                            </form>
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <DeleteConfirmButton action={deleteDefaultCategory.bind(null, category.id) as any} />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}

      {currentTab === 'stores' && (
        <div className="mt-6 bg-white rounded-2xl border border-surface-200 overflow-hidden animate-fade-in">
          <div className="overflow-x-auto">
            <table className="w-full text-start">
              <thead>
                <tr className="bg-surface-50 border-b border-surface-200">
                  <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">المتجر</th>
                  <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">الأقسام الحالية</th>
                  <th className="px-6 py-4 text-start text-sm font-bold text-surface-950">حالة المنتجات الافتراضية</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-100">
                {allStores.map((store) => (
                  <tr key={store.id} className="hover:bg-surface-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary-50 text-primary-600 flex items-center justify-center">
                          <Store className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="font-bold text-surface-950">{store.name}</p>
                          <p className="text-xs text-surface-500 dir-ltr text-left">
                            {store.subdomain}.menura.site
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center justify-center px-2 py-1 rounded-full text-xs font-bold bg-surface-100 text-surface-600">
                        {store.categories.length} أقسام
                      </span>
                      {store.categories.length > 0 && (
                        <p className="text-xs text-surface-400 mt-1">المنتجات الافتراضية مخفية حالياً (بسبب وجود أقسام خاصة)</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <form action={async () => {
                        "use server";
                        const { toggleStoreDefaultProducts } = await import("./actions");
                        await toggleStoreDefaultProducts(store.id, store.showDefaultProducts);
                      }}>
                        <button
                          type="submit"
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                            store.showDefaultProducts ? 'bg-success-500' : 'bg-surface-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              store.showDefaultProducts ? '-translate-x-6' : '-translate-x-1'
                            }`}
                          />
                        </button>
                      </form>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
