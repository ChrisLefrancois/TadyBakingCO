import React from "react";

const ItemCard = ({ name, description, image, onAddToBag }) => {
  return (
    <div className="border border-black shadow-md p-6 w-64 h-[380px] flex flex-col justify-between items-center transition-transform transform hover:scale-105 hover:shadow-xl mt-5 bg-[#fbf1e5] ">
      {/* Image Section */}
      <div className="w-full h-48 mb-4 flex items-center justify-center rounded-2xl overflow-hidden">
        <img
          src={image}
          alt={name}
          className="w-[90%] h-auto object-contain"
        />
      </div>

      {/* Title */}
      <h3 className="text-lg font-bold text-[#4b2e24] text-center leading-tight px-2">
        {name}
      </h3>

      {/* Dashed divider */}
      <div className="border-t-2 border-dashed border-[#4b2e24] my-3 w-full"></div>

      {/* Add to Bag */}
      <p
        onClick={onAddToBag}
        className="font-petitcochon text-center text-[#b89e92] text-xl font-bold cursor-pointer hover:text-[#4b2e24] transition"
      >
        ADD TO BAG
      </p>
    </div>
  );
};

export default ItemCard;
