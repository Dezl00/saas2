import { notFound } from "next/navigation";
import { StorefrontView } from "@/components/store/StorefrontView";
import { StoreStandardHero } from "@/components/store/StoreStandardHero";
import { getStoreInfo, getStoreCatalog, getStoreBanners } from "../data";
import { StoreBannersCarousel } from "@/components/store/StoreBannersCarousel";

export default async function StoreMenuPage(props: { params: Promise<{ subdomain: string }> }) {
  const params = await props.params;
  
  const store = await getStoreInfo(params.subdomain);
  if (!store) {
    notFound();
  }

  const [{ categories: categoriesToDisplay, menuItems: menuItemsToDisplay }, banners] = await Promise.all([
    getStoreCatalog(store.id, store.showDefaultProducts),
    getStoreBanners(store.id),
  ]);

  // Convert Decimal to numbers for client components
  const serializedMenuItems = menuItemsToDisplay.map(item => ({
    id: item.id,
    name: item.name,
    description: item.description,
    price: Number(item.price),
    image: item.image,
    categoryId: item.categoryId,
    isFeatured: item.isFeatured,
    isAvailable: item.isAvailable,
    sizes: item.sizes.map(size => ({ id: size.id, name: size.name, price: Number(size.price) })),
    addons: item.addons.map(addon => ({ id: addon.id, name: addon.name, price: Number(addon.price) }))
  }));

  return (
    <div className="animate-fade-in">
      {store.showBanners !== false && banners.length > 0 && (
        <div className="p-2 sm:p-4 pb-0 w-full max-w-7xl mx-auto">
          <StoreBannersCarousel banners={banners} />
        </div>
      )}
      <StoreStandardHero store={store} />
      <StorefrontView 
        store={{ name: store.name, currency: store.currency, primaryColor: store.primaryColor, logo: store.logo, theme: store.theme, hideProductDescription: store.hideProductDescription, hideProductAddButton: store.hideProductAddButton }}
        categories={categoriesToDisplay.map(c => ({ id: c.id, name: c.name }))}
        menuItems={serializedMenuItems}
      />
    </div>
  );
}
