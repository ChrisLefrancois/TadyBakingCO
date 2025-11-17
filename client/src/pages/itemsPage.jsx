// src/pages/ItemsPage.jsx
import { useEffect, useState } from "react";
import api from "../api";
import ItemCard from "../components/itemCard";
import ItemModal from "../components/itemModal";
import { motion } from "framer-motion";

export default function ItemsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch products
  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/api/items/items");
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      }
    }
    fetchProducts();
  }, []);

  function handleOpen(item) {
    setSelectedItem(item);
  }

  function handleClose() {
    setSelectedItem(null);
  }

  function handleAddToCart({ item, qty, unitPrice, totalPrice }) {
    console.log("Add to cart:", {
      itemId: item._id,
      qty,
      unitPrice,
      totalPrice,
    });
  }

  return (
    <div className="bg-[#fbf1e5] min-h-screen pb-20 flex flex-col items-center">

      {/* Title Bubble */}
      <div
        className="relative w-64 h-24 sm:w-80 sm:h-32 flex items-center justify-center
        text-[#806154] font-petitcochon font-bold text-3xl sm:text-4xl mt-10 mb-10"
        style={{
          backgroundImage: "url('/images/tbc cloud bubble.png')",
          backgroundSize: "contain",
          backgroundRepeat: "no-repeat",
          backgroundPosition: "center"
        }}
      >
        All Products
      </div>

      {/* Error */}
      {error && <div className="text-red-500 mb-4">{error}</div>}

      {/* Product Grid */}
      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          gap-12
          justify-items-center
          w-full
          max-w-[1300px]
          px-6
        "
      >
        {products.map((p, index) => (
          <motion.div
            key={p._id}
            initial={{ opacity: 0, scale: 0.85, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ delay: index * 0.12, duration: 0.35 }}
          >
            <ItemCard
              name={p.name}
              description={p.description}
              image={p.imageUrl}
              onAddToBag={() => handleOpen(p)}
            />
          </motion.div>
        ))}
      </div>

      {/* Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={handleClose}
          onAdd={handleAddToCart}
        />
      )}
    </div>
  );
}
