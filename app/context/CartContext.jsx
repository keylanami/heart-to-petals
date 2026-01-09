"use client";
import { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false); 

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedCart = localStorage.getItem("myCart");
      if (savedCart) {
        try { setCart(JSON.parse(savedCart)); } 
        catch (e) { console.error(e); }
      }
      setIsInitialized(true); 

      const handleResetCart = () => {
          setCart([]);
          localStorage.removeItem("myCart");
      };

      window.addEventListener("reset-cart", handleResetCart);
      
      return () => {
          window.removeEventListener("reset-cart", handleResetCart);
      };
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("myCart", JSON.stringify(cart));
      window.dispatchEvent(new Event("storage"));
    }
  }, [cart, isInitialized]);


  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const existingItemIndex = prev.findIndex((item) => item.id === product.id);
      if (existingItemIndex > -1) {
        const newCart = [...prev];
        newCart[existingItemIndex].qty += quantity;
        if (newCart[existingItemIndex].qty <= 0) {
            newCart.splice(existingItemIndex, 1); 
        }
        return newCart;
      } else {
        if (quantity > 0) return [...prev, { ...product, qty: quantity }];
        return prev;
      }
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const removeItems = (idsToRemove) => {
    setCart((prev) => prev.filter((item) => !idsToRemove.includes(item.id)));
  };

  const clearCart = () => {
    setCart([]);
  };

  const totalItems = cart.reduce((acc, item) => acc + item.qty, 0);

  return (
    <CartContext.Provider value={{ cart, removeItems, addToCart, removeFromCart, clearCart, totalItems }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  return useContext(CartContext);
}