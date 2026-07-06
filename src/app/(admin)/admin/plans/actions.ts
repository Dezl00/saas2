"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createPlanAction(prevState: any, formData: FormData) {
  try {
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const durationDays = parseInt(formData.get("durationDays") as string, 10);
    const sortOrder = parseInt(formData.get("sortOrder") as string, 10);
    const isActive = formData.get("isActive") === "true";

    // Parse feature flags
    const features = {
      products: parseInt(formData.get("feat_products") as string, 10) || -1,
      branches: parseInt(formData.get("feat_branches") as string, 10) || 1,
      staff: parseInt(formData.get("feat_staff") as string, 10) || 1,
      qr: formData.get("feat_qr") === "true",
      reports: formData.get("feat_reports") === "true",
      ai: formData.get("feat_ai") === "true",
      customDomain: formData.get("feat_customDomain") === "true",
      removeBranding: formData.get("feat_removeBranding") === "true",
    };

    if (!name || isNaN(price)) {
      return { error: "يرجى تعبئة الحقول المطلوبة بشكل صحيح" };
    }

    await prisma.plan.create({
      data: {
        name,
        price,
        description,
        durationDays,
        sortOrder,
        isActive,
        features,
      },
    });

    revalidatePath("/admin/plans");
    return { success: true };
  } catch (error) {
    console.error("Create Plan Error:", error);
    return { error: "حدث خطأ أثناء إنشاء الباقة" };
  }
}

export async function updatePlanAction(prevState: any, formData: FormData) {
  try {
    const id = formData.get("id") as string;
    const name = formData.get("name") as string;
    const price = parseFloat(formData.get("price") as string);
    const description = formData.get("description") as string;
    const durationDays = parseInt(formData.get("durationDays") as string, 10);
    const sortOrder = parseInt(formData.get("sortOrder") as string, 10);
    const isActive = formData.get("isActive") === "true" || formData.get("isActive") === "on";

    const features = {
      products: parseInt(formData.get("feat_products") as string, 10) || -1,
      branches: parseInt(formData.get("feat_branches") as string, 10) || 1,
      staff: parseInt(formData.get("feat_staff") as string, 10) || 1,
      qr: formData.get("feat_qr") === "true",
      reports: formData.get("feat_reports") === "true",
      ai: formData.get("feat_ai") === "true",
      customDomain: formData.get("feat_customDomain") === "true",
      removeBranding: formData.get("feat_removeBranding") === "true",
    };

    if (!id || !name || isNaN(price)) {
      return { error: "يرجى تعبئة الحقول المطلوبة بشكل صحيح" };
    }

    await prisma.plan.update({
      where: { id },
      data: {
        name,
        price,
        description,
        durationDays,
        sortOrder,
        isActive,
        features,
      },
    });

    revalidatePath("/admin/plans");
    return { success: true };
  } catch (error) {
    console.error("Update Plan Error:", error);
    return { error: "حدث خطأ أثناء تحديث الباقة" };
  }
}
