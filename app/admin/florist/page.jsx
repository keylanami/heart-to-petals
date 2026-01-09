"use client";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Package,
  Palette,
  ShoppingBag,
  Plus,
  Check,
  X,
  DollarSign,
  User,
  ArrowLeft,
  Truck,
  Trash2,
  Edit,
  Flower2,
  Eye,
  Download,
  Upload,
  Image as ImageIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useToast } from "@/app/context/ToastContext";
import { useOrder } from "@/app/context/OrderContext";
import { useInventory } from "@/app/context/InventoryContext";
import { useAuth } from "@/app/context/AuthContext";
import { HexColorPicker } from "react-colorful";

const INPUT_STYLE =
  "w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-sage-green focus:border-transparent transition-all placeholder:text-gray-400";
const LABEL_STYLE =
  "text-[10px] font-bold text-gray-500 ml-1 mb-1 block uppercase tracking-wider";
const BTN_PRIMARY =
  "bg-dark-green text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-sage-green transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed";
const BTN_SECONDARY =
  "text-gray-400 font-bold text-sm hover:text-dark-green transition";

export default function FloristAdminPage() {
  const [activeTab, setActiveTab] = useState("overview");
  const { showToast } = useToast();
  const router = useRouter();

  const { user } = useAuth();
  const { orders, updateOrderStatus } = useOrder();
  const { inventory, addItem, updateItem, deleteItem, updateStock } = useInventory();
  const [selectedItem, setSelectedItem] = useState(null);
  const [modalType, setModalType] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const fileInputRef = useRef(null);

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

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role !== "tenant") {
      router.push("/");
    }
  }, [user, router, mounted]);

  const SHOP_ID = user?.shop?.id;
  const CAN_CUSTOMIZE = user?.shop?.can_customize;

  const getItemShopId = (item) => {
    if (!item) return null;
    return item.shopId || item.shop_id || item.shop?.id;
  };

  const myOrders = SHOP_ID
    ? orders.filter(
        (order) =>
          order.items &&
          order.items.some(
            (item) => String(getItemShopId(item)) === String(SHOP_ID)
          )
      )
    : [];

  const getMyInventory = () => {
    if (!SHOP_ID) return [];
    
    return inventory.filter((item) => {
      const id = getItemShopId(item);
      return String(id) === String(SHOP_ID);
    });
  };

  const myInventory = getMyInventory();

  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!SHOP_ID || !user?.shop) return;

    addItem({
      ...newProduct,
      id: `manual-${Date.now()}`,
      shopId: SHOP_ID,
      shop_id: SHOP_ID,
      shop: {
        id: SHOP_ID,
        name: user.shop.name,
        location: user.shop.location,
      },
      price: parseInt(newProduct.price),
      stock: parseInt(newProduct.stock),
      category: "Manual Input",
      image:
        "https://images.unsplash.com/photo-1596073419667-9d77d59f033f?auto=format&fit=crop&q=80&w=300",
    });

    setModalType(null);
    setNewProduct({ title: "", type: "flower", price: "", stock: "" });
    showToast("Item berhasil ditambahkan!", "success");
  };

  const handleApproveOrder = (orderId) => {
    updateOrderStatus(orderId, "processing");
    showToast("Pesanan diterima & mulai diproses.", "success");
  };

  const handleSendOrder = (orderId) => {
    updateOrderStatus(orderId, "on_delivery");
    showToast("Status diupdate: Sedang Dikirim ke kurir.", "success");
  };

  const handleRejectOrder = (orderId) => {
    updateOrderStatus(orderId, "cancelled");
    showToast("Pesanan ditolak.", "error");
  };

  const resetForms = () => {
    setTempFlower({
      name: "",
      price: "",
      stock: "",
      category: "romance",
      image: null,
      preview: "",
    });
    setTempPack({ type: "wrapping", price: "", variants: [] });
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
    setVariantInput({ name: "", hex: "#A3B18A", stock: "" });
    setIsEditing(false);
    setEditingId(null);
  };

  const openAddModal = (type) => {
    resetForms();
    setModalType(type);
  };

  const openEditModal = (item) => {
    resetForms();
    setIsEditing(true);
    setEditingId(item.id);

    if (item.type === "flower") {
      setModalType("flower");
      setTempFlower({
        name: item.title || item.name,
        price: item.price,
        stock: item.stock,
        category: item.category || "romance",
        preview: item.image,
        image: null,
      });
    } else if (item.type === "packaging") {
      setModalType("packaging");
      setTempPack({
        type: item.packagingType || item.name || "wrapping",
        price: item.price,
        variants: item.variants || [],
      });
    } else {
      setModalType("catalog");
      setTempCatalog({
        title: item.title,
        price: item.price,
        category: item.category || "Warm",
        tag: item.tag || "Romance",
        desc: item.desc || "",
        story: item.story || "",
        care: item.care || "",
        flowers: Array.isArray(item.flowers)
          ? item.flowers.join(", ")
          : item.flowers || "",
        preview: item.image,
        image: null,
      });
    }
  };

  const handleFlowerImage = (e) => {
    const file = e.target.files[0];
    if (file)
      setTempFlower({
        ...tempFlower,
        image: file,
        preview: URL.createObjectURL(file),
      });
  };

  const saveFlower = (e) => {
    e.preventDefault();
    if (!user?.shop) return;

    const payload = {
      ...tempFlower,
      type: "flower",
      stock: parseInt(tempFlower.stock) || 0,
      price: parseInt(tempFlower.price) || 0,
      image: tempFlower.preview || "/assets/flowers/placeholder.png",
      shopId: SHOP_ID,
      shop: user.shop,
      title: tempFlower.name,
      name: tempFlower.name,
      id: isEditing ? editingId : `flower-${Date.now()}`,
    };

    if (isEditing) {
      updateItem(editingId, payload);
      showToast("Bunga berhasil diupdate!", "success");
    } else {
      addItem(payload);
      showToast("Bunga berhasil ditambahkan!", "success");
    }
    setModalType(null);
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
          stock: parseInt(variantInput.stock) || 0,
        },
      ],
    });
    setVariantInput({ name: "", hex: variantInput.hex, stock: "" });
    setShowColorPicker(false);
  };

  const savePackaging = (e) => {
    e.preventDefault();
    if (!user?.shop) return;

    const totalStock = tempPack.variants.reduce(
      (acc, v) => acc + parseInt(v.stock || 0),
      0
    );
    const payload = {
      ...tempPack,
      name: tempPack.type,
      type: "packaging",
      price: parseInt(tempPack.price) || 0,
      stock: totalStock,
      shopId: SHOP_ID,
      shop: user.shop,
      title: tempPack.type,
      id: isEditing ? editingId : `pack-${Date.now()}`,
    };

    if (isEditing) {
      updateItem(editingId, payload);
      showToast("Packaging berhasil diupdate!", "success");
    } else {
      addItem(payload);
      showToast("Packaging berhasil ditambahkan!", "success");
    }
    setModalType(null);
  };

  const handleCatalogImage = (e) => {
    const file = e.target.files[0];
    if (file)
      setTempCatalog({
        ...tempCatalog,
        image: file,
        preview: URL.createObjectURL(file),
      });
  };

  const saveCatalog = (e) => {
    e.preventDefault();
    if (!user?.shop) return;

    const payload = {
      ...tempCatalog,
      type: "product",
      flowers: tempCatalog.flowers.split(",").map(f => f.trim()),
      stock: 5,
      price: parseInt(tempCatalog.price) || 0,
      image: tempCatalog.preview || "/assets/placeholder.jpg",
      shopId: SHOP_ID,
      shop: user.shop,
      name: tempCatalog.title,
      id: isEditing ? editingId : `cat-${Date.now()}`,
    };

    if (isEditing) {
      updateItem(editingId, payload);
      showToast("Katalog berhasil diupdate!", "success");
    } else {
      addItem(payload);
      showToast("Katalog berhasil ditambahkan!", "success");
    }
    setModalType(null);
  };

  const handleDeleteItem = (itemId) => {
    if (window.confirm("Apakah Anda yakin ingin menghapus item ini?")) {
      deleteItem(itemId);
      showToast("Item berhasil dihapus!", "success");
    }
  };

  const handleExportOrders = async () => {
    try {
      setIsExporting(true);
      showToast("Sedang menyiapkan file export...", "info");

      // Ganti URL ini sesuai route Laravel kamu (misal: /api/florist/export-orders)
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/florist/orders/export`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`, // Sesuaikan auth token
        },
      });

      if (!response.ok) throw new Error("Gagal export");

      // Logic download file dari Blob response
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Orders-${user.shop.name}-${new Date().toISOString().split('T')[0]}.xlsx`; // Atau .csv
      document.body.appendChild(a);
      a.click();
      a.remove();
      
      showToast("Berhasil export data!", "success");
    } catch (error) {
      console.error(error);
      showToast("Gagal melakukan export.", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // 2. Logic Import Inventory (Upload CSV)
  const handleImportInventory = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setIsImporting(true);
      showToast("Mengupload data...", "info");

      const formData = new FormData();
      formData.append('file', file);
      formData.append('shop_id', SHOP_ID);

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/florist/inventory/import`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
        },
        body: formData,
      });

      if (!response.ok) throw new Error("Gagal import");

      showToast("Import berhasil! Refresh halaman.", "success");
      window.location.reload(); // Refresh biar data baru muncul
    } catch (error) {
      console.error(error);
      showToast("Gagal import file. Cek format CSV.", "error");
    } finally {
      setIsImporting(false);
      if (fileInputRef.current) fileInputRef.current.value = ""; // Reset input
    }
  };

  if (!mounted) return null;

  if (!user || !user.shop) {
    return (
      <div className="min-h-screen bg-cream-bg flex items-center justify-center text-gray-400">
        Memuat Data Toko...
      </div>
    );
  }

  const OverviewView = () => {
    const totalRevenue = myOrders
      .filter((o) => o.status === "completed" || o.status === "on_delivery")
      .reduce((acc, order) => {
        const shopSubtotal = order.items
          .filter((i) => String(getItemShopId(i)) === String(SHOP_ID))
          .reduce((sum, i) => sum + i.price * (i.qty || 1), 0);
        return acc + shopSubtotal;
      }, 0);

    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 text-green-600 rounded-full">
                <DollarSign />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase">
                  Pendapatan Toko
                </p>
                <h3 className="text-2xl font-bold text-dark-green">
                  {new Intl.NumberFormat("id-ID", {
                    style: "currency",
                    currency: "IDR",
                    maximumSignificantDigits: 3,
                  }).format(totalRevenue)}
                </h3>
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 text-blue-600 rounded-full">
                <ShoppingBag />
              </div>
              <div>
                <p className="text-gray-500 text-xs font-bold uppercase">
                  Total Transaksi
                </p>
                <h3 className="text-2xl font-bold text-dark-green">
                  {myOrders.length}
                </h3>
              </div>
            </div>
          </div>
        </div>

       <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-dark-green">
              Log Penjualan ({user.shop.name})
            </h3>
            
            <button 
              onClick={handleExportOrders}
              disabled={isExporting || myOrders.length === 0}
              className="flex items-center gap-2 px-4 py-2 text-xs font-bold text-dark-green bg-green-50 rounded-lg hover:bg-green-100 transition disabled:opacity-50"
            >
              {isExporting ? (
                <span>Loading...</span>
              ) : (
                <>
                  <Download size={16} /> Export Excel
                </>
              )}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b">
                <tr>
                  <th className="px-4 py-3">ID Order</th>
                  <th className="px-4 py-3">Customer</th>
                  <th className="px-4 py-3">Item (Toko Ini)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Date</th>
                </tr>
              </thead>
              <tbody>
                {myOrders.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="text-center py-4 text-gray-400">
                      Belum ada penjualan.
                    </td>
                  </tr>
                ) : (
                  myOrders.map((order) => {
                    const myItems = order.items.filter(
                      (i) => String(getItemShopId(i)) === String(SHOP_ID)
                    );
                    return (
                      <tr
                        key={order.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-bold font-mono">
                          #{order.id}
                        </td>
                        <td className="px-4 py-3">{order.customer}</td>
                        <td className="px-4 py-3 text-xs text-gray-500">
                          {myItems
                            .map((i) => `${i.title || i.name} (x${i.qty || 1})`)
                            .join(", ")}
                        </td>
                        <td className="px-4 py-3">
                          <span
                            className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase 
                                ${
                                  order.status === "completed"
                                    ? "bg-green-100 text-green-600"
                                    : order.status === "on_delivery"
                                    ? "bg-purple-100 text-purple-600"
                                    : order.status === "processing"
                                    ? "bg-blue-100 text-blue-600"
                                    : "bg-gray-100 text-gray-600"
                                }`}
                          >
                            {order.status.replace("_", " ")}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-500">
                          {order.date}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  };

  const RequestsView = () => {
    const pendingOrders = myOrders.filter(
      (o) => o.status === "waiting_approval" || o.status === "processing"
    );

    return (
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-dark-green">Pesanan Masuk</h2>
        {pendingOrders.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400">
              Kerjaan beres! Tidak ada pesanan aktif.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {pendingOrders.map((order) => (
              <motion.div
                key={order.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between gap-6"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="bg-purple-100 text-purple-600 text-[10px] font-bold px-2 py-1 rounded">
                      ORD #{order.id}
                    </span>
                    <span className="text-xs text-gray-400">{order.date}</span>

                    <span
                      className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded ${
                        order.status === "processing"
                          ? "bg-blue-100 text-blue-600"
                          : "bg-yellow-100 text-yellow-600"
                      }`}
                    >
                      {order.status === "processing"
                        ? "Siap Diproses"
                        : "Menunggu Approval"}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-dark-green">
                    {order.customer}
                  </h3>
                  <div className="mt-2 text-sm text-gray-600 bg-gray-50 p-3 rounded-lg border border-gray-100">
                    <p className="font-bold mb-1">Items:</p>
                    <ul className="list-disc list-inside">
                      {order.items
                        .filter(
                          (i) => String(getItemShopId(i)) === String(SHOP_ID)
                        )
                        .map((item, idx) => (
                          <li key={idx}>
                            {item.title || item.name} (x{item.qty || 1})
                          </li>
                        ))}
                    </ul>
                  </div>
                </div>

                <div className="flex flex-row md:flex-col justify-center gap-3 min-w-[140px]">
                  {order.status === "waiting_approval" && (
                    <button
                      onClick={() => handleApproveOrder(order.id)}
                      className="flex-1 bg-dark-green text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-sage-green transition flex items-center justify-center gap-2"
                    >
                      <Check size={16} /> Terima
                    </button>
                  )}
                  {order.status === "processing" && (
                    <button
                      onClick={() => handleSendOrder(order.id)}
                      className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-500 transition flex items-center justify-center gap-2"
                    >
                      <Truck size={16} /> Kirim
                    </button>
                  )}

                  <button
                    onClick={() => handleRejectOrder(order.id)}
                    className="flex-1 border border-red-200 text-red-500 px-4 py-2 rounded-lg text-sm font-bold hover:bg-red-50 transition flex items-center justify-center gap-2"
                  >
                    <X size={16} /> Tolak
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    );
  };

  const InventoryView = () => (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h2 className="text-2xl font-bold text-dark-green">
          Stok Toko: {user.shop.name}
        </h2>

        <div className="flex gap-2">
          {CAN_CUSTOMIZE && (
            <>
                <button
                    onClick={() => openAddModal("flower")}
                    className="bg-white border border-sage-green text-dark-green px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-sage-green hover:text-white transition"
                >
                    <Flower2 size={16} /> + Bunga
                </button>
                <button
                    onClick={() => openAddModal("packaging")}
                    className="bg-white border border-sage-green text-dark-green px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-sage-green hover:text-white transition"
                >
                    <Package size={16} /> + Packaging
                </button>
            </>
          )}
          
          {/* Tombol Katalog Selalu Muncul */}
          <button
            onClick={() => openAddModal("catalog")}
            className="bg-dark-green text-white px-4 py-2 rounded-lg font-bold text-xs flex items-center gap-2 hover:bg-sage-green transition shadow-lg"
          >
            <Plus size={16} /> + Katalog
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 uppercase bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-4 font-semibold tracking-wider">Produk</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Kategori</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Harga</th>
                <th className="px-6 py-4 font-semibold tracking-wider">Stok</th>
                <th className="px-6 py-4 text-center font-semibold tracking-wider">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myInventory.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-12">
                    <div className="flex flex-col items-center justify-center text-gray-400">
                      <Package size={48} className="mb-3 opacity-20" />
                      <p className="font-medium">Inventory kosong</p>
                      <p className="text-xs mt-1">Mulai tambahkan item baru ke toko.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                myInventory.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-gray-50/80 transition-colors duration-200 group"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 overflow-hidden shrink-0 shadow-sm relative group-hover:shadow-md transition-all">
                          {item.image ? (
                            <img
                              src={item.image}
                              alt={item.title}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-gray-300">
                              <ImageIcon size={20} />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-dark-green text-sm line-clamp-1">
                            {item.title || item.name}
                          </p>
                          <p className="text-[10px] text-gray-400 mt-0.5 font-mono">
                            ID: {item.id?.toString().slice(-6)}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wide border ${
                          item.type === "flower"
                            ? "bg-pink-50 text-pink-600 border-pink-100"
                            : item.type === "packaging"
                            ? "bg-blue-50 text-blue-600 border-blue-100"
                            : "bg-emerald-50 text-emerald-600 border-emerald-100"
                        }`}
                      >
                        {item.type === "flower" && <Flower2 size={10} className="mr-1.5" />}
                        {item.type === "packaging" && <Package size={10} className="mr-1.5" />}
                        {item.type === "product" && <ShoppingBag size={10} className="mr-1.5" />}
                        {item.type || "Item"}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-700 font-mono text-sm">
                        {new Intl.NumberFormat("id-ID", {
                          style: "currency",
                          currency: "IDR",
                          maximumSignificantDigits: 9,
                        }).format(item.price || 0)}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-2 h-2 rounded-full ${
                            (item.stock || 0) < 10
                              ? "bg-red-500 animate-pulse"
                              : "bg-emerald-500"
                          }`}
                        ></div>
                        <span
                          className={`font-bold text-sm ${
                            (item.stock || 0) < 10
                              ? "text-red-600"
                              : "text-gray-600"
                          }`}
                        >
                          {item.stock || 0}
                        </span>
                      </div>
                      {(item.stock || 0) < 10 && (
                        <p className="text-[10px] text-red-400 font-medium mt-0.5">
                          Stok Menipis
                        </p>
                      )}
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex items-center justify-center gap-2">
                        <div className="flex items-center bg-white border border-gray-200 rounded-lg p-0.5 shadow-sm mr-2">
                          <button
                            onClick={() => updateStock(item.id, -1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-red-500 transition disabled:opacity-50"
                            disabled={(item.stock || 0) <= 0}
                          >
                            -
                          </button>
                          <div className="w-px h-4 bg-gray-200 mx-0.5"></div>
                          <button
                            onClick={() => updateStock(item.id, 1)}
                            className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-gray-100 text-gray-500 hover:text-green-600 transition"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => openEditModal(item)}
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition border border-transparent hover:border-blue-100"
                          title="Edit Detail"
                        >
                          <Edit size={16} />
                        </button>

                        <button
                          onClick={() => handleDeleteItem(item.id)} 
                          className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition border border-transparent hover:border-red-100"
                          title="Hapus Item"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-cream-bg min-h-screen font-sans flex">
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full z-10 hidden md:flex flex-col">
        <div className="p-6 border-b border-gray-100">
          <h1 className="font-serif font-bold text-xl text-dark-green">
            Florist Admin
          </h1>
          <p
            className="text-xs text-gray-400 mt-1 truncate"
            title={user.shop.name}
          >
            {user.shop.name}
          </p>
        </div>

        <nav className="p-4 space-y-2 flex-1">
          <button
            onClick={() => setActiveTab("overview")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "overview"
                ? "bg-dark-green text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <LayoutDashboard size={18} /> Overview
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "requests"
                ? "bg-dark-green text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Palette size={18} /> Pesanan
          </button>
          <button
            onClick={() => setActiveTab("inventory")}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition ${
              activeTab === "inventory"
                ? "bg-dark-green text-white"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            <Package size={18} /> Inventory
          </button>
        </nav>

        <div className="p-4 border-t border-gray-100">
          <Link href="/profile">
            <div className="flex items-center gap-3 mb-4 px-3 rounded-2xl border border-gray-200 p-2 cursor-pointer hover:border-sage-green transition">
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center text-dark-green border border-green-100">
                <User size={20} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold text-dark-green leading-none mb-1 truncate">
                  {user.shop.name}
                </p>
                <p className="text-xs text-gray-400">Owner</p>
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
        <div className="mb-8">
          <h1 className="text-2xl font-bold capitalize text-dark-green">
            {activeTab}
          </h1>
        </div>
        <motion.div
          key={activeTab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {activeTab === "overview" && <OverviewView />}
          {activeTab === "requests" && <RequestsView />}
          {activeTab === "inventory" && <InventoryView />}
        </motion.div>
      </main>

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
                  {isEditing ? "Edit" : "Tambah"} {modalType}
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
                      />
                      {tempFlower.preview ? (
                        <img
                          src={tempFlower.preview}
                          alt="Preview bunga"
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
                        <option value="Grief">Grief</option>
                        <option value="Regret">Regret</option>
                      </select>
                    </div>
                  </div>
                  <button
                    type="submit"
                    className={`w-full mt-4 ${BTN_PRIMARY}`}
                  >
                    {isEditing ? "Simpan Perubahan" : "Simpan Bunga"}
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
                      <input
                        required
                        type="number"
                        className={INPUT_STYLE}
                        value={tempPack.price}
                        onChange={(e) =>
                          setTempPack({ ...tempPack, price: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="bg-gray-50 p-5 rounded-2xl border border-gray-200">
                    <h4 className="font-bold text-dark-green text-sm mb-4 flex items-center gap-2">
                      <Palette size={18} /> Varian Warna
                    </h4>
                    <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm space-y-4">
                      <div>
                        <label className={LABEL_STYLE}>Pilih Warna</label>
                        <div className="flex gap-3 items-center relative z-20">
                          <div className="relative">
                            <button
                              type="button"
                              onClick={() =>
                                setShowColorPicker(!showColorPicker)
                              }
                              className="w-14 h-14 rounded-xl border-4 border-white shadow flex items-center justify-center"
                              style={{ backgroundColor: variantInput.hex }}
                            >
                              <Palette
                                size={20}
                                className="text-white/60 drop-shadow-md"
                              />
                            </button>
                            {showColorPicker && (
                              <div className="absolute top-16 left-0 z-50 p-3 bg-white shadow-2xl rounded-2xl border border-gray-100">
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
                              </div>
                            )}
                          </div>
                          <div className="flex-1">
                            <label className={LABEL_STYLE}>Kode Hex</label>
                            <input
                              className={INPUT_STYLE}
                              value={variantInput.hex}
                              onChange={(e) =>
                                setVariantInput({
                                  ...variantInput,
                                  hex: e.target.value,
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="col-span-2">
                          <label className={LABEL_STYLE}>Nama Warna</label>
                          <input
                            className={INPUT_STYLE}
                            value={variantInput.name}
                            onChange={(e) =>
                              setVariantInput({
                                ...variantInput,
                                name: e.target.value,
                              })
                            }
                            placeholder="Cth: Merah Marun"
                          />
                        </div>
                        <div>
                          <label className={LABEL_STYLE}>Stok</label>
                          <input
                            type="number"
                            className={INPUT_STYLE}
                            value={variantInput.stock}
                            onChange={(e) =>
                              setVariantInput({
                                ...variantInput,
                                stock: e.target.value,
                              })
                            }
                            placeholder="0"
                          />
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={addVariantToPack}
                        disabled={!variantInput.name || !variantInput.stock}
                        className="w-full py-2 border-2 border-dashed border-dark-green text-dark-green rounded-xl font-bold text-xs hover:bg-dark-green hover:text-white transition"
                      >
                        + Tambah Varian
                      </button>
                    </div>

                    <div className="mt-4 flex flex-wrap gap-2">
                      {tempPack.variants.map((v, idx) => (
                        <div
                          key={idx}
                          className="pl-1 pr-2 py-1 bg-white border border-gray-200 rounded-full flex items-center gap-2 shadow-sm"
                        >
                          <div
                            className="w-4 h-4 rounded-full"
                            style={{ backgroundColor: v.hex }}
                          ></div>
                          <span className="text-xs font-bold text-gray-700">
                            {v.color} ({v.stock})
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              const n = [...tempPack.variants];
                              n.splice(idx, 1);
                              setTempPack({ ...tempPack, variants: n });
                            }}
                          >
                            <X size={12} className="text-red-400" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={tempPack.variants.length === 0}
                    className={`w-full py-3 ${BTN_PRIMARY}`}
                  >
                    {isEditing ? "Simpan Perubahan" : "Simpan Packaging"}
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
                      />
                      {tempCatalog.preview ? (
                        <img
                          src={tempCatalog.preview}
                          alt="Preview katalog"
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
                        <option value="Gloomy">Gloomy</option>
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
                    <label className={LABEL_STYLE}>Komposisi Bunga</label>
                    <input
                      required
                      placeholder="Mawar merah, Baby breath..."
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
                    {isEditing ? "Simpan Perubahan" : "Simpan Produk"}
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