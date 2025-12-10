import React, { useEffect, useState } from "react";
import api from "../../api";
import { Link, useNavigate } from "react-router-dom";

export default function AdminItems() {
  const [items, setItems] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const res = await api.get("/api/items/items");
      setItems(res.data);
    }
    load();
  }, []);

  return (
    <div className="bg-[#fbf1e5] min-h-screen p-8">
      <div className="max-w-4xl mx-auto bg-white border border-[#b67c5a] rounded-3xl shadow-lg p-6">

        <h1 className="font-petitcochon text-3xl text-[#4b2e24] text-center mb-6">
          Manage Products
        </h1>

        <div className="flex justify-end mb-4">
          <Link
            to="/admin/items/new"
            className="bg-[#b67c5a] text-white px-6 py-2 rounded-full font-semibold hover:scale-105 transition"
          >
            + Add Item
          </Link>
        </div>

        {/* Item cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-[#fff9f4] border border-[#e5cbc7] rounded-2xl shadow p-4"
            >
            <img
              src={item.imageUrl}
              alt={item.name}
              className="w-full h-70 object-contain rounded-xl bg-white p-2"
            />


              <h2 className="mt-3 font-bold text-lg text-[#4b2e24]">
                {item.name}
              </h2>

              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => navigate(`/admin/items/${item._id}/edit`)}
                  className="flex-1 bg-[#b67c5a] text-white py-2 rounded-full hover:scale-105 transition"
                >
                  Edit
                </button>

                <button
                  onClick={async (e) => {
                    e.preventDefault();

                    if (!confirm("Delete this item?")) return;

                    await api.delete(`/api/items/items/${item._id}`);

                    setItems((prev) => prev.filter((x) => x._id !== item._id));
                  }}
                  className="flex-1 bg-red-300 text-red-800 py-2 rounded-full hover:scale-105 transition"
                >
                  Delete
                </button>

              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
}
