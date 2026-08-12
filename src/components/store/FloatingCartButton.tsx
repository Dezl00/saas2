"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";
import { formatPrice } from "@/lib/utils";

type Props = {
  currency?: string;
  primaryColor?: string | null;
  theme?: string | null;
};

export function FloatingCartButton({ currency = "EGP", primaryColor, theme }: Props) {
  const { items, total, setIsCartOpen } = useCart();
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isDarkSolid = theme === "dark_solid";

  if (totalQuantity === 0) return null;

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className={`fixed bottom-6 inset-x-0 mx-auto z-30 w-[90%] max-w-md h-14 rounded-2xl font-bold flex items-center justify-between px-5 animate-float-cart-in transition-transform ${isDarkSolid ? 'text-black' : 'text-white'}`}
      style={{
        backgroundColor: primaryColor || "var(--color-primary-600)",
      }}
    >
      <div className="flex items-center gap-2">
        <div className="relative">
          <ShoppingBag className="w-5 h-5" />
          <span className={`absolute -top-2 -end-2 w-5 h-5 rounded-full text-xs font-black flex items-center justify-center ${isDarkSolid ? 'bg-black' : 'bg-white'}`}
            style={{ color: primaryColor || "var(--color-primary-600)" }}
          >
            {totalQuantity}
          </span>
        </div>
        <span className="text-sm">عرض السلة</span>
      </div>
      <span className="text-sm font-black">{formatPrice(total, currency)}</span>
    </button>
  );
}
