"use client";

import Link from "next/link";
import { Clock, ChevronLeft } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Order } from "@prisma/client";

const statusMap: Record<string, { label: string, color: string }> = {
  PENDING: { label: "قيد الانتظار", color: "bg-[#FFF3E0] text-[#E65100]" },
  CONFIRMED: { label: "مؤكد", color: "bg-[#E3F2FD] text-[#1565C0]" },
  PREPARING: { label: "جاري التجهيز", color: "bg-[#F3E5F5] text-[#6A1B9A]" },
  READY: { label: "جاهز", color: "bg-[#E8EAF6] text-[#283593]" },
  DELIVERED: { label: "مكتمل", color: "bg-[#E8F5E9] text-[#2E7D32]" },
  CANCELLED: { label: "ملغي", color: "bg-[#FFEBEE] text-[#C62828]" },
};

export function CompactOrderRow({ order, currency }: { order: Order, currency?: string }) {
  const status = statusMap[order.status] || { label: order.status, color: "bg-surface-50 text-surface-800" };

  return (
    <div className="flex items-center justify-between py-4 border-b border-surface-100 last:border-b-0 hover:bg-surface-50/50 transition-colors px-2 md:px-4">
      {/* Order Main Info */}
      <div className="flex items-center gap-3 md:gap-6 flex-1">
        <div className="font-extrabold text-surface-900 text-sm md:text-base w-10 md:w-16 shrink-0">
          #{order.orderNumber}
        </div>
        
        <div className="flex flex-col flex-1 min-w-0">
          <h3 className="font-bold text-surface-950 text-sm md:text-base truncate max-w-[120px] md:max-w-xs">{order.customerName}</h3>
          <div className="flex md:hidden items-center gap-2 text-xs text-surface-500 font-medium mt-0.5">
            <span>{formatPrice(Number(order.total), currency)}</span>
            <span className="w-1 h-1 rounded-full bg-surface-300"></span>
            <span>{new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}</span>
          </div>
        </div>
      </div>

      {/* Desktop Only Details */}
      <div className="hidden md:flex flex-1 items-center justify-between gap-4 font-bold text-surface-700">
        <span className="w-32 text-right">{formatPrice(Number(order.total), currency)}</span>
        <span className="text-surface-500 font-medium text-sm flex items-center gap-1.5 w-32">
          <Clock className="w-4 h-4 text-surface-400" />
          {new Date(order.createdAt).toLocaleTimeString('ar-EG', { hour: '2-digit', minute: '2-digit' })}
        </span>
      </div>

      {/* Status & Action */}
      <div className="flex items-center justify-end gap-3 md:gap-6 shrink-0 md:w-48">
        <span className={`px-2.5 py-1 md:px-3 md:py-1.5 font-bold text-[11px] md:text-xs rounded-lg md:rounded-[24px] ${status.color}`}>
          {status.label}
        </span>
        
        <Link 
          href={`/dashboard/orders/${order.id}`}
          className="flex items-center justify-center w-8 h-8 md:w-auto md:h-auto md:px-4 md:py-2 bg-surface-100 md:bg-white text-surface-600 hover:text-primary-600 md:border md:border-surface-200 hover:bg-primary-50 md:hover:border-primary-200 rounded-lg md:rounded-[24px] font-bold text-sm transition-all shrink-0"
          title="تفاصيل الطلب"
        >
          <span className="hidden md:block">التفاصيل</span>
          <ChevronLeft className="w-4 h-4 md:mr-1" />
        </Link>
      </div>
    </div>
  );
}
