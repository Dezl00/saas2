"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/upload";

export async function updateCategory(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;

  if (!name) {
    return { error: "اسم القسم مطلوب" };
  }

  const existingCategory = await prisma.category.findUnique({
    where: { id, storeId: session.user.storeId }
  });

  if (!existingCategory) {
    return { error: "القسم غير موجود" };
  }

  const imageFile = formData.get("imageFile") as File | null;
  let image = existingCategory.image;

  if (imageFile && imageFile.size > 0) {
    try {
      image = await uploadImageToCloudinary(imageFile) as string;
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }
  }

  try {
    await prisma.category.update({
      where: { id, storeId: session.user.storeId },
      data: {
        name,
        description,
        image,
      },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-catalog-${session.user.storeId}`, "default");
    
    return { success: "تم تحديث القسم بنجاح" };
  } catch (error) {
    console.error("Update Category Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}
