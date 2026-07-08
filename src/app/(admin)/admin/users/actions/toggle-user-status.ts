"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { deleteImageFromCloudinary } from "@/lib/upload";

export async function toggleUserStatus(userId: string, action: "activate" | "suspend") {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") throw new Error("Unauthorized");

  await prisma.user.update({
    where: { id: userId },
    data: { status: action === "activate" ? "ACTIVE" : "SUSPENDED" }
  });

  revalidatePath("/admin/users");
}
