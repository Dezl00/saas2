"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function processPaymentRequestAction(
  requestId: string,
  storeId: string,
  planId: string,
  status: "APPROVED" | "REJECTED"
) {
  try {
    const adminId = "admin-1"; // TODO: get from Auth.js session

    // 1. Update the Payment Request
    await prisma.paymentRequest.update({
      where: { id: requestId },
      data: {
        status,
        reviewedBy: adminId,
        reviewedAt: new Date()
      }
    });

    if (status === "APPROVED") {
      const plan = await prisma.plan.findUnique({ where: { id: planId } });
      if (!plan) throw new Error("الباقة غير موجودة");

      const startDate = new Date();
      const endDate = new Date();
      endDate.setDate(endDate.getDate() + plan.durationDays);

      // 2. Upsert Subscription
      await prisma.subscription.upsert({
        where: { storeId },
        update: {
          planId: plan.id,
          status: "ACTIVE",
          startDate,
          endDate
        },
        create: {
          storeId,
          planId: plan.id,
          status: "ACTIVE",
          startDate,
          endDate
        }
      });

      // 3. Add History
      await prisma.subscriptionHistory.create({
        data: {
          storeId,
          action: "PAYMENT_APPROVED",
          details: `تم تفعيل باقة ${plan.name} لمدة ${plan.durationDays} يوم`
        }
      });

      // 4. Send Notification
      await prisma.notification.create({
        data: {
          storeId,
          title: "تأكيد الدفع والتفعيل",
          message: `تم مراجعة إيصال الدفع بنجاح. تم تفعيل باقتك (${plan.name}).`,
          type: "BILLING"
        }
      });

    } else if (status === "REJECTED") {
      // Add History
      await prisma.subscriptionHistory.create({
        data: {
          storeId,
          action: "PAYMENT_REJECTED",
          details: `تم رفض إيصال الدفع لطلب رقم ${requestId}`
        }
      });

      // Send Notification
      await prisma.notification.create({
        data: {
          storeId,
          title: "فشل تأكيد الدفع",
          message: `عذراً، تم رفض إيصال الدفع الخاص بك. يرجى مراجعة الدعم أو رفع إيصال واضح.`,
          type: "BILLING"
        }
      });
    }

    revalidatePath("/admin/payment-requests");
    revalidatePath(`/admin/payment-requests/${requestId}`);
    
    return { success: true };
  } catch (error) {
    console.error("Process Payment Error:", error);
    return { error: "حدث خطأ أثناء معالجة الطلب" };
  }
}
