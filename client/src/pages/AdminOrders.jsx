import React, { useEffect, useState } from "react";
import api from "../api";
import { Link, useNavigate } from "react-router-dom";

export default function AdminOrders() {
  const [orders, setOrders] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  const navigate = useNavigate();

  // -------------------------------
  // 🔐 AUTH GUARD — Redirect if no token
  // -------------------------------
  useEffect(() => {
    const token = localStorage.getItem("tady_admin_token");

    if (!token) {
      navigate("/admin/login");
      return;
    }
  }, [navigate]);

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
    setCurrentPage(1);
  }, [search, orders]);

  const startIdx = (currentPage - 1) * PAGE_SIZE;
  const paginatedOrders = filtered.slice(startIdx, startIdx + PAGE_SIZE);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);

  async function updateStatus(id, newStatus) {
    const prev = [...orders];
    setOrders((o) => o.map((x) => (x._id === id ? { ...x, status: newStatus } : x)));

    try {
      setUpdatingId(id);
      await api.put(`/api/orders/${id}/status`, { status: newStatus });
    } catch (err) {
      setOrders(prev);
      alert("Could not update status.");
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
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-[#b67c5a] shadow-lg p-6">

        <h1 className="font-petitcochon text-3xl text-[#4b2e24] text-center mb-6">
          Admin – Orders
        </h1>

        {/* Search Bar */}
        <div className="mb-6 flex justify-center">
          <input
            type="text"
            placeholder="Search by name, email, status, order ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full max-w-lg border border-[#e5cbc7] rounded-full px-4 py-2 text-sm focus:ring-2 focus:ring-[#b67c5a]"
          />
        </div>

        {/* Mobile Cards */}
        <div className="block sm:hidden space-y-4">
          {paginatedOrders.map((o) => {
            const dateStr = new Date(o.createdAt).toLocaleString("en-CA", {
              dateStyle: "short",
              timeStyle: "short",
            });

            return (
              <div
                key={o._id}
                className="bg-[#fff9f4] border border-[#e5cbc7] rounded-2xl p-4 shadow-sm"
              >
                {/* Header */}
                <div className="flex justify-between items-center mb-2">
                  <p className="text-sm text-[#4b2e24]">{dateStr}</p>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClasses[o.status]}`}
                  >
                    {o.status}
                  </span>
                </div>

                <p className="font-semibold">{o.customerName}</p>
                <p className="text-xs text-[#806154]">{o.customerEmail}</p>

                <p className="mt-2 text-sm capitalize">
                  Method: <strong>{o.fulfillmentMethod}</strong>
                </p>

                <p className="text-right text-lg font-bold text-[#4b2e24]">
                  ${o.total.toFixed(2)}
                </p>

                {/* Actions */}
                <div className="mt-3 grid grid-cols-2 gap-2">
                  <Link
                    to={`${o._id}`}
                    className="text-center bg-[#b67c5a] text-white py-2 text-xs rounded-full"
                  >
                    View
                  </Link>

                  {o.fulfillmentMethod === "pickup" ? (
                    <>
                      <button
                        onClick={() => updateStatus(o._id, "preparing")}
                        className="bg-blue-200 text-blue-700 py-2 text-xs rounded-full"
                      >
                        Preparing
                      </button>

                      <button
                        onClick={() => updateStatus(o._id, "ready")}
                        className="bg-green-200 text-green-700 py-2 text-xs rounded-full"
                      >
                        Ready
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => updateStatus(o._id, "out-for-delivery")}
                      className="bg-orange-200 text-orange-700 py-2 text-xs rounded-full"
                    >
                      Out for Delivery
                    </button>
                  )}

                  <button
                    onClick={() => updateStatus(o._id, "completed")}
                    className="bg-gray-200 text-gray-700 py-2 text-xs rounded-full"
                  >
                    Completed
                  </button>

                  <button
                    onClick={() => updateStatus(o._id, "cancelled")}
                    className="bg-red-200 text-red-700 py-2 text-xs rounded-full"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Desktop Table */}
            <div className="hidden sm:block overflow-x-auto mt-4">
              <table className="w-full text-sm text-left">
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
                    const dateStr = new Date(o.createdAt).toLocaleString("en-CA", {
                      dateStyle: "short",
                      timeStyle: "short",
                    });

                    return (
                      <tr key={o._id} className="border-b border-[#f0dfd3]">
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

                        <td className="py-2 pr-2">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold ${badgeClasses[o.status]}`}
                          >
                            {o.status}
                          </span>
                        </td>

                        <td className="py-2 pr-2 text-right">
                          ${o.total.toFixed(2)}
                        </td>

                        <td className="py-2 pr-2 text-center space-y-1">
                        <Link
                        to={`${o._id}`}
                        className="text-xs bg-[#b67c5a] text-white px-3 py-1 rounded-full block w-28 mx-auto"
                      >
                        View
                      </Link>

                      { o.fulfillmentMethod === "pickup" ? (
                        <>
                          <button
                            onClick={() => updateStatus(o._id, "preparing")}
                            className="text-xs bg-blue-200 text-blue-700 px-3 py-1 cursor-pointer rounded-full block w-28 mx-auto"
                          >
                            Preparing
                          </button>

                          <button
                            onClick={() => updateStatus(o._id, "ready")}
                            className="text-xs bg-green-200 text-green-700 px-3 py-1 cursor-pointer rounded-full block w-28 mx-auto"
                          >
                            Ready
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => updateStatus(o._id, "out-for-delivery")}
                          className="text-xs bg-orange-200 text-orange-700 px-3 py-1 cursor-pointer rounded-full block w-28 mx-auto"
                        >
                          Out for Delivery
                        </button>
                      )}

                      <button
                        onClick={() => updateStatus(o._id, "completed")}
                        className="text-xs bg-gray-200 text-gray-700 px-3 py-1 cursor-pointer rounded-full block w-28 mx-auto"
                      >
                        Completed
                      </button>

                      <button
                        onClick={() => updateStatus(o._id, "cancelled")}
                        className="text-xs bg-red-200 text-red-700 px-3 py-1 cursor-pointer rounded-full block w-28 mx-auto"
                      >
                        Cancel
                      </button>

                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
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
