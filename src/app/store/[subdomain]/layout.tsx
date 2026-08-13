import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Store as StoreIcon, Phone, MapPin } from "lucide-react";
import { CartProvider } from "@/components/store/CartProvider";
import { DynamicCartSidebar as CartSidebar } from "@/components/store/DynamicCartSidebar";
import { StoreSplashScreen } from "@/components/store/StoreSplashScreen";
import { FloatingCartButton } from "@/components/store/FloatingCartButton";
import { StoreBannersCarousel } from "@/components/store/StoreBannersCarousel";
import { StoreHeader } from "@/components/store/StoreHeader";
import { StoreWorkingHoursBadge } from "@/components/store/StoreWorkingHoursBadge";
import { formatWhatsappNumber } from "@/lib/utils";
import Image from "next/image";
import { getStoreInfo, getStoreBanners } from "./data";
import { PushNotificationPopup } from "@/components/store/PushNotificationPopup";

// SVG Icons for Brands
const FacebookIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M14 13.5h2.5l1-4H14v-2c0-1.03 0-2 2-2h1.5V2.14c-.326-.043-1.557-.14-2.857-.14C11.928 2 10 3.657 10 6.7v2.8H7v4h3V22h4v-8.5z"/>
  </svg>
);

const InstagramIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
  </svg>
);

const XIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
  </svg>
);

const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
  </svg>
);

const TiktokIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
    <path d="M12.525.02C13.84 0 15.14.01 16.44.03c.06 1.5.54 2.92 1.48 4.09A6.9 6.9 0 0 0 22 5.92v3.94a11.13 11.13 0 0 1-4.04-1.02c-.54-.25-1.04-.56-1.52-.92v6.62c0 1.54-.5 3.03-1.42 4.22a7.1 7.1 0 0 1-4.04 2.22 7 7 0 0 1-4.72-.6A6.9 6.9 0 0 1 2.94 17a6.9 6.9 0 0 1-.36-4.5 7.1 7.1 0 0 1 2.5-3.66c1.23-.9 2.76-1.34 4.31-1.22.04 1.25.02 2.51.04 3.75-.58-.08-1.18-.04-1.74.2a3.03 3.03 0 0 0-1.27 1.18c-.27.53-.34 1.14-.19 1.7.15.54.54 1 1.03 1.3.48.3 1.07.4 1.6.26.54-.14 1.03-.47 1.34-.96.3-.47.46-1.04.45-1.61v-14.3Z"/>
  </svg>
);

const SnapchatIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 448 512" fill="currentColor" className={className}>
    <path d="M424.12 301.78c-4.13-22.18-20.08-36.53-48.4-43.51-17.65-4.35-30.6-5.83-42.61-7.14-11-1.21-20.73-2.28-25.17-5a18.32 18.32 0 0 1-5.11-4.72c-15.76-21-28.8-49.88-38.32-84.77-5-18.44-8.73-37.11-10.82-53.53C249.21 68.3 249.49 0 224 0c-25.68 0-25.21 68.3-29.69 103.11-2.09 16.42-5.78 35.09-10.82 53.53-9.52 34.89-22.56 63.81-38.32 84.77a18.32 18.32 0 0 1-5.11 4.72c-4.44 2.73-14.16 3.8-25.17 5-12 1.31-25 2.79-42.61 7.14-28.32 7-44.27 21.33-48.4 43.51-3.69 19.8 4 35 22.9 44.52l12 6a54.34 54.34 0 0 1 11.24 6.7c7 5.48 11.41 13 13 22.33a53.28 53.28 0 0 1-1.39 21.8c-2 8.35-6.62 16.32-13.62 23.47a55.19 55.19 0 0 1-21 13 46 46 0 0 0-14.59 7.42c-7.39 5.86-13.2 14-17 23.51-4.52 11.23-4.13 22.61 1.15 32A32 32 0 0 0 35.8 488c9.55 4 23.36 6 41 6 36.65 0 83.2-15.17 117-27.17 9.87-3.5 19.34-6.87 27.65-9.28a9.49 9.49 0 0 1 5.25 0c8.31 2.41 17.78 5.78 27.65 9.28 33.77 12 80.32 27.17 117 27.17 17.65 0 31.46-2 41-6a32 32 0 0 0 16.43-15.4c5.28-9.35 5.67-20.73 1.15-32-3.8-9.49-9.62-17.65-17-23.51a46 46 0 0 0-14.59-7.42 55.19 55.19 0 0 1-21-13c-7-7.15-11.66-15.12-13.62-23.47a53.28 53.28 0 0 1-1.39-21.8c1.61-9.35 6-16.85 13-22.33a54.34 54.34 0 0 1 11.24-6.7l12-6c18.89-9.5 26.58-24.71 22.89-44.51z"/>
  </svg>
);

// Helper to check if any social link should be shown
function hasSocialLinks(store: any): boolean {
  return (
    (store.showFacebook && store.facebookUrl) ||
    (store.showInstagram && store.instagramUrl) ||
    (store.showTwitter && store.twitterUrl) ||
    (store.showTiktok && store.tiktokUrl) ||
    (store.showSnapchat && store.snapchatUrl)
  );
}

export async function generateMetadata(props: { params: Promise<{ subdomain: string }> }) {
  const params = await props.params;
  const store = await getStoreInfo(params.subdomain);

  if (!store) return { title: "المتجر غير موجود" };

  const description = store.description || `اطلب الآن من ${store.name}`;
  const image = (store as any).cover || store.logo || "/favicon.ico";
  const icon = store.favicon || store.logo || "/favicon.ico";

  return {
    title: store.name,
    description: description,
    icons: {
      icon: icon,
      shortcut: icon,
      apple: icon,
    },
    openGraph: {
      title: store.name,
      description: description,
      siteName: store.name,
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: store.name,
        }
      ],
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: store.name,
      description: description,
      images: [image],
    },
  };
}

export default async function StoreLayout({
  children,
  params: paramsPromise,
}: {
  children: React.ReactNode;
  params: Promise<{ subdomain: string }>;
}) {
  const params = await paramsPromise;
  const storePromise = getStoreInfo(params.subdomain);
  const settingsPromise = prisma.platformSetting.findUnique({ where: { id: "1" } });

  const [store, settings] = await Promise.all([storePromise, settingsPromise]);
  const platformName = settings?.name || "Almenu";

  if (!store || store.status === "DELETED") {
    notFound();
  }

  const banners = await getStoreBanners(store.id);

  if (store.status === "SUSPENDED") {
    return (
      <div className="min-h-screen bg-surface-50 flex flex-col items-center justify-center p-4 text-center">
        <StoreIcon className="w-16 h-16 text-surface-400 mb-6" />
        <h1 className="text-3xl font-black text-surface-950 mb-2">عذراً، المتجر موقوف مؤقتاً</h1>
        <p className="text-surface-600 max-w-md text-lg">
          هذا المتجر غير متاح في الوقت الحالي للطلبات أو التصفح. يرجى المحاولة في وقت لاحق.
        </p>
      </div>
    );
  }

  const fontName = store.fontFamily || "Tajawal";
  const googleFontUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/ /g, "+")}&:wght@400;500;600;700;800;900&display=swap`;

  const isDarkSolid = store.theme === "dark_solid";

  return (
    <CartProvider storeId={store.id}>
      <link href={googleFontUrl} rel="stylesheet" />
      <div 
        className={`min-h-screen pb-0 flex flex-col ${isDarkSolid ? 'bg-black text-white' : 'bg-white text-surface-950'}`}
        style={{
          fontFamily: `"${fontName}", sans-serif`,
          ...(store.primaryColor ? {
            '--color-primary-50': `${store.primaryColor}1a`,
            '--color-primary-100': `${store.primaryColor}33`,
            '--color-primary-500': store.primaryColor,
            '--color-primary-600': store.primaryColor,
            '--color-primary-700': store.primaryColor,
          } : {})
        } as React.CSSProperties}
      >
        {/* Splash Screen */}
        <StoreSplashScreen
          logo={store.logo}
          storeName={store.name}
          primaryColor={store.primaryColor}
          theme={store.theme}
        />

        {/* Header — New client component with hamburger menu */}
        <StoreHeader
          logo={store.logo}
          storeName={store.name}
          primaryColor={store.primaryColor}
          theme={store.theme}
          socialLinks={{
            showFacebook: store.showFacebook,
            facebookUrl: store.facebookUrl,
            showInstagram: store.showInstagram,
            instagramUrl: store.instagramUrl,
            showTwitter: store.showTwitter,
            twitterUrl: store.twitterUrl,
            showTiktok: store.showTiktok,
            tiktokUrl: store.tiktokUrl,
            showSnapchat: store.showSnapchat,
            snapchatUrl: store.snapchatUrl,
          }}
          workingHours={store.workingHours as any}
          mapLatitude={store.mapLatitude}
          mapLongitude={store.mapLongitude}
          hasLandingPage={store.enableLandingPage}
          branches={store.branches as any}
        />



        {/* Main Content */}
        <main className={`max-w-5xl mx-auto px-4 py-5 flex-1 w-full ${isDarkSolid ? 'bg-black' : 'bg-white'}`}>
          {children}
        </main>

        {/* Promo Banner */}
        <div className="max-w-5xl mx-auto px-4 mt-16">
          <div className="bg-[#2563eb] rounded-3xl p-8 text-center text-white flex flex-col items-center">
            <h3 className="text-2xl font-bold mb-2 text-white">هل تمتلك مطعماً أو متجراً؟</h3>
            <p className="text-blue-100 mb-6 max-w-lg">
              أنشئ متجرك الإلكتروني الخاص في دقائق وابدأ في استقبال الطلبات عبر الواتساب مباشرة وبدون عمولات!
            </p>
            <a href="https://almenu.pro" target="_blank" className="bg-white text-[#2563eb] font-bold py-3 px-8 rounded-2xl hover:bg-surface-50 transition-colors">
              أنشئ متجرك مجاناً
            </a>
          </div>
        </div>

        {/* Footer */}
        <footer id="store-footer-contact" className={`border-t mt-12 py-10 ${isDarkSolid ? 'bg-[#0a0a0a] border-[#222]' : 'bg-surface-50 border-surface-100'}`}>
          <div className="max-w-5xl mx-auto px-4 text-center space-y-4">
            <div className="w-24 h-24 mx-auto flex items-center justify-center mb-4 relative">
              {store.logo ? (
                <Image src={store.logo} alt={store.name} fill className="object-contain" sizes="96px" />
              ) : (
                <StoreIcon className={`w-8 h-8 ${isDarkSolid ? 'text-surface-600' : 'text-surface-400'}`} />
              )}
            </div>
            <h2 className={`font-bold text-lg ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>{store.name}</h2>
            {store.description && (
              <p className={`text-sm max-w-md mx-auto leading-relaxed ${isDarkSolid ? 'text-[#fff5e5]' : 'text-surface-500'}`}>{store.description}</p>
            )}
            
            <div className={`flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 text-sm mt-6 ${isDarkSolid ? 'text-[#fff5e5]' : 'text-surface-600'}`}>
              {store.phone && (
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-primary-500" />
                  <span dir="ltr">{store.phone}</span>
                </div>
              )}
              {store.address && (
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-primary-500" />
                  <span>{store.address}</span>
                </div>
              )}
            </div>

            {store.branches && store.branches.length > 0 && (
              <div className="mt-12 mb-6">
                <h3 className={`font-bold text-lg mb-6 ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>فروعنا</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 text-start">
                  {store.branches.map((branch: any) => (
                    <div key={branch.id} className={`flex flex-col gap-3 p-5 rounded-2xl border transition-all hover:shadow-md ${isDarkSolid ? 'bg-[#111] border-[#333]' : 'bg-white border-surface-200'}`}>
                      <h4 className={`font-bold text-base ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>{branch.name}</h4>
                      
                      {branch.address && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                          <span className={`text-xs leading-relaxed ${isDarkSolid ? 'text-surface-400' : 'text-surface-600'}`}>{branch.address}</span>
                        </div>
                      )}
                      
                      {branch.phone && (
                        <div className="flex items-start gap-2">
                          <Phone className="w-4 h-4 mt-0.5 text-primary-500 shrink-0" />
                          <span className={`text-xs leading-relaxed ${isDarkSolid ? 'text-surface-400' : 'text-surface-600'}`} dir="ltr">{branch.phone}</span>
                        </div>
                      )}
                      
                      {branch.mapUrl && (
                        branch.mapUrl.includes('<iframe') ? (
                          <div className="mt-2 h-32 w-full rounded-xl overflow-hidden relative border border-surface-100 group bg-surface-100">
                            <div className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity" dangerouslySetInnerHTML={{ __html: branch.mapUrl.replace(/width=".*?"/, 'width="100%"').replace(/height=".*?"/, 'height="100%"') }} />
                            <a 
                              href={branch.mapUrl.match(/src="(.*?)"/)?.[1] || branch.mapUrl} 
                              target="_blank" 
                              rel="noreferrer" 
                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-primary-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm">
                                فتح في خرائط جوجل
                              </span>
                            </a>
                          </div>
                        ) : (
                          <div className="mt-2 h-32 w-full rounded-xl overflow-hidden relative border border-surface-100 group bg-surface-100">
                            <iframe 
                              src={`https://maps.google.com/maps?q=${encodeURIComponent(branch.address || branch.name || store.name)}&t=&z=14&ie=UTF8&iwloc=&output=embed`} 
                              width="100%" 
                              height="100%" 
                              frameBorder="0" 
                              style={{ border: 0 }} 
                              allowFullScreen 
                              className="w-full h-full pointer-events-none opacity-80 group-hover:opacity-100 transition-opacity"
                            />
                            <a 
                              href={branch.mapUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                              <span className="bg-primary-600 text-white text-xs font-bold py-1.5 px-3 rounded-lg shadow-sm">
                                فتح في خرائط جوجل
                              </span>
                            </a>
                          </div>
                        )
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social icons */}
            <div className="flex justify-center items-center gap-3 mt-8">
              {store.showFacebook && store.facebookUrl && (
                <a href={store.facebookUrl} target="_blank" rel="noreferrer" className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDarkSolid ? 'text-[#0a0a0a]' : 'text-white'}`} style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                  <FacebookIcon className="w-4 h-4" />
                </a>
              )}
              {store.showInstagram && store.instagramUrl && (
                <a href={store.instagramUrl} target="_blank" rel="noreferrer" className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDarkSolid ? 'text-[#0a0a0a]' : 'text-white'}`} style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                  <InstagramIcon className="w-4 h-4" />
                </a>
              )}
              {store.showTwitter && store.twitterUrl && (
                <a href={store.twitterUrl} target="_blank" rel="noreferrer" className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDarkSolid ? 'text-[#0a0a0a]' : 'text-white'}`} style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                  <XIcon className="w-4 h-4" />
                </a>
              )}
              {store.showTiktok && store.tiktokUrl && (
                <a href={store.tiktokUrl} target="_blank" rel="noreferrer" className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDarkSolid ? 'text-[#0a0a0a]' : 'text-white'}`} style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                  <TiktokIcon className="w-4 h-4" />
                </a>
              )}
              {store.showSnapchat && store.snapchatUrl && (
                <a href={store.snapchatUrl} target="_blank" rel="noreferrer" className={`w-8 h-8 rounded-xl flex items-center justify-center transition-colors ${isDarkSolid ? 'text-[#0a0a0a]' : 'text-white'}`} style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                  <SnapchatIcon className="w-4 h-4" />
                </a>
              )}
            </div>
            
            <div className={`text-xs mt-10 pt-6 border-t flex items-center justify-center gap-2 ${isDarkSolid ? 'text-surface-500 border-[#222]' : 'text-surface-400 border-surface-100'}`}>
              مدعوم بواسطة <a href="https://almenu.pro" target="_blank" className={`font-bold ${isDarkSolid ? 'text-white hover:text-surface-300' : 'text-surface-950 hover:text-surface-700'}`}>{platformName}</a> &copy; {new Date().getFullYear()}
            </div>
          </div>
        </footer>

        {/* Floating Action Buttons — WhatsApp + Phone (no shadows - flat) */}
        {store.showFloatingIcons !== false && (
          <div className="fixed bottom-24 start-5 z-40 flex flex-col gap-3">
            {store.whatsappNumber && (
              <div className="relative group">
                <div className="absolute inset-0 bg-[#25D366] rounded-full animate-ping opacity-75"></div>
                <a 
                  href={`https://wa.me/${formatWhatsappNumber(store.whatsappNumber)}`} 
                  target="_blank" 
                  rel="noreferrer"
                  className="relative w-12 h-12 bg-[#25D366] text-white rounded-full flex items-center justify-center hover:bg-[#20bd5a] transition-all hover:scale-110"
                >
                  <WhatsAppIcon className="w-6 h-6" />
                </a>
              </div>
            )}
            {store.phone && (
              <a 
                href={`tel:${store.phone}`} 
                className="w-12 h-12 bg-[#007AFF] text-white rounded-full flex items-center justify-center hover:bg-[#0062CC] transition-all hover:scale-110"
              >
                <Phone className="w-5 h-5" />
              </a>
            )}
          </div>
        )}

        {/* Floating Cart Button */}
        <FloatingCartButton 
          currency={store.currency}
          primaryColor={store.primaryColor}
          theme={store.theme}
        />

          {/* Global Cart Sidebar */}
          <CartSidebar 
            store={{
              id: store.id,
              name: store.name,
              whatsappNumber: store.whatsappNumber,
              enableWhatsappOrders: store.enableWhatsappOrders,
              currency: store.currency,
              primaryColor: store.primaryColor,
              theme: store.theme,
            }}
            branches={store.branches}
            deliveryAreas={store.deliveryAreas.map(a => ({ id: a.id, name: a.name, fee: Number(a.deliveryFee) }))}
          />

          {/* Push Notification Popup */}
          <PushNotificationPopup 
            storeId={store.id} 
            enablePushPopup={(store as any).enablePushPopup ?? true} 
            primaryColor={store.primaryColor || undefined} 
          />
      </div>
    </CartProvider>
  );
}
