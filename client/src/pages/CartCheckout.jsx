import React from "react";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { Link } from "react-router-dom";

export default function CheckoutPage() {
  const { cart, removeFromCart, totalPrice } = useCart();

  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center py-10 px-4">
      <h1 className="font-petitcochon text-[#4b2e24] text-3xl mb-6">
        Your Order Summary
      </h1>

      {cart.length === 0 ? (
        <div className="text-center text-[#4b2e24]">
          <p>Your bag is empty 🥺</p>
          <Link
            to="/items"
            className="mt-4 inline-block bg-[#b67c5a] text-[#fbf1e5] font-bold px-6 py-2 rounded-full hover:scale-105 transition"
          >
            Browse Products
          </Link>
        </div>
      ) : (
        <div className="w-full max-w-3xl bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6">
          {/* Product List */}
          <div className="divide-y divide-[#e5cbc7]">
            {cart.map((p, i) => {
              const safeUnit = typeof p.unitPrice === "number" ? p.unitPrice : 0;
              const safeTotal = typeof p.totalPrice === "number" ? p.totalPrice : safeUnit * p.qty;

              return (
                <div
                  key={i}
                  className="flex items-center justify-between py-4 flex-wrap"
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={p.item.imageUrl}
                      alt={p.item.name}
                      className="w-20 h-20 object-contain rounded-lg border border-[#e5cbc7]"
                    />
                    <div>
                      <h2 className="font-petitcochon text-lg text-[#4b2e24]">
                        {p.item.name}
                      </h2>
                      <p className="text-sm text-[#806154]">
                        {p.qty} × ${safeUnit.toFixed(2)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <p className="text-[#4b2e24] font-bold">
                      ${safeTotal.toFixed(2)}
                    </p>
                    <button
                      onClick={() => removeFromCart(p.item._id, p.unitPrice)}
                      className="text-[#b67c5a] hover:text-[#7c4a3a] transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Summary */}
          <div className="border-t border-[#e5cbc7] mt-6 pt-4 text-right">
            <p className="text-[#4b2e24] font-bold text-xl">
              Total: ${(totalPrice || 0).toFixed(2)}
            </p>
          </div>

          {/* Checkout Buttons */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Link
              to="/items"
              className="bg-[#e5cbc7] text-[#4b2e24] px-6 py-2 rounded-full font-bold hover:scale-105 transition"
            >
              Continue Shopping
            </Link>

            <button
              onClick={() => alert("Checkout feature coming soon!")}
              className="bg-[#b67c5a] text-[#fbf1e5] px-6 py-2 rounded-full font-bold hover:scale-105 transition"
            >
              Place Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
