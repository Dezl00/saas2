import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Clock, ShoppingBag } from "lucide-react";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-100 text-blue-800 border-blue-200" },
  PREPARING: { label: "جاري التجهيز", color: "bg-purple-100 text-purple-800 border-purple-200" },
  READY: { label: "جاهز", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  DELIVERED: { label: "مكتمل", color: "bg-success-100 text-success-800 border-success-200" },
  CANCELLED: { label: "ملغي", color: "bg-error-100 text-error-800 border-error-200" },
};

export async function RecentOrders({ storeId, currency }: { storeId: string, currency?: string }) {
  const recentOrders = await prisma.order.findMany({
    where: { storeId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8">
      <div className="flex items-center justify-between mb-6 pb-6 border-b-2 border-surface-50">
        <h2 className="text-2xl font-black text-surface-950 flex items-center gap-2">
          <ShoppingBag className="w-6 h-6 text-primary-500" />
          أحدث الطلبات
        </h2>
        <Link
          href="/dashboard/orders"
          className="text-sm font-bold text-primary-600 bg-primary-50 px-4 py-2 rounded-xl border-2 border-primary-100 hover:bg-primary-100 transition-colors"
        >
          عرض الكل
        </Link>
      </div>

      <div className="space-y-4">
        {recentOrders.map((order) => {
          const status = statusMap[order.status] || { label: order.status, color: "bg-surface-100 text-surface-800 border-surface-200" };
          
          return (
            <Link
              key={order.id}
              href={`/dashboard/orders`}
              className="block bg-surface-50 border-2 border-surface-100 rounded-3xl p-5 hover:border-primary-200 transition-all group"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center border-2 border-surface-200 font-black text-surface-950 shrink-0 group-hover:border-primary-200 transition-colors">
                    #{order.orderNumber}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-surface-950">{order.customerName}</h3>
                    <p className="text-sm font-medium text-surface-500 flex items-center gap-1 mt-1">
                      <Clock className="w-4 h-4" />
                      {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between sm:flex-col sm:items-end gap-2 border-t-2 border-surface-100 sm:border-0 pt-4 sm:pt-0 mt-2 sm:mt-0">
                  <span className="font-black text-xl text-primary-600">{formatPrice(Number(order.total), currency)}</span>
                  <span className={`px-3 py-1 font-bold text-xs rounded-xl border-2 ${status.color}`}>
                    {status.label}
                  </span>
                </div>
              </div>
            </Link>
          );
        })}
        
        {recentOrders.length === 0 && (
          <div className="text-center py-12 bg-surface-50 border-2 border-surface-100 border-dashed rounded-[24px]">
            <ShoppingBag className="w-12 h-12 text-surface-300 mx-auto mb-3" />
            <p className="font-bold text-surface-500">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
