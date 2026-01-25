"use client";

import { useState, useEffect, useMemo } from "react";
import { menuData } from "@/data/menu";
import MenuHeader from "@/components/MenuHeader";
import CategoryNav from "@/components/CategoryNav";
import MenuItemCard from "@/components/MenuItemCard";
import ScrollToTop from "@/components/ScrollToTop";
import MenuItemDetail from "@/components/MenuItemDetail";
import SearchFilter from "@/components/SearchFilter";
import { MenuItem, Category } from "@/data/menu";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState(menuData[0].id);
  const [isManualScroll, setIsManualScroll] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterType, setFilterType] = useState("all");

  // Filter menu data
  const filteredMenuData = useMemo(() => {
    return menuData.map((category) => {
      const filteredItems = category.items.filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          item.description?.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter =
          filterType === "all" || (filterType === "popular" && item.popular);

        return matchesSearch && matchesFilter;
      });

      return {
        ...category,
        items: filteredItems,
      };
    }).filter((category) => category.items.length > 0);
  }, [searchQuery, filterType]);

  // Handle manual click navigation
  const scrollToCategory = (id: string) => {
    setActiveCategory(id);
    setIsManualScroll(true);
    const element = document.getElementById(id);
    if (element) {
      const headerOffset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.scrollY - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });

      // Re-enable scroll spy after animation (approx 1s)
      setTimeout(() => setIsManualScroll(false), 1000);
    }
  };

  // Scroll Spy Effect
  useEffect(() => {
    if (isManualScroll) return;

    let lastRun = 0;
    const throttleDelay = 100;

    const handleScroll = () => {
      const now = Date.now();
      if (now - lastRun < throttleDelay) return;
      lastRun = now;

      // 1. Check if we are at the bottom of the page
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 50
      ) {
        if (filteredMenuData.length > 0) {
          const lastCategory = filteredMenuData[filteredMenuData.length - 1];
          if (activeCategory !== lastCategory.id) {
            setActiveCategory(lastCategory.id);
          }
        }
        return;
      }

      const scrollPosition = window.scrollY + 200; // Offset for detection

      // 2. Find the current section
      for (const category of filteredMenuData) {
        const element = document.getElementById(category.id);
        if (element) {
          const { offsetTop, offsetHeight } = element;
          if (
            scrollPosition >= offsetTop &&
            scrollPosition < offsetTop + offsetHeight
          ) {
            if (activeCategory !== category.id) {
              setActiveCategory(category.id);
            }
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [activeCategory, isManualScroll, filteredMenuData]);

  return (
    <div className="min-h-screen bg-background text-foreground pb-20">
      <MenuHeader />

      <SearchFilter
        onSearch={setSearchQuery}
        onFilterChange={setFilterType}
      />

      <CategoryNav
        categories={filteredMenuData}
        activeCategory={activeCategory}
        onSelectCategory={scrollToCategory}
      />

      <main className="px-4 py-6 space-y-12 max-w-4xl mx-auto">
        {filteredMenuData.length > 0 ? (
          filteredMenuData.map((category) => (
            <section key={category.id} id={category.id} className="scroll-mt-24 outline-none">
              <h2 className="text-xl font-bold mb-6 text-gold-gradient px-6 sticky top-16 bg-background/95 backdrop-blur z-30 py-2 rounded-full inline-block">
                {category.name}
              </h2>
              <div className="grid grid-cols-2 gap-3 md:gap-4">
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
          <div className="text-center py-20 text-muted-foreground">
            <p className="text-lg">No items found</p>
            <p className="text-sm">Try adjusting your search or filter</p>
          </div>
        )}
      </main>

      <footer className="text-center text-xs text-muted-foreground py-8 opacity-50">
        <p>Use your phone camera to scan again</p>
      </footer>
      <ScrollToTop />
      <MenuItemDetail
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
      />
    </div>
  );
}
