"use client";
import { useCart } from "@/app/context/CartContext";
import { useAuth } from "@/app/context/AuthContext";
import { useOrder } from "@/app/context/OrderContext";
import { useToast } from "@/app/context/ToastContext";
// import api from "@/lib/axios"; 
// import useSnap from "@/app/context/hooks/useSnap"; 
import {
  ArrowLeft,
  MapPin,
  Store,
  ShieldCheck,
  CreditCard,
  Truck,
  X,
  Plus,
  Check,
  AlertTriangle,
  LogOut,
  LocateFixed,
} from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState, Suspense, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
<<<<<<< HEAD:app/checkout/page.jsx
import { Map, MapMarker, MarkerContent } from "@/components/ui/map";
=======
import axios from "axios";
import useSnap from "@/app/context/hooks/Snap";
>>>>>>> 799641fdf1204d247b3a759b42eba940c4e55b7e:frontend/app/checkout/page.jsx

const shippingOptions = [
  { name: "Instant", cost: 25000, eta: "3-6 Jam" },
  { name: "Same Day", cost: 15000, eta: "6-12 Jam" },
  { name: "Reguler", cost: 9000, eta: "2-3 Hari" },
];

const DEFAULT_COORD = { lat: -6.914744, lng: 107.60981 };

// DATA INITIAL SESUAI PERMINTAAN (Tanpa City/isPrimary)
const INITIAL_ADDRESSES = [
  {
    id: 101,
    name: "Isi nama kamu di sini",
    phone: "(+62)",
    street: "Daftarkan alamat lengkapmu di sini untuk pengiriman pesanan.",
    label: "Rumah",
    latitude: DEFAULT_COORD.lat, 
    longitude: DEFAULT_COORD.lng,
  },
];

function CheckoutContent() {
  const { cart, removeItems } = useCart();
  const { user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { showToast } = useToast();
  const { addOrder } = useOrder();
<<<<<<< HEAD:app/checkout/page.jsx
  
  const mapRef = useRef(null);
=======
   const snap = useSnap(); 
>>>>>>> 799641fdf1204d247b3a759b42eba940c4e55b7e:frontend/app/checkout/page.jsx

  const [isClient, setIsClient] = useState(false);
  const [shippingSelection, setShippingSelection] = useState({});
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [selectedCheckoutIds, setSelectedCheckoutIds] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [availableAddresses, setAvailableAddresses] = useState(INITIAL_ADDRESSES);
  const [selectedAddressId, setSelectedAddressId] = useState(101);

  const [showAddressList, setShowAddressList] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [addressForm, setAddressForm] = useState({
    name: "",
    phone: "",
    street: "",
    label: "Rumah",
    latitude: DEFAULT_COORD.lat,
    longitude: DEFAULT_COORD.lng,
  });

  const activeAddress =
    availableAddresses.find((a) => a.id === selectedAddressId) ||
    availableAddresses[0];

  useEffect(() => {
    setIsClient(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("saved_addresses");
      if (saved) {
        const parsed = JSON.parse(saved);
        // FIX: Sanitasi data agar Label & Koordinat selalu ada
        const sanitized = parsed.map(addr => ({
            ...addr,
            latitude: addr.latitude || DEFAULT_COORD.lat,
            longitude: addr.longitude || DEFAULT_COORD.lng,
            label: addr.label || "Rumah" // Default label jika kosong
        }));
        setAvailableAddresses(sanitized);
      } else {
        setAvailableAddresses(INITIAL_ADDRESSES);
      }

      const ids = localStorage.getItem("checkoutIds");
      if (ids) setSelectedCheckoutIds(JSON.parse(ids));
    }
  }, []);

  const handleGetLocation = () => {
    if (navigator.geolocation) {
      showToast("Mencari titik lokasi...", "info");
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;

          setAddressForm((prev) => ({
            ...prev,
            latitude,
            longitude,
          }));

          if (mapRef.current) {
            mapRef.current.flyTo({
              center: [longitude, latitude],
              zoom: 15,
              essential: true,
            });
          }
          showToast("Lokasi ditemukan!", "success");
        },
        () => showToast("Gagal mengambil lokasi.", "error")
      );
    }
  };

  const isDirectBuy = searchParams.get("direct") === "true";
  const directId = searchParams.get("id");

  const displayItems =
    isDirectBuy && directId
      ? cart.filter((item) => String(item.id) === String(directId))
      : cart.filter((item) => selectedCheckoutIds.includes(item.id));

  const groupedCart = displayItems.reduce((acc, item) => {
    const shopId = item.shop?.id || "unknown";
    if (!acc[shopId]) acc[shopId] = { shop: item.shop, items: [] };
    acc[shopId].items.push(item);
    return acc;
  }, {});

  const shopKeys = Object.keys(groupedCart);

  

  useEffect(() => {
    if (shopKeys.length > 0) {
      setShippingSelection((prev) => {
        const next = { ...prev };
        let hasChange = false;
        shopKeys.forEach((shopId) => {
          if (!next[shopId]) {
            next[shopId] = shippingOptions[1];
            hasChange = true;
          }
        });
        return hasChange ? next : prev;
      });
    }
  }, [shopKeys.length]);

  const handleChangeShipping = (shopId, option) =>
    setShippingSelection((prev) => ({ ...prev, [shopId]: option }));

  const calculateTotal = () => {
    const itemsTotal = displayItems.reduce(
      (sum, item) => sum + item.price * (item.qty || 1),
      0
    );
    let shippingTotal = 0;
    shopKeys.forEach((shopId) => {
      const selected = shippingSelection[shopId];
      if (selected) shippingTotal += selected.cost;
    });
    const serviceFee = 2000;
    const grandTotal = itemsTotal + shippingTotal + serviceFee;
    return { itemsTotal, shippingTotal, serviceFee, grandTotal };
  };

  const { itemsTotal, shippingTotal, serviceFee, grandTotal } = calculateTotal();
  
  const toRupiah = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumSignificantDigits: 3,
    }).format(num || 0);


  const handleOpenAddressModal = () => {
    if (availableAddresses.length === 0) {
      resetForm();
      setShowAddForm(true);
    } else {
      setShowAddressList(true);
    }
  };

  const handleSelectAddress = (id) => {
    setSelectedAddressId(id);
    setShowAddressList(false);
  };

  const resetForm = () => {
    setAddressForm({
      name: "",
      phone: "",
      street: "",
      label: "Rumah",
      latitude: DEFAULT_COORD.lat,
      longitude: DEFAULT_COORD.lng,
    });
    setEditingId(null);
  };

  const handleEditClick = (address) => {
    setAddressForm({
        ...address,
        latitude: address.latitude || DEFAULT_COORD.lat,
        longitude: address.longitude || DEFAULT_COORD.lng,
    });
    setEditingId(address.id);
    setShowAddressList(false);
    setShowAddForm(true);
  };

  const handleAddNewClick = () => {
    resetForm();
    setShowAddressList(false);
    setShowAddForm(true);
  };

  const handleSaveAddress = () => {
    if (!addressForm.name || !addressForm.street) return;

    let updatedList;
    const addrData = {
        ...addressForm,
        latitude: Number(addressForm.latitude),
        longitude: Number(addressForm.longitude),
        label: addressForm.label || "Rumah" // Pastikan label tersimpan
    };

    if (editingId) {
      updatedList = availableAddresses.map((addr) =>
        addr.id === editingId ? { ...addr, ...addrData } : addr
      );
      showToast("Alamat berhasil diperbarui", "success");
    } else {
      const newId = Date.now();
      const newAddrObj = {
        id: newId,
        ...addrData,
      };
      updatedList = [newAddrObj, ...availableAddresses];
      setSelectedAddressId(newId);
      showToast("Alamat baru ditambahkan", "success");
    }

    setAvailableAddresses(updatedList);
    localStorage.setItem("saved_addresses", JSON.stringify(updatedList));

    resetForm();
    setShowAddForm(false);
    setShowAddressList(true);
  };

<<<<<<< HEAD:app/checkout/page.jsx
  const handlePayment = async () => {
    if (!user) {
      showToast("Login dulu ya!", "error");
      router.push("/login");
      return;
    }
    if (!activeAddress || !activeAddress.street) {
      showToast("Mohon isi alamat pengiriman dengan lengkap.", "error");
      handleOpenAddressModal();
      return;
    }

    setIsProcessing(true);

    try {
        await new Promise(r => setTimeout(r, 1500)); 

        const mockOrderId = `ORD-${Date.now()}`;
        
        const orderData = {
             id: mockOrderId,
             date: new Date().toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' }),
             customer: user.name,
             address: activeAddress,
             status: "processing", 
             payment_status: "paid",
             items: displayItems,
             financials: { itemsTotal, shippingTotal, serviceFee, grandTotal },
             timeline: [
                { title: "Pembayaran Berhasil", date: "Baru saja", desc: "Pesanan lunas (Mock).", status: "completed" },
                { title: "Menunggu Proses Penjual", date: "Est. 10 Menit", desc: "Penjual akan menyiapkan pesananmu.", status: "active" }
             ]
        };

        addOrder(orderData); 

      if (isDirectBuy) {
          removeItems(displayItems.map((item) => item.id));
      } else {
          removeItems(displayItems.map((item) => item.id));
          localStorage.removeItem("checkoutIds");
        }


        showToast("Pembayaran Berhasil (Mock)!", "success");
        router.push(`/checkout/order-success?id=${mockOrderId}`);
        
        
    } catch (error) {
        console.error("Checkout Error:", error);
        showToast("Terjadi kesalahan saat checkout.", "error");
    } finally {
        setIsProcessing(false);
    }
  };
=======


const handlePayment = async () => {
    if (!user) return router.push("/login");
    
    try {
        const response = await axios.post(
            "http://localhost:8000/api/checkout/process", // Ganti URL API backend kamu
            {
                // Kirim data yang dibutuhkan backend (sesuai Blade tadi dia butuh shipping_type)
                shipping_type: "reguler", 
                items: displayItems, 
                address_id: activeAddress.id
            },
            {
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("token")}` 
                }
            }
        );

        const { snap_token, order_id } = response.data;

        // 2. Munculin Popup Midtrans (Pengganti snap.pay di jQuery)
        if (snap && snap_token) {
            snap.pay(snap_token, {
                // Berhasil bayar
                onSuccess: function (result) {
                    showToast("Pembayaran Berhasil!", "success");
                    router.push(`/checkout/success?id=${order_id}`);
                },
                // Masih pending (misal pilih ATM transfer tapi belum transfer)
                onPending: function (result) {
                    showToast("Menunggu Pembayaran...", "info");
                    router.push(`/checkout/success?id=${order_id}`);
                },
                // Gagal / Error
                onError: function (result) {
                    showToast("Pembayaran Gagal", "error");
                    console.error(result);
                },
                // User tutup popup tanpa bayar
                onClose: function () {
                    showToast("Pembayaran belum selesai", "warning");
                }
            });
        }

    } catch (error) {
        console.error("Gagal checkout:", error);
        showToast("Gagal memproses pesanan.", "error");
    }
};
>>>>>>> 799641fdf1204d247b3a759b42eba940c4e55b7e:frontend/app/checkout/page.jsx

  const handleCancelClick = () => setIsCancelModalOpen(true);
  const confirmCancelOrder = () => {
    setIsCancelModalOpen(false);
    router.back();
    setTimeout(() => showToast("Pesanan dibatalkan.", "info"), 200);
  };

  if (!isClient) return <div className="min-h-screen bg-cream-bg"></div>;

  return (
    <main className="bg-gray-50 min-h-screen pb-32 font-sans text-gray-800">
      <header className="fixed top-0 left-0 w-full bg-white/80 backdrop-blur-md border-b border-gray-100 px-4 md:px-8 py-4 z-50 flex items-center justify-between shadow-sm">
        <button
          onClick={handleCancelClick}
          className="flex items-center gap-2 text-gray-500 hover:text-red-500 transition-colors font-bold text-sm"
        >
          <ArrowLeft size={18} /> Batal
        </button>
        <div className="flex items-center gap-2 text-dark-green font-serif font-bold text-lg">
          Checkout
        </div>
        <div className="w-10"></div>
      </header>

      {/* --- MODAL ADDRESS LIST --- */}
      <AnimatePresence>
        {showAddressList && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center bg-dark-green/40 backdrop-blur-sm p-4"
            onClick={() => setShowAddressList(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-cream-bg w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] border border-white/50"
            >
              <div className="p-6 border-b border-sage-green/20 bg-white flex justify-between items-center sticky top-0 z-10">
                <h3 className="text-xl font-bold text-dark-green font-serif">
                  Alamat Penerima
                </h3>
                <button
                  onClick={() => setShowAddressList(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {availableAddresses.length === 0 ? (
                  <div className="text-center py-10 flex flex-col items-center">
                    <MapPin size={48} className="text-gray-300 mb-4" />
                    <p className="text-gray-400 text-sm">
                      Belum ada alamat tersimpan.
                    </p>
                  </div>
                ) : (
                  availableAddresses.map((addr) => {
                    const isSelected = selectedAddressId === addr.id;
                    return (
                      <div
                        key={addr.id}
                        onClick={() => handleSelectAddress(addr.id)}
                        className={`relative p-5 rounded-2xl border-2 transition-all cursor-pointer group ${
                          isSelected
                            ? "bg-white border-dark-green shadow-md"
                            : "bg-white border-transparent hover:border-sage-green/50 shadow-sm"
                        }`}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <div className="flex items-center gap-2">
                            {/* LABEL DI TAMPILKAN DI DEPAN NAMA (BAGIAN SINI DI-TWEAK) */}
                            <span className="bg-cream-bg text-dark-green text-[10px] font-bold px-2 py-0.5 rounded border border-sage-green/30 uppercase">
                              {addr.label || "Rumah"}
                            </span>
                            <span className="font-bold text-dark-green text-sm max-w-[150px] truncate">
                              {addr.name}
                            </span>
                          </div>
                          {isSelected && (
                            <div className="text-dark-green bg-sage-green/20 rounded-full p-1">
                              <Check size={14} strokeWidth={3} />
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                            <span className="text-gray-500 text-xs">{addr.phone}</span>
                        </div>

                        <p className="text-xs text-gray-600 leading-relaxed pr-8 line-clamp-2">
                          {addr.street}
                        </p>

                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(addr);
                          }}
                          className="absolute bottom-5 right-5 text-xs font-bold text-sage-green hover:text-dark-green transition-colors hover:underline decoration-dotted underline-offset-4"
                        >
                          Ubah
                        </button>
                      </div>
                    );
                  })
                )}
              </div>

              <div className="p-5 border-t border-sage-green/20 bg-white flex justify-center pb-8">
                <button
                  onClick={handleAddNewClick}
                  className="flex items-center gap-2 bg-dark-green hover:bg-sage-green text-white px-8 py-3.5 rounded-full text-sm font-bold shadow-lg transition-all hover:scale-105 active:scale-95 w-full justify-center"
                >
                  <Plus size={18} /> Tambah Alamat Baru
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MODAL 2: FORM TAMBAH/EDIT ALAMAT --- */}
      <AnimatePresence>
        {showAddForm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] flex items-center justify-center bg-dark-green/40 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              className="bg-cream-bg w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              <div className="p-6 border-b border-sage-green/20 bg-white flex justify-between items-center">
                <h3 className="text-xl font-bold text-dark-green font-serif">
                  {editingId ? "Ubah Alamat" : "Alamat Baru"}
                </h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition"
                >
                  <X size={20} className="text-gray-400" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 custom-scrollbar">
                <div className="flex gap-4">
                  <input
                    placeholder="Nama Lengkap"
                    className="flex-1 bg-white border border-gray-200 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
                    value={addressForm.name}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, name: e.target.value })
                    }
                  />
                  <input
                    placeholder="Nomor Telepon"
                    className="flex-1 bg-white border border-gray-200 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
                    value={addressForm.phone}
                    onChange={(e) =>
                      setAddressForm({ ...addressForm, phone: e.target.value })
                    }
                  />
                </div>

                <textarea
                  placeholder="Nama Jalan, Gedung, No. Rumah"
                  rows={2}
                  className="w-full bg-white border border-gray-200 p-3.5 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-sage-green resize-none"
                  value={addressForm.street}
                  onChange={(e) =>
                    setAddressForm({ ...addressForm, street: e.target.value })
                  }
                />

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                     <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                         Titik Lokasi
                     </label>
                     <button
                        type="button"
                        onClick={handleGetLocation}
                        className="text-[10px] font-bold text-sage-green flex items-center gap-1 bg-white border border-sage-green/30 px-2 py-1 rounded-full shadow-sm"
                     >
                        <LocateFixed size={12} /> Ambil Lokasi Saya
                     </button>
                  </div>
                  
                  <div className="h-[200px] w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0 shadow-inner group">
                    <Map
                      ref={mapRef}
                      initialViewState={{
                        longitude: addressForm.longitude || DEFAULT_COORD.lng,
                        latitude: addressForm.latitude || DEFAULT_COORD.lat,
                        zoom: 13,
                      }}
                      center={[
                         addressForm.longitude || DEFAULT_COORD.lng, 
                         addressForm.latitude || DEFAULT_COORD.lat
                      ]}
                    >
                      <MapMarker
                        draggable
                        longitude={addressForm.longitude || DEFAULT_COORD.lng}
                        latitude={addressForm.latitude || DEFAULT_COORD.lat}
                        onDragEnd={(e) => {
                          setAddressForm((prev) => ({
                            ...prev,
                            longitude: e.lngLat.lng,
                            latitude: e.lngLat.lat,
                          }));
                        }}
                      >
                        <MarkerContent>
                            <MapPin size={32} className="text-dark-green fill-dark-green stroke-white drop-shadow-xl animate-bounce"/>
                        </MarkerContent>
                      </MapMarker>
                    </Map>
                  </div>
                </div>

                <div className="flex items-center gap-4 pt-2">
                  <span className="text-sm font-bold text-gray-500">
                    Label:
                  </span>
                  <div className="flex gap-2">
                    {["Rumah", "Kantor", "Kost"].map((label) => (
                      <button
                        key={label}
                        onClick={() =>
                          setAddressForm({ ...addressForm, label })
                        }
                        className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                          addressForm.label === label
                            ? "bg-dark-green text-white border-dark-green shadow-md"
                            : "bg-white text-gray-500 border-gray-200 hover:border-sage-green hover:text-dark-green"
                        }`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-sage-green/20 bg-white flex justify-between gap-3 items-center">
                <button
                  onClick={() => setShowAddForm(false)}
                  className="px-6 py-3 text-sm text-gray-400 hover:text-dark-green font-bold transition-colors"
                >
                  Batal
                </button>
                <button
                  onClick={handleSaveAddress}
                  className="flex-1 py-3.5 bg-dark-green hover:bg-sage-green text-white text-sm font-bold rounded-full shadow-lg transition-all transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={!addressForm.name}
                >
                  Simpan Alamat
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="pt-28 px-4 md:px-6 max-w-6xl mx-auto flex flex-col lg:flex-row gap-8">
        <div className="flex-1 space-y-6">
          <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden group hover:shadow-md transition-shadow">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-dark-green/80 via-sage-green/80 to-dark-green/80 opacity-90"></div>

            <h2 className="font-bold text-lg text-dark-green mb-4 flex items-center gap-2 pt-2">
              <MapPin size={20} className="text-sage-green fill-current" />{" "}
              Alamat Pengiriman
            </h2>

            <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pl-1">
              {activeAddress ? (
                <div className="text-sm text-gray-800 space-y-2 flex-1 min-w-0">
                  <div className="font-bold text-base text-dark-green flex items-center gap-2">
                     {/* LABEL TAMPIL DI DEPAN */}
                    <span className="bg-cream-bg text-dark-green text-[10px] font-bold px-2 py-0.5 rounded border border-sage-green/30 uppercase shrink-0">
                        {activeAddress.label || "Rumah"}
                    </span>
                    <span className="truncate max-w-[200px]">
                      {activeAddress.name}
                    </span>
                    <span className="w-1 h-1 rounded-full bg-gray-300 shrink-0"></span>
                    <span className="font-normal text-gray-500 text-sm font-mono shrink-0">
                      {activeAddress.phone}
                    </span>
                  </div>

                  <div className="text-gray-600 leading-relaxed bg-cream-bg/50 p-3 rounded-xl border border-sage-green/10 w-full">
                    <p className="line-clamp-2 break-words text-sm">
                      {activeAddress.street}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-sm text-gray-500 italic py-2 flex items-center gap-2">
                  <AlertTriangle size={16} className="text-yellow-500" />
                  Belum ada alamat pengiriman.
                </div>
              )}

              <button
                onClick={handleOpenAddressModal}
                className="text-dark-green font-bold text-sm hover:text-sage-green uppercase tracking-wide shrink-0 transition-colors underline decoration-dotted underline-offset-4"
              >
                {availableAddresses.length === 0 ? "Tambah Alamat" : "Ubah"}
              </button>
            </div>
          </section>

          {/* Cart items etc */}
          {displayItems.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-[2rem]">
              <p className="text-gray-400 mb-4">Keranjang kosong.</p>
              <button
                onClick={() => router.push("/toko")}
                className="text-dark-green font-bold underline"
              >
                Belanja Dulu
              </button>
            </div>
          ) : (
            shopKeys.map((shopId) => {
              const group = groupedCart[shopId];
              return (
                <div
                  key={shopId}
                  className="bg-white p-6 rounded-[2rem] shadow-sm border border-gray-100"
                >
                  <h2 className="font-bold text-md text-dark-green mb-6 flex items-center gap-2 pb-4 border-b border-gray-50">
                    <Store size={18} className="text-sage-green" />{" "}
                    {group.shop?.name || "Florist Partner"}
                  </h2>
                  <div className="space-y-6">
                    {group.items.map((item, idx) => (
                      <div key={idx} className="flex gap-4">
                        <div className="w-20 h-24 rounded-2xl overflow-hidden bg-gray-100 flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover"
                          />
                          {item.isCustom && (
                            <div className="absolute top-0 left-0 bg-sage-green text-white text-[10px] font-bold px-2 py-0.5 rounded-br-lg z-10">
                              Custom
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-serif font-bold text-lg text-dark-green leading-tight">
                            {item.title}
                          </h3>
                          <p className="text-xs text-gray-400 mt-1">
                            {item.isCustom ? "Custom Request" : "Ready Stock"} •{" "}
                            {item.category || "Bouquet"}
                          </p>
                          <div className="flex justify-between items-end mt-2">
                            <p className="font-bold text-dark-green">
                              {toRupiah(item.price)}{" "}
                              <span className="text-xs text-gray-400 font-normal">
                                x {item.qty || 1}
                              </span>
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 pt-4 border-t border-dashed border-gray-200 bg-cream-bg -mx-6 px-6 pb-4 rounded-b-[2rem]">
                    <div className="flex items-center gap-2 text-sm font-bold text-gray-700 mb-3 pt-3">
                      <Truck size={16} /> <span>Opsi Pengiriman</span>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      {shippingOptions.map((opt) => (
                        <button
                          key={opt.name}
                          onClick={() => handleChangeShipping(shopId, opt)}
                          className={`flex-1 min-w-[120px] text-left p-3 rounded-xl border text-xs transition-all relative ${
                            shippingSelection[shopId]?.name === opt.name
                              ? "border-sage-green bg-white text-dark-green ring-2 ring-sage-green/50 shadow-md"
                              : "border-gray-200 bg-white text-gray-500 hover:border-sage-green/50"
                          }`}
                        >
                          <div className="font-bold">{opt.name}</div>
                          <div className="text-[10px] opacity-70">
                            {opt.eta}
                          </div>
                          <div className="mt-1 font-bold text-sage-green">
                            {toRupiah(opt.cost)}
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        <div className="lg:w-[380px]">
          <div className="bg-white p-6 rounded-[2rem] shadow-lg border border-gray-100 sticky top-28">
            <h3 className="font-serif font-bold text-xl text-dark-green mb-6">
              Ringkasan Pembayaran
            </h3>
            <div className="space-y-3 text-sm text-gray-600 mb-6">
              <div className="flex justify-between">
                <span>Total Harga Barang</span>
                <span className="font-medium">{toRupiah(itemsTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Total Ongkos Kirim</span>
                <span className="font-medium">{toRupiah(shippingTotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Biaya Layanan</span>
                <span className="font-medium">{toRupiah(serviceFee)}</span>
              </div>
              <div className="border-t border-dashed border-gray-200 my-4 pt-4 flex justify-between items-center text-dark-green font-bold text-lg">
                <span>Total Tagihan</span>
                <span>{toRupiah(grandTotal)}</span>
              </div>
            </div>
            <div className="bg-sage-green/10 p-4 rounded-2xl flex items-start gap-3 text-xs text-dark-green mb-6 border border-sage-green/20">
              <ShieldCheck size={16} className="shrink-0 mt-0.5" />
              <p className="font-medium">
                Pembayaran Full di muka (Aman & Bergaransi).
              </p>
            </div>
            <button
              onClick={handlePayment}
              disabled={displayItems.length === 0 || isProcessing}
              className={`w-full bg-dark-green text-white py-4 rounded-full font-bold shadow-lg hover:bg-sage-green transition-all flex items-center justify-center gap-2 transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed ${isProcessing ? 'opacity-70 cursor-wait' : ''}`}
            >
              {isProcessing ? (
                  <>Menghubungkan...</>
              ) : (
                  <><CreditCard size={18} /> Bayar Sekarang ({toRupiah(grandTotal)})</>
              )}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isCancelModalOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCancelModalOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="fixed z-[70] bg-white w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 p-6 text-center"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500">
                <LogOut size={28} className="ml-1" />
              </div>
              <h3 className="font-serif text-2xl font-bold text-dark-green mb-2">
                Yakin mau batal?
              </h3>
              <p className="text-gray-500 text-sm mb-8 leading-relaxed">
                Pesananmu belum tersimpan loh. Tenang aja, isi keranjangmu gak
                akan hilang kok!
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setIsCancelModalOpen(false)}
                  className="flex-1 py-3 rounded-full font-bold text-sm border border-gray-200 text-gray-600 hover:bg-gray-50 transition"
                >
                  Gak Jadi
                </button>
                <button
                  onClick={confirmCancelOrder}
                  className="flex-1 py-3 rounded-full font-bold text-sm bg-red-600 text-white hover:bg-red-700 shadow-lg hover:shadow-red-500/30 transition"
                >
                  Ya, Batalkan
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </main>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-cream-bg">
          Loading Payment...
        </div>
      }
    >
      <CheckoutContent />
    </Suspense>
  );
}