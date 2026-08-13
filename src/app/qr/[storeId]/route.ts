import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ storeId: string }> }
) {
  const { storeId } = await params;

  if (!storeId) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  try {
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { domains: true },
    });

    if (!store) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Determine the active domain or subdomain
    let redirectUrl = "";
    
    if (store.domains && store.domains.length > 0 && store.domains[0].name) {
      redirectUrl = `https://${store.domains[0].name}`;
    } else if (store.subdomain) {
      redirectUrl = `https://${store.subdomain}.almenu.pro`;
    } else {
      // Fallback
      redirectUrl = `https://${store.id}.almenu.pro`;
    }

    return NextResponse.redirect(redirectUrl);
  } catch (error) {
    console.error("QR Redirect Error:", error);
    return NextResponse.redirect(new URL("/", request.url));
  }
}
