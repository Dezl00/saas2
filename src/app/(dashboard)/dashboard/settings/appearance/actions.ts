"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function updateStoreFont(fontFamily: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    throw new Error("Unauthorized");
  }

  const store = await prisma.store.update({
    where: { id: session.user.storeId },
    data: { fontFamily },
  });

  // Type assertion for next/cache revalidateTag
  (revalidateTag as any)(`store-info-${session.user.storeId}`, "default");
  revalidatePath("/dashboard/appearance");
  
  return { success: true };
}
