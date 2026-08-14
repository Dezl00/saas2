import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { AIMenuScanner } from "@/components/dashboard/AIMenuScanner";
import { MenuItemsTable } from "@/components/dashboard/MenuItemsTable";
import { ImportExportButtons } from "@/components/dashboard/ImportExportButtons";
import { CategoryFilter } from "@/components/dashboard/CategoryFilter";
import { Pagination } from "@/components/ui/Pagination";
import { notFound } from "next/navigation";

export const metadata = {
  title: "إدارة المنيو | لوحة التحكم",
};

export const maxDuration = 60;

export default async function MenuPage(props: { searchParams: Promise<{ page?: string; edit?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const editItemId = searchParams.edit;
  const categoryId = searchParams.category;
  const pageSize = 12;
  
  const session = await auth();
  
  if (!session?.user?.storeId) {
    notFound();
  }

  // Build the where clause based on filters
  const whereClause: any = { storeId: session.user.storeId };
  if (categoryId && categoryId !== 'all') {
    whereClause.categoryId = categoryId;
  }

  const [totalItems, categories] = await Promise.all([
    prisma.menuItem.count({ where: whereClause }),
    prisma.category.findMany({
      where: { storeId: session.user.storeId },
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const menuItems = await prisma.menuItem.findMany({
    where: whereClause,
    orderBy: [
      { category: { sortOrder: 'asc' } },
      { sortOrder: 'asc' },
      { createdAt: 'asc' },
      { id: 'asc' }
    ],
    include: { category: true, sizes: true, addons: true },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  const editItem = editItemId ? await prisma.menuItem.findUnique({
    where: { id: editItemId, storeId: session.user.storeId },
    include: { sizes: true, addons: true }
  }) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryFilter categories={categories.map(c => ({ id: c.id, name: c.name }))} />
        <div className="flex items-center gap-2">
          <ImportExportButtons />
          <AIMenuScanner />
        </div>
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* نموذج إضافة / تعديل صنف */}
        <div className="xl:col-span-1">
          <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-36 shadow-sm">
            <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              {editItem ? "تعديل الصنف" : "إضافة صنف جديد"}
            </h3>
            
            {categories.length === 0 ? (
              <div className="p-4 bg-warning-50 text-warning-800 rounded-[24px] text-sm font-bold border-2 border-warning-100 leading-relaxed">
                يجب إضافة "قسم" واحد على الأقل قبل إضافة الأصناف. يرجى الذهاب لصفحة الأقسام أولاً.
              </div>
            ) : (
              <MenuItemForm 
                key={editItem ? editItem.id : 'new'}
                categories={categories.map(c => ({ id: c.id, name: c.name }))} 
                initialData={editItem ? {
                  ...editItem,
                  price: editItem.price.toString(),
                  sizes: editItem.sizes.map(s => ({ ...s, price: s.price.toString() })),
                  addons: editItem.addons.map(a => ({ ...a, price: a.price.toString() }))
                } : undefined}
              />
            )}
          </div>
        </div>

        {/* قائمة الأصناف */}
        <div className="xl:col-span-2">
          <MenuItemsTable 
            menuItems={menuItems} 
            categories={categories.map(c => ({ id: c.id, name: c.name }))} 
            storeId={session.user.storeId}
          />
          {totalPages > 1 && (
            <div className="mt-8">
              <Pagination totalPages={totalPages} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
