"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function verifyDomainStatus(domainId: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح لك" };

  try {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain || domain.storeId !== session.user.storeId) return { error: "الدومين غير موجود" };

    const token = process.env.VERCEL_ACCESS_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;
    if (!token || !projectId) return { error: "إعدادات Vercel مفقودة" };

    const configRes = await fetch(`https://api.vercel.com/v6/domains/${domain.name}/config`, {
      headers: { "Authorization": `Bearer ${token}` }
    });
    const configData = await configRes.json();

    if (!configData.misconfigured) {
      await prisma.domain.update({
        where: { id: domain.id },
        data: { status: "CONNECTED" }
      });
      revalidatePath("/dashboard/settings");
      return { success: "تم التحقق بنجاح!", status: "CONNECTED" };
    } else {
      return { error: "إعدادات DNS غير صحيحة بعد." };
    }
  } catch (error) {
    return { error: "فشل التحقق." };
  }
}
