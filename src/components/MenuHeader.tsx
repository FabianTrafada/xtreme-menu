"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MenuHeader() {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const hours = now.getHours();
            const isRestaurantOpen = hours >= 10 || hours < 1;
            setIsOpen(isRestaurantOpen);
        };

        checkStatus();
        const timer = setInterval(checkStatus, 60000);
        return () => clearInterval(timer);
    }, []);

    return (
        <div className="relative w-full h-[45vh] min-h-[300px] flex items-center justify-center overflow-hidden">
            {/* Background Image with Parallax-ish feel */}
            <div className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Restaurant Ambiance"
                    fill
                    className="object-cover opacity-90"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/20 to-black/60" />
            </div>

            {/* Content Card - Liquid Glass */}
            <div className="relative z-10 text-center space-y-6 px-10 py-10 max-w-xl mx-4 bg-black/20 backdrop-blur-xl border border-white/10 rounded-[3rem] shadow-[0_8px_32px_0_rgba(0,0,0,0.36)] ring-1 ring-white/20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: "easeOut" }}
                    className="space-y-4"
                >
                    <div className="inline-block p-1.5 rounded-full border border-white/20 backdrop-blur-sm bg-black/30 mb-2 shadow-xl">
                        <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-primary-foreground font-serif font-bold text-3xl shadow-lg border border-white/10">
                            X
                        </div>
                    </div>

                    <h1 className="text-4xl md:text-5xl font-bold tracking-tighter text-white drop-shadow-md">
                        XTREME <span className="text-primary">MENU</span>
                    </h1>

                    <p className="text-white/90 font-light text-sm md:text-base leading-relaxed drop-shadow-sm max-w-xs mx-auto">
                        Premium Billiard Experience & Delicious Eats.
                    </p>
                </motion.div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3, duration: 0.5 }}
                    className={`
            inline-flex items-center gap-2.5 px-5 py-2.5 rounded-full backdrop-blur-md border shadow-lg
            ${isOpen
                            ? "bg-green-950/60 border-green-500/40 text-green-300"
                            : "bg-red-950/60 border-red-500/40 text-red-300"
                        }
          `}
                >
                    <span className={`w-2 h-2 rounded-full ${isOpen ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                    <span className="text-xs font-semibold tracking-wide uppercase">
                        {isOpen ? "Open Now" : "Closed"}
                    </span>
                    <span className="text-[10px] opacity-70 border-l border-white/20 pl-2 ml-1 text-white/80">
                        10 AM - 1 AM
                    </span>
                </motion.div>

                {/* Location Button */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                >
                    <a
                        href="https://www.google.com/maps/search/?api=1&query=X-treme+Shoot+Billiard+%26+Cafe+J63W%2BH3R+Jl.+Profesor+DR.+HR+Boenyamin+Dukuhbandong+Grendeng+Purwokerto+Utara+Banyumas+Jawa+Tengah"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 transition-colors text-white/90 hover:text-white text-xs font-medium"
                    >
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
                            <circle cx="12" cy="10" r="3" />
                        </svg>
                        View Location
                    </a>
                </motion.div>
            </div>
        </div>
    );
}
