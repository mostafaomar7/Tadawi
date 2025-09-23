import React, { createContext, useState } from "react";

export const CartContext = createContext({
  cartItemCount: 0,
  setCartItemCount: () => {},
});

export const CartProvider = ({ children }) => {
  const [cartItemCount, setCartItemCount] = useState(0);

  return (
    <CartContext.Provider value={{ cartItemCount, setCartItemCount }}>
      {children}
    </CartContext.Provider>
  );
};
