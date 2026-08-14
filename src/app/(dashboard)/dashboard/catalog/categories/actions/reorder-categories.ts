"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function reorderCategories(orderedIds: string[], storeIdOverride?: string) {
  const session = await auth();
  const storeId = storeIdOverride || session?.user?.storeId;
  
  if (!storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    // Verify all categories belong to the store
    const count = await prisma.category.count({
      where: {
        id: { in: orderedIds },
        storeId: storeId
      }
    });

    if (count !== orderedIds.length) {
      return { error: "بعض الأقسام غير صالحة أو لا تنتمي لمتجرك" };
    }

    // Update in a transaction
    await prisma.$transaction(
      orderedIds.map((id, index) => 
        prisma.category.update({
          where: { id },
          data: { sortOrder: index }
        })
      )
    );

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-catalog-${storeId}`, "default");
    (revalidateTag as any)(`store-catalog-v2-${storeId}`, "default");
    
    return { success: "تم تحديث ترتيب الأقسام" };
  } catch (error) {
    console.error("Reorder Categories Error:", error);
    return { error: "حدث خطأ أثناء تحديث الترتيب" };
  }
}
