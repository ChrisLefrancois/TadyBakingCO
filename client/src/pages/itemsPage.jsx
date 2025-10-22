// src/pages/ItemsPage.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import ItemCard from "../components/itemCard";
import ItemModal from "../components/itemModal";

export default function ItemsPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  useEffect(() => {
    async function fetchProducts() {
      try {
        const res = await axios.get("http://localhost:5000/api/items");
        setProducts(res.data);
      } catch (err) {
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
    // TODO: add to cart state / call backend / local storage
    console.log("Add to cart:", { itemId: item._id, qty, unitPrice, totalPrice });
    // For now close modal (the modal closes automatically in current implementation)
  }

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
        <ItemModal item={selectedItem} onClose={handleClose} onAdd={handleAddToCart} />
      )}
    </>
  );
}
