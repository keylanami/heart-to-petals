"use client";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { CheckCircle2, Clock, ChevronRight, Image as ImageIcon, ShoppingBag, Store, Truck, Check } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useOrder } from "@/app/context/OrderContext";
import { useToast } from "@/app/context/ToastContext";

const LOADING_STATE = {
  id: "Loading...",
  items: [], 
  status: "loading",
  timeline: [],
  financials: { itemsTotal: 0, shippingTotal: 0, serviceFee: 0, grandTotal: 0 },
};

export default function OrderProgressPage() {
  const params = useParams();
  const router = useRouter();
  const { showToast } = useToast();
  const { updateOrderStatus } = useOrder(); // Need this to update status
  
  const [order, setOrder] = useState(LOADING_STATE);

  // --- 1. LOAD DATA ---
  useEffect(() => {
    if (typeof window !== "undefined" && params?.id) {
      const allOrders = JSON.parse(localStorage.getItem("orders") || "[]");
      const targetOrder = allOrders.find(o => String(o.id) === String(params.id));
      
      if (targetOrder) {
          // --- DYNAMIC TIMELINE INJECTION ---
          // Inject "On Delivery" event if status is suitable
          let displayedTimeline = [...targetOrder.timeline];
          
          if (targetOrder.status === 'on_delivery' || targetOrder.status === 'completed') {
              // Check if already exists to avoid duplicates
              if (!displayedTimeline.find(t => t.title === "Pesanan Dikirim")) {
                  displayedTimeline.unshift({
                      title: "Pesanan Dikirim",
                      date: "Baru saja",
                      desc: "Kurir sedang menuju ke lokasi tujuan. Estimasi tiba: Hari ini.",
                      status: targetOrder.status === 'completed' ? 'completed' : 'current'
                  });
              }
          }

          if (targetOrder.status === 'completed') {
               if (!displayedTimeline.find(t => t.title === "Pesanan Selesai")) {
                  displayedTimeline.unshift({
                      title: "Pesanan Selesai",
                      date: "Baru saja",
                      desc: "Pesanan telah diterima dengan baik.",
                      status: 'completed'
                  });
              }
          }

          setOrder({ ...targetOrder, timeline: displayedTimeline });
      }
    }
  }, [params?.id]); // Re-run if ID changes

  // --- 2. ACTION HANDLERS ---
  const handleCompleteOrder = () => {
      if (confirm("Apakah pesanan sudah diterima dengan baik?")) {
          // Update Context/Local Storage
          updateOrderStatus(order.id, "completed");
          
          // Update Local State for immediate UI feedback
          setOrder(prev => ({ ...prev, status: "completed" }));
          
          showToast("Terima kasih! Pesanan selesai.", "success");
          setTimeout(() => window.location.reload(), 1000); // Reload to refresh timeline logic
      }
  };

  const { items: orderItems, financials } = order;
  const toRupiah = (num) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumSignificantDigits: 3 }).format(num || 0);

  return (
    <div className="min-h-screen bg-cream-bg font-sans">
      <Navbar />

      <main className="max-w-6xl mx-auto mt-10 px-6 py-24">
        <div className="mb-8">
          <div className="flex items-center gap-2 text-sm text-gray-400 mb-2">
            <span>Orders</span>
            <ChevronRight size={14} />
            <span className="truncate max-w-[200px] font-mono">{order.id}</span>
          </div>
          <h1 className="text-3xl font-serif font-bold text-dark-green mb-2">Progress Pesanan</h1>
          <p className="text-gray-500">Pantau status pesananmu di sini.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* TIMELINE */}
          <div className="flex-1 space-y-6">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 relative overflow-hidden">
              <div className="absolute left-9 top-6 bottom-6 w-0.5 bg-gray-100"></div>
              <div className="space-y-8 relative">
                {order.timeline && order.timeline.length > 0 ? (
                  order.timeline.map((event, idx) => (
                    <div key={idx} className="flex gap-4 relative">
                      <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center shrink-0 z-10 bg-white
                            ${event.status === "completed" ? "border-sage-green text-sage-green" 
                            : event.status === "current" || event.status === "active" ? "border-sage-green bg-sage-green text-white animate-pulse" 
                            : "border-gray-300 text-gray-300"}`}>
                        {event.status === "completed" ? <CheckCircle2 size={16} /> : <Clock size={16} />}
                      </div>
                      <div className="flex-1 pt-1">
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-bold text-dark-green text-sm md:text-base">{event.title}</h4>
                          <span className="text-[10px] text-gray-400 bg-gray-50 px-2 py-1 rounded-full">{event.date}</span>
                        </div>
                        <p className="text-sm text-gray-500 leading-relaxed mb-3 whitespace-pre-wrap">{event.desc}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-gray-400 py-10 text-xs">Memuat status...</p>
                )}
              </div>
            </div>
          </div>

          {/* DETAILS */}
          <div className="w-full lg:w-[400px]">
            <div className="bg-white rounded-2xl p-7 shadow-sm border border-gray-100 sticky top-24">
              <h3 className="font-serif font-bold text-dark-green text-xl mb-6">Rincian Order</h3>
              <div className="mb-6 pb-2 border-b border-gray-100">
                <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mb-3">ITEMS</p>
                <div className="space-y-4 max-h-[240px] overflow-y-auto pr-2 custom-scrollbar">
                    {orderItems && orderItems.map((item, idx) => (
                        <div key={idx} className="flex gap-3">
                            <div className="w-12 h-14 rounded-lg bg-gray-50 overflow-hidden flex-shrink-0 border border-gray-100">
                                <img src={item.image || "/assets/bouquet/placeholder.png"} alt={item.title} className="w-full h-full object-cover"/>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-bold text-gray-800 leading-tight line-clamp-2">{item.title}</p>
                                <div className="flex items-center gap-1 text-[10px] text-sage-green font-bold mt-1">
                                    <Store size={10}/> <span className="truncate">{item.shop?.name || "Florist"}</span>
                                </div>
                                <p className="text-xs text-gray-500 mt-0.5">{item.qty || 1} x {toRupiah(item.price)}</p>
                            </div>
                        </div>
                    ))}
                </div>
              </div>

              <div className="space-y-4 mb-8 pt-2">
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Total Barang</span>
                  <span className="font-bold text-gray-800">{toRupiah(financials.itemsTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Ongkos Kirim</span>
                  <span className="font-bold text-gray-800">{toRupiah(financials.shippingTotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600 text-sm">
                  <span>Biaya Layanan</span>
                  <span className="font-bold text-gray-800">{toRupiah(financials.serviceFee)}</span>
                </div>
                
                <div className="border-t-2 border-gray-100 pt-4 flex justify-between items-center mt-2">
                  <span className="font-bold text-dark-green text-lg">Total Lunas</span>
                  <span className="font-bold text-2xl text-dark-green">{toRupiah(financials.grandTotal)}</span>
                </div>
                <div className="mt-3 bg-green-50 text-green-700 text-xs font-bold px-3 py-3 rounded-xl text-center border border-green-100 flex items-center justify-center gap-2">
                    <CheckCircle2 size={16}/> Pembayaran Diterima
                </div>
              </div>

              {order.status === 'on_delivery' ? (
                  <button 
                    onClick={handleCompleteOrder}
                    className="w-full py-4 bg-dark-green text-white rounded-xl font-bold text-sm hover:bg-sage-green transition shadow-lg flex items-center justify-center gap-2"
                  >
                    <Check size={18} /> Pesanan Diterima & Selesai
                  </button>
              ) : order.status === 'completed' ? (
                  <button disabled className="w-full py-4 bg-green-100 text-green-700 rounded-xl font-bold text-sm cursor-not-allowed border border-green-200 flex items-center justify-center gap-2">
                    <CheckCircle2 size={18} /> Transaksi Selesai
                  </button>
              ) : (
                  <button disabled className="w-full py-4 bg-gray-100 text-gray-400 rounded-xl font-bold text-sm cursor-not-allowed border border-gray-200">
                    {order.status === 'processing' ? 'Pesanan Sedang Diproses...' : 'Menunggu Konfirmasi...'}
                  </button>
              )}
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}