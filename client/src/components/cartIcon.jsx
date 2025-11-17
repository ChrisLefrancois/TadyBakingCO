import React, { useState, useEffect, useRef } from "react";
import { ShoppingBag, Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function CartIcon() {
  const { cart, totalItems, totalPrice, removeFromCart } = useCart();
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // 🧠 Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  // 🧾 Handle navigation to cart (so dropdown closes cleanly)
  const handleViewCart = () => {
    setOpen(false);
    navigate("/cart");
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* 🛍 Main Icon */}
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="relative inline-flex items-center justify-center p-2 rounded-full hover:scale-110 transition"
        aria-label="Shopping cart"
      >
        <ShoppingBag size={26} className="text-[#fbf1e5]" />
        {totalItems > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#e5cbc7] text-[#4b2e24] text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow">
            {totalItems}
          </span>
        )}
      </button>

      {/* 🧈 Dropdown (animated) */}
      <div
        className={`absolute right-0 mt-3 z-[9999] w-72 transform transition-all duration-300 ease-out ${
          open
            ? "opacity-100 translate-y-0 visible"
            : "opacity-0 -translate-y-2 invisible pointer-events-none"
        }`}
      >
        {cart.length > 0 ? (
          <div className="bg-[#fbf1e5] border border-[#b67c5a] rounded-2xl shadow-xl p-4 z-50">
            <h3 className="font-petitcochon text-[#4b2e24] text-lg font-bold mb-2 text-center">
              Your Bag
            </h3>

            <div className="max-h-52 overflow-y-auto">
              {cart.map((p, i) => {
                const safeUnit =
                  typeof p.unitPrice === "number" ? p.unitPrice : 0;
                const safeTotal =
                  typeof p.totalPrice === "number"
                    ? p.totalPrice
                    : safeUnit * (p.qty || 1);

                return (
                  <div
                    key={i}
                    className="flex justify-between items-center py-2 border-b border-[#e5cbc7] last:border-none"
                  >
                    <div className="text-sm text-[#4b2e24]">
                      <p className="font-bold">{p.item.name}</p>
                      <p>
                        {p.qty} × ${safeUnit.toFixed(2)}
                      </p>
                    </div>
                    <button
                      onClick={() => removeFromCart(p.item._id, p.unitPrice)}
                      className="text-[#b67c5a] hover:text-[#7c4a3a] transition"
                      aria-label="Remove item"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                );
              })}
            </div>

            {/* Total + Link */}
            <div className="mt-3 border-t border-[#e5cbc7] pt-2 text-right">
              <p className="text-sm text-[#4b2e24] font-semibold">
                Total: ${(totalPrice || 0).toFixed(2)}
              </p>
            </div>

            <button
              onClick={handleViewCart}
              className="w-full mt-3 bg-[#b67c5a] text-[#fbf1e5] font-bold py-2 rounded-xl hover:scale-105 transition"
            >
              View Full Cart
            </button>
          </div>
        ) : (
          <div className="bg-[#fbf1e5] border border-[#b67c5a] rounded-2xl shadow-xl p-4 text-center text-[#4b2e24] font-petitcochon">
            <p>Your bag is empty 🥺</p>
          </div>
        )}
      </div>
    </div>
  );
}
