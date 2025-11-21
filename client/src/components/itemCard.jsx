import React from "react";

const ItemCard = ({ name, description, image, onAddToBag }) => {
  return (
    <div className="
      border border-black
      shadow-md
      p-6
      w-64
      h-[330px]          /* less tall → more square */
      flex flex-col
      justify-between
      items-center
      transition-transform
      transform
      hover:scale-105
      hover:shadow-xl
      mt-5
      bg-[#fbf1e5]
    ">

      {/* Image Section */}
      <div className="
        w-full
        h-40              /* reduced height to be more square */
        mb-3
        flex
        items-center
        justify-center
        rounded-2xl
        overflow-hidden
      ">
        <img
          src={image}
          alt={name}
          className="w-[85%] h-auto object-contain"
        />
      </div>

      {/* Title */}
      <h3 className="
        text-md
        font-bold
        text-[#4b2e24]
        text-center
        leading-tight
        px-2
      ">
        {name}
      </h3>

      {/* Canva Style Divider */}
      <div className="w-full flex items-center justify-center my-3">
        <span className="w-2 h-2 bg-[#4b2e24] rounded-full"></span>
        <span className="flex-1 border-t border-dashed border-[#4b2e24] opacity-50 mx-2"></span>
        <span className="w-2 h-2 bg-[#4b2e24] rounded-full"></span>
      </div>

      {/* Add to Bag */}
      <p
        onClick={onAddToBag}
        className="
          font-petitcochon
          text-center
          text-[#b89e92]
          text-xl
          font-bold
          cursor-pointer
          hover:text-[#4b2e24]
          transition
        "
      >
        VIEW
      </p>
    </div>
  );
};

export default ItemCard;
