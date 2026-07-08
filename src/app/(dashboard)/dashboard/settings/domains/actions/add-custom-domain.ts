"use server";

import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function addCustomDomain(formData: FormData) {
  const session = await auth();
  if (!session?.user?.storeId) return { error: "غير مصرح لك" };

  let domainName = formData.get("domain") as string;
  if (!domainName) return { error: "يرجى كتابة الدومين" };

  domainName = domainName.replace(/^(https?:\/\/)?/, '').replace(/\/$/, '').toLowerCase();
  const domainRegex = /^([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  if (!domainRegex.test(domainName)) return { error: "صيغة الدومين غير صحيحة" };

  // Check if custom domain feature is enabled in the plan
  const { checkFeatureEnabled } = await import("@/lib/limits");
  const canUseDomain = await checkFeatureEnabled(session.user.storeId, "customDomain");
  if (!canUseDomain) {
    return { error: "ميزة الدومين الخاص غير متاحة في باقتك الحالية. قم بالترقية لتفعيلها." };
  }

  try {
    const existing = await prisma.domain.findUnique({ where: { name: domainName } });
    if (existing) return { error: "عذراً، هذا الدومين مربوط بمتجر آخر." };

    const token = process.env.VERCEL_ACCESS_TOKEN;
    const projectId = process.env.VERCEL_PROJECT_ID;

    let dnsRecords: any = { cname: "cname.vercel-dns.com", a: "76.76.21.21" };

    if (token && projectId) {
      const res = await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
        method: 'POST',
        headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ name: domainName })
      });
      
      if (!res.ok) {
        const data = await res.json();
        return { error: data.error?.message || "خطأ في Vercel" };
      }

      if (domainName.split('.').length === 2) {
        await fetch(`https://api.vercel.com/v10/projects/${projectId}/domains`, {
          method: 'POST',
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
          body: JSON.stringify({ name: `www.${domainName}` })
        }).catch(() => {});
      }
      
      const configRes = await fetch(`https://api.vercel.com/v6/domains/${domainName}/config`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const configData = await configRes.json();
      
      const projectDomainRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/${domainName}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      const projectDomainData = await projectDomainRes.json();

      let wwwDomainData = null;
      if (domainName.split('.').length === 2) {
        const wwwDomainRes = await fetch(`https://api.vercel.com/v9/projects/${projectId}/domains/www.${domainName}`, {
          headers: { "Authorization": `Bearer ${token}` }
        }).catch(() => null);
        if (wwwDomainRes) wwwDomainData = await wwwDomainRes.json();
      }

      if (configData.misconfigured) {
        const aRecord = projectDomainData?.verification?.find((v: any) => v.type === 'A')?.value || "76.76.21.21";
        const cnameRecord = wwwDomainData?.verification?.find((v: any) => v.type === 'CNAME')?.value || projectDomainData?.verification?.find((v: any) => v.type === 'CNAME')?.value || "cname.vercel-dns.com";

        dnsRecords = {
          intendedNameservers: projectDomainData.intendedNameservers || ["ns1.vercel-dns.com", "ns2.vercel-dns.com"],
          cname: cnameRecord,
          a: aRecord
        };
      }
    }

    await prisma.domain.create({
      data: {
        name: domainName,
        storeId: session.user.storeId,
        status: "WAITING_DNS",
        dnsRecords
      }
    });

    revalidatePath("/dashboard/settings");
    return { success: "تمت إضافة الدومين بنجاح." };

  } catch (error) {
    console.error(error);
    return { error: "حدث خطأ داخلي." };
  }
}
