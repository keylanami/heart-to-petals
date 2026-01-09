"use client";
import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/context/AuthContext";
import { useInventory } from "@/app/context/InventoryContext";
import { useShop } from "@/app/context/ShopContext";
import {
  ArrowLeft,
  ChevronRight,
  Plus,
  Trash2,
  X,
  Store,
  Package,
  Flower2,
  ShoppingBag,
  MapPin,
  Clock,
  Image as ImageIcon,
  Check,
  Palette,
  LocateFixed,
} from "lucide-react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { HexColorPicker } from "react-colorful";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";
import { useToast } from "@/app/context/ToastContext";

const INPUT_STYLE =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all placeholder:text-gray-400";
const LABEL_STYLE =
  "text-[10px] font-bold text-gray-500 ml-1 mb-1 block uppercase tracking-wider";
const BTN_PRIMARY =
  "bg-dark-green text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-sage-green transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SECONDARY =
  "text-gray-400 font-bold text-sm hover:text-dark-green transition";

export default function RegisterTenantPage() {
  const router = useRouter();
  const { addItem } = useInventory();
  const { register } = useAuth();
  const { registerShop } = useShop();
  const mapRef = useRef(null);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  const { showToast } = useToast();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  const [account, setAccount] = useState({ name: "", email: "", password: "" });
  const [shop, setShop] = useState({
    name: "",
    address: "",
    coordinate: { lat: -6.914744, lng: 107.60981 },
    openTime: "09:00",
    closeTime: "21:00",
    can_customize: false,
  });

  const [flowers, setFlowers] = useState([]);
  const [packagings, setPackagings] = useState([]);
  const [catalog, setCatalog] = useState([]);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [modalType, setModalType] = useState(null);

  const [tempFlower, setTempFlower] = useState({
    name: "",
    price: "",
    stock: "",
    category: "romance",
    image: null,
    preview: "",
  });

  const [tempPack, setTempPack] = useState({
    type: "wrapping",
    price: "",
    variants: [],
  });
  const [variantInput, setVariantInput] = useState({
    name: "",
    hex: "#A3B18A",
    stock: "",
  });

  const [tempCatalog, setTempCatalog] = useState({
    title: "",
    price: "",
    category: "Warm",
    tag: "Romance",
    theme: "light",
    desc: "",
    story: "",
    care: "",
    flowers: "",
    image: null,
    preview: "",
  });

  const handleGetLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      showToast("Mencari lokasi...", "info");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;

          setShop((prev) => ({
            ...prev,
            coordinate: {
              lat: newLat,
              lng: newLng,
            },
          }));

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [newLng, newLat],
              zoom: 15,
              duration: 2000,
              essential: true,
            });
          }

          showToast("Lokasi ditemukan!", "success");
        },
        (error) => {
          console.error(error);
          showToast("Gagal mengambil lokasi. Pastikan GPS aktif.", "error");
        },
        { enableHighAccuracy: true }
      );
    } else {
      showToast("Browser tidak support geolocation.", "error");
    }
  };

  const handleFlowerImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempFlower({
        ...tempFlower,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const saveFlower = (e) => {
    e.preventDefault();
    setFlowers([
      ...flowers,
      {
        ...tempFlower,
        id: `f-${Date.now()}`,
        type: "flower",
        stock: parseInt(tempFlower.stock),
        price: parseInt(tempFlower.price),
        image: tempFlower.preview || "/assets/flowers/placeholder.png",
      },
    ]);
    setModalType(null);
    setTempFlower({
      name: "",
      price: "",
      stock: "",
      category: "romance",
      image: null,
      preview: "",
    });
  };

  const addVariantToPack = () => {
    if (!variantInput.name || !variantInput.stock) return;

    setTempPack({
      ...tempPack,
      variants: [
        ...tempPack.variants,
        {
          color: variantInput.name,
          hex: variantInput.hex,
          stock: parseInt(variantInput.stock),
        },
      ],
    });
    setVariantInput({ name: "", hex: variantInput.hex, stock: "" }); // Keep hex to allow adding similar shades
    setShowColorPicker(false);
  };

  const savePackaging = (e) => {
    e.preventDefault();

    const packName =
      tempPack.type === "wrapping"
        ? "Wrapping Paper"
        : tempPack.type === "box"
        ? "Flower Box"
        : "Ribbon";

    const totalStock = tempPack.variants.reduce((acc, v) => acc + v.stock, 0);

    setPackagings([
      ...packagings,
      {
        ...tempPack,
        name: packName,
        id: `p-${Date.now()}`,
        type: "packaging",
        price: parseInt(tempPack.price),
        stock: totalStock,
      },
    ]);
    setModalType(null);
    setTempPack({ type: "wrapping", price: "", variants: [] });
  };

  const handleCatalogImage = (e) => {
    const file = e.target.files[0];
    if (file) {
      setTempCatalog({
        ...tempCatalog,
        image: file,
        preview: URL.createObjectURL(file),
      });
    }
  };

  const saveCatalog = (e) => {
    e.preventDefault();
    const flowerArray = tempCatalog.flowers.split(",").map((f) => f.trim());

    setCatalog([
      ...catalog,
      {
        ...tempCatalog,
        id: `c-${Date.now()}`,
        type: "product",
        flowers: flowerArray,
        stock: 5,
        isBestSeller: false,
        price: parseInt(tempCatalog.price),
        image: tempCatalog.preview || "/assets/bouquet/placeholder.png",
      },
    ]);
    setModalType(null);
    setTempCatalog({
      title: "",
      price: "",
      category: "Warm",
      tag: "Romance",
      theme: "light",
      desc: "",
      story: "",
      care: "",
      flowers: "",
      image: null,
      preview: "",
    });
  };

  const handleFinalSubmit = async () => {
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1500));

    const newShopId = Date.now();

    const registeredShop = registerShop({
      name: shop.name,
      location: "Bandung",
      fullAddress: shop.address,
      openTime: `${shop.openTime} - ${shop.closeTime}`,
      can_customize: shop.can_customize,
      id: newShopId,
      status: "pending",
      image: "/assets/flowershop/placeholder_store.png",
    });

    const allItems = [...flowers, ...packagings, ...catalog];
    allItems.forEach((item) => {
      addItem({
        ...item,
        shopId: newShopId,
        shop: registeredShop,
      });
    });

    register(
      account.name,
      account.email,
      account.password,
      "tenant",
      registeredShop
    );
    setLoading(false);
  };

  if (!mounted) return null;

  return (
    <div className="min-h-screen bg-cream-bg font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-4xl bg-white rounded-[2.5rem] shadow-xl overflow-hidden border border-gray-100 flex flex-col md:flex-row min-h-[600px]">
        <div className="bg-dark-green p-8 text-white w-full md:w-1/3 flex flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-sage-green/20 rounded-full -mr-16 -mt-16 blur-3xl pointer-events-none"></div>
          <div>
            <Link
              href="/"
              className="inline-block hover:text-white/80 transition mb-8"
            >
              <ArrowLeft size={24} />
            </Link>
            <h1 className="text-2xl font-serif font-bold mb-2">
              Mitra Florist
            </h1>
            <p className="text-white/70 text-sm leading-relaxed">
              Bergabung dengan ekosistem kami.
            </p>
          </div>
          <div className="space-y-6 mt-8">
            {[
              { id: 1, label: "Akun Pemilik", icon: Store },
              { id: 2, label: "Profil Toko", icon: Store },
              { id: 3, label: "Fitur Custom", icon: Package },
              shop.can_customize
                ? { id: 4, label: "Bahan Baku", icon: Flower2 }
                : null,
              { id: 5, label: "Katalog", icon: ShoppingBag },
            ]
              .filter(Boolean)
              .map((s) => (
                <div
                  key={s.id}
                  className={`flex items-center gap-4 ${
                    step === s.id ? "opacity-100" : "opacity-40"
                  }`}
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border ${
                      step === s.id
                        ? "bg-white text-dark-green border-white"
                        : "border-white/30 text-white"
                    }`}
                  >
                    {s.id}
                  </div>
                  <span className="font-bold text-sm">{s.label}</span>
                </div>
              ))}
          </div>
          <div className="text-xs text-white/40 mt-8">© 2025 HeartToPetals</div>
        </div>

        <div className="flex-1 p-8 md:p-12 overflow-y-auto max-h-[90vh] custom-scrollbar">
          {step === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-dark-green">
                Informasi Pemilik
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={LABEL_STYLE}>Nama Lengkap</label>
                  <input
                    className={INPUT_STYLE}
                    value={account.name}
                    onChange={(e) =>
                      setAccount({ ...account, name: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Email Bisnis</label>
                  <input
                    type="email"
                    className={INPUT_STYLE}
                    value={account.email}
                    onChange={(e) =>
                      setAccount({ ...account, email: e.target.value })
                    }
                  />
                </div>
                <div>
                  <label className={LABEL_STYLE}>Password</label>
                  <input
                    type="password"
                    className={INPUT_STYLE}
                    value={account.password}
                    onChange={(e) =>
                      setAccount({ ...account, password: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="flex justify-end pt-4">
                <button
                  disabled={!account.name || !account.email}
                  onClick={() => setStep(2)}
                  className={BTN_PRIMARY}
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-dark-green">
                Profil Toko
              </h2>
              <div className="space-y-4">
                <div>
                  <label className={LABEL_STYLE}>Nama Toko</label>
                  <input
                    className={INPUT_STYLE}
                    value={shop.name}
                    onChange={(e) => setShop({ ...shop, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className={LABEL_STYLE}>Alamat Lengkap (Teks)</label>
                  <input
                    type="text"
                    className={INPUT_STYLE}
                    placeholder="Contoh: Jl. Mawar No. 123, Bandung"
                    value={shop.address}
                    onChange={(e) =>
                      setShop({ ...shop, address: e.target.value })
                    }
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className={LABEL_STYLE}>
                      Titik Lokasi (Geser Pin)
                    </label>
                    <button
                      type="button"
                      onClick={handleGetLocation}
                      className="text-[10px] font-bold text-sage-green flex items-center gap-1 hover:text-dark-green transition bg-white border border-sage-green/30 px-2 py-1 rounded-full shadow-sm"
                    >
                      <LocateFixed size={12} /> Ambil Lokasi Saya
                    </button>
                  </div>

                  <div className="h-[200px] w-full rounded-xl overflow-hidden border border-gray-200 relative z-0 shadow-inner">
                    <Map
                      ref={mapRef}
                      initialViewState={{
                        longitude: shop.coordinate?.lng || 107.60981,
                        latitude: shop.coordinate?.lat || -6.914744,
                        zoom: 14,
                      }}
                      center={
                        shop.coordinate
                          ? [shop.coordinate.lng, shop.coordinate.lat]
                          : [107.60981, -6.914744]
                      }
                      zoom={14}
                    >
                      <MapMarker
                        draggable
                        longitude={shop.coordinate?.lng || 107.60981}
                        latitude={shop.coordinate?.lat || -6.914744}
                        onDragEnd={(lngLat) => {
                          setShop((prev) => ({
                            ...prev,
                            coordinate: {
                              lat: lngLat.lat,
                              lng: lngLat.lng,
                            },
                          }));
                        }}
                      >
                        <MarkerContent>
                          <div className="cursor-move drop-shadow-lg transition-transform hover:scale-110 group">
                            <MapPin
                              className="fill-dark-green stroke-white text-dark-green"
                              size={32}
                            />
                          </div>
                        </MarkerContent>
                        <MarkerPopup>
                          <div className="text-xs font-bold text-dark-green">
                            {shop.name || "Toko Baru"}
                          </div>
                        </MarkerPopup>
                      </MapMarker>
                    </Map>
                  </div>
                  <p className="text-[10px] text-gray-400 font-mono text-right mt-1">
                    Lat: {shop.coordinate?.lat.toFixed(6) || "-"}, Lng:{" "}
                    {shop.coordinate?.lng.toFixed(6) || "-"}
                  </p>
                </div>

                <div>
                  <label className={LABEL_STYLE}>Jam Operasional</label>
                  <div className="flex items-center gap-2">
                    <div className="relative flex-1">
                      <Clock
                        size={16}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />
                      <input
                        type="time"
                        className={`${INPUT_STYLE} pl-10`}
                        value={shop.openTime}
                        onChange={(e) =>
                          setShop({ ...shop, openTime: e.target.value })
                        }
                      />
                    </div>
                    <span className="text-gray-400">-</span>
                    <div className="relative flex-1">
                      <Clock
                        size={16}
                        className="absolute left-3 top-3.5 text-gray-400"
                      />
                      <input
                        type="time"
                        className={`${INPUT_STYLE} pl-10`}
                        value={shop.closeTime}
                        onChange={(e) =>
                          setShop({ ...shop, closeTime: e.target.value })
                        }
                      />
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(1)} className={BTN_SECONDARY}>
                  Kembali
                </button>
                <button
                  disabled={!shop.name || !shop.address}
                  onClick={() => setStep(3)}
                  className={BTN_PRIMARY}
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <h2 className="text-2xl font-bold text-dark-green">
                Fitur Custom
              </h2>
              <p className="text-sm text-gray-500">
                Terima request buket custom?
              </p>
              <div
                onClick={() =>
                  setShop({ ...shop, can_customize: !shop.can_customize })
                }
                className={`border-2 rounded-2xl p-6 cursor-pointer transition-all flex items-start gap-4 ${
                  shop.can_customize
                    ? "border-sage-green bg-sage-green/10"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mt-1 ${
                    shop.can_customize
                      ? "border-sage-green bg-sage-green text-white"
                      : "border-gray-300"
                  }`}
                >
                  {shop.can_customize && (
                    <div className="w-3 h-3 bg-white rounded-full"></div>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-dark-green">
                    Ya, Aktifkan Custom
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Saya siap merangkai sesuai request (Wajib input stok Bunga).
                  </p>
                </div>
              </div>
              <div className="flex justify-between pt-4">
                <button onClick={() => setStep(2)} className={BTN_SECONDARY}>
                  Kembali
                </button>
                <button
                  onClick={() => setStep(shop.can_customize ? 4 : 5)}
                  className={BTN_PRIMARY}
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div>
                <h2 className="text-2xl font-bold text-dark-green">
                  Input Bahan Baku
                </h2>
                <p className="text-xs text-gray-500">Min. 3 jenis bunga.</p>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-700">
                    Bunga ({flowers.length})
                  </h3>
                  <button
                    onClick={() => setModalType("flower")}
                    className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200"
                  >
                    + Tambah
                  </button>
                </div>
                {flowers.map((f, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                        <img
                          src={f.image}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{f.name}</p>
                        <p className="text-[10px] text-gray-500">
                          Rp {f.price} • Stok {f.stock}
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        setFlowers(flowers.filter((item) => item.id !== f.id))
                      }
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="space-y-3 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-center">
                  <h3 className="font-bold text-sm text-gray-700">
                    Packaging ({packagings.length})
                  </h3>
                  <button
                    onClick={() => setModalType("packaging")}
                    className="text-xs bg-gray-100 px-3 py-1.5 rounded-lg font-bold hover:bg-gray-200"
                  >
                    + Tambah
                  </button>
                </div>
                {packagings.map((p, i) => (
                  <div
                    key={i}
                    className="flex justify-between items-center p-3 bg-gray-50 rounded-xl border border-gray-100"
                  >
                    <div>
                      <p className="text-sm font-bold capitalize">{p.name}</p>
                      <p className="text-[10px] text-gray-500">
                        {p.variants?.length || 0} Warna • Rp {p.price}
                      </p>
                    </div>
                    <button
                      onClick={() =>
                        setPackagings(
                          packagings.filter((item) => item.id !== p.id)
                        )
                      }
                    >
                      <Trash2 size={14} className="text-red-400" />
                    </button>
                  </div>
                ))}
              </div>

              <div className="flex justify-between pt-6">
                <button onClick={() => setStep(3)} className={BTN_SECONDARY}>
                  Kembali
                </button>
                <button
                  disabled={flowers.length < 3}
                  onClick={() => setStep(5)}
                  className={BTN_PRIMARY}
                >
                  Lanjut <ChevronRight size={16} />
                </button>
              </div>
            </motion.div>
          )}

          {step === 5 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center">
                <div>
                  <h2 className="text-2xl font-bold text-dark-green">
                    Katalog
                  </h2>
                  <p className="text-xs text-gray-500">Min. 5 Produk Jadi.</p>
                </div>
                <button
                  onClick={() => setModalType("catalog")}
                  className="bg-dark-green text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-sage-green flex items-center gap-2"
                >
                  <Plus size={16} /> Tambah
                </button>
              </div>
              <div className="bg-gray-50 rounded-xl p-4 min-h-[200px] border-2 border-dashed border-gray-200 space-y-3">
                {catalog.length === 0 ? (
                  <div className="text-center text-gray-400 py-12 text-sm">
                    Belum ada produk.
                  </div>
                ) : (
                  catalog.map((p, i) => (
                    <div
                      key={i}
                      className="bg-white p-3 rounded-lg border border-gray-100 flex justify-between items-center shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg bg-gray-200 overflow-hidden">
                          <img
                            src={p.image}
                            className="w-full h-full object-cover"
                          />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-dark-green">
                            {p.title}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {p.category} • {p.tag}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-bold text-sage-green">
                          Rp {parseInt(p.price).toLocaleString("id-ID")}
                        </span>
                        <button
                          onClick={() =>
                            setCatalog(catalog.filter((c) => c.id !== p.id))
                          }
                          className="text-red-400 hover:text-red-600"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
              <div className="flex justify-between pt-6">
                <button
                  onClick={() => setStep(shop.can_customize ? 4 : 3)}
                  className={BTN_SECONDARY}
                >
                  Kembali
                </button>
                <button
                  disabled={catalog.length < 5 || loading}
                  onClick={handleFinalSubmit}
                  className={BTN_PRIMARY}
                >
                  {loading ? "Mendaftarkan..." : "Kirim Pendaftaran"}
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {modalType && (
          <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl overflow-y-auto max-h-[90vh] custom-scrollbar"
            >
              <div className="flex justify-between items-center mb-4 border-b pb-2">
                <h3 className="font-bold text-lg text-dark-green capitalize">
                  Tambah {modalType} 
                </h3>
                <button onClick={() => setModalType(null)}>
                  <X className="text-gray-400" />
                </button>
              </div>

              {modalType === "flower" && (
                <form onSubmit={saveFlower} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFlowerImage}
                        accept="image/*"
                        required
                      />
                      {tempFlower.preview ? (
                        <img
                          src={tempFlower.preview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className={LABEL_STYLE}>Nama Bunga</label>
                        <input
                          required
                          className={INPUT_STYLE}
                          value={tempFlower.name}
                          onChange={(e) =>
                            setTempFlower({
                              ...tempFlower,
                              name: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <label className={LABEL_STYLE}>Harga</label>
                          <input
                            required
                            type="number"
                            className={INPUT_STYLE}
                            value={tempFlower.price}
                            onChange={(e) =>
                              setTempFlower({
                                ...tempFlower,
                                price: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="flex-1">
                          <label className={LABEL_STYLE}>Stok</label>
                          <input
                            required
                            type="number"
                            className={INPUT_STYLE}
                            value={tempFlower.stock}
                            onChange={(e) =>
                              setTempFlower({
                                ...tempFlower,
                                stock: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_STYLE}>Kategori</label>
                      <select
                        className={INPUT_STYLE}
                        value={tempFlower.category}
                        onChange={(e) =>
                          setTempFlower({
                            ...tempFlower,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="Romance">Romance</option>
                        <option value="Gratitude">Gratitude</option>
                        <option value="Regret">Regret</option>
                        <option value="grief">Grief</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full mt-4 ${BTN_PRIMARY}`}
                  >
                    Simpan Bunga
                  </button>
                </form>
              )}

              {modalType === "packaging" && (
                <form onSubmit={savePackaging} className="space-y-5">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className={LABEL_STYLE}>Tipe Packaging</label>
                      <select
                        className={INPUT_STYLE}
                        value={tempPack.type}
                        onChange={(e) =>
                          setTempPack({ ...tempPack, type: e.target.value })
                        }
                      >
                        <option value="wrapping">Wrapping Paper</option>
                        <option value="box">Flower Box</option>
                        <option value="ribbon">Ribbon</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_STYLE}>Harga Tambahan</label>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">
                          Rp
                        </span>
                        <input
                          required
                          type="number"
                          className={`${INPUT_STYLE} pl-8`}
                          value={tempPack.price}
                          onChange={(e) =>
                            setTempPack({ ...tempPack, price: e.target.value })
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200 shadow-inner">
                    <h4 className="font-bold text-dark-green text-sm mb-4 flex items-center gap-2">
                      <Palette size={18} /> Buat Varian Warna
                    </h4>

                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <label className={LABEL_STYLE}>Pilih Warna & Hex</label>
                        <div className="flex gap-3 items-center relative z-20">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowColorPicker(!showColorPicker)
                              }
                              className="w-14 h-14 rounded-xl border-4 border-white shadow transition hover:scale-105 flex items-center justify-center"
                              style={{ backgroundColor: variantInput.hex }}
                            >
                              {!showColorPicker && (
                                <Palette
                                  size={20}
                                  className="text-white/60 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]"
                                />
                              )}
                            </button>

                            <AnimatePresence>
                              {showColorPicker && (
                                <motion.div
                                  initial={{ opacity: 0, y: -10 }}
                                  animate={{ opacity: 1, y: 0 }}
                                  exit={{ opacity: 0, y: -10 }}
                                  className="absolute top-16 left-0 z-50 p-3 bg-white shadow-2xl rounded-2xl border border-gray-100"
                                >
                                  <div
                                    className="fixed inset-0 z-40"
                                    onClick={() => setShowColorPicker(false)}
                                  />
                                  <div className="relative z-50">
                                    <HexColorPicker
                                      color={variantInput.hex}
                                      onChange={(color) =>
                                        setVariantInput({
                                          ...variantInput,
                                          hex: color,
                                        })
                                      }
                                    />
                                  </div>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>

                          <div className="relative flex-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-mono font-bold">
                              #
                            </span>
                            <input
                              placeholder="000000"
                              className={`${INPUT_STYLE} pl-7 font-mono uppercase tracking-widest text-lg h-14`}
                              value={variantInput.hex.replace("#", "")}
                              onChange={(e) => {
                                const val = e.target.value
                                  .replace(/[^0-9A-Fa-f]/g, "")
                                  .slice(0, 6);
                                setVariantInput({
                                  ...variantInput,
                                  hex: `#${val}`,
                                });
                              }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className={LABEL_STYLE}>
                            Nama Varian (Label)
                          </label>
                          <input
                            placeholder="Contoh: Hijau Sage, Merah Ati"
                            className={INPUT_STYLE}
                            value={variantInput.name}
                            onChange={(e) =>
                              setVariantInput({
                                ...variantInput,
                                name: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div>
                          <label className={LABEL_STYLE}>Stok Awal</label>
                          <input
                            type="number"
                            placeholder="0"
                            className={`${INPUT_STYLE} text-center`}
                            value={variantInput.stock}
                            onChange={(e) =>
                              setVariantInput({
                                ...variantInput,
                                stock: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={addVariantToPack}
                        disabled={!variantInput.name || !variantInput.stock}
                        className="w-full py-3 bg-white border-2 border-dashed border-dark-green text-dark-green rounded-xl font-bold text-sm hover:bg-dark-green hover:text-white hover:border-solid transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Plus size={18} /> Tambahkan Varian Ini
                      </button>
                    </div>

                    <div className="mt-5">
                      <label className={LABEL_STYLE}>
                        Daftar Varian Siap Simpan ({tempPack.variants.length})
                      </label>
                      <div className="flex flex-wrap gap-2 mt-2 p-2 bg-white rounded-xl border border-gray-100 min-h-[60px]">
                        {tempPack.variants.map((v, idx) => (
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            key={idx}
                            className="pl-1 pr-2 py-1 bg-gray-50 border border-gray-200 rounded-full flex items-center gap-2 shadow-sm"
                          >
                            <div
                              className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: v.hex }}
                            ></div>

                            <div className="flex flex-col">
                              <span className="text-xs font-bold text-gray-800 leading-tight">
                                {v.color}
                              </span>
                              <span className="text-[9px] text-gray-500 leading-tight font-mono">
                                {v.hex} • Qty: {v.stock}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => {
                                const newVariants = [...tempPack.variants];
                                newVariants.splice(idx, 1);
                                setTempPack({
                                  ...tempPack,
                                  variants: newVariants,
                                });
                              }}
                              className="ml-2 w-6 h-6 flex items-center justify-center rounded-full hover:bg-red-100 text-gray-400 hover:text-red-500 transition"
                            >
                              <X size={14} />
                            </button>
                          </motion.div>
                        ))}
                        {tempPack.variants.length === 0 && (
                          <div className="w-full h-full flex items-center justify-center text-xs text-gray-400 italic text-center py-4">
                            Belum ada varian. Gunakan form di atas untuk
                            menambahkan.
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={tempPack.variants.length === 0}
                    className={`w-full py-4 text-base ${BTN_PRIMARY} ${
                      tempPack.variants.length === 0
                        ? "bg-gray-400 hover:bg-gray-400 cursor-not-allowed opacity-100"
                        : ""
                    }`}
                  >
                    {tempPack.variants.length === 0
                      ? "Minimal 1 Varian Wajib Diisi"
                      : "Simpan Packaging"}
                  </button>
                </form>
              )}

              {modalType === "catalog" && (
                <form onSubmit={saveCatalog} className="space-y-4">
                  <div className="flex gap-4">
                    <div className="w-24 h-24 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed border-gray-300 relative overflow-hidden group cursor-pointer">
                      <input
                        type="file"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleCatalogImage}
                        accept="image/*"
                        required
                      />
                      {tempCatalog.preview ? (
                        <img
                          src={tempCatalog.preview}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="text-gray-400" />
                      )}
                    </div>
                    <div className="flex-1 space-y-2">
                      <div>
                        <label className={LABEL_STYLE}>Nama Bouquet</label>
                        <input
                          required
                          className={INPUT_STYLE}
                          value={tempCatalog.title}
                          onChange={(e) =>
                            setTempCatalog({
                              ...tempCatalog,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>
                      <div>
                        <label className={LABEL_STYLE}>Harga</label>
                        <input
                          required
                          type="number"
                          className={INPUT_STYLE}
                          value={tempCatalog.price}
                          onChange={(e) =>
                            setTempCatalog({
                              ...tempCatalog,
                              price: e.target.value,
                            })
                          }
                        />
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className={LABEL_STYLE}>Kategori</label>
                      <select
                        className={INPUT_STYLE}
                        value={tempCatalog.category}
                        onChange={(e) =>
                          setTempCatalog({
                            ...tempCatalog,
                            category: e.target.value,
                          })
                        }
                      >
                        <option value="Warm">Warm</option>
                        <option value="Gloomy">Melancholic</option>
                      </select>
                    </div>
                    <div>
                      <label className={LABEL_STYLE}>Tag</label>
                      <select
                        className={INPUT_STYLE}
                        value={tempCatalog.tag}
                        onChange={(e) =>
                          setTempCatalog({
                            ...tempCatalog,
                            tag: e.target.value,
                          })
                        }
                      >
                        <option value="Romance">Romance</option>
                        <option value="Gratitude">Gratitude</option>
                        <option value="Grief">Grief</option>
                        <option value="Regret">Regret</option>
                      </select>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className={LABEL_STYLE}>Deskripsi</label>
                    <textarea
                      required
                      rows={2}
                      className={INPUT_STYLE}
                      value={tempCatalog.desc}
                      onChange={(e) =>
                        setTempCatalog({ ...tempCatalog, desc: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={LABEL_STYLE}>Story (Makna)</label>
                    <textarea
                      required
                      rows={2}
                      className={INPUT_STYLE}
                      value={tempCatalog.story}
                      onChange={(e) =>
                        setTempCatalog({
                          ...tempCatalog,
                          story: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div className="space-y-1">
                    <label className={LABEL_STYLE}>Care Instructions</label>
                    <input
                      required
                      className={INPUT_STYLE}
                      value={tempCatalog.care}
                      onChange={(e) =>
                        setTempCatalog({ ...tempCatalog, care: e.target.value })
                      }
                    />
                  </div>
                  <div>
                    <label className={LABEL_STYLE}>Komposisi Bunga</label>
                    <input
                      required
                      placeholder="Pisahkan koma"
                      className={INPUT_STYLE}
                      value={tempCatalog.flowers}
                      onChange={(e) =>
                        setTempCatalog({
                          ...tempCatalog,
                          flowers: e.target.value,
                        })
                      }
                    />
                  </div>
                  <button
                    type="submit"
                    className={`w-full mt-4 ${BTN_PRIMARY}`}
                  >
                    Simpan Produk
                  </button>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
