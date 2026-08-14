import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { DeliveryAreasClient } from "./components/DeliveryAreasClient";

export const metadata = {
  title: "مناطق التوصيل | لوحة التحكم",
};

export default async function DeliveryAreasPage() {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    notFound();
  }

  const governorates = await prisma.deliveryGovernorate.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { sortOrder: 'asc' },
    include: {
      cities: {
        orderBy: { name: 'asc' },
      }
    }
  });

  return (
    <div className="space-y-6">
      <DeliveryAreasClient governorates={governorates as any} />
    </div>
  );
}
