"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateCategoryName(categoryId: string, name: string) {
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
      data: { name },
    });

    revalidatePath("/dashboard/menu/categories");
    (revalidateTag as any)(`store-${session.user.storeId}`, "default");
    return { success: "تم تحديث اسم القسم" };
  } catch (error) {
    console.error("Update Category Name Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}
