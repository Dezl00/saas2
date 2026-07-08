"use server";

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function toggleStoreStatus(storeId: string, action: "suspend" | "activate" | "delete") {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("غير مصرح لك");
  }

  if (action === "suspend") {
    await prisma.store.update({
      where: { id: storeId },
      data: { status: "SUSPENDED" },
    });
  } else if (action === "activate") {
    await prisma.store.update({
      where: { id: storeId },
      data: { status: "ACTIVE" },
    });
  } else if (action === "delete") {
    await prisma.store.update({
      where: { id: storeId },
      data: { status: "DELETED" },
    });
  }

  revalidatePath("/admin/stores");
}
