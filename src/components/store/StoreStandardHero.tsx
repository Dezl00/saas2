import Image from "next/image";
import { Store as StoreIcon } from "lucide-react";
import { StoreWorkingHoursBadge } from "./StoreWorkingHoursBadge";

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

function hasSocialLinks(store: any): boolean {
  return (
    (store.showFacebook && store.facebookUrl) ||
    (store.showInstagram && store.instagramUrl) ||
    (store.showTwitter && store.twitterUrl) ||
    (store.showTiktok && store.tiktokUrl) ||
    (store.showSnapchat && store.snapchatUrl)
  );
}

export function StoreStandardHero({ store }: { store: any }) {
  if (store.showHero === false) {
    return null;
  }

  const isDarkSolid = store.theme === "dark_solid";

  return (
    <section className={`relative ${isDarkSolid ? 'bg-black' : 'bg-white'}`}>
      <div className="p-2 sm:p-4 w-full max-w-7xl mx-auto pb-0">
      <div className="h-44 sm:h-52 w-full relative bg-surface-100 overflow-hidden rounded-[24px] sm:rounded-[32px]">
        {store.landingHeroImage || store.cover ? (
          <>
            <div className="absolute inset-0">
              <Image 
                src={store.landingHeroImage || store.cover} 
                alt="Store Hero" 
                fill 
                className="object-cover" 
                priority 
                sizes="100vw" 
              />
            </div>
            <div 
              className="absolute inset-0 mix-blend-multiply"
              style={{ 
                backgroundColor: store.primaryColor || '#1a1a2e',
                opacity: 0.85 
              }}
            />
          </>
        ) : (
          <div 
            className="w-full h-full"
            style={{ backgroundColor: store.primaryColor || '#1a1a2e' }}
          />
        )}
      </div>
      </div>

      {/* Logo circle overlapping cover */}
      <div className="relative max-w-5xl mx-auto px-4 z-10">
        <div className="absolute -top-14 left-1/2 -translate-x-1/2 w-28 h-28 flex items-center justify-center">
          <div className="w-28 h-28 rounded-full bg-white border-4 border-white overflow-hidden flex items-center justify-center relative z-10">
            {store.logo ? (
              <div className="relative w-20 h-20">
                <Image src={store.logo} alt={store.name} fill className="object-contain" sizes="80px" priority fetchPriority="high" />
              </div>
            ) : (
              <StoreIcon className="w-10 h-10" style={{ color: store.primaryColor || 'var(--color-primary-600)' }} />
            )}
          </div>
        </div>
        {store.workingHours && (
          <StoreWorkingHoursBadge 
            workingHours={store.workingHours} 
            primaryColor={store.primaryColor}
            theme={store.theme}
            className="absolute top-6 left-6"
          />
        )}
      </div>

      {/* Store info below cover */}
      <div className={`${isDarkSolid ? 'bg-black' : 'bg-white'} pt-16 pb-5 text-center`}>
        <h1 className={`text-2xl sm:text-3xl font-bold mb-1 ${isDarkSolid ? 'text-[#fff5e5]' : 'text-surface-950'}`}>{store.name}</h1>
        {store.description && (
          <p className={`text-sm max-w-md mx-auto px-4 ${isDarkSolid ? 'text-surface-300' : 'text-surface-500'}`}>{store.description}</p>
        )}

        {/* Social Media Icons */}
        {hasSocialLinks(store) && (
          <div className="flex items-center justify-center gap-2 mt-4">
            {store.showFacebook && store.facebookUrl && (
              <a href={store.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                <FacebookIcon className="w-4 h-4" />
              </a>
            )}
            {store.showInstagram && store.instagramUrl && (
              <a href={store.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                <InstagramIcon className="w-4 h-4" />
              </a>
            )}
            {store.showTwitter && store.twitterUrl && (
              <a href={store.twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                <XIcon className="w-4 h-4" />
              </a>
            )}
            {store.showTiktok && store.tiktokUrl && (
              <a href={store.tiktokUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                <TiktokIcon className="w-4 h-4" />
              </a>
            )}
            {store.showSnapchat && store.snapchatUrl && (
              <a href={store.snapchatUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: store.primaryColor || 'var(--color-primary-600)' }}>
                <SnapchatIcon className="w-4 h-4" />
              </a>
            )}
          </div>
        )}
      </div>
    </section>
  );
}
