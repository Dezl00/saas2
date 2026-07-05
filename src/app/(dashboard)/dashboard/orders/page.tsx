import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ShoppingBag } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { Pagination } from "@/components/ui/Pagination";
import { CompactOrderRow } from "@/components/dashboard/CompactOrderRow";

export const metadata = {
  title: "الطلبات | لوحة التحكم",
};

export default async function OrdersPage(props: { searchParams: Promise<{ page?: string }> }) {
  const searchParams = await props.searchParams;
  const page = Number(searchParams.page) || 1;
  const pageSize = 10;
  
  const session = await auth();
  
  if (!session?.user?.storeId) {
    return null;
  }

  const [store, totalItems] = await Promise.all([
    prisma.store.findUnique({ where: { id: session.user.storeId } }),
    prisma.order.count({ where: { storeId: session.user.storeId } })
  ]);
  
  const totalPages = Math.ceil(totalItems / pageSize);
  
  const orders = await prisma.order.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { createdAt: 'desc' },
    include: {
      items: true,
      branch: true,
      deliveryArea: true,
    },
    skip: (page - 1) * pageSize,
    take: pageSize
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between bg-white p-4 rounded-3xl border-2 border-surface-100">
        <h2 className="text-xl font-bold text-surface-950 px-2">الطلبات الواردة</h2>
      </div>
      
      <div className="space-y-6">
        {orders.length === 0 ? (
          <div className="text-center py-20 bg-surface-50 border-2 border-surface-100 rounded-[32px]">
            <div className="w-20 h-20 bg-white border-2 border-surface-200 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <ShoppingBag className="w-10 h-10 text-surface-400" />
            </div>
            <p className="text-xl text-surface-950 font-bold mb-2">لا توجد طلبات حتى الآن.</p>
            <p className="text-surface-500 font-medium">الطلبات الجديدة ستظهر هنا فور استلامها.</p>
          </div>
        ) : (
          <div className="bg-white border-2 border-surface-100 rounded-[32px] overflow-hidden flex flex-col">
            {orders.map(order => (
              <CompactOrderRow key={order.id} order={order} currency={store?.currency} />
            ))}
          </div>
        )}
      </div>
      
      {totalPages > 1 && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}

