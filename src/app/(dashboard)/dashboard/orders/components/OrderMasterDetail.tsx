"use client";

import { useState, useOptimistic, useTransition } from "react";
import Link from "next/link";
import { Clock, Truck, Store as StoreIcon, Menu, X, ArrowRight } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { updateOrderStatus } from "@/app/(dashboard)/dashboard/orders/actions/update-order-status";
import { Order, OrderItem, Branch, DeliveryArea, OrderStatus } from "@prisma/client";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-[#FFF3E0] text-[#E65100]" },
  CONFIRMED: { label: "مؤكد", color: "bg-[#E3F2FD] text-[#1565C0]" },
  PREPARING: { label: "جاري التجهيز", color: "bg-[#F3E5F5] text-[#6A1B9A]" },
  READY: { label: "جاهز", color: "bg-[#E8EAF6] text-[#283593]" },
  DELIVERED: { label: "مكتمل", color: "bg-[#E8F5E9] text-[#2E7D32]" },
  CANCELLED: { label: "ملغي", color: "bg-[#FFEBEE] text-[#C62828]" },
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
  deliveryArea: (DeliveryArea & { governorate?: { name: string } | null }) | null;
};

export function OrderMasterDetail({ 
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
    <div className="flex flex-col md:flex-row h-[calc(100vh-8rem)] md:h-[calc(100vh-6rem)] -m-4 md:-m-8 border-t border-surface-100 md:rounded-[24px] overflow-hidden bg-white">
      
      {/* Mobile Header for opening sidebar */}
      <div className="md:hidden flex items-center justify-between p-4 border-b border-surface-100 bg-white">
        <Link href="/dashboard/orders" className="flex items-center gap-2 text-surface-500 font-bold hover:text-surface-950">
          <ArrowRight className="w-5 h-5" />
          الطلبات
        </Link>
        <button 
          onClick={() => setIsSidebarOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-surface-50 text-surface-700 font-bold rounded-[24px]"
        >
          <Menu className="w-4 h-4" />
          القائمة
        </button>
      </div>

      {/* Sidebar (List of orders) */}
      <div className={`fixed inset-0 z-50 md:z-0 md:static bg-white md:w-80 lg:w-96 flex flex-col border-l border-surface-100 transition-transform transform ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full md:translate-x-0'}`}>
        <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-white">
          <h2 className="font-extrabold text-lg text-surface-950">الطلبات</h2>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/orders" className="hidden md:flex p-2 text-surface-500 hover:bg-surface-50 rounded-lg transition-colors" title="الرجوع للطلبات">
              <ArrowRight className="w-5 h-5" />
            </Link>
            <button className="md:hidden p-2 bg-surface-50 text-surface-950 rounded-lg" onClick={() => setIsSidebarOpen(false)}>
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
                className={`block p-4 border-b border-surface-100 transition-colors ${isSelected ? 'bg-primary-50/50' : 'hover:bg-surface-50'}`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-extrabold text-surface-900">#{order.orderNumber}</span>
                  <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${status.color}`}>
                    {status.label}
                  </span>
                </div>
                <div className="font-bold text-surface-700 text-sm mb-2">{order.customerName}</div>
                <div className="flex justify-between items-center text-xs text-surface-500 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                  <span className="font-bold text-surface-500">{formatPrice(Number(order.total), currency)}</span>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      {/* Main Content (Order Details) */}
      <div className={`flex-1 overflow-y-auto bg-white transition-opacity ${isPending ? 'opacity-70' : 'opacity-100'} p-4 md:p-8 lg:p-12`}>
        <div className="max-w-2xl mx-auto space-y-8">
          
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-surface-100 pb-6">
            <div>
              <h3 className="font-black text-2xl text-surface-950">طلب #{selectedOrder.orderNumber}</h3>
              <p className="text-sm font-medium text-surface-500 flex items-center gap-2 mt-2">
                <Clock className="w-4 h-4 text-primary-500" />
                {new Date(selectedOrder.createdAt).toLocaleString('ar-EG')}
              </p>
            </div>
            <span className={`px-4 py-2 font-bold text-sm rounded-[24px] ${statusMap[optimisticStatus]?.color || 'bg-surface-50 text-surface-800'}`}>
              {statusMap[optimisticStatus]?.label || optimisticStatus}
            </span>
          </div>

          {/* Customer & Delivery */}
          <div className="space-y-6">
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">بيانات العميل</span>
              <p className="font-bold text-lg text-surface-950">{selectedOrder.customerName}</p>
              <p className="font-medium text-surface-600 text-sm" dir="ltr">{selectedOrder.customerPhone}</p>
            </div>
            
            <div className="flex flex-col gap-1">
              <span className="text-xs font-bold text-surface-500 uppercase tracking-wider">طريقة الاستلام</span>
              {selectedOrder.deliveryType === "DELIVERY" ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center text-primary-600 shrink-0">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900">توصيل ({selectedOrder.deliveryArea?.governorate?.name ? `${selectedOrder.deliveryArea.governorate.name} - ` : ''}{selectedOrder.deliveryArea?.name})</p>
                    <p className="font-medium text-surface-500 text-sm">{selectedOrder.customerAddress}</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-surface-100 flex items-center justify-center text-surface-600 shrink-0">
                    <StoreIcon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-surface-900">استلام من الفرع</p>
                    <p className="font-medium text-surface-500 text-sm">{selectedOrder.branch?.name}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {selectedOrder.notes && (
            <div className="bg-[#FFF8E1] rounded-[24px] p-4 text-[#F57F17] text-sm">
              <span className="font-bold block mb-1">ملاحظات العميل:</span>
              <p className="font-medium leading-relaxed">{selectedOrder.notes}</p>
            </div>
          )}

          {/* Invoice */}
          <div className="pt-6 border-t border-surface-100">
            <h4 className="font-bold text-lg text-surface-950 mb-4">تفاصيل الطلب</h4>
            
            <ul className="space-y-4 mb-8">
              {selectedOrder.items.map(item => (
                <li key={item.id} className="flex justify-between items-center gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 bg-surface-50 rounded-lg flex items-center justify-center font-bold text-surface-700 text-sm shrink-0">
                      x{item.quantity}
                    </span>
                    <span className="font-bold text-surface-900 text-sm leading-tight">{item.name}</span>
                  </div>
                  <span className="font-medium text-surface-500 text-sm shrink-0">{formatPrice(Number(item.price), currency)}</span>
                </li>
              ))}
            </ul>
            
            <div className="space-y-3">
              <div className="flex justify-between font-medium text-surface-500 text-sm">
                <span>المجموع</span>
                <span>{formatPrice(Number(selectedOrder.subtotal), currency)}</span>
              </div>
              {Number(selectedOrder.deliveryFee) > 0 && (
                <div className="flex justify-between font-medium text-surface-500 text-sm">
                  <span>رسوم التوصيل</span>
                  <span>{formatPrice(Number(selectedOrder.deliveryFee), currency)}</span>
                </div>
              )}
              <div className="flex justify-between font-black text-xl text-surface-950 pt-4 border-t border-surface-100">
                <span>الإجمالي</span>
                <span>{formatPrice(Number(selectedOrder.total), currency)}</span>
              </div>
            </div>
          </div>

          {/* Actions */}
          <form action={handleStatusUpdate} className="pt-6 border-t border-surface-100">
            <input type="hidden" name="orderId" value={selectedOrder.id} />
            <div className="flex flex-col gap-3">
              <label className="text-sm font-bold text-surface-900">حالة الطلب</label>
              <div className="flex flex-col sm:flex-row gap-3">
                <select name="status" defaultValue={optimisticStatus} className="flex-1 px-4 py-3 bg-surface-50 border-transparent rounded-[24px] focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none font-bold text-surface-900 transition-all cursor-pointer">
                  <option value="PENDING">قيد الانتظار</option>
                  <option value="CONFIRMED">مؤكد (جاري التحضير)</option>
                  <option value="DELIVERED">مكتمل (تم التسليم)</option>
                  <option value="CANCELLED">ملغي</option>
                </select>
                <button type="submit" disabled={isPending} className="px-6 py-3 bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white font-bold rounded-[24px] transition-colors whitespace-nowrap">
                  حفظ الحالة
                </button>
              </div>
            </div>
          </form>

        </div>
      </div>
    </div>
  );
}
