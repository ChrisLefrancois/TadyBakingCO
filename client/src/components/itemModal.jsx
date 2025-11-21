import React, { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";

export default function ItemModal({ item, onClose }) {
  const containerRef = useRef(null);
  const { addToCart } = useCart();

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  useEffect(() => {
    const btn = containerRef.current?.querySelector("button.add-btn");
    btn?.focus();
  }, []);

  if (!item) return null;

  const tiers = [...(item.pricingTiers || [])].sort((a, b) => a.quantity - b.quantity);

  // 🔥 Fly-to-cart animation function
  const runFlyAnimation = (sourceBtn) => {
    const cartIcon = document.querySelector(".cart-target");
    if (!cartIcon) return;

    const floating = document.createElement("div");
    floating.className =
      "fixed w-6 h-6 rounded-full bg-[#b67c5a] shadow-xl z-50 pointer-events-none";
    document.body.appendChild(floating);

    const start = sourceBtn.getBoundingClientRect();
    floating.style.left = start.left + "px";
    floating.style.top = start.top + "px";

    const end = cartIcon.getBoundingClientRect();

    floating.animate(
      [
        { transform: "translate(0,0)", opacity: 1 },
        {
          transform: `translate(${end.left - start.left}px, ${end.top - start.top}px) scale(0.2)`,
          opacity: 0.2,
        },
      ],
      {
        duration: 650,
        easing: "cubic-bezier(.17,.67,.83,.67)",
      }
    );

    setTimeout(() => floating.remove(), 700);
  };

  // Add to cart + animation
  const handleAdd = (qty, price, e) => {
    const unitPrice = price / qty;
    const totalPrice = price;

    addToCart(item, qty, unitPrice, totalPrice);

    // Run animation from clicked button
    runFlyAnimation(e.target);

    onClose();
  };

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        className="bg-[#fbf1e5] border border-[#806154] rounded-3xl shadow-xl max-w-lg w-full p-6 relative text-center font-petitcochon text-[#806154] mx-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#806154] text-2xl font-bold"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-lazydog font-bold mb-1 text-[#806154]">
          {item.name}
        </h2>

        {/* Image + Details */}
        <div className="flex items-center justify-center gap-4">
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-40 h-40 object-contain mx-auto mb-4"
          />

          <div className="text-left">
            {item.description && (
              <p className="text-sm font-theseasons mb-3">{item.description}</p>
            )}

            {/* Bundle includes list */}
            {item.type === "bundle" &&
              item.itemsIncluded?.length > 0 &&
              item.itemsIncluded[0]?.item && (
                <ul className="text-xs font-theseasons mb-3 list-disc list-inside">
                  {item.itemsIncluded.map((inc, i) => (
                    <li key={i}>
                      {inc.quantity} × {inc.item.name}
                    </li>
                  ))}
                </ul>
              )}
          </div>
        </div>

        {/* --- Buttons Section --- */}
        {item.type !== "bundle" ? (
          <div className="flex flex-wrap justify-center gap-4 mt-4">
            {tiers.map((t, i) => (
              <button
                key={i}
                className="add-btn bg-[#e5cbc7] text-[#4b2e24] font-bold rounded-xl px-5 py-2 shadow-md hover:scale-105 transition"
                onClick={(e) => handleAdd(t.quantity, t.price, e)}
              >
                ADD {t.quantity} — ${t.price.toFixed(2)}
              </button>
            ))}
          </div>
        ) : (
          // 🧺 Bundle Add Button
          <button
            className="add-btn bg-[#e5cbc7] text-[#4b2e24] font-bold rounded-xl px-6 py-2 mt-6 shadow-md hover:scale-105 transition"
            onClick={(e) => handleAdd(1, item.bundlePrice, e)}
          >
            ADD BUNDLE — ${item.bundlePrice.toFixed(2)}
          </button>
        )}

        <p className="mt-6 text-xs text-[#5b3c2f]">
        Please note that all our bakery products contain Milk, Eggs, and Flour and are made  in a shared kitchen that may include other allergens.
        </p>
      </div>
    </div>
  );
}
