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
      cardClasses: "bg-primary-50 text-primary-950",
      iconClasses: "bg-primary-100 text-primary-600",
      labelClasses: "text-primary-800",
    },
    {
      title: "إجمالي المبيعات",
      value: formatPrice(Number(revenueResult._sum.total || 0), currency),
      icon: DollarSign,
      cardClasses: "bg-[#E8F5E9] text-[#2E7D32]",
      iconClasses: "bg-[#C8E6C9] text-[#1B5E20]",
      labelClasses: "text-[#388E3C]",
    },
    {
      title: "إجمالي الأقسام",
      value: categoriesCount,
      icon: FolderTree,
      cardClasses: "bg-[#F3E5F5] text-[#6A1B9A]",
      iconClasses: "bg-[#E1BEE7] text-[#4A148C]",
      labelClasses: "text-[#7B1FA2]",
    },
    {
      title: "إجمالي الأصناف",
      value: menuItemsCount,
      icon: UtensilsCrossed,
      cardClasses: "bg-[#FFF3E0] text-[#E65100]",
      iconClasses: "bg-[#FFE0B2] text-[#E65100]",
      labelClasses: "text-[#F57C00]",
    },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      {stats.map((stat, i) => (
        <StatsCard key={i} {...stat} />
      ))}
    </div>
  );
}
