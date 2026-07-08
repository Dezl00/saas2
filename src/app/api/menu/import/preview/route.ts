import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import * as xlsx from "xlsx";
import { v4 as uuidv4 } from "uuid";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!session?.user?.storeId) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) {
      return NextResponse.json({ error: "لم يتم العثور على ملف" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const wb = xlsx.read(buffer, { type: 'buffer' });

    const productsSheetName = wb.SheetNames.includes("Products") ? "Products" : (wb.SheetNames.includes("المنتجات") ? "المنتجات" : null);
    
    if (!productsSheetName) {
      return NextResponse.json({ error: "لم يتم العثور على ورقة المنتجات (Products/المنتجات)" }, { status: 400 });
    }

    const wsProducts = wb.Sheets[productsSheetName];
    const productsData = xlsx.utils.sheet_to_json<any>(wsProducts);

    // Fetch existing categories
    const storeCategories = await prisma.category.findMany({
      where: { storeId: session.user.storeId },
      select: { id: true, name: true }
    });

    // Fetch existing items to check for duplicates
    const existingItems = await prisma.menuItem.findMany({
      where: { storeId: session.user.storeId },
      select: { name: true, price: true }
    });

    const parsedProducts = [];
    let duplicateCount = 0;

    for (const row of productsData) {
      if (!row.Name) continue;

      const price = parseFloat(row.Price) || 0;
      
      // Check for exact duplicate in DB
      const isDuplicate = existingItems.some(item => 
        item.name.toLowerCase().trim() === row.Name.toLowerCase().trim() && 
        Number(item.price) === price
      );

      if (isDuplicate) duplicateCount++;

      // Try to find matching category by Name if possible
      const categoryName = row.CategoryName || "";
      let categoryId = "";
      if (categoryName) {
        const matchingCat = storeCategories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());
        if (matchingCat) categoryId = matchingCat.id;
      }

      parsedProducts.push({
        tempId: uuidv4(),
        id: row.ID || undefined,
        name: row.Name,
        description: row.Description || "",
        price: price,
        categoryName: categoryName,
        categoryId: categoryId, // will be empty if not found, forcing user to select
        image: row.Image || "",
        sortOrder: parseInt(row.SortOrder) || 0,
        isActive: row.IsActive === "Yes" || row.IsActive === "نعم",
        sizes: row.Sizes || "",
        addons: row.Addons || "",
        isDuplicate,
        selected: !isDuplicate // default select if not duplicate
      });
    }

    return NextResponse.json({
      success: true,
      products: parsedProducts,
      categories: storeCategories,
      duplicateCount
    });

  } catch (error: any) {
    console.error("Preview import error:", error);
    return NextResponse.json({ error: error.message || "حدث خطأ أثناء تحليل الملف" }, { status: 500 });
  }
}
