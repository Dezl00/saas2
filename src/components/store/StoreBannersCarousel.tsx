"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";

type Banner = {
  id: string;
  image: string;
  title: string | null;
  link: string | null;
};

type Props = {
  banners: Banner[];
};

export function StoreBannersCarousel({ banners }: Props) {
  const total = banners.length;
  const [current, setCurrent] = useState(total > 1 ? 1 : 0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const autoplayRef = useRef<NodeJS.Timeout | null>(null);
  const isJumping = useRef(false);

  const displayBanners = total > 1 ? [banners[total - 1], ...banners, banners[0]] : banners;
  const [isTransitioning, setIsTransitioning] = useState(true);

  const resetAutoplay = useCallback(() => {
    if (autoplayRef.current) clearInterval(autoplayRef.current);
    autoplayRef.current = setInterval(() => {
      setIsTransitioning(true);
      setCurrent((prev) => prev + 1);
    }, 4000);
  }, []);

  useEffect(() => {
    if (total <= 1) return;
    resetAutoplay();
    return () => {
      if (autoplayRef.current) clearInterval(autoplayRef.current);
    };
  }, [total, resetAutoplay]);

  // Handle infinite scroll jump
  useEffect(() => {
    if (total <= 1) return;
    
    let timeout: NodeJS.Timeout;
    if (current === 0) {
      timeout = setTimeout(() => {
        isJumping.current = true;
        setIsTransitioning(false);
        setCurrent(total);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isJumping.current = false;
            setIsTransitioning(true);
          });
        });
      }, 400);
    } else if (current === total + 1) {
      timeout = setTimeout(() => {
        isJumping.current = true;
        setIsTransitioning(false);
        setCurrent(1);
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            isJumping.current = false;
            setIsTransitioning(true);
          });
        });
      }, 400);
    }
    return () => clearTimeout(timeout);
  }, [current, total]);

  const handlePointerDown = (clientX: number) => {
    if (isJumping.current) return;
    setIsDragging(true);
    setIsTransitioning(false);
    setStartX(clientX);
    setTranslateX(0);
    if (autoplayRef.current) clearInterval(autoplayRef.current);
  };

  const handlePointerMove = (clientX: number) => {
    if (!isDragging || isJumping.current) return;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handlePointerUp = () => {
    if (!isDragging) return;
    setIsDragging(false);
    setIsTransitioning(true);
    if (Math.abs(translateX) > 50) {
      if (translateX > 0) {
        setCurrent((prev) => prev - 1);
      } else {
        setCurrent((prev) => prev + 1);
      }
    }
    setTranslateX(0);
    resetAutoplay();
  };

  if (banners.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative aspect-[16/9] bg-surface-100 rounded-[24px] sm:rounded-[32px] overflow-hidden shadow-sm">
        {/* Carousel Container */}
        <div
          ref={containerRef}
          className="relative overflow-hidden w-full h-full touch-pan-y cursor-grab active:cursor-grabbing"
          onTouchStart={(e) => handlePointerDown(e.touches[0].clientX)}
          onTouchMove={(e) => handlePointerMove(e.touches[0].clientX)}
          onTouchEnd={handlePointerUp}
          onMouseDown={(e) => handlePointerDown(e.clientX)}
          onMouseMove={(e) => handlePointerMove(e.clientX)}
          onMouseUp={handlePointerUp}
          onMouseLeave={handlePointerUp}
        >
          <div
            className="flex h-full w-full"
            dir="ltr"
            style={{
              transform: `translateX(calc(${current * -100}% + ${isDragging ? translateX : 0}px))`,
              transition: isTransitioning ? "transform 0.4s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
              willChange: "transform",
            }}
          >
            {displayBanners.map((banner, index) => (
              <div key={`${banner.id}-${index}`} className="w-full h-full shrink-0 bg-surface-100 pointer-events-none sm:pointer-events-auto">
                {banner.link ? (
                  <a href={banner.link} target="_blank" rel="noreferrer" className="block w-full h-full pointer-events-auto" draggable={false}>
                    <div className="relative w-full h-full">
                      <Image
                        src={banner.image}
                        alt={banner.title || "عرض"}
                        fill
                        sizes="(max-width: 768px) 100vw, 100vw"
                        className="object-cover"
                        priority
                        draggable={false}
                      />
                    </div>
                  </a>
                ) : (
                  <div className="relative w-full h-full">
                    <Image
                      src={banner.image}
                      alt={banner.title || "عرض"}
                      fill
                      sizes="(max-width: 768px) 100vw, 100vw"
                      className="object-cover"
                      priority
                      draggable={false}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Dots Indicator */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4" dir="ltr">
          {banners.map((_, index) => {
            // current is 1-based index (0 is clone of last, total+1 is clone of first)
            let isActive = false;
            if (current === 0 && index === total - 1) isActive = true;
            else if (current === total + 1 && index === 0) isActive = true;
            else if (current === index + 1) isActive = true;
            
            return (
              <div
                key={index}
                className={`h-2 rounded-full transition-all duration-300 ${
                  isActive ? "w-6 bg-primary-600" : "w-2 bg-surface-300"
                }`}
                style={isActive ? { backgroundColor: 'var(--store-primary, #db9434)' } : {}}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
