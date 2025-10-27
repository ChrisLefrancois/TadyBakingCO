import { useEffect, useState } from "react";
import api from "../api"; // ✅ custom axios instance
import ItemCard from "../components/itemCard";
import ItemModal from "../components/itemModal";

export default function ItemsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await api.get("/api/items"); // ✅ uses correct base URL
        setProducts(res.data);
      } catch (err) {
        console.error(err);
        setError("Failed to fetch products.");
      }
    }
    fetchProducts();
  }, []);

  const handleOpen = (item) => setSelectedItem(item);
  const handleClose = () => setSelectedItem(null);

  const handleAddToCart = ({ item, qty, unitPrice, totalPrice }) => {
    console.log("Add to cart:", { itemId: item._id, qty, unitPrice, totalPrice });
  };

  return (
    <>
      {error && <div className="text-red-500">{error}</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 justify-items-center">
        {products.map((p) => (
          <ItemCard
            key={p._id}
            name={p.name}
            description={p.description}
            image={p.imageUrl}
            onAddToBag={() => handleOpen(p)}
          />
        ))}
      </div>

      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={handleClose}
          onAdd={handleAddToCart}
        />
      )}
    </>
  );
}
