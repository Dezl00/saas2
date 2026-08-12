import { notFound } from "next/navigation";
import { StorefrontView } from "@/components/store/StorefrontView";
import { StoreBannersCarousel } from "@/components/store/StoreBannersCarousel";
import { getStoreInfo, getStoreCatalog, getStoreBanners } from "./data";

export default async function StorePage(props: { params: Promise<{ subdomain: string }> }) {
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
    sizes: item.sizes.map(size => ({ id: size.id, name: size.name, price: Number(size.price) })),
    addons: item.addons.map(addon => ({ id: addon.id, name: addon.name, price: Number(addon.price) }))
  }));

  return (
    <div className="animate-fade-in">
      {/* Banners Carousel */}
      {banners.length > 0 && (
        <StoreBannersCarousel banners={banners} />
      )}

      <StorefrontView 
        store={{ name: store.name, currency: store.currency, primaryColor: store.primaryColor, logo: store.logo, theme: store.theme, hideProductDescription: store.hideProductDescription, hideProductAddButton: store.hideProductAddButton }}
        categories={categoriesToDisplay.map(c => ({ id: c.id, name: c.name }))}
        menuItems={serializedMenuItems}
      />
    </div>
  );
}
