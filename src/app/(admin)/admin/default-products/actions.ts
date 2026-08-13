"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function toggleStoreDefaultProducts(storeId: string, currentStatus: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    await prisma.store.update({
      where: { id: storeId },
      data: { showDefaultProducts: !currentStatus },
    });
    
    revalidatePath("/admin/default-products");
    
    return { success: "تم تحديث إعدادات المتجر بنجاح" };
  } catch (error) {
    console.error("Toggle Store Default Products Error:", error);
    return { error: "حدث خطأ أثناء تحديث الإعدادات" };
  }
}

export async function createDefaultCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return { error: "غير مصرح" };
  
  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt(formData.get("sortOrder") as string) || 0;

  let image = null;
  const imageFile = formData.get("imageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    try {
      image = (await uploadImageToCloudinary(imageFile)) as string;
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }
  }

  await prisma.category.create({
    data: { name, description, image, sortOrder, storeId: 'DEFAULT_STORE' }
  });
  revalidatePath("/admin/default-products");
}

export async function toggleDefaultCategoryStatus(categoryId: string, currentStatus: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return;
  
  await prisma.category.update({
    where: { id: categoryId },
    data: { isActive: !currentStatus }
  });
  revalidatePath("/admin/default-products");
}

export async function deleteDefaultCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") return;
  
  await prisma.category.delete({ where: { id: categoryId } });
  revalidatePath("/admin/default-products");
}
