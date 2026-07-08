"use server";
import { revalidateTag } from 'next/cache';
import { revalidateTag } from 'next/cache';

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";

export async function updateSubdomain(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  // customDomain logic moved to domain-actions.ts

  let subdomain = formData.get("subdomain") as string;

  if (!subdomain || subdomain.trim() === "") {
    return { error: "يرجى كتابة الرابط أولاً" };
  }

  // Format the subdomain: trim, lowercase, replace spaces with hyphens
  subdomain = subdomain.trim().toLowerCase().replace(/\s+/g, '-');

  // التأكد من صيغة الرابط (أحرف إنجليزية وأرقام وشرطة فقط)
  const regex = /^[a-z0-9-]+$/;
  if (!regex.test(subdomain)) {
    return { error: "الرابط يجب أن يحتوي على أحرف إنجليزية صغيرة وأرقام فقط، وبدون مسافات." };
  }

  try {
    // التحقق من أن الـ subdomain غير مستخدم لمتجر آخر
    const existing = await prisma.store.findUnique({
      where: { subdomain }
    });

    if (existing && existing.id !== session.user.storeId) {
      return { error: "عذراً، هذا الرابط مستخدم من قبل متجر آخر. يرجى اختيار رابط مختلف." };
    }

    const oldStore = await prisma.store.findUnique({
      where: { id: session.user.storeId },
      select: { subdomain: true }
    });

    await prisma.store.update({
      where: { id: session.user.storeId },
      data: { subdomain },
    });

    revalidatePath("/", "layout");
    if (oldStore?.subdomain) {
      revalidateTag(`store-${oldStore.subdomain}`);
    }
    revalidateTag(`store-${subdomain}`);
    return { success: "تم حجز الرابط بنجاح! متجرك الآن متاح عبر هذا الرابط." };
  } catch (error) {
    console.error("Update Subdomain Error:", error);
    return { error: "حدث خطأ أثناء حجز الرابط" };
  }
}
