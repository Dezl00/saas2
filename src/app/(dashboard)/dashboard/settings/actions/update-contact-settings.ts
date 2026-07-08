"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag as _revalidateTag } from "next/cache";

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
    const updatedStore = await prisma.store.update({
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
    return { success: "تم حفظ إعدادات التواصل بنجاح" };
  } catch (error) {
    console.error("Update Contact Error:", error);
    return { error: "حدث خطأ أثناء حفظ إعدادات التواصل" };
  }
}
