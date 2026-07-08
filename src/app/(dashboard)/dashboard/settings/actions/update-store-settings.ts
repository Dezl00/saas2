"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";

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
      const updatedStore = await prisma.store.update({
        where: { id: session.user.storeId },
        data: { workingHours },
        select: { subdomain: true, domains: { select: { name: true } } }
      });

      revalidatePath("/", "layout");
      if (updatedStore.subdomain) {
// @ts-ignore
        revalidatePath(`store-${updatedStore.subdomain}`);
      }
      if (updatedStore.domains) {
        for (const d of updatedStore.domains) {
  // @ts-ignore
        revalidatePath(`store-${d.name}`);
        }
      }
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

  let faviconStr: string | File | null | undefined = formData.get("favicon") as string | File | null;
  if (faviconStr && typeof faviconStr !== "string" && faviconStr.size > 0) {
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    try {
      faviconStr = await uploadImageToCloudinary(faviconStr);
    } catch (e) {
      console.error("Upload error", e);
      return { error: "فشل رفع الأيقونة" };
    }
  } else if (typeof faviconStr !== "string") {
    faviconStr = undefined; // Do not update if no new file is provided
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
    const updatedStore = await prisma.store.update({
      where: { id: session.user.storeId },
      data: {
        name,
        description,
        ...(logoStr !== undefined ? { logo: logoStr as string } : {}),
        ...(faviconStr !== undefined ? { favicon: faviconStr as string } : {}),
        primaryColor,
        phone,
        address,
        currency,
        mapLatitude: mapLatitude || null,
        mapLongitude: mapLongitude || null,
      },
      select: { subdomain: true, domains: { select: { name: true } } }
    });

    revalidatePath("/", "layout");
    if (updatedStore.subdomain) {
      revalidatePath(`store-${updatedStore.subdomain}`);
    }
    if (updatedStore.domains) {
      for (const d of updatedStore.domains) {
// @ts-ignore
        revalidatePath(`store-${d.name}`);
      }
    }
    return { success: "تم حفظ الإعدادات الأساسية بنجاح" };
  } catch (error) {
    console.error("Update Store Error:", error);
    return { error: "حدث خطأ أثناء حفظ الإعدادات" };
  }
}
