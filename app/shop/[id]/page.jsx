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
} from "lucide-react";
import { SHOPS, allItems } from "@/app/utils/shop";
import { useCart } from "@/app/context/CartContext";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "../context/AuthContext";

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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      className={`group relative overflow-hidden cursor-pointer h-full shadow-sm hover:shadow-2xl transition-shadow duration-500 ${className}`}
    >
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
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
        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full shadow-sm">
          {product.tag}
        </span>
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full p-6 md:p-8 flex flex-col justify-end z-20 pointer-events-none ${
          isDark ? "text-cream-bg" : "text-white"
        }`}
      >
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
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

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
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
      className="group relative overflow-hidden cursor-pointer w-full h-full shadow-sm hover:shadow-2xl transition-all duration-500 min-h-[360px] aspect-[3/4]"
    >
      <Link href={`/product/${product.id}`} className="absolute inset-0 z-10" />
      <div className="absolute inset-0 overflow-hidden">
        <img
          src={product.image}
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110"
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
        <span className="bg-white/20 backdrop-blur-md border border-white/30 text-white text-[9px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full shadow-sm">
          {product.tag}
        </span>
      </div>

      <div
        className={`absolute bottom-0 left-0 w-full p-5 flex flex-col justify-end z-20 pointer-events-none ${
          isDark ? "text-cream-bg" : "text-white"
        }`}
      >
        <div className="transform transition-transform duration-500 group-hover:-translate-y-2">
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
      </div>
    </motion.div>
  );
};

const PromoCard = ({ className, onClick }) => (
  <motion.div
    layout
    variants={itemVariants}
    className={`group relative overflow-hidden h-full bg-gradient-to-br from-[#8FA89B] to-[#1A2F24] text-white p-8 md:p-12 flex flex-col justify-center items-start text-left shadow-2xl ${className}`}
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
      Limited Edition
    </span>
    <h3 className="relative z-10 text-3xl md:text-5xl font-serif font-bold mb-6 leading-[1.1] tracking-tight">
      Punya Cerita <br />{" "}
      <span className="italic text-cream-bg font-light">Sendiri?</span>
    </h3>
    <button
      onClick={onClick}
      className="relative z-10 group/btn flex items-center gap-3 bg-cream-bg text-dark-green px-8 py-4 rounded-full font-bold text-xs uppercase tracking-widest hover:bg-white transition-all hover:scale-105 shadow-xl cursor-pointer"
    >
      <span>Mulai Custom</span>
      <ArrowUpRight size={16} />
    </button>
    <Sparkles
      strokeWidth={1}
      size={200}
      className="absolute -bottom-10 -right-10 text-white/5 rotate-12 pointer-events-none group-hover:scale-110 group-hover:rotate-45 transition-transform duration-1000 ease-in-out"
    />
  </motion.div>
);

// --- MAIN PAGE COMPONENT ---

export default function TenantListPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const topSectionRef = useRef(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const isSearching = searchQuery.trim().length > 0;
  const [viewMode, setViewMode] = useState("bento");

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
      showToast("Gunakan akun user untuk kustom!", "error");
      return;
    }
    setIsModalOpen(true);
  };

<<<<<<< HEAD:app/shop/[id]/page.jsx
=======
  return (
    <motion.div
      layout
      variants={itemVariants}
      initial="hidden"
      animate="show"
      exit="hidden"
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
        Punya Cerita <br />{" "}
        <span className="italic text-cream-bg">Sendiri?</span>
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

export default function ShopEtalasePage() {
  const { id } = useParams();
  const router = useRouter();
  const [activeMood, setActiveMood] = useState("All");
  const currentShop = SHOPS.find((s) => String(s.id) === String(id));
  const { user } = useAuth();
  const { showToast } = useToast();

   
  console.log("ID:", id);
  console.log("Shop ditemukan:", currentShop);
  console.log("Shop lat/lng:", currentShop?.lat, currentShop?.lng);

  // --- MAP & CONTACT LOGIC ---
  const shopCoordinate = currentShop
    ? { lat: currentShop.lat, lng: currentShop.lng }
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

  const filteredItems =
    activeMood === "All"
      ? shopProducts
      : shopProducts.filter(
          (item) => item.type === "promo" || item.category === activeMood
        );

  const sortedItems = [...filteredItems].sort((a, b) => {
      const isA_Available = a.type === 'promo' || (a.stock || 0) > 0;
      const isB_Available = b.type === 'promo' || (b.stock || 0) > 0;

      if (isA_Available && !isB_Available) return -1;
      if (!isA_Available && isB_Available) return 1;
      return 0;
  });

>>>>>>> 799641fdf1204d247b3a759b42eba940c4e55b7e:frontend/app/shop/[id]/page.jsx
  const getBentoClass = (index) => {
    const pattern = [
      "md:col-span-2 md:row-span-2 min-h-[640px]",
      "md:col-span-1 md:row-span-1 min-h-[320px]",
      "md:col-span-1 md:row-span-2 min-h-[640px]",
      "md:col-span-1 md:row-span-1 min-h-[320px]",
      "md:col-span-2 md:row-span-1 min-h-[320px]",
      "md:col-span-1 md:row-span-1 min-h-[320px]",
      "md:col-span-3 md:row-span-1 min-h-[320px]",
    ];
    return pattern[index % 7];
  };

  // --- LOGIC FILTERING & DEDUPLICATION (DI SINI PERBAIKANNYA) ---
  const finalDisplayItems = useMemo(() => {
    // 1. Filter dasar (Stok & Search Query)
    const rawFiltered = allItems.filter((item) => {
      // Logic Stok (Kecuali Promo)
      if (item.type !== "promo" && (item.stock || 0) <= 0) {
        return false;
      }

      // Logic Search
      if (!isSearching) return true;
      const q = searchQuery.toLowerCase().trim();
      const matchTitle = (item.title || "").toLowerCase().includes(q);
      const matchTag = (item.tag || "").toLowerCase().includes(q);
      const matchCat = (item.category || "").toLowerCase().includes(q);
      const matchComp = item.flowers?.some((f) =>
        (f || "").toLowerCase().includes(q)
      );
      return matchTitle || matchTag || matchCat || matchComp;
    });

    // 2. Logic Hapus Duplikat Berdasarkan Judul (Kecuali Promo)
    const uniqueItems = Array.from(
      new Map(
        rawFiltered.map((item) => {
          // Kalau promo, kita kasih key unik biar gak ke-filter
          // Kalau produk biasa, kita pakai judulnya sebagai key (jadi duplikat judul hilang)
          const key = item.type === "promo" ? `promo-${item.id}` : item.title;
          return [key, item];
        })
      ).values()
    );

    return uniqueItems;
  }, [searchQuery, isSearching]); // Dependency array biar re-calculate pas search berubah

  return (
    <main className="bg-cream-bg min-h-screen">
      <Navbar />
      <ShopSelectionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />

      <div
        ref={topSectionRef}
        className="pt-36 pb-24 px-4 md:px-6 max-w-7xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="text-center mb-16"
        >
          <span className="text-xs font-bold tracking-[0.3em] text-sage-green uppercase mb-4 block">
            Florist Network
          </span>
          <h1 className="text-5xl md:text-7xl font-serif text-dark-green mb-6 tracking-tight">
            Marketplace{" "}
            <span className="italic font-light text-sage-green">&</span>{" "}
            Community
          </h1>
          <p className="text-gray-500 max-w-lg mx-auto text-lg font-light leading-relaxed mb-8">
            Jelajahi karya terbaik dari florist lokal pilihan kami.
          </p>

          <motion.div
            className="relative mx-auto z-30"
            initial={false}
            animate={{
              width: isSearchFocused || isSearching ? "100%" : "280px",
              maxWidth: isSearchFocused || isSearching ? "800px" : "280px",
            }}
            transition={{ type: "spring", stiffness: 300, damping: 25 }}
          >
            <div className="relative w-full">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                <Search className="text-gray-400" size={20} />
              </div>
              <input
                type="text"
                className="w-full pl-12 pr-10 py-4 bg-white rounded-full border border-gray-100 shadow-xl focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all placeholder:text-gray-400 text-dark-green font-medium"
                placeholder="Cari bunga (Mawar, Tulip, Romance)..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setIsSearchFocused(false)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.currentTarget.blur();
                  }
                }}
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
                    <X size={18} />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>

        {!isSearching && (
          <motion.section
            variants={pageVariants}
            initial="hidden"
            animate="show"
            className="mb-24"
          >
            <motion.div
              variants={itemVariants}
              className="flex items-end justify-between mb-8 px-2"
            >
              <h2 className="text-2xl font-serif font-bold text-dark-green flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-dark-green text-white flex items-center justify-center text-xs">
                  1
                </span>{" "}
                Scattered{" "}
                <span className="italic font-light text-sage-green">
                  Florists
                </span>
              </h2>
            </motion.div>
            <motion.div
              className="flex gap-6 overflow-x-auto pb-10 -mx-4 px-4 md:mx-0 md:px-0 custom-scrollbar"
              variants={pageVariants}
            >
              {SHOPS.map((shop) => (
                <TopShopCard key={shop.id} shop={shop} />
              ))}
            </motion.div>
          </motion.section>
        )}

        <motion.section
          variants={pageVariants}
          initial="hidden"
          animate="show"
        >
          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between mb-10 px-2"
          >
            <h2 className="text-2xl font-serif font-bold text-dark-green flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-dark-green text-white flex items-center justify-center text-xs">
                {isSearching ? "1" : "2"}
              </span>
              {isSearching ? (
                <span>
                  Search Results{" "}
                  <span className="italic font-light text-sage-green">
                    Found
                  </span>
                </span>
              ) : (
                <span>
                  All Collections{" "}
                  <span className="italic font-light text-sage-green">
                    Showcase
                  </span>
                </span>
              )}
            </h2>
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
          </motion.div>

          {finalDisplayItems.length > 0 ? (
            <motion.div
              className={`grid gap-6 grid-flow-dense ${
                viewMode === "bento"
                  ? "grid-cols-1 md:grid-cols-4"
                  : "grid-cols-2 md:grid-cols-4 lg:grid-cols-5"
              }`}
              variants={pageVariants}
              key={searchQuery ? "search-mode" : "default-mode"}
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
                        shopId={null}
                        onClick={handleStartCustom}
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
            <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200">
              <p className="text-gray-400 font-serif italic text-lg">
                Yah, tidak ada bunga yang cocok dengan "{searchQuery}" 🥀
              </p>
              <button
                onClick={() => setSearchQuery("")}
                className="text-sage-green text-sm font-bold mt-2 underline"
              >
                Reset Pencarian
              </button>
            </div>
          )}
        </motion.section>
      </div>
      <Footer />
    </main>
  );
}