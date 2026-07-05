import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutGrid } from "lucide-react";
import { createCategory } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { CategoriesClient } from "./CategoriesClient";

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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* نموذج إضافة قسم */}
        <div className="lg:col-span-1">
          {/* Removed bg-surface-50, removed max-h overflow scroll */}
          <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-36">
            <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary-600" />
              إضافة قسم جديد
            </h3>
            
            <form action={createCategory as any} className="space-y-4">
              <div>
                <label htmlFor="name" className="block text-sm font-bold text-surface-950 mb-2">
                  اسم القسم *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  required
                  placeholder="مثال: مقبلات، مشويات"
                  className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-2xl text-surface-950 focus:border-primary-500 focus:outline-none transition-colors font-medium"
                />
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-bold text-surface-950 mb-2">
                  الوصف (اختياري)
                </label>
                <textarea
                  id="description"
                  name="description"
                  rows={2}
                  className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-2xl text-surface-950 focus:border-primary-500 focus:outline-none transition-colors font-medium"
                />
              </div>

              <SubmitButton
                className="w-full py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-all text-lg mt-2"
              >
                حفظ القسم
              </SubmitButton>
            </form>
          </div>
        </div>

        {/* قائمة الأقسام */}
        <div className="lg:col-span-2">
          <CategoriesClient initialCategories={categories} />
        </div>
      </div>
    </div>
  );
}

