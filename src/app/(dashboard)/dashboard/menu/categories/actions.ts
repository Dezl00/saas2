"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

export async function createCategory(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  const name = formData.get("name") as string;
  const description = formData.get("description") as string;
  const sortOrder = parseInt((formData.get("sortOrder") as string) || "0");

  if (!name) {
    return { error: "اسم القسم مطلوب" };
  }

  try {
    await prisma.category.create({
      data: {
        name,
        description,
        sortOrder,
        storeId: session.user.storeId,
      },
    });

    revalidatePath("/dashboard/menu/categories");
    revalidateTag(`store-${session.user.storeId}`);
    return { success: "تم إضافة القسم بنجاح" };
  } catch (error) {
    console.error("Create Category Error:", error);
    return { error: "حدث خطأ أثناء إضافة القسم" };
  }
}

export async function toggleCategoryStatus(categoryId: string, currentStatus: boolean) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بتعديل هذا القسم" };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { isActive: !currentStatus },
    });

    revalidatePath("/dashboard/menu/categories");
    revalidateTag(`store-${session.user.storeId}`);
    return { success: "تم تحديث حالة القسم" };
  } catch (error) {
    console.error("Toggle Category Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}

export async function updateCategoryName(categoryId: string, name: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بتعديل هذا القسم" };
    }

    await prisma.category.update({
      where: { id: categoryId },
      data: { name },
    });

    revalidatePath("/dashboard/menu/categories");
    revalidateTag(`store-${session.user.storeId}`);
    return { success: "تم تحديث اسم القسم" };
  } catch (error) {
    console.error("Update Category Name Error:", error);
    return { error: "حدث خطأ أثناء تحديث القسم" };
  }
}

export async function reorderCategories(orderedIds: string[]) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    // We update all categories in a transaction
    const updates = orderedIds.map((id, index) => 
      prisma.category.update({
        where: { id },
        data: { sortOrder: index }
      })
    );
    
    await prisma.$transaction(updates);

    revalidatePath("/dashboard/menu/categories");
    revalidateTag(`store-${session.user.storeId}`);
    return { success: "تم تحديث ترتيب الأقسام" };
  } catch (error) {
    console.error("Reorder Categories Error:", error);
    return { error: "حدث خطأ أثناء تحديث الترتيب" };
  }
}

export async function deleteCategory(categoryId: string) {
  const session = await auth();
  if (!session?.user?.storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  try {
    const category = await prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (category?.storeId !== session.user.storeId) {
      return { error: "غير مصرح لك بحذف هذا القسم" };
    }

    const itemsCount = await prisma.menuItem.count({
      where: { categoryId },
    });

    if (itemsCount > 0) {
      return { error: "لا يمكن حذف القسم! يحتوي على منتجات ويجب إفراغه أولاً." };
    }

    await prisma.category.delete({
      where: { id: categoryId },
    });

    revalidatePath("/dashboard/menu/categories");
    revalidateTag(`store-${session.user.storeId}`);
    return { success: "تم حذف القسم بنجاح" };
  } catch (error) {
    console.error("Delete Category Error:", error);
    return { error: "حدث خطأ أثناء حذف القسم" };
  }
}
