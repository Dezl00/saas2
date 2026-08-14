"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function toggleStoreWatermark(storeId: string, showWatermark: boolean) {
  const session = await auth();
  if (!session?.user || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  await prisma.store.update({
    where: { id: storeId },
    data: { showWatermark },
  });

  revalidatePath("/admin/stores");
  revalidatePath(`/store/[subdomain]`, "layout"); // Revalidate all stores
}
