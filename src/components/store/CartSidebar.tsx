"use client";

import { useState, useEffect, useRef, useMemo } from "react";
import { X, Plus, Minus, ShoppingBag, Truck, Store as StoreIcon, Loader2, Check, Search, ChevronDown } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice, formatWhatsappNumber } from "@/lib/utils";
import Image from "next/image";
import { placeOrderAction } from "@/app/store/[subdomain]/actions";
import toast from "react-hot-toast";

type Branch = { id: string; name: string; address: string | null; whatsappNumber?: string | null };
type DeliveryArea = { id: string; name: string; fee: number };
type DeliveryGovernorate = {
  id: string;
  name: string;
  whatsappNumber: string | null;
  uniformFee: number | null;
  cities: DeliveryArea[];
};
type StoreData = { id: string; name: string; whatsappNumber: string | null; enableWhatsappOrders: boolean; currency: string; primaryColor?: string | null; theme?: string | null };

// Custom searchable dropdown component
function SearchableSelect({
  options,
  value,
  onChange,
  placeholder,
  isDarkSolid,
  primaryColor,
  currency,
  showFee = true,
}: {
  options: DeliveryArea[];
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  isDarkSolid: boolean;
  primaryColor: string;
  currency?: string;
  showFee?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return options;
    const q = search.trim().toLowerCase();
    return options.filter(o => o.name.toLowerCase().includes(q));
  }, [options, search]);

  const selectedOption = options.find(o => o.id === value);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setSearch("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 border rounded-xl outline-none transition-colors text-start flex items-center justify-between ${
          isDarkSolid
            ? "bg-[#111] border-[#333] text-white"
            : "bg-white border-surface-200 text-surface-900"
        }`}
      >
        <span className={selectedOption ? "" : (isDarkSolid ? "text-surface-500" : "text-surface-400")}>
          {selectedOption
            ? `${selectedOption.name}${showFee ? ` (+${formatPrice(selectedOption.fee, currency)})` : ""}`
            : placeholder}
        </span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? "rotate-180" : ""} ${isDarkSolid ? "text-surface-400" : "text-surface-500"}`} />
      </button>

      {isOpen && (
        <div className={`absolute z-50 w-full mt-1 border rounded-xl overflow-hidden ${
          isDarkSolid ? "bg-[#111] border-[#333]" : "bg-white border-surface-200"
        }`}>
          {/* Search input */}
          {options.length > 5 && (
            <div className={`p-2 border-b ${isDarkSolid ? "border-[#333]" : "border-surface-100"}`}>
              <div className={`flex items-center gap-2 px-3 py-2 rounded-lg ${isDarkSolid ? "bg-[#222]" : "bg-surface-50"}`}>
                <Search className={`w-4 h-4 shrink-0 ${isDarkSolid ? "text-surface-500" : "text-surface-400"}`} />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="ابحث..."
                  className={`flex-1 bg-transparent text-sm outline-none ${isDarkSolid ? "text-white placeholder:text-surface-500" : "text-surface-900 placeholder:text-surface-400"}`}
                />
              </div>
            </div>
          )}

          {/* Options list */}
          <div className="max-h-[200px] overflow-y-auto scrollbar-hide">
            {filtered.length === 0 ? (
              <div className={`p-3 text-center text-sm ${isDarkSolid ? "text-surface-500" : "text-surface-400"}`}>
                لا توجد نتائج
              </div>
            ) : (
              filtered.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => {
                    onChange(option.id);
                    setIsOpen(false);
                    setSearch("");
                  }}
                  className={`w-full text-start px-3 py-2.5 text-sm transition-colors flex items-center justify-between ${
                    value === option.id
                      ? isDarkSolid ? "bg-primary-900/20 text-white" : "bg-primary-50 text-primary-700"
                      : isDarkSolid ? "text-surface-300 hover:bg-[#222]" : "text-surface-700 hover:bg-surface-50"
                  }`}
                >
                  <span className="font-medium">{option.name}</span>
                  {showFee && (
                    <span className={`text-xs font-bold ${isDarkSolid ? "text-surface-500" : "text-surface-400"}`}>
                      +{formatPrice(option.fee, currency)}
                    </span>
                  )}
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export function CartSidebar({
  store,
  branches,
  deliveryAreas,
  deliveryGovernorates,
}: {
  store?: StoreData;
  branches?: Branch[];
  deliveryAreas?: DeliveryArea[];
  deliveryGovernorates?: DeliveryGovernorate[];
}) {
  const { items, isCartOpen, setIsCartOpen, updateQuantity, removeItem, total, clearCart } = useCart();
  
  const [isCheckout, setIsCheckout] = useState(false);
  const [deliveryType, setDeliveryType] = useState<"DELIVERY" | "PICKUP">("DELIVERY");
  const [selectedGovernorate, setSelectedGovernorate] = useState<string>("");
  const [selectedArea, setSelectedArea] = useState<string>("");
  const [selectedBranch, setSelectedBranch] = useState<string>("");
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  const isDarkSolid = store?.theme === "dark_solid";
  const primaryColor = store?.primaryColor || "var(--color-primary-600)";

  // Determine if we have the new governorate system
  const hasGovernorates = deliveryGovernorates && deliveryGovernorates.length > 0;
  const isSingleGovernorate = hasGovernorates && deliveryGovernorates.length === 1;
  
  // Auto-select single governorate
  useEffect(() => {
    if (isSingleGovernorate && deliveryGovernorates) {
      setSelectedGovernorate(deliveryGovernorates[0].id);
    }
  }, [isSingleGovernorate, deliveryGovernorates]);

  // Reset city when governorate changes
  useEffect(() => {
    setSelectedArea("");
  }, [selectedGovernorate]);

  // Get current governorate object
  const currentGovernorate = hasGovernorates
    ? deliveryGovernorates.find(g => g.id === selectedGovernorate)
    : null;

  // Get available cities for current governorate
  const availableCities = currentGovernorate?.cities || [];

  // Calculate delivery fee
  const deliveryFee = useMemo(() => {
    if (deliveryType !== "DELIVERY") return 0;
    
    // New governorate system
    if (hasGovernorates && currentGovernorate) {
      // If governorate has uniform fee, use that
      if (currentGovernorate.uniformFee !== null) {
        return currentGovernorate.uniformFee;
      }
      // Otherwise use city fee
      const city = availableCities.find(c => c.id === selectedArea);
      return city?.fee || 0;
    }
    
    // Legacy flat delivery areas
    if (selectedArea && deliveryAreas) {
      return deliveryAreas.find(a => a.id === selectedArea)?.fee || 0;
    }
    
    return 0;
  }, [deliveryType, hasGovernorates, currentGovernorate, selectedArea, availableCities, deliveryAreas]);

  // Determine which WhatsApp number to use
  const getTargetWhatsapp = () => {
    // If a governorate is selected and has a whatsapp number, use it
    if (hasGovernorates && currentGovernorate?.whatsappNumber) {
      return currentGovernorate.whatsappNumber;
    }
    // If pickup with branch whatsapp
    if (deliveryType === "PICKUP") {
      const branchObj = branches?.find(b => b.id === selectedBranch);
      if (branchObj?.whatsappNumber) return branchObj.whatsappNumber;
    }
    // Fallback to store whatsapp
    return store?.whatsappNumber || null;
  };
  
  const finalTotal = total + deliveryFee;

  useEffect(() => {
    const handlePopState = () => {
      setIsCartOpen(false);
      setIsCheckout(false);
    };

    if (isCartOpen) {
      window.history.pushState({ cart: true }, "");
      window.addEventListener("popstate", handlePopState);
    }

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, [isCartOpen, setIsCartOpen]);

  if (!isCartOpen) return null;

  const handleSubmitOrder = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!store) return;

    // Validate delivery area selection
    if (deliveryType === "DELIVERY") {
      if (hasGovernorates) {
        if (!selectedGovernorate) {
          toast.error("يرجى اختيار المحافظة");
          return;
        }
        // If no uniform fee, must select city
        if (currentGovernorate && currentGovernorate.uniformFee === null && !selectedArea && availableCities.length > 0) {
          toast.error("يرجى اختيار المدينة");
          return;
        }
      } else if (deliveryAreas && deliveryAreas.length > 0 && !selectedArea) {
        toast.error("يرجى اختيار منطقة التوصيل");
        return;
      }
    }
    if (deliveryType === "PICKUP" && !selectedBranch && branches && branches.length > 0) {
      toast.error("يرجى اختيار الفرع");
      return;
    }

    setIsSubmitting(true);
    setValidationErrors({});

    const formData = new FormData(e.currentTarget);
    const customerName = formData.get("customerName") as string;
    const customerPhone = formData.get("customerPhone") as string;
    const customerAddress = formData.get("customerAddress") as string;
    
    const newErrors: Record<string, string> = {};
    if (!customerName || customerName.trim() === "") newErrors.customerName = "يرجى إدخال الاسم كامل";
    if (!customerPhone || customerPhone.replace(/\D/g, "").length !== 11) newErrors.customerPhone = "رقم الهاتف يجب أن يتكون من 11 رقم بالضبط";
    if (deliveryType === "DELIVERY" && (!customerAddress || customerAddress.trim() === "")) newErrors.customerAddress = "يرجى إدخال العنوان التفصيلي";
    
    if (Object.keys(newErrors).length > 0) {
      setValidationErrors(newErrors);
      setIsSubmitting(false);
      return;
    }

    // Use the city ID as selectedArea for the order
    const effectiveAreaId = selectedArea || "";
    
    formData.append("deliveryType", deliveryType);
    formData.append("selectedArea", effectiveAreaId);
    formData.append("selectedBranch", selectedBranch);
    formData.append("storeId", store.id);
    formData.append("cartItems", JSON.stringify(items));
    formData.append("subtotal", total.toString());
    formData.append("deliveryFee", deliveryFee.toString());
    formData.append("total", finalTotal.toString());

    try {
      const res = await placeOrderAction(formData);
      
      if (res.error) {
        toast.error(res.error);
        setIsSubmitting(false);
        return;
      }

      // Success
      clearCart();
      setIsCartOpen(false);
      setIsCheckout(false);

      if (store.enableWhatsappOrders) {
        const targetWhatsappNumber = getTargetWhatsapp();

        if (targetWhatsappNumber) {
          const waNumber = formatWhatsappNumber(targetWhatsappNumber);
          let msg = `*طلب جديد من ${store.name}*\n\n`;
          msg += `*الاسم:* ${formData.get("customerName")}\n`;
          msg += `*الهاتف:* ${formData.get("customerPhone")}\n`;
          if (deliveryType === "DELIVERY") {
            // Build location string
            let locationParts: string[] = [];
            if (hasGovernorates && currentGovernorate) {
              if (!isSingleGovernorate) locationParts.push(currentGovernorate.name);
              const cityName = availableCities.find(c => c.id === selectedArea)?.name;
              if (cityName) locationParts.push(cityName);
            } else {
              const areaName = deliveryAreas?.find(a => a.id === selectedArea)?.name;
              if (areaName) locationParts.push(areaName);
            }
            const locationStr = locationParts.length > 0 ? locationParts.join(" - ") + " - " : "";
            msg += `*التوصيل إلى:* ${locationStr}${formData.get("customerAddress")}\n`;
          } else {
            const selectedBranchObj = branches?.find(b => b.id === selectedBranch);
            msg += `*استلام من فرع:* ${selectedBranchObj?.name || 'الفرع الرئيسي'}\n`;
          }
          msg += `\n*الطلبات:*\n`;
          items.forEach(item => {
            msg += `- ${item.quantity}x ${item.name} (${formatPrice(item.price, store.currency)})\n`;
          });
          msg += `\n*الإجمالي المطلوب:* ${formatPrice(finalTotal, store.currency)}`;
          
          window.open(`https://wa.me/${waNumber}?text=${encodeURIComponent(msg)}`, '_blank');
        } else {
          alert("تم إرسال طلبك بنجاح!");
        }
      } else {
        alert("تم إرسال طلبك بنجاح!");
      }

    } catch (err) {
      toast.error("حدث خطأ أثناء إرسال الطلب");
      setIsSubmitting(false);
    }
  };

  // Determine if we need to show delivery area selection at all
  const hasAnyDeliveryAreas = (hasGovernorates && deliveryGovernorates.some(g => g.cities.length > 0 || g.uniformFee !== null)) || 
    (deliveryAreas && deliveryAreas.length > 0);

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm transition-opacity"
        onClick={() => { setIsCartOpen(false); setIsCheckout(false); }}
      />

      {/* Sidebar */}
      <div className={`fixed top-0 end-0 h-full w-full sm:w-[450px] z-50 flex flex-col animate-slide-in-right border-s ${isDarkSolid ? 'bg-[#0a0a0a] border-[#222]' : 'bg-white border-surface-200'}`}>
        {/* Header */}
        <div className={`p-4 border-b flex items-center justify-between ${isDarkSolid ? 'bg-[#111] border-[#222]' : 'bg-surface-50 border-surface-200'}`}>
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-6 h-6" style={{ color: primaryColor }} />
            <h2 className={`text-lg font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>
              {isCheckout ? "إتمام الطلب" : "سلة المشتريات"}
            </h2>
          </div>
          <button
            onClick={() => { setIsCartOpen(false); setIsCheckout(false); }}
            className={`w-10 h-10 rounded-full border-none flex items-center justify-center transition-colors ${isDarkSolid ? 'bg-white/10 hover:bg-white/20' : 'bg-surface-100/50 hover:bg-surface-200'}`}
          >
            <X className={`w-5 h-5 ${isDarkSolid ? 'text-surface-300' : 'text-surface-600'}`} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto scrollbar-hide p-4 space-y-4">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-surface-500 space-y-4">
              <ShoppingBag className="w-16 h-16 opacity-20" />
              <p className="text-lg">سلة المشتريات فارغة</p>
            </div>
          ) : (
            !isCheckout ? (
              items.map((item) => (
                <div key={item.id} className={`flex gap-4 border rounded-3xl p-3 transition-all ${isDarkSolid ? 'bg-[#111] border-[#333]' : 'bg-white border-surface-100'}`}>
                  {item.image ? (
                    <Image
                      src={item.image}
                      alt={item.name}
                      width={80}
                      height={80}
                      className="w-20 h-20 object-cover rounded-2xl border-none"
                    />
                  ) : (
                    <div className={`w-20 h-20 flex items-center justify-center rounded-2xl border-none ${isDarkSolid ? 'bg-[#222]' : 'bg-surface-100'}`}>
                      <ShoppingBag className={`w-8 h-8 ${isDarkSolid ? 'text-surface-500' : 'text-surface-300'}`} />
                    </div>
                  )}
                  
                  <div className="flex-1 flex flex-col justify-between">
                    <div className="flex justify-between items-start">
                      <h3 className={`font-bold line-clamp-2 text-sm leading-tight ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>{item.name}</h3>
                      <button
                        onClick={() => removeItem(item.id)}
                        className={`transition-colors ${isDarkSolid ? 'text-surface-500 hover:text-error-400' : 'text-surface-400 hover:text-error-500'}`}
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between mt-2">
                      <div className="font-black text-sm" style={{ color: primaryColor }}>
                        {formatPrice(item.price, store?.currency)}
                      </div>
                      
                      {/* Quantity Controls */}
                      <div className={`flex items-center gap-1 border rounded-lg p-1 ${isDarkSolid ? 'border-[#333]' : 'border-surface-200'}`}>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors ${isDarkSolid ? 'bg-[#222] border-[#444] text-surface-300 hover:bg-[#333]' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className={`font-bold text-sm w-6 text-center ${isDarkSolid ? 'text-white' : 'text-surface-900'}`}>{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className={`w-8 h-8 flex items-center justify-center border rounded-lg transition-colors ${isDarkSolid ? 'bg-[#222] border-[#444] text-surface-300 hover:bg-[#333]' : 'bg-white border-surface-200 text-surface-600 hover:bg-surface-50'}`}
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              // Checkout Form
              <form id="checkout-form" onSubmit={handleSubmitOrder} noValidate className="space-y-6 animate-fade-in pb-10">

                {/* Toggle Delivery / Pickup */}
                <div className={`flex p-1.5 rounded-2xl ${isDarkSolid ? 'bg-[#111]' : 'bg-surface-100'}`}>
                  <button
                    type="button"
                    onClick={() => { setDeliveryType("DELIVERY"); setValidationErrors({}); }}
                    className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold transition-all rounded-xl ${
                      deliveryType === "DELIVERY" 
                        ? (isDarkSolid ? "text-black" : "text-white") 
                        : (isDarkSolid ? "text-surface-400 hover:text-white hover:bg-white/5" : "text-surface-500 hover:text-surface-950 hover:bg-surface-200/50")
                    }`}
                    style={deliveryType === "DELIVERY" ? { backgroundColor: primaryColor } : undefined}
                  >
                    <Truck className={`w-4 h-4`} />
                    توصيل للمنزل
                  </button>
                  <button
                    type="button"
                    onClick={() => { setDeliveryType("PICKUP"); setValidationErrors({}); }}
                    className={`flex-1 flex justify-center items-center gap-2 py-3 text-sm font-bold transition-all rounded-xl ${
                      deliveryType === "PICKUP" 
                        ? (isDarkSolid ? "text-black" : "text-white") 
                        : (isDarkSolid ? "text-surface-400 hover:text-white hover:bg-white/5" : "text-surface-500 hover:text-surface-950 hover:bg-surface-200/50")
                    }`}
                    style={deliveryType === "PICKUP" ? { backgroundColor: primaryColor } : undefined}
                  >
                    <StoreIcon className={`w-4 h-4`} />
                    استلام من الفرع
                  </button>
                </div>

                {/* Delivery Area Selection */}
                {deliveryType === "DELIVERY" && hasAnyDeliveryAreas && (
                  <div className="space-y-3">
                    {/* New Governorate System */}
                    {hasGovernorates && (
                      <>
                        {/* Governorate selector - hidden if only one */}
                        {!isSingleGovernorate && (
                          <div className="space-y-1">
                            <label className={`text-sm font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>اختر المحافظة *</label>
                            <select
                              value={selectedGovernorate}
                              onChange={(e) => setSelectedGovernorate(e.target.value)}
                              className={`w-full p-3 border rounded-xl outline-none transition-colors ${isDarkSolid ? 'bg-[#111] border-[#333] text-white focus:border-primary-500' : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900'}`}
                              required
                            >
                              <option value="">-- اختر المحافظة --</option>
                              {deliveryGovernorates.map((gov) => (
                                <option key={gov.id} value={gov.id}>
                                  {gov.name}
                                  {gov.uniformFee !== null ? ` (${formatPrice(gov.uniformFee, store?.currency)})` : ""}
                                </option>
                              ))}
                            </select>
                          </div>
                        )}

                        {/* City selector - shown when governorate selected AND no uniform fee */}
                        {selectedGovernorate && currentGovernorate && currentGovernorate.uniformFee === null && availableCities.length > 0 && (
                          <div className="space-y-1">
                            <label className={`text-sm font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>اختر المدينة *</label>
                            <SearchableSelect
                              options={availableCities}
                              value={selectedArea}
                              onChange={setSelectedArea}
                              placeholder="-- اختر المدينة --"
                              isDarkSolid={isDarkSolid}
                              primaryColor={primaryColor}
                              currency={store?.currency}
                            />
                          </div>
                        )}

                        {/* Show uniform fee info */}
                        {selectedGovernorate && currentGovernorate && currentGovernorate.uniformFee !== null && (
                          <div className={`p-3 rounded-xl text-sm font-medium ${isDarkSolid ? 'bg-[#111] text-surface-300' : 'bg-surface-50 text-surface-600'}`}>
                            رسوم التوصيل: <span className="font-bold" style={{ color: primaryColor }}>{formatPrice(currentGovernorate.uniformFee, store?.currency)}</span>
                          </div>
                        )}
                      </>
                    )}

                    {/* Legacy flat delivery areas (no governorates) */}
                    {!hasGovernorates && deliveryAreas && deliveryAreas.length > 0 && (
                      <div className="space-y-1">
                        <label className={`text-sm font-bold ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>اختر منطقة التوصيل *</label>
                        <SearchableSelect
                          options={deliveryAreas}
                          value={selectedArea}
                          onChange={setSelectedArea}
                          placeholder="-- اختر منطقتك --"
                          isDarkSolid={isDarkSolid}
                          primaryColor={primaryColor}
                          currency={store?.currency}
                        />
                      </div>
                    )}
                  </div>
                )}

                {deliveryType === "PICKUP" && branches && branches.length > 0 && (
                  <div className="space-y-1">
                    <label className={`text-sm font-bold mb-2 block ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>اختر الفرع للاستلام *</label>
                    <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto scrollbar-hide">
                      {branches.map((branch) => (
                        <button
                          key={branch.id}
                          type="button"
                          onClick={() => { setSelectedBranch(branch.id); setValidationErrors(prev => ({...prev, branch: ""})); }}
                          className={`text-start p-4 border rounded-xl transition-all ${
                            selectedBranch === branch.id
                              ? (isDarkSolid ? 'bg-primary-900/20 border-primary-500' : 'bg-primary-50 border-primary-500')
                              : (isDarkSolid ? 'bg-[#111] border-[#333] hover:border-surface-600' : 'bg-white border-surface-200 hover:border-surface-300')
                          }`}
                        >
                          <div className="flex items-center gap-3 mb-1">
                            <div className={`w-4 h-4 shrink-0 rounded-full border-2 flex items-center justify-center ${selectedBranch === branch.id ? 'border-primary-500' : (isDarkSolid ? 'border-surface-600' : 'border-surface-300')}`}>
                              {selectedBranch === branch.id && <div className="w-2 h-2 rounded-full bg-primary-500" />}
                            </div>
                            <span className={`font-bold text-sm ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>{branch.name}</span>
                          </div>
                          {branch.address && (
                            <p className={`text-xs mt-1 me-7 ${isDarkSolid ? 'text-surface-400' : 'text-surface-500'}`}>{branch.address}</p>
                          )}
                        </button>
                      ))}
                    </div>
                    {validationErrors.branch && <p className="text-error-500 text-xs mt-1 font-bold">{validationErrors.branch}</p>}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className={`text-sm font-bold mb-1 block ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>الاسم كامل *</label>
                    <input name="customerName" className={`w-full p-3 border rounded-xl outline-none transition-colors ${validationErrors.customerName ? (isDarkSolid ? 'border-error-500 focus:border-error-500 bg-error-950/20 text-white' : 'border-error-500 focus:border-error-500 bg-error-50 text-surface-900') : (isDarkSolid ? 'bg-[#111] border-[#333] text-white focus:border-primary-500' : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900')}`} placeholder="اكتب اسمك كامل" />
                    {validationErrors.customerName && <p className="text-error-500 text-xs mt-1 font-bold">{validationErrors.customerName}</p>}
                  </div>
                  <div>
                    <label className={`text-sm font-bold mb-1 block ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>رقم الهاتف *</label>
                    <input name="customerPhone" type="tel" dir="ltr" className={`w-full p-3 border rounded-xl outline-none text-end transition-colors ${validationErrors.customerPhone ? (isDarkSolid ? 'border-error-500 focus:border-error-500 bg-error-950/20 text-white' : 'border-error-500 focus:border-error-500 bg-error-50 text-surface-900') : (isDarkSolid ? 'bg-[#111] border-[#333] text-white focus:border-primary-500' : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900')}`} placeholder="01xxxxxxxxx" />
                    {validationErrors.customerPhone && <p className="text-error-500 text-xs mt-1 font-bold">{validationErrors.customerPhone}</p>}
                  </div>
                  
                  {deliveryType === "DELIVERY" && (
                    <div>
                      <label className={`text-sm font-bold mb-1 block ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>العنوان التفصيلي *</label>
                      <textarea name="customerAddress" rows={2} className={`w-full p-3 border rounded-xl outline-none transition-colors ${validationErrors.customerAddress ? (isDarkSolid ? 'border-error-500 focus:border-error-500 bg-error-950/20 text-white' : 'border-error-500 focus:border-error-500 bg-error-50 text-surface-900') : (isDarkSolid ? 'bg-[#111] border-[#333] text-white focus:border-primary-500' : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900')}`} placeholder="الشارع، العمارة، الدور، الشقة..." />
                      {validationErrors.customerAddress && <p className="text-error-500 text-xs mt-1 font-bold">{validationErrors.customerAddress}</p>}
                    </div>
                  )}

                  <div>
                    <label className={`text-sm font-bold mb-1 block ${isDarkSolid ? 'text-white' : 'text-surface-950'}`}>ملاحظات إضافية (اختياري)</label>
                    <textarea name="notes" rows={2} className={`w-full p-3 border rounded-xl outline-none transition-colors ${isDarkSolid ? 'bg-[#111] border-[#333] text-white focus:border-primary-500' : 'bg-white border-surface-200 focus:border-primary-500 text-surface-900'}`} placeholder="أي تفاصيل إضافية للطلب..." />
                  </div>
                </div>

              </form>
            )
          )}
        </div>

        {/* Footer */}
        {items.length > 0 && (
          <div className={`p-4 border-t space-y-4 ${isDarkSolid ? 'bg-[#111] border-[#222]' : 'bg-surface-50 border-surface-200'}`}>
            
            <div className="space-y-2">
              <div className={`flex justify-between text-sm ${isDarkSolid ? 'text-surface-400' : 'text-surface-600'}`}>
                <span>المجموع</span>
                <span>{formatPrice(total, store?.currency)}</span>
              </div>
              {deliveryType === "DELIVERY" && deliveryFee > 0 && (
                <div className={`flex justify-between text-sm ${isDarkSolid ? 'text-surface-400' : 'text-surface-600'}`}>
                  <span>رسوم التوصيل</span>
                  <span>{formatPrice(deliveryFee, store?.currency)}</span>
                </div>
              )}
              <div className={`flex justify-between font-bold text-lg pt-2 border-t ${isDarkSolid ? 'border-[#333] text-white' : 'border-surface-200 text-surface-950'}`}>
                <span>الإجمالي النهائي</span>
                <span style={{ color: primaryColor }}>{formatPrice(finalTotal, store?.currency)}</span>
              </div>
            </div>

            {!isCheckout ? (
              <button 
                onClick={() => setIsCheckout(true)}
                className={`w-full py-4 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 hover:opacity-90 ${isDarkSolid ? 'text-black' : 'text-white'}`}
                style={{ backgroundColor: primaryColor }}
              >
                <ShoppingBag className="w-5 h-5" />
                المتابعة لإتمام الطلب
              </button>
            ) : (
              <div className="flex gap-2">
                <button 
                  type="button"
                  onClick={() => setIsCheckout(false)}
                  className={`px-6 py-4 font-bold rounded-2xl transition-colors ${isDarkSolid ? 'bg-[#222] hover:bg-[#333] text-white' : 'bg-surface-200 hover:bg-surface-300 text-surface-700'}`}
                >
                  رجوع
                </button>
                <button 
                  type="submit"
                  form="checkout-form"
                  disabled={isSubmitting}
                  className={`flex-1 py-4 font-bold rounded-2xl transition-colors flex items-center justify-center gap-2 disabled:opacity-50 hover:opacity-90 ${isDarkSolid ? 'text-black' : 'text-white'}`}
                  style={{ backgroundColor: primaryColor }}
                >
                  {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
                  {isSubmitting ? "جاري الإرسال..." : "تأكيد وإرسال الطلب"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
