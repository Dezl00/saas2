"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function toggleCategoryStatus(categoryId: string, currentStatus: boolean) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بتعديل هذا القسم" };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    
    return { success: "تم تحديث حالة القسم" };
  } catch (error) {
    console.error("Toggle Category Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}
