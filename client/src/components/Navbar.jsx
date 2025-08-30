import React from "react";
import { ShoppingBag } from "lucide-react"; // Cart icon

export default function Navbar() {
  return (
    <nav className="bg-[#b67c5a] w-full py-3 px-4 md:px-6 flex items-center justify-between shadow-lg r relative">
      {/* Centered title with images */}
      <div className="absolute left-1/2 transform -translate-x-[68%] flex items-center gap-1 sm:gap-2 md:gap-3 max-w-[90%] ">

        {/* Left image */}
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain"
        />

        {/* Title */}
        <h1 className="font-extrabold text-lg sm:text-xl md:text-2xl text-white tracking-wide drop-shadow-md whitespace-nowrap text-center">
          TADY BAKING CO
        </h1>

        {/* Right image */}
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain transform scale-x-[-1]"
        />
      </div>

      {/* Cart Icon */}
      <button className="text-[#fbf1e5] rounded-full p-2 sm:p-3 shadow-md hover:scale-105 transition ml-auto">
        <ShoppingBag
          size={20}
          className="text-[#fbf1e5] w-8 h-8 sm:w-8  sm:h-8 md:w-10 md:h-10"
        />
      </button>
    </nav>
  );
}
