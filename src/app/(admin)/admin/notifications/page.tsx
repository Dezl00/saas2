import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { Bell, UserPlus, Info, CheckCheck } from "lucide-react";
import Link from "next/link";
import { revalidatePath } from "next/cache";

export const metadata = {
  title: "الإشعارات | لوحة الأدمن",
};

export default async function AdminNotificationsPage() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return null;

  const notifications = await prisma.adminNotification.findMany({
    orderBy: { createdAt: "desc" },
    take: 100, // Fetch the last 100 notifications for this page
  });

  const markAllAsRead = async () => {
    "use server";
    const session = await auth();
    if (session?.user?.role === "ADMIN") {
      await prisma.adminNotification.updateMany({
        where: { isRead: false },
        data: { isRead: true },
      });
      revalidatePath("/admin/notifications");
    }
  };

  const getTimeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-8 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <Link href="/admin" className="hover:text-primary-600 transition-colors">الرئيسية</Link>
          <span>/</span>
          <span className="text-surface-900 font-semibold">الإشعارات</span>
        </div>
      </div>

      <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-950 flex items-center gap-2">
              <Bell className="w-6 h-6 text-primary-500" />
              كل الإشعارات
            </h1>
            <p className="text-surface-800/60 mt-1">
              سجل كامل لجميع التنبيهات والأحداث على المنصة.
            </p>
          </div>
          {unreadCount > 0 && (
            <form action={markAllAsRead}>
              <button
                type="submit"
                className="hidden sm:flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-700 font-medium rounded-[24px] hover:bg-primary-100 transition-colors"
              >
                <CheckCheck className="w-5 h-5" />
                تحديد الكل كمقروء
              </button>
            </form>
          )}
        </div>

        {notifications.length === 0 ? (
          <div className="p-16 text-center text-surface-500 flex flex-col items-center justify-center gap-4">
            <div className="w-20 h-20 rounded-full bg-surface-50 flex items-center justify-center">
              <Bell className="w-10 h-10 text-surface-300" />
            </div>
            <p className="text-lg font-semibold text-surface-900">لا توجد إشعارات حتى الآن</p>
            <p className="text-sm">لم يقم النظام بتسجيل أي أحداث بعد.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {notifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-6 hover:bg-surface-50 transition-colors flex gap-4 ${!notif.isRead ? 'bg-primary-50/20' : ''}`}
              >
                <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'NEW_USER' ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-600'}`}>
                  {notif.type === 'NEW_USER' ? <UserPlus className="w-6 h-6" /> : <Info className="w-6 h-6" />}
                </div>
                <div className="flex-1 min-w-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className={`text-base truncate ${!notif.isRead ? 'font-bold text-surface-950' : 'font-medium text-surface-800'}`}>
                      {notif.title}
                    </h3>
                    <p className={`text-sm mt-1 ${!notif.isRead ? 'text-surface-700 font-medium' : 'text-surface-600'}`}>
                      {notif.message}
                    </p>
                    <p className="text-xs text-surface-400 mt-2 font-medium" dir="ltr">
                      {getTimeAgo(notif.createdAt)} • {new Date(notif.createdAt).toLocaleDateString('ar-EG')}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    {notif.link && (
                      <Link
                        href={notif.link}
                        className="px-4 py-2 bg-white border border-surface-200 text-surface-700 text-sm font-medium rounded-[24px] hover:bg-surface-50 transition-colors whitespace-nowrap "
                      >
                        عرض التفاصيل
                      </Link>
                    )}
                    {!notif.isRead && (
                      <div className="w-2.5 h-2.5 rounded-full bg-primary-500 " title="غير مقروء" />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
