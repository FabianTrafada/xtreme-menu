"use client";

import { useState, useEffect, useMemo } from "react";
import { useMenu } from "@/context/MenuContext";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import ScrollToTop from "@/components/ScrollToTop";
import MenuItemDetail from "@/components/MenuItemDetail";
import SearchFilter from "@/components/SearchFilter";
import FloatingCart from "@/components/FloatingCart";
import { MenuItem } from "@/data/menu";
import { motion } from "framer-motion";

export default function Home() {
  const { categories: menuData, isLoading } = useMenu();
  const [activeCategory, setActiveCategory] = useState("");

  useEffect(() => {
    if (menuData.length > 0 && !activeCategory) {
      setActiveCategory(menuData[0].id);
    }
  }, [menuData, activeCategory]);

  const [isManualScroll, setIsManualScroll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  const filteredMenuData = useMemo(() => {
    if (!menuData) return [];
    return menuData.map((category) => {
      const filteredItems = category.items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterType === "all" || (filterType === "popular" && item.popular);
        return matchesSearch && matchesFilter;
      });
      return { ...category, items: filteredItems };
    }).filter((category) => category.items.length > 0);
  }, [menuData, searchQuery, filterType]);

  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    setIsManualScroll(true);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 100;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;
      window.scrollTo({ top: offsetPosition, behavior: "smooth" });
      setTimeout(() => setIsManualScroll(false), 1000);
    }
  };

  useEffect(() => {
    if (isManualScroll) return;
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 200;
      for (const category of filteredMenuData) {
        const element = document.getElementById(category.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (scrollPosition >= offsetTop && scrollPosition < offsetTop + offsetHeight) {
            if (activeCategory !== category.id) setActiveCategory(category.id);
            break;
          }
        }
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, isManualScroll, filteredMenuData]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-background flex items-center justify-center">
        <div className="text-primary font-display text-2xl tracking-widest animate-pulse">XTREME LOADING...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground pb-32">
      <MenuHeader />

      <div className="sticky top-0 z-50">
          <CategoryNav
            categories={filteredMenuData}
            activeCategory={activeCategory}
            onSelectCategory={scrollToCategory}
          />
          <div className="bg-background/95 backdrop-blur-md border-b border-white/5 py-2 px-6">
             <SearchFilter onSearch={setSearchQuery} onFilterChange={setFilterType} />
          </div>
      </div>

      <main className="px-4 md:px-8 py-12 max-w-7xl mx-auto space-y-24">
        {filteredMenuData.length > 0 ? (
          filteredMenuData.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-32">
              <div className="flex items-end gap-4 mb-8 border-b border-white/10 pb-4">
                  <h2 className="text-4xl md:text-5xl font-display font-bold text-white uppercase tracking-tighter">
                    {category.name}
                  </h2>
                  <span className="text-white/30 font-mono text-sm mb-2">
                    0{category.items.length}
                  </span>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {category.items.map((item) => (
                  <MenuItemCard
                    key={item.id}
                    item={item}
                    onClick={() => setSelectedItem(item)}
                  />
                ))}
              </div>
            </section>
          ))
        ) : (
          <div className="text-center py-32">
            <p className="text-2xl font-display text-white/20">NO RESULTS FOUND</p>
          </div>
        )}
      </main>

      <ScrollToTop />
      <MenuItemDetail item={selectedItem} onClose={() => setSelectedItem(null)} />
      <FloatingCart />
    </div>
  );
}
