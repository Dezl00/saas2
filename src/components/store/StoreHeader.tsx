"use client";

import { useState, useRef, useEffect } from "react";
import { Menu, X, Share2, Clock, MapPin, MessageCircle } from "lucide-react";
import Image from "next/image";
import { useCart } from "./CartProvider";
import { CartHeaderButton } from "./CartHeaderButton";

// SVG Icons for Brands (same as layout.tsx but client-side)
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

type SocialLinks = {
  showFacebook?: boolean;
  facebookUrl?: string | null;
  showInstagram?: boolean;
  instagramUrl?: string | null;
  showTwitter?: boolean;
  twitterUrl?: string | null;
  showTiktok?: boolean;
  tiktokUrl?: string | null;
  showSnapchat?: boolean;
  snapchatUrl?: string | null;
};

type WorkingHoursDay = {
  enabled: boolean;
  from?: string;
  to?: string;
  allDay?: boolean;
};

type WorkingHoursData = {
  saturday?: WorkingHoursDay;
  sunday?: WorkingHoursDay;
  monday?: WorkingHoursDay;
  tuesday?: WorkingHoursDay;
  wednesday?: WorkingHoursDay;
  thursday?: WorkingHoursDay;
  friday?: WorkingHoursDay;
};

type Props = {
  logo: string | null;
  storeName: string;
  primaryColor?: string | null;
  socialLinks: SocialLinks;
  workingHours?: WorkingHoursData | null;
  mapLatitude?: string | null;
  mapLongitude?: string | null;
};

const DAY_NAMES: Record<string, string> = {
  saturday: "السبت",
  sunday: "الأحد",
  monday: "الإثنين",
  tuesday: "الثلاثاء",
  wednesday: "الأربعاء",
  thursday: "الخميس",
  friday: "الجمعة",
};

const DAY_ORDER = ["saturday", "sunday", "monday", "tuesday", "wednesday", "thursday", "friday"];

function getCurrentDayKey(): string {
  const dayIndex = new Date().getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
  const mapping = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
  return mapping[dayIndex];
}

export function StoreHeader({ logo, storeName, primaryColor, socialLinks, workingHours, mapLatitude, mapLongitude }: Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWorkingHoursOpen, setIsWorkingHoursOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const color = primaryColor || "var(--color-primary-600)";

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Lock body scroll when working hours modal is open
  useEffect(() => {
    if (isWorkingHoursOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [isWorkingHoursOpen]);

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: storeName,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        alert("تم نسخ رابط المنيو!");
      }
    } catch { /* user cancelled */ }
  };

  const handleScrollToFooter = () => {
    setIsMenuOpen(false);
    const footer = document.getElementById("store-footer-contact");
    if (footer) {
      footer.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const handleOpenMap = () => {
    if (mapLatitude && mapLongitude) {
      window.open(`https://www.google.com/maps?q=${mapLatitude},${mapLongitude}`, "_blank");
    }
    setIsMenuOpen(false);
  };

  const hasSocial = (
    (socialLinks.showFacebook && socialLinks.facebookUrl) ||
    (socialLinks.showInstagram && socialLinks.instagramUrl) ||
    (socialLinks.showTwitter && socialLinks.twitterUrl) ||
    (socialLinks.showTiktok && socialLinks.tiktokUrl) ||
    (socialLinks.showSnapchat && socialLinks.snapchatUrl)
  );

  const currentDay = getCurrentDayKey();

  return (
    <>
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-surface-100">
        <div className="max-w-5xl mx-auto px-4 h-14 relative flex items-center justify-between">
          {/* Right side: Hamburger */}
          <div className="flex items-center" ref={menuRef}>
            {/* Hamburger toggle */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="w-9 h-9 flex items-center justify-center rounded-xl transition-colors hover:bg-surface-50 z-10 relative"
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-surface-700" />
              ) : (
                <Menu className="w-5 h-5 text-surface-700" />
              )}
            </button>

            {/* Dropdown menu */}
            {isMenuOpen && (
              <div className="absolute top-14 start-0 end-0 bg-white border-b border-surface-100 z-50 animate-slide-in-menu">
                <div className="max-w-5xl mx-auto">
                  <div className="flex flex-col">
                    {/* Share menu */}
                    <button
                      onClick={() => { handleShare(); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 text-surface-700 hover:bg-surface-50 transition-colors border-b border-surface-50"
                    >
                      <Share2 className="w-5 h-5" style={{ color }} />
                      <span className="font-semibold text-sm">ارسال المنيو لصديق</span>
                    </button>

                    {/* Working hours */}
                    <button
                      onClick={() => { setIsWorkingHoursOpen(true); setIsMenuOpen(false); }}
                      className="flex items-center gap-3 px-5 py-4 text-surface-700 hover:bg-surface-50 transition-colors border-b border-surface-50"
                    >
                      <Clock className="w-5 h-5" style={{ color }} />
                      <span className="font-semibold text-sm">مواعيد العمل</span>
                    </button>

                    {/* Open on map */}
                    {mapLatitude && mapLongitude && (
                      <button
                        onClick={handleOpenMap}
                        className="flex items-center gap-3 px-5 py-4 text-surface-700 hover:bg-surface-50 transition-colors border-b border-surface-50"
                      >
                        <MapPin className="w-5 h-5" style={{ color }} />
                        <span className="font-semibold text-sm">فتح العنوان على الخريطة</span>
                      </button>
                    )}

                    {/* Contact us */}
                    <button
                      onClick={handleScrollToFooter}
                      className="flex items-center gap-3 px-5 py-4 text-surface-700 hover:bg-surface-50 transition-colors border-b border-surface-50"
                    >
                      <MessageCircle className="w-5 h-5" style={{ color }} />
                      <span className="font-semibold text-sm">تواصل معنا</span>
                    </button>

                    {/* Social icons */}
                    {hasSocial && (
                      <div className="flex items-center justify-center gap-3 px-5 py-4">
                        {socialLinks.showFacebook && socialLinks.facebookUrl && (
                          <a href={socialLinks.facebookUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: color }}>
                            <FacebookIcon className="w-4 h-4" />
                          </a>
                        )}
                        {socialLinks.showInstagram && socialLinks.instagramUrl && (
                          <a href={socialLinks.instagramUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: color }}>
                            <InstagramIcon className="w-4 h-4" />
                          </a>
                        )}
                        {socialLinks.showTwitter && socialLinks.twitterUrl && (
                          <a href={socialLinks.twitterUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: color }}>
                            <XIcon className="w-4 h-4" />
                          </a>
                        )}
                        {socialLinks.showTiktok && socialLinks.tiktokUrl && (
                          <a href={socialLinks.tiktokUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: color }}>
                            <TiktokIcon className="w-4 h-4" />
                          </a>
                        )}
                        {socialLinks.showSnapchat && socialLinks.snapchatUrl && (
                          <a href={socialLinks.snapchatUrl} target="_blank" rel="noreferrer" className="w-8 h-8 rounded-xl flex items-center justify-center transition-colors text-white" style={{ backgroundColor: color }}>
                            <SnapchatIcon className="w-4 h-4" />
                          </a>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Center: Logo */}
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center pointer-events-none">
            <div className="w-9 h-9 overflow-hidden flex items-center justify-center shrink-0 pointer-events-auto">
              {logo ? (
                <Image src={logo} alt={storeName} width={36} height={36} className="w-full h-full object-contain" />
              ) : (
                <span className="text-lg font-bold" style={{ color }}>{storeName.charAt(0)}</span>
              )}
            </div>
          </div>

          {/* Left side: Cart */}
          <div className="flex items-center z-10 relative">
            <CartHeaderButton />
          </div>
        </div>
      </header>

      {/* Working Hours Modal */}
      {isWorkingHoursOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 animate-fade-in"
          onClick={(e) => { if (e.target === e.currentTarget) setIsWorkingHoursOpen(false); }}
        >
          <div className="bg-white w-[90%] max-w-md rounded-2xl overflow-hidden animate-zoom-in">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-5 border-b border-surface-100">
              <h3 className="text-lg font-bold text-surface-950">مواعيد العمل</h3>
              <button
                onClick={() => setIsWorkingHoursOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-50 transition-colors"
              >
                <X className="w-5 h-5 text-surface-500" />
              </button>
            </div>

            {/* Working Hours List */}
            <div className="p-5 space-y-2 max-h-[70vh] overflow-y-auto">
              {DAY_ORDER.map((dayKey) => {
                const day = (workingHours as any)?.[dayKey] as WorkingHoursDay | undefined;
                const isToday = dayKey === currentDay;
                let statusText = "مغلق";
                if (day?.enabled) {
                  statusText = day.allDay ? "مفتوح طول اليوم" : (day.from && day.to ? `${day.from} - ${day.to}` : "مفتوح طول اليوم");
                }

                return (
                  <div
                    key={dayKey}
                    className={`flex items-center justify-between px-4 py-3.5 rounded-xl border transition-colors ${
                      isToday
                        ? "border-primary-200 bg-primary-50/50"
                        : "border-surface-100 bg-surface-50/50"
                    }`}
                    style={isToday ? { borderColor: `${color}33`, backgroundColor: `${color}0d` } : undefined}
                  >
                    <span className={`font-bold text-sm ${isToday ? "" : "text-surface-600"}`} style={isToday ? { color } : undefined}>
                      {DAY_NAMES[dayKey]}
                    </span>
                    <span className={`text-sm ${day?.enabled ? "text-surface-700" : "text-surface-400"}`}>
                      {statusText}
                    </span>
                  </div>
                );
              })}
              {!workingHours && (
                <p className="text-center text-surface-400 text-sm py-4">لم يتم تحديد مواعيد العمل بعد</p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Overlay for menu */}
      {isMenuOpen && (
        <div
          className="fixed inset-0 bg-black/20 z-40"
          onClick={() => setIsMenuOpen(false)}
        />
      )}
    </>
  );
}
