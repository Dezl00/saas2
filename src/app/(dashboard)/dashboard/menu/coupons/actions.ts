"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { CouponType } from "@prisma/client";

export async function addCoupon(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const code = formData.get("code") as string;
  const type = formData.get("type") as CouponType;
  const value = formData.get("value") as string;
  const minOrder = formData.get("minOrder") as string;
  const maxDiscount = formData.get("maxDiscount") as string;
  const usageLimit = formData.get("usageLimit") as string;
  const expiresAt = formData.get("expiresAt") as string;

  if (!code || !value) return { error: "كود الكوبون وقيمته مطلوبان" };

  try {
    await prisma.coupon.create({
      data: {
        code: code.toUpperCase().trim(),
        type,
        value: parseFloat(value),
        minOrder: minOrder ? parseFloat(minOrder) : null,
        maxDiscount: maxDiscount ? parseFloat(maxDiscount) : null,
        usageLimit: usageLimit ? parseInt(usageLimit) : null,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        storeId: session.user.storeId
      }
    });

    revalidatePath("/dashboard/coupons");
    return { success: true };
  } catch (error: any) {
    if (error.code === 'P2002') {
      return { error: "هذا الكوبون موجود مسبقاً" };
    }
    return { error: "حدث خطأ أثناء إضافة الكوبون" };
  }
}

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
