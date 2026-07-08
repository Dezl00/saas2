import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Plus, Check, X } from "lucide-react";

export default async function PaymentMethodsPage() {
  const methods = await prisma.platformPaymentMethod.findMany({
    orderBy: { sortOrder: "asc" }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">طرق الدفع</h1>
        <Link 
          href="/admin/payment-methods/new"
          className="inline-flex items-center justify-center gap-2 px-4 py-2 text-sm font-bold text-white bg-primary-600 rounded-lg hover:bg-primary-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          إضافة طريقة
        </Link>
      </div>

      <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">اسم الطريقة</th>
                <th className="px-6 py-4 whitespace-nowrap">معلومات الحساب</th>
                <th className="px-6 py-4 whitespace-nowrap">الترتيب</th>
                <th className="px-6 py-4 whitespace-nowrap">الحالة</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {methods.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-surface-500">
                    لا توجد طرق دفع حالياً.
                  </td>
                </tr>
              ) : (
                methods.map((method) => (
                  <tr key={method.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 font-bold text-surface-900">{method.name}</td>
                    <td className="px-6 py-4 text-surface-600">{method.accountInfo}</td>
                    <td className="px-6 py-4">{method.sortOrder}</td>
                    <td className="px-6 py-4">
                      {method.isActive ? (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200">
                          <Check className="w-3.5 h-3.5" /> مفعلة
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-surface-100 text-surface-600 border border-surface-200">
                          <X className="w-3.5 h-3.5" /> متوقفة
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
