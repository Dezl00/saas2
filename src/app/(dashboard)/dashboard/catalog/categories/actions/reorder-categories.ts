"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function reorderCategories(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    // We update all categories in a transaction
    const updates = orderedIds.map((id, index) => 
      prisma.category.update({
        where: { id },
        data: { sortOrder: index }
      })
    );
    
    await prisma.$transaction(updates);

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    
    return { success: "تم تحديث ترتيب الأقسام" };
  } catch (error) {
    console.error("Reorder Categories Error:", error);
    return { error: "حدث خطأ أثناء تحديث الترتيب" };
  }
}
