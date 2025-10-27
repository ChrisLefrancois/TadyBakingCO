import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api"; // ✅ Use shared axios instance
import ItemCard from "../components/itemCard";
import ItemModal from "../components/itemModal";
import orderBubble from "../assets/bigBubble.png";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // ✅ Fetch first 2 items from DB
  useEffect(() => {
    async function fetchItems() {
      try {
        const res = await api.get("/api/items");
        setProducts(res.data.slice(0, 2));
      } catch (err) {
        console.error(err);
        setError("Failed to fetch items.");
      }
    }
    fetchItems();
  }, []);

  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center mt-6">

      {/* Top text */}
      <div className="w-full flex justify-between items-start px-6">
        <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg tracking-wider">
          FRESH COOKIES?!?!
        </p>
        <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg tracking-wider">
          IN AJAX?!
        </p>
      </div>

      {/* Subtitle */}
      <p className="font-petitcochon mt-2 text-[#7c4a3a] text-md tracking-wider font-semibold">
        BUTTER TARTS TOO!
      </p>

      {/* Big Order Now bubble */}
      <Link
        to="/order"
        className="relative inline-flex items-center justify-center text-white text-3xl sm:text-4xl font-petitcochon font-extrabold w-64 sm:w-80 h-32 sm:h-40 bg-no-repeat bg-contain bg-center transition-transform hover:scale-105"
        style={{ backgroundImage: `url(${orderBubble})` }}
      >
        ORDER NOW!
      </Link>


      {/* Cloud links */}
      <div className="w-full flex flex-wrap justify-center gap-4 mt-6 px-2">

        {["about", "faq", "contact"].map((page) => (
          <Link
            key={page}
            to={`/${page}`}
            className="relative w-32 h-16 flex items-center justify-center text-[#806154] font-petitcochon font-bold transition hover:scale-105"
            style={{
              backgroundImage: "url('/images/tbc cloud bubble.png')",
              backgroundSize: "contain",
              backgroundRepeat: "no-repeat",
              backgroundPosition: "center",
            }}
          >
            {page.toUpperCase()}
          </Link>
        ))}
      </div>

      {/* Cookie icons bar */}
      <div className="bg-[#b67c5a] w-full overflow-hidden py-3 px-2 sm:px-4 flex items-center justify-between shadow-lg relative mt-5">

        {Array(6)
          .fill("/images/logo.png")
          .map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Teddy Icon"
              className={`w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain ${
                i >= 3 ? "transform scale-x-[-1]" : ""
              }`}
            />
          ))}
      </div>

      {/* Items from database */}
      {error && <p className="text-red-500 mt-4">{error}</p>}

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">
        {products.map((item) => (
          <ItemCard
            key={item._id}
            name={item.name}
            description={item.description}
            image={item.imageUrl}
            onAddToBag={() => setSelectedItem(item)}
          />
        ))}
      </div>

      {/* View all products button */}
      <Link
        to="/items"
        className="font-petitcochon mt-8 bg-[#e5cbc7] text-[#806154] px-6 py-3 rounded-full shadow-xl text-lg font-bold hover:bg-[#b9967a] transition"
      >
        All Our Products
      </Link>

      {/* Modal */}
      {selectedItem && (
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}
