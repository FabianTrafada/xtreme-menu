"use client";

import Image from "next/image";
import { MenuItem } from "@/data/menu";
import { motion } from "framer-motion";

export default function MenuItemCard({ item, onClick }: { item: MenuItem; onClick?: () => void }) {
    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            minimumFractionDigits: 0,
        }).format(price).replace("Rp", "");
    };

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -4 }}
            className="group relative bg-[#0a0a0a] border border-white/5 overflow-hidden cursor-pointer"
        >
            {/* Image Section */}
            <div className="relative aspect-[4/3] overflow-hidden bg-white/5">
                {item.image ? (
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        className="object-cover transition-transform duration-700 group-hover:scale-110 grayscale-[30%] group-hover:grayscale-0"
                    />
                ) : (
                    <div className="absolute inset-0 flex items-center justify-center text-white/10 font-display text-4xl font-bold">
                        XM
                    </div>
                )}
                
                {/* Popular Badge */}
                {item.popular && (
                    <div className="absolute top-0 right-0 bg-primary text-black text-[10px] font-bold tracking-widest uppercase px-3 py-1 z-10">
                        Star
                    </div>
                )}

                {/* Overlay Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />
            </div>

            {/* Content Section */}
            <div className="relative p-5 -mt-8">
                <div className="flex justify-between items-end mb-2">
                    <h3 className="font-display text-lg leading-tight text-white group-hover:text-primary transition-colors duration-300 w-3/4">
                        {item.name}
                    </h3>
                    <span className="font-mono text-primary text-lg">
                        <span className="text-xs align-top opacity-50 mr-1">IDR</span>
                        {formatPrice(item.price)}
                    </span>
                </div>
                
                <p className="text-xs text-white/40 font-body leading-relaxed line-clamp-2 mb-4 group-hover:text-white/70 transition-colors">
                    {item.description || "Premium selection, chef's recommendation."}
                </p>

                {/* Add Button Mockup */}
                <div className="w-full h-[1px] bg-white/10 group-hover:bg-primary/50 transition-colors mt-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary w-0 group-hover:w-full transition-all duration-500 ease-out" />
                </div>
                <div className="flex justify-between items-center mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform translate-y-2 group-hover:translate-y-0">
                    <span className="text-[10px] uppercase tracking-widest text-primary">Add to Order</span>
                    <span className="text-primary text-lg leading-none">+</span>
                </div>
            </div>
        </motion.div>
    );
}
