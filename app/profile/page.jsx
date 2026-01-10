"use client";
import { useState, useEffect, useRef } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useAuth } from "@/app/context/AuthContext";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useOrder } from "@/app/context/OrderContext";
import Link from "next/link";
import {
  User,
  MapPin,
  Lock,
  LogOut,
  Camera,
  ChevronRight,
  Store,
  LayoutDashboard,
  Box,
  Package,
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  AlertCircle,
  Trash2,
  Check,
  LocateFixed,
  AlertTriangle,
} from "lucide-react";
import {
  Map,
  MapMarker,
  MarkerContent,
  MarkerPopup,
} from "@/components/ui/map";

export default function ProfilePage() {
  const { user, logout, updateUser } = useAuth();
  const { showToast } = useToast();
  const router = useRouter();
  const { orders } = useOrder();
  const isAdmin = user?.role === "admin" || user?.role === "superadmin";

  const mapRef = useRef(null);

  const [activeTab, setActiveTab] = useState("personal");
  const [orderFilter, setOrderFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(false);
  const [savedAddresses, setSavedAddresses] = useState([]);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    shopName: "",
    shopAddress: "",
    shopOpenTime: "09:00",
    shopCloseTime: "21:00",
    shopCoordinate: { lat: -6.914744, lng: 107.60981 },
    adminCode: "",
    department: "",
  });

  useEffect(() => {
    if (!user) {
      router.push("/");
    }
  }, [user, router]);

  useEffect(() => {
    if (user) {
      let openT = "09:00";
      let closeT = "21:00";

      if (user.shop?.openTime && user.shop.openTime.includes("-")) {
        const times = user.shop.openTime.split("-");
        openT = times[0].trim();
        closeT = times[1].trim();
      }

      setFormData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",

        shopName: user.shop?.name || "",
        shopAddress: user.shop?.location || "",
        shopCoordinate: user.shop?.coordinate || {
          lat: -6.914744,
          lng: 107.60981,
        },
        shopOpenTime: openT,
        shopCloseTime: closeT,

        adminCode: user.adminCode || "SA-001",
        department: user.department || "Head Office",
      });

      if (typeof window !== "undefined") {
        const stored = localStorage.getItem("saved_addresses");
        if (stored) {
          setSavedAddresses(JSON.parse(stored));
        }
      }
    }
  }, [user]);

  if (!user) {
    return null;
  }

  const handleGetLocation = (e) => {
    e.preventDefault();
    if (navigator.geolocation) {
      showToast("Mencari lokasi...", "info");

      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLat = position.coords.latitude;
          const newLng = position.coords.longitude;

          setFormData((prev) => ({
            ...prev,
            shopCoordinate: {
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

  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise((r) => setTimeout(r, 800));

    const updates = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
    };

    if (user?.role === "tenant") {
      updates.shop = {
        ...user.shop,
        name: formData.shopName,
        location: formData.shopAddress,
        coordinate: formData.shopCoordinate,
        openTime: `${formData.shopOpenTime} - ${formData.shopCloseTime}`,
      };
    }

    if (user.role === "superadmin") {
      updates.adminCode = formData.adminCode;
      updates.department = formData.department;
    }

    updateUser(updates);
    setIsLoading(false);
    showToast("Profil berhasil diperbarui! ✨", "success");
  };

  const handleDeleteAddress = (id) => {
    if (window.confirm("Hapus alamat ini?")) {
      const newList = savedAddresses.filter((a) => a.id !== id);
      setSavedAddresses(newList);
      localStorage.setItem("saved_addresses", JSON.stringify(newList));
      showToast("Alamat dihapus.");
    }
  };

  const handleLogout = () => {
    if (window.confirm("Yakin mau keluar?")) {
      logout();
      router.push("/");
    }
  };

  const getRoleBadge = () => {
    if (user.role === "superadmin")
      return { label: "Super Admin", color: "bg-red-100 text-red-600" };
    if (user.role === "tenant")
      return {
        label: "Florist Partner",
        color: "bg-sage-green/20 text-dark-green",
      };
    return { label: "Member", color: "bg-gray-100 text-gray-500" };
  };
  const badge = getRoleBadge();

  const allTabs = [
    { id: "personal", label: "Personal Info", icon: User },
    {
      id: "address",
      label: "Alamat Penerima",
      icon: MapPin,
      hidden: user.role !== "user",
    },
    {
      id: "order",
      label: "Pesanan Saya",
      icon: Package,
      hidden: user.role !== "user",
    },
    { id: "security", label: "Keamanan", icon: Lock },
  ];

  const sidebarTabs = allTabs.filter((tab) => {
    if (tab.id === "order" || tab.id === "address") {
      return user.role !== "tenant" && user.role !== "superadmin";
    }
    return !tab.hidden;
  });

  const getStatusStyle = (status) => {
    switch (status) {
      case "waiting_approval":
        return {
          color: "text-yellow-700 bg-yellow-50 border-yellow-200",
          icon: AlertCircle,
        };
      case "processing":
        return { color: "text-blue-600 bg-blue-50 border-blue-200", icon: Box };
      case "on_delivery":
        return {
          color: "text-indigo-600 bg-indigo-50 border-indigo-200",
          icon: Truck,
        };
      case "completed":
        return {
          color: "text-emerald-700 bg-emerald-50 border-emerald-200",
          icon: CheckCircle2,
        };
      default:
        return { color: "text-gray-600 bg-gray-50 border-gray-200", icon: Box };
    }
  };

  const getStatusLabel = (s) => {
    const map = {
      waiting_approval: "Menunggu Konfirmasi",
      processing: "Diproses",
      on_delivery: "Dikirim",
      completed: "Selesai",
    };
    return map[s] || s;
  };

  const getFilteredOrders = () => {
    if (orderFilter === "all") return orders;

    return orders.filter((o) => {
      if (orderFilter === "packed") {
        return [
          "payment_pending",
          "waiting_approval",
          "processing",
          "revision",
        ].includes(o.status);
      }
      if (orderFilter === "shipped") {
        return ["on_delivery"].includes(o.status);
      }
      if (orderFilter === "completed") {
        return ["completed"].includes(o.status);
      }
      return true;
    });
  };

  const filteredOrders = getFilteredOrders();

  const handleDeleteAccount = async () => {
    const confirmDelete = window.confirm(
      "PERINGATAN: Apakah Anda yakin ingin menghapus akun ini secara permanen? Data pesanan dan profil tidak dapat dipulihkan."
    );

    if (confirmDelete) {
      const doubleConfirm = window.confirm(
        "Yakin 100%? Tindakan ini tidak dapat dibatalkan."
      );

      if (doubleConfirm) {
        setIsLoading(true);

        await new Promise((r) => setTimeout(r, 1500));

        if (typeof deleteAccount === "function") {
          deleteAccount();
        } else {
          logout();
          localStorage.clear(); 
        }

        showToast("Akun berhasil dihapus. Sampai jumpa! 👋", "success");
        router.push("/");
      }
    }
  };

  return (
    <main
      className={`bg-[#FDFBF7] min-h-screen ${
      isAdmin ? "pt-0 " : "pt-10"
      }`}
    >
      {user?.role === "user" && <Navbar />}

      <div className="pt-32 pb-24 px-4 md:px-6 max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row items-center gap-6 mb-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
          <div className="relative group">
            <div className="w-28 h-28 rounded-full bg-dark-green text-white flex items-center justify-center text-4xl font-serif font-bold shadow-xl border-4 border-white">
              {user.name.charAt(0)}
            </div>
            <button className="absolute bottom-0 right-0 bg-sage-green text-white p-2 rounded-full shadow-md hover:bg-dark-green transition-colors">
              <Camera size={16} />
            </button>
          </div>
          <div className="text-center md:text-left">
            <h1 className="text-3xl font-serif font-bold text-dark-green">
              {user.name}
            </h1>
            <p className="text-gray-500">{user.email}</p>
            <div className="flex flex-col md:flex-row items-center gap-2 mt-3">
              <span
                className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${badge.color}`}
              >
                {badge.label}
              </span>
              {user.role === "tenant" && user.shop && (
                <span className="flex items-center gap-1 text-xs font-bold text-sage-green">
                  <Store size={14} /> {user.shop.name}
                </span>
              )}
            </div>
          </div>

          {(user.role === "tenant" || user.role === "superadmin") && (
            <button
              onClick={() =>
                router.push(
                  user.role === "tenant" ? "/admin/florist" : "/admin/super"
                )
              }
              className="md:ml-auto flex items-center gap-2 bg-dark-green text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-sage-green transition shadow-lg"
            >
              <LayoutDashboard size={18} />
              Buka Dashboard {user.role === "tenant" ? "Toko" : "Admin"}
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1 space-y-2">
            {sidebarTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center justify-between p-4 rounded-2xl transition-all duration-300 font-bold text-sm ${
                  activeTab === tab.id
                    ? "bg-dark-green text-white shadow-lg shadow-green-900/10"
                    : "bg-white text-gray-500 hover:bg-white/60 hover:pl-5"
                }`}
              >
                <div className="flex items-center gap-3">
                  <tab.icon size={18} /> {tab.label}
                </div>
                {activeTab === tab.id && <ChevronRight size={16} />}
              </button>
            ))}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 p-4 rounded-2xl text-red-500 hover:bg-red-50 transition-all font-bold text-sm mt-8 border border-transparent hover:border-red-100"
            >
              <LogOut size={18} /> Log Out
            </button>
          </div>

          <div className="md:col-span-3">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 relative overflow-hidden min-h-[500px]"
            >
              {activeTab === "personal" && (
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  <h2 className="text-xl font-bold text-dark-green mb-6 border-b border-gray-100 pb-4">
                    Edit Profil{" "}
                    {user.role === "tenant"
                      ? "Florist"
                      : user.role === "superadmin"
                      ? "Admin"
                      : "Member"}
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Nama Lengkap
                      </label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) =>
                          setFormData({ ...formData, name: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Nomor HP
                      </label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) =>
                          setFormData({ ...formData, phone: e.target.value })
                        }
                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                      />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                      <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={formData.email}
                        disabled
                        className="w-full bg-gray-100 border border-gray-200 rounded-xl px-4 py-3 text-gray-400 cursor-not-allowed"
                      />
                    </div>

                    {user.role === "tenant" && (
                      <>
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                          <h3 className="font-bold text-dark-green mb-4 flex items-center gap-2">
                            <Store size={18} /> Informasi Toko
                          </h3>
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Nama Toko
                          </label>
                          <input
                            type="text"
                            value={formData.shopName}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                shopName: e.target.value,
                              })
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                          />
                        </div>
                        <div className="md:col-span-2 space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Alamat Lengkap
                          </label>
                          <input
                            type="text"
                            value={formData.shopAddress}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                shopAddress: e.target.value,
                              })
                            }
                            placeholder="Jl. Mawar No. 123, Bandung"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                          />
                        </div>

                        <div className="md:col-span-2 space-y-2">
                          <div className="flex justify-between items-center">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                              Titik Lokasi (Geser Pin untuk menyesuaikan)
                            </label>
                            <button
                              type="button"
                              onClick={handleGetLocation}
                              className="text-[10px] font-bold text-sage-green flex items-center gap-1 hover:text-dark-green transition bg-white border border-sage-green/30 px-2 py-1 rounded-full shadow-sm"
                            >
                              <LocateFixed size={12} /> Ambil Lokasi Saya
                            </button>
                          </div>

                          <div className="h-[200px] w-full rounded-2xl overflow-hidden border border-gray-200 relative z-0">
                            {formData.shopCoordinate && (
                              <Map
                                ref={mapRef}
                                initialViewState={{
                                  longitude: formData.shopCoordinate.lng,
                                  latitude: formData.shopCoordinate.lat,
                                  zoom: 14,
                                }}
                                center={[
                                  formData.shopCoordinate.lng,
                                  formData.shopCoordinate.lat,
                                ]}
                                zoom={14}
                              >
                                <MapMarker
                                  draggable
                                  longitude={formData.shopCoordinate.lng}
                                  latitude={formData.shopCoordinate.lat}
                                  onDragEnd={(lngLat) => {
                                    setFormData((prev) => ({
                                      ...prev,
                                      shopCoordinate: {
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
                                      {formData.shopName || "Toko Saya"}
                                    </div>
                                  </MarkerPopup>
                                </MapMarker>
                              </Map>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 font-mono text-right">
                            Lat: {formData.shopCoordinate?.lat.toFixed(6)}, Lng:{" "}
                            {formData.shopCoordinate?.lng.toFixed(6)}
                          </p>
                        </div>

                        <div className="md:col-span-2 grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <Clock size={12} /> Jam Buka
                            </label>
                            <input
                              type="time"
                              value={formData.shopOpenTime}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shopOpenTime: e.target.value,
                                })
                              }
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1">
                              <Clock size={12} /> Jam Tutup
                            </label>
                            <input
                              type="time"
                              value={formData.shopCloseTime}
                              onChange={(e) =>
                                setFormData({
                                  ...formData,
                                  shopCloseTime: e.target.value,
                                })
                              }
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                            />
                          </div>
                        </div>
                      </>
                    )}

                    {user.role === "superadmin" && (
                      <>
                        <div className="md:col-span-2 mt-4 pt-4 border-t border-gray-100">
                          <h3 className="font-bold text-red-600 mb-4 flex items-center gap-2">
                            <Lock size={18} /> Internal Data
                          </h3>
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Kode Admin
                          </label>
                          <input
                            type="text"
                            value={formData.adminCode}
                            disabled
                            className="w-full bg-red-50 border border-red-100 rounded-xl px-4 py-3 text-red-800 font-mono cursor-not-allowed"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Departemen
                          </label>
                          <input
                            type="text"
                            value={formData.department}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                department: e.target.value,
                              })
                            }
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-sage-green"
                          />
                        </div>
                      </>
                    )}
                  </div>

                  <div className="pt-6 flex justify-end">
                    <button
                      type="submit"
                      disabled={isLoading}
                      className="bg-dark-green text-white px-8 py-3 rounded-full font-bold hover:bg-sage-green transition shadow-lg disabled:opacity-50"
                    >
                      {isLoading ? "Menyimpan..." : "Simpan Perubahan"}
                    </button>
                  </div>
                </form>
              )}

              {activeTab === "address" && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-bold text-dark-green">
                      Daftar Alamat
                    </h2>
                    <Link
                      href="/checkout"
                      className="text-xs font-bold text-sage-green hover:underline"
                    >
                      + Tambah via Checkout
                    </Link>
                  </div>

                  {savedAddresses.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-200">
                      <MapPin
                        size={40}
                        className="mx-auto text-gray-300 mb-2"
                      />
                      <p className="text-gray-400 text-sm">
                        Belum ada alamat tersimpan.
                      </p>
                      <Link
                        href="/checkout"
                        className="text-dark-green text-xs font-bold underline mt-2 inline-block"
                      >
                        Tambah saat checkout
                      </Link>
                    </div>
                  ) : (
                    <div className="grid gap-4">
                      {savedAddresses.map((addr) => (
                        <div
                          key={addr.id}
                          className="bg-white border border-gray-200 p-5 rounded-2xl flex justify-between items-start group hover:border-sage-green transition-colors"
                        >
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-dark-green">
                                {addr.name}
                              </span>
                              <span className="text-gray-400 text-xs">|</span>
                              <span className="text-gray-500 text-xs">
                                {addr.phone}
                              </span>
                              
                            </div>
                            <p className="text-sm text-gray-600 max-w-lg">
                              {addr.street}
                            </p>
                            <span className="inline-block mt-2 text-[10px] font-bold text-gray-500 bg-gray-100 px-2 py-1 rounded uppercase tracking-wider">
                              {addr.label}
                            </span>
                          </div>
                          <button
                            onClick={() => handleDeleteAddress(addr.id)}
                            className="text-gray-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {activeTab === "security" && (
                <div className="space-y-6">
                  <h2 className="text-xl font-bold text-dark-green mb-6 border-b border-gray-100 pb-4">
                    Keamanan Akun
                  </h2>

                  {user.role === "superadmin" ? (
                    <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 flex items-start gap-4">
                      <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shrink-0">
                        <Lock size={20} />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-blue-800 mb-1">
                          Akses Terproteksi
                        </h3>
                        <p className="text-sm text-blue-600/80 leading-relaxed">
                          Akun Super Admin dikelola langsung oleh sistem pusat.
                          Anda tidak diizinkan mengubah kredensial (password)
                          atau menghapus akun ini secara manual demi keamanan
                          data.
                        </p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-4">
                        <h3 className="font-bold text-gray-700 text-sm uppercase tracking-wider">
                          Update Password
                        </h3>
                        <div className="grid grid-cols-1 gap-4 max-w-md">
                          <input
                            type="password"
                            placeholder="Password Lama"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
                          />
                          <input
                            type="password"
                            placeholder="Password Baru"
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green"
                          />
                          <button className="bg-dark-green text-white px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-sage-green transition shadow-sm w-fit">
                            Simpan Password Baru
                          </button>
                        </div>
                      </div>

                      <div className="bg-red-50 border border-red-100 rounded-2xl p-6 mt-10">
                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 bg-red-100 text-red-600 rounded-full flex items-center justify-center shrink-0">
                            <AlertTriangle size={20} />
                          </div>
                          <div className="flex-1">
                            <h3 className="text-lg font-bold text-red-700 mb-1">
                              Zona Berbahaya
                            </h3>
                            <p className="text-sm text-red-600/80 mb-4 leading-relaxed">
                              Menghapus akun akan menghilangkan semua data
                              riwayat pesanan, alamat tersimpan, dan poin
                              loyalitas secara permanen. Tindakan ini tidak
                              dapat dibatalkan.
                            </p>
                            <button
                              onClick={handleDeleteAccount}
                              disabled={isLoading}
                              className="bg-white border border-red-200 text-red-600 px-6 py-2.5 rounded-xl font-bold text-sm hover:bg-red-600 hover:text-white transition shadow-sm"
                            >
                              {isLoading ? "Memproses..." : "Hapus Akun Saya"}
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeTab === "order" && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 border-b border-gray-100 pb-4">
                    <h2 className="text-xl font-serif font-bold text-dark-green flex items-center gap-2">
                      <Package size={22} className="text-sage-green" /> Riwayat
                      Pesanan
                    </h2>
                    <div className="flex bg-gray-50 p-1 rounded-full border border-gray-200">
                      {["all", "packed", "shipped", "completed"].map(
                        (filter) => (
                          <button
                            key={filter}
                            onClick={() => setOrderFilter(filter)}
                            className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all ${
                              orderFilter === filter
                                ? "bg-dark-green text-white shadow-md"
                                : "text-gray-500 hover:text-dark-green"
                            }`}
                          >
                            {filter === "all"
                              ? "Semua"
                              : filter === "packed"
                              ? "Dikemas"
                              : filter === "shipped"
                              ? "Dikirim"
                              : "Selesai"}
                          </button>
                        )
                      )}
                    </div>
                  </div>

                  {filteredOrders.length === 0 ? (
                    <div className="text-center py-20 bg-gray-50/50 rounded-3xl border-2 border-dashed border-gray-200">
                      <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center mx-auto mb-3 text-3xl shadow-sm">
                        🥀
                      </div>
                      <h3 className="font-bold text-gray-700">
                        Belum ada pesanan
                      </h3>
                      <Link
                        href="/toko"
                        className="px-6 py-2 bg-dark-green text-white rounded-full text-sm font-bold hover:bg-sage-green transition shadow-md mt-4 inline-block"
                      >
                        Mulai Belanja
                      </Link>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 gap-4 max-h-[600px] overflow-y-auto custom-scrollbar pr-2">
                      <AnimatePresence>
                        {filteredOrders.map((order) => {
                          const statusStyle = getStatusStyle(order.status);
                          const StatusIcon = statusStyle.icon;
                          return (
                            <motion.div
                              key={order.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              <Link
                                href={`/orders/${order.id}`}
                                className="block group"
                              >
                                <div className="bg-white border border-gray-100 rounded-3xl p-5 hover:border-sage-green hover:shadow-lg transition-all relative overflow-hidden">
                                  <div className="flex justify-between items-start mb-4 relative z-10">
                                    <div className="flex flex-col">
                                      <span className="font-mono text-[10px] text-gray-400 uppercase tracking-widest mb-1">
                                        ID: {order.id}
                                      </span>
                                      <span
                                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold border w-fit ${statusStyle.color}`}
                                      >
                                        <StatusIcon size={12} />{" "}
                                        {getStatusLabel(order.status)}
                                      </span>
                                    </div>
                                    <span className="text-[10px] text-gray-400 font-medium bg-white/80 px-2 py-1 rounded-lg backdrop-blur-sm">
                                      {order.date}
                                    </span>
                                  </div>
                                  <div className="h-px w-full bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-4"></div>
                                  <div className="flex justify-between items-center relative z-10">
                                    <div className="flex items-center gap-4">
                                      <div className="w-12 h-12 rounded-2xl bg-cream-bg flex items-center justify-center text-dark-green border border-gray-100 shadow-sm">
                                        <ShoppingBag size={20} />
                                      </div>
                                      <div>
                                        <h4 className="font-serif font-bold text-gray-800 text-base group-hover:text-dark-green transition-colors line-clamp-1">
                                          {order.items && order.items[0]
                                            ? order.items[0].title ||
                                              order.items[0].name
                                            : "Custom Bouquet"}
                                        </h4>
                                        <p className="text-xs text-gray-400 mt-0.5">
                                          {order.items && order.items.length > 1
                                            ? `+${
                                                order.items.length - 1
                                              } item lainnya`
                                            : "Single Item"}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-[10px] text-gray-400 uppercase tracking-wider mb-0.5">
                                        Total
                                      </p>
                                      <p className="font-bold text-dark-green text-sm font-sans">
                                        {(
                                          order.financials?.grandTotal ||
                                          order.financials?.payNowTotal ||
                                          order.totalPrice ||
                                          0
                                        ).toLocaleString("id-ID", {
                                          style: "currency",
                                          currency: "IDR",
                                          maximumSignificantDigits: 3,
                                        })}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              </Link>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                    </div>
                  )}
                </div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
