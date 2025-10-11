import React, { useEffect, useRef } from "react";

export default function ItemModal({ item, onClose, onAdd }) {
  const containerRef = useRef(null);

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

  const tiers = [
    { qty: 1, price: item.priceSingle },
    { qty: 6, price: item.priceSixPack },
    { qty: 12, price: item.priceTwelvePack },
  ].filter(t => t.price !== undefined && t.price !== null);

  const calcSave = (qty, packPrice) => {
    const single = item.priceSingle ?? 0;
    const saved = single * qty - packPrice;
    return saved > 0 ? saved : 0;
  };

  const handleAdd = (qty, packPrice) => {
    const unitPrice = packPrice / qty;
    const totalPrice = packPrice;
    if (onAdd) onAdd({ item, qty, unitPrice, totalPrice });
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
        role="dialog"
        aria-modal="true"
        className="bg-[#fffaf7] border border-[#806154] rounded-3xl shadow-xl max-w-lg w-full p-6 relative text-center font-petitcochon text-[#806154] mx-4"
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
        <h2 className="text-2xl font-bold mb-1">{item.name}</h2>

        <div className="flex items-center">
           {/* Image */}
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-40 h-40 object-contain mx-auto mb-4"
          />

        <div>
          {/* Description */}
          {item.description && (
            <p className="text-sm mt-1 mb-3 text-[#5b3c2f]">{item.description}</p>
          )}

          <p className="font-bold mb-6 text-[#5b3c2f]">
            CAD ${item.priceSingle?.toFixed(2)} ea
          </p>
        </div>
        {/* Price */}
        </div>





        {/* Button Row */}
        <div className="flex justify-center items-center gap-4 flex-wrap">
          {tiers.map((t, i) => {
            const saved = calcSave(t.qty, t.price);
            return (
              <div key={i} className="relative inline-block">
                {saved > 0 && (
                  <span className="absolute -top-1 left-6 -translate-x-1/2 text-xs bg-[#f6ddd3] text-[#7c4a3a] px-2 py-[2px] rounded-full font-bold rotate-[-8deg] shadow-sm">
                    SAVE ${saved.toFixed(2)}
                  </span>
                )}

                <button
                  onClick={() => handleAdd(t.qty, t.price)}
                  className="add-btn bg-[#e5cbc7] text-[#4b2e24] font-bold rounded-[18px] px-5 py-2 mt-4 shadow-md hover:scale-105 transition focus:outline-none focus:ring-2 focus:ring-[#c5a99a]"
                >
                  ADD {t.qty} — ${t.price.toFixed(2)}
                </button>
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <p className="mt-6 text-xs leading-snug text-[#5b3c2f] max-w-sm mx-auto">
          Note: products are made in a kitchen with common allergens (milk,
          eggs, wheat, nuts).
        </p>
      </div>
    </div>
  );
}
