"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function updateStoreSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  // Check if this is a working hours only update
  const isWorkingHoursOnly = formData.get("isWorkingHoursOnly") === "true";

  if (isWorkingHoursOnly) {
    // Build working hours JSON from form data
    const days = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];
    const workingHours: Record<string, any> = {};
    
    for (const day of days) {
      workingHours[day] = {
        enabled: formData.get(`wh_${day}_enabled`) === "on",
        allDay: formData.get(`wh_${day}_allDay`) === "on",
        from: formData.get(`wh_${day}_from`) as string || "09:00",
        to: formData.get(`wh_${day}_to`) as string || "23:00",
      };
    }

    try {
      await prisma.store.update({
        where: { id: session.user.storeId },
        data: { workingHours },
      });

      revalidatePath("/", "layout");
      return { success: "تم حفظ مواعيد العمل بنجاح" };
    } catch (error) {
      console.error("Update Working Hours Error:", error);
      return { error: "حدث خطأ أثناء حفظ مواعيد العمل" };
    }
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  let logoStr: string | File | null | undefined = formData.get("logo") as string | File | null;
  if (logoStr && typeof logoStr !== "string" && logoStr.size > 0) {
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    try {
      logoStr = await uploadImageToCloudinary(logoStr);
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الصورة" };
    }
  } else if (typeof logoStr !== "string") {
    logoStr = undefined; // Do not update if no new file is provided
  }

  const primaryColor = formData.get("primaryColor") as string;
  const phone = formData.get("phone") as string;
  const address = formData.get("address") as string;
  const currency = formData.get("currency") as string || "EGP";
  const mapLatitude = formData.get("mapLatitude") as string;
  const mapLongitude = formData.get("mapLongitude") as string;

  if (!name) {
    return { error: "اسم المتجر مطلوب" };
  }

  try {
    await prisma.store.update({
      where: { id: session.user.storeId },
      data: {
        name,
        description,
        ...(logoStr !== undefined ? { logo: logoStr as string } : {}),
        primaryColor,
        phone,
        address,
        currency,
        mapLatitude: mapLatitude || null,
        mapLongitude: mapLongitude || null,
      },
    });

    revalidatePath("/", "layout");
    return { success: "تم حفظ الإعدادات الأساسية بنجاح" };
  } catch (error) {
    console.error("Update Store Error:", error);
    return { error: "حدث خطأ أثناء حفظ الإعدادات" };
  }
}

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

    await prisma.store.update({
      where: { id: session.user.storeId },
      data: { subdomain },
    });

    revalidatePath("/", "layout");
    return { success: "تم حجز الرابط بنجاح! متجرك الآن متاح عبر هذا الرابط." };
  } catch (error) {
    console.error("Update Subdomain Error:", error);
    return { error: "حدث خطأ أثناء حجز الرابط" };
  }
}

export async function updateContactSettings(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const whatsappNumber = formData.get("whatsappNumber") as string;
  const enableWhatsappOrders = formData.get("enableWhatsappOrders") === "on";
  const enablePushPopup = formData.get("enablePushPopup") === "on";
  const facebookUrl = formData.get("facebookUrl") as string;
  const showFacebook = formData.get("showFacebook") === "on";
  const instagramUrl = formData.get("instagramUrl") as string;
  const showInstagram = formData.get("showInstagram") === "on";
  const twitterUrl = formData.get("twitterUrl") as string;
  const showTwitter = formData.get("showTwitter") === "on";
  const tiktokUrl = formData.get("tiktokUrl") as string;
  const showTiktok = formData.get("showTiktok") === "on";
  const snapchatUrl = formData.get("snapchatUrl") as string;
  const showSnapchat = formData.get("showSnapchat") === "on";

  try {
    await prisma.store.update({
      where: { id: session.user.storeId },
      data: {
        whatsappNumber,
        enableWhatsappOrders,
        enablePushPopup,
        facebookUrl,
        showFacebook,
        instagramUrl,
        showInstagram,
        twitterUrl,
        showTwitter,
        tiktokUrl,
        showTiktok,
        snapchatUrl,
        showSnapchat,
      },
    });

    revalidatePath("/", "layout");
    return { success: "تم حفظ إعدادات التواصل بنجاح" };
  } catch (error) {
    console.error("Update Contact Error:", error);
    return { error: "حدث خطأ أثناء حفظ إعدادات التواصل" };
  }
}
