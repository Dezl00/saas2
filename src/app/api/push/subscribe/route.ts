import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const { subscription, storeId } = await request.json();

    if (!subscription || !subscription.endpoint || !subscription.keys || !storeId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const newSubscriber = await prisma.pushSubscriber.upsert({
      where: {
        storeId_endpoint: {
          storeId,
          endpoint: subscription.endpoint,
        },
      },
      update: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      create: {
        storeId,
        endpoint: subscription.endpoint,
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
    });

    return NextResponse.json({ success: true, subscriber: newSubscriber });
  } catch (error) {
    console.error("Error subscribing to push:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
