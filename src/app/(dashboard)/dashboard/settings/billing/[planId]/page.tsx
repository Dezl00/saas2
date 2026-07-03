import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Check, X } from "lucide-react";
import { CheckoutForm } from "./CheckoutForm";

export default async function CheckoutPage({ params }: { params: Promise<{ planId: string }> }) {
  const { planId } = await params;
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id },
    include: {
      subscription: true
    }
  });
  if (!store) redirect("/onboarding");

  const plan = await prisma.plan.findUnique({
    where: { id: planId, isActive: true }
  });
  if (!plan) notFound();

  // Block re-subscribing to current active plan
  if (store.subscription?.planId === plan.id && store.subscription?.status === "ACTIVE") {
    redirect("/dashboard/billing?already=true");
  }

  const methods = await prisma.platformPaymentMethod.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  const features = plan.features as any;

  // Feature labels map
  const featureLabels: Record<string, { label: string; type: "number" | "boolean"; suffix?: string }> = {
    products: { label: "المنتجات", type: "number", suffix: "منتج" },
    branches: { label: "الفروع", type: "number", suffix: "فرع" },
    staff: { label: "الموظفين", type: "number", suffix: "موظف" },
    qr: { label: "صانع QR للطاولات", type: "boolean" },
    reports: { label: "تقارير مبيعات متقدمة", type: "boolean" },
    inventory: { label: "إدارة المخزون", type: "boolean" },
    customDomain: { label: "دومين خاص", type: "boolean" },
    ai: { label: "الذكاء الاصطناعي", type: "boolean" },
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/billing"
          className="p-2 text-surface-500 hover:text-surface-900 bg-white rounded-lg border border-surface-200 hover:bg-surface-50 transition-colors"
        >
          <ChevronRight className="w-5 h-5 rtl:rotate-180" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-surface-900">إتمام الدفع</h1>
          <p className="text-sm text-surface-500 mt-1">
            الباقة المختارة: <strong className="text-primary-600">{plan.name}</strong>
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Plan Summary */}
        <div className="md:col-span-1 space-y-6">
          <div className="bg-surface-50 rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">ملخص الطلب</h3>
            <div className="flex justify-between items-center py-3 border-b border-surface-200 text-sm">
              <span className="text-surface-600">اسم الباقة</span>
              <span className="font-bold">{plan.name}</span>
            </div>
            <div className="flex justify-between items-center py-3 border-b border-surface-200 text-sm">
              <span className="text-surface-600">المدة</span>
              <span className="font-bold">{plan.durationDays} يوم</span>
            </div>
            <div className="flex justify-between items-center pt-4">
              <span className="text-surface-900 font-bold">الإجمالي</span>
              <span className="font-black text-2xl text-primary-600">{plan.price.toString()} ج.م</span>
            </div>
          </div>

          {/* Plan Features */}
          <div className="bg-white rounded-2xl border border-surface-200 p-6">
            <h3 className="font-bold text-surface-900 mb-4">ميزات الباقة</h3>
            <div className="space-y-2.5 text-sm">
              {Object.entries(featureLabels).map(([key, meta]) => {
                const val = features?.[key];
                if (val === undefined || val === null) return null;

                if (meta.type === "number") {
                  return (
                    <div key={key} className="flex items-center gap-3">
                      <Check className="w-4 h-4 text-success-500 shrink-0" />
                      <span>{val === -1 ? `عدد غير محدود من ${meta.label}` : `حتى ${val} ${meta.suffix}`}</span>
                    </div>
                  );
                }

                return (
                  <div key={key} className="flex items-center gap-3">
                    {val ? (
                      <Check className="w-4 h-4 text-success-500 shrink-0" />
                    ) : (
                      <X className="w-4 h-4 text-surface-300 shrink-0" />
                    )}
                    <span className={val ? "" : "text-surface-400 line-through"}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bg-primary-50 rounded-2xl p-5 border border-primary-100">
            <h4 className="font-bold text-primary-900 text-sm mb-2">تعليمات هامة</h4>
            <ul className="text-xs text-primary-800 space-y-2 list-disc list-inside leading-relaxed">
              <li>يرجى اختيار طريقة الدفع المناسبة وتحويل المبلغ المطلوب.</li>
              <li>قم بالاحتفاظ بصورة الإيصال (سكرين شوت) واضحة توضح رقم العملية.</li>
              <li>ارفع الإيصال هنا واضغط تأكيد لتدخل في المراجعة.</li>
              <li>التفعيل يتم خلال ساعة من رفع الطلب كحد أقصى.</li>
            </ul>
          </div>
        </div>

        {/* Payment Methods and Upload */}
        <div className="md:col-span-2">
          <CheckoutForm planId={plan.id} methods={methods} storeId={store.id} />
        </div>

      </div>
    </div>
  );
}
