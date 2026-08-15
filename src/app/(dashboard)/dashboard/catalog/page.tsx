import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AIMenuScanner } from "@/components/dashboard/AIMenuScanner";
import { ImportExportButtons } from "@/components/dashboard/ImportExportButtons";
import { CategoryFilter } from "@/components/dashboard/CategoryFilter";
import { CatalogClient } from "./components/CatalogClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "إدارة المنيو | لوحة التحكم",
};

export const maxDuration = 60;

export default async function MenuPage(props: { searchParams: Promise<{ page?: string; edit?: string; category?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <CategoryFilter categories={categories.map(c => ({ id: c.id, name: c.name }))} />
        <div className="flex items-center gap-2">
          <ImportExportButtons />
          <AIMenuScanner />
        </div>
      </div>
      
      <CatalogClient 
        menuItems={menuItems} 
        categories={categories.map(c => ({ id: c.id, name: c.name }))} 
        storeId={session.user.storeId} 
        totalPages={totalPages} 
      />
    </div>
  );
}
