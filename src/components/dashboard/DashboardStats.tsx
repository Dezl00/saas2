import { prisma } from "@/lib/prisma";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ShoppingBag, DollarSign, FolderTree, UtensilsCrossed } from "lucide-react";
import { formatPrice } from "@/lib/utils";

export async function DashboardStats({ storeId, currency }: { storeId: string, currency?: string }) {
  const [ordersCount, revenueResult, menuItemsCount, categoriesCount] =
    await Promise.all([
      prisma.order.count({ where: { storeId } }),
      prisma.order.aggregate({
        where: { storeId, paymentStatus: "CONFIRMED" },
        _sum: { total: true },
      }),
      prisma.menuItem.count({ where: { storeId } }),
      prisma.category.count({ where: { storeId } }),
    ]);

  const stats = [
    {
      title: "إجمالي الطلبات",
      value: ordersCount,
      icon: ShoppingBag,
      cardClasses: "bg-surface-50 border-surface-100 text-surface-950",
      iconClasses: "bg-primary-50 text-primary-600 border-primary-100",
      labelClasses: "text-surface-600",
    },
    {
      title: "إجمالي المبيعات",
      value: formatPrice(Number(revenueResult._sum.total || 0), currency),
      icon: DollarSign,
      cardClasses: "bg-surface-50 border-surface-100 text-surface-950",
      iconClasses: "bg-success-50 text-success-600 border-success-100",
      labelClasses: "text-surface-600",
    },
    {
      title: "إجمالي الأقسام",
      value: categoriesCount,
      icon: FolderTree,
      cardClasses: "bg-surface-50 border-surface-100 text-surface-950",
      iconClasses: "bg-accent-50 text-accent-600 border-accent-100",
      labelClasses: "text-surface-600",
    },
    {
      title: "إجمالي الأصناف",
      value: menuItemsCount,
      icon: UtensilsCrossed,
      cardClasses: "bg-surface-50 border-surface-100 text-surface-950",
      iconClasses: "bg-yellow-50 text-yellow-600 border-yellow-100",
      labelClasses: "text-surface-600",
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <StatsCard key={i} {...stat} />
      ))}
    </div>
  );
}
