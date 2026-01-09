"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { SHOPS as INITIAL_SHOPS } from "@/app/utils/shop"; 

const ShopContext = createContext();

export function ShopProvider({ children }) {
  const [shops, setShops] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedShops = localStorage.getItem("shops");
      if (savedShops) {
        setShops(JSON.parse(savedShops));
      } else {
        const formattedShops = INITIAL_SHOPS.map(s => ({ ...s, status: 'active' }));
        setShops(formattedShops);
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) {
      localStorage.setItem("shops", JSON.stringify(shops));
    }
  }, [shops, isInitialized]);


  const registerShop = (newShopData) => {
    const newShop = {
      ...newShopData,
      id: Date.now(), 
      rating: 0,
      reviewCount: 0,
      distance: "Baru", // Nanti pake API Maps
      status: "active", 
      items: [] 
    };
    setShops(prev => [newShop, ...prev]);
    return newShop;
  };

  const toggleCustomFeature = (shopId, status) => {
    setShops(prev => prev.map(shop => 
      shop.id === shopId ? { ...shop, can_customize: status } : shop
    ));
  };

  return (
    <ShopContext.Provider value={{ shops, registerShop, toggleCustomFeature }}>
      {children}
    </ShopContext.Provider>
  );
}

export const useShop = () => useContext(ShopContext);