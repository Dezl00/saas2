import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus } from "lucide-react";
import { MenuItemForm } from "@/components/dashboard/MenuItemForm";
import { AIMenuScanner } from "@/components/dashboard/AIMenuScanner";
import { MenuItemsGrid } from "@/components/dashboard/MenuItemsGrid";
import { Pagination } from "@/components/ui/Pagination";
import { notFound } from "next/navigation";

export const metadata = {
  title: "إدارة المنيو | لوحة التحكم",
};

export const maxDuration = 60;

export default async function MenuPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = 12;
  
  const session = await auth();
  
  if (!session?.user?.storeId) {
    notFound();
  }

  const [totalItems, categories] = await Promise.all([
    prisma.menuItem.count({ where: { storeId: session.user.storeId } }),
    prisma.category.findMany({
      where: { storeId: session.user.storeId },
      orderBy: { sortOrder: 'asc' }
    })
  ]);

  const totalPages = Math.ceil(totalItems / pageSize);

  const menuItems = await prisma.menuItem.findMany({
    where: { storeId: session.user.storeId },
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

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <AIMenuScanner />
      </div>
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* نموذج إضافة صنف */}
        <div className="xl:col-span-1">
          <div className="bg-surface-50 border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
            <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              إضافة صنف جديد
            </h3>
            
            {categories.length === 0 ? (
              <div className="p-4 bg-warning-50 text-warning-800 rounded-2xl text-sm font-bold border-2 border-warning-100 leading-relaxed">
                يجب إضافة "قسم" واحد على الأقل قبل إضافة الأصناف. يرجى الذهاب لصفحة الأقسام أولاً.
              </div>
            ) : (
              <MenuItemForm categories={categories.map(c => ({ id: c.id, name: c.name }))} />
            )}
          </div>
        </div>

        {/* قائمة الأصناف */}
        <div className="xl:col-span-2">
          <MenuItemsGrid menuItems={menuItems} categories={categories.map(c => ({ id: c.id, name: c.name }))} />
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

