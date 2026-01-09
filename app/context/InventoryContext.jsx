"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { allItems } from "@/app/utils/shop";
import { FLOWER_LIBRARY } from "../utils/flower";

const InventoryContext = createContext();

export function InventoryProvider({ children }) {
  const [inventory, setInventory] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedInv = localStorage.getItem("inventory");
      if (savedInv) {
        try {
          setInventory(JSON.parse(savedInv));
        } catch (e) {
          console.error("Failed to parse inventory", e);
          setInventory([]);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  const saveToStorage = (newData) => {
    setInventory(newData);
    if (typeof window !== "undefined") {
      localStorage.setItem("inventory", JSON.stringify(newData));
    }
  };

  const addItem = (item) => {
    const processedItem = {
      ...item,
      variants: item.type === "packaging" ? item.variants || [] : null,
      stock: item.type === "flower" ? parseInt(item.stock) : 0,
    };
    saveToStorage([processedItem, ...inventory]);
  };

  const deleteItem = (id) => {
    setInventory((prev) => {
      const newInventory = prev.filter((item) => item.id !== id);
      if (typeof window !== "undefined") {
        localStorage.setItem("inventory", JSON.stringify(newInventory));
      }
      return newInventory;
    });
  };

  const updateItem = (id, updatedFields) => {
    setInventory((prev) => {
      const newInventory = prev.map((item) =>
        item.id === id ? { ...item, ...updatedFields } : item
      );
      if (typeof window !== "undefined") {
        localStorage.setItem("inventory", JSON.stringify(newInventory));
      }
      return newInventory;
    });
  };

  const updateStock = (itemId, amount, variantColor = null) => {
    const newInv = inventory.map((item) => {
      if (item.id !== itemId) return item;

      if (item.type === "flower" || !item.variants) {
        return { ...item, stock: Math.max(0, (item.stock || 0) + amount) };
      }

      if (item.type === "packaging" && variantColor) {
        const updatedVariants = item.variants.map((v) => {
          if (v.color === variantColor) {
            return { ...v, stock: Math.max(0, (v.stock || 0) + amount) };
          }
          return v;
        });
        return { ...item, variants: updatedVariants };
      }

      return item;
    });
    saveToStorage(newInv);
  };

  const getItemsByShop = (shopId) => {
    const contextItems = inventory.filter(
      (item) => String(item.shopId) === String(shopId)
    );

    // 2. From Mock Data (Legacy)
    const mockItems = [...allItems, ...FLOWER_LIBRARY]
      .filter((item) => {
        const itemShopId = item.shop?.id || item.shop_id || item.shopId;
        return String(itemShopId) === String(shopId);
      })
      .map((item) => ({
        ...item,
        shopId: shopId,
        stock: item.stock || 50,
        variants: item.type === "packaging" ? [] : null,
      }));

    const contextIds = new Set(contextItems.map((i) => i.id));
    const filteredMock = mockItems.filter((i) => !contextIds.has(i.id));
    return [...contextItems, ...filteredMock];
    
  };

  return (
    <InventoryContext.Provider
      value={{
        inventory,
        addItem,
        deleteItem,
        updateItem,
        updateStock,
        getItemsByShop,
      }}
    >
      {children}
    </InventoryContext.Provider>
  );
}

export const useInventory = () => useContext(InventoryContext);
