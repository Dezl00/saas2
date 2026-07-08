"use client";

import { useOptimistic, useTransition } from "react";
import { Clock, Truck, Store as StoreIcon } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/app/(dashboard)/dashboard/orders/actions/update-order-status";
import { Order, OrderItem, Branch, DeliveryArea, OrderStatus } from "@prisma/client";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-100 text-blue-800 border-blue-200" },
  PREPARING: { label: "جاري التجهيز", color: "bg-purple-100 text-purple-800 border-purple-200" },
  READY: { label: "جاهز", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
  DELIVERED: { label: "مكتمل", color: "bg-success-100 text-success-800 border-success-200" },
  CANCELLED: { label: "ملغي", color: "bg-error-100 text-error-800 border-error-200" },
};

type OrderWithRelations = Order & {
  items: OrderItem[];
  branch: Branch | null;
  deliveryArea: DeliveryArea | null;
};

export function OrderCard({ order, currency }: { order: OrderWithRelations, currency?: string }) {
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, addOptimisticStatus] = useOptimistic<OrderStatus, string>(
    order.status,
    (state: OrderStatus, newStatus: string) => newStatus as OrderStatus
  );

  async function handleStatusUpdate(formData: FormData) {
    const newStatus = formData.get("status") as string;
    if (newStatus === optimisticStatus) return;

    startTransition(async () => {
      addOptimisticStatus(newStatus);
      await updateOrderStatus(formData);
    });
  }

  return (
    <div className={`bg-white border-2 border-surface-100 rounded-[32px] overflow-hidden flex flex-col lg:flex-row transition-all hover:border-surface-200 ${isPending ? 'opacity-70' : 'opacity-100'}`}>
      {/* Order Info */}
      <div className="flex-1 p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-surface-50 pb-6">
          <div>
            <h3 className="font-black text-2xl text-surface-950">طلب #{order.orderNumber}</h3>
            <p className="text-sm font-bold text-surface-500 flex items-center gap-2 mt-2">
              <Clock className="w-4 h-4 text-primary-500" />
              {new Date(order.createdAt).toLocaleString('ar-EG')}
            </p>
          </div>
          <span className={`px-4 py-2 font-bold text-sm rounded-[24px] border-2 ${statusMap[optimisticStatus]?.color || 'bg-surface-100 border-surface-200'}`}>
            {statusMap[optimisticStatus]?.label || optimisticStatus}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-surface-50 rounded-[24px] p-6 border-2 border-surface-100">
          <div className="space-y-2">
            <p className="text-sm font-bold text-surface-500">بيانات العميل</p>
            <p className="font-bold text-lg text-surface-950">{order.customerName}</p>
            <p className="font-medium text-surface-600" dir="ltr">{order.customerPhone}</p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-bold text-surface-500">نوع الاستلام</p>
            {order.deliveryType === "DELIVERY" ? (
              <div>
                <p className="font-bold text-lg text-surface-950 flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center border-2 border-primary-100">
                    <Truck className="w-4 h-4 text-primary-600" />
                  </div>
                  توصيل ({order.deliveryArea?.name})
                </p>
                <p className="font-medium text-surface-600 mr-10">{order.customerAddress}</p>
              </div>
            ) : (
              <div>
                <p className="font-bold text-lg text-surface-950 flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center border-2 border-accent-100">
                    <StoreIcon className="w-4 h-4 text-accent-600" />
                  </div>
                  استلام من الفرع
                </p>
                <p className="font-medium text-surface-600 mr-10">{order.branch?.name}</p>
              </div>
            )}
          </div>
        </div>

        {order.notes && (
          <div className="bg-yellow-50 rounded-[24px] p-5 border-2 border-yellow-200 text-yellow-800">
            <span className="font-black block mb-1">ملاحظات العميل:</span>
            <p className="font-medium">{order.notes}</p>
          </div>
        )}
      </div>

      {/* Order Items & Actions */}
      <div className="w-full lg:w-96 bg-surface-50 p-6 lg:p-8 flex flex-col border-t-2 lg:border-t-0 lg:border-r-2 border-surface-100">
        <h4 className="font-black text-xl text-surface-950 mb-6 flex items-center gap-2">
          تفاصيل الفاتورة
        </h4>
        
        <ul className="space-y-4 mb-6 flex-1">
          {order.items.map(item => (
            <li key={item.id} className="flex justify-between items-center bg-white p-4 rounded-[24px] border-2 border-surface-100">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 bg-surface-50 border-2 border-surface-200 rounded-[24px] flex items-center justify-center font-bold text-surface-950 text-sm">
                  {item.quantity}
                </span>
                <span className="font-bold text-surface-950">{item.name}</span>
              </div>
              <span className="font-black text-primary-600">{formatPrice(Number(item.price), currency)}</span>
            </li>
          ))}
        </ul>
        
        <div className="bg-white rounded-[24px] p-5 border-2 border-surface-100 space-y-3 mb-6">
          <div className="flex justify-between font-bold text-surface-600">
            <span>المجموع</span>
            <span>{formatPrice(Number(order.subtotal), currency)}</span>
          </div>
          {Number(order.deliveryFee) > 0 && (
            <div className="flex justify-between font-bold text-surface-600">
              <span>رسوم التوصيل</span>
              <span>{formatPrice(Number(order.deliveryFee), currency)}</span>
            </div>
          )}
          <div className="flex justify-between font-black text-2xl text-primary-600 pt-3 border-t-2 border-surface-50 mt-3">
            <span>الإجمالي</span>
            <span>{formatPrice(Number(order.total), currency)}</span>
          </div>
        </div>

        <form action={handleStatusUpdate} className="mt-auto">
          <input type="hidden" name="orderId" value={order.id} />
          <label className="block text-sm font-bold text-surface-950 mb-2">تحديث حالة الطلب</label>
          <div className="flex flex-col sm:flex-row gap-3">
            <select name="status" defaultValue={optimisticStatus} className="flex-1 px-4 py-4 bg-white border-2 border-surface-200 rounded-[24px] focus:border-primary-500 outline-none font-bold text-surface-950 transition-colors cursor-pointer">
              <option value="PENDING">قيد الانتظار</option>
              <option value="CONFIRMED">مؤكد (جاري التحضير)</option>
              <option value="DELIVERED">مكتمل (تم التسليم)</option>
              <option value="CANCELLED">ملغي</option>
            </select>
            <button type="submit" disabled={isPending} className="px-8 py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-[24px] transition-all active:scale-95 whitespace-nowrap">
              حفظ
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
