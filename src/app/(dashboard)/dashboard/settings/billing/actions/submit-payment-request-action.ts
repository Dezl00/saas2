"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function submitPaymentRequestAction(prevState: any, formData: FormData) {
  try {
    const planId = formData.get("planId") as string;
    const storeId = formData.get("storeId") as string;
    const methodId = formData.get("methodId") as string;
    const transactionId = formData.get("transactionId") as string;
    const receiptImageFile = formData.get("receiptImage") as File;

    if (!planId || !storeId || !methodId || !receiptImageFile || receiptImageFile.size === 0) {
      return { error: "يرجى اختيار طريقة الدفع وإرفاق صورة الإيصال" };
    }

    const plan = await prisma.plan.findUnique({ where: { id: planId } });
    if (!plan) return { error: "الباقة غير موجودة" };

    // Upload receipt image to cloudinary
    const { uploadImageToCloudinary } = await import("@/lib/upload");
    let receiptUrl = "";
    try {
      receiptUrl = await uploadImageToCloudinary(receiptImageFile);
    } catch (e) {
      return { error: "حدث خطأ أثناء رفع الصورة" };
    }

    await prisma.paymentRequest.create({
      data: {
        storeId,
        planId,
        methodId,
        amount: plan.price,
        receiptImage: receiptUrl,
        transactionId: transactionId || null,
        status: "PENDING"
      }
    });

    // Update Subscription status to PENDING_PAYMENT if it exists, or create it
    await prisma.subscription.upsert({
      where: { storeId },
      update: {
        status: "PENDING_PAYMENT",
      },
      create: {
        storeId,
        status: "PENDING_PAYMENT",
        startDate: new Date(),
        endDate: new Date(), // It will be updated when approved
      }
    });

    revalidatePath("/dashboard/billing");
    revalidatePath("/admin/payment-requests");
    
    return { success: true };
  } catch (error) {
    console.error("Submit Payment Request Error:", error);
    return { error: "حدث خطأ أثناء رفع الطلب" };
  }
}
