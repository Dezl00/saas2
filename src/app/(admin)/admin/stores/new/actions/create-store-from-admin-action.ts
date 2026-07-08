"use server";
import { createStoreSchema } from '@/lib/validations';
import { createStoreSchema } from '@/lib/validations';

import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";

export async function createStoreFromAdminAction(prevState: any, formData: FormData) {
  const rawData = Object.fromEntries(formData);
  
  try {
    const session = await auth();
    if (!session || session.user.role !== "ADMIN") {
      return { error: "غير مصرح لك للقيام بهذه العملية", data: rawData };
    }

    const validatedData = createStoreSchema.parse(rawData);

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: validatedData.email },
    });

    if (existingUser) {
      return { fieldErrors: { email: ["البريد الإلكتروني مسجل مسبقاً"] }, data: rawData };
    }

    // Check if subdomain already exists
    const existingSubdomain = await prisma.store.findUnique({
      where: { subdomain: validatedData.subdomain },
    });

    if (existingSubdomain) {
      return { fieldErrors: { subdomain: ["هذا الرابط مستخدم من قبل، يرجى اختيار رابط آخر"] }, data: rawData };
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(validatedData.password, 10);

    // Handle Image Upload
    let logoStr = "";
    if (validatedData.logo instanceof File && validatedData.logo.size > 0) {
      const { uploadImageToCloudinary } = await import("@/lib/upload");
      logoStr = await uploadImageToCloudinary(validatedData.logo);
    } else if (typeof validatedData.logo === "string") {
      logoStr = validatedData.logo;
    }

    // Create User and Store in a transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name: "مدير المتجر",
          email: validatedData.email,
          password: hashedPassword,
          phone: validatedData.phone,
          role: "OWNER",
        },
      });

      await tx.store.create({
        data: {
          name: validatedData.name,
          logo: logoStr,
          primaryColor: validatedData.primaryColor,
          address: validatedData.address,
          whatsappNumber: validatedData.whatsappNumber,
          phone: validatedData.phone,
          subdomain: validatedData.subdomain,
          userId: newUser.id,
        },
      });
    });

  } catch (error: any) {
    if (error instanceof z.ZodError || error?.name === "ZodError") {
      const fieldErrors = error.flatten ? error.flatten().fieldErrors : {};
      return { fieldErrors, data: rawData };
    }
    return { error: "حدث خطأ غير متوقع: " + (error?.message || String(error)), data: rawData };
  }

  revalidatePath("/admin/stores");
  redirect("/admin/stores");
}
