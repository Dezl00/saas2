"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function changeUserPassword(formData: FormData) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") return { error: "غير مصرح" };

  const userId = formData.get("userId") as string;
  const password = formData.get("password") as string;

  if (!userId || !password) return { error: "جميع الحقول مطلوبة" };
  if (password.length < 6) return { error: "كلمة المرور يجب أن تكون 6 أحرف على الأقل" };

  await prisma.user.update({
    where: { id: userId },
    data: { password }
  });

  revalidatePath("/admin/users");
  return { success: true };
}

export async function toggleUserStatus(userId: string, action: "activate" | "suspend") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { status: action === "activate" ? "ACTIVE" : "SUSPENDED" }
  });

  revalidatePath("/admin/users");
}

import { deleteImageFromCloudinary } from "@/lib/upload";

export async function hardDeleteUser(userId: string) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  // Fetch the user and their store to extract image URLs before deleting
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      store: {
        include: {
          menuItems: true,
          banners: true,
          paymentRequests: true,
          pushCampaigns: true,
        },
      },
    },
  });

  if (!user) throw new Error("User not found");

  const imageUrlsToDelete: string[] = [];

  if (user.store) {
    if (user.store.logo) imageUrlsToDelete.push(user.store.logo);
    user.store.menuItems.forEach((item) => {
      if (item.image) imageUrlsToDelete.push(item.image);
    });
    user.store.banners.forEach((banner) => {
      if (banner.image) imageUrlsToDelete.push(banner.image);
    });
    user.store.paymentRequests.forEach((req) => {
      if (req.receiptImage) imageUrlsToDelete.push(req.receiptImage);
    });
    user.store.pushCampaigns.forEach((camp) => {
      if (camp.image) imageUrlsToDelete.push(camp.image);
    });
  }

  // Delete images from Cloudinary in parallel
  const validUrls = imageUrlsToDelete.filter(Boolean);
  await Promise.allSettled(
    validUrls.map((url) => deleteImageFromCloudinary(url))
  );

  // Hard delete from Database (Prisma Cascade will handle relations)
  await prisma.user.delete({
    where: { id: userId },
  });

  revalidatePath("/admin/users");
  revalidatePath("/admin/stores");
  return { success: true };
}
