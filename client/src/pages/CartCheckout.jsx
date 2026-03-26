// src/pages/CartCheckout.jsx
import React, { useState, useEffect, useRef } from "react";
import { PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import axios from "axios";
import { useCart } from "../context/CartContext";
import { useNavigate } from "react-router-dom";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { buildPricingLines } from "../utils/pricing";

function loadGoogleMaps(apiKey) {
  return new Promise((resolve) => {
    if (window.google) return resolve();

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.onload = resolve;
    document.body.appendChild(script);
  });
}

export default function CheckoutPage() {
  const { cart, clearCart, removeFromCart } = useCart();
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const addressRef = useRef(null);

  const [loading, setLoading] = useState(false);

  const [blockedDates, setBlockedDates] = useState([]);


  const ALLOWED_CITIES = ["whitby", "ajax", "oshawa", "pickering", "scarborough"];

  // States
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
    note: ""
  });

  const TAX_RATE = 0.13;

  // Pricing display lines (ex: 7 loaf => 4 + 2 + 1)
  const pricingLines = buildPricingLines(cart);

  // Group by product only for tax logic
  const taxGroups = Object.values(
    cart.reduce((acc, p) => {
      const key = p.item._id;
      const lineTotal =
        typeof p.totalPrice === "number"
          ? p.totalPrice
          : (p.unitPrice || 0) * (p.qty || 0);

      if (!acc[key]) {
        acc[key] = {
          item: p.item,
          qty: 0,
          totalPrice: 0,
        };
      }

      acc[key].qty += p.qty || 0;
      acc[key].totalPrice += lineTotal;

      return acc;
    }, {})
  );

  const subtotal = pricingLines.reduce(
    (sum, p) => sum + (p.totalPrice || 0),
    0
  );

  // Tax-free when total qty for that product is 6+
  const taxableItemsSubtotal = taxGroups.reduce((sum, p) => {
    return p.qty >= 6 ? sum : sum + p.totalPrice;
  }, 0);

  const deliveryFee =
    form.fulfillmentMethod === "delivery"
      ? subtotal < 45
        ? 5.99
        : 0
      : 0;

  const tax =
    Math.round((taxableItemsSubtotal + deliveryFee) * TAX_RATE * 100) / 100;

  const total = Math.round((subtotal + deliveryFee + tax) * 100) / 100;


  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // Google Autocomplete
  useEffect(() => {

    async function loadBlockedDates() {
      try {
        const res = await axios.get(
          `${import.meta.env.VITE_API_BASE}/api/blackout`
        );

        // backend sends [{ date: "2025-01-15", reason: "Holiday" }, ...]
        setBlockedDates(res.data.map((d) => d.date));
      } catch (err) {
        console.error("Failed to load blocked dates:", err);
      }
    }

    loadBlockedDates();
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

        // Delivery zone validation
        if (form.fulfillmentMethod === "delivery") {
          const isAllowed = ALLOWED_CITIES.includes(city.toLowerCase());

          if (!isAllowed) {
            alert(
              "❌ Delivery is only available in Ajax, Whitby, Oshawa, Pickering, or Scarborough."
            );

            setForm((prev) => ({
              ...prev,
              deliveryAddress: "",
              city: "",
              province: "",
              postalCode: "",
            }));
            return;
          }
        }

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

  // Min date (48 hours ahead)
  const minDate = new Date(Date.now() + 48 * 60 * 60 * 1000);

  // Time options
  const timeOptions = [];
  for (let hour = 10; hour <= 18; hour++) {
    timeOptions.push(
      `${hour.toString().padStart(2, "0")}:00`,
      `${hour.toString().padStart(2, "0")}:30`
    );
  }

  // Validate date/time
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

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Block invalid city
    if (form.fulfillmentMethod === "delivery") {
      const isAllowed = ALLOWED_CITIES.includes(form.city.toLowerCase());
      if (!isAllowed) {
        alert(
          "❌ Delivery is only available in Ajax, Whitby, Oshawa, Pickering, or Scarborough."
        );
        return;
      }
    }

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

      // Format timestamp for backend
      const localISO = new Date(
        scheduled.getTime() - scheduled.getTimezoneOffset() * 60000
      )
        .toISOString()
        .slice(0, 16) + ":00";

      // POST order (NOW SECURED)
      const res = await axios.post(
        `${import.meta.env.VITE_API_BASE}/api/orders`,
        {
          items: pricingLines.map((p) => ({
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
          note: form.note,
          scheduledFor: localISO,
        },
        {
          headers: {
            "x-api-key": import.meta.env.VITE_ORDER_API_KEY,
          },
        }
      );

      clearCart();
      navigate(`/order-confirmation/${res.data._id}`);
    } catch (err) {
      console.error("Order save error:", err);

      if (err.response) {
        console.error("🔥 SERVER ERROR RESPONSE:", err.response.data);
        alert("SERVER ERROR:\n" + JSON.stringify(err.response.data, null, 2));
      } else {
        alert("Unknown error: " + err.message);
      }
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

        <textarea
          type="text"
          name="note"
          placeholder="Note"
          value={form.note}
          onChange={handleChange}
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
          Available daily from <strong>10:00 AM to 6:00 PM</strong>. Orders must be placed at least <strong>48 hours</strong> in advance.
        </p>

        <DatePicker
          selected={date}
          onChange={(dt) => setDate(dt)}
          minDate={minDate}
          filterDate={(d) => {
            const iso = d.toISOString().slice(0, 10);

            // block admin blackout dates
            if (blockedDates.includes(iso)) return false;

            return true;
          }}
          dateFormat="yyyy-MM-dd"
          className="w-full border border-[#e5cbc7] rounded-lg px-3 py-2"
        />


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

      {/* --- PRICE BREAKDOWN SECTION --- */}
      <div className="border rounded-2xl p-4 bg-[#fbf1e5] text-[#4b2e24] space-y-4">

      <h3 className="text-lg font-bold">Order Summary</h3>

      {/* Items */}
      {pricingLines.map((p, index) => (
        <div
          key={`${p.item._id}-${p.tierQuantity}-${index}`}
          className="flex justify-between items-center border-b pb-2"
        >
          <div>
            <p className="font-semibold">
              {p.qty} × {p.item.name}
            </p>
            <p className="text-sm opacity-70">
              ${p.totalPrice.toFixed(2)}
            </p>
          </div>

          <button
            type="button"
            className="text-red-600 font-bold text-xl hover:scale-110 transition"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              removeFromCart(p.item._id, p.qty);
            }}
          >
            ×
          </button>
        </div>
      ))}

      {/* Subtotal */}
      <div className="flex justify-between text-md">
        <span>Subtotal</span>
        <span>${subtotal.toFixed(2)}</span>
      </div>

      {/* Delivery fee */}
      <div className="flex justify-between text-md">
        <span>Delivery</span>
        <span>
          {form.fulfillmentMethod === "delivery"
            ? deliveryFee === 0
              ? "Free"
              : `$${deliveryFee.toFixed(2)}`
            : "$0.00"}
        </span>
      </div>

      {/* Taxes */}
      <div className="flex justify-between text-md">
        <span>Tax (13%)</span>
        <span>${tax.toFixed(2)}</span>
      </div>

      <hr />

      {/* TOTAL */}
      <div className="flex justify-between text-xl font-bold">
        <span>Total</span>
        <span>${total.toFixed(2)}</span>
      </div>
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
