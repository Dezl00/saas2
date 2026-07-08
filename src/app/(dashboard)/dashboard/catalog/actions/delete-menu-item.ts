"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteMenuItem(menuItemId: string, targetStoreId?: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح لك" };

  let storeIdToUse = session.user.storeId;
  if (targetStoreId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
    storeIdToUse = "DEFAULT_STORE";
  } else if (!storeIdToUse) {
    return { error: "غير مصرح لك" };
  }

  try {
    const item = await prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (item?.storeId !== storeIdToUse) {
      return { error: "غير مصرح لك بحذف هذا الصنف" };
    }

    await prisma.menuItem.delete({
      where: { id: menuItemId },
    });

    if (storeIdToUse === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/menu");
    }
    revalidateTag(`store-${storeIdToUse}`, "default");
    return { success: "تم حذف الصنف بنجاح" };
  } catch (error) {
    console.error("Delete Menu Item Error:", error);
    return { error: "حدث خطأ أثناء حذف الصنف." };
  }
}
