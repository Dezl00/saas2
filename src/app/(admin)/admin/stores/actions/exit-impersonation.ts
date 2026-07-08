"use server";

import { auth } from "@/lib/auth";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function exitImpersonation() {
  const session = await auth();
  
  if (!session || session.user.role !== "ADMIN") {
    throw new Error("Unauthorized");
  }

  // Clear the impersonation cookie
  const cookieStore = await cookies();
  cookieStore.delete("admin_managed_store_id");

  redirect("/admin/stores");
}
