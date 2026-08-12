import { prisma } from "@/lib/prisma";
import { cacheTag } from "next/cache";

export async function getStoreInfo(subdomain: string) {
  "use cache";
  cacheTag(`store-${subdomain}`);
  
  const store = await prisma.store.findFirst({
    where: {
      OR: [
        { subdomain: subdomain },
        { domains: { some: { name: subdomain } } }
      ]
    },
    select: {
      id: true,
      name: true,
      description: true,
      logo: true,
      favicon: true,
      status: true,
      phone: true,
      address: true,
      currency: true,
      primaryColor: true,
      theme: true,
      whatsappNumber: true,
      enableWhatsappOrders: true,
      facebookUrl: true,
      showFacebook: true,
      instagramUrl: true,
      showInstagram: true,
      twitterUrl: true,
      showTwitter: true,
      tiktokUrl: true,
      showTiktok: true,
      snapchatUrl: true,
      showSnapchat: true,
      showDefaultProducts: true,
      fontFamily: true,
      workingHours: true,
      mapLatitude: true,
      mapLongitude: true,
      hideProductDescription: true,
      hideProductAddButton: true,
      showFloatingIcons: true,
      enableLandingPage: true,
      landingHeroTitle: true,
      landingHeroDescription: true,
      landingHeroImage: true,
      landingHeroOverlayOpacity: true,
      branches: { 
        where: { isActive: true },
        select: { id: true, name: true, address: true }
      },
      deliveryAreas: { 
        where: { isActive: true },
        select: { id: true, name: true, deliveryFee: true }
      }
    }
  });

  return store;
}

export async function getStoreCatalog(storeId: string, showDefaultProducts: boolean) {
  "use cache";
  cacheTag(`store-catalog-${storeId}`);

  let targetStoreId = storeId;
  let useDefault = false;

  // First check if store has its own products
  let categories = await prisma.category.findMany({
    where: { storeId: targetStoreId, isActive: true },
    orderBy: { sortOrder: 'asc' },
    select: { id: true, name: true, image: true }
  });

  if (categories.length === 0 && showDefaultProducts) {
    targetStoreId = 'DEFAULT_STORE';
    useDefault = true;
    categories = await prisma.category.findMany({
      where: { storeId: targetStoreId, isActive: true },
      orderBy: { sortOrder: 'asc' },
      select: { id: true, name: true, image: true }
    });
  }

  const menuItems = await prisma.menuItem.findMany({
    where: { storeId: targetStoreId, isAvailable: true },
    orderBy: [
      { sortOrder: 'asc' },
      { id: 'asc' }
    ],
    select: {
      id: true,
      name: true,
      description: true,
      price: true,
      image: true,
      categoryId: true,
      sizes: { select: { id: true, name: true, price: true } },
      addons: { select: { id: true, name: true, price: true } }
    }
  });

  return { categories, menuItems };
}

export async function getStoreBanners(storeId: string) {
  "use cache";
  cacheTag(`store-banners-${storeId}`);

  const banners = await prisma.storeBanner.findMany({
    where: { storeId, isActive: true },
    orderBy: { sortOrder: "asc" },
    select: {
      id: true,
      image: true,
      title: true,
      link: true,
    },
  });

  return banners;
}
