"use client";
import { useState, useEffect, useRef, useMemo } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import NextImage from "next/image";
import {
  MapPin,
  Star,
  ArrowRight,
  Store,
  User,
  Navigation,
  Flower2,
  PenTool,
  Gift,
  X,
  Clock,
  ExternalLink,
  Loader2,
  AlertCircle,
  RefreshCw,
  Search,
  LocateFixed,
  Package,
  Compass
} from "lucide-react";
import { allItems, SHOPS } from "@/app/utils/shop";
import { PROMOS } from "./utils/data";
import { useAuth } from "./context/AuthContext";
import { useToast } from "./context/ToastContext";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
  MarkerTooltip,
  Source,
  Layer,
} from "@/components/ui/map";
import { Button } from "@/components/ui/button";

const calculateDistance = (lat1, lon1, lat2, lon2) => {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;

  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
      Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

const FloristSelectionModal = ({ isOpen, onClose }) => {
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
            className="fixed z-[70] bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
          >
            <div className="p-5 md:p-6 border-b border-gray-100 flex justify-between items-center bg-[#FDFBF7]">
              <div>
                <h3 className="font-serif text-xl md:text-2xl font-bold text-dark-green">
                  Pilih Florist
                </h3>
                <p className="text-gray-500 text-xs md:text-sm">
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

            <div className="p-4 md:p-6 overflow-y-auto custom-scrollbar bg-white">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4">
                {customShops.map((shop) => (
                  <Link
                    key={shop.id}
                    href={`/custom/${shop.id}`}
                    className="group flex items-center gap-3 md:gap-4 p-3 rounded-2xl border border-gray-100 hover:border-dark-green hover:bg-[#FDFBF7] transition-all duration-300"
                  >
                    <div className="w-14 h-14 md:w-16 md:h-16 rounded-xl overflow-hidden shrink-0 shadow-sm group-hover:shadow-md">
                      <img
                        src={shop.image}
                        alt={shop.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-sm md:text-base text-dark-green truncate">
                        {shop.name}
                      </h4>
                      <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-500 mt-1">
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

const DashboardProductCard = ({ item }) => {
  return (
    <Link
      href={`/product/${item.id}`}
      className="group relative flex-shrink-0 w-[80vw] md:w-[300px] h-[420px] md:h-[480px] cursor-pointer block snap-center"
    >
      <div className="absolute -top-3 -left-3 z-20">
        <div className="bg-white border border-gray-100 shadow-md py-1.5 px-3 md:py-2 md:px-4 rounded-tr-xl rounded-bl-xl flex items-center gap-2 transform group-hover:-translate-y-1 transition-transform duration-300">
          <div className="bg-sage-green/20 p-1 rounded-full text-dark-green">
            <Store size={10} className="md:w-3 md:h-3" />
          </div>
          <span className="text-[10px] md:text-xs font-bold text-dark-green tracking-wide uppercase">
            {item.shop?.name || "Official Store"}
          </span>
        </div>
      </div>

      <div className="w-full h-[85%] rounded-[2.5rem] overflow-hidden relative shadow-sm group-hover:shadow-2xl transition-all duration-500 border border-gray-100">
        <motion.img
          src={item.image}
          alt={item.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />

        <div className="absolute inset-0 bg-black/10 group-hover:bg-transparent transition-colors"></div>

        <div className="absolute bottom-0 right-0 bg-white/90 backdrop-blur-md px-4 py-2 md:px-5 md:py-3 rounded-tl-[2rem] text-dark-green font-bold font-sans text-sm md:text-base">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumSignificantDigits: 3,
          }).format(item.price)}
        </div>
      </div>

      <div className="mt-3 md:mt-4 px-2">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl md:text-2xl font-serif font-bold text-dark-green leading-none mb-1 group-hover:text-sage-green transition-colors line-clamp-1">
              {item.title}
            </h3>
            <p className="text-[10px] md:text-xs text-gray-400 uppercase tracking-[0.2em] font-medium">
              {item.category} Collection
            </p>
          </div>

          <div className="opacity-0 group-hover:opacity-100 transition-opacity transform translate-y-2 group-hover:translate-y-0 duration-300 hidden md:block">
            <ArrowRight size={20} className="text-sage-green -rotate-45" />
          </div>
        </div>
      </div>
    </Link>
  );
};

const Snowfall = () => {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-0">
      {[...Array(10)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: "100vh", opacity: [0, 1, 0] }}
          transition={{
            duration: Math.random() * 5 + 5,
            repeat: Infinity,
            delay: Math.random() * 5,
            ease: "linear",
          }}
          className="absolute text-white/30"
          style={{
            left: `${Math.random() * 100}%`,
            fontSize: `${Math.random() * 20 + 10}px`,
          }}
        >
          ❄
        </motion.div>
      ))}
    </div>
  );
};

const NeighborhoodMap = ({ shops, isSearching = false }) => {
  const FALLBACK_CENTER = [107.6107, -6.8915]; // Bandung
  const RADIUS_LIMIT = 5;

  const [userLocation, setUserLocation] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [locationDenied, setLocationDenied] = useState(false);
  const [showAllShops, setShowAllShops] = useState(false);
  const [isMapReady, setIsMapReady] = useState(false);
  const showToast = useToast();
  const Router = useRouter();
  
  const mapRef = useRef(null);

  useEffect(() => {
    if (!navigator.geolocation) {
      setIsLoading(false);
      setLocationDenied(true);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationDenied(false);
        setIsLoading(false);
        setTimeout(() => {
          setIsMapReady(true);
        }, 300);
      },
      (err) => {
        setLocationDenied(true);
        setIsLoading(false);
      },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }, []);




  useEffect(() => {
    if (isSearching && shops && shops.length > 0 && mapRef.current) {
      const firstShop = shops[0];
      const lat = firstShop.lat || firstShop.coordinate?.lat;
      const lng = firstShop.lng || firstShop.coordinate?.lng;

      if (lat && lng) {
        mapRef.current.flyTo({
          center: [lng, lat],
          zoom: 14,
          duration: 1500,
          essential: true
        });
      }
    }
  }, [shops, isSearching]);

  const { visibleShops, nearbyCount } = useMemo(() => {
    const shopsWithDistance = shops.map((shop) => {
      const lat = shop.lat || shop.coordinate?.lat || FALLBACK_CENTER[1];
      const lng = shop.lng || shop.coordinate?.lng || FALLBACK_CENTER[0];
      
      const dist = userLocation && !locationDenied
        ? calculateDistance(userLocation.lat, userLocation.lng, lat, lng)
        : 0;

      return { ...shop, realDistance: dist, finalLat: lat, finalLng: lng };
    });

    if (locationDenied || !userLocation || isSearching || showAllShops) {
      return { 
        visibleShops: shopsWithDistance, 
        nearbyCount: shopsWithDistance.length 
      };
    }

    const nearby = shopsWithDistance.filter(
      (s) => s.realDistance <= RADIUS_LIMIT
    );

    return {
      visibleShops: nearby,
      nearbyCount: nearby.length,
    };
  }, [userLocation, shops, showAllShops, isSearching, locationDenied]);

  const handleRecenter = () => {
    if (userLocation && !locationDenied && mapRef.current) {
      mapRef.current.flyTo({
        center: [userLocation.lng, userLocation.lat],
        zoom: 14,
        duration: 1500,
        essential: true
      });
    } else {
      showToast("Lokasi kamu belum terdeteksi. Pastikan akses lokasi diizinkan.", "error");
    }
  };

  const handleEnableLocation = () => {
    if (!navigator.geolocation) {
      showToast("Browser kamu tidak mendukung geolocation", "error");
      return;
    }

    showToast("Mengizinkan akses lokasi...", "info");

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setUserLocation({ lat: latitude, lng: longitude });
        setLocationDenied(false);
        showToast("Lokasi berhasil diaktifkan! Memperbarui peta...", "success");
        
        setTimeout(() => {
          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 13,
              duration: 1500,
              essential: true
            });
          }
        }, 500);
      },
      (err) => {
        console.error("Masih ditolak:", err);
        showToast("Izin lokasi masih ditolak. Periksa pengaturan browser.", "error");
      },
      { enableHighAccuracy: true }
    );
  };



  if (locationDenied) {
    return (
      <div className="w-full h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] bg-gradient-to-br from-gray-50 to-white border-2 border-dashed border-gray-300 mb-8 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
          <Compass size={32} className="text-gray-400" />
        </div>
        
        <h3 className="text-xl font-bold text-gray-800 mb-2">
          Izinkan Lokasi
        </h3>
        
        <p className="text-gray-600 mb-6 max-w-md">
          Untuk melihat florist terdekat dari lokasimu, izinkan akses lokasi.
        </p>
        
        <button
          onClick={() => {
            if (navigator.geolocation) {
              navigator.geolocation.getCurrentPosition(
                (pos) => {
                  const { latitude, longitude } = pos.coords;
                  setUserLocation({ lat: latitude, lng: longitude });
                  setLocationDenied(false);
                },
                () => {
                  alert("Silakan ubah pengaturan lokasi di browser");
                }
              );
            }
          }}
          className="bg-dark-green text-white px-8 py-3 rounded-full font-bold hover:bg-sage-green transition-colors"
        >
          Izinkan Lokasi
        </button>
        
      </div>
    );
  }


  if (isLoading) {
    return (
      <div className="w-full h-[400px] bg-gray-50 rounded-[2rem] flex flex-col items-center justify-center text-gray-400 gap-2 border border-gray-200">
        <Loader2 size={32} className="animate-spin text-sage-green" />
        <span className="text-xs font-bold animate-pulse">
          Melacak Lokasi...
        </span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[400px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden border border-sage-green/20 shadow-inner mb-8 group touch-none z-0 bg-gray-100">
      <Map 
        ref={mapRef}
        initialViewState={{
          longitude: userLocation.lng,
          latitude: userLocation.lat,
          zoom: 13
        }}
        center={[
          userLocation.lng,
          userLocation.lat,]}
        zoom={13}
      >
        <MapMarker longitude={userLocation.lng} latitude={userLocation.lat}>
          <MarkerContent>
            <div className="relative flex items-center justify-center size-8">
              <div className="absolute inset-0 bg-blue-500 rounded-full animate-ping opacity-30"></div>
              <div className="size-5 rounded-full bg-blue-600 border-[3px] border-white shadow-xl relative z-10 flex items-center justify-center">
                <User size={10} className="text-white" />
              </div>
            </div>
          </MarkerContent>
          <MarkerTooltip>Lokasi Kamu</MarkerTooltip>
        </MapMarker>

        {visibleShops.map((shop) => (
          <MapMarker key={shop.id} longitude={shop.finalLng} latitude={shop.finalLat}>
            <MarkerContent>
              <div className="relative hover:-translate-y-2 transition-transform duration-300 group/pin cursor-pointer">
                <MapPin
                  size={36}
                  className="text-red-500 fill-red-500 drop-shadow-lg"
                />
                <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-white rounded-full shadow-sm"></div>
              </div>
            </MarkerContent>

            <MarkerPopup className="p-0 w-[290px] border-none shadow-2xl rounded-xl overflow-hidden bg-white font-sans">
              <div className="relative h-36 w-full bg-gray-100 group">
                <NextImage fill src={shop.image} alt={shop.name} className="object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
                <div className="absolute top-2 right-2 bg-white/95 backdrop-blur px-2 py-0.5 rounded-lg text-[10px] font-bold text-dark-green shadow-sm flex items-center gap-1">
                  <Navigation size={10} className="text-sage-green" />
                  {shop.realDistance.toFixed(1)} km
                </div>
                {shop.can_customize && (
                  <div className="absolute top-2 left-2 bg-sage-green/90 backdrop-blur px-2 py-0.5 rounded-lg text-[10px] font-bold text-white shadow-sm border border-white/20 flex items-center gap-1">
                    <Package size={10} /> Custom
                  </div>
                )}
              </div>
              <div className="p-3.5 bg-white space-y-2.5 relative -mt-4 rounded-t-md">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1 text-[10px] font-bold text-sage-green uppercase tracking-wider">
                    <MapPin size={10} /> {shop.location || "Bandung"}
                  </div>
                  <div className="flex items-center gap-1 bg-yellow-50 border border-yellow-100 px 1.5 py-0.5 rounded text-yellow-700 text-[10px] font-bold">
                    <Star size={10} className="fill-yellow-400 text-yellow-400" />
                    {shop.rating || 5.0}
                  </div>
                </div>
                <h3 className="font-serif font-bold text-lg text-gray-900 leading-tight line-clamp-1">
                  {shop.name}
                </h3>
                <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <Clock size={14} className="text-sage-green" />
                  <span className="font-medium">{shop.openTime || "08:00 - 20:00"}</span>
                  <span className="text-gray-300">|</span>
                  <span className="text-[10px] text-gray-400">({shop.reviewCount || 0} Ulasan)</span>
                </div>
                <div className="flex gap-2 pt-1">
                  <Button size="sm" className="flex-1 h-9 text-xs font-bold bg-dark-green hover:bg-sage-green text-white shadow-md hover:shadow-lg transition-all" onClick={() => window.open(`https://www.google.com/maps/dir/?api=1&destination=${shop.finalLat},${shop.finalLng}`, "_blank")}>
                    <Navigation size={14} className="mr-1.5" /> Rute
                  </Button>
                  <Link href={`/shop/${shop.id}`} className="flex-none">
                    <Button size="sm" variant="outline" className="h-9 w-10 p-0 border-gray-200 text-gray-500 hover:text-dark-green hover:border-dark-green hover:bg-green-50 transition-all">
                      <ExternalLink size={16} />
                    </Button>
                  </Link>
                </div>
              </div>
            </MarkerPopup>
          </MapMarker>
        ))}
      </Map>

      <div className="absolute bottom-16 right-4 z-[20]">
        <Button
          onClick={handleRecenter}
          size="icon"
          className="bg-white hover:bg-gray-50 text-dark-green shadow-xl rounded-full w-10 h-10 border border-gray-200 transition-transform active:scale-95"
          title="Kembali ke Lokasi Saya"
        >
          <LocateFixed size={20} />
        </Button>
      </div>

      {nearbyCount === 0 && !showAllShops && !isSearching && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] max-w-xs z-[20]">
          <div className="bg-white/95 backdrop-blur-md p-5 rounded-2xl shadow-2xl border border-red-100 text-center animate-in fade-in zoom-in duration-300">
            <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-3">
              <AlertCircle className="text-red-500" size={24} />
            </div>
            <h4 className="font-bold text-gray-800 text-sm mb-1">
              Yah, belum ada florist dekat sini 🙏🏻
            </h4>
            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              Tidak ada mitra dalam radius 5 km dari lokasimu saat ini.
            </p>
            <Button
              onClick={() => {
                setShowAllShops(true);
                if (mapRef.current) {
                  mapRef.current.flyTo({
                    zoom: 6,
                    duration: 1000,
                    essential: true
                  });
                }
              }}
              className="w-full bg-dark-green hover:bg-sage-green text-white rounded-xl text-xs font-bold h-10 shadow-lg"
            >
              Tampilkan Semua Toko
            </Button>
          </div>
        </div>
      )}

      {showAllShops && !isSearching && (
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-[20]">
          <Button
            onClick={() => {
              setShowAllShops(false);
              if (mapRef.current) {
                mapRef.current.flyTo({
                  center: [userLocation.lng, userLocation.lat],
                  zoom: 13,
                  duration: 1500,
                  essential: true
                });
              }
            }}
            variant="secondary"
            className="bg-white text-dark-green hover:bg-gray-50 rounded-full shadow-lg border border-gray-200 text-xs font-bold px-6 h-10 gap-2"
          >
            <RefreshCw size={14} /> Reset ke Radius 5km
          </Button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-[10] flex flex-col gap-2">
        <div className={`backdrop-blur px-3 py-1.5 rounded-lg text-xs font-bold shadow-sm border flex items-center gap-2 pointer-events-none ${nearbyCount === 0 && !showAllShops && !isSearching ? "bg-red-50/90 text-red-600 border-red-200" : "bg-white/90 text-sage-green border-white/50"}`}>
          <Navigation size={14} className={nearbyCount === 0 && !isSearching ? "text-red-500" : "text-blue-500"} />
          <span className="hidden xs:inline">
            {isSearching ? `Hasil Pencarian (${visibleShops.length})` : showAllShops ? "Semua Area" : `Radius 5km (${nearbyCount} Toko)`}
          </span>
        </div>
      </div>
    </div>
  );
};


const CustomBouquetSection = ({ onOpenModal }) => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();

  const handleCustomClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (!user) {
      showToast(
        "Hey, login dulu baru bisa kustom! Khusus bu maria silakan login dengan email: user@gmail.com password: 123",
        "error"
      );
      router.push("/login");
      return;
    }

    if (user && (user.role === "tenant" || user.role === "superadmin")) {
      showToast(
        "Gunakan akun user untuk belanja! Khusus bu maria silakan login dengan email: user@gmail.com password: 123",
        "error"
      );
      return;
    }
    onOpenModal();
  };

  const steps = [
    {
      icon: Flower2,
      title: "Choose Blooms",
      desc: "Pilih bunga favoritmu dari katalog segar kami.",
    },
    {
      icon: Gift,
      title: "Wrap & Style",
      desc: "Tentukan kertas wrapping dan pita sesuai seleramu.",
    },
    {
      icon: PenTool,
      title: "Personal Touch",
      desc: "Tulis kartu ucapan tulus dari hati.",
    },
  ];

  return (
    <section className="relative py-16 mb-14 md:py-24 px-4 md:px-6 overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-full bg-gradient-to-b from-transparent via-dark-green/20 to-transparent dashed-line hidden md:block"></div>

      <div className="max-w-4xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16"
        >
          <span className="inline-block py-1 px-4 rounded-full bg-white border border-sage-green/30 text-sage-green text-xs font-bold uppercase tracking-widest mb-4 shadow-sm">
            The Atelier
          </span>
          <h2 className="text-3xl md:text-5xl font-serif font-bold text-dark-green mb-4">
            Craft Your <span className="italic font-light">Masterpiece</span>
          </h2>
          <p className="text-gray-500 max-w-lg mx-auto leading-relaxed text-sm md:text-base">
            Jangan biarkan pilihan membatasimu. Jadilah florist untuk orang
            tersayang dengan fitur custom kami.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-10 md:gap-8 relative">
          <div className="absolute top-12 left-0 w-full h-px bg-dark-green/10 hidden md:block -z-10"></div>

          {steps.map((step, idx) => (
            <motion.div
              key={idx}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.2 }}
              viewport={{ once: true }}
              className="flex flex-col items-center group"
            >
              <div className="w-20 h-20 md:w-24 md:h-24 bg-white rounded-full border border-gray-100 shadow-xl flex items-center justify-center text-dark-green mb-4 md:mb-6 relative group-hover:scale-110 transition-transform duration-300">
                <div className="absolute inset-0 bg-sage-green/5 rounded-full transform scale-0 group-hover:scale-100 transition-transform duration-300"></div>
                <step.icon
                  className="w-7 h-7 md:w-8 md:h-8"
                  strokeWidth={1.5}
                />
                <div className="absolute -top-1 -right-1 w-7 h-7 md:w-8 md:h-8 bg-dark-green text-white rounded-full flex items-center justify-center text-xs font-bold border-4 border-cream-bg">
                  {idx + 1}
                </div>
              </div>
              <h3 className="text-lg md:text-xl font-serif font-bold text-dark-green mb-2">
                {step.title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[240px] md:max-w-[200px]">
                {step.desc}
              </p>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 md:mt-16"
        >
          <button
            onClick={handleCustomClick}
            className="group relative inline-flex items-center gap-3 bg-dark-green text-white px-8 py-3 md:px-10 md:py-4 rounded-full font-bold shadow-xl hover:bg-sage-green transition-all overflow-hidden text-sm md:text-base"
          >
            <span className="relative z-10">Mulai Kustomisasi</span>
            <ArrowRight
              size={18}
              className="relative z-10 group-hover:translate-x-1 transition-transform"
            />
            <div className="absolute top-0 -left-[100%] w-full h-full bg-gradient-to-r from-transparent via-white/20 to-transparent group-hover:animate-shine" />
          </button>
        </motion.div>
      </div>
    </section>
  );
};

export default function DashboardPage() {
  const [currentPromo, setCurrentPromo] = useState(0);
  const [isFloristModalOpen, setIsFloristModalOpen] = useState(false);
  const { user } = useAuth();

  const [userLoc, setUserLoc] = useState(null);
  const [isLocLoading, setIsLocLoading] = useState(true);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setUserLoc({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setLocationPermissionDenied(false);
          setIsLocLoading(false);
        },
        (err) => {
          setLocationPermissionDenied(true);
          setIsLocLoading(false);
        },
        { timeout: 10000 }
      );
    } else {
      setLocationPermissionDenied(true);
      setIsLocLoading(false);
    }

    const timer = setInterval(() => {
      setCurrentPromo((prev) => (prev + 1) % PROMOS.length);
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  const bestSellers = allItems.filter((i) => i.type !== "promo").slice(0, 5);

  const displayedShops = useMemo(() => {
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      
      const filtered = SHOPS.filter(shop => 
        shop.name.toLowerCase().includes(query) || 
        shop.location.toLowerCase().includes(query)
      );

      return filtered.map(shop => {
        let distStr = "";
        if (userLoc && !locationPermissionDenied) {
             const sLat = shop.lat || shop.coordinate?.lat || 0;
             const sLng = shop.lng || shop.coordinate?.lng || 0;
             const dist = calculateDistance(userLoc.lat, userLoc.lng, sLat, sLng);
             distStr = `${dist.toFixed(1)} km`;
        }
        return { ...shop, distance: distStr };
      });
    }
    
    if (!userLoc || locationPermissionDenied) return SHOPS.slice(0, 4);

    const sorted = SHOPS.map((shop) => {
        const sLat = shop.lat || shop.coordinate?.lat || 0;
        const sLng = shop.lng || shop.coordinate?.lng || 0;
        const dist = calculateDistance(userLoc.lat, userLoc.lng, sLat, sLng);
        return { ...shop, realDistanceVal: dist, distance: `${dist.toFixed(1)} km` };
    }).sort((a, b) => a.realDistanceVal - b.realDistanceVal);

    const nearby = sorted.filter(s => s.realDistanceVal <= 5);
    return nearby.length > 0 ? nearby.slice(0, 4) : [];
    
  }, [userLoc, searchQuery, locationPermissionDenied]);

  const handleSearch = (e) => {
    setSearchQuery(e.target.value);
    setIsSearching(e.target.value !== "");
  };
  


  return (
    <div className="bg-cream-bg min-h-screen flex-col flex overflow-x-hidden">
      <Navbar />

      <section className="relative pt-28 md:pt-36 pb-6 md:pb-10 px-4 md:px-6 overflow-hidden flex-1">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="mb-8 md:mb-10 mt-2 px-2">
            {user ? (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[10px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                  Welcome back, {user.name.split(" ")[0]}
                </p>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-dark-green mb-4 md:mb-6">
                  Season's <span className="font-light italic">Greetings</span>{" "}
                  🎄
                </h1>
              </motion.div>
            ) : (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <p className="text-[10px] md:text-xs font-bold text-sage-green uppercase tracking-widest mb-2">
                  Make Someone's Day
                </p>
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-dark-green mb-4 md:mb-6">
                  Bloom{" "}
                  <span className="font-light italic text-sage-green">
                    Brighter.
                  </span>{" "}
                  🌸
                </h1>
              </motion.div>
            )}
          </div>
          <div className="relative w-full h-[350px] md:h-[500px] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden shadow-2xl mb-8 md:mb-10">
            <AnimatePresence mode="wait">
              <motion.div
                key={currentPromo}
                initial={{ opacity: 0, scale: 1.05 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className={`absolute inset-0 w-full h-full ${PROMOS[currentPromo].bg} flex items-center`}
              >
                <div className="absolute inset-0 opacity-40 mix-blend-overlay">
                  <img
                    src={PROMOS[currentPromo].image}
                    className="w-full h-full object-cover"
                  />
                </div>
                <Snowfall />
                <div className="relative z-10 px-6 md:px-16 max-w-2xl">
                  <span
                    className={`text-[10px] md:text-xs font-bold tracking-[0.2em] uppercase border border-current px-3 py-1 rounded-full mb-4 inline-block ${PROMOS[currentPromo].text}`}
                  >
                    Special Offer
                  </span>
                  <h2
                    className={`text-2xl sm:text-3xl md:text-7xl font-serif font-bold mb-3 md:mb-6 leading-tight ${PROMOS[currentPromo].text}`}
                  >
                    {PROMOS[currentPromo].title}
                  </h2>
                  <p
                    className={`text-sm sm:text-base md:text-xl opacity-90 mb-6 md:mb-10 font-light max-w-xs md:max-w-none ${PROMOS[currentPromo].text}`}
                  >
                    {PROMOS[currentPromo].subtitle}
                  </p>
                  <Link
                    href="/toko"
                    className="bg-white text-dark-green px-6 py-3 md:px-8 md:py-3.5 rounded-full font-bold shadow-lg hover:bg-cream-bg transition inline-flex items-center gap-2 text-sm md:text-base"
                  >
                    Shop Now <ArrowRight size={16} />
                  </Link>
                </div>
              </motion.div>
            </AnimatePresence>
            <div className="absolute bottom-6 left-0 w-full flex justify-center gap-2 z-20">
              {PROMOS.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setCurrentPromo(idx)}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    currentPromo === idx ? "w-8 bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mb-16 md:mb-20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:mb-12 pt-6 md:pt-10 px-6 md:px-10">
            <div className="relative">
              <div className="absolute -left-6 top-1 w-1 h-full bg-dark-green rounded-full hidden md:block"></div>
              <h2 className="text-3xl md:text-5xl font-serif font-bold text-dark-green mb-2">
                Curated{" "}
                <span className="italic font-light text-sage-green">
                  Favorites
                </span>
              </h2>
              <p className="text-gray-500 max-w-md text-sm md:text-base">
                Koleksi terpopuler dari berbagai tenant pilihan.
              </p>
            </div>
          </div>

          <div className="flex overflow-x-auto snap-x snap-mandatory py-10 gap-2 md:gap-4 px-6 md:px-6 pb-4 custom-scrollbar">
            {bestSellers.map((item, idx) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                viewport={{ once: true }}
                className="snap-center shrink-0"
              >
                <DashboardProductCard item={item} />
              </motion.div>
            ))}

            <div className="snap-center shrink-0">
              <Link
                href="/toko"
                className="w-[200px] h-[420px] md:w-[240px] md:h-[480px] flex flex-col items-center justify-center rounded-[2.5rem] border-2 border-dashed border-dark-green/30 text-dark-green hover:bg-dark-green hover:text-white transition-all group ml-2"
              >
                <span className="font-serif font-bold text-lg text-center">
                  Explore
                  <br />
                  More
                </span>
                <div className="w-10 h-10 rounded-full border border-current flex items-center justify-center mt-4 group-hover:rotate-45 transition-transform">
                  <ArrowRight size={18} />
                </div>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CustomBouquetSection onOpenModal={() => setIsFloristModalOpen(true)} />

      <section className="bg-white/70 py-12 md:py-16 md:rounded-t-[6rem] -mx-0">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-8 md:pr-6 gap-4">
            <div className="w-full md:w-auto">
              <div className="flex items-center gap-2 text-sage-green mb-2">
                <MapPin size={16} />
                <span className="text-[10px] md:text-xs font-bold uppercase tracking-widest">
                  {isSearching ? "Search Results" : "Near You"}
                </span>
              </div>
              <h2 className="text-2xl md:text-3xl font-serif font-bold text-dark-green">
                {isSearching 
                    ? `Hasil: "${searchQuery}"` 
                    : (displayedShops.length > 0 ? "Florist Terdekat" : "Jelajahi Florist")}
              </h2>
              
              {locationPermissionDenied && !isSearching && (
                <div className="flex items-center gap-2 mt-2 text-sm text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full inline-flex">
                  <AlertCircle size={14} />
                  <span>Izinkan akses lokasi untuk melihat toko terdekat</span>
                </div>
              )}
            </div>

            <div className="w-full md:w-96 relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
              </div>
              <input 
                type="text"
                placeholder="Cari lokasi (e.g. Dago, Tebet)..."
                value={searchQuery}
                onChange={handleSearch}
                className="w-full pl-12 pr-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-sage-green/50 focus:border-sage-green bg-white shadow-sm text-sm"
              />
              {searchQuery && (
                <button 
                  onClick={() => { setSearchQuery(""); setIsSearching(false); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-gray-100 p-1 rounded-full text-gray-500 hover:bg-gray-200"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <NeighborhoodMap 
            shops={displayedShops.length > 0 ? displayedShops : SHOPS} 
            isSearching={isSearching} 
          />

          <div className="-mx-6 px-6 md:mx-0 md:px-0">
            {isLocLoading && !isSearching ? (
              <div className="w-full text-center py-10 flex flex-col items-center gap-2 text-gray-400">
                <Loader2 className="animate-spin text-sage-green" /> Mengambil lokasi...
              </div>
            ) : (
              <>
                {displayedShops.length === 0 && !isSearching ? (
                  <div className="bg-white border border-gray-100 rounded-2xl p-8 text-center shadow-sm">
                    <div className="w-16 h-16 bg-cream-bg rounded-full flex items-center justify-center mx-auto mb-4 text-4xl">
                      🍃
                    </div>
                    <h3 className="font-serif font-bold text-xl text-dark-green mb-2">
                      {locationPermissionDenied 
                        ? "Izinkan Lokasi untuk Melihat Florist Terdekat" 
                        : "Belum ada Florist di Sekitarmu"}
                    </h3>
                    <p className="text-gray-500 text-sm mb-6 max-w-md mx-auto">
                      {locationPermissionDenied
                        ? "Aktifkan akses lokasi di browser untuk menemukan florist terdekat dari posisimu."
                        : "Kamu berada di luar jangkauan mitra kami. Coba cari manual menggunakan kolom pencarian di atas."}
                    </p>
                    
                    {locationPermissionDenied ? (
                      <Button 
                        onClick={() => window.location.reload()}
                        className="bg-dark-green text-white hover:bg-sage-green rounded-full px-6"
                      >
                        Coba Lagi
                      </Button>
                    ) : (
                      <Button 
                        onClick={() => document.querySelector('input[type="text"]').focus()}
                        className="bg-dark-green text-white hover:bg-sage-green rounded-full px-6"
                      >
                        Cari Manual
                      </Button>
                    )}
                  </div>
                ) : (
                  <div className="flex gap-4 md:gap-6 overflow-x-auto pb-4 scrollbar-hide">
                    {displayedShops.map((shop) => (
                      <Link href={`/shop/${shop.id}`} key={shop.id} className="flex-shrink-0 w-64 md:w-72 group cursor-pointer">
                        <div className="h-40 md:h-48 rounded-xl overflow-hidden relative mb-4">
                          <img src={shop.image} className="w-full h-full object-cover group-hover:opacity-60 transition-opacity" />
                          {shop.distance && !locationPermissionDenied && (
                            <div className="absolute top-3 left-3 bg-white/90 backdrop-blur text-[10px] font-bold px-2 py-1 rounded-md shadow-sm text-dark-green">
                              📍 {shop.distance}
                            </div>
                          )}
                        </div>
                        <h3 className="text-lg md:text-xl font-serif font-bold text-dark-green leading-tight group-hover:text-sage-green">
                          {shop.name}
                        </h3>
                        <div className="flex items-center gap-1 text-orange-400 text-xs md:text-sm mt-1">
                          <Star size={12} fill="currentColor" /> {shop.rating}
                          <span className="text-gray-400 ml-2">• {shop.location}</span>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </section>

      <Footer />

      <FloristSelectionModal
        isOpen={isFloristModalOpen}
        onClose={() => setIsFloristModalOpen(false)}
      />
    </div>
  );
}