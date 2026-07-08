import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import PushNotificationsClient from "./components/PushNotificationsClient";

export const metadata = {
  title: "إشعارات المتجر | لوحة التحكم",
};

export default async function PushNotificationsServerPage() {
  const session = await auth();
  if (!session?.user?.storeId) {
    redirect("/login");
  }

  const storeId = session.user.storeId;

  // Get total subscribers
  const subscribersCount = await prisma.pushSubscriber.count({
    where: { storeId },
  });

  // Get campaigns history
  const campaigns = await prisma.pushCampaign.findMany({
    where: { storeId },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <PushNotificationsClient 
      subscribersCount={subscribersCount} 
      campaigns={campaigns} 
    />
  );
}
