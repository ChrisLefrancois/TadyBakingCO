import React, { useEffect, useRef } from "react";
import { useCart } from "../context/CartContext";

export default function ItemModal({ item, onClose, onAdd }) {
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

  // sort pricing tiers (lowest quantity first)
  const tiers = [...(item.pricingTiers || [])].sort((a, b) => a.quantity - b.quantity);

  // helper to compute save (if any) for single items
  const calcSave = (qty, packPrice) => {
    const singleTier = tiers.find((t) => t.quantity === 1);
    const singlePrice = singleTier ? singleTier.price : 0;
    const saved = singlePrice * qty - packPrice;
    return saved > 0 ? saved : 0;
  };

  // 🆕 helper to compute save for bundles
  const getBundleSaveAmount = (bundle) => {
    if (bundle.type !== "bundle" || !bundle.bundleItems?.length) return 0;

    // Calculate total of individual prices if bought separately
    const totalIndividualPrice = bundle.bundleItems.reduce((sum, bi) => {
      if (!bi.item?.pricingTiers) return sum;
      const singleTier = bi.item.pricingTiers.find((t) => t.quantity === 1);
      if (!singleTier) return sum;
      return sum + singleTier.price * (bi.quantity || 1);
    }, 0);

    const saved = totalIndividualPrice - (bundle.bundlePrice ?? 0);
    return saved > 0 ? saved : 0;
  };

  const handleAdd = (qty, packPrice) => {
    const unitPrice = packPrice / qty;
    const totalPrice = packPrice;

    // ✅ match your current context definition
    addToCart(item, qty, unitPrice, totalPrice);

    onClose();
  };



  const bundleSave = item.type === "bundle" ? getBundleSaveAmount(item) : 0;

  return (
    <div
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        className="bg-[#fbf1e5] border border-[#806154] rounded-3xl shadow-xl max-w-lg w-full p-6 relative text-center font-petitcochon text-[#806154] mx-4"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-[#806154] text-2xl font-bold"
          aria-label="Close"
        >
          ×
        </button>

        {/* Title */}
        <h2 className="text-2xl font-lazydog font-bold mb-1 text-[#806154]">{item.name}</h2>

        {/* 🆕 Bundle Save Banner (if bundle) */}
        {bundleSave > 0 && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-[#f6ddd3] text-[#7c4a3a] px-4 py-1 rounded-full font-bold text-sm rotate-[-3deg] shadow-sm">
            SAVE ${bundleSave.toFixed(2)}
          </div>
        )}

        <div className="flex items-center justify-center gap-4">
          {/* Image */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-40 h-40 object-contain mx-auto mb-4"
          />

          <div className="text-left">
            {/* Description */}
            {item.description && (
              <p className="text-sm font-theseasons mt-1 mb-3 text-[#806154]">
                {item.description}
              </p>
            )}

            {/* Bundle info */}
            {item.type === "bundle" && item.itemsIncluded?.length > 0 && (
              <ul className="text-xs font-theseasons mb-3 text-[#806154] list-disc list-inside">
                {item.itemsIncluded.map((included, i) => (
                  <li key={i}>{included}</li>
                ))}
              </ul>
            )}

            {/* Base price */}
            {tiers.length > 0 && (
              <p className="font-bold font-theseasons mb-6 text-[#806154]">
                CAD ${tiers[0].price.toFixed(2)} ea
              </p>
            )}
          </div>
        </div>

        {/* Button Row */}
        {item.type !== "bundle" && (
          <div className="flex justify-center items-center gap-4 flex-wrap mt-2">
            {tiers.map((t, i) => {
              const saved = calcSave(t.quantity, t.price);
              return (
                <div key={i} className="relative inline-block">
                  {saved > 0 && (
                    <span className="absolute -top-1 left-6 -translate-x-1/2 text-xs bg-[#f6ddd3] text-[#7c4a3a] px-2 py-[2px] rounded-full font-bold rotate-[-8deg] shadow-sm">
                      SAVE ${saved.toFixed(2)}
                    </span>
                  )}

                  <button
                    onClick={() => handleAdd(t.quantity, t.price)}
                    className="add-btn font-petitcochon bg-[#e5cbc7] text-[#4b2e24] font-bold rounded-[18px] px-5 py-2 mt-4 shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-[#c5a99a]"
                  >
                    ADD {t.quantity} — ${t.price.toFixed(2)}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* 🆕 For bundles — single “Add Bundle” button */}
        {item.type === "bundle" && (
          <button
            onClick={() => handleAdd(1, item.bundlePrice)}
            className="add-btn font-petitcochon bg-[#e5cbc7] text-[#4b2e24] font-bold rounded-[18px] px-6 py-2 mt-6 shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-[#c5a99a]"
          >
            ADD BUNDLE — ${item.bundlePrice.toFixed(2)}
          </button>
        )}

        {/* Footer */}
        <p className="mt-6 text-xs leading-snug text-[#5b3c2f] max-w-sm mx-auto">
          Note: products are made in a kitchen with common allergens (milk, eggs, wheat, nuts).
        </p>
      </div>
    </div>
  );
}
