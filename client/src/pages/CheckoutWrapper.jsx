// src/pages/CheckoutWrapper.jsx
import React, { useEffect, useState } from "react";
import { Elements } from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import axios from "axios";
import CheckoutPage from "./CartCheckout";
import { useCart } from "../context/CartContext";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

export default function CheckoutWrapper() {
  const { cart } = useCart();
  const [clientSecret, setClientSecret] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    async function createIntent() {
      // No items? Nothing to pay for.
      if (!cart || cart.length === 0) {
        setErrorMsg("Your cart is empty.");
        setLoading(false);
        return;
      }

      try {
        // Only send what's needed for the amount calculation
        const body = {
          items: cart.map((p) => ({
            unitPrice: p.unitPrice,
            qty: p.qty,
          })),
          // default assumption for now; the UI will still let them pick
          fulfillmentMethod: "pickup",
        };

        const res = await axios.post(
          `${import.meta.env.VITE_API_BASE}/api/orders/create-payment-intent`,
          body
        );

        setClientSecret(res.data.clientSecret);
      } catch (err) {
        console.error("❌ Error creating PaymentIntent:", err.response?.data || err);
        setErrorMsg("Unable to initialize payment. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    createIntent();
  }, [cart]);

  if (loading) {
    return <p className="text-center mt-10">Loading payment…</p>;
  }

  if (errorMsg) {
    return <p className="text-center text-red-600 mt-10">{errorMsg}</p>;
  }

  if (!clientSecret) {
    return (
      <p className="text-center text-red-600 mt-10">
        Unable to initialize payment.
      </p>
    );
  }

  return (
    <Elements
      stripe={stripePromise}
      options={{ clientSecret }}
      key={clientSecret} // important so Stripe remounts on change
    >
      {/* 🔑 pass clientSecret to the checkout page */}
      <CheckoutPage clientSecret={clientSecret} />
    </Elements>
  );
}
