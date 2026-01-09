"use client";
import { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { toJpeg } from "html-to-image";
// Pastikan path import ini benar sesuai struktur foldermu
import { FLOWER_LIBRARY, MOCK_PACKAGINGS } from "../../utils/flower";
import { SHOPS } from "../../utils/shop";
import {
  Info,
  Store,
  ArrowLeft,
  Gift,
  Package,
  Box,
  UploadCloud,
  Save,
  Check,
  X,
  Palette,
} from "lucide-react";
import { useToast } from "@/app/context/ToastContext";

export default function CustomBuilder() {
  const router = useRouter();
  const params = useParams();
  const canvasRef = useRef(null);
  const { showToast } = useToast();

  const [activeShop, setActiveShop] = useState(null);
  const [selectedFlowers, setSelectedFlowers] = useState([]);
  const [activeCategory, setActiveCategory] = useState("romance");
  const [bouquetName, setBouquetName] = useState("My Untitled Bouquet");
  const [zoom, setZoom] = useState(100);

  const [activePackagingItem, setActivePackagingItem] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);

  const [refImage, setRefImage] = useState(null);
  const [refImagePreview, setRefImagePreview] = useState(null);
  const [currentDraftId, setCurrentDraftId] = useState(null);


  const [activeId, setActiveId] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (params?.id) {
      // A. Set Toko Aktif
      const shop = SHOPS.find((s) => String(s.id) === String(params.id));
      if (shop) {
        if (!shop.can_customize) {
          showToast("Toko ini tidak menerima custom!", "error");
          router.push("/toko");
        } else {
          setActiveShop(shop);
        }
      } else {
        showToast("Toko tidak ditemukan", "error");
        router.push("/toko");
      }

      const editId = localStorage.getItem("editDraftId");
      if (editId) {
        const drafts = JSON.parse(localStorage.getItem("flowerDrafts") || "[]");
        const draft = drafts.find((d) => String(d.id) === String(editId));

        if (draft) {
          setCurrentDraftId(draft.id);
          setBouquetName(draft.name);
          setSelectedFlowers(draft.items || []);
          if (draft.refImagePreview) setRefImagePreview(draft.refImagePreview);

          if (draft.packaging && draft.packaging.id) {
            const savedPkg = MOCK_PACKAGINGS.find(
              (p) => p.id === draft.packaging.id
            );
            if (savedPkg) {
              setActivePackagingItem(savedPkg);
              setSelectedVariant(draft.packaging.variant);
            }
          }
        }
        localStorage.removeItem("editDraftId");
      }
    }
  }, [params, router, showToast]);

  const getCanvasBackground = () => {
    if (selectedVariant && activePackagingItem?.type !== "ribbon") {
      return selectedVariant.hex;
    }
    return "#F3F4F6";
  };

  const filteredLibrary = activeShop
    ? FLOWER_LIBRARY.filter(
        (f) =>
          f.category === activeCategory &&
          String(f.shop_id) === String(activeShop.id)
      )
    : [];

  const shopPackagings = activeShop
    ? MOCK_PACKAGINGS.filter((p) => String(p.shop_id) === String(activeShop.id))
    : [];

  const totalPrice =
    selectedFlowers.reduce((sum, item) => sum + item.price, 0) +
    (activePackagingItem ? activePackagingItem.price : 0);
  const editingFlower = selectedFlowers.find((f) => f.uid === editingId);

  const addFlower = (flower) => {
    const uniqueId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newFlower = {
      ...flower,
      uid: uniqueId,
      x: Math.random() * 60 - 30,
      y: Math.random() * 60 - 30,
      rotation: Math.random() * 40 - 20,
      scale: 1,
    };
    setSelectedFlowers([...selectedFlowers, newFlower]);
    setActiveId(uniqueId);
  };

  const removeFlower = (uid) => {
    setSelectedFlowers((prev) => prev.filter((item) => item.uid !== uid));
    if (activeId === uid) setActiveId(null);
    if (editingId === uid) setEditingId(null);
  };

  const handleMouseDown = (e, uid, x, y) => {
    e.stopPropagation();
    setActiveId(uid);
    setIsDragging(true);
    setDragOffset({ x: e.clientX - x, y: e.clientY - y });
  };

  const handleMouseMove = (e) => {
    if (!isDragging || !activeId) return;
    setSelectedFlowers((prev) =>
      prev.map((flower) => {
        if (flower.uid === activeId) {
          return {
            ...flower,
            x: e.clientX - dragOffset.x,
            y: e.clientY - dragOffset.y,
          };
        }
        return flower;
      })
    );
  };

  const handleMouseUp = () => setIsDragging(false);
  const handleDoubleClick = (e, uid) => {
    e.stopPropagation();
    setEditingId(uid);
  };

  const updateFlowerProps = (key, value) => {
    setSelectedFlowers((prev) =>
      prev.map((flower) =>
        flower.uid === editingId
          ? { ...flower, [key]: parseFloat(value) }
          : flower
      )
    );
  };

  const layerAction = (direction) => {
    if (!editingId) return;
    const idx = selectedFlowers.findIndex((f) => f.uid === editingId);
    if (
      (direction === "up" && idx === selectedFlowers.length - 1) ||
      (direction === "down" && idx === 0)
    )
      return;
    const newArr = [...selectedFlowers];
    const item = newArr.splice(idx, 1)[0];
    newArr.splice(direction === "up" ? idx + 1 : idx - 1, 0, item);
    setSelectedFlowers(newArr);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024)
        return showToast("File terlalu besar (Max 2MB)", "error");
      setRefImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setRefImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async (isCheckout = false) => {
    if (selectedFlowers.length === 0)
      return showToast("Canvas masih kosong!", "error");

    setActiveId(null);
    setEditingId(null);
    await new Promise((r) => setTimeout(r, 200));

    let designImage = null;
    if (canvasRef.current) {
      try {
        designImage = await toJpeg(canvasRef.current, {
          quality: 0.8,
          cacheBust: true,
          backgroundColor: getCanvasBackground(),
          width: 500,
          height: 600,
          style: {
            transform: "scale(1)",
            transformOrigin: "top left",
            width: "500px",
            height: "600px",
            margin: "0",
          },
        });
      } catch (err) {
        console.error("Snapshot error:", err);
      }
    }


    const payload = {
      id: currentDraftId || Date.now(),
      name: bouquetName,
      date: new Date().toLocaleDateString("id-ID"),
      items: selectedFlowers,
      totalPrice: totalPrice,
      previewImage: designImage, 
      designImage: designImage,
      refImagePreview: refImagePreview,
      packaging: {
        id: activePackagingItem?.id,
        name: activePackagingItem?.name,
        price: activePackagingItem?.price,
        variant: selectedVariant,
      },
      shop: activeShop,
      status: isCheckout ? "in_cart" : "draft",
    };

    try {
      const existingDrafts = JSON.parse(
        localStorage.getItem("flowerDrafts") || "[]"
      );
      let updatedDrafts;
      if (currentDraftId) {
        updatedDrafts = existingDrafts.map((d) =>
          d.id === currentDraftId ? payload : d
        );
      } else {
        updatedDrafts = [payload, ...existingDrafts];
      }
      localStorage.setItem("flowerDrafts", JSON.stringify(updatedDrafts));

      if (isCheckout) {
        const cartItem = {
          ...payload,
          type: "custom_bouquet",
          qty: 1,
          image: designImage || "/assets/bouquet/placeholder.png",
          price: totalPrice,
        };

        const currentCart = JSON.parse(localStorage.getItem("myCart") || "[]");
        localStorage.setItem(
          "myCart",
          JSON.stringify([...currentCart, cartItem])
        );

        showToast("Berhasil masuk keranjang!", "success");
        router.push("/cart");
      } else {
        showToast("Draft tersimpan!", "success");
        router.push(`/drafts`);
      }
    } catch (e) {
      console.error(e);
      showToast("Gagal menyimpan.", "error");
    }
  };

  if (!activeShop)
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading Studio...
      </div>
    );

  return (
    <div
      className="flex h-screen bg-[#F3F4F6] overflow-hidden font-sans"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <aside className="w-96 bg-white border-r border-gray-200 flex flex-col z-20 shadow-xl overflow-y-auto">
        <div className="p-6 border-b border-gray-100">
          <Link
            href={`/shop/${activeShop.id}`}
            className="text-gray-400 text-sm hover:text-dark-green mb-4 flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Back to Shop
          </Link>
          <h2 className="text-xl font-serif font-bold text-dark-green mb-1">
            {activeShop.name}
          </h2>
          <p className="text-xs text-gray-400">Custom Studio</p>
        </div>

        <div className="flex-1 p-6 space-y-8 overflow-y-auto custom-scrollbar">
          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3 block">
              1. Pilih Packaging
            </label>

            <div className="space-y-3 mb-4">
              {shopPackagings.map((pkg) => (
                <div
                  key={pkg.id}
                  onClick={() => {
                    setActivePackagingItem(pkg);
                    setSelectedVariant(null);
                  }}
                  className={`p-3 rounded-xl border-2 cursor-pointer transition-all flex justify-between items-center ${
                    activePackagingItem?.id === pkg.id
                      ? "border-sage-green bg-sage-green/10"
                      : "border-gray-100 hover:border-gray-300"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        activePackagingItem?.id === pkg.id
                          ? "bg-sage-green text-white"
                          : "bg-gray-100 text-gray-400"
                      }`}
                    >
                      {pkg.type === "box" ? (
                        <Box size={16} />
                      ) : (
                        <Gift size={16} />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-dark-green">
                        {pkg.name}
                      </p>
                      <p className="text-[10px] text-gray-500">
                        Rp {pkg.price.toLocaleString()}
                      </p>
                    </div>
                  </div>
                  {activePackagingItem?.id === pkg.id && (
                    <Check size={16} className="text-sage-green" />
                  )}
                </div>
              ))}
            </div>

            {activePackagingItem && (
              <div className="bg-gray-50 p-4 rounded-xl border border-gray-200 animate-in slide-in-from-top-2">
                <span className="text-xs font-bold text-dark-green mb-3 block">
                  Pilih Warna{" "}
                  {activePackagingItem.type === "box" ? "Box" : "Kertas"}:
                </span>
                <div className="grid grid-cols-4 gap-2">
                  {activePackagingItem.variants.map((variant, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedVariant(variant)}
                      className={`relative flex flex-col items-center gap-1 group`}
                      title={variant.name}
                    >
                      <div
                        className={`w-8 h-8 rounded-full shadow-sm border-2 transition-transform hover:scale-110 ${
                          selectedVariant?.hex === variant.hex
                            ? "border-dark-green ring-2 ring-sage-green ring-offset-1"
                            : "border-gray-200"
                        }`}
                        style={{ backgroundColor: variant.hex }}
                      ></div>
                      <span className="text-[9px] text-gray-500 truncate w-full text-center">
                        {variant.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3 block">
              2. Pilih Bunga (Stock)
            </label>
            <div className="flex gap-2 overflow-x-auto pb-2 mb-2 scrollbar-hide">
              {["romance", "gratitude", "regret", "grief"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-dark-green text-white"
                      : "bg-gray-100 text-gray-400"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1 custom-scrollbar">
              {filteredLibrary.length > 0 ? (
                filteredLibrary.map((flower) => (
                  <div
                    key={flower.id}
                    onClick={() => addFlower(flower)}
                    className="group cursor-pointer bg-white p-2 rounded-xl border border-gray-100 hover:border-sage-green transition-all hover:shadow-sm"
                  >
                    <div className="aspect-square bg-gray-50 rounded-lg mb-2 p-2">
                      <img
                        src={flower.image}
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <h4 className="font-bold text-dark-green text-xs truncate">
                      {flower.name}
                    </h4>
                    <div className="flex justify-between items-center mt-1">
                      <span className="text-[10px] text-gray-500">
                        {flower.price.toLocaleString()}
                      </span>
                      <div className="w-5 h-5 bg-gray-100 rounded-full flex items-center justify-center text-dark-green group-hover:bg-dark-green group-hover:text-white transition">
                        +
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-2 text-center py-4 text-xs text-gray-400">
                  Stok Kosong
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-[10px] uppercase font-bold text-gray-400 tracking-wider mb-3 block">
              3. Referensi (Opsional)
            </label>
            <div className="relative w-full h-24 bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl flex items-center justify-center text-gray-400 hover:border-sage-green cursor-pointer overflow-hidden">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-10"
              />
              {refImagePreview ? (
                <img
                  src={refImagePreview}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center">
                  <UploadCloud size={20} className="mb-1" />
                  <span className="text-[10px] font-bold">Upload Foto</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="p-6 border-t bg-white z-20">
          <div className="flex justify-between items-center mb-4">
            <span className="text-sm text-gray-500">Estimasi</span>
            <span className="text-xl font-bold text-dark-green">
              {totalPrice.toLocaleString("id-ID", {
                style: "currency",
                currency: "IDR",
              })}
            </span>
          </div>
          <button
            onClick={() => handleSave(false)}
            className="flex-1 py-3 px-30 border bg-dark-green border-dark-green text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-gray-50"
          >
            <Save size={16} /> Save Draft
          </button>
        </div>
      </aside>

      <main className="flex-1 relative flex flex-col bg-[#F3F4F6]">
        <header className="h-16 bg-white border-b border-gray-200 flex justify-between items-center px-6 z-10 shadow-sm">
          <input
            type="text"
            value={bouquetName}
            onChange={(e) => setBouquetName(e.target.value)}
            className="font-serif font-bold text-xl text-dark-green focus:outline-none bg-transparent"
            placeholder="Namai Buketmu..."
          />

          <div className="flex items-center gap-4">
            {/* Visual Indicator of Selected Background */}
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-200">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wide">
                Packaging:
              </span>
              {selectedVariant ? (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full border border-gray-300"
                    style={{ backgroundColor: selectedVariant.hex }}
                  ></div>
                  <span className="text-xs font-bold text-dark-green">
                    {selectedVariant.name}
                  </span>
                </div>
              ) : (
                <span className="text-xs text-gray-400 italic">
                  Belum dipilih
                </span>
              )}
            </div>

            <div className="flex items-center gap-2 bg-gray-50 rounded-lg px-2 py-1 border border-gray-200">
              <button
                onClick={() => setZoom(Math.max(50, zoom - 10))}
                className="w-6 h-6 flex items-center justify-center font-bold text-gray-500"
              >
                -
              </button>
              <span className="text-xs font-bold w-8 text-center text-dark-green">
                {zoom}%
              </span>
              <button
                onClick={() => setZoom(Math.min(200, zoom + 10))}
                className="w-6 h-6 flex items-center justify-center font-bold text-gray-500"
              >
                +
              </button>
            </div>
          </div>
        </header>

        <div className="flex-1 relative overflow-hidden flex items-center justify-center">
          <div
            className="absolute inset-0 z-0"
            onClick={() => {
              setActiveId(null);
              setEditingId(null);
            }}
          ></div>

          <div
            ref={canvasRef}
            id="canvas-root"
            className={`relative w-[500px] h-[600px] shadow-2xl transition-colors duration-500 ease-in-out`}
            style={{
              transform: `scale(${zoom / 100})`,
              backgroundColor: getCanvasBackground(),
            }}
          >
            {selectedFlowers.map((item, index) => (
              <div
                key={item.uid}
                onMouseDown={(e) =>
                  handleMouseDown(e, item.uid, item.x, item.y)
                }
                onDoubleClick={(e) => handleDoubleClick(e, item.uid)}
                className="absolute cursor-move group select-none flex justify-center items-center"
                style={{
                  transform: `translate(${item.x}px, ${item.y}px) rotate(${item.rotation}deg) scale(${item.scale})`,
                  zIndex: index + 10,
                  left: "50%",
                  top: "50%",
                  marginLeft: "-5rem",
                  marginTop: "-5rem",
                }}
              >
                <img
                  src={item.image}
                  crossOrigin="anonymous"
                  className={`w-40 h-40 object-contain drop-shadow-xl pointer-events-none transition-filter duration-200 ${
                    activeId === item.uid
                      ? "brightness-110 drop-shadow-2xl"
                      : ""
                  }`}
                />
                {activeId === item.uid && (
                  <div className="absolute inset-0 border-2 border-dashed border-sage-green rounded-lg opacity-60 pointer-events-none"></div>
                )}
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    removeFlower(item.uid);
                  }}
                  className="absolute -top-2 -right-2 bg-white text-red-500 border border-red-100 w-5 h-5 rounded-full flex items-center justify-center text-[10px] opacity-0 group-hover:opacity-100 shadow-md cursor-pointer hover:bg-red-50 z-[1000]"
                >
                  ✕
                </div>
              </div>
            ))}

            {selectedFlowers.length === 0 && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center text-gray-300 select-none pointer-events-none z-10">
                <p className="text-4xl mb-2 opacity-50">🌸</p>
                <p className="font-serif italic text-sm">Canvas Bersih</p>
              </div>
            )}
          </div>

          {/* EDITING POPUP */}
          {editingId && editingFlower && (
            <div className="absolute bottom-6 right-6 bg-white p-4 rounded-2xl shadow-2xl border border-gray-100 w-64 z-[1000] animate-in slide-in-from-bottom-5">
              <div className="flex justify-between items-center mb-3 pb-2 border-b border-gray-100">
                <h3 className="font-bold text-dark-green text-xs truncate w-40">
                  {editingFlower.name}
                </h3>
                <button
                  onClick={() => setEditingId(null)}
                  className="text-gray-400 hover:text-dark-green"
                >
                  ✕
                </button>
              </div>
              <div className="space-y-3">
                <div className="flex gap-2">
                  <button
                    onClick={() => layerAction("down")}
                    className="flex-1 py-1 bg-gray-50 text-[10px] font-bold rounded hover:bg-gray-100"
                  >
                    To Back
                  </button>
                  <button
                    onClick={() => layerAction("up")}
                    className="flex-1 py-1 bg-gray-50 text-[10px] font-bold rounded hover:bg-gray-100"
                  >
                    To Front
                  </button>
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-gray-500">
                    <span>Size</span>
                    <span>{Math.round(editingFlower.scale * 100)}%</span>
                  </div>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={editingFlower.scale}
                    onChange={(e) => updateFlowerProps("scale", e.target.value)}
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-dark-green"
                  />
                </div>
                <div>
                  <div className="flex justify-between text-[10px] mb-1 text-gray-500">
                    <span>Rotate</span>
                    <span>{editingFlower.rotation}°</span>
                  </div>
                  <input
                    type="range"
                    min="-180"
                    max="180"
                    step="5"
                    value={editingFlower.rotation}
                    onChange={(e) =>
                      updateFlowerProps("rotation", e.target.value)
                    }
                    className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-dark-green"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
