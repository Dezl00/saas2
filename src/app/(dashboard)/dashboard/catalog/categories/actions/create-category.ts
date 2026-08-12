"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name) {
    return { error: "اسم القسم مطلوب" };
  }

  let image = null;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    try {
      image = await uploadImageToCloudinary(imageFile) as string;
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }
  }

  try {
    await prisma.category.create({
      data: {
        name,
        description,
        image,
        sortOrder,
        storeId: session.user.storeId,
      },
    });

    revalidatePath("/dashboard/catalog/categories");
    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-catalog-${session.user.storeId}`, "default");
    
    return { success: "تم إضافة القسم بنجاح" };
  } catch (error) {
    console.error("Create Category Error:", error);
    return { error: "حدث خطأ أثناء إضافة القسم" };
  }
}
