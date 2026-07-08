"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function importAIMenuItems(parsedData: any, targetStoreId?: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "غير مصرح" };
  }

  let storeId = session.user.storeId;

  if (targetStoreId === "DEFAULT_STORE" && session.user.role === "ADMIN") {
    storeId = "DEFAULT_STORE";
  } else if (!storeId) {
    return { error: "غير مصرح لك بالقيام بهذه العملية" };
  }

  // Enforce AI Feature Limit
  const { checkFeatureEnabled, checkProductLimit } = await import("@/lib/limits");
  const isAiEnabled = await checkFeatureEnabled(storeId, "ai");
  if (!isAiEnabled) {
    return { error: "ميزة الذكاء الاصطناعي غير متوفرة في باقتك الحالية." };
  }

  // Check product limits (rough estimate: we generate ~5 items per AI call usually)
  const { allowed: canAddProducts } = await checkProductLimit(storeId, 5);
  if (!canAddProducts) {
    return { error: "لا يمكنك توليد المزيد من الأصناف لأنك اقتربت من الحد الأقصى للباقة." };
  }
  
  let addedItemsCount = 0;

  try {
    for (const categoryData of parsedData.categories) {
      if (!categoryData.name) continue;

      let category = await prisma.category.findFirst({
        where: { storeId, name: categoryData.name },
      });

      if (!category) {
        category = await prisma.category.create({
          data: {
            name: categoryData.name,
            storeId,
          },
        });
      }

      if (categoryData.items && Array.isArray(categoryData.items)) {
        for (const item of categoryData.items) {
          if (!item.name || typeof item.price !== "number") continue;
          
          const sizesData = Array.isArray(item.sizes) ? item.sizes.filter((s: any) => s.name && s.price).map((s: any) => ({
            name: s.name,
            price: Number(s.price)
          })) : [];

          await prisma.menuItem.create({
            data: {
              name: item.name,
              description: item.description || null,
              price: item.price,
              categoryId: category!.id,
              storeId,
              ...(sizesData.length > 0 && {
                sizes: {
                  create: sizesData
                }
              })
            }
          });
          addedItemsCount++;
        }
      }
    }

    if (storeId === "DEFAULT_STORE") {
      revalidatePath("/admin/default-products");
    } else {
      revalidatePath("/dashboard/menu");
    }
    return { success: `تم حفظ المنيو بنجاح! إضافة ${addedItemsCount} صنف جديد.` };
  } catch (error: any) {
    console.error("AI Import Error:", error);
    return { error: "حدث خطأ أثناء حفظ البيانات." };
  }
}
