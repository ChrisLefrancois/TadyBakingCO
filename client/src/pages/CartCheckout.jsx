import React, { useState, useMemo } from "react";
import { useCart } from "../context/CartContext";
import { Trash2 } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { motion, AnimatePresence } from "framer-motion";

export default function CheckoutPage() {
  const { cart, removeFromCart, clearCart } = useCart();
  const navigate = useNavigate();

  const TAX_RATE = 0.13;

  const [form, setForm] = useState({
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    customerName: "",
    customerEmail: "",
    customerPhone: "",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // 🧾 Compute subtotal
  const subtotal = useMemo(
    () =>
      cart.reduce(
        (sum, p) =>
          sum +
          (typeof p.totalPrice === "number" ? p.totalPrice : p.unitPrice * p.qty),
        0
      ),
    [cart]
  );

  // 🚚 Compute delivery fee
  const deliveryFee =
    form.fulfillmentMethod === "delivery" ? (subtotal < 45 ? 5.99 : 0) : 0;

  // 💰 Compute tax and total (rounding properly)
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    setIsSubmitting(true);

    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE || "http://localhost:5000"}/api/orders`,
        {
          items: cart.map((p) => ({
            name: p.item.name,
            qty: p.qty,
            unitPrice: p.unitPrice,
            totalPrice: p.totalPrice,
          })),
          subtotal,
          tax,
          fulfillmentMethod: form.fulfillmentMethod,
          deliveryAddress:
            form.fulfillmentMethod === "delivery" ? form.deliveryAddress : "",
          deliveryDistanceKm: 0,
          customerName: form.customerName,
          customerEmail: form.customerEmail,
          customerPhone: form.customerPhone,
        }
      );

      // ✅ Success animation then redirect
      setShowSuccess(true);
      clearCart();
      setTimeout(() => {
        navigate(`/order-confirmation/${res.data._id}`);
      }, 1800);
    } catch (err) {
      console.error("❌ Order submission failed:", err);
      alert("Something went wrong while submitting your order.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center py-10 px-4 relative overflow-hidden">
      <h1 className="font-petitcochon text-[#4b2e24] text-3xl mb-6">Checkout</h1>

      {/* ✅ Success Overlay */}
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-[#fbf1e5]/90 backdrop-blur-sm z-50 overflow-hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            {/* 🍪 Confetti crumbs */}
            {[...Array(25)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-2 h-2 rounded-full bg-[#b67c5a]"
                initial={{
                  x: 0,
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                animate={{
                  x: Math.random() * 600 - 300,
                  y: Math.random() * 600 - 300,
                  opacity: 0,
                  scale: Math.random() * 1.2,
                }}
                transition={{
                  duration: 2.2,
                  ease: "easeOut",
                  delay: Math.random() * 0.4,
                }}
              />
            ))}

            {/* 🎉 Success message */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.4 }}
              className="bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-8 text-center font-petitcochon text-[#4b2e24] relative z-10"
            >
              <h2 className="text-2xl font-bold mb-2">🎉 Order Placed!</h2>
              <p className="text-lg">Thank you for your purchase 💛</p>
              <p className="text-sm text-[#806154] mt-2">
                Redirecting to confirmation page...
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>


      {/* 🧾 Form */}
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
        <form
          onSubmit={handleSubmit}
          className="w-full max-w-3xl bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6 space-y-6"
        >
          {/* 🧺 Cart Summary */}
          <div className="divide-y divide-[#e5cbc7]">
            {cart.map((p, i) => (
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
                      {p.qty} × ${p.unitPrice.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <p className="text-[#4b2e24] font-bold">
                    ${p.totalPrice.toFixed(2)}
                  </p>
                  <button
                    type="button"
                    onClick={() => removeFromCart(p.item._id, p.unitPrice)}
                    className="text-[#b67c5a] hover:text-[#7c4a3a] transition"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 💳 Customer Info */}
          <div className="space-y-4 font-theseasons">
            <h2 className="text-xl font-bold text-[#4b2e24]">Customer Info</h2>
            <input
              required
              type="text"
              name="customerName"
              placeholder="Full Name"
              value={form.customerName}
              onChange={handleChange}
              className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
            />
            <input
              required
              type="email"
              name="customerEmail"
              placeholder="Email"
              value={form.customerEmail}
              onChange={handleChange}
              className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
            />
            <input
              required
              type="tel"
              name="customerPhone"
              placeholder="Phone Number"
              value={form.customerPhone}
              onChange={handleChange}
              className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
            />
          </div>

          {/* 🏠 Fulfillment */}
          <div className="space-y-3 font-theseasons">
            <h2 className="text-xl font-bold text-[#4b2e24]">Pickup or Delivery</h2>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  value="pickup"
                  checked={form.fulfillmentMethod === "pickup"}
                  onChange={handleChange}
                />
                Pickup
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="radio"
                  name="fulfillmentMethod"
                  value="delivery"
                  checked={form.fulfillmentMethod === "delivery"}
                  onChange={handleChange}
                />
                Delivery
              </label>
            </div>

            {form.fulfillmentMethod === "delivery" && (
              <input
                required
                type="text"
                name="deliveryAddress"
                placeholder="Delivery Address"
                value={form.deliveryAddress}
                onChange={handleChange}
                className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
              />
            )}
          </div>

          {/* 🧾 Summary */}
          <div className="border-t border-[#e5cbc7] mt-6 pt-4 text-right font-petitcochon space-y-1">
            <p className="text-[#4b2e24] text-lg">
              Subtotal: ${subtotal.toFixed(2)}
            </p>
            <p className="text-[#4b2e24] text-lg">HST (13%): ${tax.toFixed(2)}</p>
            {form.fulfillmentMethod === "delivery" && (
              <p className="text-[#4b2e24] text-lg">
                Delivery Fee: ${deliveryFee.toFixed(2)}
              </p>
            )}
            <p className="text-[#4b2e24] font-bold text-2xl mt-2">
              Total: ${total.toFixed(2)}
            </p>
          </div>

          {/* ✅ Submit */}
          <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
            <Link
              to="/items"
              className="bg-[#e5cbc7] text-[#4b2e24] px-6 py-2 rounded-full font-bold hover:scale-105 transition"
            >
              Continue Shopping
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`bg-[#b67c5a] text-[#fbf1e5] px-6 py-2 rounded-full font-bold hover:scale-105 transition ${
                isSubmitting ? "opacity-60 cursor-not-allowed" : ""
              }`}
            >
              {isSubmitting ? "Placing Order..." : "Place Order"}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
