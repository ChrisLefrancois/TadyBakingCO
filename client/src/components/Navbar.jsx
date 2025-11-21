import React from "react";
import { Link } from "react-router-dom";
import CartIcon from "./cartIcon.jsx";

export default function Navbar() {
  return (
    <nav className="bg-[#b67c5a] w-full py-3 px-4 md:px-6 flex items-center justify-between shadow-lg relative">

      {/* Perfectly centered title with images */}
      <Link
        to="/"
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                   flex items-center gap-1 sm:gap-2 md:gap-3 cursor-pointer"
      >
        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain"
        />

        <h1 className="font-petitcochon font-extrabold text-lg sm:text-xl md:text-2xl text-white tracking-wide drop-shadow-md whitespace-nowrap text-center">
          TADY BAKING CO
        </h1>

        <img
          src="/images/logo.png"
          alt="Teddy Icon"
          className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 object-contain scale-x-[-1]"
        />
      </Link>

      {/* Cart Icon */}
      <div className="ml-auto cart-target relative z-10">
        <CartIcon />
      </div>
    </nav>
  );
}
