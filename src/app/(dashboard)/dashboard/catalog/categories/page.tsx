import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutGrid } from "lucide-react";
import { createCategory } from "./actions/create-category";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { CategoriesClient } from "./components/CategoriesClient";
import { ImageUpload } from "@/components/dashboard/ImageUpload";

export const metadata = {
  title: "إدارة الأقسام | لوحة التحكم",
};

export default async function CategoriesPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    return null;
  }

  const categories = await prisma.category.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { sortOrder: 'asc' },
    include: {
      _count: {
        select: { items: true }
      }
    }
  });

  return (
    <div className="space-y-6">
      <CategoriesClient initialCategories={categories} storeId={session.user.storeId} />
    </div>
  );
}

