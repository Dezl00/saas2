"use client";

import { ShoppingBag } from "lucide-react";
import { useCart } from "./CartProvider";

export function CartHeaderButton({ theme, color }: { theme?: string | null, color?: string }) {
  const { items, setIsCartOpen } = useCart();
  
  const totalQuantity = items.reduce((sum, item) => sum + item.quantity, 0);
  const isDarkSolid = theme === "dark_solid";

  return (
    <button
      onClick={() => setIsCartOpen(true)}
      className="relative p-2 hover:opacity-80 transition-opacity flex items-center justify-center"
    >
      <ShoppingBag className="w-6 h-6" style={isDarkSolid && color ? { color } : { color: 'var(--color-surface-700)' }} />
      {totalQuantity > 0 && (
        <span className="absolute top-0 end-0 -mt-1 -me-1 w-5 h-5 rounded-full bg-error-500 text-white text-xs font-bold flex items-center justify-center animate-fade-in">
          {totalQuantity}
        </span>
      )}
    </button>
  );
}
