"use server";

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function impersonateStore(storeId: string) {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Set the impersonation cookie
  const cookieStore = await cookies();
  cookieStore.set("admin_managed_store_id", storeId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });

  redirect("/dashboard");
}
