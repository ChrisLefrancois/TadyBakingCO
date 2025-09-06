import React from "react";
import { Link } from "react-router-dom";
import ItemCard from "../components/itemCard";



export default function LandingPage() {
  const products = [
    {
      id: 1,
      name: "B.B.C.C. (Brown Butter Choc Chip)",
      description: "",
      price: 5.99,
      img: "/images/bbcc.png", // replace with your actual images
    },
    {
      id: 2,
      name: "B.B.B.T. (Brown Butter Butter Tart)",
      description: "",
      price: 5.99,
      img: "/images/bbbt.png", // replace with your actual images
    },

  ];

  return (
    <div className="bg-[##fbf1e5] min-h-screen flex flex-col items-center">

        {/* Top text */}
      <div className="w-full flex justify-between items-start px-6">
        <p className="font-petitcochon font-bold text-[#7c4a3a] text-lg tracking-wider">
          FRESH COOKIES?!?!
        </p>
        <p className=" font-petitcochon font-bold text-[#7c4a3a] text-lg tracking-wider">
          IN AJAX?!
        </p>
      </div>

      {/* Subtitle */}
      <p className=" font-petitcochon mt-2 text-[#7c4a3a] text-md tracking-wider font-semibold">
        BUTTER TARTS TOO!
      </p>

      <Link
        to="/order"
        className="font-petitcochon mt-6 bg-[#a46a55] text-white text-4xl font-extrabold
                   px-10 py-6 rounded-[50%] shadow-lg transition-transform
                   hover:scale-105 hover:shadow-xl"
        style={{
          clipPath:
            "polygon(20% 0%, 80% 0%, 100% 30%, 100% 70%, 80% 100%, 20% 100%, 0 70%, 0 30%)",
        }}
      >
        ORDER NOW!
      </Link>

      <div className="max-w-5xl mx-auto flex justify-center space-x-6 mt-6">
        <Link
          to="/about"
          className="font-petitcochon bg-[#e5cbc7] text-[#806154] px-5 py-2 rounded-md font-bold hover:bg-[#d9a68e] transition"
        >
          About Us
        </Link>
        <Link
          to="/faq"
          className="font-petitcochon bg-[#e5cbc7] text-[#806154] px-5 py-2 rounded-md font-bold hover:bg-[#d9a68e] transition"
        >
          FAQ
        </Link>
        <Link
          to="/contact"
          className="font-petitcochon bg-[#e5cbc7] text-[#806154] px-5 py-2 rounded-md font-bold hover:bg-[#d9a68e] transition"
        >
          Contact Us
        </Link>
      </div>

      <div className="bg-[#b67c5a] w-full py-3 px-4 md:px-6 flex items-center justify-between shadow-lg r relative mt-5">
        <img
            src="/images/logo.png"
            alt="Teddy Icon"
            className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain"
        />
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain"
        />
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain"
        />
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain transform scale-x-[-1]"
        />
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain transform scale-x-[-1]"
        />
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain transform scale-x-[-1]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 justify-items-center">

        {products.map((item) => (
          <ItemCard
            key={item.id}
            name={item.name}
            description={item.description}
            price={item.price}
            image={item.img}
          />
        ))}
      </div>

      <Link
        to="/products"
        className="font-petitcochon mt-8 bg-[#e5cbc7] text-[#806154] px-6 py-3 rounded-full shadow-xl text-lg font-bold hover:bg-[#b9967a] transition"
      >
        All Our Products
      </Link>


    </div>
  );
}
