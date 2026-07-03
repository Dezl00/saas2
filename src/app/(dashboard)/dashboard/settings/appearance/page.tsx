import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppearanceClient } from "./AppearanceClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "المظهر | لوحة التحكم",
};

export default async function AppearancePage() {
  const session = await auth();
  if (!session?.user?.storeId) {
    notFound();
  }

  const store = await prisma.store.findUnique({
    where: { id: session.user.storeId },
    select: { fontFamily: true },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AppearanceClient currentFont={store.fontFamily} />
    </div>
  );
}
