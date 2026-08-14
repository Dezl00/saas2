"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function getAllMenuItems() {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك" };
  }

  try {
    const items = await prisma.menuItem.findMany({
      where: { storeId: session.user.storeId },
      orderBy: [
        { category: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
        { createdAt: 'asc' }
      ],
      select: {
        id: true,
        name: true,
        price: true,
        image: true,
        categoryId: true,
        category: { select: { id: true, name: true } },
        sizes: { select: { id: true, name: true, price: true } },
      }
    });
    
    return { items };
  } catch (error) {
    console.error("Error fetching menu items:", error);
    return { error: "حدث خطأ أثناء جلب المنتجات" };
  }
}
