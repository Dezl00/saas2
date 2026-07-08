"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CouponType } from "@prisma/client";

export async function toggleCoupon(couponId: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const coupon = await prisma.coupon.findUnique({ where: { id: couponId } });
  
  if (coupon && coupon.storeId === session.user.storeId) {
    await prisma.coupon.update({
      where: { id: couponId },
      data: { isActive: !coupon.isActive }
    });
    revalidatePath("/dashboard/coupons");
  }
}
