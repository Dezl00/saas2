import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { Check, X, Eye, FileText } from "lucide-react";

export default async function PaymentRequestsPage() {
  const requests = await prisma.paymentRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      store: true,
      plan: true,
      method: true
    }
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-900">مراجعة طلبات الدفع</h1>
        <p className="text-sm text-surface-500">
          إجمالي الطلبات: {requests.length}
        </p>
      </div>

      <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden ">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-right">
            <thead className="bg-surface-50 text-surface-600 font-medium border-b border-surface-200">
              <tr>
                <th className="px-6 py-4 whitespace-nowrap">رقم الطلب</th>
                <th className="px-6 py-4 whitespace-nowrap">المتجر</th>
                <th className="px-6 py-4 whitespace-nowrap">الباقة المطلوبة</th>
                <th className="px-6 py-4 whitespace-nowrap">طريقة الدفع</th>
                <th className="px-6 py-4 whitespace-nowrap">المبلغ</th>
                <th className="px-6 py-4 whitespace-nowrap">الحالة</th>
                <th className="px-6 py-4 whitespace-nowrap">التاريخ</th>
                <th className="px-6 py-4 whitespace-nowrap">إجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-200">
              {requests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-8 text-center text-surface-500">
                    لا توجد طلبات دفع حتى الآن.
                  </td>
                </tr>
              ) : (
                requests.map((req) => (
                  <tr key={req.id} className="hover:bg-surface-50 transition-colors">
                    <td className="px-6 py-4 font-mono text-xs text-surface-500">
                      #{req.id.slice(-6).toUpperCase()}
                    </td>
                    <td className="px-6 py-4 font-bold text-surface-900">
                      {req.store.name}
                      <span className="block text-xs font-normal text-surface-500 mt-0.5">
                        {req.store.subdomain || 'No Subdomain'}
                      </span>
                    </td>
                    <td className="px-6 py-4">{req.plan.name}</td>
                    <td className="px-6 py-4 text-surface-600">
                      {req.method.name}
                      {req.transactionId && (
                        <span className="block text-xs mt-1">Ref: {req.transactionId}</span>
                      )}
                    </td>
                    <td className="px-6 py-4 font-bold">{req.amount.toString()} ج.م</td>
                    <td className="px-6 py-4">
                      {req.status === "PENDING" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-warning-50 text-warning-700 border border-warning-200">
                          قيد المراجعة
                        </span>
                      )}
                      {req.status === "APPROVED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-success-50 text-success-700 border border-success-200">
                          مقبول
                        </span>
                      )}
                      {req.status === "REJECTED" && (
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-danger-50 text-danger-700 border border-danger-200">
                          مرفوض
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-surface-500">
                      {new Date(req.createdAt).toLocaleDateString('ar-EG')}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <Link 
                          href={`/admin/payment-requests/${req.id}`}
                          className="inline-flex items-center justify-center p-2 text-surface-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
                          title="عرض تفاصيل الطلب والإيصال"
                        >
                          <Eye className="w-4 h-4" />
                        </Link>
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
  );
}
