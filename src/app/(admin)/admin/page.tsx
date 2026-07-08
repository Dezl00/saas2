import { prisma } from "@/lib/prisma";
import { Users, Store, ShoppingBag, TrendingUp } from "lucide-react";
import Link from "next/link";

export default async function AdminDashboard() {
  const [usersCount, storesCount, ordersCount, recentStores] =
    await Promise.all([
      prisma.user.count({ where: { role: "OWNER" } }),
      prisma.store.count(),
      prisma.order.count(),
      prisma.store.findMany({
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { user: true, _count: { select: { orders: true } } },
      }),
    ]);

  const stats = [
    {
      icon: Users,
      label: "المستخدمين",
      value: usersCount,
      cardClasses: "bg-primary-50 border-primary-100 text-primary-950",
      iconClasses: "bg-primary-100 text-primary-600",
      labelClasses: "text-primary-800/80",
    },
    {
      icon: Store,
      label: "المتاجر",
      value: storesCount,
      cardClasses: "bg-accent-50 border-accent-100 text-accent-950",
      iconClasses: "bg-accent-100 text-accent-600",
      labelClasses: "text-accent-800/80",
    },
    {
      icon: ShoppingBag,
      label: "إجمالي الطلبات",
      value: ordersCount,
      cardClasses: "bg-green-50 border-green-100 text-green-950",
      iconClasses: "bg-green-100 text-green-600",
      labelClasses: "text-green-800/80",
    },
    {
      icon: TrendingUp,
      label: "المتاجر النشطة",
      value: recentStores.filter((s) => s.status === "ACTIVE").length,
      cardClasses: "bg-yellow-50 border-yellow-100 text-yellow-950",
      iconClasses: "bg-yellow-100 text-yellow-600",
      labelClasses: "text-yellow-800/80",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-sm text-surface-500 font-medium">
          <span className="text-surface-900 font-bold">الرئيسية</span>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <div
            key={i}
            className={`rounded-[24px] p-6 border ${stat.cardClasses}`}
          >
            <div className="flex items-center justify-between mb-4">
              <div
                className={`w-12 h-12 rounded-[24px] flex items-center justify-center ${stat.iconClasses}`}
              >
                <stat.icon className="w-6 h-6" />
              </div>
            </div>
            <p className="text-2xl font-bold mb-1">{stat.value}</p>
            <p className={`text-sm font-semibold ${stat.labelClasses}`}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Recent Stores */}
      <div className="bg-white rounded-[24px] border border-surface-200 overflow-hidden">
        <div className="p-6 border-b border-surface-100 flex items-center justify-between">
          <h2 className="text-base font-semibold text-surface-950">آخر المتاجر المسجلة</h2>
          <Link
            href="/admin/stores"
            className="text-sm text-primary-500 hover:text-primary-600 font-medium"
          >
            عرض الكل
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-surface-100 bg-surface-50">
                <th className="text-start px-6 py-3 text-xs font-medium text-surface-800/60 uppercase">
                  المتجر
                </th>
                <th className="text-start px-6 py-3 text-xs font-medium text-surface-800/60 uppercase">
                  المالك
                </th>
                <th className="text-start px-6 py-3 text-xs font-medium text-surface-800/60 uppercase">
                  النوع
                </th>
                <th className="text-start px-6 py-3 text-xs font-medium text-surface-800/60 uppercase">
                  الحالة
                </th>
                <th className="text-start px-6 py-3 text-xs font-medium text-surface-800/60 uppercase">
                  الطلبات
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-surface-100">
              {recentStores.map((store) => (
                <tr
                  key={store.id}
                  className="hover:bg-surface-50 transition-colors"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-[24px] bg-primary-100 flex items-center justify-center">
                        <Store className="w-5 h-5 text-primary-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-surface-950">
                          {store.name}
                        </p>
                        {store.subdomain && (
                          <p className="text-xs text-surface-800/50">
                            {store.subdomain}
                          </p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-surface-800/70">
                    {store.user.name}
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-2.5 py-1 rounded-lg text-xs font-medium bg-primary-100 text-primary-700">
                      {store.type === "RESTAURANT"
                        ? "مطعم"
                        : store.type === "MARKET"
                          ? "ماركت"
                          : store.type === "PHARMACY"
                            ? "صيدلية"
                            : "أخرى"}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-2.5 py-1 rounded-lg text-xs font-medium ${
                        store.status === "ACTIVE"
                          ? "bg-green-100 text-green-700"
                          : store.status === "SUSPENDED"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-red-100 text-red-700"
                      }`}
                    >
                      {store.status === "ACTIVE"
                        ? "نشط"
                        : store.status === "SUSPENDED"
                          ? "موقوف"
                          : "محذوف"}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm font-medium text-surface-950">
                    {store._count.orders}
                  </td>
                </tr>
              ))}
              {recentStores.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-6 py-12 text-center text-surface-800/50"
                  >
                    لا توجد متاجر مسجلة بعد
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
