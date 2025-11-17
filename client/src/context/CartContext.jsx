import React, { createContext, useContext, useState, useEffect } from "react";

// Create context
const CartContext = createContext();



// Custom hook
export const useCart = () => useContext(CartContext);

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Add item to cart
  // Add item to cart — each pack type is a unique line
const addToCart = (item, qty, unitPrice, totalPrice) => {
  setCart((prev) => {
    const existing = prev.find(
      (p) => p.item._id === item._id && p.unitPrice === unitPrice
    );

    if (existing) {
      // same pack already in cart
      return prev.map((p) =>
        p.item._id === item._id && p.unitPrice === unitPrice
          ? { ...p, qty: p.qty + qty, totalPrice: p.totalPrice + totalPrice }
          : p
      );
    }

    // add as new pack line
    return [...prev, { item, qty, unitPrice, totalPrice }];
  });
};

// Remove a specific pack type
const removeFromCart = (id, unitPrice) => {
  setCart((prev) =>
    prev.filter(
      (p) => !(p.item._id === id && p.unitPrice === unitPrice)
    )
  );
};


  // Empty the cart
  const clearCart = () => setCart([]);

  const totalItems = cart.reduce((sum, p) => sum + p.qty, 0);
  const totalPrice = cart.reduce((sum, p) => sum + p.totalPrice, 0);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        removeFromCart,
        clearCart,
        totalItems,
        totalPrice,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

// ✨ FLY TO CART ANIMATION
export function animateFlyToCart(imgSrc, startX, startY) {
  const cartIcon = document.querySelector(".cart-icon");
  if (!cartIcon) return;

  const cartRect = cartIcon.getBoundingClientRect();

  // Create floating image
  const img = document.createElement("img");
  img.src = imgSrc;
  img.className = "flying-img";
  img.style.left = `${startX}px`;
  img.style.top = `${startY}px`;

  document.body.appendChild(img);

  // Force browser layout to enable animation
  img.getBoundingClientRect();

  img.style.transform = `translate(${cartRect.left - startX}px, ${cartRect.top - startY}px) scale(0.2)`;
  img.style.opacity = "0";

  setTimeout(() => img.remove(), 900);
}
