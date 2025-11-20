import React from "react";
import { Link, useNavigate } from "react-router-dom";

export default function AdminNavbar() {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("tady_admin_token");
    navigate("/admin/login");
  }

  return (
    <nav className="bg-[#b67c5a] border-b border-[#b67c5a] px-6 py-4 shadow-md">
      <div className="max-w-6xl mx-auto flex items-center justify-between">

        {/* Logo / Title */}
        <Link to="/" className="text-2xl font-petitcochon text-[#4b2e24]">
          Tady Baking – Admin
        </Link>

        {/* Desktop Navigation */}
        <div className="hidden sm:flex items-center space-x-6">
          <Link
            to="/admin/orders"
            className="text-[#4b2e24] font-medium hover:text-[#b67c5a]"
          >
            Orders
          </Link>

          <Link
            to="/items"
            className="text-[#4b2e24] font-medium hover:text-[#b67c5a]"
          >
            Menu Items
          </Link>

          <button
            onClick={handleLogout}
            className="bg-[#b67c5a] text-white px-4 py-2 rounded-full hover:bg-[#a06a4f] transition"
          >
            Logout
          </button>
        </div>

        {/* Mobile Menu (simpler version) */}
        <div className="sm:hidden">
          <button
            onClick={handleLogout}
            className="bg-[#b67c5a] text-white px-3 py-1 rounded-full text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
