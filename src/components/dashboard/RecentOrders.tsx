import { prisma } from "@/lib/prisma";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Clock, ShoppingBag } from "lucide-react";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-amber-500 text-white" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-500 text-white" },
  PREPARING: { label: "جاري التجهيز", color: "bg-purple-500 text-white" },
  READY: { label: "جاهز", color: "bg-indigo-500 text-white" },
  DELIVERED: { label: "مكتمل", color: "bg-emerald-500 text-white" },
  CANCELLED: { label: "ملغي", color: "bg-rose-500 text-white" },
};

export async function RecentOrders({ storeId, currency }: { storeId: string, currency?: string }) {
  const recentOrders = await prisma.order.findMany({
    where: { storeId },
    take: 5,
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden">
      <div className="p-6 border-b border-surface-100 flex items-center justify-between">
        <h2 className="text-base font-semibold text-surface-950 flex items-center gap-2">
          <ShoppingBag className="w-5 h-5 text-surface-400" />
          أحدث الطلبات
        </h2>
        <Link
          href="/dashboard/orders"
          className="text-sm text-primary-500 hover:text-primary-600 font-medium"
        >
          عرض الكل
        </Link>
      </div>

      <div className="divide-y divide-surface-100">
        {recentOrders.map((order) => {
          const status = statusMap[order.status] || { label: order.status, color: "bg-surface-100 text-surface-800" };
          
          return (
            <Link
              key={order.id}
              href={`/dashboard/orders/${order.id}`}
              className="flex items-center justify-between p-6 hover:bg-surface-50 transition-colors group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-50 rounded-xl flex items-center justify-center text-primary-600 font-bold shrink-0">
                  #{order.orderNumber}
                </div>
                <div>
                  <h3 className="font-semibold text-surface-950">{order.customerName}</h3>
                  <p className="text-xs text-surface-500 flex items-center gap-1 mt-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleDateString("ar-EG")}
                  </p>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <span className="font-bold text-surface-950">{formatPrice(Number(order.total), currency)}</span>
                <span className={`px-2.5 py-1 text-[10px] font-bold rounded-md ${status.color}`}>
                  {status.label}
                </span>
              </div>
            </Link>
          );
        })}
        
        {recentOrders.length === 0 && (
          <div className="text-center py-12">
            <ShoppingBag className="w-12 h-12 text-surface-200 mx-auto mb-3" />
            <p className="font-medium text-surface-500">لا توجد طلبات بعد</p>
          </div>
        )}
      </div>
    </div>
  );
}
