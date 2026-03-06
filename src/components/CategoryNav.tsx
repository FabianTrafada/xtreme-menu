"use client";

import { Category } from "@/data/menu";
import { motion } from "framer-motion";

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
    return (
        <div className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-xl border-b border-white/5 py-4 overflow-hidden">
            <div className="flex gap-2 overflow-x-auto no-scrollbar px-6 md:justify-center items-center">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className={`relative px-5 py-2.5 flex-shrink-0 transition-all duration-500 group`}
                        >
                            <span className={`relative z-10 text-xs font-bold tracking-[0.15em] uppercase ${isActive ? "text-black" : "text-white/50 group-hover:text-white"}`}>
                                {category.name}
                            </span>
                            
                            {isActive && (
                                <motion.div
                                    layoutId="activePill"
                                    className="absolute inset-0 bg-primary skew-x-[-12deg]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            
                            {!isActive && (
                                <div className="absolute inset-0 border border-white/10 skew-x-[-12deg] group-hover:border-white/30 transition-colors" />
                            )}
                        </button>
                    );
                })}
            </div>
            <div className="absolute bottom-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-50" />
        </div>
    );
}
