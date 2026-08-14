"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/upload";

export async function quickUpdateMenuItem(itemId: string, data: { name?: string; price?: number; categoryId?: string }) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "غير مصرح لك" };

    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (!item) return { error: "الصنف غير موجود" };

    let storeIdToUse = session.user.storeId;
    if (item.storeId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
      storeIdToUse = "DEFAULT_STORE";
    } else if (!storeIdToUse || item.storeId !== storeIdToUse) {
      return { error: "غير مصرح لك" };
    }

    if (data.categoryId) {
      const category = await prisma.category.findUnique({ where: { id: data.categoryId } });
      if (category?.storeId !== storeIdToUse) return { error: "القسم المحدد غير صحيح" };
    }

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.price !== undefined) updateData.price = data.price;
    if (data.categoryId !== undefined) updateData.categoryId = data.categoryId;

    if (Object.keys(updateData).length === 0) {
      return { success: true };
    }

    await prisma.menuItem.update({
      where: { id: itemId },
      data: updateData,
    });

    if (storeIdToUse === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/menu");
      revalidatePath("/dashboard/catalog");
    }
    
    (revalidateTag as any)(`store-${storeIdToUse}`, "default");
    (revalidateTag as any)(`store-catalog-v2-${storeIdToUse}`, "default");

    return { success: true };
  } catch (error: any) {
    console.error("Quick Update Menu Item Error:", error);
    return { error: "حدث خطأ أثناء التحديث السريع: " + (error.message || "") };
  }
}

export async function quickUpdateMenuImage(itemId: string, formData: FormData) {
  try {
    const session = await auth();
    if (!session?.user) return { error: "غير مصرح لك" };

    const item = await prisma.menuItem.findUnique({ where: { id: itemId } });
    if (!item) return { error: "الصنف غير موجود" };

    let storeIdToUse = session.user.storeId;
    if (item.storeId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
      storeIdToUse = "DEFAULT_STORE";
    } else if (!storeIdToUse || item.storeId !== storeIdToUse) {
      return { error: "غير مصرح لك" };
    }

    const imageFile = formData.get("image") as File | null;
    if (!imageFile || typeof imageFile === "string" || imageFile.size === 0) {
      return { error: "لم يتم تقديم صورة صالحة" };
    }

    let imageUrl: string;
    try {
      imageUrl = await uploadImageToCloudinary(imageFile);
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }

    await prisma.menuItem.update({
      where: { id: itemId },
      data: { image: imageUrl },
    });

    if (storeIdToUse === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/menu");
      revalidatePath("/dashboard/catalog");
    }
    
    (revalidateTag as any)(`store-${storeIdToUse}`, "default");
    (revalidateTag as any)(`store-catalog-v2-${storeIdToUse}`, "default");

    return { success: true, imageUrl };
  } catch (error: any) {
    console.error("Quick Update Menu Image Error:", error);
    return { error: "حدث خطأ أثناء تحديث الصورة: " + (error.message || "") };
  }
}
