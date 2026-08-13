import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import webpush from "web-push";

export async function POST(request: Request) {
  try {
    const publicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
    const privateKey = process.env.VAPID_PRIVATE_KEY;

    if (!publicKey || !privateKey) {
      console.error("VAPID keys are not configured.");
      return NextResponse.json({ error: "Push notifications are not configured" }, { status: 500 });
    }

    // Configure web-push with VAPID keys
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || "mailto:admin@example.com",
      publicKey,
      privateKey
    );

    const session = await auth();
    if (!session || !session.user || !session.user.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const storeId = session.user.storeId;
    const store = await prisma.store.findUnique({
      where: { id: storeId },
    });

    if (!store) {
      return NextResponse.json({ error: "Store not found" }, { status: 404 });
    }
    const { title, body, image, link } = await request.json();

    if (!title || !body) {
      return NextResponse.json({ error: "Title and body are required" }, { status: 400 });
    }

    // Fetch all subscribers for this store
    const subscribers = await prisma.pushSubscriber.findMany({
      where: { storeId },
    });

    if (subscribers.length === 0) {
      return NextResponse.json({ error: "No subscribers found for this store" }, { status: 404 });
    }

    const payload = JSON.stringify({
      title,
      body,
      image,
      url: link || `https://${store.subdomain}.almenu.pro`,
    });

    let successCount = 0;
    let failureCount = 0;

    const sendPromises = subscribers.map(async (subscriber) => {
      try {
        const pushSubscription = {
          endpoint: subscriber.endpoint,
          keys: {
            p256dh: subscriber.p256dh,
            auth: subscriber.auth,
          },
        };
        await webpush.sendNotification(pushSubscription, payload);
        successCount++;
      } catch (error: any) {
        failureCount++;
        // If the subscription is invalid/expired, remove it from DB
        if (error.statusCode === 404 || error.statusCode === 410) {
          await prisma.pushSubscriber.delete({
            where: { id: subscriber.id },
          });
        }
      }
    });

    await Promise.allSettled(sendPromises);

    // Save the campaign
    const campaign = await prisma.pushCampaign.create({
      data: {
        storeId,
        title,
        body,
        image,
        link,
        targetCount: subscribers.length,
        successCount,
        failureCount,
      },
    });

    return NextResponse.json({ success: true, campaign });
  } catch (error) {
    console.error("Error sending push notification:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
