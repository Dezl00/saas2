"use server";
import { revalidateTag } from 'next/cache';
import { uploadImageToCloudinary } from '@/lib/cloudinary';
import { revalidateTag } from 'next/cache';
import { uploadImageToCloudinary } from '@/lib/cloudinary';

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
