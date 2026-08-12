"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateStoreAppearance(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    throw new Error("Unauthorized");
  }

  const fontFamily = formData.get("fontFamily") as string;
  const theme = formData.get("theme") as string;
  const hideProductDescription = formData.get("hideProductDescription") === "true";
  const hideProductAddButton = formData.get("hideProductAddButton") === "true";
  const showFloatingIcons = formData.get("showFloatingIcons") === "true";
  const enableLandingPage = formData.get("enableLandingPage") === "true";
  const landingHeroTitle = formData.get("landingHeroTitle") as string;
  const landingHeroDescription = formData.get("landingHeroDescription") as string;
  const landingHeroOverlayOpacity = parseInt(formData.get("landingHeroOverlayOpacity") as string) || 50;
  
  let landingHeroImage = formData.get("landingHeroImage") as string; // Could be existing URL string

  // Handle new file upload
  const imageFile = formData.get("landingHeroImageFile") as File | null;
  if (imageFile && imageFile.size > 0) {
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    try {
      landingHeroImage = await uploadImageToCloudinary(imageFile) as string;
    } catch (e) {
      console.error("Upload error", e);
      throw new Error("فشل رفع الصورة");
    }
  }

  const store = await prisma.store.update({
    where: { id: session.user.storeId },
    data: { 
      fontFamily, 
      theme, 
      hideProductDescription, 
      hideProductAddButton,
      showFloatingIcons,
      enableLandingPage,
      landingHeroTitle,
      landingHeroDescription,
      landingHeroImage,
      landingHeroOverlayOpacity
    },
    select: {
      subdomain: true,
      domains: { select: { name: true } }
    }
  });

  // Type assertion for next/cache revalidateTag
  (revalidateTag as any)(`store-info-${session.user.storeId}`, "default");
  if (store.subdomain) {
    (revalidateTag as any)(`store-${store.subdomain}`, "default");
    revalidatePath(`store-${store.subdomain}`);
  }
  if (store.domains) {
    for (const d of store.domains) {
      (revalidateTag as any)(`store-${d.name}`, "default");
      revalidatePath(`store-${d.name}`);
    }
  }

  revalidatePath("/", "layout");
  revalidatePath("/dashboard/appearance");
  
  return { success: true };
}
