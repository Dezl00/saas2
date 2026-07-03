import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { dashboardTheme, dashboardFont } = body;

    const updated = await prisma.platformSetting.upsert({
      where: { id: "1" },
      update: {
        dashboardTheme,
        dashboardFont,
      },
      create: {
        id: "1",
        dashboardTheme,
        dashboardFont,
      },
    });

    return NextResponse.json({ success: true, settings: updated });
  } catch (error) {
    console.error("Error updating appearance settings:", error);
    return NextResponse.json(
      { error: "حدث خطأ أثناء حفظ الإعدادات" },
      { status: 500 }
    );
  }
}
