"use client";
import { createContext, useContext, useState, useEffect } from "react";

const OrderContext = createContext();

export function OrderProvider({ children }) {
  const [orders, setOrders] = useState([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedOrders = localStorage.getItem("orders");
      if (savedOrders) {
        try {
          setOrders(JSON.parse(savedOrders));
        } catch (e) {
          console.error("Gagal load orders", e);
        }
      }
      setIsInitialized(true);
    }
  }, []);

  useEffect(() => {
    if (isInitialized && typeof window !== "undefined") {
      localStorage.setItem("orders", JSON.stringify(orders));
    }
  }, [orders, isInitialized]);

  const addOrder = (newOrder) => {
    const finalId = newOrder.id || (Date.now().toString() + Math.random().toString(36).substring(2, 9));

    const orderData = {
      ...newOrder,
      id: finalId, 
      date: newOrder.date || new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
      status: newOrder.status || (newOrder.type === "Custom" ? "waiting_approval" : "processing"),
    };

    setOrders((prev) => [orderData, ...prev]);
  };

  const updateOrderStatus = (orderId, newStatus) => {
    setOrders((prev) => 
      prev.map(order => 
        order.id === orderId ? { ...order, status: newStatus } : order
      )
    );
  };

  
  return (
    <OrderContext.Provider value={{ orders, addOrder, updateOrderStatus, isInitialized }}>
      {children}
    </OrderContext.Provider>
  );
}

export const useOrder = () => useContext(OrderContext);