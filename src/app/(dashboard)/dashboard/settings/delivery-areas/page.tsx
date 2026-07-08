import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { Map, Plus } from "lucide-react";
import { addDeliveryArea, deleteDeliveryArea, toggleDeliveryArea } from "./actions";
import { DeleteConfirmButton } from "@/components/dashboard/DeleteConfirmButton";
import { SubmitButton } from "@/components/dashboard/SubmitButton";
import { notFound } from "next/navigation";

export const metadata = {
  title: "مناطق التوصيل | لوحة التحكم",
};

export default async function DeliveryAreasPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    notFound();
  }

  const areas = await prisma.deliveryArea.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* إضافة منطقة جديد */}
        <div className="bg-white border-2 border-surface-100 rounded-[32px] p-6 lg:p-8 self-start sticky top-24 max-h-[calc(100vh-6rem)] overflow-y-auto scrollbar-hide">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Plus className="w-5 h-5 text-primary-600" />
            إضافة منطقة توصيل
          </h3>
          <form action={addDeliveryArea as any} className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-bold text-surface-950 mb-2">اسم المنطقة *</label>
              <input type="text" name="name" id="name" required placeholder="مثال: مدينة نصر" className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none" />
            </div>
            <div>
              <label htmlFor="fee" className="block text-sm font-bold text-surface-950 mb-2">رسوم التوصيل *</label>
              <input type="number" step="0.01" min="0" name="fee" id="fee" required placeholder="0.00" className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-[24px] text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-end" dir="ltr" />
            </div>
            <SubmitButton className="w-full mt-4 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-[24px] font-bold transition-colors">
              حفظ المنطقة
            </SubmitButton>
          </form>
        </div>

        {/* قائمة المناطق */}
        <div className="lg:col-span-2 space-y-4">
          {areas.length === 0 ? (
            <div className="text-center py-20 bg-white border-2 border-surface-100 rounded-[32px]">
              <Map className="w-16 h-16 text-surface-300 mx-auto mb-4" />
              <p className="text-surface-500 font-medium text-lg">لا توجد مناطق توصيل مضافة حالياً.</p>
            </div>
          ) : (
            areas.map(area => (
              <div key={area.id} className="bg-white border-2 border-surface-100 rounded-[24px] p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors hover:border-surface-200">
                <div>
                  <h4 className="font-bold text-xl text-surface-950">{area.name}</h4>
                  <p className="text-sm font-black text-primary-600 mt-2">رسوم التوصيل: {Number(area.deliveryFee)}</p>
                </div>
                <div className="flex items-center gap-4 w-full sm:w-auto justify-end">
                  <form action={toggleDeliveryArea as any}>
                    <input type="hidden" name="areaId" value={area.id} />
                    <button type="submit" className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors focus:outline-none ${area.isActive ? 'bg-success-500' : 'bg-surface-300'}`}>
                      <span className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${area.isActive ? '-translate-x-6' : '-translate-x-1'}`} />
                    </button>
                  </form>
                  <div className="w-px h-6 bg-surface-200"></div>
                  <DeleteConfirmButton action={deleteDeliveryArea.bind(null, area.id) as any} />
                </div>
              </div>
            ))
          )}
        </div>

      </div>
    </div>
  );
}

