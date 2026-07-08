"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function toggleBannerStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const banner = await prisma.storeBanner.findUnique({ where: { id } });
    if (!banner || banner.storeId !== session.user.storeId) {
      return { error: "البانر غير موجود" };
    }

    await prisma.storeBanner.update({
      where: { id },
      data: { isActive },
    });

    
    revalidatePath("/dashboard/banners");
    return { success: isActive ? "تم تنشيط البانر" : "تم إيقاف البانر" };
  } catch (error) {
    console.error("Toggle Banner Error:", error);
    return { error: "حدث خطأ أثناء تحديث حالة البانر" };
  }
}
