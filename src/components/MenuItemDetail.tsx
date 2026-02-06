"use client";

import { MenuItem } from "@/data/menu";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { Heart, Minus, Plus, ShoppingCart } from "lucide-react";
import { useEffect, useState } from "react";
import { useShop } from "@/context/ShopContext";

interface MenuItemDetailProps {
    item: MenuItem | null;
    onClose: () => void;
}

export default function MenuItemDetail({ item, onClose }: MenuItemDetailProps) {
    const { addToCart, toggleFavorite, isFavorite } = useShop();
    const [quantity, setQuantity] = useState(1);

    // Reset quantity when item changes
    useEffect(() => {
        setQuantity(1);
    }, [item]);

    // Prevent body scroll when modal is open
    useEffect(() => {
        if (item) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [item]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price);
    };

    return (
        <AnimatePresence>
            {item && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                    />

                    {/* Modal / Bottom Sheet */}
                    <motion.div
                        initial={{ y: "100%" }}
                        animate={{ y: 0 }}
                        exit={{ y: "100%" }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2 z-50 max-w-md w-full md:w-120 bg-card border-t md:border border-border rounded-t-3xl md:rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] md:max-h-[85vh]"
                    >
                        {/* Drag Handle (Mobile Visual Only) */}
                        <div className="md:hidden w-full flex justify-center pt-3 pb-1 absolute top-0 z-20">
                            <div className="w-12 h-1.5 rounded-full bg-border/80 backdrop-blur-sm" />
                        </div>

                        {/* Close Button */}
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/20 text-white backdrop-blur-md hover:bg-black/40 transition-colors"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="18" y1="6" x2="6" y2="18"></line>
                                <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                        </button>

                        {/* Image */}
                        {item.image && (
                            <div className="relative w-full aspect-video shrink-0 bg-secondary/30">
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    sizes="(max-width: 768px) 100vw, 480px"
                                    className="object-cover"
                                />
                                {/* Gradient Overlay for better text contrast if needed, mostly for aesthetics */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-30 md:hidden" />
                            </div>
                        )}

                        {/* Content */}
                        <div className="p-6 overflow-y-auto overscroll-contain flex-1 bg-card">
                            <div className="flex justify-between items-start gap-4 mb-2">
                                <h3 className="text-2xl font-bold text-foreground leading-tight">
                                    {item.name}
                                </h3>
                                {item.popular && (
                                    <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 px-2 py-1 rounded-full bg-primary/10">
                                        Popular
                                    </span>
                                )}
                            </div>

                            <div className="text-xl font-semibold text-primary mb-4">
                                {formatPrice(item.price)}
                            </div>

                            {item.description && (
                                <div className="space-y-4">
                                    <p className="text-muted-foreground leading-relaxed text-base">
                                        {item.description}
                                    </p>
                                </div>
                            )}

                            {item.ingredients && (
                                <div className="mt-6">
                                    <h4 className="text-sm font-semibold text-foreground mb-3 uppercase tracking-wider">
                                        Ingredients
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {item.ingredients.map((ingredient, index) => (
                                            <span 
                                                key={index}
                                                className="px-3 py-1 bg-secondary/50 text-secondary-foreground rounded-full text-sm font-medium"
                                            >
                                                {ingredient}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div className="p-6 border-t border-border bg-card flex flex-col gap-4 z-10">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3 bg-secondary/30 rounded-lg p-1">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="p-2 hover:bg-secondary rounded-md transition-colors disabled:opacity-50"
                                        disabled={quantity <= 1}
                                    >
                                        <Minus className="w-4 h-4" />
                                    </button>
                                    <span className="font-semibold w-8 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="p-2 hover:bg-secondary rounded-md transition-colors"
                                    >
                                        <Plus className="w-4 h-4" />
                                    </button>
                                </div>
                                <div className="text-lg font-bold text-primary">
                                    {item && formatPrice(item.price * quantity)}
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => item && toggleFavorite(item.id)}
                                    className={`p-3.5 rounded-xl border transition-colors active:scale-95 flex items-center justify-center ${
                                        item && isFavorite(item.id)
                                            ? "border-red-500 bg-red-50 text-red-500"
                                            : "border-border text-muted-foreground hover:bg-secondary hover:text-foreground"
                                    }`}
                                >
                                    <Heart
                                        className="h-5 w-5"
                                        fill={item && isFavorite(item.id) ? "currentColor" : "none"}
                                    />
                                </button>

                                <button
                                    onClick={() => {
                                        if (item) {
                                            addToCart(item, quantity);
                                            onClose();
                                        }
                                    }}
                                    className="flex-1 py-3.5 rounded-xl bg-primary text-primary-foreground font-semibold text-lg hover:bg-primary/90 transition-colors active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    <ShoppingCart className="w-5 h-5" />
                                    Add to Cart
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
