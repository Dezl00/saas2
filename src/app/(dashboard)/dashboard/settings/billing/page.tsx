import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check, X, CalendarDays, AlertTriangle, ArrowLeft, Crown } from "lucide-react";
import { AlreadySubscribedToast } from "./AlreadySubscribedToast";

export default async function TenantBillingPage() {
  const session = await auth();

  // Get Store
  const store = await prisma.store.findUnique({
    where: { id: session?.user?.storeId as string },
    include: {
      subscription: {
        include: { plan: true }
      }
    }
  });

  if (!store) redirect("/onboarding");

  const plans = await prisma.plan.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" }
  });

  const sub = store.subscription;
  const currentPlanId = sub?.planId;
  const isExpired = sub && (sub.status === "SUSPENDED" || sub.status === "ARCHIVED" || sub.status === "CANCELLED");
  const isGrace = sub && sub.status === "GRACE_PERIOD";

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
    <div className="space-y-8">
      <AlreadySubscribedToast />
      
      {/* Current Subscription Status */}
      <div className={`rounded-[32px] p-6 sm:p-8 flex flex-col sm:flex-row gap-6 items-start sm:items-center justify-between transition-colors border-2 ${
          !sub || sub.status === "TRIAL" ? "bg-primary-50 border-primary-100" :
          sub.status === "ACTIVE" ? "bg-success-50 border-success-100" :
          isGrace ? "bg-warning-50 border-warning-100" : "bg-danger-50 border-danger-100"
        }`}>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold text-surface-950">
              الباقة الحالية: {sub?.plan?.name || "الفترة التجريبية (Trial)"}
            </h2>
            <span className={`px-3 py-1 text-sm font-bold rounded-xl ${
              !sub || sub.status === "TRIAL" ? "bg-white text-primary-700" :
              sub.status === "ACTIVE" ? "bg-white text-success-700" :
              sub.status === "PENDING_PAYMENT" ? "bg-white text-warning-700" :
              isGrace ? "bg-white text-warning-700" :
              "bg-white text-danger-700"
            }`}>
              {!sub || sub.status === "TRIAL" ? "تجريبية" :
               sub.status === "ACTIVE" ? "نشطة" :
               sub.status === "PENDING_PAYMENT" ? "مراجعة الدفع" :
               isGrace ? "فترة سماح" : "منتهية"}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-sm font-medium text-surface-600">
            {sub?.endDate && (
              <div className="flex items-center gap-2">
                <CalendarDays className="w-5 h-5 text-surface-400" />
                <span>ينتهي في: <strong className="text-surface-950">{new Date(sub.endDate).toLocaleDateString("ar-EG")}</strong></span>
              </div>
            )}
            
            {isExpired && (
              <div className="flex items-center gap-2 text-danger-700 bg-white px-4 py-2 rounded-xl border-2 border-danger-100">
                <AlertTriangle className="w-5 h-5" />
                <span>اشتراكك منتهي. يرجى التجديد لتتمكن من التعديل وإدارة متجرك.</span>
              </div>
            )}
            {isGrace && (
              <div className="flex items-center gap-2 text-warning-700 bg-white px-4 py-2 rounded-xl border-2 border-warning-100">
                <AlertTriangle className="w-5 h-5" />
                <span>أنت في فترة السماح. قم بالتجديد لتجنب توقف التعديل على متجرك.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Available Plans */}
      <div className="space-y-6">
        <h3 className="text-xl font-bold text-surface-950 flex items-center gap-2">
          <Crown className="w-5 h-5 text-primary-600" />
          الباقات المتاحة للترقية أو التجديد
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map(plan => {
            const features = plan.features as any;
            const isCurrentPlan = currentPlanId === plan.id && sub?.status === "ACTIVE";
            return (
              <div key={plan.id} className={`bg-white border-2 rounded-[32px] p-6 lg:p-8 flex flex-col transition-all ${
                isCurrentPlan 
                  ? "border-primary-500 bg-primary-50/50" 
                  : "border-surface-100 hover:border-surface-200"
              }`}>
                {isCurrentPlan && (
                  <div className="bg-primary-600 text-white text-xs font-bold px-4 py-1.5 rounded-xl self-start mb-4">
                    ✓ باقتك الحالية
                  </div>
                )}
                <div className="mb-4">
                  <h4 className="text-2xl font-black text-surface-950">{plan.name}</h4>
                  <p className="text-sm font-medium text-surface-500 mt-2 h-10 line-clamp-2">{plan.description}</p>
                </div>
                
                <div className="mb-6 flex items-baseline gap-1">
                  <span className="text-4xl font-black text-surface-950">{plan.price.toString()}</span>
                  <span className="text-surface-500 font-bold">ج.م / {plan.durationDays} يوم</span>
                </div>

                <div className="flex-1 space-y-3 mb-8 text-sm font-medium">
                  {Object.entries(featureLabels).map(([key, meta]) => {
                    const val = features?.[key];
                    if (val === undefined || val === null) return null;

                    if (meta.type === "number") {
                      return (
                        <div key={key} className="flex items-center gap-3">
                          <Check className="w-5 h-5 text-success-500 shrink-0" />
                          <span className="text-surface-950">{val === -1 ? `عدد غير محدود من ${meta.label}` : `حتى ${val} ${meta.suffix}`}</span>
                        </div>
                      );
                    }

                    // Boolean feature
                    return (
                      <div key={key} className="flex items-center gap-3">
                        {val ? (
                          <Check className="w-5 h-5 text-success-500 shrink-0" />
                        ) : (
                          <X className="w-5 h-5 text-surface-300 shrink-0" />
                        )}
                        <span className={val ? "text-surface-950" : "text-surface-400 line-through"}>{meta.label}</span>
                      </div>
                    );
                  })}
                </div>

                {isCurrentPlan ? (
                  <div className="mt-auto flex items-center justify-center gap-2 w-full py-4 px-4 rounded-2xl font-bold text-primary-600 bg-white border-2 border-primary-200 cursor-default">
                    أنت مشترك بالفعل
                  </div>
                ) : (
                  <Link
                    href={`/dashboard/settings/billing/${plan.id}`}
                    className="mt-auto flex items-center justify-center gap-2 w-full py-4 px-4 rounded-2xl font-bold text-white bg-primary-600 hover:bg-primary-700 transition-colors"
                  >
                    اشتراك الآن
                    <ArrowLeft className="w-5 h-5 rtl:rotate-180" />
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  );
}
