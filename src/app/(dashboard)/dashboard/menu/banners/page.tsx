import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { BannersClient } from "./BannersClient";
import { notFound } from "next/navigation";

export const metadata = {
  title: "العروض والبانرات | لوحة التحكم",
};

export default async function BannersPage() {
  const session = await auth();

  if (!session?.user?.storeId) {
    return notFound();
  }

  const banners = await prisma.storeBanner.findMany({
    where: { storeId: session.user.storeId },
    orderBy: { sortOrder: "asc" },
  });

  return (
    <div className="space-y-6">
      <BannersClient initialBanners={banners} />
    </div>
  );
}
