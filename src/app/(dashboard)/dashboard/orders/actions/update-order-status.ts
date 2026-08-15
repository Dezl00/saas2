"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { z } from "zod";

const orderStatusSchema = z.enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "DELIVERED", "CANCELLED"]);
import { revalidatePath } from "next/cache";

export async function updateOrderStatus(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const orderId = formData.get("orderId") as string;
  const statusResult = orderStatusSchema.safeParse(formData.get("status"));
  if (!statusResult.success) return { error: "حالة غير صالحة" };
  const status = statusResult.data;

  const order = await prisma.order.findUnique({ where: { id: orderId } });
  
  if (order && order.storeId === session.user.storeId) {
    await prisma.order.update({
      where: { id: orderId },
      data: { status }
    });
    revalidatePath("/dashboard/orders");
  }
}
