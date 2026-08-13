import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AppearanceClient } from "./components/AppearanceClient";
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
    select: { 
      fontFamily: true, 
      theme: true, 
      hideProductDescription: true, 
      hideProductAddButton: true, 
      showFloatingIcons: true,
      showBanners: true,
      showHero: true,
      enableLandingPage: true,
      landingHeroTitle: true,
      landingHeroDescription: true,
      landingHeroImage: true,
      landingHeroOverlayOpacity: true,
      banners: {
        orderBy: { sortOrder: 'asc' }
      }
    },
  });

  if (!store) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <AppearanceClient 
        currentFont={store.fontFamily} 
        currentTheme={store.theme} 
        currentHideDescription={store.hideProductDescription}
        currentHideAddButton={store.hideProductAddButton}
        currentShowFloatingIcons={store.showFloatingIcons}
        currentShowBanners={store.showBanners}
        currentShowHero={store.showHero}
        currentEnableLandingPage={store.enableLandingPage}
        currentLandingHeroTitle={store.landingHeroTitle}
        currentLandingHeroDescription={store.landingHeroDescription}
        currentLandingHeroImage={store.landingHeroImage}
        currentLandingHeroOverlayOpacity={store.landingHeroOverlayOpacity}
        initialBanners={store.banners}
      />
    </div>
  );
}
