"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CouponType } from "@prisma/client";

export async function deleteCoupon(couponId: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  await prisma.coupon.deleteMany({
    where: { 
      id: couponId,
      storeId: session.user.storeId 
    }
  });
  
  revalidatePath("/dashboard/coupons");
}
