import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Bell, ArrowRight } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "سجل الإشعارات | لوحة التحكم",
};

export default async function PushNotificationsHistoryPage() {
  const session = await auth();
  if (!session?.user?.storeId) {
    redirect("/login");
  }

  const storeId = session.user.storeId;

  const campaigns = await prisma.pushCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 100, // Reasonable limit for history
  });

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <Link 
          href="/dashboard/marketing/push-notifications" 
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-surface-200 text-surface-600 hover:text-primary-600 hover:border-primary-200 hover:bg-primary-50 transition-colors"
        >
          <ArrowRight className="w-5 h-5 rtl:-scale-x-100" />
        </Link>
        <div>
          <h2 className="text-2xl font-bold text-surface-950">سجل الإشعارات الكامل</h2>
          <p className="text-surface-500 font-medium mt-1">عرض جميع الإشعارات المرسلة مسبقاً</p>
        </div>
      </div>

      <div className="bg-white border-2 border-surface-100 rounded-[24px] p-6 lg:p-8">
        {campaigns.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-[24px] border-2 border-surface-100">
            <Bell className="w-16 h-16 text-surface-200 mx-auto mb-4" />
            <p className="text-surface-500 font-medium">لم تقم بإرسال أي إشعارات بعد</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {campaigns.map((camp) => {
              const successRate = camp.targetCount > 0 
                ? Math.round((camp.successCount / camp.targetCount) * 100) 
                : 0;
                
              return (
                <div key={camp.id} className="bg-white border-2 border-surface-100 rounded-[24px] p-5 hover:border-surface-200 transition-colors">
                  <div className="flex flex-col gap-4 mb-4">
                    <div>
                      <h4 className="font-bold text-lg text-surface-950 mb-1">{camp.title}</h4>
                      <p className="text-sm text-surface-500 font-medium">
                        {new Date(camp.createdAt).toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                    <div className="bg-success-50 text-success-700 px-4 py-2 rounded-[24px] text-sm font-bold text-center self-start">
                      نجح: {camp.successCount} / {camp.targetCount}
                    </div>
                  </div>
                  
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2 font-medium">
                      <span className="text-surface-600">معدل الاستلام</span>
                      <span className="text-surface-950 font-bold">%{successRate}</span>
                    </div>
                    <div className="w-full h-3 bg-surface-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success-500 rounded-full transition-all duration-500" 
                        style={{ width: `${successRate}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
