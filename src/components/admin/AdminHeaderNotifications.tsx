"use client";

import { useState, useEffect, useRef } from "react";
import { Bell, CheckCheck, UserPlus, Info } from "lucide-react";
import { getAdminNotifications, markAdminNotificationAsRead, markAllAdminNotificationsAsRead } from "@/app/(admin)/admin/notificationActions";
import Link from "next/link";
import { useRouter } from "next/navigation";

export function AdminHeaderNotifications() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const fetchNotifications = async () => {
    try {
      const data = await getAdminNotifications();
      setNotifications(data.recent);
      setUnreadCount(data.unreadCount);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchNotifications();
    // Poll every 60 seconds
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleMarkAllRead = async () => {
    await markAllAdminNotificationsAsRead();
    await fetchNotifications();
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.isRead) {
      await markAdminNotificationAsRead(notif.id);
      await fetchNotifications();
    }
    setIsOpen(false);
    if (notif.link) {
      router.push(notif.link);
    }
  };

  const getTimeAgo = (date: Date) => {
    const diff = Math.floor((new Date().getTime() - new Date(date).getTime()) / 1000);
    if (diff < 60) return "الآن";
    if (diff < 3600) return `منذ ${Math.floor(diff / 60)} دقيقة`;
    if (diff < 86400) return `منذ ${Math.floor(diff / 3600)} ساعة`;
    return `منذ ${Math.floor(diff / 86400)} يوم`;
  };

  return (
    <div className="relative" ref={containerRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-10 h-10 rounded-xl bg-surface-50 border border-surface-200 flex items-center justify-center text-surface-600 hover:bg-surface-100 hover:text-primary-600 transition-colors relative"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 px-1 bg-error-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center border-2 border-white shadow-sm">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl border border-surface-100 overflow-hidden z-50 animate-fade-in">
          <div className="p-4 border-b border-surface-100 flex items-center justify-between bg-surface-50/50">
            <h3 className="font-bold text-surface-950 flex items-center gap-2">
              الإشعارات
              {unreadCount > 0 && (
                <span className="px-2 py-0.5 rounded-md bg-error-100 text-error-700 text-xs">{unreadCount} جديد</span>
              )}
            </h3>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-xs font-bold text-primary-600 hover:text-primary-700 flex items-center gap-1 transition-colors"
              >
                <CheckCheck className="w-3 h-3" />
                تحديد كمقروء
              </button>
            )}
          </div>

          <div className="max-h-[350px] overflow-y-auto">
            {notifications.length === 0 ? (
              <div className="p-8 text-center text-surface-500 flex flex-col items-center justify-center gap-2">
                <Bell className="w-8 h-8 text-surface-300" />
                <p className="text-sm font-medium">لا توجد إشعارات حالياً</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-100">
                {notifications.map((notif) => (
                  <button
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={`w-full text-start p-4 hover:bg-surface-50 transition-colors flex gap-4 ${!notif.isRead ? 'bg-primary-50/50' : ''}`}
                  >
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${notif.type === 'NEW_USER' ? 'bg-primary-100 text-primary-600' : 'bg-surface-100 text-surface-600'}`}>
                      {notif.type === 'NEW_USER' ? <UserPlus className="w-5 h-5" /> : <Info className="w-5 h-5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`text-sm truncate ${!notif.isRead ? 'font-bold text-surface-950' : 'font-medium text-surface-800'}`}>
                        {notif.title}
                      </p>
                      <p className={`text-xs mt-1 line-clamp-2 ${!notif.isRead ? 'text-surface-600 font-medium' : 'text-surface-500'}`}>
                        {notif.message}
                      </p>
                      <p className="text-[10px] text-surface-400 mt-2 font-medium" dir="ltr">{getTimeAgo(notif.createdAt)}</p>
                    </div>
                    {!notif.isRead && (
                      <div className="w-2 h-2 rounded-full bg-primary-500 flex-shrink-0 mt-2" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="p-3 border-t border-surface-100 bg-surface-50 text-center">
            <Link
              href="/admin/notifications"
              onClick={() => setIsOpen(false)}
              className="text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors"
            >
              عرض جميع الإشعارات
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
