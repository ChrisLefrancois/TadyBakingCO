// src/components/ItemCard.jsx
import React from "react";

const ItemCard = ({ title, description, price, image }) => {
  return (
    <div className="border border-black shadow-lg p-6 max-w-xs transition-transform transform hover:scale-105 hover:shadow-xl mt-5">
      {/* Image */}
      <div className="w-full h-48 mb-4 rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      <h3 className="text-2xl font-bold text-[#4b2e24]">{title}</h3>

      {/* Description */}
      <p className="text-gray-600 mt-2 text-sm">{description}</p>

      <hr />

      {/* Price */}
      <button className="text-[#b89e92]">Add To Cart</button>
    </div>
  );
};

export default ItemCard;
