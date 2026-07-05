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
      cardClasses: "bg-primary-50 border-primary-100 text-primary-950",
      iconClasses: "bg-primary-100 text-primary-600",
      labelClasses: "text-primary-800/80",
    },
    {
      title: "إجمالي المبيعات",
      value: formatPrice(Number(revenueResult._sum.total || 0), currency),
      icon: DollarSign,
      cardClasses: "bg-green-50 border-green-100 text-green-950",
      iconClasses: "bg-green-100 text-green-600",
      labelClasses: "text-green-800/80",
    },
    {
      title: "إجمالي الأقسام",
      value: categoriesCount,
      icon: FolderTree,
      cardClasses: "bg-accent-50 border-accent-100 text-accent-950",
      iconClasses: "bg-accent-100 text-accent-600",
      labelClasses: "text-accent-800/80",
    },
    {
      title: "إجمالي الأصناف",
      value: menuItemsCount,
      icon: UtensilsCrossed,
      cardClasses: "bg-yellow-50 border-yellow-100 text-yellow-950",
      iconClasses: "bg-yellow-100 text-yellow-600",
      labelClasses: "text-yellow-800/80",
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
