"use client";
import { useState, useEffect } from "react";
import {
  LayoutGrid,
  Store,
  Check,
  X,
  Trash2,
  Search,
  MapPin,
  TrendingUp,
  Users,
  AlertCircle,
  User,
  ArrowLeft,
  ExternalLink,
  Star,
  Clock,
  Navigation,
  Package, 
  MapIcon
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/app/context/ToastContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/app/context/AuthContext";
import { useInventory } from "@/app/context/InventoryContext";
import { Map, MapMarker, MarkerContent, MarkerPopup } from "@/components/ui/map";

export default function SuperAdminPage() {
  const [activeTab, setActiveTab] = useState("requests");
  const { showToast } = useToast();
  const router = useRouter();
  const { user } = useAuth();
  const { addItem } = useInventory();

  const [tenants, setTenants] = useState([]);
  const [pendingTenants, setPendingTenants] = useState([]);

  // --- LOGIC LOAD DATA (SAMA SEPERTI SEBELUMNYA) ---
  const loadData = () => {
    if (typeof window === "undefined") return;

    const rawUsers = localStorage.getItem("users");
    const rawInventory = localStorage.getItem("inventory");

    const allUsers = rawUsers ? JSON.parse(rawUsers) : [];
    const inventory = rawInventory ? JSON.parse(rawInventory) : [];

    const active = allUsers
      .filter((u) => u.role === "tenant" && u.status === "active")
      .map((u, i) => {
        const shopId = u.shop?.id;
        const tenantItems = inventory.filter((item) => item.shopId === shopId);

        const lat = u.shop?.coordinate?.lat || u.shop?.lat || -6.914744 + (Math.random() * 0.05 - 0.025);
        const lng = u.shop?.coordinate?.lng || u.shop?.lng || 107.609810 + (Math.random() * 0.05 - 0.025);

        return {
          ...u,
          coordinate: { lat, lng }, 
          inventorySummary: {
            total: tenantItems.length,
            flower: tenantItems.filter((i) => i.type === "flower").length,
            packaging: tenantItems.filter((i) => i.type === "packaging").length,
            catalog: tenantItems.filter((i) => i.type === "catalog").length,
          },
        };
      });

    const pending = allUsers.filter(
      (u) => u.role === "tenant" && u.status === "pending"
    );

    setTenants(active);
    setPendingTenants(pending);
  };

  useEffect(() => {
    if (user && user.role !== "superadmin") {
      router.push("/");
    }
    loadData();
  }, [user]);

  const handleApprove = (email) => {
    const rawUsers = JSON.parse(localStorage.getItem("users"));
    const updatedUsers = rawUsers.map((u) => {
      if (u.email === email) {
        return { ...u, status: "active" };
      }
      return u;
    });

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    loadData();
    showToast(
      "Tenant berhasil disetujui! Mereka sekarang bisa login.",
      "success"
    );
  };

  const handleReject = (email) => {
    if (!window.confirm("Yakin tolak dan hapus pendaftaran ini?")) return;

    const rawUsers = JSON.parse(localStorage.getItem("users"));
    const updatedUsers = rawUsers.filter((u) => u.email !== email);

    localStorage.setItem("users", JSON.stringify(updatedUsers));
    loadData();
    showToast("Pendaftaran tenant ditolak.", "error");
  };

  // --- VIEW COMPONENTS ---

  const RequestsView = () => (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif font-bold text-dark-green flex items-center gap-2">
        Incoming Tenant Requests
        {pendingTenants.length > 0 && (
          <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
            {pendingTenants.length}
          </span>
        )}
      </h2>

      {pendingTenants.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
          <p className="text-gray-400">Tidak ada pendaftaran baru saat ini.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4">
          {pendingTenants.map((t) => (
            <motion.div
              key={t.id || t.email}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white p-6 rounded-2xl shadow-sm border-l-4 border-yellow-400 flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-bold text-lg text-dark-green">
                    {t.shop?.name || "Nama Toko"}
                  </h3>
                  <span className="bg-yellow-100 text-yellow-700 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                    Pending
                  </span>
                </div>
                <p className="text-sm text-gray-600 flex items-center gap-1">
                  <Users size={14} /> Owner: {t.name}
                </p>
                <p className="text-sm text-gray-500 flex items-center gap-1">
                  <MapPin size={14} /> Lokasi: {t.shop?.location}
                </p>
                <p className="text-xs text-gray-400 mt-1">{t.email}</p>
              </div>

              <div className="flex gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleApprove(t.email)}
                  className="flex-1 md:flex-none px-6 py-2 bg-dark-green text-white rounded-lg font-bold text-sm hover:bg-sage-green transition flex items-center justify-center gap-2 shadow-lg"
                >
                  <Check size={16} /> Approve
                </button>
                <button
                  onClick={() => handleReject(t.email)}
                  className="flex-1 md:flex-none px-6 py-2 border border-red-200 text-red-500 rounded-lg font-bold text-sm hover:bg-red-50 transition flex items-center justify-center gap-2"
                >
                  <X size={16} /> Reject
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );

  const ActiveTenantsView = () => (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-serif font-bold text-dark-green">
          Active Florist Partners
        </h2>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-400">
            <tr>
              <th className="px-6 py-4">Nama Toko</th>
              <th className="px-6 py-4">Owner</th>
              <th className="px-6 py-4">Lokasi</th>
              <th className="px-6 py-4">Inventory</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4 text-center">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {tenants.length === 0 ? (
              <tr>
                <td colSpan="6" className="text-center py-8 text-gray-400">
                  Belum ada tenant aktif.
                </td>
              </tr>
            ) : (
              tenants.map((shop) => (
                <tr
                  key={shop.id || shop.email}
                  className="border-b border-gray-200 hover:bg-gray-50"
                >
                  <td className="px-6 py-4 font-bold text-dark-green flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-sage-green/20 flex items-center justify-center text-dark-green font-bold">
                      {shop.shop?.name?.charAt(0)}
                    </div>
                    {shop.shop?.name}
                  </td>
                  <td className="px-6 py-4">{shop.name}</td>
                  <td className="px-6 py-4">{shop.shop?.location}</td>
                  <td className="px-6 py-4 text-sm">
                    <div>Total: {shop.inventorySummary?.total || 0}</div>
                    <div className="text-xs text-gray-500">
                      🌸 {shop.inventorySummary?.flower || 0} | 📦{" "}
                      {shop.inventorySummary?.packaging || 0} | 📖{" "}
                      {shop.inventorySummary?.catalog || 0}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                     <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-bold uppercase">Active</span>
                  </td>

                  <td className="px-6 py-4 text-center">
                    <button
                      onClick={() => handleReject(shop.email)}
                      className="p-2 text-red-500 hover:bg-red-50 rounded-full"
                      title="Hapus Akses"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const MapView = () => {
    const defaultCenter = [107.60981, -6.914744];

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-serif font-bold text-dark-green">
          Live Map Visualization
        </h2>

        <div className="w-full h-[500px] rounded-3xl overflow-hidden border border-sage-green/20 shadow-inner relative z-0">
          <Map
            initialViewState={{
              longitude: defaultCenter[0],
              latitude: defaultCenter[1],
              zoom: 12,
            }}
            center={[ defaultCenter[0], defaultCenter[1] ]}
            zoom={14}
          >
            {tenants.map((t) => {
               const shopData = t.shop || {};
               const canCustomize = shopData.can_customize;
               const lat = t.coordinate?.lat || defaultCenter[1];
               const lng = t.coordinate?.lng || defaultCenter[0];
               
               const markerKey = t.id || t.email || `marker-${lat}-${lng}`;

               return (
                <MapMarker key={markerKey} longitude={lng} latitude={lat}>
                  <MarkerContent>
                    <div className="group relative cursor-pointer">
                      <MapPin
                        size={40}
                        className={`drop-shadow-lg transition-transform hover:scale-110 ${
                          canCustomize
                            ? "text-sage-green fill-sage-green stroke-white" 
                            : "text-gray-700 fill-gray-700 stroke-white"    
                        }`}
                      />
                      
                      <div className="absolute top-[10px] left-1/2 -translate-x-1/2 w-4 h-4 bg-white rounded-full flex items-center justify-center shadow-sm">
                        <Store
                          size={10}
                          className={
                            canCustomize ? "text-sage-green" : "text-gray-700"
                          }
                        />
                      </div>

                      {canCustomize && (
                        <span className="absolute -top-1 -right-1 flex h-3 w-3">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                        </span>
                      )}
                    </div>
                  </MarkerContent>

                  <MarkerPopup className="p-0 w-[280px] rounded-xl overflow-hidden shadow-xl border-none">
                    <div className="relative h-32 w-full bg-gray-100">
                      <img
                        src={shopData.image || "/assets/flowershop/placeholder_store.png"}
                        alt={shopData.name}
                        className="w-full h-full object-cover"
                      />
                      {canCustomize && (
                        <div className="absolute top-2 left-2 bg-sage-green/90 backdrop-blur px-2 py-0.5 rounded text-[10px] font-bold text-white shadow-sm flex items-center gap-1">
                           <Package size={10} /> Custom Available
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-white space-y-3">
                      <div>
                        <h3 className="font-serif font-bold text-lg text-dark-green leading-tight">
                          {shopData.name}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                          {shopData.fullAddress || shopData.location || "Bandung"}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 text-xs">
                        <div className="flex items-center gap-1 text-yellow-500 font-bold bg-yellow-50 px-1.5 py-0.5 rounded">
                          <Star size={12} fill="currentColor" />
                          {shopData.rating || "New"}
                        </div>
                        <div className="flex items-center gap-1 text-gray-500">
                          <Clock size={12} />
                          {shopData.openTime || "09:00 - 21:00"}
                        </div>
                      </div>

                      <div className="pt-1 flex gap-2">
                        <button
                          onClick={() =>
                            window.open(
                              `http://maps.google.com/maps?q=${lat},${lng}`,
                              "_blank"
                            )
                          }
                          className="flex-1 bg-dark-green text-white text-xs font-bold py-2 rounded-lg hover:bg-sage-green transition flex items-center justify-center gap-1.5 shadow-md"
                        >
                          <Navigation size={12} /> Rute
                        </button>
                        {/* Link ke Shop Detail (Opsional jika ada page detail) */}
                        {shopData.id && (
                             <Link href={`/shop/${shopData.id}`} className="flex-1">
                              <button className="w-full border border-gray-200 text-gray-600 text-xs font-bold py-2 rounded-lg hover:bg-gray-50 transition flex items-center justify-center gap-1.5">
                                 Kunjungi <ExternalLink size={12} />
                              </button>
                            </Link>
                        )}
                      </div>
                    </div>
                  </MarkerPopup>
                </MapMarker>
               );
            })}
          </Map>

          <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur p-3 rounded-xl shadow-lg border border-white/50 text-xs space-y-1 z-10">
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-sage-green border border-white shadow-sm"></span>
               <span className="font-bold text-gray-700">Bisa Custom</span>
            </div>
            <div className="flex items-center gap-2">
               <span className="w-3 h-3 rounded-full bg-gray-700 border border-white shadow-sm"></span>
               <span className="font-bold text-gray-700">Toko Biasa</span>
            </div>
             <div className="mt-2 pt-2 border-t border-gray-200 text-[10px] text-gray-500">
                Total: {tenants.length} Mitra Aktif
             </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-cream-bg min-h-screen font-sans flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:block">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-serif font-bold text-xl text-dark-green">
            Super Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">Platform Manager</p>
        </div>
        <nav className="p-4 space-y-2">
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "requests"
                ? "bg-dark-green text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
              <AlertCircle size={18} /> Requests
            </div>
            {pendingTenants.length > 0 && (
              <span className="bg-red-500 text-white text-[10px] px-2 py-0.5 rounded-full">
                {pendingTenants.length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab("active")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "active"
                ? "bg-dark-green text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <div className="flex items-center gap-3">
                <Store size={18} /> Active Tenants
            </div>
          </button>

          <button
            onClick={() => setActiveTab("map")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
              activeTab === "map"
                ? "bg-dark-green text-white shadow-md"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
             <div className="flex items-center gap-3">
                <MapIcon size={18} /> Live Map
            </div>
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100 absolute bottom-0 w-full bg-white">
          <Link href="/profile">
            <div className="flex items-center gap-3 mb-4 px-3 rounded-2xl border border-gray-200 p-2 cursor-pointer hover:bg-gray-50 transition">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-dark-green border border-green-100">
                <User size={20} />
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-bold text-dark-green leading-none mb-1 truncate">
                  {user ? user.name : "Super Admin"}
                </p>
                <p className="text-xs text-gray-400">super@admin.com</p>
              </div>
            </div>
          </Link>

          <Link
            href="/"
            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-gray-200 text-gray-500 hover:bg-white hover:text-dark-green hover:shadow-md transition-all text-sm font-bold group bg-gray-50"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-1 transition-transform"
            />
            Back to Site
          </Link>
        </div>
      </aside>

      <main className="flex-1 md:ml-64 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold text-gray-800 capitalize">
              {activeTab === "requests"
                ? "Registration Requests"
                : activeTab === "active"
                ? "Active Tenants"
                : "Coverage Map"}
            </h1>
            <p className="text-sm text-gray-500">Superadmin Control Panel</p>
          </div>
        </div>

        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          {activeTab === "requests" && <RequestsView />}
          {activeTab === "active" && <ActiveTenantsView />}
          {activeTab === "map" && <MapView />}
        </motion.div>
      </main>
    </div>
  );
}