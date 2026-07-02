"use client";

import { useState } from "react";
import { Send, Bell, Image as ImageIcon, Link as LinkIcon, Activity } from "lucide-react";
import toast from "react-hot-toast";

export default function PushNotificationsPage({
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
    <div className="max-w-5xl mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-bold text-surface-950 flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary-500" />
            إشعارات المتجر
          </h1>
          <p className="text-surface-500 mt-1">
            أرسل عروض وتنبيهات لعملائك المشتركين لتشجيعهم على الطلب
          </p>
        </div>
        <div className="bg-white border border-surface-200 rounded-xl p-4 flex items-center gap-4 shadow-sm">
          <div className="w-12 h-12 bg-primary-50 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-primary-500" />
          </div>
          <div>
            <p className="text-sm text-surface-500">إجمالي المشتركين</p>
            <p className="text-2xl font-bold text-surface-950">{subscribersCount}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Send Notification Form */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-100 bg-surface-50">
              <h2 className="font-bold text-surface-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-primary-500" />
                إرسال إشعار جديد
              </h2>
            </div>
            <div className="p-4">
              <form onSubmit={handleSend} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1">
                    عنوان الإشعار *
                  </label>
                  <input
                    type="text"
                    name="title"
                    required
                    placeholder="مثال: خصم 20٪ اليوم فقط!"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1">
                    التفاصيل (الوصف) *
                  </label>
                  <textarea
                    name="body"
                    required
                    rows={3}
                    placeholder="اطلب الآن واستفد من العرض الحصري..."
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                  ></textarea>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1 flex items-center gap-1">
                    <ImageIcon className="w-4 h-4 text-surface-400" />
                    رابط صورة (اختياري)
                  </label>
                  <input
                    type="url"
                    name="image"
                    placeholder="https://example.com/image.png"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left"
                    dir="ltr"
                  />
                  <p className="text-xs text-surface-400 mt-1">يُفضل استخدام صورة بنسبة 2:1</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-surface-900 mb-1 flex items-center gap-1">
                    <LinkIcon className="w-4 h-4 text-surface-400" />
                    رابط الوجهة (اختياري)
                  </label>
                  <input
                    type="url"
                    name="link"
                    placeholder="يفتح المتجر افتراضياً"
                    className="w-full px-3 py-2 border border-surface-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-left"
                    dir="ltr"
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={isSending || subscribersCount === 0}
                  className="w-full bg-primary-600 text-white font-bold py-3 px-4 rounded-xl hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 mt-2"
                >
                  {isSending ? (
                    <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      إرسال الآن
                      <Send className="w-4 h-4 rtl:-scale-x-100" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Campaign History */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-surface-200 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-surface-100 bg-surface-50 flex items-center justify-between">
              <h2 className="font-bold text-surface-900 flex items-center gap-2">
                <Activity className="w-4 h-4 text-primary-500" />
                سجل الإشعارات المرسلة
              </h2>
            </div>
            
            {campaigns.length === 0 ? (
              <div className="p-12 text-center text-surface-500">
                <Bell className="w-12 h-12 text-surface-200 mx-auto mb-3" />
                <p>لم تقم بإرسال أي إشعارات بعد</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-right">
                  <thead className="bg-surface-50 text-surface-500 border-b border-surface-100 text-xs uppercase">
                    <tr>
                      <th className="px-4 py-3">تاريخ الإرسال</th>
                      <th className="px-4 py-3">العنوان</th>
                      <th className="px-4 py-3">الاستهداف</th>
                      <th className="px-4 py-3">النجاح</th>
                      <th className="px-4 py-3">معدل الاستلام</th>
                    </tr>
                  </thead>
                  <tbody>
                    {campaigns.map((camp) => {
                      const successRate = camp.targetCount > 0 
                        ? Math.round((camp.successCount / camp.targetCount) * 100) 
                        : 0;
                        
                      return (
                        <tr key={camp.id} className="border-b border-surface-50 last:border-0 hover:bg-surface-50/50">
                          <td className="px-4 py-3 text-surface-500">
                            {new Date(camp.createdAt).toLocaleDateString("ar-EG")}
                          </td>
                          <td className="px-4 py-3 font-medium text-surface-900">
                            {camp.title}
                          </td>
                          <td className="px-4 py-3 text-surface-600">
                            {camp.targetCount}
                          </td>
                          <td className="px-4 py-3 text-success-600 font-bold">
                            {camp.successCount}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-2 bg-surface-200 rounded-full overflow-hidden">
                                <div 
                                  className="h-full bg-success-500" 
                                  style={{ width: `${successRate}%` }}
                                ></div>
                              </div>
                              <span className="text-xs font-medium text-surface-600">
                                %{successRate}
                              </span>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
