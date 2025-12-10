import React, { useEffect, useState } from "react";
import api from "../../api";
import { useNavigate } from "react-router-dom";

export default function AdminItemForm({ mode, id }) {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [allItems, setAllItems] = useState([]); // for bundles

  // ✨ Form state
  const [form, setForm] = useState({
    type: "single",
    name: "",
    description: "",
    image: null, // file
    pricingTiers: [{ quantity: 1, price: 0 }],
    itemsIncluded: [], // bundles only
    bundlePrice: "",
    bundleSave: "",
  });

  // Load for edit mode
  useEffect(() => {
    async function load() {
      const resAll = await api.get("/api/items/items");
      setAllItems(resAll.data);

      if (mode === "edit") {
        const res = await api.get(`/api/items/items/${id}`);
        const item = res.data;

        setForm({
          type: item.type,
          name: item.name,
          description: item.description,
          image: null,
          pricingTiers: item.pricingTiers || [{ quantity: 1, price: 0 }],
          itemsIncluded:
            item.itemsIncluded?.map((i) => ({
              item: i.item._id,
              quantity: i.quantity,
            })) || [],
          bundlePrice: item.bundlePrice || "",
          bundleSave: item.bundleSave || "",
        });
      }
    }
    load();
  }, []);

  // Handle form updates
  const update = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  // Add pricing tier
  const addTier = () => {
    update("pricingTiers", [...form.pricingTiers, { quantity: 1, price: 0 }]);
  };

  const removeTier = (index) => {
    update(
      "pricingTiers",
      form.pricingTiers.filter((_, i) => i !== index)
    );
  };

  // Add included item (for bundles)
  const addIncludedItem = () => {
    update("itemsIncluded", [...form.itemsIncluded, { item: "", quantity: 1 }]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const fd = new FormData();
    Object.entries(form).forEach(([key, value]) => {
      if (key === "pricingTiers" || key === "itemsIncluded") {
        fd.append(key, JSON.stringify(value));
      } else if (key === "image" && value) {
        fd.append("image", value);
      } else {
        fd.append(key, value);
      }
    });

    try {
      if (mode === "create") {
        await api.post("/api/items/create", fd, {
          headers: {
            "x-api-key": import.meta.env.VITE_ITEMS_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        });
      } else {
        await api.put(`/api/items/items/${id}`, fd, {
          headers: {
            "x-api-key": import.meta.env.VITE_ITEMS_API_KEY,
            "Content-Type": "multipart/form-data",
          },
        });
      }

      navigate("/admin/items");
    } catch (err) {
      alert("Save failed.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // --------------------------------------------

  return (
    <div className="bg-[#fbf1e5] min-h-screen p-8">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl border border-[#b67c5a] shadow-lg p-6">
        <h1 className="font-petitcochon text-3xl text-[#4b2e24] text-center mb-6">
          {mode === "edit" ? "Edit Item" : "Add New Item"}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          {/* BASIC INFO */}
          <div className="space-y-3">
            <input
              value={form.name}
              onChange={(e) => update("name", e.target.value)}
              placeholder="Item name"
              className="w-full border border-[#e5cbc7] rounded-xl px-3 py-2"
              required
            />

            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              placeholder="Description"
              className="w-full border border-[#e5cbc7] rounded-xl px-3 py-2 h-24"
            />
          </div>

          {/* IMAGE */}
          <div>
            <label className="font-semibold text-[#4b2e24]">Image</label>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => update("image", e.target.files[0])}
              className="mt-1 block"
            />
          </div>

          {/* TYPE */}
          <div>
            <label className="font-semibold">Type</label>
            <select
              value={form.type}
              onChange={(e) => update("type", e.target.value)}
              className="w-full border border-[#e5cbc7] rounded-xl px-3 py-2"
            >
              <option value="single">Single Item</option>
              <option value="bundle">Bundle</option>
            </select>
          </div>

          {/* PRICING TIERS */}
          <div className="bg-[#fff9f4] p-4 border rounded-xl">
            <h2 className="font-bold text-[#4b2e24] mb-3">Pricing Tiers</h2>

            {form.pricingTiers.map((tier, index) => (
              <div key={index} className="flex gap-3 items-center mb-2">
                <input
                  type="number"
                  value={tier.quantity}
                  onChange={(e) =>
                    update("pricingTiers", form.pricingTiers.map((t, i) =>
                      i === index ? { ...t, quantity: e.target.value } : t
                    ))
                  }
                  className="w-24 border rounded-lg px-2 py-1"
                  placeholder="Qty"
                />

                <input
                  type="number"
                  value={tier.price}
                  onChange={(e) =>
                    update("pricingTiers", form.pricingTiers.map((t, i) =>
                      i === index ? { ...t, price: e.target.value } : t
                    ))
                  }
                  className="w-32 border rounded-lg px-2 py-1"
                  placeholder="Price"
                />

                {index > 0 && (
                  <button
                    type="button"
                    onClick={() => removeTier(index)}
                    className="text-red-500 text-lg font-bold"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}

            <button
              type="button"
              className="mt-2 bg-[#b67c5a] text-white px-4 py-1 rounded-full"
              onClick={addTier}
            >
              + Add Tier
            </button>
          </div>

          {/* BUNDLE ITEMS */}
          {form.type === "bundle" && (
            <div className="bg-[#fff9f4] p-4 border rounded-xl">
              <h2 className="font-bold text-[#4b2e24] mb-3">Included Items</h2>

              {form.itemsIncluded.map((bi, index) => (
                <div key={index} className="flex gap-3 items-center mb-2">
                  <select
                    value={bi.item}
                    onChange={(e) =>
                      update(
                        "itemsIncluded",
                        form.itemsIncluded.map((x, i) =>
                          i === index ? { ...x, item: e.target.value } : x
                        )
                      )
                    }
                    className="border rounded-lg px-2 py-1 flex-1"
                  >
                    <option value="">Select item…</option>
                    {allItems.map((it) => (
                      <option key={it._id} value={it._id}>
                        {it.name}
                      </option>
                    ))}
                  </select>

                  <input
                    type="number"
                    min="1"
                    value={bi.quantity}
                    onChange={(e) =>
                      update(
                        "itemsIncluded",
                        form.itemsIncluded.map((x, i) =>
                          i === index ? { ...x, quantity: e.target.value } : x
                        )
                      )
                    }
                    className="w-24 border rounded-lg px-2 py-1"
                  />

                  <button
                    type="button"
                    onClick={() =>
                      update(
                        "itemsIncluded",
                        form.itemsIncluded.filter((_, i) => i !== index)
                      )
                    }
                    className="text-red-500 text-lg font-bold"
                  >
                    ×
                  </button>
                </div>
              ))}

              <button
                type="button"
                onClick={addIncludedItem}
                className="mt-2 bg-[#b67c5a] text-white px-4 py-1 rounded-full"
              >
                + Add Included Item
              </button>

              <div className="mt-4 space-y-2">
                <input
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="Bundle Price"
                  value={form.bundlePrice}
                  onChange={(e) => update("bundlePrice", e.target.value)}
                />

                <input
                  className="w-full border px-3 py-2 rounded-lg"
                  placeholder="You Save (optional)"
                  value={form.bundleSave}
                  onChange={(e) => update("bundleSave", e.target.value)}
                />
              </div>
            </div>
          )}

          {/* SUBMIT */}
          <button
            disabled={loading}
            className="w-full bg-[#b67c5a] text-white py-3 rounded-full font-bold text-lg hover:scale-105 transition"
          >
            {loading ? "Saving..." : "Save Item"}
          </button>

        </form>
      </div>
    </div>
  );
}
