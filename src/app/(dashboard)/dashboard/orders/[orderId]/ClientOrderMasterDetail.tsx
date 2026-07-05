"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Clock, Truck, Store as StoreIcon, Menu, X, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/app/(dashboard)/dashboard/orders/actions";
import { Order, OrderItem, Branch, DeliveryArea, OrderStatus } from "@prisma/client";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-amber-500 text-white" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-500 text-white" },
  PREPARING: { label: "جاري التجهيز", color: "bg-purple-500 text-white" },
  READY: { label: "جاهز", color: "bg-indigo-500 text-white" },
  DELIVERED: { label: "مكتمل", color: "bg-emerald-500 text-white" },
  CANCELLED: { label: "ملغي", color: "bg-rose-500 text-white" },
};

type OrderListItem = {
  id: string;
  orderNumber: number;
  customerName: string;
  status: string;
  createdAt: Date;
  total: any;
};

type OrderWithRelations = Order & {
  items: OrderItem[];
  branch: Branch | null;
  deliveryArea: DeliveryArea | null;
};

export function ClientOrderMasterDetail({ 
  orders, 
  selectedOrder, 
  currency 
}: { 
  orders: OrderListItem[], 
  selectedOrder: OrderWithRelations, 
  currency: string 
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [optimisticStatus, addOptimisticStatus] = useOptimistic<OrderStatus, string>(
    selectedOrder.status as OrderStatus,
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] -m-4 md:-m-8 border-t-2 md:border-2 border-surface-100 md:rounded-[32px] overflow-hidden bg-white">
      
      {/* Mobile Header for opening sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b-2 border-surface-100 bg-white">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-surface-500 font-bold hover:text-surface-950">
          <ArrowRight className="w-5 h-5" />
          رجوع للطلبات
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-surface-100 text-surface-700 font-bold rounded-xl"
        >
          <Menu className="w-4 h-4" />
          قائمة الطلبات
        </button>
      </div>

      {/* Sidebar (List of orders) */}
      <div className={`fixed inset-0 z-50 md:z-0 md:static bg-white md:w-80 lg:w-96 flex flex-col border-l-2 border-surface-100 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b-2 border-surface-100 flex items-center justify-between bg-white">
          <h2 className="font-black text-lg text-surface-950">كل الطلبات</h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/orders" className="hidden md:flex p-2 text-surface-500 hover:bg-surface-100 rounded-lg transition-colors" title="الرجوع للطلبات">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="md:hidden p-2 bg-surface-100 text-surface-950 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto bg-white">
          {orders.map(order => {
            const isSelected = order.id === selectedOrder.id;
            const status = statusMap[order.status] || { label: order.status, color: "bg-surface-50 text-surface-800" };
            return (
              <Link 
                key={order.id} 
                href={`/dashboard/orders/${order.id}`}
                onClick={() => setIsSidebarOpen(false)}
                className={`block p-4 border-b border-surface-100 transition-colors ${isSelected ? 'bg-primary-50 border-l-4 border-l-primary-500' : 'hover:bg-surface-50'}`}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-black text-surface-950">#{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="font-bold text-surface-700 text-sm mb-1">{order.customerName}</div>
                <div className="flex justify-between items-center text-xs text-surface-500 font-medium mt-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-surface-950">{formatPrice(Number(order.total), currency)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content (Order Details) */}
      <div className={`flex-1 overflow-y-auto bg-white transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'} p-4 md:p-8 flex flex-col gap-8`}>
        <div className="flex-1 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-surface-100 pb-6">
            <div>
              <h3 className="font-black text-3xl text-surface-950">طلب #{selectedOrder.orderNumber}</h3>
              <p className="text-sm font-bold text-surface-500 flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
              </p>
            </div>
            <span className={`px-4 py-2 font-bold text-sm rounded-xl ${statusMap[optimisticStatus]?.color || 'bg-surface-100 text-surface-800'}`}>
              {statusMap[optimisticStatus]?.label || optimisticStatus}
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 border-2 border-surface-100 rounded-[24px]">
            <div className="space-y-2">
              <p className="text-sm font-bold text-surface-500">بيانات العميل</p>
              <p className="font-bold text-lg text-surface-950">{selectedOrder.customerName}</p>
              <p className="font-medium text-surface-600" dir="ltr">{selectedOrder.customerPhone}</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-bold text-surface-500">نوع الاستلام</p>
              {selectedOrder.deliveryType === "DELIVERY" ? (
                <div>
                  <p className="font-bold text-lg text-surface-950 flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-full bg-primary-50 flex items-center justify-center border border-primary-100">
                      <Truck className="w-4 h-4 text-primary-600" />
                    </span>
                    توصيل ({selectedOrder.deliveryArea?.name})
                  </p>
                  <p className="font-medium text-surface-600 mr-10">{selectedOrder.customerAddress}</p>
                </div>
              ) : (
                <div>
                  <p className="font-bold text-lg text-surface-950 flex items-center gap-2 mb-1">
                    <span className="w-8 h-8 rounded-full bg-accent-50 flex items-center justify-center border border-accent-100">
                      <StoreIcon className="w-4 h-4 text-accent-600" />
                    </span>
                    استلام من الفرع
                  </p>
                  <p className="font-medium text-surface-600 mr-10">{selectedOrder.branch?.name}</p>
                </div>
              )}
            </div>
          </div>

          {selectedOrder.notes && (
            <div className="bg-yellow-50 rounded-[24px] p-5 border border-yellow-200 text-yellow-800">
              <span className="font-black block mb-1">ملاحظات العميل:</span>
              <p className="font-medium">{selectedOrder.notes}</p>
            </div>
          )}
        </div>

        {/* Invoice & Actions Column */}
        <div className="w-full flex flex-col pt-2">
          <h4 className="font-black text-xl text-surface-950 mb-6 flex items-center gap-2">
            تفاصيل الفاتورة
          </h4>
          
          <ul className="space-y-3 mb-6 flex-1">
            {selectedOrder.items.map(item => (
              <li key={item.id} className="flex justify-between items-center bg-white p-3 rounded-2xl border-2 border-surface-100">
                <div className="flex items-center gap-3">
                  <span className="w-8 h-8 bg-white border-2 border-surface-200 rounded-xl flex items-center justify-center font-bold text-surface-950 text-sm">
                    {item.quantity}
                  </span>
                  <span className="font-bold text-surface-950 text-sm">{item.name}</span>
                </div>
                <span className="font-black text-surface-950 text-sm">{formatPrice(Number(item.price), currency)}</span>
              </li>
            ))}
          </ul>
          
          <div className="bg-white rounded-3xl p-5 border-2 border-surface-100 space-y-3 mb-6">
            <div className="flex justify-between font-bold text-surface-600 text-sm">
              <span>المجموع</span>
              <span>{formatPrice(Number(selectedOrder.subtotal), currency)}</span>
            </div>
            {Number(selectedOrder.deliveryFee) > 0 && (
              <div className="flex justify-between font-bold text-surface-600 text-sm">
                <span>رسوم التوصيل</span>
                <span>{formatPrice(Number(selectedOrder.deliveryFee), currency)}</span>
              </div>
            )}
            <div className="flex justify-between font-black text-xl text-surface-950 pt-3 border-t-2 border-surface-100 mt-3">
              <span>الإجمالي</span>
              <span>{formatPrice(Number(selectedOrder.total), currency)}</span>
            </div>
          </div>

          <form action={handleStatusUpdate} className="mt-auto">
            <input type="hidden" name="orderId" value={selectedOrder.id} />
            <label className="block text-sm font-bold text-surface-950 mb-2">تحديث حالة الطلب</label>
            <div className="flex flex-col gap-3">
              <select name="status" defaultValue={optimisticStatus} className="w-full px-4 py-4 bg-white border-2 border-surface-200 rounded-2xl focus:border-primary-500 outline-none font-bold text-surface-950 transition-colors cursor-pointer">
                <option value="PENDING">قيد الانتظار</option>
                <option value="CONFIRMED">مؤكد (جاري التحضير)</option>
                <option value="DELIVERED">مكتمل (تم التسليم)</option>
                <option value="CANCELLED">ملغي</option>
              </select>
              <button type="submit" disabled={isPending} className="w-full py-4 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-2xl transition-all active:scale-95 whitespace-nowrap">
                تحديث الحالة
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
