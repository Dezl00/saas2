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
      <div className="p-2 sm:p-6 w-full max-w-7xl mx-auto">
        <section className="relative h-[320px] sm:h-[400px] md:h-[450px] w-full flex flex-col items-center justify-center text-center px-4 overflow-hidden rounded-[24px] sm:rounded-[32px] shadow-lg">
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
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black text-white mb-3 sm:mb-4 leading-tight drop-shadow-md px-2">
              {store.landingHeroTitle}
            </h1>
          )}
          
          <div className="w-16 h-1.5 rounded-full mb-4 sm:mb-5 mx-auto" style={{ backgroundColor: primaryColor }} />

          {store.landingHeroDescription && (
            <p className="text-lg sm:text-xl md:text-2xl text-white/95 mb-8 sm:mb-10 max-w-2xl leading-relaxed drop-shadow px-4">
              {store.landingHeroDescription}
            </p>
          )}

          <Link 
            href="/menu"
            className="flex items-center gap-2 px-6 sm:px-8 py-2 sm:py-2.5 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 text-sm sm:text-base border-2 landing-hero-btn hover:bg-[var(--btn-primary)] hover:text-white"
            style={{ 
              borderColor: primaryColor, 
              color: primaryColor,
              backgroundColor: 'transparent',
              '--btn-primary': primaryColor,
            } as React.CSSProperties}
          >
            <span>استكشف المنيو</span>
            <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
          </Link>
        </div>
      </section>
      </div>

      {/* Categories Grid */}
      <section className="flex-1 py-8 sm:py-12 px-2 sm:px-4 max-w-5xl mx-auto w-full">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>- الأقسام -</h2>
          <p className={`text-sm sm:text-base ${isDarkSolid ? 'text-surface-400' : 'text-surface-500'}`}>تشكيلة متنوعة من أشهى الأصناف</p>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 sm:gap-8">
          {categories.map((cat) => {
            const isPng = cat.image?.toLowerCase().includes('.png');
            return (
            <Link 
              key={cat.id} 
              href={`/menu#category-${cat.name.replace(/\s+/g, '-')}`}
              className="flex flex-col items-center group p-3 sm:p-5 rounded-[20px] sm:rounded-[24px] border-2 transition-all hover:shadow-md"
              style={{ borderColor: primaryColor }}
            >
              <div 
                className={`w-28 h-28 sm:w-32 sm:h-32 mb-3 sm:mb-4 relative flex items-center justify-center transition-transform group-hover:scale-105 ${
                  isPng ? '' : `rounded-full overflow-hidden shadow-sm ${isDarkSolid ? 'bg-[#111]' : 'bg-surface-50'}`
                }`}
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
              <h3 className={`font-bold text-center text-base sm:text-lg ${isDarkSolid ? 'text-[#fff5e5]' : 'text-surface-900'} group-hover:text-primary-500 transition-colors`}>
                {cat.name}
              </h3>
            </Link>
            );
          })}
        </div>
      </section>

    </div>
  );
}
