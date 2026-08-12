"use client";

import { useState, useEffect, useRef } from "react";
import { formatPrice } from "@/lib/utils";
import { useCart } from "./CartProvider";
import Image from "next/image";
import { Search, X, Plus, Minus, Check, ShoppingBag, Loader2 } from "lucide-react";

type Size = { id: string; name: string; price: number };
type Addon = { id: string; name: string; price: number };
type MenuItem = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  categoryId: string;
  sizes: Size[];
  addons: Addon[];
};
type Category = { id: string; name: string };
type Store = { name: string; currency: string; primaryColor?: string | null; secondaryColor?: string | null; logo?: string | null; theme?: string | null; hideProductDescription?: boolean; hideProductAddButton?: boolean; };

export function StorefrontView({
  store,
  categories,
  menuItems,
}: {
  store: Store;
  categories: Category[];
  menuItems: MenuItem[];
}) {
  const [activeTab, setActiveTab] = useState(categories[0]?.id || "");
  const isManualScrolling = useRef(false);
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);

  const isDarkSolid = store.theme === "dark_solid";
  const primaryColor = store.primaryColor || 'var(--color-primary-600)';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (isManualScrolling.current) return;
        
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const id = entry.target.id.replace("category-", "");
            setActiveTab(id);
            // Scroll the tab bar to show the active tab
            document.getElementById(`tab-${id}`)?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "center" });
          }
        });
      },
      { rootMargin: "-20% 0px -70% 0px", threshold: 0 }
    );

    categories.forEach((cat) => {
      const el = document.getElementById(`category-${cat.id}`);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [categories]);

  const [selectedProduct, setSelectedProduct] = useState<MenuItem | null>(null);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Modal State
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<Addon[]>([]);
  const [quantity, setQuantity] = useState(1);

  // Toast State
  const [toastItem, setToastItem] = useState<{name: string, image: string | null} | null>(null);

  const { addItem, setIsCartOpen } = useCart();

  const handleOpenProduct = (item: MenuItem) => {
    setSelectedProduct(item);
    setSelectedSize(item.sizes.length > 0 ? item.sizes[0] : null);
    setSelectedAddons([]);
    setQuantity(1);
    
    // Push state to browser history to catch back button
    window.history.pushState({ modal: `product-${item.id}` }, "", `#product-${item.id}`);
  };

  const closeProductModal = () => {
    setSelectedProduct(null);
    if (window.location.hash.startsWith("#product-")) {
      window.history.back(); // Remove the hash from URL cleanly
    }
  };

  useEffect(() => {
    const handlePopState = () => {
      // If user presses back button, the hash will change/disappear
      if (selectedProduct && !window.location.hash.startsWith("#product-")) {
        setSelectedProduct(null);
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [selectedProduct]);

  useEffect(() => {
    if (selectedProduct) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [selectedProduct]);

  const handleToggleAddon = (addon: Addon) => {
    if (selectedAddons.find(a => a.id === addon.id)) {
      setSelectedAddons(selectedAddons.filter(a => a.id !== addon.id));
    } else {
      setSelectedAddons([...selectedAddons, addon]);
    }
  };

  const calculateModalTotal = () => {
    if (!selectedProduct) return 0;
    const basePrice = selectedSize ? Number(selectedSize.price) : Number(selectedProduct.price);
    const addonsPrice = selectedAddons.reduce((acc, curr) => acc + Number(curr.price), 0);
    return (basePrice + addonsPrice) * quantity;
  };

  const handleAddToCart = () => {
    if (!selectedProduct) return;
    
    const basePrice = selectedSize ? Number(selectedSize.price) : Number(selectedProduct.price);
    const addonsPrice = selectedAddons.reduce((acc, curr) => acc + Number(curr.price), 0);
    const finalPrice = basePrice + addonsPrice;

    // Create a unique ID if sizes or addons are selected, so they don't merge incorrectly
    const uniqueCartItemId = `${selectedProduct.id}-${selectedSize?.id || 'base'}-${selectedAddons.map(a => a.id).sort().join('-')}`;

    let addonsText = selectedAddons.map(a => a.name).join('، ');
    let nameWithDetails = selectedProduct.name;
    if (selectedSize) nameWithDetails += ` (${selectedSize.name})`;
    if (addonsText) nameWithDetails += ` + ${addonsText}`;

    setIsAddingToCart(true);

    setTimeout(() => {
      addItem({
        id: uniqueCartItemId, // Use unique ID to separate different sizes/addons of same product
        name: nameWithDetails,
        price: finalPrice,
        quantity,
        image: selectedProduct.image,
      });

      setToastItem({ name: nameWithDetails, image: selectedProduct.image });
      setIsAddingToCart(false);
      closeProductModal(); // close modal

      // Auto close toast after 5s
      setTimeout(() => setToastItem(null), 5000);
    }, 400); // fraction of a second loading
  };

  if (categories.length === 0) {
    return (
      <div className={`text-center py-20 ${isDarkSolid ? 'bg-black' : 'bg-white'}`}>
        <h2 className={`text-2xl font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>المنيو قيد التجهيز</h2>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${isDarkSolid ? 'bg-black' : ''}`}>
      
      {/* Toast Notification */}
      {toastItem && (
        <div className="fixed top-4 inset-x-0 mx-auto z-50 w-[90%] max-w-md bg-white border border-surface-100 rounded-2xl p-3.5 flex flex-col gap-3 animate-slide-in-top">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-surface-50 rounded-xl overflow-hidden flex items-center justify-center shrink-0">
              {toastItem.image ? (
                <Image src={toastItem.image} alt={toastItem.name} width={40} height={40} className="w-full h-full object-cover" />
              ) : (
                <ShoppingBag className="w-4 h-4 text-surface-400" />
              )}
            </div>
            <div className="flex-1">
              <p className="font-bold text-success-600 text-sm flex items-center gap-1"><Check className="w-3.5 h-3.5"/> تمت الإضافة</p>
              <p className="text-xs text-surface-500 line-clamp-1 mt-0.5">{toastItem.name}</p>
            </div>
            <button onClick={() => setToastItem(null)} className="text-surface-400 hover:text-surface-950 bg-surface-50 p-1.5 rounded-full transition-colors">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => { setToastItem(null); setIsCartOpen(true); }}
              className="flex-1 py-2 text-white font-bold text-sm rounded-xl transition-colors"
              style={{ backgroundColor: primaryColor }}
            >
              عرض السلة
            </button>
            <button 
              onClick={() => setToastItem(null)}
              className="flex-1 py-2 bg-surface-50 text-surface-700 font-bold text-sm rounded-xl transition-colors hover:bg-surface-100"
            >
              متابعة التسوق
            </button>
          </div>
        </div>
      )}

      {/* Toolbar: Tabs + Search */}
      <div className={`sticky top-14 z-20 py-2.5 flex items-center gap-2 border-b ${isDarkSolid ? 'bg-black border-[#222]' : 'bg-white border-surface-100'}`}>
        {/* Search mode: show search input */}
        {isSearchOpen ? (
          <div className="flex-1 flex items-center gap-2 animate-search-expand">
            <div className={`flex-1 flex items-center gap-2 rounded-full px-4 py-2 border ${isDarkSolid ? 'bg-[#111] border-[#333]' : 'bg-surface-50 border-surface-100'}`}>
              <Search className="w-5 h-5 text-surface-400 shrink-0" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن صنف..."
                className={`flex-1 bg-transparent text-sm outline-none placeholder:text-surface-400 ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}
                autoFocus
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="text-surface-400 hover:text-surface-600">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <button
              onClick={() => { setIsSearchOpen(false); setSearchQuery(""); }}
              className={`w-9 h-9 flex items-center justify-center rounded-full transition-colors shrink-0 ${isDarkSolid ? 'bg-[#111] text-surface-400 hover:bg-[#222]' : 'bg-surface-100 text-surface-600 hover:bg-surface-200'}`}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <>
            {/* Categories Tabs - Scrollable */}
            <div className="flex-1 overflow-x-auto [&::-webkit-scrollbar]:hidden [-ms-overflow-style:'none'] [scrollbar-width:'none'] flex items-center gap-2 pb-0.5">
              {categories.filter(cat => menuItems.some(item => item.categoryId === cat.id)).map((cat) => (
                <button
                  key={cat.id}
                  id={`tab-${cat.id}`}
                  onClick={() => {
                    isManualScrolling.current = true;
                    setActiveTab(cat.id);
                    document.getElementById(`category-${cat.id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
                    
                    if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
                    scrollTimeout.current = setTimeout(() => {
                      isManualScrolling.current = false;
                    }, 1000);
                  }}
                  className={`whitespace-nowrap px-4 py-2 font-semibold text-sm transition-all rounded-full border ${
                    activeTab === cat.id
                      ? isDarkSolid ? "text-black border-transparent" : "text-white border-transparent"
                      : isDarkSolid 
                        ? "bg-transparent text-white border-transparent" 
                        : "bg-surface-50 text-surface-600 border-transparent hover:bg-surface-100"
                  }`}
                  style={
                    activeTab === cat.id 
                      ? { backgroundColor: primaryColor } 
                      : isDarkSolid 
                        ? { borderColor: primaryColor, borderWidth: '1px' } 
                        : undefined
                  }
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {/* Search button */}
            <div className={`flex items-center border-s ps-2 ${isDarkSolid ? 'border-[#333]' : 'border-surface-100'}`}>
              <button 
                onClick={() => { setIsSearchOpen(true); setTimeout(() => searchInputRef.current?.focus(), 100); }}
                className={`w-11 h-11 border flex items-center justify-center transition-all rounded-full ${isDarkSolid ? 'bg-transparent border-surface-500/50 text-white hover:bg-white/10' : 'bg-surface-50 border-surface-100 text-surface-500 hover:bg-surface-100'}`}
              >
                <Search className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>

      {/* Menu Items — Matching Menuo card style */}
      <div className="space-y-8">
        {categories.map((category) => {
          let items = menuItems.filter((item) => item.categoryId === category.id);
          
          // Apply search filter
          if (searchQuery.trim()) {
            const q = searchQuery.trim().toLowerCase();
            items = items.filter((item) => 
              item.name.toLowerCase().includes(q) || 
              (item.description && item.description.toLowerCase().includes(q))
            );
          }
          
          if (items.length === 0) return null;

          return (
            <div key={category.id} id={`category-${category.id}`} className="scroll-mt-28">
              <h2 
                className={`text-lg p-2 text-center font-semibold mb-4 ${isDarkSolid ? 'text-white' : 'rounded-xl'}`}
                style={isDarkSolid ? {} : { 
                  backgroundColor: store.primaryColor ? `${store.primaryColor}1a` : 'var(--color-primary-50)',
                  color: store.primaryColor || 'var(--color-primary-600)' 
                }}
              >
                {isDarkSolid ? `- ${category.name} -` : category.name}
              </h2>
              
              {/* Cards — Grid layout */}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {items.map((item) => (
                  <div 
                    key={item.id} 
                    onClick={() => handleOpenProduct(item)}
                    className={`border rounded-2xl overflow-hidden flex flex-col cursor-pointer transition-all group hover:shadow-sm ${
                      isDarkSolid ? 'bg-[#0a0a0a]' : 'bg-white border-surface-100 hover:border-surface-200'
                    }`}
                    style={isDarkSolid ? { borderColor: primaryColor } : undefined}
                  >
                    {/* Image */}
                    {item.image || store.logo ? (
                      <div className={`relative w-full aspect-[5/4] shrink-0 overflow-hidden border-b ${isDarkSolid ? 'bg-[#111] border-[#222]' : 'bg-surface-50 border-surface-50'}`}>
                        <Image 
                          src={item.image || store.logo!} 
                          alt={item.name}
                          fill
                          sizes="(max-width: 768px) 50vw, (max-width: 1024px) 33vw, 25vw"
                          className={`object-cover transition-opacity duration-300 group-hover:scale-105 ${!item.image ? 'opacity-50 p-6 object-contain' : ''}`}
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className={`w-full aspect-[5/4] shrink-0 flex items-center justify-center border-b ${isDarkSolid ? 'bg-[#111] border-[#222]' : 'bg-surface-50 border-surface-50'}`}>
                        <ShoppingBag className={`w-8 h-8 ${isDarkSolid ? 'text-[#333]' : 'text-surface-200'}`} />
                      </div>
                    )}

                    {/* Text content */}
                    <div className={`p-3 sm:p-4 flex flex-col flex-1 justify-between min-w-0 ${isDarkSolid ? 'bg-black' : ''}`}>
                      <div>
                        <h3 className={`font-bold text-[13px] sm:text-sm leading-tight mb-1 line-clamp-2 ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}>{item.name}</h3>
                        {!store.hideProductDescription && item.description && (
                          <p className={`text-[11px] sm:text-xs line-clamp-2 leading-relaxed ${isDarkSolid ? 'text-surface-400' : 'text-surface-400'}`}>
                            {item.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between mt-3 pt-2">
                        <span 
                          className="font-black text-[13px] sm:text-sm"
                          style={{ color: primaryColor }}
                        >
                          {item.sizes.length > 0 
                            ? `${formatPrice(Math.min(...item.sizes.map(s => s.price)), store.currency)}`
                            : formatPrice(item.price, store.currency)
                          }
                        </span>
                        {!store.hideProductAddButton && (
                          <span 
                            className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center transition-transform active:scale-95 ${isDarkSolid ? 'text-black' : 'text-white'}`}
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Plus className="w-4 h-4 sm:w-4 sm:h-4" />
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Product Modal — Bottom Sheet Style matching Menuo */}
      {selectedProduct && (
        <div 
          className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 animate-fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeProductModal();
          }}
        >
          <div 
            className={`w-full sm:max-w-md sm:max-h-[85vh] max-h-[90vh] flex flex-col animate-slide-in-up sm:animate-zoom-in overflow-hidden sm:rounded-2xl rounded-t-3xl ${isDarkSolid ? 'bg-[#0a0a0a]' : 'bg-white'}`}
            onTouchStart={(e) => {
              const touch = e.touches[0];
              const el = e.currentTarget;
              el.dataset.startY = touch.clientY.toString();
              el.style.transition = 'none';
            }}
            onTouchMove={(e) => {
              const touch = e.touches[0];
              const el = e.currentTarget;
              const startY = parseFloat(el.dataset.startY || '0');
              const deltaY = touch.clientY - startY;
              // Only allow dragging downwards
              if (deltaY > 0) {
                el.style.transform = `translateY(${deltaY}px)`;
              }
            }}
            onTouchEnd={(e) => {
              const el = e.currentTarget;
              const touch = e.changedTouches[0];
              const startY = parseFloat(el.dataset.startY || '0');
              const deltaY = touch.clientY - startY;
              el.style.transition = 'transform 0.3s ease-out';
              if (deltaY > 100) {
                closeProductModal();
                // Reset after close animation completes
                setTimeout(() => { el.style.transform = ''; }, 300);
              } else {
                el.style.transform = '';
              }
            }}
          >
            {/* Modal Header Image */}
            <div className={`relative h-48 sm:h-52 shrink-0 ${isDarkSolid ? 'bg-[#111]' : 'bg-surface-50'}`}>
              {selectedProduct.image ? (
                <Image src={selectedProduct.image} alt={selectedProduct.name} fill sizes="(max-width: 768px) 100vw, 50vw" className="object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center"><ShoppingBag className={`w-10 h-10 ${isDarkSolid ? 'text-[#333]' : 'text-surface-200'}`} /></div>
              )}
              <button 
                onClick={closeProductModal}
                className="absolute top-3 end-3 w-8 h-8 bg-black/40 backdrop-blur-sm rounded-full text-white flex items-center justify-center hover:bg-black/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
              {/* Drag handle for mobile */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-10 h-1 bg-white/40 rounded-full sm:hidden" />
            </div>

            {/* Modal Content */}
            <div className="p-5 flex-1 overflow-y-auto space-y-5">
              <div>
                <h2 className={`text-lg font-bold ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}>{selectedProduct.name}</h2>
                {selectedProduct.description && (
                  <p className="text-surface-400 text-sm mt-1.5 leading-relaxed">{selectedProduct.description}</p>
                )}
                <div 
                  className="mt-2 font-bold text-lg"
                  style={{ color: primaryColor }}
                >
                  {formatPrice(selectedProduct.price, store.currency)}
                </div>
              </div>

              {selectedProduct.sizes && selectedProduct.sizes.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2.5 text-sm rounded-xl p-2.5 ${isDarkSolid ? 'bg-[#111] text-white' : 'bg-surface-50 text-surface-900'}`}>اختر الحجم (إجباري)</h3>
                  <div className="space-y-2">
                    {selectedProduct.sizes.map(size => (
                      <label key={size.id} onClick={() => setSelectedSize(size)} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${selectedSize?.id === size.id ? isDarkSolid ? 'border-primary-500 bg-primary-500/10' : 'border-primary-500 bg-primary-50' : isDarkSolid ? 'border-[#333] hover:bg-[#111]' : 'border-surface-100 hover:bg-surface-50'}`}>
                        <div className="flex items-center gap-3">
                          <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${selectedSize?.id === size.id ? 'border-primary-500' : isDarkSolid ? 'border-surface-600' : 'border-surface-300'}`}>
                            {selectedSize?.id === size.id && (
                              <div className="w-2 h-2 rounded-full bg-primary-500" />
                            )}
                          </div>
                          <span className={`text-sm ${isDarkSolid ? 'text-surface-200' : 'text-surface-800'}`}>{size.name}</span>
                        </div>
                        <span className={`font-semibold text-sm ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}>{formatPrice(size.price, store.currency)}</span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              {/* Addons */}
              {selectedProduct.addons && selectedProduct.addons.length > 0 && (
                <div>
                  <h3 className={`font-semibold mb-2.5 text-sm rounded-xl p-2.5 ${isDarkSolid ? 'bg-[#111] text-white' : 'bg-surface-50 text-surface-900'}`}>إضافات (اختياري)</h3>
                  <div className="space-y-2">
                    {selectedProduct.addons.map(addon => {
                      const isSelected = selectedAddons.some(a => a.id === addon.id);
                      return (
                        <label key={addon.id} onClick={() => {
                          if (isSelected) {
                            setSelectedAddons(prev => prev.filter(a => a.id !== addon.id));
                          } else {
                            setSelectedAddons(prev => [...prev, addon]);
                          }
                        }} className={`flex items-center justify-between p-3 border rounded-xl cursor-pointer transition-all ${isSelected ? isDarkSolid ? 'border-primary-500 bg-primary-500/10' : 'border-primary-500 bg-primary-50' : isDarkSolid ? 'border-[#333] hover:bg-[#111]' : 'border-surface-100 hover:bg-surface-50'}`}>
                          <div className="flex items-center gap-3">
                            <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${isSelected ? 'border-primary-500 bg-primary-500' : isDarkSolid ? 'border-surface-600' : 'border-surface-300'}`}>
                              {isSelected && <Check className="w-2.5 h-2.5 text-white" />}
                            </div>
                            <span className={`text-sm ${isDarkSolid ? 'text-surface-200' : 'text-surface-800'}`}>{addon.name}</span>
                          </div>
                          <span className="font-semibold text-sm text-surface-400">+{formatPrice(addon.price, store.currency)}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer (Quantity + Add to Cart) */}
            <div className={`p-4 border-t flex items-center gap-3 ${isDarkSolid ? 'bg-[#0a0a0a] border-[#222]' : 'bg-white border-surface-100'}`}>
              <div className={`flex items-center rounded-xl p-1 h-11 border ${isDarkSolid ? 'bg-[#111] border-[#333]' : 'bg-surface-50 border-surface-100'}`}>
                <button 
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className={`w-9 h-full flex items-center justify-center rounded-lg transition-colors ${isDarkSolid ? 'bg-[#222] text-surface-300 hover:bg-[#333]' : 'bg-white text-surface-600 hover:bg-surface-100'}`}
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className={`font-bold text-base w-8 text-center ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}>{quantity}</span>
                <button 
                  onClick={() => setQuantity(quantity + 1)}
                  className={`w-9 h-full flex items-center justify-center rounded-lg transition-colors ${isDarkSolid ? 'bg-[#222] text-surface-300 hover:bg-[#333]' : 'bg-white text-surface-600 hover:bg-surface-100'}`}
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>

              <button 
                onClick={handleAddToCart}
                disabled={isAddingToCart}
                className={`flex-[2] h-11 font-bold rounded-xl transition-all flex items-center justify-center gap-2 px-4 disabled:opacity-80 text-sm ${isDarkSolid ? 'text-black' : 'text-white'}`}
                style={{ 
                  backgroundColor: primaryColor
                }}
              >
                {isAddingToCart ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>إضافة</span>
                    <span className={isDarkSolid ? "text-black/50" : "text-white/50"}>|</span>
                    <span>{formatPrice(calculateModalTotal(), store.currency)}</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
