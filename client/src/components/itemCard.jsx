import React from "react";

const ItemCard = ({ name, description, image, onAddToBag }) => {
  return (
    <div className="border border-black shadow-md p-6 max-w-xs transition-transform transform hover:scale-105 hover:shadow-xl mt-5 bg-[#fbf1e5]">
      <div className="w-full h-45 mb-4 flex items-center justify-center rounded-2xl overflow-hidden">
        <img src={image} alt={name} className="w-4/5 h-auto object-contain" />
      </div>

      <h3 className="text-xl font-bold text-[#4b2e24] text-center leading-tight">
        {name}
      </h3>

      <div className="border-t-2 border-dashed border-[#4b2e24] my-3 mx-auto"></div>

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
