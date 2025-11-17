import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function OrderConfirmation() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order:", err);
        setError("Could not load order details.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  if (loading) return <p className="text-center mt-10 text-[#4b2e24]">Loading your order...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center py-10 px-4 font-petitcochon text-[#4b2e24]">
      <h1 className="text-3xl font-bold mb-4">Thank You for Your Order! 🎉</h1>

      <div className="bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6 w-full max-w-2xl text-left">
        <p className="text-lg font-semibold">Order ID: {order._id}</p>
        <p className="mt-2">Name: {order.customerName}</p>
        <p>Email: {order.customerEmail}</p>
        <p>Phone: {order.customerPhone}</p>
        <p className="mt-2">Fulfillment: {order.fulfillmentMethod}</p>
        {order.fulfillmentMethod === "delivery" && (
          <>
            <p>Delivery Address: {order.deliveryAddress}</p>
          </>
        )}

        <div className="mt-4 border-t border-[#e5cbc7] pt-4">
          <h2 className="text-xl font-semibold mb-2">Order Summary</h2>
          {order.items.map((item, i) => (
            <div key={i} className="flex justify-between text-sm">
              <p>
                {item.qty} × {item.name}
              </p>
              <p>${item.totalPrice.toFixed(2)}</p>
            </div>
          ))}

          <div className="border-t border-[#e5cbc7] mt-3 pt-3 space-y-1">
            <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
            <p>Tax (13% HST): ${order.tax.toFixed(2)}</p>
            {order.deliveryFee > 0 && <p>Delivery: ${order.deliveryFee.toFixed(2)}</p>}
            <p className="font-bold text-xl mt-2">Total: ${order.total.toFixed(2)}</p>
          </div>
        </div>
      </div>

      <Link
        to="/items"
        className="mt-6 bg-[#b67c5a] text-[#fbf1e5] px-6 py-3 rounded-full font-bold shadow-md hover:scale-105 transition"
      >
        Back to Shop
      </Link>
    </div>
  );
}
