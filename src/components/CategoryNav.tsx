"use client";
import { Category } from "@/data/menu";
import { motion } from "framer-motion";
import { useEffect, useRef } from "react";

interface CategoryNavProps {
    categories: Category[];
    activeCategory: string;
    onSelectCategory: (id: string) => void;
}

export default function CategoryNav({ categories, activeCategory, onSelectCategory }: CategoryNavProps) {
    const navRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (activeCategory && navRef.current) {
            const activeBtn = navRef.current.querySelector(`button[data-id="${activeCategory}"]`) as HTMLElement;
            if (activeBtn) {
                activeBtn.scrollIntoView({
                    behavior: "smooth",
                    block: "nearest",
                    inline: "center"
                });
            }
        }
    }, [activeCategory]);

    return (
        <div ref={navRef} className="sticky top-0 z-40 bg-background/80 backdrop-blur-lg border-b border-border overflow-x-auto no-scrollbar py-3">
            <div className="flex px-6 gap-3 min-w-max">
                {categories.map((category) => {
                    const isActive = activeCategory === category.id;
                    return (
                        <button
                            key={category.id}
                            data-id={category.id}
                            onClick={() => onSelectCategory(category.id)}
                            className={`
                relative px-5 py-2 rounded-full text-sm font-medium transition-colors duration-300 z-10
                ${isActive ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"}
              `}
                        >
                            {isActive && (
                                <motion.div
                                    layoutId="activeTab"
                                    className="absolute inset-0 bg-primary rounded-full -z-10 shadow-[0_0_15px_rgba(212,175,55,0.4)]"
                                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                                />
                            )}
                            {category.name}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
