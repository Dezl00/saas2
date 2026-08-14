import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { Plus, PackageSearch, Store, Pencil } from "lucide-react";
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { AIMenuScanner } from "@/components/dashboard/AIMenuScanner";
import { MenuItemsTable } from "@/components/dashboard/MenuItemsTable";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import { DefaultCategoryForm } from "./DefaultCategoryForm";
import { createDefaultCategory, toggleDefaultCategoryStatus, deleteDefaultCategory } from "./actions";
import { OptimisticToggle } from "@/components/dashboard/OptimisticToggle";
import { DefaultProductsTabs } from "./DefaultProductsTabs";
import { ImageUpload } from "@/components/dashboard/ImageUpload";
import Link from "next/link";

export const metadata = {
  title: "المنتجات الافتراضية | لوحة الإدارة",
};

export const maxDuration = 60;

import { connection } from "next/server";

export default async function DefaultProductsPage(props: {
  searchParams: Promise<{ tab?: string; edit?: string; editCategory?: string }>;
}) {
  await connection();
  const searchParams = await props.searchParams;
  const session = await auth();
  
  if (!session?.user || session.user.role !== "ADMIN") {
    return null;
  }

  // Ensure DEFAULT_STORE and its user exists
  const systemUser = await prisma.user.upsert({
    where: { email: 'system@almenu.pro' },
    update: {},
    create: {
      email: 'system@almenu.pro',
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
  const editId = searchParams.edit;

  let editItem = null;
  if (editId) {
    editItem = await prisma.menuItem.findFirst({
      where: { id: editId as string, storeId: 'DEFAULT_STORE' },
      include: { sizes: true, addons: true }
    });
  }

  const editCategoryId = searchParams.editCategory;
  let editCategory = null;
  if (editCategoryId) {
    editCategory = await prisma.category.findFirst({
      where: { id: editCategoryId as string, storeId: 'DEFAULT_STORE' }
    });
  }

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
                  {editItem ? "تعديل الصنف الافتراضي" : "إضافة صنف افتراضي"}
                </h3>
                
                {categories.length === 0 ? (
                  <div className="p-5 bg-primary-50 text-primary-800 rounded-[24px] font-bold border-2 border-primary-100 mb-6">
                    يجب إضافة قسم واحد على الأقل للمتجر الافتراضي لكي تتمكن من إضافة أصناف.
                  </div>
                ) : null}

                <MenuItemForm 
                  key={editItem ? editItem.id : 'new'}
                  storeId="DEFAULT_STORE"
                  categories={categories.map(c => ({ id: c.id, name: c.name }))} 
                  initialData={editItem ? {
                    ...editItem,
                    price: editItem.price.toString(),
                    sizes: editItem.sizes.map((s: any) => ({ ...s, price: s.price.toString() })),
                    addons: editItem.addons.map((a: any) => ({ ...a, price: a.price.toString() }))
                  } : undefined}
                />
              </div>
            </div>

            {/* قائمة الأصناف */}
            <div className="xl:col-span-2">
              <MenuItemsTable 
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
            <DefaultCategoryForm editCategory={editCategory} />
          </div>

          {/* Categories List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden">
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
                            <OptimisticToggle 
                              initialStatus={category.isActive} 
                              action={async (status) => {
                                "use server";
                                return await toggleDefaultCategoryStatus(category.id, !status) as any;
                              }} 
                            />
                          </td>
                          <td className="px-6 py-4">
                            <div className="flex items-center justify-end gap-2">
                              <Link 
                                href={`/admin/default-products?tab=categories&editCategory=${category.id}`}
                                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-100 transition-colors text-surface-500"
                                title="تعديل القسم"
                              >
                                <Pencil className="w-4 h-4" />
                              </Link>
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
        <div className="mt-6 bg-white rounded-[24px] border border-surface-200 overflow-hidden animate-fade-in">
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
                            {store.subdomain}.almenu.pro
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
                      <OptimisticToggle
                        initialStatus={store.showDefaultProducts}
                        action={async (status) => {
                          "use server";
                          const { toggleStoreDefaultProducts } = await import("./actions");
                          return await toggleStoreDefaultProducts(store.id, !status) as any;
                        }}
                      />
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
