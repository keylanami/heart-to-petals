"use client";
import { useState, useEffect } from "react"; 
import { motion, AnimatePresence } from "framer-motion";
import { useCart } from "@/app/context/CartContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Trash2, MapPin, Store, Minus, Plus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";

const CartPage = () => {
  const { cart, addToCart, removeFromCart } = useCart();
  const router = useRouter();
  const [selectedItems, setSelectedItems] = useState([]);
  const { showToast } = useToast();

  useEffect(() => {
    setSelectedItems((prev) =>
      prev.filter((id) => cart.find((item) => item.id === id))
    );
  }, [cart]);

  const groupedCart = cart.reduce((acc, item) => {
    const shopId = item.shop?.id || "unknown";
    if (!acc[shopId]) {
      acc[shopId] = { shop: item.shop, items: [] };
    }
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const handleToggleItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems((prev) => prev.filter((itemId) => itemId !== id));
    } else {
      setSelectedItems((prev) => [...prev, id]);
    }
  };

  const handleToggleShop = (shopItems) => {
    const shopItemIds = shopItems.map((i) => i.id);
    const isAllShopSelected = shopItemIds.every((id) =>
      selectedItems.includes(id)
    );

    if (isAllShopSelected) {
      setSelectedItems((prev) =>
        prev.filter((id) => !shopItemIds.includes(id))
      );
    } else {
      const newIds = shopItemIds.filter((id) => !selectedItems.includes(id));
      setSelectedItems((prev) => [...prev, ...newIds]);
    }
  };

  const isAllSelected =
    cart.length > 0 && cart.every((item) => selectedItems.includes(item.id));
  const handleToggleAll = () => {
    if (isAllSelected) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cart.map((item) => item.id));
    }
  };

  const grandTotal = cart
    .filter((item) => selectedItems.includes(item.id))
    .reduce((sum, item) => sum + item.price * item.qty, 0);

  const toRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumSignificantDigits: 3,
    }).format(num);

  
  const decreaseQty = (item) => {
    if (item.qty > 1) {
      addToCart(item, -1);
    } else {
      removeFromCart(item.id);
    }
  };

  const handleCheckout = () => {
    localStorage.setItem("checkoutIds", JSON.stringify(selectedItems));
    showToast("Checkout berhasil! 🎉", "success");
    router.push("/checkout");
  };

  return (
    <main className="bg-[#F5F5F5] min-h-screen pb-32">
      <Navbar />

      <div className="max-w-4xl mx-auto px-4 pt-32">
        <h1 className="text-3xl font-serif font-bold text-dark-green mb-8">
          Shopping Cart
        </h1>

        {cart.length === 0 ? (
          <div className="text-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 text-3xl">
              📝
            </div>
            <h3 className="text-xl font-serif font-bold text-dark-green mb-2">
              Keranjangnya masih kosong, nih.. 
            </h3>
            <p className="text-gray-400 mb-8 max-w-md mx-auto">
              Belanja Dulu Yuk!
            </p>
            <Link
              href="/toko"
              className="px-8 py-3 bg-dark-green text-white rounded-full font-bold hover:bg-sage-green transition shadow-lg"
            >
              Discover Bouquets
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {Object.values(groupedCart).map((group) => {
              const isShopSelected = group.items.every((item) =>
                selectedItems.includes(item.id)
              );

              return (
                <div
                  key={group.shop?.id || "unknown"}
                  className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                >
                  <div className="bg-white p-4 border-b border-gray-100 flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-dark-green cursor-pointer"
                        checked={isShopSelected}
                        onChange={() => handleToggleShop(group.items)}
                      />
                      <Store size={18} className="text-dark-green" />
                      <span className="font-bold text-dark-green">
                        {group.shop?.name || "Unknown Shop"}
                      </span>
                    </div>
                    {group.shop?.location && (
                      <div className="flex items-center gap-1 text-xs text-gray-400 border-l border-gray-200 pl-3 ml-1">
                        <MapPin size={12} />
                        {group.shop.location}
                      </div>
                    )}
                  </div>

                  <div className="p-4 space-y-6">
                    {group.items.map((item) => (
                      <div key={item.id} className="flex gap-4 items-start">
                        <div className="pt-8">
                          <input
                            type="checkbox"
                            className="w-4 h-4 accent-dark-green cursor-pointer"
                            checked={selectedItems.includes(item.id)}
                            onChange={() => handleToggleItem(item.id)}
                          />
                        </div>

                        <div className="w-24 h-24 bg-gray-100 rounded-xl overflow-hidden shrink-0 border border-gray-100">
                          <img
                            src={item.image || item.previewImage}
                            alt={item.title || item.name}
                            className="w-full h-full object-cover"
                          />
                        </div>

                        <div className="flex-1 flex flex-col justify-between min-h-[6rem]">
                          <div>
                            <div className="flex justify-between items-start">
                              <h3 className="font-bold text-gray-800 line-clamp-1">
                                {item.title || item.name}
                              </h3>
                              <button
                                onClick={() => removeFromCart(item.id)}
                                className="text-gray-300 hover:text-red-500 transition"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>
                            <p className="text-xs text-gray-400 mt-1">
                              {item.category
                                ? `${item.category}`
                                : "Custom Bouquet"}{" "}
                              • {item.tag || "Handmade"}
                            </p>
                          </div>

                          <div className="flex justify-between items-end mt-4">
                            <span className="font-sans font-bold text-dark-green">
                              {toRupiah(item.price)}
                            </span>

                            <div className="flex items-center gap-3 bg-gray-50 rounded-full px-3 py-1 border border-gray-200">
                              <button
                                onClick={() => decreaseQty(item)}
                                className="text-gray-400 hover:text-dark-green text-xs"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="text-sm font-bold w-4 text-center">
                                {item.qty}
                              </span>
                              <button
                                onClick={() => addToCart(item, 1)}
                                className="text-gray-400 hover:text-dark-green text-xs"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {cart.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)] z-40">
          <div className="max-w-4xl mx-auto flex justify-between items-center">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                className="w-5 h-5 accent-dark-green cursor-pointer"
                checked={isAllSelected}
                onChange={handleToggleAll}
              />
              <span className="text-sm font-medium text-gray-600">
                Pilih Semua ({cart.length})
              </span>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-xs text-gray-400 mb-1">
                  Total ({selectedItems.length} produk):
                </p>
                <motion.p
                  key={grandTotal}
                  initial={{ scale: 1.1, color: "#5F8D4E" }}
                  animate={{ scale: 1, color: "#2F4F4F" }}
                  className="text-xl font-bold text-sage-green font-sans"
                >
                  {toRupiah(grandTotal)}
                </motion.p>
              </div>

              <button
                disabled={selectedItems.length === 0}
                onClick={handleCheckout}
                className={`px-8 py-3 rounded-full font-bold shadow-lg transition transform active:scale-95 ${
                  selectedItems.length === 0
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-dark-green text-white hover:bg-sage-green"
                }`}
              >
                Checkout ({selectedItems.length})
              </button>
            </div>
          </div>
        </div>
      )}

     
    </main>
  );
};

export default CartPage;
