"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import { ShoppingBag, Store, ArrowRight, Flower } from "lucide-react";

export default function GetStartedPage() {
  return (
    <main className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-green-100/50 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-yellow-100/50 rounded-full blur-[100px]" />
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="text-center z-10 max-w-2xl mb-12"
      >
        <div className="flex justify-center mb-6">
            <div className="w-16 h-16 bg-dark-green rounded-full flex items-center justify-center text-white shadow-xl">
                <Flower size={32} />
            </div>
        </div>
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-dark-green mb-4">
          HeartToPetals.
        </h1>
        <p className="text-xl md:text-2xl text-gray-600 font-light">
          Apa yang ingin kamu lakukan hari ini?
        </p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10">
        
        {/* OPTION 1: BUYER */}
        <Link href="/register" className="group">
            <motion.div 
                whileHover={{ y: -10 }}
                className="bg-white p-8 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-2xl hover:border-sage-green transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-sage-green/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-dark-green mb-6 group-hover:scale-110 transition-transform duration-300">
                    <ShoppingBag size={40} />
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-dark-green mb-2">
                    I want to Buy
                </h3>
                <p className="text-gray-500 mb-8 leading-relaxed">
                    Jelajahi ratusan buket bunga unik dan custom pesananmu dari florist terbaik.
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-sage-green uppercase tracking-widest group-hover:gap-4 transition-all">
                    Register as Buyer <ArrowRight size={16} />
                </div>
            </motion.div>
        </Link>

        {/* OPTION 2: SELLER (TENANT) */}
        <Link href="/register/tenant" className="group">
            <motion.div 
                whileHover={{ y: -10 }}
                className="bg-[#1A2F24] p-8 rounded-[2rem] shadow-xl hover:shadow-2xl transition-all duration-300 h-full flex flex-col items-center text-center cursor-pointer relative overflow-hidden border border-gray-800"
            >
                 {/* Decorative Circle */}
                 <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/5 rounded-full blur-2xl group-hover:bg-white/10 transition-colors" />

                <div className="w-24 h-24 bg-white/10 rounded-full flex items-center justify-center text-white mb-6 group-hover:scale-110 transition-transform duration-300 backdrop-blur-sm border border-white/10">
                    <Store size={40} />
                </div>
                
                <h3 className="text-2xl font-serif font-bold text-white mb-2">
                    I want to Sell
                </h3>
                <p className="text-gray-400 mb-8 leading-relaxed">
                    Bergabung sebagai mitra florist (Tenant), kelola stok, dan terima pesanan custom.
                </p>

                <div className="mt-auto flex items-center gap-2 text-sm font-bold text-white uppercase tracking-widest group-hover:gap-4 transition-all">
                    Register as Tenant <ArrowRight size={16} />
                </div>
            </motion.div>
        </Link>

      </div>

      <p className="mt-12 text-sm text-gray-400">
        Sudah punya akun? <Link href="/login" className="text-dark-green font-bold underline hover:text-sage-green">Login disini</Link>
      </p>

    </main>
  );
}