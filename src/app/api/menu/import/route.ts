import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as xlsx from "xlsx";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: session.user.storeId as string }
    });

    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File | null;

    if (!file) {
      return NextResponse.json({ error: "لم يتم رفع أي ملف" }, { status: 400 });
    }

    // Read the file as buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse the excel file
    const wb = xlsx.read(buffer, { type: 'buffer' });

    let importedCount = 0;

    // Process Categories Sheet
    const categoriesSheetName = wb.SheetNames.includes("Categories") ? "Categories" : (wb.SheetNames.includes("الأقسام") ? "الأقسام" : null);
    if (categoriesSheetName) {
      const wsCategories = wb.Sheets[categoriesSheetName];
      const categoriesData = xlsx.utils.sheet_to_json<any>(wsCategories);

      for (const row of categoriesData) {
        if (!row.Name) continue; // Skip invalid rows
        
        await prisma.category.upsert({
          where: { id: row.ID || "new-temp-id" }, // Using a fake id to force create if no ID
          update: {
            name: row.Name,
            sortOrder: parseInt(row.SortOrder) || 0,
            description: row.Description || null,
          },
          create: {
            id: row.ID || undefined, // use provided ID or let prisma generate
            storeId: store.id,
            name: row.Name,
            sortOrder: parseInt(row.SortOrder) || 0,
            description: row.Description || null,
          }
        }).catch(e => {
          // If upsert fails on ID not found (sometimes happens), we can try to find first or create
          // Actually prisma upsert with a fake ID will fail if the ID is not found for update?
          // No, if the WHERE condition is not met, it will CREATE. 
          console.error("Category Import Error for row", row, e);
        });
        importedCount++;
      }
    }

    // Process Products Sheet
    const productsSheetName = wb.SheetNames.includes("Products") ? "Products" : (wb.SheetNames.includes("المنتجات") ? "المنتجات" : null);
    if (productsSheetName) {
      const { checkProductLimit } = await import("@/lib/limits");
      
      const wsProducts = wb.Sheets[productsSheetName];
      const productsData = xlsx.utils.sheet_to_json<any>(wsProducts);

      for (const row of productsData) {
        if (!row.Name || !row.CategoryID) continue;

        // Check limits before creating a new product
        if (!row.ID) { // If it's a new product (doesn't have an ID)
          const { allowed } = await checkProductLimit(store.id);
          if (!allowed) {
            console.warn(`Reached product limit for store ${store.id}, stopping import`);
            break; // Stop importing more products
          }
        }

        // Verify category exists
        const category = await prisma.category.findFirst({
          where: { id: row.CategoryID, storeId: store.id }
        });

        if (!category) continue; // Skip if category is invalid

        // Parse Sizes
        const parsedSizes = [];
        if (row.Sizes) {
          const sizeParts = row.Sizes.toString().split('|');
          for (const p of sizeParts) {
            const [name, price] = p.split(':');
            if (name && price) {
              parsedSizes.push({ name: name.trim(), price: parseFloat(price.trim()) || 0 });
            }
          }
        }

        // Parse Addons
        const parsedAddons = [];
        if (row.Addons) {
          const addonParts = row.Addons.toString().split('|');
          for (const p of addonParts) {
            const [name, price] = p.split(':');
            if (name && price) {
              parsedAddons.push({ name: name.trim(), price: parseFloat(price.trim()) || 0 });
            }
          }
        }

        await prisma.menuItem.upsert({
          where: { id: row.ID || "new-temp-id" },
          update: {
            name: row.Name,
            description: row.Description || null,
            price: parseFloat(row.Price) || 0,
            isAvailable: row.IsAvailable === "Yes",
            image: row.Image || null,
            sortOrder: parseInt(row.SortOrder) || 0,
            categoryId: category.id,
            storeId: store.id,
            // Sizes and Addons update: first delete old, then create new
            sizes: { deleteMany: {}, create: parsedSizes },
            addons: { deleteMany: {}, create: parsedAddons }
          },
          create: {
            id: row.ID || undefined,
            name: row.Name,
            description: row.Description || null,
            price: parseFloat(row.Price) || 0,
            isAvailable: row.IsAvailable === "Yes",
            image: row.Image || null,
            sortOrder: parseInt(row.SortOrder) || 0,
            categoryId: category.id,
            storeId: store.id,
            sizes: { create: parsedSizes },
            addons: { create: parsedAddons }
          }
        }).catch(e => console.error("Product Import Error for row", row, e));
        importedCount++;
      }
    }

    return NextResponse.json({ success: true, count: importedCount });

  } catch (error) {
    console.error("Import Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
