"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { revalidatePath, revalidateTag } from "next/cache";

// ──────────────────────────────────
// Governorate Actions
// ──────────────────────────────────

export async function addGovernorate(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const name = formData.get("name") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;
  const uniformFeeStr = formData.get("uniformFee") as string;

  if (!name || name.trim() === "") return { error: "اسم المحافظة مطلوب" };

  const uniformFee = uniformFeeStr && uniformFeeStr.trim() !== "" ? parseFloat(uniformFeeStr) : null;

  // Get max sortOrder
  const last = await prisma.deliveryGovernorate.findFirst({
    where: { storeId: session.user.storeId },
    orderBy: { sortOrder: "desc" },
    select: { sortOrder: true },
  });

  await prisma.deliveryGovernorate.create({
    data: {
      name: name.trim(),
      whatsappNumber: whatsappNumber?.trim() || null,
      uniformFee,
      sortOrder: (last?.sortOrder ?? -1) + 1,
      storeId: session.user.storeId,
    },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم إضافة المحافظة بنجاح" };
}

export async function updateGovernorate(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const name = formData.get("name") as string;
  const whatsappNumber = formData.get("whatsappNumber") as string;
  const uniformFeeStr = formData.get("uniformFee") as string;

  if (!name || name.trim() === "") return { error: "اسم المحافظة مطلوب" };

  const uniformFee = uniformFeeStr && uniformFeeStr.trim() !== "" ? parseFloat(uniformFeeStr) : null;

  const existing = await prisma.deliveryGovernorate.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!existing) return { error: "المحافظة غير موجودة" };

  await prisma.deliveryGovernorate.update({
    where: { id },
    data: {
      name: name.trim(),
      whatsappNumber: whatsappNumber?.trim() || null,
      uniformFee,
    },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم تحديث المحافظة بنجاح" };
}

export async function deleteGovernorate(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  // Check if any cities have orders
  const citiesWithOrders = await prisma.deliveryArea.findMany({
    where: { governorateId: id, storeId: session.user.storeId, orders: { some: {} } },
    select: { id: true },
  });

  if (citiesWithOrders.length > 0) {
    // Soft approach: just deactivate instead of delete if there are orders
    await prisma.deliveryGovernorate.update({
      where: { id },
      data: { isActive: false },
    });
    await prisma.deliveryArea.updateMany({
      where: { governorateId: id },
      data: { isActive: false },
    });
    revalidatePath("/dashboard/settings/delivery-areas");
    (revalidateTag as any)(`store-${session.user.storeId}`, "default");
    return { success: "تم إيقاف المحافظة لوجود طلبات مرتبطة بها" };
  }

  await prisma.deliveryGovernorate.delete({
    where: { id },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم حذف المحافظة بنجاح" };
}

export async function toggleGovernorate(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const gov = await prisma.deliveryGovernorate.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!gov) return { error: "المحافظة غير موجودة" };

  await prisma.deliveryGovernorate.update({
    where: { id },
    data: { isActive: !gov.isActive },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: gov.isActive ? "تم إيقاف المحافظة" : "تم تفعيل المحافظة" };
}

// ──────────────────────────────────
// City Actions
// ──────────────────────────────────

export async function addCity(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const governorateId = formData.get("governorateId") as string;
  const name = formData.get("name") as string;
  const feeStr = formData.get("fee") as string;

  if (!governorateId) return { error: "يجب تحديد المحافظة" };
  if (!name || name.trim() === "") return { error: "اسم المدينة مطلوب" };
  if (!feeStr) return { error: "رسوم التوصيل مطلوبة" };

  // Verify governorate belongs to store
  const gov = await prisma.deliveryGovernorate.findFirst({
    where: { id: governorateId, storeId: session.user.storeId },
  });
  if (!gov) return { error: "المحافظة غير موجودة" };

  await prisma.deliveryArea.create({
    data: {
      name: name.trim(),
      deliveryFee: parseFloat(feeStr),
      storeId: session.user.storeId,
      governorateId,
    },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم إضافة المدينة بنجاح" };
}

export async function updateCity(id: string, formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const name = formData.get("name") as string;
  const feeStr = formData.get("fee") as string;

  if (!name || name.trim() === "") return { error: "اسم المدينة مطلوب" };
  if (!feeStr) return { error: "رسوم التوصيل مطلوبة" };

  const existing = await prisma.deliveryArea.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!existing) return { error: "المدينة غير موجودة" };

  await prisma.deliveryArea.update({
    where: { id },
    data: {
      name: name.trim(),
      deliveryFee: parseFloat(feeStr),
    },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم تحديث المدينة بنجاح" };
}

export async function deleteCity(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  // Check for orders
  const hasOrders = await prisma.order.findFirst({
    where: { deliveryAreaId: id },
    select: { id: true },
  });

  if (hasOrders) {
    await prisma.deliveryArea.update({
      where: { id },
      data: { isActive: false },
    });
    revalidatePath("/dashboard/settings/delivery-areas");
    (revalidateTag as any)(`store-${session.user.storeId}`, "default");
    return { success: "تم إيقاف المدينة لوجود طلبات مرتبطة بها" };
  }

  await prisma.deliveryArea.deleteMany({
    where: { id, storeId: session.user.storeId },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: "تم حذف المدينة بنجاح" };
}

export async function toggleCity(id: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح" };

  const city = await prisma.deliveryArea.findFirst({
    where: { id, storeId: session.user.storeId },
  });
  if (!city) return { error: "المدينة غير موجودة" };

  await prisma.deliveryArea.update({
    where: { id },
    data: { isActive: !city.isActive },
  });

  revalidatePath("/dashboard/settings/delivery-areas");
  (revalidateTag as any)(`store-${session.user.storeId}`, "default");
  return { success: city.isActive ? "تم إيقاف المدينة" : "تم تفعيل المدينة" };
}
