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
        }).format(price);
    };

    return (
        <motion.div
            onClick={onClick}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            whileHover={{ y: -5, scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
            className="group relative overflow-hidden p-3 rounded-xl bg-card border border-border/60 hover:border-primary/40 shadow-sm hover:shadow-xl transition-all flex flex-col gap-3 cursor-pointer h-full"
        >
            {item.image ? (
                <div className="w-full aspect-[4/3] relative rounded-lg overflow-hidden border border-border/50 bg-secondary/30">
                    <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                        className="object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                </div>
            ) : null}

            <div className="flex-1 flex flex-col justify-between">
                <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                        <h3 className="font-medium text-base leading-snug text-foreground group-hover:text-primary transition-colors duration-300 line-clamp-2">
                            {item.name}
                        </h3>
                    </div>
                    {item.popular && (
                        <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-primary border border-primary/20 px-1.5 py-0.5 rounded-sm bg-primary/5">
                            Popular
                        </span>
                    )}
                    {item.description && (
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 group-hover:text-muted-foreground/80">
                            {item.description}
                        </p>
                    )}
                </div>

                <div className="font-semibold text-primary text-right mt-3 text-sm sm:text-base">
                    {formatPrice(item.price)}
                </div>
            </div>

            {/* Decorative gradient on hover */}
            <div className="absolute inset-0 bg-gradient-to-t from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
        </motion.div>
    );
}
