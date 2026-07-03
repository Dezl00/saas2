import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, LayoutGrid } from "lucide-react";
import { createCategory, toggleCategoryStatus, deleteCategory } from "./actions";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";

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
          <div className="bg-surface-50 border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
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

              <div>
                <label htmlFor="sortOrder" className="block text-sm font-bold text-surface-950 mb-2">
                  الترتيب
                </label>
                <input
                  type="number"
                  id="sortOrder"
                  name="sortOrder"
                  defaultValue="0"
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
          {categories.length === 0 ? (
            <div className="bg-surface-50 border-2 border-surface-100 rounded-[32px] p-12 text-center flex flex-col items-center justify-center">
              <LayoutGrid className="w-16 h-16 text-surface-300 mb-4" />
              <p className="text-lg font-medium text-surface-500">لم تقم بإضافة أي أقسام بعد.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {categories.map((category) => (
                <div key={category.id} className="bg-white border-2 border-surface-100 rounded-3xl p-5 hover:border-surface-200 transition-colors flex flex-col">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="font-bold text-surface-950 text-xl">{category.name}</h4>
                      {category.description && (
                        <p className="text-sm text-surface-500 mt-1 line-clamp-2 font-medium">{category.description}</p>
                      )}
                    </div>
                    <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-surface-100 text-surface-700 shrink-0 border-2 border-surface-200">
                      {category._count.items} أصناف
                    </span>
                  </div>
                  
                  <div className="mt-auto pt-4 border-t-2 border-surface-50 flex items-center justify-between">
                    <form action={toggleCategoryStatus.bind(null, category.id, category.isActive) as any}>
                        <button
                          type="submit"
                          className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${
                            category.isActive ? 'bg-success-500' : 'bg-surface-300'
                          }`}
                        >
                          <span
                            className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                              category.isActive ? '-translate-x-6' : '-translate-x-1'
                            }`}
                          />
                        </button>
                    </form>
                    
                    <DeleteConfirmButton action={deleteCategory.bind(null, category.id) as any} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

