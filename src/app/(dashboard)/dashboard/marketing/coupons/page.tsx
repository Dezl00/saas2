import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Plus, Ticket, Percent } from "lucide-react";
import { addCoupon } from "./actions/add-coupon";
import { deleteCoupon } from "./actions/delete-coupon";
import { toggleCoupon } from "./actions/toggle-coupon";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import { formatPrice } from "@/lib/utils";

export const metadata = {
  title: "الكوبونات | لوحة التحكم",
};

export default async function CouponsPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    return null;
  }

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    select: { currency: true }
  });

  const coupons = await prisma.coupon.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* إضافة كوبون جديد */}
        <div className="bg-white border-2 border-surface-100 rounded-[24px] p-6 lg:p-8 self-start sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-600" />
            إضافة كوبون جديد
          </h3>
          <form action={addCoupon as any} className="space-y-4">
            <div>
              <label htmlFor="code" className="block text-sm font-bold text-surface-950 mb-2">كود الخصم *</label>
              <input type="text" name="code" id="code" required placeholder="مثال: SUMMER20" dir="ltr" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none uppercase font-black tracking-wider transition-colors" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="type" className="block text-sm font-bold text-surface-950 mb-2">نوع الخصم *</label>
                <select name="type" id="type" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-medium transition-colors cursor-pointer">
                  <option value="PERCENTAGE">نسبة مئوية (%)</option>
                  <option value="FIXED">مبلغ ثابت</option>
                </select>
              </div>
              <div>
                <label htmlFor="value" className="block text-sm font-bold text-surface-950 mb-2">قيمة الخصم *</label>
                <input type="number" name="value" id="value" required min="1" step="0.1" placeholder="مثال: 20" dir="ltr" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-bold transition-colors text-left" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="minOrder" className="block text-sm font-bold text-surface-950 mb-2">الحد الأدنى للطلب</label>
                <input type="number" name="minOrder" id="minOrder" min="0" step="0.5" placeholder="مثال: 100" dir="ltr" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-bold transition-colors text-left" />
              </div>
              <div>
                <label htmlFor="maxDiscount" className="block text-sm font-bold text-surface-950 mb-2">الحد الأقصى للخصم</label>
                <input type="number" name="maxDiscount" id="maxDiscount" min="0" step="0.5" placeholder="مثال: 50" dir="ltr" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-bold transition-colors text-left" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="usageLimit" className="block text-sm font-bold text-surface-950 mb-2">الحد الأقصى للاستخدام</label>
                <input type="number" name="usageLimit" id="usageLimit" min="1" placeholder="مثال: 100" dir="ltr" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-bold transition-colors text-left" />
              </div>
              <div>
                <label htmlFor="expiresAt" className="block text-sm font-bold text-surface-950 mb-2">تاريخ الانتهاء</label>
                <input type="date" name="expiresAt" id="expiresAt" className="w-full px-4 py-3 bg-white border-2 border-surface-200 rounded-[24px] text-surface-950 focus:border-primary-500 outline-none font-bold transition-colors cursor-pointer" />
              </div>
            </div>

            <button type="submit" className="w-full mt-2 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-all flex items-center justify-center gap-2 text-lg">
              <Ticket className="w-5 h-5" />
              إنشاء الكوبون
            </button>
          </form>
        </div>

        {/* قائمة الكوبونات */}
        <div className="lg:col-span-2 space-y-4">
          {coupons.length === 0 ? (
            <div className="text-center py-16 bg-white border-2 border-surface-100 rounded-[24px]">
              <Ticket className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 font-medium text-lg">لا توجد كوبونات مضافة حالياً.</p>
            </div>
          ) : (
            coupons.map(coupon => {
              const isExpired = coupon.expiresAt && new Date(coupon.expiresAt) < new Date();
              const isFullyUsed = coupon.usageLimit && coupon.usedCount >= coupon.usageLimit;
              const isInvalid = isExpired || isFullyUsed;

              return (
                <div key={coupon.id} className={`bg-white border-2 rounded-[24px] p-5 lg:p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 transition-colors ${isInvalid ? 'opacity-60 border-surface-100 bg-surface-50' : 'border-surface-100 hover:border-surface-200'}`}>
                  <div className="flex items-center gap-5">
                    <div className={`w-14 h-14 rounded-[24px] flex items-center justify-center shrink-0 border-2 ${coupon.type === 'PERCENTAGE' ? 'bg-primary-50 text-primary-600 border-primary-100' : 'bg-accent-50 text-accent-600 border-accent-100'}`}>
                      {coupon.type === 'PERCENTAGE' ? <Percent className="w-7 h-7" /> : <Ticket className="w-7 h-7" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-3">
                        <h4 className="font-black text-xl text-surface-950 tracking-wider" dir="ltr">{coupon.code}</h4>
                        {isExpired && <span className="text-xs bg-error-50 text-error-700 border-2 border-error-100 px-3 py-1 rounded-[24px] font-bold">منتهي الصلاحية</span>}
                        {isFullyUsed && <span className="text-xs bg-error-50 text-error-700 border-2 border-error-100 px-3 py-1 rounded-[24px] font-bold">مستنفذ العدد</span>}
                      </div>
                      <p className="text-base font-bold text-surface-600 mt-2">
                        خصم {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` : formatPrice(Number(coupon.value), store?.currency)}
                        {coupon.maxDiscount && ` (بحد أقصى ${formatPrice(Number(coupon.maxDiscount), store?.currency)})`}
                      </p>
                      <div className="flex flex-wrap gap-3 text-sm text-surface-500 font-medium mt-3">
                        <span className="bg-surface-100 px-3 py-1 rounded-[24px]">الاستخدام: <strong className="text-surface-950">{coupon.usedCount} {coupon.usageLimit ? `/ ${coupon.usageLimit}` : 'مرة'}</strong></span>
                        {coupon.minOrder && <span className="bg-surface-100 px-3 py-1 rounded-[24px]">الحد الأدنى للطلب: <strong className="text-surface-950">{formatPrice(Number(coupon.minOrder), store?.currency)}</strong></span>}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 self-end sm:self-center">
                    <form action={toggleCoupon.bind(null, coupon.id) as any}>
                      <button type="submit" disabled={isInvalid as boolean} className={`relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none ${coupon.isActive && !isInvalid ? 'bg-success-500' : 'bg-surface-300'} ${isInvalid ? 'opacity-50 cursor-not-allowed' : ''}`}>
                        <span className={`inline-block h-6 w-6 transform rounded-full bg-white transition-transform ${coupon.isActive && !isInvalid ? '-translate-x-7' : '-translate-x-1'}`} />
                      </button>
                    </form>
                    <DeleteConfirmButton action={deleteCoupon.bind(null, coupon.id) as any} />
                  </div>
                </div>
              );
            })
          )}
        </div>

      </div>
    </div>
  );
}
