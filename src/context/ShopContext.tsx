"use client";

import { MenuItem } from "@/data/menu";
import { createContext, useContext, useEffect, useState, ReactNode } from "react";

export interface CartItem {
    item: MenuItem;
    quantity: number;
    notes?: string;
}

interface ShopContextType {
    cart: CartItem[];
    favorites: string[]; // Storing IDs of favorite items
    addToCart: (item: MenuItem, quantity?: number, notes?: string) => void;
    removeFromCart: (itemId: string) => void;
    updateQuantity: (itemId: string, quantity: number) => void;
    clearCart: () => void;
    toggleFavorite: (itemId: string) => void;
    isFavorite: (itemId: string) => boolean;
    cartTotal: number;
    cartCount: number;
    isLoaded: boolean;
}

const ShopContext = createContext<ShopContextType | undefined>(undefined);

export function ShopProvider({ children }: { children: ReactNode }) {
    const [cart, setCart] = useState<CartItem[]>([]);
    const [favorites, setFavorites] = useState<string[]>([]);
    const [isLoaded, setIsLoaded] = useState(false);

    // Load from localStorage on mount
    useEffect(() => {
        try {
            const savedCart = localStorage.getItem("xtreme-cart");
            const savedFavorites = localStorage.getItem("xtreme-favorites");

            if (savedCart) {
                setCart(JSON.parse(savedCart));
            }
            if (savedFavorites) {
                setFavorites(JSON.parse(savedFavorites));
            }
        } catch (error) {
            console.error("Failed to load shop data from localStorage:", error);
        } finally {
            setIsLoaded(true);
        }
    }, []);

    // Save to localStorage whenever cart changes
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("xtreme-cart", JSON.stringify(cart));
        }
    }, [cart, isLoaded]);

    // Save to localStorage whenever favorites change
    useEffect(() => {
        if (isLoaded) {
            localStorage.setItem("xtreme-favorites", JSON.stringify(favorites));
        }
    }, [favorites, isLoaded]);

    const addToCart = (item: MenuItem, quantity = 1, notes = "") => {
        setCart((prev) => {
            const existingItemIndex = prev.findIndex((i) => i.item.id === item.id);
            if (existingItemIndex > -1) {
                const newCart = [...prev];
                newCart[existingItemIndex] = {
                    ...newCart[existingItemIndex],
                    quantity: newCart[existingItemIndex].quantity + quantity,
                    notes: notes || newCart[existingItemIndex].notes
                };
                return newCart;
            } else {
                return [...prev, { item, quantity, notes }];
            }
        });
    };

    const removeFromCart = (itemId: string) => {
        setCart((prev) => prev.filter((i) => i.item.id !== itemId));
    };

    const updateQuantity = (itemId: string, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(itemId);
            return;
        }
        setCart((prev) =>
            prev.map((i) => (i.item.id === itemId ? { ...i, quantity } : i))
        );
    };

    const clearCart = () => {
        setCart([]);
    };

    const toggleFavorite = (itemId: string) => {
        setFavorites((prev) => {
            if (prev.includes(itemId)) {
                return prev.filter((id) => id !== itemId);
            } else {
                return [...prev, itemId];
            }
        });
    };

    const isFavorite = (itemId: string) => favorites.includes(itemId);

    const cartTotal = cart.reduce((total, { item, quantity }) => total + item.price * quantity, 0);
    const cartCount = cart.reduce((count, { quantity }) => count + quantity, 0);

    return (
        <ShopContext.Provider
            value={{
                cart,
                favorites,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                toggleFavorite,
                isFavorite,
                cartTotal,
                cartCount,
                isLoaded,
            }}
        >
            {children}
        </ShopContext.Provider>
    );
}

export function useShop() {
    const context = useContext(ShopContext);
    if (context === undefined) {
        throw new Error("useShop must be used within a ShopProvider");
    }
    return context;
}
