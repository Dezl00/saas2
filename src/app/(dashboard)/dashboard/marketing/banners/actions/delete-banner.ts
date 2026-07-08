"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function deleteBanner(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const banner = await prisma.storeBanner.findUnique({
      where: { id },
    });

    if (!banner || banner.storeId !== session.user.storeId) {
      return { error: "البانر غير موجود" };
    }

    await prisma.storeBanner.delete({
      where: { id },
    });

    
    revalidatePath("/dashboard/banners");
    return { success: "تم حذف البانر بنجاح" };
  } catch (error) {
    console.error("Delete Banner Error:", error);
    return { error: "حدث خطأ أثناء حذف البانر" };
  }
}
