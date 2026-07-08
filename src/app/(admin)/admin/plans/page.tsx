import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Edit, Check, X } from "lucide-react";

export default async function PlansPage() {
  const plans = await prisma.plan.findMany({
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">إدارة الباقات</h1>
        <Link 
          href="/admin/plans/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة باقة
        </Link>
      </div>

      <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">اسم الباقة</th>
                <th className="px-6 py-4 whitespace-nowrap">السعر</th>
                <th className="px-6 py-4 whitespace-nowrap">المدة</th>
                <th className="px-6 py-4 whitespace-nowrap">الحالة</th>
                <th className="px-6 py-4 whitespace-nowrap">المميزات</th>
                <th className="px-6 py-4 whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {plans.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-surface-500">
                    لا توجد باقات حالياً. قم بإنشاء باقة جديدة للبدء.
                  </td>
                </tr>
              ) : (
                plans.map((plan) => {
                  const features = plan.features as Record<string, any>;
                  return (
                    <tr key={plan.id} className="hover:bg-surface-50 transition-colors">
                      <td className="px-6 py-4 font-bold text-surface-900">{plan.name}</td>
                      <td className="px-6 py-4">{plan.price.toString()} ج.م</td>
                      <td className="px-6 py-4">{plan.durationDays} يوم</td>
                      <td className="px-6 py-4">
                        {plan.isActive ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200">
                            <Check className="w-3.5 h-3.5" /> مفعل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-600 border border-surface-200">
                            <X className="w-3.5 h-3.5" /> متوقف
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-surface-500 max-w-xs truncate">
                        {Object.keys(features).length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {Object.entries(features).slice(0, 2).map(([k, v]) => (
                              <span key={k} className="inline-block px-2 py-0.5 bg-surface-100 rounded text-xs">
                                {k}: {v.toString()}
                              </span>
                            ))}
                            {Object.keys(features).length > 2 && (
                              <span className="inline-block px-2 py-0.5 bg-surface-100 rounded text-xs">
                                +{Object.keys(features).length - 2}
                              </span>
                            )}
                          </div>
                        ) : (
                          "لا توجد مميزات"
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <Link 
                          href={`/admin/plans/${plan.id}`}
                          className="inline-flex items-center justify-center p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                        >
                          <Edit className="w-4 h-4" />
                        </Link>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
