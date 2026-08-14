"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function bulkDeleteMenuItems(menuItemIds: string[], targetStoreId?: string) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح لك" };

  let storeIdToUse = session.user.storeId;
  if (targetStoreId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
    storeIdToUse = "DEFAULT_STORE";
  } else if (!storeIdToUse) {
    return { error: "غير مصرح لك" };
  }

  try {
    // First, verify all items belong to the store
    const items = await prisma.menuItem.findMany({
      where: {
        id: { in: menuItemIds },
        storeId: storeIdToUse
      }
    });

    if (items.length !== menuItemIds.length) {
      return { error: "بعض الأصناف المحددة غير موجودة أو لا تملك صلاحية حذفها" };
    }

    await prisma.menuItem.deleteMany({
      where: {
        id: { in: menuItemIds },
        storeId: storeIdToUse
      }
    });

    if (storeIdToUse === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/menu");
    }
    revalidateTag(`store-${storeIdToUse}`, "default");
    return { success: `تم حذف ${items.length} صنف بنجاح` };
  } catch (error: any) {
    console.error("Bulk Delete Menu Items Error:", error);
    
    if (error.code === 'P2003', "default") {
      return { error: "لا يمكن حذف بعض الأصناف لأنها مرتبطة بطلبات سابقة." };
    }
    
    return { error: `حدث خطأ أثناء الحذف: ${error.message || "سبب غير معروف"}` };
  }
}
