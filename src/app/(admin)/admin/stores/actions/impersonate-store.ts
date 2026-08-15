"use server";

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";

export async function impersonateStore(storeId: string) {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  const store = await prisma.store.findUnique({ where: { id: storeId }, select: { id: true } });
  if (!store) throw new Error('Store not found');

  // Set the impersonation cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_managed_store_id", storeId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    sameSite: "strict",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  redirect("/dashboard");
}
