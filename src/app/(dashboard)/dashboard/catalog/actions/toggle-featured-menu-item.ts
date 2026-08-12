"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

export async function toggleFeaturedMenuItem(id: string, currentStatus: boolean, storeId?: string) {
  const session = await auth();
  
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذا الإجراء" };
  }

  // Ensure the user owns the menu item
  const item = await prisma.menuItem.findUnique({
    where: { 
      id,
      storeId: session.user.storeId
    }
  });

  if (!item) {
    return { error: "الصنف غير موجود" };
  }

  await prisma.menuItem.update({
    where: { id },
    data: { isFeatured: !currentStatus }
  });

  revalidatePath("/dashboard/catalog");
  
  // Also revalidate the store front cache
  if (storeId) {
    (revalidateTag as any)(`store-${storeId}`, "default");
  }

  return { success: "تم تحديث حالة تمييز الصنف بنجاح" };
}
