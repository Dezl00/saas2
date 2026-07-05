"use client";

import Link from "next/link";
import { Clock, ChevronLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Order } from "@prisma/client";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-yellow-50 text-yellow-800 border-yellow-200" },
  CONFIRMED: { label: "مؤكد", color: "bg-blue-50 text-blue-800 border-blue-200" },
  PREPARING: { label: "جاري التجهيز", color: "bg-purple-50 text-purple-800 border-purple-200" },
  READY: { label: "جاهز", color: "bg-indigo-50 text-indigo-800 border-indigo-200" },
  DELIVERED: { label: "مكتمل", color: "bg-success-50 text-success-800 border-success-200" },
  CANCELLED: { label: "ملغي", color: "bg-error-50 text-error-800 border-error-200" },
};

export function CompactOrderRow({ order, currency }: { order: Order, currency?: string }) {
  const status = statusMap[order.status] || { label: order.status, color: "bg-surface-50 text-surface-800 border-surface-200" };

  return (
    <div className="bg-white border-b border-surface-100 last:border-b-0 hover:bg-surface-50 transition-colors flex flex-col md:flex-row md:items-center justify-between p-4 gap-4">
      {/* Order Main Info */}
      <div className="flex items-start gap-4 flex-1">
        <div className="w-12 h-12 rounded-2xl bg-primary-50 text-primary-600 flex items-center justify-center font-black border border-primary-100 shrink-0">
          #{order.orderNumber}
        </div>
        
        <div className="flex flex-col">
          <h3 className="font-bold text-surface-950 text-base">{order.customerName}</h3>
          <div className="flex items-center gap-3 text-sm text-surface-500 font-medium mt-1">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5" />
              {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
            </span>
            <span className="w-1 h-1 rounded-full bg-surface-300"></span>
            <span>{formatPrice(Number(order.total), currency)}</span>
          </div>
        </div>
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-between md:justify-end gap-4 w-full md:w-auto">
        <span className={`px-3 py-1.5 font-bold text-xs rounded-xl border ${status.color}`}>
          {status.label}
        </span>
        
        <Link 
          href={`/dashboard/orders/${order.id}`}
          className="flex items-center gap-1.5 px-4 py-2 bg-white border border-surface-200 text-surface-700 hover:text-primary-600 hover:border-primary-200 rounded-xl font-bold text-sm transition-all"
        >
          تفاصيل الطلب
          <ChevronLeft className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
}
