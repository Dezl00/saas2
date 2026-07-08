"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بحذف هذا القسم" };
    }

    const itemsCount = await prisma.menuItem.count({
      where: { categoryId },
    });

    if (itemsCount > 0) {
      return { error: "لا يمكن حذف القسم! يحتوي على منتجات ويجب إفراغه أولاً." };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    
    return { success: "تم حذف القسم بنجاح" };
  } catch (error) {
    console.error("Delete Category Error:", error);
    return { error: "حدث خطأ أثناء حذف القسم" };
  }
}
