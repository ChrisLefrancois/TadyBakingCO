// src/pages/CartCheckout.jsx
import React, { useState } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";

export default function CheckoutPage({ clientSecret }) {
  const { cart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
  });

  // Totals
  const TAX_RATE = 0.13;
  const subtotal = cart.reduce(
    (sum, p) => sum + (p.totalPrice || p.unitPrice * p.qty),
    0
  );
  const deliveryFee =
    form.fulfillmentMethod === "delivery" ? (subtotal < 45 ? 5.99 : 0) : 0;
  const tax = Math.round(subtotal * TAX_RATE * 100) / 100;
  const total = Math.round((subtotal + tax + deliveryFee) * 100) / 100;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Submit payment
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    if (!clientSecret) {
      alert("Payment is not initialized yet.");
      return;
    }

    setLoading(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          payment_method_data: {
            billing_details: {
              name: form.name,
              email: form.email,
              phone: form.phone,
            },
          },
        },
        redirect: "if_required",
      });

      console.log("Stripe confirmPayment returned:", { error, paymentIntent });

      // ❌ Payment failed
      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }
      console.log("Saving order…");
      // ✅ NO ERROR → payment was successful or is processing → treat as success
      try {
        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/orders`,
          {
            items: cart.map((p) => ({
              itemId: p.item._id,
              name: p.item.name,
              qty: p.qty,
              unitPrice: p.unitPrice,
              totalPrice: p.totalPrice,
            })),
            subtotal,
            tax,
            deliveryFee,
            total,
            fulfillmentMethod: form.fulfillmentMethod,
            deliveryAddress:
              form.fulfillmentMethod === "delivery"
                ? form.deliveryAddress
                : "",
            customerName: form.name,
            customerEmail: form.email,
            customerPhone: form.phone,
            stripePaymentIntentId: paymentIntent?.id,
          }
        );

        console.log("ORDER SAVED SUCCESSFULLY:", res.data);
        // ✔ Clear cart and redirect
        clearCart();
        navigate(`/order-confirmation/${res.data._id}`);

      } catch (err) {
        console.error("ORDER SAVE ERROR >>>", err);
        alert("Order save failed: " + (err.response?.data?.error || err.message));
      }

    } catch (err) {
      console.error("Payment exception:", err);
      alert("Something went wrong while processing your payment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-3xl shadow space-y-5"
    >
      <h2 className="text-2xl font-bold text-[#4b2e24]">Checkout</h2>

      {/* Customer Info */}
      <div className="space-y-4">
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        />

        <input
          type="email"
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        />

        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        />
      </div>

      {/* Pickup/Delivery */}
      <div className="space-y-2">
        <label>
          <input
            type="radio"
            name="fulfillmentMethod"
            value="pickup"
            checked={form.fulfillmentMethod === "pickup"}
            onChange={handleChange}
          />
          <span className="ml-1">Pickup</span>
        </label>

        <label className="ml-4">
          <input
            type="radio"
            name="fulfillmentMethod"
            value="delivery"
            checked={form.fulfillmentMethod === "delivery"}
            onChange={handleChange}
          />
          <span className="ml-1">Delivery</span>
        </label>

        {form.fulfillmentMethod === "delivery" && (
          <input
            type="text"
            name="deliveryAddress"
            placeholder="Delivery Address"
            value={form.deliveryAddress}
            onChange={handleChange}
            required
            className="block w-full border border-[#e5cbc7] rounded-lg px-3 py-2 mt-2"
          />
        )}
      </div>

      {/* Payment */}
      <PaymentElement className="mt-6" />

      {/* Pay button */}
      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-[#b67c5a] text-white w-full py-3 rounded-full font-bold hover:scale-105 transition disabled:opacity-60 disabled:hover:scale-100"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
