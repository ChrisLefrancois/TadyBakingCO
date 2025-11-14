// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data);
      } catch (err) {
        console.error("Failed to fetch orders:", err);
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  if (loading) {
    return <p className="text-center mt-10 text-[#4b2e24]">Loading orders...</p>;
  }

  if (error) {
    return <p className="text-center mt-10 text-red-600">{error}</p>;
  }

  async function updateStatus(id, newStatus) {
    // Find current order to rollback if needed
    const previousOrders = [...orders];

    // ⚡️ OPTIMISTIC UPDATE — show new status instantly
    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    );

    try {
      setUpdatingId(id);

      // backend update
      await api.put(`/api/orders/${id}/status`, { status: newStatus });

    } catch (err) {
      console.error("Failed to update status:", err);

      // ❌ Revert UI if backend failed
      setOrders(previousOrders);

      alert("Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  }


  // 🟦 Status badge styles
  const badgeClasses = {
    pending: "bg-yellow-200 text-yellow-700 border border-yellow-400 shadow-sm",
    preparing: "bg-blue-200 text-blue-700 border border-blue-400 shadow-sm",
    ready: "bg-green-200 text-green-700 border border-green-400 shadow-sm",
    "out-for-delivery": "bg-orange-200 text-orange-700 border border-orange-400 shadow-sm",
    completed: "bg-gray-200 text-gray-600 border border-gray-400 shadow-sm",
    cancelled: "bg-red-200 text-red-700 border border-red-400 shadow-sm",
  };

  return (
    <div className="bg-[#fbf1e5] min-h-screen py-10 px-4 flex justify-center">
      <div className="w-full max-w-5xl bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6">
        <h1 className="font-petitcochon text-[#4b2e24] text-3xl mb-6 text-center">
          Admin – Orders
        </h1>

        {orders.length === 0 ? (
          <p className="text-center text-[#4b2e24]">No orders yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm font-theseasons">
              <thead className="border-b border-[#e5cbc7] text-[#4b2e24]">
                <tr>
                  <th className="py-2 pr-2">Date</th>
                  <th className="py-2 pr-2">Customer</th>
                  <th className="py-2 pr-2">Method</th>
                  <th className="py-2 pr-2">Status</th>
                  <th className="py-2 pr-2 text-right">Total</th>
                  <th className="py-2 pr-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {orders.map((o) => {
                  const date = o.createdAt
                    ? new Date(o.createdAt)
                    : null;
                  const dateStr = date
                    ? date.toLocaleString("en-CA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—";

                  return (
                    <tr
                      key={o._id}
                      className="border-b border-[#f0dfd3] hover:bg-[#fbf1e5]"
                    >
                      <td className="py-2 pr-2">{dateStr}</td>

                      <td className="py-2 pr-2">
                        <div className="flex flex-col">
                          <span className="font-semibold">{o.customerName}</span>
                          <span className="text-xs text-[#806154]">
                            {o.customerEmail}
                          </span>
                        </div>
                      </td>

                      <td className="py-2 pr-2 capitalize">
                        {o.fulfillmentMethod}
                      </td>

                      {/* STATUS BADGE */}
                      <td className="py-2 pr-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClasses[o.status || "pending"]}`}
                        >
                          {o.status || "pending"}
                        </span>
                      </td>

                      <td className="py-2 pr-2 text-right">
                        ${Number(o.total || 0).toFixed(2)}
                      </td>

                      <td className="py-2 pr-2 space-y-1 text-center">

                        {/* VIEW ORDER */}
                        <Link
                          to={`${o._id}`}
                          className="text-xs bg-[#b67c5a] text-[#fbf1e5] px-3 py-1 rounded-full font-bold hover:scale-105 transition inline-block"
                        >
                          View
                        </Link>

                        {/* STATUS BUTTONS */}
                        <div className="flex flex-col gap-1 mt-2">

                          <button
                            onClick={() => updateStatus(o._id, "preparing")}
                            disabled={updatingId === o._id}
                            className="text-xs bg-blue-200 text-blue-700 px-3 py-1 rounded-full font-bold hover:scale-105 transition"
                          >
                            Mark Preparing
                          </button>

                          <button
                            onClick={() => updateStatus(o._id, "ready")}
                            disabled={updatingId === o._id}
                            className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded-full font-bold hover:scale-105 transition"
                          >
                            Mark Ready
                          </button>

                          <button
                            onClick={() => updateStatus(o._id, "out-for-delivery")}
                            disabled={updatingId === o._id}
                            className="text-xs bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full font-bold hover:scale-105 transition"
                          >
                            Out for Delivery
                          </button>

                          <button
                            onClick={() => updateStatus(o._id, "cancelled")}
                            disabled={updatingId === o._id}
                            className="text-xs bg-red-200 text-red-700 px-3 py-1 rounded-full font-bold hover:scale-105 transition"
                          >
                            Cancel Order
                          </button>

                        </div>

                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-6 text-center">
          <Link
            to="/items"
            className="inline-block bg-[#e5cbc7] text-[#4b2e24] px-6 py-2 rounded-full font-bold hover:scale-105 transition"
          >
            Back to shop
          </Link>
        </div>
      </div>
    </div>
  );
}
