"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath, revalidateTag } from "next/cache";

type UpdateData = {
  id: string;
  name?: string;
  price?: number;
  categoryId?: string;
};

export async function bulkUpdateMenuItems(updates: UpdateData[]) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك" };
  }

  try {
    // Perform bulk update in a transaction
    await prisma.$transaction(
      updates.map((update) => 
        prisma.menuItem.update({
          where: { 
            id: update.id,
            storeId: session.user.storeId! // ensure they only update their own items
          },
          data: {
            ...(update.name && { name: update.name }),
            ...(update.price !== undefined && { price: update.price }),
            ...(update.categoryId && { categoryId: update.categoryId }),
          }
        })
      )
    );

    revalidatePath("/dashboard/catalog");
    (revalidateTag as any)(`store-${session.user.storeId}`, "default");
    (revalidateTag as any)(`store-catalog-v2-${session.user.storeId}`, "default");
    return { success: true };
  } catch (error) {
    console.error("Error in bulkUpdateMenuItems:", error);
    return { error: "حدث خطأ أثناء حفظ التعديلات" };
  }
}
