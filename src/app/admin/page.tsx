"use client";

import { useState, useEffect } from "react";
import { useMenu } from "@/context/MenuContext";
import { Category, MenuItem } from "@/data/menu";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import ImageUpload from "@/components/ImageUpload";

// --- Icons ---
const IconPlus = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>;
const IconX = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>;
const IconTrash = () => <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /></svg>;
const IconBack = () => <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12" /><polyline points="12 19 5 12 12 5" /></svg>;
const IconArrow = () => <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" /></svg>;

// --- Shared Input Style ---
const inputClass = "w-full px-4 py-3.5 bg-[#0e0e0e] border border-white/10 focus:border-primary/60 outline-none text-sm font-body transition-colors placeholder:text-white/20";

// --- Toast ---
function Toast({ message, onDone }: { message: string; onDone: () => void }) {
  useEffect(() => { const t = setTimeout(onDone, 2200); return () => clearTimeout(t); }, [onDone]);
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 30 }}
      className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[70] bg-primary text-black px-6 py-3 text-xs font-bold uppercase tracking-widest shadow-xl shadow-primary/20"
    >
      {message}
    </motion.div>
  );
}

// --- Full Screen Create Sheet ---
function CreateSheet({ open, onClose, categories, onSaveCategory, onSaveItem }: {
  open: boolean;
  onClose: () => void;
  categories: Category[];
  onSaveCategory: (name: string) => void;
  onSaveItem: (categoryId: string, item: MenuItem) => void;
}) {
  const [activeTab, setActiveTab] = useState<"item" | "category">("item");
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [catName, setCatName] = useState("");
  const [itemForm, setItemForm] = useState<Partial<MenuItem> & { ingredientsText?: string; categoryId?: string }>({
    name: "", description: "", price: 0, image: "", popular: false, ingredientsText: "", categoryId: categories[0]?.id || "", imageAspectRatio: 16 / 9
  });

  useEffect(() => {
    if (open) {
      setCatName("");
      setItemForm({ name: "", description: "", price: 0, image: "", popular: false, ingredientsText: "", categoryId: categories[0]?.id || "", imageAspectRatio: 16 / 9 });
      setActiveTab("item");
    }
  }, [open, categories]);

  const onTouchStart = (e: React.TouchEvent) => { setTouchEnd(null); setTouchStart(e.targetTouches[0].clientX); };
  const onTouchMove = (e: React.TouchEvent) => { setTouchEnd(e.targetTouches[0].clientX); };
  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const d = touchStart - touchEnd;
    if (d > 50 && activeTab === "item") setActiveTab("category");
    if (d < -50 && activeTab === "category") setActiveTab("item");
  };

  const handleSaveCategory = (e: React.FormEvent) => { e.preventDefault(); if (catName.trim()) { onSaveCategory(catName); onClose(); } };
  const handleSaveItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (itemForm.categoryId && itemForm.name?.trim()) {
      const ingredients = itemForm.ingredientsText ? itemForm.ingredientsText.split(",").map(s => s.trim()).filter(Boolean) : undefined;
      onSaveItem(itemForm.categoryId, {
        id: `item-${Date.now()}`, name: itemForm.name.trim(), description: itemForm.description || undefined,
        price: Number(itemForm.price) || 0, image: itemForm.image || "https://placehold.co/400x300/1a1a1a/D4AF37?text=Menu+Item",
        popular: itemForm.popular, ingredients, imageAspectRatio: itemForm.imageAspectRatio
      });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ y: "100%" }}
          animate={{ y: 0 }}
          exit={{ y: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 220 }}
          className="fixed inset-0 z-50 bg-background flex flex-col"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 h-16 border-b border-white/5">
            <h2 className="font-display text-sm tracking-[0.2em] uppercase text-white/60">Create New</h2>
            <button onClick={onClose} className="p-2 text-white/40 hover:text-white active:scale-90 transition-all">
              <IconX />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-white/5">
            {(["item", "category"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-4 text-xs font-bold tracking-[0.2em] uppercase transition-all relative ${activeTab === tab ? "text-primary" : "text-white/30"}`}
              >
                {tab === "item" ? "Menu Item" : "Category"}
                {activeTab === tab && (
                  <motion.div layoutId="adminTab" className="absolute bottom-0 left-0 right-0 h-[2px] bg-primary" />
                )}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden relative" onTouchStart={onTouchStart} onTouchMove={onTouchMove} onTouchEnd={onTouchEnd}>
            <AnimatePresence mode="wait">
              {activeTab === "item" ? (
                <motion.div key="item" initial={{ opacity: 0, x: -30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -30 }} transition={{ duration: 0.2 }} className="absolute inset-0 overflow-y-auto px-6 py-8 pb-32">
                  <form onSubmit={handleSaveItem} className="space-y-6">
                    {categories.length === 0 ? (
                      <div className="text-center py-20 text-white/20 font-display text-lg uppercase tracking-widest">Create a category first</div>
                    ) : (
                      <>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Category</label>
                          <select value={itemForm.categoryId} onChange={(e) => setItemForm({ ...itemForm, categoryId: e.target.value })} className={`${inputClass} appearance-none`}>
                            {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                          </select>
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Name</label>
                          <input type="text" value={itemForm.name} onChange={(e) => setItemForm({ ...itemForm, name: e.target.value })} className={inputClass} placeholder="Nasi Goreng" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Price (IDR)</label>
                          <input type="number" value={itemForm.price || ""} onChange={(e) => setItemForm({ ...itemForm, price: Number(e.target.value) })} className={inputClass} placeholder="25000" required />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Description</label>
                          <input type="text" value={itemForm.description || ""} onChange={(e) => setItemForm({ ...itemForm, description: e.target.value })} className={inputClass} placeholder="Optional" />
                        </div>
                        <ImageUpload
                          value={itemForm.image || ""}
                          onChange={(url) => setItemForm({ ...itemForm, image: url })}
                          aspect={itemForm.imageAspectRatio}
                          onAspectChange={(aspect) => setItemForm({ ...itemForm, imageAspectRatio: aspect })}
                        />
                        <button type="button" onClick={() => setItemForm({ ...itemForm, popular: !itemForm.popular })}
                          className={`w-full flex items-center justify-between px-4 py-4 border transition-all ${itemForm.popular ? "bg-primary/10 border-primary/40" : "bg-[#0e0e0e] border-white/10"}`}
                        >
                          <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Popular</span>
                          <div className={`w-10 h-5 rounded-full transition-colors relative ${itemForm.popular ? "bg-primary" : "bg-white/10"}`}>
                            <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${itemForm.popular ? "left-5" : "left-0.5"}`} />
                          </div>
                        </button>
                        <button type="submit" className="w-full bg-primary text-black font-display text-sm font-bold tracking-[0.15em] uppercase py-4 active:scale-[0.98] transition-transform">
                          Create Item
                        </button>
                      </>
                    )}
                  </form>
                </motion.div>
              ) : (
                <motion.div key="cat" initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.2 }} className="absolute inset-0 overflow-y-auto px-6 py-8">
                  <form onSubmit={handleSaveCategory} className="space-y-6">
                    <div>
                      <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Category Name</label>
                      <input type="text" value={catName} onChange={(e) => setCatName(e.target.value)} className={inputClass} placeholder="e.g. Desserts" required autoFocus />
                    </div>
                    <button type="submit" className="w-full bg-primary text-black font-display text-sm font-bold tracking-[0.15em] uppercase py-4 active:scale-[0.98] transition-transform">
                      Create Category
                    </button>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// --- Edit Item Sheet ---
function EditItemSheet({ item, categoryId, onClose, onSave, onDelete }: {
  item: MenuItem | null; categoryId: string; onClose: () => void;
  onSave: (catId: string, itemId: string, data: Partial<MenuItem>) => void;
  onDelete: (catId: string, itemId: string) => void;
}) {
  const [form, setForm] = useState<Partial<MenuItem> & { ingredientsText?: string }>({ imageAspectRatio: 16 / 9 });
  useEffect(() => { if (item) setForm({ ...item, ingredientsText: item.ingredients?.join(", ") || "", imageAspectRatio: item.imageAspectRatio || 16 / 9 }); }, [item]);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (item && form.name) {
      const ingredients = form.ingredientsText ? form.ingredientsText.split(",").map(s => s.trim()).filter(Boolean) : undefined;
      onSave(categoryId, item.id, { ...form, ingredients });
      onClose();
    }
  };

  return (
    <AnimatePresence>
      {item && (
        <div className="fixed inset-0 z-50">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/70 backdrop-blur-md" onClick={onClose} />
          <motion.div
            initial={{ y: "100%" }} animate={{ y: 0 }} exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="absolute bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 max-h-[92vh] flex flex-col"
          >
            <div className="flex justify-center pt-3 pb-1"><div className="w-8 h-0.5 bg-white/20" /></div>
            <div className="flex items-center justify-between px-6 py-4 border-b border-white/5">
              <h3 className="font-display text-sm tracking-[0.15em] uppercase">Edit Item</h3>
              <button onClick={() => { if (confirm("Delete this item?")) { onDelete(categoryId, item.id); onClose(); } }} className="p-2 text-white/30 hover:text-red-400 transition-colors">
                <IconTrash />
              </button>
            </div>
            <div className="overflow-y-auto px-6 py-6 pb-10">
              <form onSubmit={handleSave} className="space-y-5">
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Name</label>
                  <input type="text" value={form.name || ""} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputClass} required />
                </div>
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Price (IDR)</label>
                  <input type="number" value={form.price || ""} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} className={inputClass} required />
                </div>
                <ImageUpload
                  value={form.image || ""}
                  onChange={(url) => setForm({ ...form, image: url })}
                  aspect={form.imageAspectRatio}
                  onAspectChange={(aspect) => setForm({ ...form, imageAspectRatio: aspect })}
                />
                <div>
                  <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Description</label>
                  <input type="text" value={form.description || ""} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputClass} />
                </div>
                <button type="button" onClick={() => setForm({ ...form, popular: !form.popular })}
                  className={`w-full flex items-center justify-between px-4 py-4 border transition-all ${form.popular ? "bg-primary/10 border-primary/40" : "bg-[#0e0e0e] border-white/10"}`}
                >
                  <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-white/60">Popular</span>
                  <div className={`w-10 h-5 rounded-full transition-colors relative ${form.popular ? "bg-primary" : "bg-white/10"}`}>
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${form.popular ? "left-5" : "left-0.5"}`} />
                  </div>
                </button>
                <button type="submit" className="w-full bg-primary text-black font-display text-sm font-bold tracking-[0.15em] uppercase py-4 active:scale-[0.98] transition-transform">
                  Save Changes
                </button>
              </form>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// ============================
// MAIN ADMIN PAGE
// ============================
export default function AdminPage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { categories, isLoading, addCategory, updateCategory, deleteCategory, addMenuItem, updateMenuItem, deleteMenuItem, resetMenu } = useMenu();
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [isCreateSheetOpen, setIsCreateSheetOpen] = useState(false);
  const [editingItemData, setEditingItemData] = useState<{ item: MenuItem; categoryId: string } | null>(null);
  const [toast, setToast] = useState("");

  const activeCategory = categories.find((c) => c.id === activeCategoryId) || null;
  const formatPrice = (p: number) => new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p).replace("Rp", "");

  const handleLogin = (e: React.FormEvent) => { e.preventDefault(); if (password === "061225") { setIsAuthenticated(true); setError(""); } else { setError("Access denied"); setPassword(""); } };

  const handleAddCategory = async (name: string) => { await addCategory({ id: name.toLowerCase().replace(/\s+/g, "-") + "-" + Date.now(), name, items: [] }); setToast("Category created"); };
  const handleAddItem = async (catId: string, item: MenuItem) => { await addMenuItem(catId, item); setToast("Item created"); };
  const handleUpdateItem = async (catId: string, itemId: string, data: Partial<MenuItem>) => { await updateMenuItem(catId, itemId, data); setToast("Item updated"); };
  const handleDeleteItem = async (catId: string, itemId: string) => { await deleteMenuItem(catId, itemId); setToast("Item deleted"); };
  const handleDeleteCategory = async (catId: string) => { if (confirm("Delete this category and all its items?")) { await deleteCategory(catId); setActiveCategoryId(null); setToast("Category deleted"); } };
  const handleSeedDb = async () => { if (confirm("Reset all data to defaults?")) { await resetMenu(); setToast("Database reset"); } };

  // =====================
  // LOGIN
  // =====================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background relative overflow-hidden">
        {/* Diagonal gold line */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-1/2 -left-1/4 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-primary/30 to-transparent rotate-[25deg] origin-center" />
          <div className="absolute -bottom-1/2 -right-1/4 w-[200%] h-[1px] bg-gradient-to-r from-transparent via-primary/20 to-transparent rotate-[25deg] origin-center" />
        </div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="relative z-10 w-full max-w-xs px-6">
          <div className="mb-12">
            <div className="w-1 h-8 bg-primary mb-6" />
            <h1 className="font-display text-3xl font-bold tracking-tighter uppercase text-white leading-none">Admin<br /><span className="text-primary">Panel</span></h1>
          </div>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-[10px] font-bold tracking-[0.2em] uppercase text-white/40 mb-2">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(""); }}
                className="w-full px-4 py-4 bg-[#0e0e0e] border border-white/10 focus:border-primary outline-none text-center tracking-[0.4em] text-lg font-mono placeholder:text-white/10"
                placeholder="••••••"
                autoFocus
              />
            </div>
            <AnimatePresence>
              {error && <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-red-400 text-xs uppercase tracking-widest text-center">{error}</motion.p>}
            </AnimatePresence>
            <button type="submit" className="w-full bg-primary text-black font-display text-sm font-bold tracking-[0.15em] uppercase py-4 active:scale-[0.98] transition-transform">
              Authenticate
            </button>
          </form>
        </motion.div>
      </div>
    );
  }

  // =====================
  // LOADING
  // =====================
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-6 h-6 border border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-[10px] uppercase tracking-[0.3em] text-white/30">Loading</p>
        </div>
      </div>
    );
  }

  // =====================
  // DASHBOARD
  // =====================
  return (
    <div className="min-h-screen bg-background text-foreground pb-28">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-xl border-b border-white/5">
        <div className="px-6 h-14 flex items-center justify-between">
          {activeCategoryId ? (
            <div className="flex items-center gap-4 w-full">
              <button onClick={() => setActiveCategoryId(null)} className="p-1 text-white/40 hover:text-white active:scale-90 transition-all">
                <IconBack />
              </button>
              <h1 className="font-display text-sm tracking-[0.15em] uppercase truncate flex-1">{activeCategory?.name}</h1>
              <button onClick={() => handleDeleteCategory(activeCategoryId)} className="p-2 text-white/20 hover:text-red-400 transition-colors">
                <IconTrash />
              </button>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <div className="w-1 h-5 bg-primary" />
                <h1 className="font-display text-sm tracking-[0.15em] uppercase">Dashboard</h1>
              </div>
              <div className="flex items-center gap-3">
                <button onClick={handleSeedDb} className="text-[10px] tracking-widest uppercase text-white/20 hover:text-white/50 transition-colors">Reset</button>
                <button onClick={() => { setIsAuthenticated(false); setPassword(""); }} className="text-[10px] tracking-widest uppercase text-white/40 hover:text-white border border-white/10 px-3 py-1.5 transition-colors">Logout</button>
              </div>
            </>
          )}
        </div>
      </header>

      <main className="px-6 py-8">
        {activeCategoryId && activeCategory ? (
          /* ---- ITEMS LIST ---- */
          <div className="space-y-1">
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">{activeCategory.items.length} Items</p>
                <h2 className="font-display text-2xl font-bold tracking-tighter uppercase">{activeCategory.name}</h2>
              </div>
            </div>

            {activeCategory.items.length === 0 && (
              <div className="py-24 text-center">
                <p className="text-white/15 font-display text-lg uppercase tracking-widest">Empty</p>
                <p className="text-white/10 text-xs mt-2">Tap + to add the first item</p>
              </div>
            )}

            {activeCategory.items.map((item, i) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
                onClick={() => setEditingItemData({ item, categoryId: activeCategory.id })}
                className="group flex items-center gap-4 py-4 border-b border-white/5 cursor-pointer active:bg-white/[0.02] transition-colors -mx-2 px-2"
              >
                <div className="relative w-14 h-14 bg-white/5 flex-shrink-0 overflow-hidden">
                  <Image src={item.image || "https://placehold.co/400x300"} alt={item.name} fill className="object-cover grayscale-[40%] group-hover:grayscale-0 transition-[filter] duration-500" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate group-hover:text-primary transition-colors">{item.name}</h4>
                  <div className="flex items-center gap-2 mt-0.5">
                    <span className="text-xs text-primary font-mono">IDR{formatPrice(item.price)}</span>
                    {item.popular && <span className="text-[8px] uppercase tracking-widest text-primary/60 border border-primary/30 px-1.5 py-0.5">Star</span>}
                  </div>
                </div>
                <div className="text-white/15 group-hover:text-white/40 transition-colors">
                  <IconArrow />
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          /* ---- CATEGORIES GRID ---- */
          <div>
            <div className="mb-8">
              <p className="text-[10px] uppercase tracking-[0.3em] text-white/30 mb-1">{categories.length} Categories</p>
              <h2 className="font-display text-3xl font-bold tracking-tighter uppercase">Menu<br /><span className="text-primary">Management</span></h2>
            </div>

            <div className="grid grid-cols-2 gap-[1px] bg-white/5">
              {categories.map((cat, i) => {
                const previews = cat.items.filter(it => it.image).slice(0, 4);
                return (
                  <motion.button
                    key={cat.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.04 }}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className="group bg-background text-left active:bg-white/[0.05] transition-colors relative overflow-hidden aspect-[4/3]"
                  >
                    {/* Image Mosaic Background */}
                    <div className="absolute inset-0 grid grid-cols-2 grid-rows-2">
                      {[0, 1, 2, 3].map((slot) => (
                        <div key={slot} className="relative overflow-hidden bg-white/[0.02]">
                          {previews[slot] ? (
                            <Image
                              src={previews[slot].image!}
                              alt=""
                              fill
                              className="object-cover opacity-40 grayscale group-hover:opacity-60 group-hover:grayscale-[30%] transition-all duration-500"
                            />
                          ) : null}
                        </div>
                      ))}
                    </div>
                    {/* Dark gradient overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-black/30 group-hover:from-black/80 group-hover:via-black/40 transition-all duration-500" />

                    {/* Content on top */}
                    <div className="relative z-10 h-full p-5 flex flex-col justify-between">
                      <span className="font-mono text-[10px] text-white/20">{String(i + 1).padStart(2, "0")}</span>
                      <div>
                        <h3 className="font-display text-base font-bold uppercase leading-tight tracking-tight group-hover:text-primary transition-colors">{cat.name}</h3>
                        <p className="text-[10px] text-white/40 mt-1 font-mono">{cat.items.length} items</p>
                      </div>
                    </div>

                    {/* Hover corner accents */}
                    <div className="absolute top-0 right-0 w-0 group-hover:w-8 h-[2px] bg-primary transition-all duration-300 z-10" />
                    <div className="absolute bottom-0 left-0 h-0 group-hover:h-8 w-[2px] bg-primary transition-all duration-300 z-10" />
                  </motion.button>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* FAB */}
      <motion.button
        whileTap={{ scale: 0.85 }}
        onClick={() => setIsCreateSheetOpen(true)}
        className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-black flex items-center justify-center z-40 shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-shadow"
      >
        <IconPlus />
      </motion.button>

      <CreateSheet open={isCreateSheetOpen} onClose={() => setIsCreateSheetOpen(false)} categories={categories} onSaveCategory={handleAddCategory} onSaveItem={handleAddItem} />
      <EditItemSheet item={editingItemData?.item || null} categoryId={editingItemData?.categoryId || ""} onClose={() => setEditingItemData(null)} onSave={handleUpdateItem} onDelete={handleDeleteItem} />
      <AnimatePresence>{toast && <Toast message={toast} onDone={() => setToast("")} />}</AnimatePresence>
    </div>
  );
}
