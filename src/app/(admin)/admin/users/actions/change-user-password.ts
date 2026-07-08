"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteImageFromCloudinary } from "@/lib/upload";

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
