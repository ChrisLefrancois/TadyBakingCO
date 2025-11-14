// src/pages/AdminOrderDetail.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import api from "../api";

export default function AdminOrderDetail() {
  const { id } = useParams();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);

  const badgeClasses = {
    pending:
      "bg-yellow-200 text-yellow-700 border border-yellow-400 shadow-sm",
    preparing:
      "bg-blue-200 text-blue-700 border border-blue-400 shadow-sm",
    ready:
      "bg-green-200 text-green-700 border border-green-400 shadow-sm",
    completed:
      "bg-gray-200 text-gray-600 border border-gray-400 shadow-sm",
  };

  useEffect(() => {
    async function fetchOrder() {
      try {
        const res = await api.get(`/api/orders/${id}`);
        setOrder(res.data);
      } catch (err) {
        console.error("Failed to load order:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchOrder();
  }, [id]);

  async function updateStatus(newStatus) {
    try {
      setUpdating(true);
      await api.put(`/api/orders/${id}/status`, { status: newStatus });
      setOrder((prev) => ({ ...prev, status: newStatus }));
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Could not update status");
    } finally {
      setUpdating(false);
    }
  }

  if (loading) {
    return <p className="text-center mt-10 text-[#4b2e24]">Loading order...</p>;
  }

  if (!order) {
    return <p className="text-center mt-10 text-red-600">Order not found.</p>;
  }

  return (
    <div className="bg-[#fbf1e5] min-h-screen py-10 px-5 flex justify-center">
      <div className="w-full max-w-3xl bg-white rounded-3xl border border-[#b67c5a] shadow-lg p-6">

        <h1 className="font-petitcochon text-4xl text-[#4b2e24] mb-4 text-center">
          Order Details
        </h1>

        {/* STATUS BADGE */}
        <div className="text-center mb-4">
          <span
            className={`px-4 py-2 text-sm rounded-full font-bold ${badgeClasses[order.status]}`}
          >
            {order.status}
          </span>
        </div>

        {/* UPDATE STATUS BUTTONS */}
        <div className="flex justify-center gap-3 mb-8">
          <button
            onClick={() => updateStatus("preparing")}
            disabled={updating}
            className="bg-blue-200 text-blue-700 px-4 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Mark Preparing
          </button>

          <button
            onClick={() => updateStatus("ready")}
            disabled={updating}
            className="bg-green-200 text-green-700 px-4 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Mark Ready
          </button>

          <button
            onClick={() => updateStatus("completed")}
            disabled={updating}
            className="bg-gray-200 text-gray-700 px-4 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Completed
          </button>
        </div>

        {/* CUSTOMER INFO */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg text-[#4b2e24] mb-1">Customer</h2>
          <p>{order.customerName}</p>
          <p className="text-sm text-[#806154]">{order.customerEmail}</p>
          <p className="text-sm">{order.customerPhone}</p>
        </div>

        {/* FULFILLMENT */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg text-[#4b2e24] mb-1">Fulfillment</h2>
          <p className="capitalize">{order.fulfillmentMethod}</p>

          {order.fulfillmentMethod === "delivery" && (
            <p className="mt-1 text-sm">{order.deliveryAddress}</p>
          )}
        </div>

        {/* ORDER ITEMS */}
        <div className="mb-6">
          <h2 className="font-semibold text-lg text-[#4b2e24] mb-2">Items</h2>

          <div className="space-y-3">
            {order.items.map((item) => (
              <div
                key={item._id}
                className="flex justify-between border-b border-[#e5cbc7] pb-2"
              >
                <div>
                  <p className="font-bold">{item.name}</p>
                  <p className="text-sm text-[#806154]">Qty: {item.qty}</p>
                </div>
                <p className="font-bold">${item.totalPrice.toFixed(2)}</p>
              </div>
            ))}
          </div>
        </div>

        {/* TOTALS */}
        <div className="border-t border-[#e5cbc7] pt-4 space-y-1 text-right font-petitcochon">
          <p>Subtotal: ${order.subtotal.toFixed(2)}</p>
          <p>Tax: ${order.tax.toFixed(2)}</p>
          {order.deliveryFee > 0 && (
            <p>Delivery: ${order.deliveryFee.toFixed(2)}</p>
          )}
          <p className="text-2xl font-bold text-[#4b2e24]">
            Total: ${order.total.toFixed(2)}
          </p>
        </div>

        {/* BACK BUTTON */}
        <div className="mt-8 text-center">
          <Link
            to="/admin/orders"
            className="inline-block bg-[#b67c5a] text-[#fbf1e5] px-6 py-3 rounded-full font-bold hover:scale-105 transition"
          >
            Back to Orders
          </Link>
        </div>
      </div>
    </div>
  );
}
