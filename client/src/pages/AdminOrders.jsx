// src/pages/AdminOrders.jsx
import React, { useEffect, useState } from "react";
import api from "../api";
import { Link } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");

  // 🔢 PAGINATION
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10; // change to 5, 20, etc.

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  // Fetch orders
  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await api.get("/api/orders");
        setOrders(res.data);
        setFiltered(res.data);
      } catch (err) {
        setError("Could not load orders.");
      } finally {
        setLoading(false);
      }
    }
    fetchOrders();
  }, []);

  // 🔍 SEARCH
  useEffect(() => {
    const term = search.toLowerCase();

    const results = orders.filter((o) => {
      return (
        o.customerName.toLowerCase().includes(term) ||
        o.customerEmail.toLowerCase().includes(term) ||
        o.status.toLowerCase().includes(term) ||
        o.fulfillmentMethod.toLowerCase().includes(term) ||
        o._id.toLowerCase().includes(term)
      );
    });

    setFiltered(results);
    setCurrentPage(1); // reset to first page on search
  }, [search, orders]);

  // 📌 PAGINATION: slice filtered list
  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  async function updateStatus(id, newStatus) {
    const previous = [...orders];

    setOrders((prev) =>
      prev.map((o) => (o._id === id ? { ...o, status: newStatus } : o))
    );

    try {
      setUpdatingId(id);
      await api.put(`/api/orders/${id}/status`, { status: newStatus });
    } catch (err) {
      setOrders(previous);
      alert("Could not update order status.");
    } finally {
      setUpdatingId(null);
    }
  }

  const badgeClasses = {
    pending: "bg-yellow-200 text-yellow-700 border border-yellow-400",
    preparing: "bg-blue-200 text-blue-700 border border-blue-400",
    ready: "bg-green-200 text-green-700 border border-green-400",
    "out-for-delivery": "bg-orange-200 text-orange-700 border border-orange-400",
    completed: "bg-gray-200 text-gray-700 border border-gray-400",
    cancelled: "bg-red-200 text-red-700 border border-red-400",
  };

  if (loading) return <p className="text-center mt-10">Loading orders...</p>;
  if (error) return <p className="text-center text-red-600 mt-10">{error}</p>;

  return (
    <div className="bg-[#fbf1e5] min-h-screen py-10 px-4 flex justify-center">
      <div className="w-full max-w-5xl bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6">

        <h1 className="font-petitcochon text-[#4b2e24] text-3xl mb-6 text-center">
          Admin – Orders
        </h1>

        {/* 🔍 SEARCH BAR */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search by name, email, status, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-lg border border-[#e5cbc7] rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#b67c5a]"
          />
        </div>

        {/* 🟫 Orders Table */}
        {filtered.length === 0 ? (
          <p className="text-center text-[#4b2e24]">No matching orders.</p>
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
                {paginatedOrders.map((o) => {
                  const date = o.createdAt ? new Date(o.createdAt) : null;
                  const dateStr = date
                    ? date.toLocaleString("en-CA", {
                        dateStyle: "short",
                        timeStyle: "short",
                      })
                    : "—";

                  return (
                    <tr key={o._id} className="border-b border-[#f0dfd3]">
                      {/* Date */}
                      <td className="py-2 pr-2">{dateStr}</td>

                      {/* Customer */}
                      <td className="py-2 pr-2">
                        <div className="flex flex-col">
                          <span className="font-semibold">{o.customerName}</span>
                          <span className="text-xs text-[#806154]">{o.customerEmail}</span>
                        </div>
                      </td>

                      {/* Method */}
                      <td className="py-2 pr-2 capitalize">
                        {o.fulfillmentMethod}
                      </td>

                      {/* Status Badge */}
                      <td className="py-2 pr-2">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClasses[o.status]}`}
                        >
                          {o.status}
                        </span>
                      </td>

                      {/* Total */}
                      <td className="py-2 pr-2 text-right">
                        ${o.total.toFixed(2)}
                      </td>

                      {/* Actions */}
                      <td className="py-2 pr-2 text-center space-y-1">

                        <Link
                          to={`${o._id}`}
                          className="text-xs bg-[#b67c5a] text-white px-3 py-1 rounded-full block"
                        >
                          View
                        </Link>

                        <div className="flex flex-col gap-1">

                          {o.fulfillmentMethod === "pickup" ? (
                            <>
                              <button
                                onClick={() => updateStatus(o._id, "preparing")}
                                className="text-xs bg-blue-200 text-blue-700 px-3 py-1 rounded-full"
                              >
                                Mark Preparing
                              </button>

                              <button
                                onClick={() => updateStatus(o._id, "ready")}
                                className="text-xs bg-green-200 text-green-700 px-3 py-1 rounded-full"
                              >
                                Mark Ready
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() =>
                                updateStatus(o._id, "out-for-delivery")
                              }
                              className="text-xs bg-yellow-200 text-yellow-700 px-3 py-1 rounded-full"
                            >
                              Out for Delivery
                            </button>
                          )}

                          <button
                            onClick={() => updateStatus(o._id, "completed")}
                            className="text-xs bg-gray-200 text-gray-700 px-3 py-1 rounded-full"
                          >
                            Completed
                          </button>

                          <button
                            onClick={() => updateStatus(o._id, "cancelled")}
                            className="text-xs bg-red-200 text-red-700 px-3 py-1 rounded-full"
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

        {/* 🔢 Pagination Controls */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-6 gap-2">

            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-3 py-1 bg-[#e5cbc7] rounded-full text-[#4b2e24]"
            >
              Prev
            </button>

            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentPage(i + 1)}
                className={`px-3 py-1 rounded-full ${
                  currentPage === i + 1
                    ? "bg-[#b67c5a] text-white"
                    : "bg-[#f5e3d4] text-[#4b2e24]"
                }`}
              >
                {i + 1}
              </button>
            ))}

            <button
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-3 py-1 bg-[#e5cbc7] rounded-full text-[#4b2e24]"
            >
              Next
            </button>

          </div>
        )}

      </div>
    </div>
  );
}
