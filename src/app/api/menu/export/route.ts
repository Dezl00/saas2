import { NextResponse } from "next/server";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import * as xlsx from "xlsx";

export async function GET(req: Request) {
  await connection();
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
    }

    const store = await prisma.store.findUnique({
      where: { id: session.user.storeId as string },
      include: {
        categories: {
          orderBy: { sortOrder: 'asc' },
          include: {
            items: {
              orderBy: { sortOrder: 'asc' },
              include: {
                sizes: true,
                addons: true
              }
            }
          }
        }
      }
    });

    if (!store) {
      return NextResponse.json({ error: "المتجر غير موجود" }, { status: 404 });
    }

    // Prepare Categories Sheet
    const categoriesData = (store as any).categories.length > 0 
      ? (store as any).categories.map((c: any) => ({
          ID: c.id,
          Name: c.name,
          Description: c.description || "",
          SortOrder: c.sortOrder,
          IsActive: c.isActive ? "Yes" : "No"
        }))
      : [{
          ID: "",
          Name: "",
          Description: "",
          SortOrder: "",
          IsActive: ""
        }];

    // Prepare Products Sheet
    const productsData: any[] = [];
    (store as any).categories.forEach((category: any) => {
      category.items.forEach((item: any) => {
        
        // Format sizes and addons as string
        const sizesStr = item.sizes?.map((s: any) => `${s.name}:${s.price}`).join(" | ") || "";
        const addonsStr = item.addons?.map((a: any) => `${a.name}:${a.price}`).join(" | ") || "";

        productsData.push({
          ID: item.id,
          CategoryID: category.id,
          CategoryName: category.name,
          Name: item.name,
          Description: item.description || "",
          Price: item.price.toString(),
          IsAvailable: item.isAvailable ? "Yes" : "No",
          Image: item.image || "",
          SortOrder: item.sortOrder,
          Sizes: sizesStr,
          Addons: addonsStr
        });
      });
    });

    if (productsData.length === 0) {
      productsData.push({
        ID: "",
        CategoryID: "",
        CategoryName: "",
        Name: "",
        Description: "",
        Price: "",
        IsAvailable: "",
        Image: "",
        SortOrder: "",
        Sizes: "",
        Addons: ""
      });
    }

    // Create a new workbook
    const wb = xlsx.utils.book_new();
    
    // Add Products Sheet FIRST
    const wsProducts = xlsx.utils.json_to_sheet(productsData);
    xlsx.utils.book_append_sheet(wb, wsProducts, "المنتجات");

    // Add Categories Sheet SECOND
    const wsCategories = xlsx.utils.json_to_sheet(categoriesData);
    xlsx.utils.book_append_sheet(wb, wsCategories, "الأقسام");

    // Write to buffer
    const buf = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });

    // Return as downloadable file
    return new Response(buf, {
      status: 200,
      headers: {
        "Content-Disposition": `attachment; filename="menu_${store.subdomain}.xlsx"`,
        "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      }
    });

  } catch (error) {
    console.error("Export Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
