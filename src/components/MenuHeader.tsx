"use client";

import { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";

export default function MenuHeader() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        const checkStatus = () => {
            const now = new Date();
            const hours = now.getHours();
            setIsOpen(hours >= 10 || hours < 1);
        };
        checkStatus();
    }, []);

    return (
        <div className="relative w-full h-[70vh] min-h-[500px] overflow-hidden flex flex-col justify-end pb-12 px-6 md:px-12">
            {/* Parallax Background */}
            <motion.div style={{ y: y1 }} className="absolute inset-0 z-0">
                <Image
                    src="/hero-bg.png"
                    alt="Background"
                    fill
                    className="object-cover opacity-60 grayscale-[20%] contrast-125"
                    priority
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
                <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
            </motion.div>

            {/* Content */}
            <motion.div style={{ opacity }} className="relative z-10 max-w-4xl">
                <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: "100px" }} 
                    transition={{ duration: 1, delay: 0.2 }}
                    className="h-1 bg-primary mb-6"
                />
                
                <motion.h1 
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ duration: 0.8, ease: "circOut" }}
                    className="text-6xl md:text-8xl lg:text-9xl font-black tracking-tighter text-white leading-[0.85] mb-4"
                >
                    X-TREME <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-br from-[#FBD786] via-[#C6A059] to-[#87642E]">
                        MENU
                    </span>
                </motion.h1>

                <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="flex flex-col md:flex-row gap-6 md:items-center mt-8"
                >
                    <div className="flex items-center gap-3 backdrop-blur-md bg-white/5 border border-white/10 px-4 py-2 rounded-none">
                        <div className={`w-2 h-2 ${isOpen ? "bg-green-500 animate-pulse" : "bg-red-500"}`} />
                        <span className="text-xs font-mono uppercase tracking-widest text-white/80">
                            {isOpen ? "Open for Service" : "Closed Now"}
                        </span>
                    </div>

                    <p className="text-white/60 font-body text-sm max-w-md leading-relaxed border-l border-white/20 pl-4">
                        Premium billiards meets culinary excellence. <br/>
                        Purwokerto's finest dining experience.
                    </p>
                </motion.div>
            </motion.div>

            {/* Decorative Elements */}
            <div className="absolute top-0 right-0 p-8 opacity-20 hidden md:block">
                <div className="w-32 h-32 border border-white rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                    <div className="w-2 h-2 bg-white rounded-full absolute top-0" />
                    <div className="w-2 h-2 bg-white rounded-full absolute bottom-0" />
                    <div className="w-2 h-2 bg-white rounded-full absolute left-0" />
                    <div className="w-2 h-2 bg-white rounded-full absolute right-0" />
                </div>
            </div>
        </div>
    );
}
