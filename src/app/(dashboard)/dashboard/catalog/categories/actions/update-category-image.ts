"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/upload";

export async function uploadCategoryImage(categoryId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const imageFile = formData.get("file") as File | null;
  if (!imageFile) return { error: "لم يتم العثور على صورة" };

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بتعديل هذا القسم" };
    }

    const imageUrl = await uploadImageToCloudinary(imageFile) as string;

    await prisma.category.update({
      where: { id: categoryId },
      data: { image: imageUrl },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-catalog-${session.user.storeId}`, "default");
    
    return { success: "تم تحديث صورة القسم", imageUrl };
  } catch (error) {
    console.error("Upload Category Image Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}

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
