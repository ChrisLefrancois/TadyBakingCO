import React from "react";

const ItemCard = ({ name, description, image, onAddToBag }) => {
  return (
    <div
      onClick={onAddToBag}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          onAddToBag();
        }
      }}
      className="
        border border-black
        shadow-md
        p-6
        w-64
        h-[330px]
        flex flex-col
        justify-between
        items-center
        transition-transform
        transform
        hover:scale-105
        hover:shadow-xl
        mt-5
        bg-[#fbf1e5]
        cursor-pointer
      "
    >
      {/* Image Section */}
      <div
        className="
          w-full
          h-40
          mb-3
          flex
          items-center
          justify-center
          rounded-2xl
          overflow-hidden
        "
      >
        <img
          src={image}
          alt={name}
          className="w-[85%] h-auto object-contain pointer-events-none"
        />
      </div>

      {/* Title */}
      <h3
        className="
          text-md
          font-bold
          text-[#4b2e24]
          text-center
          leading-tight
          px-2
          pointer-events-none
        "
      >
        {name}
      </h3>

      {/* Divider */}
      <div className="w-full flex items-center justify-center my-3 pointer-events-none">
        <span className="w-2 h-2 bg-[#4b2e24] rounded-full"></span>
        <span className="flex-1 border-t border-dashed border-[#4b2e24] opacity-50 mx-2"></span>
        <span className="w-2 h-2 bg-[#4b2e24] rounded-full"></span>
      </div>

      {/* View */}
      <p
        className="
          font-petitcochon
          text-center
          text-[#b89e92]
          text-xl
          font-bold
          hover:text-[#4b2e24]
          transition
          pointer-events-none
        "
      >
        VIEW
      </p>
    </div>
  );
};

export default ItemCard;
