"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/upload";

export async function updateMenuItem(menuItemId: string, formData: FormData) {
  const session = await auth();
  if (!session?.user) return { error: "غير مصرح لك" };

  const targetStoreId = formData.get("storeId") as string;
  let storeIdToUse = session.user.storeId;
  if (targetStoreId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
    storeIdToUse = "DEFAULT_STORE";
  } else if (!storeIdToUse) {
    return { error: "غير مصرح لك" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const price = parseFloat(formData.get("price") as string);
  const categoryId = formData.get("categoryId") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  let imageStr: string | File | null | undefined = formData.get("image") as string | File | null;
  if (imageStr && typeof imageStr !== "string" && imageStr.size > 0) {
    try {
      imageStr = await uploadImageToCloudinary(imageStr);
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }
  } else if (typeof imageStr !== "string") {
    imageStr = undefined; // Do not update image if file was empty and old string wasn't provided
  }

  const sizesStr = formData.get("sizes") as string;
  const addonsStr = formData.get("addons") as string;
  
  let sizes: any[] = [];
  let addons: any[] = [];
  try {
    if (sizesStr) sizes = JSON.parse(sizesStr);
    if (addonsStr) addons = JSON.parse(addonsStr);
  } catch (e) {}

  if (!name || isNaN(price) || !categoryId) {
    return { error: "الاسم، السعر، والقسم بيانات مطلوبة" };
  }

  try {
    const [item, category] = await Promise.all([
      prisma.menuItem.findUnique({ where: { id: menuItemId } }),
      prisma.category.findUnique({ where: { id: categoryId } })
    ]);
    if (item?.storeId !== storeIdToUse) return { error: "غير مصرح لك" };
    if (category?.storeId !== storeIdToUse) return { error: "القسم المحدد غير صحيح" };

    await prisma.menuItem.update({
      where: { id: menuItemId },
      data: {
        name,
        description,
        price,
        ...(imageStr !== undefined ? { image: imageStr || null } : {}),
        sortOrder,
        categoryId,
        sizes: {
          deleteMany: {},
          create: sizes.filter(s => s.name && s.price).map(s => ({
            name: s.name,
            price: parseFloat(s.price),
          }))
        },
        addons: {
          deleteMany: {},
          create: addons.filter(a => a.name && a.price).map(a => ({
            name: a.name,
            price: parseFloat(a.price),
          }))
        }
      },
    });

    if (storeIdToUse === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/catalog");
    }
    (revalidateTag as any)(`store-${storeIdToUse}`, "default");
    (revalidateTag as any)(`store-catalog-v2-${storeIdToUse}`, "default");
    return { success: "تم تحديث الصنف بنجاح" };
  } catch (error: any) {
    console.error("Update Menu Item Error:", error);
    return { error: "حدث خطأ أثناء تحديث الصنف: " + (error.message || "") };
  }
}
