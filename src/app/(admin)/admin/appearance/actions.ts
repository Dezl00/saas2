"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export async function updateAppearanceSettings(formData: FormData) {
  const dashboardTheme = formData.get("dashboardTheme") as string;
  const dashboardFont = formData.get("dashboardFont") as string;

  if (!dashboardTheme || !dashboardFont) {
    throw new Error("Missing required fields");
  }

  await prisma.platformSetting.upsert({
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

  revalidatePath("/", "layout");
  redirect("/admin/appearance?success=true");
}
