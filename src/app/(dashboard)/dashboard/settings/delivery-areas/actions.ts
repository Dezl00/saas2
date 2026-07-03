"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function addDeliveryArea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const name = formData.get("name") as string;
  const fee = formData.get("fee") as string;

  if (!name || !fee) return { error: "جميع الحقول مطلوبة" };

  await prisma.deliveryArea.create({
    data: {
      name,
      deliveryFee: parseFloat(fee),
      storeId: session.user.storeId
    }
  });

  revalidatePath("/dashboard/delivery-areas");
  return { success: true };
}

export async function toggleDeliveryArea(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const areaId = formData.get("areaId") as string;
  const area = await prisma.deliveryArea.findUnique({ where: { id: areaId } });
  
  if (area && area.storeId === session.user.storeId) {
    await prisma.deliveryArea.update({
      where: { id: areaId },
      data: { isActive: !area.isActive }
    });
    revalidatePath("/dashboard/delivery-areas");
  }
}

export async function deleteDeliveryArea(areaId: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  await prisma.deliveryArea.deleteMany({
    where: { 
      id: areaId,
      storeId: session.user.storeId 
    }
  });
  
  revalidatePath("/dashboard/delivery-areas");
}
