import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const { products } = await req.json();

    if (!Array.isArray(products) || products.length === 0) {
      return NextResponse.json({ error: "لا يوجد منتجات للاستيراد" }, { status: 400 });
    }

    const { checkProductLimit } = await import("@/lib/limits");
    const limitCheck = await checkProductLimit(session.user.storeId);
    if (!limitCheck.allowed) {
      return NextResponse.json({ error: "تم الوصول للحد الأقصى للمنتجات" }, { status: 403 });
    }

    const remainingSlots = limitCheck.limit - limitCheck.currentCount;
    if (products.length > remainingSlots) {
      return NextResponse.json({ 
        error: `لا يمكنك استيراد ${products.length} منتج. الباقة تسمح لك بإضافة ${remainingSlots} منتج فقط حالياً.` 
      }, { status: 403 });
    }

    let importedCount = 0;

    for (const item of products) {
      if (!item.name || !item.categoryId) continue;

      // Parse relations
      let sizesObj = {};
      if (item.sizes) {
        const parsed = String(item.sizes).split("|").map(s => {
          const [n, p] = s.split(":");
          return n && p ? { name: n.trim(), price: parseFloat(p) || 0 } : null;
        }).filter(Boolean);
        if (parsed.length) sizesObj = { create: parsed };
      }

      let addonsObj = {};
      if (item.addons) {
        const parsed = String(item.addons).split("|").map(s => {
          const [n, p] = s.split(":");
          return n && p ? { name: n.trim(), price: parseFloat(p) || 0 } : null;
        }).filter(Boolean);
        if (parsed.length) addonsObj = { create: parsed };
      }

      // Upsert logic
      if (item.id && item.id.length > 5) {
        // Try update if ID exists
        try {
          // Delete old relations first if doing update
          await prisma.menuItemSize.deleteMany({ where: { menuItemId: item.id } }).catch(() => {});
          await prisma.menuItemAddon.deleteMany({ where: { menuItemId: item.id } }).catch(() => {});

          await prisma.menuItem.update({
            where: { id: item.id, storeId: session.user.storeId },
            data: {
              name: item.name,
              description: item.description,
              price: item.price,
              categoryId: item.categoryId,
              image: item.image,
              sortOrder: item.sortOrder,
              isAvailable: item.isActive,
              sizes: sizesObj,
              addons: addonsObj
            }
          });
          importedCount++;
          continue;
        } catch (e) {
          // If update fails, fallback to create
        }
      }

      // Create new
      await prisma.menuItem.create({
        data: {
          storeId: session.user.storeId,
          name: item.name,
          description: item.description,
          price: item.price,
          categoryId: item.categoryId,
          image: item.image,
          sortOrder: item.sortOrder,
          isAvailable: item.isActive,
          sizes: sizesObj,
          addons: addonsObj
        }
      });
      importedCount++;
    }

    return NextResponse.json({ success: true, count: importedCount });

  } catch (error: any) {
    console.error("Confirm import error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء الحفظ" }, { status: 500 });
  }
}
