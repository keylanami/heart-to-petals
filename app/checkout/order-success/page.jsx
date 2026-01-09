"use client";
export const dynamic = "force-dynamic";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { Check, Copy, ArrowRight, Clock, ShoppingBag } from "lucide-react";
import { useState, Suspense } from "react";
import { useOrder } from "@/app/context/OrderContext";


function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const vaNumber = "880123456789";
  const [copied, setCopied] = useState(false);
  const router = useRouter();
  const orderId = searchParams.get("id") || "ORD-UNKNOWN";

  

  const handleCopy = () => {
    navigator.clipboard.writeText(vaNumber);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCekStatus = () => {
    if (orderId && orderId !== "ORD-UNKNOWN") {
      router.push(`/orders/${orderId}`);
    } else {
      router.push("/profile");
    }
  };

  return (
    <main className="bg-[#F5F5F5] min-h-screen">
      <div className="max-w-xl mx-auto px-6 pt-16 pb-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl shadow-lg overflow-hidden text-center relative"
        >
          <div className="bg-dark-green h-32 relative flex items-center justify-center">
            <div className="absolute -bottom-10 bg-white p-3 rounded-full">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 200, delay: 0.2 }}
                className="w-20 h-20 bg-sage-green rounded-full flex items-center justify-center shadow-lg"
              >
                <Check size={40} className="text-white" strokeWidth={3} />
              </motion.div>
            </div>
          </div>

          <div className="pt-14 pb-8 px-8">
            <h1 className="text-2xl font-serif font-bold text-dark-green mb-2">
              Pesanan Berhasil Dibuat!
            </h1>
            <p className="text-gray-500 text-sm mb-6">
              Terima kasih telah berbelanja di HeartToPetals.
            </p>

            <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 mb-6 text-left">
              <div className="flex justify-between items-center mb-4 border-b border-gray-200 pb-3">
                <span className="text-xs text-gray-500 font-bold uppercase tracking-wider">
                  Order ID
                </span>
                <span className="text-sm font-bold text-dark-green">
                  #{orderId}
                </span>
              </div>

              <div className="mb-2">
                <p className="text-xs text-gray-500 mb-1">Batas Pembayaran</p>
                <div className="flex items-center gap-2 text-orange-600 font-bold text-sm">
                  <Clock size={16} />
                  <span>23 Jam 59 Menit</span>
                </div>
              </div>

              <div className="mt-4">
                <p className="text-xs text-gray-500 mb-2">
                  BCA Virtual Account
                </p>
                <div className="flex items-center gap-2 bg-white border border-gray-200 p-3 rounded-lg shadow-sm">
                  <img
                    src="https://upload.wikimedia.org/wikipedia/commons/5/5c/Bank_Central_Asia.svg"
                    alt="BCA"
                    className="h-4"
                  />
                  <span className="flex-1 font-mono font-bold text-lg text-gray-800 tracking-wider">
                    {vaNumber}
                  </span>
                  <button
                    onClick={handleCopy}
                    className="text-gray-400 hover:text-dark-green transition"
                  >
                    {copied ? (
                      <span className="text-xs font-bold text-green-600">
                        Copied!
                      </span>
                    ) : (
                      <Copy size={18} />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <p className="text-xs text-gray-400 mb-8 leading-relaxed">
              Pesanan akan otomatis diproses oleh Vendor setelah pembayaran
              terverifikasi. Cek email kamu untuk detail lengkap.
            </p>

            <div className="space-y-3">
              <button
                onClick={handleCekStatus}
                className="w-full py-3 bg-dark-green text-white rounded-full font-bold shadow-md hover:bg-sage-green transition"
              >
                Cek Status Pesanan
              </button>

              <Link href="/toko" className="block w-full">
                <button className="w-full py-3 bg-white border border-gray-200 text-gray-600 rounded-full font-bold hover:bg-gray-50 transition flex items-center justify-center gap-2">
                  <ShoppingBag size={18} />
                  Belanja Lagi
                </button>
              </Link>
            </div>
          </div>
        </motion.div>

        {/* HELPER TEXT */}
        <div className="text-center mt-8 text-gray-400 text-xs">
          <p>
            Butuh bantuan?{" "}
            <a href="#" className="underline hover:text-dark-green">
              Hubungi CS kami
            </a>
          </p>
        </div>
      </div>
      <Footer />
    </main>
  );
}


export default function OrderSuccessPage(){
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-[#F5F5F5]">
                <div className="text-gray-400 font-bold animate-pulse">Memuat...</div>
            </div>
        }>
            <OrderSuccessContent />
        </Suspense>
    );
}