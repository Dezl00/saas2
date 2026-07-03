import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ImportExportClient } from "./ImportExportClient";
import { FileUp, FileDown } from "lucide-react";

export default async function ImportExportPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/login");

  const store = await prisma.store.findUnique({
    where: { userId: session.user.id }
  });

  if (!store) redirect("/onboarding");

  return (
    <div className="space-y-6">
      <ImportExportClient storeId={store.id} />
    </div>
  );
}
