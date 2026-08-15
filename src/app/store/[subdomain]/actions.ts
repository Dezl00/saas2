"use server";

import { prisma } from "@/lib/prisma";
import { checkRateLimit, getClientIP } from "@/lib/rate-limit";

export async function placeOrderAction(formData: FormData) {
  try {
    const storeId = formData.get("storeId") as string;
    const ip = await getClientIP();
    
    // IP + Store limit to prevent spam orders
    const rl = await checkRateLimit({ key: `order_ip_${storeId}_${ip}`, limit: 5, windowMs: 10 * 60 * 1000 });
    if (!rl.success) {
      return { error: "لقد أرسلت طلبات كثيرة. يرجى الانتظار 10 دقائق." };
    }
    const deliveryType = formData.get("deliveryType") as "DELIVERY" | "PICKUP";
    const selectedArea = formData.get("selectedArea") as string;
    const selectedBranch = formData.get("selectedBranch") as string;
    
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;
    const notes = formData.get("notes") as string;
    
    const cartItemsStr = formData.get("cartItems") as string;
    const items = JSON.parse(cartItemsStr);

    const subtotal = Number(formData.get("subtotal"));
    const deliveryFee = Number(formData.get("deliveryFee"));
    const total = Number(formData.get("total"));

    if (!storeId || !customerName || !customerPhone || !items.length) {
      return { error: "بيانات غير مكتملة" };
    }

    // 1. Verify store status and subscription
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { subscription: true }
    });

    if (!store) {
      return { error: "المتجر غير موجود" };
    }

    if (store.status !== "ACTIVE") {
      return { error: "المتجر غير متاح حالياً لاستقبال الطلبات" };
    }

    if (store.subscription) {
      const isExpired = store.subscription.endDate && new Date(store.subscription.endDate) < new Date();
      if (isExpired || (store.subscription.status !== "ACTIVE" && store.subscription.status !== "TRIAL")) {
        return { error: "المتجر غير متاح حالياً لاستقبال الطلبات (اشتراك منتهي)" };
      }
    }
    // else: Allow orders for now if subscription record doesn't exist (e.g., newly created test stores)

    // 2. Verify prices from the database
    const menuItemIds = items.map((item: any) => item.id.split('-')[0]);
    const dbMenuItems = await prisma.menuItem.findMany({
      where: { 
        id: { in: menuItemIds }, 
        OR: [
          { storeId },
          { storeId: "DEFAULT_STORE" }
        ]
      },
      include: {
        sizes: true,
        addons: true
      }
    });

    const dbMenuItemsMap = new Map(dbMenuItems.map(item => [item.id, item]));

    let calculatedSubtotal = 0;
    const verifiedItems = items.map((item: any) => {
      const baseItemId = item.id.split('-')[0];
      const dbItem = dbMenuItemsMap.get(baseItemId);
      if (!dbItem) throw new Error(`المنتج غير موجود: ${item.name}`);
      
      let itemPrice = Number(dbItem.price);
      
      // Add selected size price if applicable
      if (item.selectedSize && dbItem.sizes) {
        const selectedSize = dbItem.sizes.find((s: any) => s.name === item.selectedSize?.name || s.id === item.selectedSize?.id);
        if (selectedSize) {
          itemPrice = Number(selectedSize.price);
        }
      }
      
      // Add selected addons prices
      if (item.selectedAddons && Array.isArray(item.selectedAddons) && dbItem.addons) {
        for (const addon of item.selectedAddons) {
          const dbAddon = dbItem.addons.find((a: any) => a.name === addon.name || a.id === addon.id);
          if (dbAddon) {
            itemPrice += Number(dbAddon.price);
          }
        }
      }
      
      calculatedSubtotal += itemPrice * item.quantity;

      return {
        menuItemId: dbItem.id,
        name: item.name,
        quantity: item.quantity,
        price: itemPrice,
        notes: item.notes || null,
        selectedSize: item.selectedSize ? JSON.stringify(item.selectedSize) : null,
        selectedAddons: item.selectedAddons ? JSON.stringify(item.selectedAddons) : null,
      };
    });

    let finalDeliveryFee = 0;
    if (deliveryType === "DELIVERY" && selectedArea) {
      const area = await prisma.deliveryArea.findUnique({
        where: { id: selectedArea },
        include: { governorate: true }
      });
      if (area) {
        if (area.governorate?.uniformFee !== null && area.governorate?.uniformFee !== undefined) {
          finalDeliveryFee = Number(area.governorate.uniformFee);
        } else {
          finalDeliveryFee = Number(area.deliveryFee);
        }
      }
    }

    // Atomic order number generation + order creation in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Get next order number atomically with row-level lock
      const result = await tx.$queryRaw<{ next_number: number }[]>`
        SELECT COALESCE(MAX("orderNumber"), 999) + 1 as next_number
        FROM "Order"
        WHERE "storeId" = ${storeId}
        FOR UPDATE
      `;
      const orderNumber = result[0]?.next_number ?? 1000;

      return tx.order.create({
        data: {
          orderNumber,
          storeId,
          customerName,
          customerPhone,
          customerAddress: deliveryType === "DELIVERY" ? customerAddress : null,
          notes,
          deliveryType,
          deliveryAreaId: deliveryType === "DELIVERY" && selectedArea ? selectedArea : null,
          branchId: deliveryType === "PICKUP" && selectedBranch ? selectedBranch : null,
          subtotal: calculatedSubtotal,
          deliveryFee: finalDeliveryFee,
          total: calculatedSubtotal + finalDeliveryFee,
          status: "PENDING",
          paymentMethod: "CASH",
          items: {
            create: verifiedItems
          }
        }
      });
    });

    return { success: true, orderId: order.id };
  } catch (error) {
    console.error("Place Order Error:", error);
    return { error: "حدث خطأ غير متوقع أثناء معالجة الطلب" };
  }
}
