import { Link } from "react-router-dom";

export default function NavBubble({ to, children, className = "" }) {
  return (
    <Link
      to={to}
      className={`bg-[#cfae91] text-[#4b2e24] px-6 py-3 rounded-full font-semibold
      shadow-md hover:scale-105 transition text-lg text-center whitespace-nowrap ${className}`}
    >
      {children}
    </Link>
  );
}
