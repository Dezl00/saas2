import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import { ClientOrderMasterDetail } from "./ClientOrderMasterDetail";

export const metadata = {
  title: "تفاصيل الطلب | لوحة التحكم",
};

export default async function OrderDetailsPage(props: { params: Promise<{ orderId: string }> }) {
  const params = await props.params;
  const session = await auth();
  
  if (!session?.user?.storeId) {
    redirect("/login");
  }

  const [store, orders, selectedOrder] = await Promise.all([
    prisma.store.findUnique({ where: { id: session.user.storeId } }),
    prisma.order.findMany({
      where: { storeId: session.user.storeId },
      orderBy: { createdAt: 'desc' },
      take: 50,
      select: {
        id: true,
        orderNumber: true,
        customerName: true,
        status: true,
        createdAt: true,
        total: true,
      }
    }),
    prisma.order.findUnique({
      where: { id: params.orderId, storeId: session.user.storeId },
      include: {
        items: true,
        branch: true,
        deliveryArea: true,
      }
    })
  ]);

  if (!store || !selectedOrder) {
    notFound();
  }

  return (
    <ClientOrderMasterDetail 
      orders={orders as any} 
      selectedOrder={selectedOrder as any} 
      currency={store.currency || "SAR"} 
    />
  );
}
