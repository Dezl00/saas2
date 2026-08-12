"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateCategoryImage(categoryId: string, image: string | null) {
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
      data: { image },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-catalog-${session.user.storeId}`, "default");
    
    return { success: "تم تحديث صورة القسم" };
  } catch (error) {
    console.error("Update Category Image Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}
