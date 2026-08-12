import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, ShoppingBag } from "lucide-react";

type Store = { 
  id: string;
  name: string; 
  theme?: string | null; 
  primaryColor?: string | null;
  landingHeroImage?: string | null;
  landingHeroTitle?: string | null;
  landingHeroDescription?: string | null;
  landingHeroOverlayOpacity?: number | null;
};
type Category = { id: string; name: string; image?: string | null };

export function StoreLandingView({ store, categories, subdomain }: { store: Store; categories: Category[]; subdomain: string }) {
  const isDarkSolid = store.theme === "dark_solid";
  const primaryColor = store.primaryColor || 'var(--color-primary-600)';

  return (
    <div className={`flex flex-col min-h-screen ${isDarkSolid ? 'bg-black text-white' : 'bg-white text-surface-950'}`}>
      
      {/* Hero Section */}
      <section className="relative h-[60vh] sm:h-[70vh] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden">
        {store.landingHeroImage ? (
          <>
            <div 
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${store.landingHeroImage})` }}
            />
            <div 
              className="absolute inset-0 bg-black transition-opacity"
              style={{ opacity: (store.landingHeroOverlayOpacity ?? 50) / 100 }}
            />
          </>
        ) : (
          <div className="absolute inset-0 bg-surface-900" />
        )}

        <div className="relative z-10 max-w-2xl mx-auto flex flex-col items-center">
          {store.landingHeroTitle && (
            <h1 className="text-3xl sm:text-5xl font-black text-white mb-4 leading-tight">
              {store.landingHeroTitle}
            </h1>
          )}
          {store.landingHeroDescription && (
            <p className="text-base sm:text-lg text-white/90 mb-8 max-w-lg leading-relaxed">
              {store.landingHeroDescription}
            </p>
          )}

          <Link 
            href={`/store/${subdomain}/menu`}
            className="flex items-center gap-3 px-8 py-3.5 rounded-2xl font-bold text-white transition-transform hover:scale-105 active:scale-95 text-lg"
            style={{ backgroundColor: primaryColor }}
          >
            <span>استكشف المنيو</span>
            <ArrowLeft className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="flex-1 py-12 px-4 max-w-5xl mx-auto w-full">
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6 sm:gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.id} 
              href={`/store/${subdomain}/menu#category-${cat.id}`}
              className="flex flex-col items-center group"
            >
              <div 
                className={`w-32 h-32 sm:w-40 sm:h-40 rounded-full mb-4 border-[3px] overflow-hidden relative flex items-center justify-center transition-transform group-hover:scale-105 shadow-sm ${isDarkSolid ? 'bg-[#111]' : 'bg-surface-50'}`}
                style={{ borderColor: primaryColor }}
              >
                {cat.image ? (
                  <Image 
                    src={cat.image} 
                    alt={cat.name} 
                    fill 
                    sizes="(max-width: 768px) 128px, 160px"
                    className="object-cover" 
                  />
                ) : (
                  <ShoppingBag className={`w-10 h-10 ${isDarkSolid ? 'text-surface-600' : 'text-surface-300'}`} />
                )}
              </div>
              <h3 className={`font-bold text-center text-lg ${isDarkSolid ? 'text-[#fff5e5]' : 'text-surface-900'} group-hover:text-primary-500 transition-colors`}>
                {cat.name}
              </h3>
            </Link>
          ))}
        </div>
      </section>

    </div>
  );
}
