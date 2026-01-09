"use client";
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Minus,
  Plus,
  ShoppingBag,
  Droplets,
  Leaf,
  Star,
  Store,
  CreditCard,
  AlertCircle,
  Lock,
  CheckCircle,
  ShieldAlert,
  MapPin, 
  Clock, 
  Navigation,
} from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { allItems } from "@/app/utils/shop";
import { useCart } from "@/app/context/CartContext";
import { useToast } from "@/app/context/ToastContext";
import { useAuth } from "@/app/context/AuthContext";
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";

export default function ProductDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const { addToCart } = useCart();
  const { showToast } = useToast();
  const { user } = useAuth();

  const [qty, setQty] = useState(1);
  const [activeTab, setActiveTab] = useState("story");
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState({ rating: 0, text: "" });
  const [hoverRating, setHoverRating] = useState(0);
  const [reviewStatus, setReviewStatus] = useState({
    canReview: false,
    message: "",
  });

  const product = allItems.find((p) => String(p.id) === String(id));
  
  const shopData = product?.shop || {};
  const defaultCoord = { lat: -6.914744, lng: 107.60981 };
  const shopCoordinate = shopData.coordinate || defaultCoord;
  const [isMapReady, setIsMapReady] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsMapReady(true);
    }, 300);
    return () => clearTimeout(timer);
  }, []);


  const relatedProducts = product
    ? allItems
        .filter(
          (p) => p.category === product.category && String(p.id) !== String(id)
        )
        .slice(0, 3)
    : [];

  if (product && relatedProducts.length < 3) {
    const others = allItems.filter(
      (p) => String(p.id) !== String(id) && p.category !== product.category
    );
    while (relatedProducts.length < 3 && others.length > 0) {
      const randomIndex = Math.floor(Math.random() * others.length);
      relatedProducts.push(others[randomIndex]);
      others.splice(randomIndex, 1);
    }
  }

  useEffect(() => {
    if (product) {
      const storageKey = `reviews_${product.id}`;
      const savedReviews = localStorage.getItem(storageKey);
      if (savedReviews) {
        setReviews(JSON.parse(savedReviews));
      } else {
        setReviews([
          {
            id: 1,
            name: "Sinta Melati",
            userId: "mock_user_1",
            rating: 5,
            text: "Bunganya segar banget, tahan lama!",
            date: "12 Okt 2025",
          },
          {
            id: 2,
            name: "Budi Santoso",
            userId: "mock_user_2",
            rating: 4,
            text: "", 
            date: "10 Okt 2025",
          },
        ]);
      }
    }
  }, [product]);

  useEffect(() => {
    if (!user) {
      setReviewStatus({ canReview: false, message: "login_required" });
      return;
    }
    if (['tenant', 'superadmin'].includes(user.role)) {
      setReviewStatus({ canReview: false, message: "role_restricted" });
      return;
    }
    const alreadyReviewed = reviews.some(r => r.userEmail === user.email || r.userId === user.id);
    if (alreadyReviewed) {
      setReviewStatus({ canReview: false, message: "already_reviewed" });
      return;
    }
    const hasPurchased = true; 
    if (!hasPurchased) {
      setReviewStatus({ canReview: false, message: "purchase_required" });
    } else {
      setReviewStatus({ canReview: true, message: "ok" });
    }
  }, [user, reviews, product]);

  const handleSubmitReview = (e) => {
    e.preventDefault();
    if (!user) return;
    if (['admin', 'superadmin', 'tenant'].includes(user.role)) {
      showToast("Admin tidak dapat mengirim ulasan.", "error");
      return;
    }
    if (newReview.rating === 0) {
      showToast("Mohon beri bintang terlebih dahulu ⭐", "error");
      return;
    }
    const reviewItem = {
      id: Date.now(),
      name: user.name || user.email,
      userId: user.id,
      userEmail: user.email,
      rating: newReview.rating,
      text: newReview.text,
      date: new Date().toLocaleDateString("id-ID", {
        day: "numeric",
        month: "short",
        year: "numeric",
      }),
    };
    const updatedReviews = [reviewItem, ...reviews];
    setReviews(updatedReviews);
    localStorage.setItem(`reviews_${product.id}`, JSON.stringify(updatedReviews));
    setNewReview({ rating: 0, text: "" });
    showToast("Terima kasih atas ulasanmu!", "success");
  };

  if (!product) {
    return (
      <main className="bg-cream-bg min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-serif text-dark-green mb-4">
            Bunga Tidak Ditemukan 🥀
          </h1>
          <button onClick={() => router.back()} className="text-sage-green underline">
            Kembali ke Shop
          </button>
        </div>
      </main>
    );
  }

  const formatRupiah = (val) => new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumSignificantDigits: 3,
  }).format(val);

  const checkAuth = () => {
    if (!user) {
      showToast("Eits, login dulu baru bisa belanja! 🛒", "error");
      router.push("/login");
      return false;
    }
    if (user && (user.role === 'tenant' || user.role === 'superadmin')) {
      showToast("Gunakan akun user untuk belanja!", "error");
      return false;
    }
    return true;
  };

  const handleAddToCart = () => {
    if (!checkAuth()) return;
    addToCart(product, qty);
    showToast(`Berhasil menambahkan ${qty}x ${product.title} ke keranjang!`, "success");
  };

  const handleBuyNow = () => {
    if (!checkAuth()) return;
    addToCart(product, qty);
    router.push(`/checkout?direct=true&id=${product.id}`);
  };

  const renderStars = (count) => {
    return [...Array(5)].map((_, i) => (
      <Star
        key={i}
        size={12}
        className={i < count ? "text-yellow-400 fill-current" : "text-gray-300"}
      />
    ));
  };

  const isOutOfStock = product.stock <= 0;

  return (
    <main className="bg-cream-bg min-h-screen">
      <Navbar />
      
      <div className="max-w-6xl mx-auto px-4 md:px-6 pt-28 pb-32 md:pb-16">
        
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-sm font-bold text-gray-400 hover:text-dark-green mb-6 transition-colors group"
        >
          <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
          Kembali
        </button>

        <div className="bg-white rounded-[2rem] shadow-sm border border-gray-100 p-5 md:p-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12">
            
            <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-100 group">
              <img
                src={product.image}
                alt={product.title}
                className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${isOutOfStock ? 'grayscale opacity-80' : ''}`}
              />
              
              <div className="absolute top-4 left-4">
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-white shadow-sm ${
                    product.theme === "dark" ? "bg-dark-green" : "bg-sage-green"
                  }`}
                >
                  {product.category}
                </span>
              </div>

              {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 backdrop-blur-[2px]">
                      <div className="bg-white px-4 py-2 rounded-lg transform -rotate-6 shadow-lg border-2 border-red-500">
                          <span className="text-red-600 font-extrabold text-lg uppercase tracking-widest">Stok Habis</span>
                      </div>
                  </div>
              )}
            </div>

            <div className="flex flex-col h-full">
              
             <div className="mb-6">
                 <div className="flex flex-col gap-4 mb-4">
                     <div className="flex items-start justify-between">
                         <Link href={`/shop/${shopData.id}`} className="group/shop flex items-center gap-3">
                             <div className="w-10 h-10 rounded-full bg-sage-green/10 flex items-center justify-center text-sage-green border border-sage-green/20 group-hover/shop:bg-sage-green group-hover/shop:text-white transition-all">
                                 <Store size={18} />
                             </div>
                             <div>
                                 <h4 className="font-bold text-dark-green text-sm group-hover/shop:text-sage-green transition-colors">{shopData.name || "Florist Partner"}</h4>
                                 <p className="text-[10px] text-gray-500 font-medium flex items-center gap-1">
                                     <MapPin size={10} /> {shopData.location || "Lokasi Toko"}
                                 </p>
                             </div>
                         </Link>
                         <button 
                             onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shopCoordinate.lat},${shopCoordinate.lng}`, "_blank")}
                             className="text-[10px] font-bold text-gray-400 hover:text-dark-green flex items-center gap-1 border border-gray-200 rounded-full px-3 py-1 hover:border-dark-green transition-all"
                         >
                             <Navigation size={10} /> Rute
                         </button>
                     </div>

                     <div className="w-full h-24 rounded-xl overflow-hidden border border-gray-100 relative shadow-inner">
                        {isMapReady ? (
                          <Map 
                            key={`${shopCoordinate.lat}-${shopCoordinate.lng}`}
                            initialViewState={{
                              longitude: shopCoordinate.lng,
                              latitude: shopCoordinate.lat,
                              zoom: 13
                            }}
                            center={[shopCoordinate.lng, shopCoordinate.lat]}
                            zoom={13}
                          >
                            <MapMarker longitude={shopCoordinate.lng} latitude={shopCoordinate.lat}>
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
                        ) : (
                          <div className="w-full h-full bg-gray-100 animate-pulse rounded-xl"></div>
                        )}
                        
                        <a 
                            href={`https://www.google.com/maps/dir/?api=1&destination=${shopCoordinate.lat},${shopCoordinate.lng}`}
                            target="_blank"
                            rel="noreferrer"
                            className="absolute inset-0 bg-transparent hover:bg-black/5 transition-colors cursor-pointer z-10"
                            title="Lihat di Google Maps"
                        />
                     </div>
                 </div>

                <h1 className="text-3xl md:text-4xl font-serif font-bold text-dark-green leading-tight mb-2">
                  {product.title}
                </h1>
                
                <div className="flex items-center gap-4 mt-3">
                    <p className="text-2xl font-sans font-bold text-sage-green">
                        {formatRupiah(product.price)}
                    </p>
                    <div className="h-6 w-px bg-gray-200"></div>
                    {isOutOfStock ? (
                        <span className="text-red-500 text-xs font-bold flex items-center gap-1">
                            <AlertCircle size={14}/> Out of Stock
                        </span>
                    ) : (
                        <span className={`text-xs font-bold flex items-center gap-1 ${product.stock < 5 ? "text-orange-500" : "text-green-600"}`}>
                            <div className={`w-2 h-2 rounded-full ${product.stock < 5 ? "bg-orange-500 animate-pulse" : "bg-green-600"}`}></div>
                            Stok: {product.stock}
                        </span>
                    )}
                </div>
              </div>

              <p className="text-gray-500 text-sm leading-relaxed mb-8">
                {product.desc}
              </p>

              <div className="mb-8 flex-1">
                <div className="flex gap-6 border-b border-gray-100 mb-4 overflow-x-auto scrollbar-hide">
                  {["story", "flowers", "care", "reviews"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`pb-3 text-xs font-bold uppercase tracking-wider transition-all relative whitespace-nowrap ${
                          activeTab === tab ? "text-dark-green border-b-2 border-dark-green" : "text-gray-400 hover:text-gray-600"
                        }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>

                <div className="min-h-[100px] text-sm text-gray-600 leading-relaxed">
                  <AnimatePresence mode="wait">
                    {activeTab === "story" && (
                      <motion.div key="story" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                        <p className="italic mb-2">"{product.story}"</p>
                      </motion.div>
                    )}
                    {activeTab === "flowers" && (
                      <motion.ul key="flowers" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-1">
                        {product.flowers ? product.flowers.map((f, i) => (
                            <li key={i} className="flex items-center gap-2"><Leaf size={12} className="text-sage-green"/> {f}</li>
                        )) : "Standar komposisi"}
                      </motion.ul>
                    )}
                    {activeTab === "care" && (
                      <motion.div key="care" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex gap-3 bg-blue-50 p-3 rounded-xl border border-blue-100">
                        <Droplets className="text-blue-400 shrink-0" size={16} />
                        <p>{product.care}</p>
                      </motion.div>
                    )}
                    {activeTab === "reviews" && (
                        <motion.div key="reviews" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                            {reviewStatus.canReview ? (
                                <form onSubmit={handleSubmitReview} className="mb-4 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <div className="flex gap-1 mb-2">
                                        {[1,2,3,4,5].map(s => (
                                            <Star key={s} size={16} className={`cursor-pointer ${s <= (hoverRating||newReview.rating) ? "text-yellow-400 fill-current" : "text-gray-300"}`}
                                                onClick={() => setNewReview({...newReview, rating: s})} onMouseEnter={() => setHoverRating(s)} onMouseLeave={() => setHoverRating(0)} />
                                        ))}
                                    </div>
                                    <input className="w-full text-xs bg-white p-2 rounded border border-gray-200 mb-2 focus:outline-none focus:border-sage-green" placeholder="Ceritakan pengalamanmu..."
                                        value={newReview.text} onChange={e => setNewReview({...newReview, text: e.target.value})} />
                                    <button type="submit" className="text-[10px] font-bold bg-dark-green text-white px-3 py-1.5 rounded hover:bg-sage-green transition">Kirim Ulasan</button>
                                </form>
                            ) : (
                                <div className="mb-4 bg-gray-50 p-4 rounded-xl border border-gray-100 text-center">
                                    {reviewStatus.message === "login_required" && (
                                        <div className="flex flex-col items-center gap-2">
                                            <Lock size={20} className="text-gray-400"/>
                                            <p className="text-xs text-gray-500">Silakan <Link href="/login" className="text-dark-green font-bold underline">Login</Link> untuk menulis ulasan.</p>
                                        </div>
                                    )}
                                    {reviewStatus.message === "role_restricted" && (
                                        <div className="flex flex-col items-center gap-2">
                                            <ShieldAlert size={20} className="text-orange-500"/>
                                            <p className="text-xs text-gray-500">Admin/Tenant tidak dapat memberikan ulasan produk.</p>
                                        </div>
                                    )}
                                    {reviewStatus.message === "purchase_required" && (
                                        <div className="flex flex-col items-center gap-2">
                                            <ShoppingBag size={20} className="text-gray-400"/>
                                            <p className="text-xs text-gray-500">Hanya pembeli yang dapat memberikan ulasan.</p>
                                        </div>
                                    )}
                                    {reviewStatus.message === "already_reviewed" && (
                                        <div className="flex flex-col items-center gap-2">
                                            <CheckCircle size={20} className="text-sage-green"/>
                                            <p className="text-xs text-gray-500">Kamu sudah memberikan ulasan untuk produk ini. Terima kasih!</p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <div className="space-y-3 max-h-40 overflow-y-auto custom-scrollbar">
                                {reviews.length === 0 ? <p className="text-gray-400 text-xs italic">Belum ada ulasan.</p> : reviews.map(r => (
                                    <div key={r.id} className="pb-2 border-b border-gray-100 last:border-0">
                                            <div className="flex justify-between text-xs mb-1">
                                                <span className="font-bold text-dark-green">{r.name}</span>
                                                <span className="text-[10px] text-gray-400">{r.date}</span>
                                            </div>
                                            <div className="flex gap-0.5 mb-1">{renderStars(r.rating)}</div>
                                            {r.text && <p className="text-gray-600 text-xs italic">"{r.text}"</p>}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>

              <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4 z-50 md:static md:bg-transparent md:border-0 md:p-0 md:z-0">
                <div className="max-w-6xl mx-auto md:max-w-none flex items-center gap-3">
                    
                    <div className="flex items-center gap-3 bg-gray-100 rounded-xl px-3 py-2 border border-gray-200 h-12">
                        <button onClick={() => setQty(Math.max(1, qty - 1))} className="w-8 h-full flex items-center justify-center hover:text-sage-green disabled:opacity-30" disabled={isOutOfStock}>
                            <Minus size={16} />
                        </button>
                        <span className="font-bold w-4 text-center text-sm">{qty}</span>
                        <button onClick={() => setQty(Math.min(product.stock, qty + 1))} className="w-8 h-full flex items-center justify-center hover:text-sage-green disabled:opacity-30" disabled={isOutOfStock}>
                            <Plus size={16} />
                        </button>
                    </div>

                    <div className="flex gap-2 flex-1 h-12">
                        <button
                            onClick={handleAddToCart}
                            disabled={isOutOfStock}
                            className="flex-1 rounded-xl border border-dark-green text-dark-green font-bold text-xs md:text-sm hover:bg-gray-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:border-gray-300 disabled:text-gray-400 flex flex-col md:flex-row items-center justify-center gap-1"
                        >
                            <ShoppingBag size={16} />
                            <span>Add Cart</span>
                        </button>
                        
                        <button
                            onClick={handleBuyNow}
                            disabled={isOutOfStock}
                            className="flex-[1.5] rounded-xl bg-dark-green text-white font-bold text-xs md:text-sm hover:bg-sage-green transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:bg-gray-300 flex flex-col md:flex-row items-center justify-center gap-1"
                        >
                            {isOutOfStock ? (
                                <span>Stok Habis</span>
                            ) : (
                                <>
                                    <CreditCard size={16} />
                                    <span>Beli Sekarang</span>
                                </>
                            )}
                        </button>
                    </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        <div className="mt-16 mb-8">
          <h3 className="text-lg font-bold text-dark-green mb-6 text-center md:text-left border-b border-gray-200 pb-2 inline-block">
            You might also love
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {relatedProducts.map((item) => (
              <Link href={`/product/${item.id}`} key={item.id} className="group block bg-white rounded-2xl p-3 shadow-sm hover:shadow-lg transition-all border border-gray-100">
                <div className="aspect-square bg-gray-100 rounded-xl overflow-hidden mb-3 relative">
                  <img src={item.image} alt={item.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                </div>
                <div>
                  <h4 className="font-bold text-dark-green text-sm line-clamp-1 group-hover:text-sage-green transition-colors">
                    {item.title}
                  </h4>
                  <p className="text-xs text-gray-500 mt-0.5">{formatRupiah(item.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>

      </div>
      <Footer />
    </main>
  );
}