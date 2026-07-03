"use client";

import { useState } from "react";
import { Send, Bell, Image as ImageIcon, Link as LinkIcon, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function PushNotificationsClient({
  subscribersCount,
  campaigns,
}: {
  subscribersCount: number;
  campaigns: any[];
}) {
  const [isSending, setIsSending] = useState(false);

  const handleSend = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (subscribersCount === 0) {
      toast.error("لا يوجد مشتركون لإرسال الإشعار إليهم");
      return;
    }

    const formData = new FormData(e.currentTarget);
    const title = formData.get("title") as string;
    const body = formData.get("body") as string;
    const image = formData.get("image") as string;
    const link = formData.get("link") as string;

    setIsSending(true);
    try {
      const res = await fetch("/api/push/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, body, image, link }),
      });

      const data = await res.json();
      if (res.ok) {
        toast.success(`تم إرسال الإشعار بنجاح لـ ${data.campaign.successCount} مشترك`);
        setTimeout(() => window.location.reload(), 1500);
      } else {
        toast.error(data.error || "فشل إرسال الإشعار");
      }
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء إرسال الإشعار");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      
      <div className="bg-surface-50 rounded-[32px] p-6 lg:p-8 flex items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-bold text-surface-950 mb-1">إجمالي المشتركين</h3>
          <p className="text-surface-500 font-medium text-sm">عدد الأشخاص الذين فعلوا الإشعارات</p>
        </div>
        <div className="flex items-center justify-center w-16 h-16 bg-primary-100 rounded-3xl text-primary-600 font-black text-2xl">
          {subscribersCount}
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* Send Notification Form */}
        <div className="bg-surface-50 rounded-[32px] p-6 lg:p-8 h-max">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Send className="w-5 h-5 text-primary-600" />
            إرسال إشعار جديد
          </h3>
          <form onSubmit={handleSend} className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">عنوان الإشعار *</label>
              <input
                type="text"
                name="title"
                required
                placeholder="مثال: خصم 20٪ اليوم فقط!"
                className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-2xl text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2">التفاصيل (الوصف) *</label>
              <textarea
                name="body"
                required
                rows={3}
                placeholder="اطلب الآن واستفد من العرض الحصري..."
                className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-2xl text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none resize-none"
              ></textarea>
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2 flex items-center gap-1">
                <ImageIcon className="w-4 h-4 text-surface-400" />
                رابط صورة (اختياري)
              </label>
              <input
                type="url"
                name="image"
                placeholder="https://example.com/image.png"
                className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-2xl text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-left"
                dir="ltr"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-surface-950 mb-2 flex items-center gap-1">
                <LinkIcon className="w-4 h-4 text-surface-400" />
                رابط الوجهة (اختياري)
              </label>
              <input
                type="url"
                name="link"
                placeholder="يفتح المتجر افتراضياً"
                className="w-full px-5 py-3.5 bg-white border border-surface-200 rounded-2xl text-surface-950 font-medium focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 transition-colors outline-none text-left"
                dir="ltr"
              />
            </div>
            
            <button
              type="submit"
              disabled={isSending || subscribersCount === 0}
              className="w-full mt-4 py-4 bg-primary-600 hover:bg-primary-700 text-white rounded-2xl font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSending ? (
                <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  إرسال الآن
                  <Send className="w-5 h-5 rtl:-scale-x-100" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Campaign History */}
        <div className="bg-surface-50 rounded-[32px] p-6 lg:p-8">
          <h3 className="text-xl font-bold text-surface-950 mb-6 flex items-center gap-2">
            <Activity className="w-5 h-5 text-primary-600" />
            سجل الإشعارات المرسلة
          </h3>
          
          {campaigns.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-3xl border-2 border-surface-100">
              <Bell className="w-16 h-16 text-surface-200 mx-auto mb-4" />
              <p className="text-surface-500 font-medium">لم تقم بإرسال أي إشعارات بعد</p>
            </div>
          ) : (
            <div className="space-y-4">
              {campaigns.map((camp) => {
                const successRate = camp.targetCount > 0 
                  ? Math.round((camp.successCount / camp.targetCount) * 100) 
                  : 0;
                  
                return (
                  <div key={camp.id} className="bg-white border-2 border-surface-100 rounded-3xl p-5 hover:border-surface-200 transition-colors">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                      <div>
                        <h4 className="font-bold text-lg text-surface-950 mb-1">{camp.title}</h4>
                        <p className="text-sm text-surface-500 font-medium">
                          {new Date(camp.createdAt).toLocaleDateString("ar-EG", { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                      </div>
                      <div className="bg-success-50 text-success-700 px-4 py-2 rounded-2xl text-sm font-bold whitespace-nowrap text-center">
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
    </div>
  );
}
