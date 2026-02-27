"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MenuItem, menuData } from "@/data/menu";
import { Trash2 } from "lucide-react";

interface OrderSummaryProps {
    isOpen: boolean;
    onClose: () => void;
}

const LIST_KEY = "xtreme-menu:list";

export default function OrderSummary({ isOpen, onClose }: OrderSummaryProps) {
    const [listItems, setListItems] = useState<MenuItem[]>([]);

    const loadItems = () => {
        try {
            const raw = window.localStorage.getItem(LIST_KEY);
            if (!raw) {
                setListItems([]);
                return;
            }
            const ids = JSON.parse(raw);
            if (Array.isArray(ids)) {
                // Flatten menuData to find items
                const allItems = menuData.flatMap(category => category.items);
                const items = ids.map(id => allItems.find(item => item.id === id)).filter(Boolean) as MenuItem[];
                setListItems(items);
            }
        } catch {
            setListItems([]);
        }
    };

    useEffect(() => {
        if (isOpen) {
            // eslint-disable-next-line react-hooks/set-state-in-effect
            loadItems();
        }
    }, [isOpen]);

    const removeItem = (id: string) => {
        const nextItems = listItems.filter(item => item.id !== id);
        setListItems(nextItems);
        
        try {
            const nextIds = nextItems.map(item => item.id);
            window.localStorage.setItem(LIST_KEY, JSON.stringify(nextIds));
            // Dispatch event for other components to update
            window.dispatchEvent(new Event("cart-updated"));
        } catch (e) {
            console.error("Failed to update list", e);
        }
    };
    
    const totalPrice = listItems.reduce((sum, item) => sum + item.price, 0);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const sendOrder = () => {
        if (listItems.length === 0) return;
        
        const message = `Halo, saya mau pesan:\n${listItems.map(item => `- ${item.name}`).join("\n")}\n\nTotal: ${formatPrice(totalPrice)}`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`; // Add phone number if available
        window.open(whatsappUrl, '_blank');
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-w-md w-full md:w-120 bg-card border-t md:border border-border rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col h-[80vh] md:h-[70vh]"
                    >
                         {/* Drag Handle (Mobile) */}
                         <div className="md:hidden w-full flex justify-center pt-3 pb-1 absolute top-0 z-20 pointer-events-none">
                            <div className="w-12 h-1.5 rounded-full bg-border/80 backdrop-blur-sm" />
                        </div>

                        <div className="p-6 border-b border-border bg-card relative">
                            <h2 className="text-xl font-bold text-foreground">Your List</h2>
                            <button
                                onClick={onClose}
                                className="absolute top-1/2 -translate-y-1/2 right-4 p-2 text-muted-foreground hover:text-foreground"
                            >
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <line x1="18" y1="6" x2="6" y2="18"></line>
                                    <line x1="6" y1="6" x2="18" y2="18"></line>
                                </svg>
                            </button>
                        </div>

                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/30">
                            {listItems.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground space-y-2">
                                    <p>Your list is empty</p>
                                    <button onClick={onClose} className="text-primary hover:underline text-sm">Browse Menu</button>
                                </div>
                            ) : (
                                listItems.map((item) => (
                                    <motion.div 
                                        layout
                                        key={item.id}
                                        className="flex items-center gap-4 p-3 bg-card rounded-xl border border-border shadow-sm"
                                    >
                                        {/* Simple Image Thumbnail */}
                                        <div className="w-16 h-16 rounded-lg bg-secondary/50 overflow-hidden relative shrink-0">
                                            {item.image && (
                                                <img 
                                                    src={item.image} 
                                                    alt={item.name} 
                                                    className="w-full h-full object-cover"
                                                />
                                            )}
                                        </div>
                                        
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-medium text-foreground truncate">{item.name}</h4>
                                            <p className="text-primary font-semibold text-sm">{formatPrice(item.price)}</p>
                                        </div>

                                        <button
                                            onClick={() => removeItem(item.id)}
                                            className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-5 h-5" />
                                        </button>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        <div className="p-6 border-t border-border bg-card space-y-4">
                            <div className="flex justify-between items-end">
                                <span className="text-muted-foreground">Total items: {listItems.length}</span>
                                <span className="text-2xl font-bold text-primary">{formatPrice(totalPrice)}</span>
                            </div>
                            <button
                                onClick={sendOrder}
                                disabled={listItems.length === 0}
                                className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Order via WhatsApp
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
