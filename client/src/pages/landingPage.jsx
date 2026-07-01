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

  // Fetch ALL products
  useEffect(() => {
    api.get("/api/items/items")
      .then((res) => {
        setProducts(res.data);
      })
      .catch(() => setError("Failed to fetch items."));
  }, []);

  return (
    <div className="bg-[#fbf1e5] min-h-screen flex flex-col items-center">

      {/* Top section spacing */}
      <div className="mt-6 w-full max-w-6xl px-6">

        {/* Desktop layout */}
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

        {/* Mobile layout */}
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
            to="/items"
            className="relative inline-flex items-center justify-center text-white
              text-3xl sm:text-4xl font-petitcochon font-extrabold
              w-64 sm:w-80 h-32 sm:h-40
              bg-no-repeat bg-contain bg-center transition-transform hover:scale-105"
            style={{ backgroundImage: `url(${orderBubble})` }}
          >
            ORDER NOW!
          </Link>
        </div>

        {/* Cloud links */}
        <div className="w-full flex flex-wrap justify-center gap-6 mt-6 px-2">

          {/* Desktop */}
          <div className="hidden md:flex w-full justify-between max-w-3xl">
            {["aboutus", "faq", "contact"].map((page) => {
              const label =
                page === "aboutus"
                  ? "ABOUT US"
                  : page.toUpperCase();

              let linkProps = {};

              if (page === "contact") {
                linkProps = { href: "#contact-section", as: "a" };
              } else if (page === "aboutus") {
                linkProps = { to: "/aboutus", as: Link };
              } else {
                linkProps = { to: "/faq", as: Link };
              }

              const Tag = linkProps.as || Link;

              return (
                <Tag
                  key={page}
                  {...linkProps}
                  className="relative w-40 h-24 flex items-center justify-center
                    text-[#806154] font-petitcochon font-bold text-xl
                    transition hover:scale-110 cursor-pointer"
                  style={{
                    backgroundImage: "url('/images/tbc cloud bubble.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  {label}
                </Tag>
              );
            })}
          </div>

          {/* Mobile */}
          <div className="md:hidden flex flex-wrap justify-center gap-6 w-full">
            {["aboutus", "faq", "contact"].map((page) => {
              const label =
                page === "aboutus"
                  ? "ABOUT US"
                  : page.toUpperCase();

              let linkProps = {};

              if (page === "contact") {
                linkProps = { href: "#contact-section", as: "a" };
              } else if (page === "aboutus") {
                linkProps = { to: "/aboutus", as: Link };
              } else {
                linkProps = { to: "/faq", as: Link };
              }

              const Tag = linkProps.as || Link;

              return (
                <Tag
                  key={page}
                  {...linkProps}
                  className="relative w-32 h-16 flex items-center justify-center
                    text-[#806154] font-petitcochon font-bold transition hover:scale-105"
                  style={{
                    backgroundImage: "url('/images/tbc cloud bubble.png')",
                    backgroundSize: "contain",
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  }}
                >
                  {label}
                </Tag>
              );
            })}
          </div>

        </div>
      </div>

      {/* Cookie bar */}
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

      {/* All Products button */}
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
          ALL OUR PRODUCTS
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
        <ItemModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}

    </div>
  );
}
