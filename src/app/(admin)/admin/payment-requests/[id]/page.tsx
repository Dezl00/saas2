import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ChevronRight, CheckCircle, XCircle } from "lucide-react";
import { ProcessButtons } from "./components/ProcessButtons";

export default async function PaymentRequestDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const req = await prisma.paymentRequest.findUnique({
    where: { id: id },
    include: {
      store: true,
      plan: true,
      method: true
    }
  });

  if (!req) return notFound();

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center gap-4">
        <Link 
          href="/admin/payment-requests"
          className="p-2 text-surface-500 hover:text-surface-900 bg-white rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">تفاصيل طلب الدفع</h1>
          <p className="text-sm text-surface-500 mt-1 font-mono">
            رقم الطلب: #{req.id.toUpperCase()}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Payment Details */}
        <div className="bg-white rounded-[24px] border border-surface-200 p-6 space-y-6">
          <h3 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-2">بيانات العملية</h3>
          
          <div className="space-y-4 text-sm">
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">المتجر</span>
              <span className="font-bold text-surface-900">{req.store.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">الباقة</span>
              <span className="font-bold text-surface-900">{req.plan.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">المبلغ المدفوع</span>
              <span className="font-bold text-primary-600 text-lg">{req.amount.toString()} ج.م</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">طريقة الدفع</span>
              <span className="font-bold text-surface-900">{req.method.name}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">رقم التحويل (Transaction ID)</span>
              <span className="font-mono text-surface-900">{req.transactionId || 'غير متوفر'}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-surface-50">
              <span className="text-surface-500">تاريخ الطلب</span>
              <span className="text-surface-900">{new Date(req.createdAt).toLocaleString('ar-EG')}</span>
            </div>
            <div className="flex justify-between py-2">
              <span className="text-surface-500">حالة الطلب</span>
              <span>
                {req.status === "PENDING" && <span className="text-warning-600 font-bold">قيد المراجعة</span>}
                {req.status === "APPROVED" && <span className="text-success-600 font-bold">تم القبول</span>}
                {req.status === "REJECTED" && <span className="text-danger-600 font-bold">تم الرفض</span>}
              </span>
            </div>
          </div>

          {req.status === "PENDING" && (
            <div className="pt-4 mt-4 border-t border-surface-200">
              <ProcessButtons requestId={req.id} storeId={req.storeId} planId={req.planId} />
            </div>
          )}
        </div>

        {/* Receipt Image */}
        <div className="bg-white rounded-[24px] border border-surface-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-surface-900 border-b border-surface-100 pb-2">صورة الإيصال (التحويل)</h3>
          
          <div className="relative aspect-[3/4] w-full rounded-[24px] overflow-hidden bg-surface-100 border border-surface-200">
            {req.receiptImage ? (
              <Image 
                src={req.receiptImage}
                alt="Receipt Image"
                fill
                className="object-contain"
              />
            ) : (
              <div className="flex items-center justify-center h-full text-surface-400">
                لا توجد صورة إيصال
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
