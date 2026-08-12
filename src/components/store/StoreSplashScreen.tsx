"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { Store as StoreIcon } from "lucide-react";

type Props = {
  logo: string | null;
  storeName: string;
  primaryColor?: string | null;
  theme?: string | null;
};

export function StoreSplashScreen({ logo, storeName, primaryColor, theme }: Props) {
  const [isVisible, setIsVisible] = useState(true);
  const [isFadingOut, setIsFadingOut] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsFadingOut(true);
      setTimeout(() => setIsVisible(false), 500);
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  if (!isVisible) return null;

  const color = primaryColor || "#E74C3C";

  const isDarkSolid = theme === "dark_solid";

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-center justify-center ${isDarkSolid ? 'bg-black' : 'bg-white'} ${isFadingOut ? "animate-splash-fade-out" : ""}`}
    >
      <div className="flex flex-col items-center justify-center px-6">
        {/* Logo without border/circle */}
        <div className="relative">
          <div
            className="w-28 h-28 flex items-center justify-center overflow-hidden animate-splash-pulse"
            style={{
              "--splash-glow": `${color}66`,
            } as React.CSSProperties}
          >
            {logo ? (
              <Image
                src={logo}
                alt={storeName}
                width={112}
                height={112}
                className="w-full h-full object-contain"
                priority
              />
            ) : (
              <StoreIcon className="w-16 h-16" style={{ color }} />
            )}
          </div>

          {/* Animated Loader Ring */}
          <div className="absolute -inset-4 flex items-center justify-center">
            <svg className="animate-spin w-full h-full" style={{ color }} viewBox="0 0 50 50">
              <circle className="opacity-25" cx="25" cy="25" r="20" fill="none" stroke="currentColor" strokeWidth="2"></circle>
              <path className="opacity-75" fill="currentColor" d="M25 5a20 20 0 0 1 20 20h-4a16 16 0 0 0-16-16V5z"></path>
            </svg>
          </div>
        </div>
      </div>
    </div>
  );
}
