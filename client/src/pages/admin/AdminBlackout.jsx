import React, { useEffect, useState } from "react";
import api from "../../api";

export default function AdminBlackout() {
  const [dates, setDates] = useState([]);
  const [selected, setSelected] = useState("");
  const [reason, setReason] = useState("");

  useEffect(() => {
    load();
  }, []);

  async function load() {
    const res = await api.get("/api/blackout");
    setDates(res.data);
  }

  async function addDate() {
    if (!selected) return alert("Choose a date");

    await api.post(
      "/api/blackout",
      { date: selected, reason },
      { headers: { "x-api-key": import.meta.env.VITE_ITEMS_API_KEY } }
    );

    setSelected("");
    setReason("");
    load();
  }

  async function removeDate(id) {
    await api.delete(`/api/blackout/${id}`, {
      headers: { "x-api-key": import.meta.env.VITE_ITEMS_API_KEY },
    });
    load();
  }

  return (
    <div className="p-6 max-w-xl mx-auto bg-white rounded-xl shadow">
      <h1 className="text-2xl font-bold mb-4">Blackout Dates</h1>

      <div className="space-y-3">
        <input
          type="date"
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="border px-3 py-2 rounded w-full"
        />

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Reason (optional)"
          className="border px-3 py-2 rounded w-full"
        />

        <button
          className="bg-[#b67c5a] text-white py-2 w-full rounded-full"
          onClick={addDate}
        >
          Add Blackout Day
        </button>
      </div>

      <h2 className="mt-6 text-xl font-semibold">Blocked Days</h2>

      <ul className="mt-3 space-y-2">
        {dates.map((d) => (
          <li
            key={d._id}
            className="border p-3 rounded flex justify-between items-center"
          >
            <span>
              {d.date} — <span className="text-sm text-gray-600">{d.reason}</span>
            </span>
            <button
              className="text-red-600 font-bold"
              onClick={() => removeDate(d._id)}
            >
              ×
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
