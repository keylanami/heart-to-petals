"use client";
import { useState, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import {
  MapPin,
  Star,
  Palette,
  Package,
  ShoppingBag,
  ArrowUpRight,
  Sparkles,
  Store,
  X,
  ArrowLeft,
  ArrowRight,
  Search,
  LayoutGrid,
  Grid3X3,
  Navigation,
  Phone,
  ExternalLink,
  Slash
} from "lucide-react";
import { SHOPS, allItems } from "@/app/utils/shop";
import { useCart } from "@/app/context/CartContext";
import { useParams, useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext"; // Pastikan path ini benar
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

// --- ANIMATION VARIANTS ---
const pageVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1, delayChildren: 0.1 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 50, damping: 20 },
  },
};

const containerVariants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
};

// --- COMPONENTS ---

const ShopSelectionModal = ({ isOpen, onClose }) => {
  const customShops = SHOPS.filter((shop) => shop.can_customize);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            onClick={(e) => e.stopPropagation()}
            className="fixed z-[70] bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-cream-bg">
              <div>
                <h3 className="font-serif text-2xl font-bold text-dark-green">
                  Pilih Florist
                </h3>
                <p className="text-gray-500 text-sm">
                  Pilih partner florist untuk meracik buketmu.
                </p>
              </div>
              <button
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition"
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>
            <div className="p-6 overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {customShops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/custom/${shop.id}`}
                    className="group flex items-center gap-4 p-3 rounded-2xl border border-gray-100 hover:border-dark-green hover:bg-cream-bg transition-all duration-300"
                  >
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-dark-green truncate">
                        {shop.name}
                      </h4>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Star
                            size={10}
                            className="text-yellow-400 fill-current"
                          />{" "}
                          {shop.rating}
                        </span>
                        <span>•</span>
                        <span className="truncate">{shop.location}</span>
                      </div>
                    </div>
                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center text-dark-green group-hover:bg-dark-green group-hover:text-white transition">
                      <ArrowRight size={14} />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

const TopShopCard = ({ shop }) => (
  <motion.div variants={itemVariants}>
    <Link
      href={`/shop/${shop.id}`}
      className="group relative flex-shrink-0 w-[240px] h-[320px] block cursor-pointer"
    >
      <div className="w-full h-full mt-3 rounded-xl overflow-hidden relative shadow-md group-hover:shadow-2xl transition-all duration-500 transform group-hover:-translate-y-2">
        <img
          src={shop.image}
          alt={shop.name}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#1A2F24] via-[#1A2F24]/40 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-90"></div>
        <div className="absolute top-4 left-4 z-10">
          {shop.can_customize ? (
            <div className="flex items-center gap-1.5 bg-white/40 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-bold text-white shadow-sm tracking-widest uppercase">
              <Palette size={10} /> Custom
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-white/20 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full text-[9px] font-bold text-white shadow-sm tracking-widest uppercase">
              <Package size={10} />
            </div>
          )}
        </div>
        <div className="absolute top-4 right-4 bg-white/20 backdrop-blur-md border border-white/20 px-2 py-1 rounded-full flex items-center gap-1 text-[10px] font-bold text-white shadow-sm">
          <Star size={10} fill="currentColor" className="text-yellow-400" />{" "}
          {shop.rating}
        </div>
        <div className="absolute bottom-0 left-0 w-full p-6 text-white text-center">
          <h3 className="font-serif text-xl font-bold leading-tight mb-1 group-hover:text-sage-green transition-colors">
            {shop.name}
          </h3>
          <p className="text-[10px] text-white/70 uppercase tracking-widest mb-4 flex items-center justify-center gap-1">
            <MapPin size={10} /> {shop.location}
          </p>
          <div className="h-0 group-hover:h-8 overflow-hidden transition-all duration-300">
            <div className="flex items-center justify-center gap-2 text-[10px] font-bold uppercase tracking-widest text-sage-green opacity-0 group-hover:opacity-100 transition-opacity delay-100">
              Visit Flowershop <ArrowRight size={12} />
            </div>
          </div>
        </div>
      </div>
    </Link>
  </motion.div>
);

const BentoCard = ({ product, index, className }) => {
  const isDark = product.theme === "dark";
  const { addToCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

  const stock = product.stock || 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!user) {
      showToast("Eits, login dulu baru bisa belanja! 🛒", "error");
      router.push("/login");
      return;
    }
    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return;
    }
    addToCart(product, 1);
    showToast(`${product.title} masuk keranjang!`, "success");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!user) {
      showToast("Eits, login dulu baru bisa belanja! 🛒", "error");
      router.push("/login");
      return;
    }
    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return;
    }
    addToCart(product, 1);
    router.push(`/checkout?direct=true&id=${product.id}`);
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      className={`group relative overflow-hidden h-full shadow-sm transition-all duration-500 
        ${className} 
        ${isOutOfStock ? "grayscale opacity-60 cursor-not-allowed" : "hover:shadow-2xl cursor-pointer"}
      `}
    >
      {!isOutOfStock && <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isOutOfStock ? "" : "group-hover:scale-110"}`}
        />
      </div>
      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          isDark
            ? "from-[#0F1F18] via-[#0F1F18]/40"
            : "from-[#8C8681] via-[#8C8681]/20"
        } to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
      ></div>

      <div className="absolute top-5 left-5 z-20 pointer-events-none flex flex-col items-start gap-2">
        {product.shop && (
          <div className="bg-white/90 backdrop-blur-md border border-white/50 text-dark-green py-1.5 px-3 rounded-full shadow-lg flex items-center gap-1.5">
            <Store size={10} />
            <span className="text-[9px] font-bold uppercase tracking-widest">
              {product.shop.name}
            </span>
          </div>
        )}
        {isOutOfStock ? (
             <span className="bg-gray-800 text-white border border-gray-600 text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full shadow-sm flex items-center gap-1">
                <Slash size={10} /> Stok Habis
             </span>
        ) : (
             <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
               {product.tag}
             </span>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end z-20 pointer-events-none ${
          isDark ? "text-cream-bg" : "text-white"
        }`}
      >
        <div className={`transform transition-transform duration-500 ${!isOutOfStock && "group-hover:-translate-y-2"}`}>
          <h3 className="text-2xl md:text-3xl font-serif font-bold leading-tight mb-1 drop-shadow-lg">
            {product.title}
          </h3>
          <p className="font-sans font-medium text-lg opacity-90 mb-2">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumSignificantDigits: 3,
            }).format(product.price)}
          </p>
        </div>
        {!isOutOfStock && (
            <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
            <div className="overflow-hidden">
                <p className="text-sm opacity-90 line-clamp-2 mb-5 leading-relaxed font-light">
                {product.desc}
                </p>
                <div className="flex gap-3 pb-1 pointer-events-auto">
                <button
                    onClick={handleAddToCart}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide backdrop-blur-md border transition-all active:scale-95 ${
                    isDark
                        ? "bg-cream-bg/90 text-dark-green border-cream-bg hover:bg-white"
                        : "bg-dark-green/80 text-white border-dark-green/50 hover:bg-dark-green"
                    }`}
                >
                    <ShoppingBag size={14} /> Add
                </button>
                <button
                    onClick={handleCheckout}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-full text-xs font-bold uppercase tracking-wide transition-all active:scale-95 ${
                    isDark
                        ? "bg-transparent border border-cream-bg/50 text-cream-bg hover:bg-cream-bg hover:text-dark-green"
                        : "bg-white/20 border border-white/50 text-white hover:bg-white hover:text-dark-green"
                    }`}
                >
                    Checkout <ArrowRight size={14} />
                </button>
                </div>
            </div>
            </div>
        )}
      </div>
    </motion.div>
  );
};

const CompactCard = ({ product }) => {
  const isDark = product.theme === "dark";
  const { addToCart } = useCart();
  const router = useRouter();
  const { showToast } = useToast();
  const { user } = useAuth();

  const stock = product.stock || 0;
  const isOutOfStock = stock <= 0;

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    if (!user) {
      showToast("Eits, login dulu baru bisa belanja! 🛒", "error");
      router.push("/login");
      return;
    }
    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return;
    }
    addToCart(product, 1);
    showToast(`${product.title} masuk keranjang!`, "success");
  };

  const handleCheckout = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (isOutOfStock) return;

    if (!user) {
      showToast("Eits, login dulu baru bisa belanja! 🛒", "error");
      router.push("/login");
      return;
    }
    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return;
    }
    addToCart(product, 1);
    router.push(`/checkout?direct=true&id=${product.id}`);
  };

  return (
    <motion.div
      variants={itemVariants}
      className={`group relative overflow-hidden h-full shadow-sm transition-all duration-500 min-h-[360px] aspect-[3/4] 
        ${isOutOfStock ? "grayscale opacity-60 cursor-not-allowed" : "hover:shadow-2xl cursor-pointer"}
      `}
    >
      {!isOutOfStock && <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />}
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className={`w-full h-full object-cover transition-transform duration-700 ease-in-out ${isOutOfStock ? "" : "group-hover:scale-110"}`}
        />
      </div>

      <div
        className={`absolute inset-0 bg-gradient-to-t ${
          isDark
            ? "from-[#0F1F18] via-[#0F1F18]/40"
            : "from-[#8C8681] via-[#8C8681]/20"
        } to-transparent opacity-60 group-hover:opacity-80 transition-opacity duration-500`}
      ></div>

      <div className="absolute top-4 left-4 z-20 pointer-events-none flex flex-col items-start gap-2">
        {product.shop && (
          <div className="bg-white/90 backdrop-blur-md border border-white/50 text-dark-green py-1 px-2.5 rounded-full shadow-lg flex items-center gap-1.5">
            <Store size={9} />
            <span className="text-[8px] font-bold uppercase tracking-widest">
              {product.shop.name}
            </span>
          </div>
        )}
        {isOutOfStock ? (
             <span className="bg-gray-800 text-white border border-gray-600 text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
                <Slash size={9} /> Stok Habis
             </span>
        ) : (
             <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
              {product.tag}
            </span>
        )}
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end z-20 pointer-events-none ${
          isDark ? "text-cream-bg" : "text-white"
        }`}
      >
        <div className={`transform transition-transform duration-500 ${!isOutOfStock && "group-hover:-translate-y-2"}`}>
          <h3 className="text-xl font-serif font-bold leading-tight mb-1 drop-shadow-lg">
            {product.title}
          </h3>
          <p className="font-sans font-medium text-base opacity-90 mb-2">
            {new Intl.NumberFormat("id-ID", {
              style: "currency",
              currency: "IDR",
              maximumSignificantDigits: 3,
            }).format(product.price)}
          </p>
        </div>

        {!isOutOfStock && (
             <div className="grid grid-rows-[0fr] group-hover:grid-rows-[1fr] transition-[grid-template-rows] duration-500 ease-out">
             <div className="overflow-hidden">
                 <div className="flex gap-2 pb-1 pointer-events-auto mt-2">
                 <button
                     onClick={handleAddToCart}
                     className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide backdrop-blur-md border transition-all active:scale-95 ${
                     isDark
                         ? "bg-cream-bg/90 text-dark-green border-cream-bg hover:bg-white"
                         : "bg-dark-green/80 text-white border-dark-green/50 hover:bg-dark-green"
                     }`}
                 >
                     <ShoppingBag size={12} /> Add
                 </button>
                 <button
                     onClick={handleCheckout}
                     className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-bold uppercase tracking-wide transition-all active:scale-95 ${
                     isDark
                         ? "bg-transparent border border-cream-bg/50 text-cream-bg hover:bg-cream-bg hover:text-dark-green"
                         : "bg-white/20 border border-white/50 text-white hover:bg-white hover:text-dark-green"
                     }`}
                 >
                     Checkout <ArrowRight size={12} />
                 </button>
                 </div>
             </div>
             </div>
        )}
      </div>
    </motion.div>
  );
};

const PromoCard = ({ className, shopId }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleStartCustom = (e) => {
    e?.preventDefault();

    if (!user) {
      showToast("Hey, login dulu baru bisa kustom!", "error");
      router.push("/login");
      return;
    }

    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return;
    }

    router.push(shopId ? `/custom/${shopId}` : "/custom");
  };

  return (
    <motion.div
      layout
      variants={itemVariants}
      className={`group relative overflow-hidden h-full bg-gradient-to-br from-[#8FA89B] to-[#1A2F24] text-white p-8 md:p-10 flex flex-col justify-center items-start text-left shadow-xl ${className}`}
    >
      <div
        className="absolute inset-0 opacity-20 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, rgba(255,255,255,0.8) 1px, transparent 0)",
          backgroundSize: "24px 24px",
        }}
      ></div>
      <span className="relative z-10 text-[10px] font-bold tracking-[0.2em] uppercase bg-white/20 border border-white/10 px-3 py-1 rounded-full mb-6 inline-block backdrop-blur-md">
        Exclusive Offer
      </span>
      <h3 className="relative z-10 text-3xl md:text-5xl font-serif font-bold mb-6 leading-[1.1]">
        Punya Cerita <br /> <span className="italic text-cream-bg">Sendiri?</span>
      </h3>

      <Link
        onClick={handleStartCustom}
        href={shopId ? `/custom/${shopId}` : "/custom"}
        className="relative z-10 group/btn flex items-center gap-3 bg-cream-bg text-dark-green px-8 py-4 rounded-full font-bold text-sm hover:bg-white transition-all hover:scale-105 shadow-lg hover:shadow-xl"
      >
        <span>Mulai Custom Sekarang</span>
        <ArrowUpRight size={18} />
      </Link>
      <Sparkles
        strokeWidth={1}
        size={180}
        className="absolute -bottom-10 -right-10 text-white/5 rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-45 transition-transform duration-700 ease-in-out"
      />
    </motion.div>
  );
};

// --- MAIN PAGE ---
export default function ShopEtalasePage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeMood, setActiveMood] = useState("All");
  const { user } = useAuth();
  const { showToast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topSectionRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isSearching = searchQuery.trim().length > 0;
  const [viewMode, setViewMode] = useState("bento");

  const currentShop = SHOPS.find((s) => String(s.id) === String(id));

  // --- MAP & CONTACT LOGIC ---
  const shopCoordinate = currentShop
    ? { lat: currentShop.lat || -6.914744, lng: currentShop.lng || 107.60981 }
    : { lat: -6.914744, lng: 107.60981 };
  const shopPhone = currentShop?.phone || "+62 821-2345-6789";
  // ---------------------------

  const handleStartCustom = (e) => {
    e?.preventDefault();

    if (!user) {
      showToast("Hey, login dulu baru bisa kustom!", "error");
      router.push("/login");
      return;
    }

    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast("Gunakan akun user untuk kustom!", "error");
      return;
    }

    router.push(`/custom/${currentShop.id}`);
  };

  const shopProducts = allItems.filter((item) => {
    if (!currentShop) return false;
    if (item.type === "promo") {
      return currentShop.can_customize;
    }
    return item.shop?.id === currentShop.id;
  });

  const finalDisplayItems = useMemo(() => {
     // 1. Filter dasar (Category & Search Query)
     const filtered = shopProducts.filter((item) => {
        // Filter Mood/Category
        if (activeMood !== "All" && item.type !== "promo" && item.category !== activeMood) {
            return false;
        }

        // Filter Search
        if (isSearching) {
            const q = searchQuery.toLowerCase().trim();
            const matchTitle = (item.title || "").toLowerCase().includes(q);
            const matchTag = (item.tag || "").toLowerCase().includes(q);
            const matchComp = item.flowers?.some((f) => (f || "").toLowerCase().includes(q));
            
            return matchTitle || matchTag || matchComp;
        }

        return true;
     });

    // 2. Sort (Available First)
    const sorted = [...filtered].sort((a, b) => {
        const isA_Available = a.type === 'promo' || (a.stock || 0) > 0;
        const isB_Available = b.type === 'promo' || (b.stock || 0) > 0;
  
        if (isA_Available && !isB_Available) return -1;
        if (!isA_Available && isB_Available) return 1;
        return 0;
    });

    return sorted;
  }, [shopProducts, activeMood, isSearching, searchQuery]);

  const getBentoClass = (index) => {
    if (index % 6 === 0) return "md:col-span-2 md:row-span-2 min-h-[640px]";
    if (index % 5 === 0) return "md:col-span-2 md:row-span-1 min-h-[320px]";
    if (index % 3 === 0) return "md:col-span-1 md:row-span-2 min-h-[640px]";
    return "md:col-span-1 md:row-span-1 min-h-[320px]";
  };

  if (!currentShop)
    return <div className="text-center py-40">Toko tidak ditemukan</div>;

  return (
    <main className="bg-cream-bg min-h-screen relative">
      <Navbar />

      <div className="fixed top-0 left-0 w-full z-50 pointer-events-none h-screen">
        <div className="max-w-6xl mx-auto px-6 relative h-full">
          <div className="absolute top-32 pointer-events-auto">
            <button
              onClick={() => router.push("/toko")}
              className="w-12 h-12 bg-white/50 backdrop-blur-md border border-white/60 rounded-full flex items-center justify-center text-dark-green hover:bg-dark-green hover:text-white transition-all shadow-sm group"
            >
              <ArrowLeft
                size={22}
                className="group-hover:-translate-x-1 transition-transform"
              />
            </button>
          </div>
        </div>
      </div>

      <div className="relative pt-36 pb-12 px-6 z-10">
        <div className="max-w-5xl mx-auto mt-10 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="bg-white/60 backdrop-blur-md rounded-[2.5rem] p-8 border border-white/60 shadow-lg flex flex-col md:flex-row gap-8 md:gap-12 items-center md:items-start"
          >
            <div className="flex-1 flex flex-col items-center md:items-start text-center md:text-left justify-center h-full pt-2">
              <div className="flex flex-col md:flex-row items-center gap-6 mb-4">
                <div className="w-24 h-24 bg-white rounded-full overflow-hidden border-4 border-white shadow-md shrink-0">
                  <img
                    src={currentShop.image}
                    alt={currentShop.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h1 className="text-3xl md:text-5xl font-serif font-bold text-dark-green leading-tight">
                    {currentShop.name}
                  </h1>
                  <div className="flex flex-wrap gap-2 mt-2 justify-center md:justify-start">
                    <span className="flex items-center gap-1 text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded-md border border-orange-100">
                      <Star size={12} fill="currentColor" />{" "}
                      {currentShop.rating}
                    </span>
                    <span className="flex items-center gap-1 text-xs font-medium text-gray-500 bg-white px-2 py-1 rounded-md border border-gray-100">
                      <MapPin size={12} /> {currentShop.location}
                    </span>
                  </div>
                </div>
              </div>

              <div className="w-full h-px bg-dark-green/5 mb-5 w-3/4 mx-auto md:mx-0"></div>

              <div className="space-y-4 w-full md:w-auto">
                <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-gray-600">
                  <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                    <Phone size={14} />
                  </div>
                  <span className="font-mono font-medium">{shopPhone}</span>
                </div>

                {currentShop.can_customize && (
                  <Link
                    onClick={handleStartCustom}
                    href={`/custom/${currentShop.id}`}
                    className="group w-full md:w-auto inline-flex items-center justify-center gap-3 bg-dark-green text-white px-8 py-3.5 rounded-full font-bold hover:bg-sage-green transition-all shadow-md hover:shadow-lg"
                  >
                    <Palette
                      size={18}
                      className="group-hover:rotate-12 transition-transform"
                    />
                    <span>Racik Buket Sendiri</span>
                  </Link>
                )}
              </div>
            </div>

            <div className="w-full md:w-[320px] lg:w-[380px] shrink-0">
              <div className="h-[220px] w-full rounded-3xl overflow-hidden border-2 border-white/20 shadow-inner relative group z-0">
                <Map
                  key={`${shopCoordinate.lat}-${shopCoordinate.lng}`}
                  initialViewState={{
                    longitude: shopCoordinate.lng,
                    latitude: shopCoordinate.lat,
                    zoom: 14,
                  }}
                  center={[shopCoordinate.lng, shopCoordinate.lat]}
                  zoom={14}
                >
                  <MapMarker
                    longitude={shopCoordinate.lng}
                    latitude={shopCoordinate.lat}
                  >
                    <MarkerContent>
                      <div className="relative hover:-translate-y-2 transition-transform duration-300 group/pin cursor-pointer">
                        <MapPin
                          size={32}
                          className="text-red-500 fill-red-500 drop-shadow-lg"
                        />
                        <div className="absolute top-[8px] left-1/2 -translate-x-1/2 w-2 h-2 bg-white rounded-full shadow-sm"></div>
                      </div>
                    </MarkerContent>
                  </MapMarker>
                </Map>

                <div className="absolute inset-0 bg-gradient-to-t from-dark-green/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4 pointer-events-none">
                  <span className="text-white font-bold text-sm flex items-center gap-2 translate-y-2 group-hover:translate-y-0 transition-transform">
                    <ExternalLink size={14} /> Buka Peta Besar
                  </span>
                </div>

                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${shopCoordinate.lat},${shopCoordinate.lng}`}
                  target="_blank"
                  rel="noreferrer"
                  className="absolute inset-0 bg-transparent cursor-pointer z-10"
                  title="Lihat Rute di Google Maps"
                />
              </div>

              <div className="flex justify-end mt-[-20px] mr-4 relative z-20 pointer-events-none">
                <button
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/dir/?api=1&destination=${shopCoordinate.lat},${shopCoordinate.lng}`,
                      "_blank"
                    )
                  }
                  className="pointer-events-auto bg-white text-dark-green px-4 py-2 rounded-full text-xs font-bold shadow-lg flex items-center gap-2 hover:bg-gray-50 transition-all border border-gray-100"
                >
                  <Navigation size={14} className="text-sage-green" /> Ambil Rute
                </button>
              </div>
            </div>
          </motion.div>
        </div>

        <div className="text-center mb-8">
            {/* SEARCH BAR (ADDED HERE) */}
            <div className="max-w-md mx-auto mb-6 relative z-30">
                 <div className="relative w-full">
                    <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                        <Search className="text-gray-400" size={18} />
                    </div>
                    <input
                        type="text"
                        className="w-full pl-10 pr-10 py-3 bg-white/60 backdrop-blur-sm rounded-full border border-gray-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all placeholder:text-gray-400 text-dark-green text-sm"
                        placeholder="Cari di toko ini..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                     <AnimatePresence>
                        {isSearching && (
                        <motion.button
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            onClick={() => setSearchQuery("")}
                            className="absolute inset-y-0 right-4 flex items-center text-gray-400 hover:text-dark-green transition-colors"
                        >
                            <X size={16} />
                        </motion.button>
                        )}
                    </AnimatePresence>
                 </div>
            </div>

          <div className="inline-flex bg-white/50 backdrop-blur-sm p-1.5 rounded-full border border-dark-green/10 shadow-sm relative">
            {["All", "Warm", "Gloomy"].map((mood) => {
              const isActive = activeMood === mood;
              return (
                <button
                  key={mood}
                  onClick={() => setActiveMood(mood)}
                  className={`relative px-8 py-2.5 rounded-full text-sm font-bold transition-colors duration-300 z-10 ${
                    isActive
                      ? "text-white"
                      : "text-gray-500 hover:text-dark-green"
                  }`}
                >
                  {isActive && (
                    <motion.div
                      layoutId="activeTab"
                      className="absolute inset-0 bg-dark-green rounded-full shadow-md"
                      transition={{ type: "spring", stiffness: 300, damping: 30 }}
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-2">
                    {mood === "Warm" && (
                      <Sparkles
                        size={12}
                        className={isActive ? "text-yellow-300" : ""}
                      />
                    )}
                    {mood}
                  </span>
                </button>
              );
            })}
          </div>

           <div className="flex justify-end mt-4 px-4">
               <div className="flex bg-white p-1 rounded-xl border border-gray-200 shadow-sm">
                  <button
                    onClick={() => setViewMode("bento")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "bento"
                        ? "bg-dark-green text-white shadow-md"
                        : "text-gray-400 hover:text-dark-green"
                    }`}
                    title="Bento Grid"
                  >
                    <LayoutGrid size={18} />
                  </button>
                  <button
                    onClick={() => setViewMode("compact")}
                    className={`p-2 rounded-lg transition-all ${
                      viewMode === "compact"
                        ? "bg-dark-green text-white shadow-md"
                        : "text-gray-400 hover:text-dark-green"
                    }`}
                    title="Compact Grid"
                  >
                    <Grid3X3 size={18} />
                  </button>
                </div>
           </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 pb-32">
        {finalDisplayItems.length > 0 ? (
             <motion.div
             layout
             variants={containerVariants}
             initial="hidden"
             animate="show"
             className={`grid gap-6 grid-flow-dense ${
                viewMode === "bento"
                  ? "grid-cols-1 md:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
              }`}
           >
             <AnimatePresence mode="popLayout">
               {finalDisplayItems.map((item, index) => {
                 if (viewMode === "compact") {
                    if (item.type === "promo") return null;
                    return <CompactCard key={item.id} product={item} />;
                 }
                 if (item.type === "promo") {
                   return (
                     <PromoCard
                       key={item.id}
                       className={getBentoClass(index)}
                       shopId={currentShop.id}
                     />
                   );
                 }
                 return (
                   <BentoCard
                     key={item.id}
                     product={item}
                     index={index}
                     className={getBentoClass(index)}
                   />
                 );
               })}
             </AnimatePresence>
           </motion.div>
        ) : (
            <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-32 text-gray-400"
          >
            <p className="text-xl font-serif italic">
               {isSearching 
                 ? `Tidak ada hasil untuk "${searchQuery}"`
                 : `Belum ada koleksi bunga untuk kategori ini di ${currentShop.name}.`
               }
            </p>
            {isSearching && (
                <button
                    onClick={() => setSearchQuery("")}
                    className="text-sage-green text-sm font-bold mt-2 underline"
                >
                    Reset Pencarian
                </button>
            )}
          </motion.div>
        )}
       
      </div>
      <Footer />
    </main>
  );
}