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

export default async function MenuPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    notFound();
  }

  const [categories, menuItems] = await Promise.all([
    prisma.category.findMany({
      where: { storeId: session.user.storeId },
      orderBy: { sortOrder: 'asc' }
    }),
    prisma.menuItem.findMany({
      where: { storeId: session.user.storeId },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'desc' }
      ],
      include: { category: true, sizes: true, addons: true }
    })
  ]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* We will move the category filter and search into CatalogClient for instant client-side filtering */}
        <div className="flex items-center gap-2 mr-auto">
          <ImportExportButtons />
          <AIMenuScanner />
        </div>
      </div>
      
      <CatalogClient 
        menuItems={menuItems} 
        categories={categories.map(c => ({ id: c.id, name: c.name }))} 
        storeId={session.user.storeId} 
      />
    </div>
  );
}
