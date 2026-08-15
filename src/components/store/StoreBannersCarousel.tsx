"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import useEmblaCarousel from 'embla-carousel-react';
import Autoplay from 'embla-carousel-autoplay';

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
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true, direction: 'rtl' }, [Autoplay({ delay: 4000, stopOnInteraction: false })]);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelectedIndex(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  if (banners.length === 0) return null;

  return (
    <div className="w-full flex flex-col items-center">
      <div className="w-full relative aspect-[16/9] bg-surface-100 rounded-[24px] sm:rounded-[32px] overflow-hidden">
        <div className="overflow-hidden w-full h-full cursor-grab active:cursor-grabbing" ref={emblaRef} dir="rtl">
          <div className="flex w-full h-full touch-pan-y">
            {banners.map((banner, index) => (
              <div key={`${banner.id}-${index}`} className="relative flex-[0_0_100%] min-w-0 h-full">
                {banner.link ? (
                  <a href={banner.link} target="_blank" rel="noreferrer" className="block w-full h-full" draggable={false}>
                    <Image src={banner.image} alt={banner.title || "عرض"} fill sizes="(max-width: 768px) 100vw, 100vw" className="object-cover" priority={index === 0} draggable={false} />
                  </a>
                ) : (
                  <Image src={banner.image} alt={banner.title || "عرض"} fill sizes="(max-width: 768px) 100vw, 100vw" className="object-cover" priority={index === 0} draggable={false} />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {banners.length > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4" dir="ltr">
          {banners.map((_, index) => (
            <div
              key={index}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === selectedIndex ? "w-6" : "w-2 bg-surface-300"
              }`}
              style={index === selectedIndex ? { backgroundColor: 'var(--color-primary-600, #db9434)' } : {}}
            />
          ))}
        </div>
      )}
    </div>
  );
}
