import { auth } from "@/lib/auth";
import { Breadcrumb } from "@/components/dashboard/Breadcrumb";
import { MapPin, Map, Ticket, Settings, LogOut, ChevronLeft, FileUp, CreditCard, Palette, Bell, Percent } from "lucide-react";
import Link from "next/link";

export const metadata = {
  title: "المزيد | لوحة التحكم",
};

export default async function MorePage() {
  const session = await auth();

  if (!session?.user?.storeId) {
    return null;
  }

  const moreItems = [
    { href: "/dashboard/banners", icon: Ticket, label: "العروض والبانرات" },
    { href: "/dashboard/coupons", icon: Percent, label: "كوبونات الخصم" },
    { href: "/dashboard/push-notifications", icon: Bell, label: "الإشعارات" },
    { href: "/dashboard/appearance", icon: Palette, label: "المظهر" },
    { href: "/dashboard/branches", icon: MapPin, label: "الفروع" },
    { href: "/dashboard/delivery-areas", icon: Map, label: "مناطق التوصيل" },
    { href: "/dashboard/import-export", icon: FileUp, label: "استيراد وتصدير" },
    { href: "/dashboard/billing", icon: CreditCard, label: "الاشتراك والفوترة" },
    { href: "/dashboard/settings", icon: Settings, label: "الإعدادات" },
  ];

  return (
    <div className="animate-fade-in pb-20">
      <Breadcrumb title="المزيد" />
      
      <div className="mt-6">
        <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden divide-y divide-surface-100">
          {moreItems.map((item, i) => (
            <Link
              key={i}
              href={item.href}
              className="flex items-center justify-between p-4 bg-white hover:bg-surface-50 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-[24px] bg-surface-100 flex items-center justify-center">
                  <item.icon className="w-5 h-5 text-surface-600" />
                </div>
                <span className="font-bold text-surface-950">{item.label}</span>
              </div>
              <ChevronLeft className="w-5 h-5 text-surface-400" />
            </Link>
          ))}
        </div>

        <div className="mt-6 bg-white rounded-[24px] border border-surface-200 overflow-hidden">
          <Link
            href="/api/auth/signout"
            className="flex items-center justify-between p-4 bg-white hover:bg-error-50 transition-colors group"
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-[24px] bg-error-50 group-hover:bg-error-100 flex items-center justify-center transition-colors">
                <LogOut className="w-5 h-5 text-error-600" />
              </div>
              <span className="font-bold text-error-600">تسجيل الخروج</span>
            </div>
            <ChevronLeft className="w-5 h-5 text-error-400 group-hover:text-error-600 transition-colors" />
          </Link>
        </div>
      </div>
    </div>
  );
}

