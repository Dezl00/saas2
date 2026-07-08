"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function removeCustomDomain(domainId: string) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح لك" };

  try {
    const domain = await prisma.domain.findUnique({ where: { id: domainId } });
    if (!domain || domain.storeId !== session.user.storeId) return { error: "الدومين غير موجود" };

    const token = process.env.VERCEL_ACCESS_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    if (token && projectId) {
      await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domain.name}`, {
        method: 'DELETE',
        headers: { "Authorization": `Bearer ${token}` }
      }).catch(() => {});
      
      if (domain.name.split('.').length === 2) {
        await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/www.${domain.name}`, {
          method: 'DELETE',
          headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => {});
      }
    }

    await prisma.domain.delete({ where: { id: domainId } });
    revalidatePath("/dashboard/settings");
    return { success: "تم الحذف بنجاح." };
  } catch (error) {
    return { error: "فشل الحذف." };
  }
}
