"use client";

import { useShop } from "@/context/ShopContext";
import { ShoppingCart } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import CartSheet from "./CartSheet";

export default function FloatingCart() {
    const { cartCount, cartTotal, isLoaded } = useShop();
    const [isSheetOpen, setIsSheetOpen] = useState(false);

    if (!isLoaded) return null;

    const isVisible = cartCount > 0;

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <>
            <AnimatePresence>
                {isVisible && (
                    <motion.div
                        initial={{ y: 100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4"
                    >
                        <div 
                            onClick={() => setIsSheetOpen(true)}
                            className="bg-primary text-primary-foreground p-4 rounded-2xl shadow-xl flex items-center justify-between cursor-pointer hover:bg-primary/90 transition-colors"
                        >
                            <div className="flex items-center gap-3">
                                <div className="bg-white/20 p-2 rounded-lg relative">
                                    <ShoppingCart className="w-6 h-6" />
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center border border-primary">
                                        {cartCount}
                                    </span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-xs font-medium opacity-90">Total Order</span>
                                    <span className="font-bold text-lg leading-none">{formatPrice(cartTotal)}</span>
                                </div>
                            </div>
                            <div className="text-sm font-semibold bg-white/20 px-4 py-2 rounded-lg">
                                View Cart
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <CartSheet 
                isOpen={isSheetOpen} 
                onClose={() => setIsSheetOpen(false)} 
            />
        </>
    );
}
