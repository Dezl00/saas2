"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";
import { uploadImageToCloudinary } from "@/lib/upload";

export async function createBanner(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const title = formData.get("title") as string;
  const link = formData.get("link") as string;
  const imageFile = formData.get("image") as File;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!imageFile || imageFile.size === 0) {
    return { error: "الصورة مطلوبة للبانر" };
  }

  try {
    const imageUrl = await uploadImageToCloudinary(imageFile);

    await prisma.storeBanner.create({
      data: {
        storeId: session.user.storeId,
        image: imageUrl,
        title: title || null,
        link: link || null,
        sortOrder,
      },
    });

    (revalidateTag as any)(`store-banners-${session.user.storeId}`, "default");
    revalidatePath("/dashboard/banners");
    return { success: "تم إضافة البانر بنجاح" };
  } catch (error) {
    console.error("Create Banner Error:", error);
    return { error: "حدث خطأ أثناء إضافة البانر" };
  }
}

export async function updateBanner(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const id = formData.get("id") as string;
  const title = formData.get("title") as string;
  const link = formData.get("link") as string;
  const imageFile = formData.get("image") as File;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");
  const isActive = formData.get("isActive") === "true";

  try {
    const banner = await prisma.storeBanner.findUnique({
      where: { id },
    });

    if (!banner || banner.storeId !== session.user.storeId) {
      return { error: "البانر غير موجود" };
    }

    let imageUrl = banner.image;
    if (imageFile && imageFile.size > 0) {
      imageUrl = await uploadImageToCloudinary(imageFile);
    }

    await prisma.storeBanner.update({
      where: { id },
      data: {
        image: imageUrl,
        title: title || null,
        link: link || null,
        sortOrder,
        isActive,
      },
    });

    (revalidateTag as any)(`store-banners-${session.user.storeId}`, "default");
    revalidatePath("/dashboard/banners");
    return { success: "تم تحديث البانر بنجاح" };
  } catch (error) {
    console.error("Update Banner Error:", error);
    return { error: "حدث خطأ أثناء تحديث البانر" };
  }
}

export async function toggleBannerStatus(id: string, isActive: boolean) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const banner = await prisma.storeBanner.findUnique({ where: { id } });
    if (!banner || banner.storeId !== session.user.storeId) {
      return { error: "البانر غير موجود" };
    }

    await prisma.storeBanner.update({
      where: { id },
      data: { isActive },
    });

    (revalidateTag as any)(`store-banners-${session.user.storeId}`, "default");
    revalidatePath("/dashboard/banners");
    return { success: isActive ? "تم تنشيط البانر" : "تم إيقاف البانر" };
  } catch (error) {
    console.error("Toggle Banner Error:", error);
    return { error: "حدث خطأ أثناء تحديث حالة البانر" };
  }
}

export async function deleteBanner(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const banner = await prisma.storeBanner.findUnique({
      where: { id },
    });

    if (!banner || banner.storeId !== session.user.storeId) {
      return { error: "البانر غير موجود" };
    }

    await prisma.storeBanner.delete({
      where: { id },
    });

    (revalidateTag as any)(`store-banners-${session.user.storeId}`, "default");
    revalidatePath("/dashboard/banners");
    return { success: "تم حذف البانر بنجاح" };
  } catch (error) {
    console.error("Delete Banner Error:", error);
    return { error: "حدث خطأ أثناء حذف البانر" };
  }
}

