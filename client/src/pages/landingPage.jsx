import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api";
import ItemCard from "../components/itemCard";
import ItemModal from "../components/itemModal";
import orderBubble from "../assets/bigBubble.png";

export default function LandingPage() {
  const [products, setProducts] = useState([]);
  const [error, setError] = useState("");
  const [selectedItem, setSelectedItem] = useState(null);

  // Fetch first 2 products
 // Fetch 2 items on mobile, 3 on desktop
useEffect(() => {
  function fetchItemsBasedOnScreen() {
    const isMobile = window.innerWidth < 768; // md breakpoint
    const limit = isMobile ? 2 : 3;

    api.get("/api/items/items")
      .then((res) => {
        setProducts(res.data.slice(0, limit)); // return only required #
      })
      .catch(() => setError("Failed to fetch items."));
  }

  // Fetch immediately
  fetchItemsBasedOnScreen();

  // Also fetch again if the user resizes to desktop/mobile
  window.addEventListener("resize", fetchItemsBasedOnScreen);

  return () => window.removeEventListener("resize", fetchItemsBasedOnScreen);
}, []);


  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center">

      {/* Top section spacing */}
      <div className="mt-6 w-full max-w-6xl px-6">

        {/* Desktop layout: three-column top bar */}
        <div className="hidden md:flex justify-between items-center w-full mb-6">
          <p className="font-petitcochon font-bold text-[#7c4a3a] text-xl">
            FRESH COOKIES?!?!
          </p>

          <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg tracking-wide">
            BUTTER TARTS TOO!
          </p>

          <p className="font-petitcochon font-bold text-[#7c4a3a] text-xl">
            IN AJAX?!
          </p>
        </div>

        {/* Mobile stacked layout */}
        <div className="md:hidden w-full flex justify-between items-start px-1">
          <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg">
            FRESH COOKIES?!?!
          </p>
          <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg">
            IN AJAX?!
          </p>
        </div>

        <p className="md:hidden font-petitcochon mt-2 text-[#7c4a3a] text-md tracking-wider font-semibold text-center">
          BUTTER TARTS TOO!
        </p>

        {/* ORDER NOW bubble */}
        <div className="w-full flex justify-center mt-4">
          <Link
            to="/order"
            className="relative inline-flex items-center justify-center text-white
              text-3xl sm:text-4xl font-petitcochon font-extrabold
              w-64 sm:w-80 h-32 sm:h-40
              bg-no-repeat bg-contain bg-center transition-transform hover:scale-105"
            style={{ backgroundImage: `url(${orderBubble})` }}
          >
            ORDER NOW!
          </Link>
        </div>

        {/* Cloud links (About / FAQ / Contacts) */}
        <div className="w-full flex flex-wrap justify-center gap-6 mt-6 px-2">
          {["about", "faq", "contact"].map((page) => (
            <Link
              key={page}
              to={`/${page}`}
              className="relative w-32 h-16 flex items-center justify-center
                text-[#806154] font-petitcochon font-bold transition
                hover:scale-105"
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
      </div>

      {/* Cookie icons bar */}
      <div className="bg-[#b67c5a] w-full overflow-hidden py-4 px-6 flex items-center justify-between shadow-inner mt-8">
        {Array(6)
          .fill("/images/logo.png")
          .map((src, i) => (
            <img
              key={i}
              src={src}
              alt="Teddy Icon"
              className={`w-14 h-14 sm:w-20 sm:h-20 object-contain ${
                i >= 3 ? "transform scale-x-[-1]" : ""
              }`}
            />
          ))}
      </div>

      {/* Bubble button - matching About/FAQ/Contact */}
      <div className="mt-10 mb-8 flex justify-center w-full">
        <Link
          to="/items"
          className="relative w-48 h-20 sm:w-56 sm:h-24
            flex items-center justify-center
            text-[#806154] font-petitcochon font-bold text-lg sm:text-xl
            transition hover:scale-105"
          style={{
            backgroundImage: "url('/images/tbc cloud bubble.png')",
            backgroundSize: "contain",
            backgroundRepeat: "no-repeat",
            backgroundPosition: "center",
          }}
        >
          All Our Products
        </Link>
      </div>


      {/* Featured Products */}
      <div className="w-full max-w-5xl grid grid-cols-1 sm:grid-cols-3 gap-12 justify-items-center mt-4 px-4">
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

      {/* Modal */}
      {selectedItem && (
        <ItemModal item={selectedItem} onClose={() => setSelectedItem(null)} />
      )}

    </div>
  );
}
