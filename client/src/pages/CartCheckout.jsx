// src/pages/CartCheckout.jsx
import React, { useState, useEffect, useRef } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve) => {
    if (window.google) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

export default function CheckoutPage({ clientSecret }) {
  const { cart, clearCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const addressRef = useRef(null);

  const [loading, setLoading] = useState(false);

  // ----------- NEW STATES -----------
  const [date, setDate] = useState(null);
  const [time, setTime] = useState("");
  const [validationMsg, setValidationMsg] = useState("");

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    fulfillmentMethod: "pickup",
    deliveryAddress: "",
    city: "",
    province: "",
    postalCode: "",
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

  // ---------- GOOGLE AUTOCOMPLETE ----------
  useEffect(() => {
    async function initAutocomplete() {
      await loadGoogleMaps(import.meta.env.VITE_GOOGLE_MAPS_API_KEY);

      if (!addressRef.current) return;

      const autocomplete = new window.google.maps.places.Autocomplete(
        addressRef.current,
        {
          componentRestrictions: { country: "ca" },
          types: ["address"],
        }
      );

      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.address_components) return;

        const comp = place.address_components;

        const city =
          comp.find((c) => c.types.includes("locality"))?.long_name || "";
        const province =
          comp.find((c) =>
            c.types.includes("administrative_area_level_1")
          )?.short_name || "";
        const postalCode =
          comp.find((c) => c.types.includes("postal_code"))?.long_name || "";

        setForm((prev) => ({
          ...prev,
          deliveryAddress: place.formatted_address,
          city,
          province,
          postalCode,
        }));
      });
    }

    if (form.fulfillmentMethod === "delivery") {
      initAutocomplete();
    }
  }, [form.fulfillmentMethod]);

  // ---------- ⏳ DATE LIMITS (24 hours ahead) ----------
  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);


  // ---------- 🕑 TIME OPTIONS (10:00 AM – 6:00 PM) ----------
  const timeOptions = [];
  for (let hour = 10; hour <= 18; hour++) {
    timeOptions.push(
      `${hour.toString().padStart(2, "0")}:00`,
      `${hour.toString().padStart(2, "0")}:30`
    );
  }

  // ---------- VALIDATE DATE + TIME BEFORE PAYMENT ----------
  const validateScheduledFor = () => {
    if (!date || !time) {
      setValidationMsg("Please select both a date and a time.");
      return false;
    }

    const [hourStr, minuteStr] = time.split(":");
    const scheduled = new Date(date);
    scheduled.setHours(Number(hourStr), Number(minuteStr), 0);

    const now = new Date();
    const diff = scheduled - now;

    if (diff < 48 * 60 * 60 * 1000) {
      setValidationMsg("Orders must be scheduled at least 48 hours in advance.");
      return false;
  }


    const hour = scheduled.getHours();
    const minute = scheduled.getMinutes();

    if (hour < 10 || hour > 18 || (hour === 18 && minute > 0)) {
      setValidationMsg("Time must be between 10:00 AM and 6:00 PM.");
      return false;
    }

    setValidationMsg("");
    return scheduled;
  };

  // ---------- SUBMIT ----------
  const handleSubmit = async (e) => {
    e.preventDefault();

    const scheduled = validateScheduledFor();
    if (!scheduled) return;

    if (!stripe || !elements) return;

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

      if (error) {
        alert(error.message);
        setLoading(false);
        return;
      }

      // Save order
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
          deliveryAddress: form.deliveryAddress,
          customerName: form.name,
          customerEmail: form.email,
          customerPhone: form.phone,
          stripePaymentIntentId: paymentIntent?.id,
          city: form.city,
          province: form.province,
          postalCode: form.postalCode,
          scheduledFor: scheduled.toISOString(),
        }
      );

      clearCart();
      navigate(`/order-confirmation/${res.data._id}`);
    } catch (err) {
      console.error("Order save error:", err);
      alert("Order saved failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-3xl shadow space-y-6"
    >
      <h2 className="text-2xl font-bold text-[#4b2e24]">Checkout</h2>

      {/* Customer Info */}
      <div className="space-y-3">
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

      {/* Pickup / Delivery */}
      <div className="space-y-3">
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

        {form.fulfillmentMethod === "delivery" && (
          <input
            type="text"
            name="deliveryAddress"
            ref={addressRef}
            placeholder="Delivery Address"
            value={form.deliveryAddress}
            onChange={handleChange}
            required
            className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
          />
        )}
      </div>

      {/* Date / Time */}
      <div className="space-y-2">
        <p className="text-sm text-[#4b2e24] font-semibold">
          Choose pickup time:
        </p>
        <p className="text-xs text-[#4b2e24]">
          Available daily from <strong>10:00 AM to 6:00 PM</strong>. Orders must be placed at least <strong>24 hours</strong> in advance.
        </p>

        {/* DATE PICKER */}
        <DatePicker
          selected={date}
          onChange={(dt) => setDate(dt)}
          minDate={minDate}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        />

        {/* TIME SELECT */}
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        >
          <option value="">Select time</option>
          {timeOptions.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {validationMsg && (
          <p className="text-red-600 text-sm">{validationMsg}</p>
        )}
      </div>

      <PaymentElement className="mt-6" />

      <button
        type="submit"
        disabled={!stripe || loading}
        className="bg-[#b67c5a] text-white w-full py-3 rounded-full font-bold hover:scale-105 transition"
      >
        {loading ? "Processing..." : `Pay $${total.toFixed(2)}`}
      </button>
    </form>
  );
}
