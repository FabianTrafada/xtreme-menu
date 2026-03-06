"use client";

import { useShop } from "@/context/ShopContext";
import { Minus, Plus, Trash2, X } from "lucide-react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";

interface CartSheetProps {
    isOpen: boolean;
    onClose: () => void;
}

function useMediaQuery(query: string) {
    const [matches, setMatches] = useState(false);

    useEffect(() => {
        const media = window.matchMedia(query);
        if (media.matches !== matches) {
            setMatches(media.matches);
        }
        const listener = () => setMatches(media.matches);
        media.addEventListener("change", listener);
        return () => media.removeEventListener("change", listener);
    }, [matches, query]);

    return matches;
}

export default function CartSheet({ isOpen, onClose }: CartSheetProps) {
    const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useShop();
    const isDesktop = useMediaQuery("(min-width: 768px)");
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const [showCheckoutForm, setShowCheckoutForm] = useState(false);
    const [tableNumber, setTableNumber] = useState("");
    const [customerName, setCustomerName] = useState("");

    const handleCheckout = async () => {
        if (cart.length === 0) return;
        if (!tableNumber.trim()) return;
        setIsCheckingOut(true);

        try {
            const orderId = `XTREME-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
            const res = await fetch("/api/payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    orderId,
                    grossAmount: cartTotal,
                    tableNumber: tableNumber.trim(),
                    customerName: customerName.trim() || "Guest",
                    items: cart.map((c) => ({
                        name: c.item.name,
                        price: c.item.price,
                        quantity: c.quantity,
                    })),
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Failed to create transaction");

            // Close the cart sheet before showing Snap popup
            setShowCheckoutForm(false);
            setTableNumber("");
            setCustomerName("");
            onClose();

            window.snap.pay(data.token, {
                onSuccess: async () => {
                    // Update order status to paid in our DB
                    try {
                        await fetch(`/api/orders/${orderId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "paid" }),
                        });
                    } catch (e) {
                        console.error("Failed to update order status:", e);
                    }
                    clearCart();
                    toast.success("Payment successful! Thank you for your order.");
                },
                onPending: async () => {
                    toast.loading("Payment pending. Please complete your payment.", { duration: 4000 });
                },
                onError: async () => {
                    try {
                        await fetch(`/api/orders/${orderId}`, {
                            method: "PATCH",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ status: "cancelled" }),
                        });
                    } catch (e) {
                        console.error("Failed to update order status:", e);
                    }
                    toast.error("Payment failed. Please try again.");
                },
                onClose: () => {
                    // User closed the popup without finishing payment
                },
            });
        } catch (error) {
            console.error("Checkout error:", error);
            toast.error("Failed to initiate payment. Please try again.");
        } finally {
            setIsCheckingOut(false);
        }
    };

    // Prevent body scroll when sheet is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    const variants = isDesktop ? {
        initial: { x: "100%", opacity: 0 },
        animate: { x: 0, opacity: 1 },
        exit: { x: "100%", opacity: 0 }
    } : {
        initial: { y: "100%" },
        animate: { y: 0 },
        exit: { y: "100%" }
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

                    {/* Sheet / Sidebar */}
                    <motion.div
                        variants={variants}
                        initial="initial"
                        animate="animate"
                        exit="exit"
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className={`
                            fixed z-50 bg-card shadow-2xl overflow-hidden flex flex-col
                            
                            /* Mobile Styles (Bottom Sheet) */
                            inset-x-0 bottom-0 rounded-t-3xl max-h-[90vh]
                            
                            /* Desktop Styles (Right Sidebar) */
                            md:inset-y-0 md:right-0 md:left-auto md:bottom-auto md:w-[450px] md:max-h-none md:h-full md:rounded-none md:border-l md:border-border
                        `}
                    >
                        {/* Drag Handle (Mobile Visual Only) */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1 absolute top-0 z-20 pointer-events-none">
                            <div className="w-12 h-1.5 rounded-full bg-border/80 backdrop-blur-sm" />
                        </div>

                        {/* Header */}
                        <div className="px-6 pt-14 pb-6 md:pt-8 border-b border-border flex items-center justify-between bg-card z-10">
                            <h2 className="text-2xl font-bold">My Cart ({cart.length})</h2>
                            <div className="flex items-center gap-4">
                                {cart.length > 0 && (
                                    <button 
                                        onClick={clearCart}
                                        className="text-sm text-red-500 font-medium hover:text-red-600 px-3 py-1.5 hover:bg-red-50 rounded-lg transition-colors"
                                    >
                                        Clear All
                                    </button>
                                )}
                                <button 
                                    onClick={onClose}
                                    className="hidden md:flex p-2 hover:bg-secondary rounded-full transition-colors"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Cart Items */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 overscroll-contain">
                            {cart.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 text-muted-foreground">
                                    <div className="w-20 h-20 bg-secondary/50 rounded-full flex items-center justify-center">
                                        <Trash2 className="w-10 h-10 opacity-50" />
                                    </div>
                                    <div>
                                        <p className="font-semibold text-lg">Your cart is empty</p>
                                        <p className="text-sm opacity-70">Add some delicious items to get started!</p>
                                    </div>
                                </div>
                            ) : (
                                cart.map((cartItem) => (
                                    <motion.div 
                                        layout
                                        key={cartItem.item.id}
                                        className="group bg-card border border-border/50 rounded-3xl p-4 flex gap-4 shadow-sm hover:shadow-md transition-all duration-300 hover:border-primary/20"
                                    >
                                        {/* Image */}
                                        <div className="relative w-24 h-24 shrink-0 bg-secondary rounded-2xl overflow-hidden shadow-inner">
                                            {cartItem.item.image ? (
                                                <Image
                                                    src={cartItem.item.image}
                                                    alt={cartItem.item.name}
                                                    fill
                                                    className="object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-secondary text-muted-foreground text-xs">
                                                    No Image
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col justify-between min-w-0 py-1">
                                            <div>
                                                <h3 className="font-bold text-foreground line-clamp-1 text-base mb-1">
                                                    {cartItem.item.name}
                                                </h3>
                                                <p className="text-primary font-bold text-base">
                                                    {formatPrice(cartItem.item.price)}
                                                </p>
                                            </div>

                                            {/* Quantity Controls */}
                                            <div className="flex items-center justify-between mt-3">
                                                <div className="flex items-center gap-3 bg-secondary/30 rounded-xl p-1.5 border border-border/50">
                                                    <button
                                                        onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity - 1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-background rounded-lg text-foreground shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50"
                                                    >
                                                        <Minus className="w-3.5 h-3.5" />
                                                    </button>
                                                    <span className="font-bold text-sm w-6 text-center tabular-nums">
                                                        {cartItem.quantity}
                                                    </span>
                                                    <button
                                                        onClick={() => updateQuantity(cartItem.item.id, cartItem.quantity + 1)}
                                                        className="w-7 h-7 flex items-center justify-center bg-primary text-primary-foreground rounded-lg shadow-sm hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
                                                    >
                                                        <Plus className="w-3.5 h-3.5" />
                                                    </button>
                                                </div>
                                                
                                                <button
                                                    onClick={() => removeFromCart(cartItem.item.id)}
                                                    className="p-2 text-muted-foreground hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </div>

                        {/* Footer Summary */}
                        {cart.length > 0 && (
                            <div className="p-6 bg-card border-t border-border space-y-4 pb-12 md:pb-8">
                                <div className="flex justify-between items-center text-lg">
                                    <span className="text-muted-foreground">Total Payment</span>
                                    <span className="font-bold text-primary text-lg">
                                        {formatPrice(cartTotal)}
                                    </span>
                                </div>

                                {showCheckoutForm ? (
                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Table Number <span className="text-red-500">*</span></label>
                                            <input
                                                type="text"
                                                value={tableNumber}
                                                onChange={(e) => setTableNumber(e.target.value)}
                                                placeholder="e.g. 5, VIP-1"
                                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                                autoFocus
                                            />
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-muted-foreground mb-1 block">Your Name <span className="text-muted-foreground/50">(optional)</span></label>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                placeholder="e.g. Budi"
                                                className="w-full px-4 py-3 rounded-xl bg-secondary/50 border border-border text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-colors"
                                            />
                                        </div>
                                        <div className="flex gap-3 pt-1">
                                            <button
                                                onClick={() => setShowCheckoutForm(false)}
                                                className="flex-1 py-3 rounded-xl border border-border font-semibold text-muted-foreground hover:bg-secondary transition-colors"
                                            >
                                                Back
                                            </button>
                                            <button
                                                onClick={handleCheckout}
                                                disabled={isCheckingOut || !tableNumber.trim()}
                                                className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                {isCheckingOut ? "Processing..." : "Pay Now"}
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setShowCheckoutForm(true)}
                                        className="w-full py-3.5 bg-primary text-primary-foreground rounded-xl font-bold text-lg hover:bg-primary/90 transition-colors active:scale-[0.99]"
                                    >
                                        Checkout
                                    </button>
                                )}
                            </div>
                        )}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
