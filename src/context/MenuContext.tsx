"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from "react";
import { Category, MenuItem } from "@/data/menu";

const ADMIN_PASSWORD = "010201";

function authHeaders(): Record<string, string> {
  return {
    "Content-Type": "application/json",
    Authorization: `Bearer ${ADMIN_PASSWORD}`,
  };
}

interface MenuContextType {
  categories: Category[];
  isLoading: boolean;
  addCategory: (category: Category) => Promise<void>;
  updateCategory: (id: string, category: Partial<Category>) => Promise<void>;
  deleteCategory: (id: string) => Promise<void>;
  addMenuItem: (categoryId: string, item: MenuItem) => Promise<void>;
  updateMenuItem: (categoryId: string, itemId: string, item: Partial<MenuItem>) => Promise<void>;
  deleteMenuItem: (categoryId: string, itemId: string) => Promise<void>;
  resetMenu: () => Promise<void>;
  refreshMenu: () => Promise<void>;
}

const MenuContext = createContext<MenuContextType | undefined>(undefined);

export function MenuProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch menu from API (public, no auth needed)
  const refreshMenu = useCallback(async () => {
    try {
      const res = await fetch("/api/menu");
      if (res.ok) {
        const data = await res.json();
        setCategories(data);
      }
    } catch (e) {
      console.error("Failed to fetch menu:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load on mount
  useEffect(() => {
    refreshMenu();
  }, [refreshMenu]);

  const addCategory = async (category: Category) => {
    setCategories((prev) => [...prev, category]);
    try {
      const res = await fetch("/api/categories", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({ id: category.id, name: category.name }),
      });
      if (!res.ok) {
        setCategories((prev) => prev.filter((c) => c.id !== category.id));
      }
    } catch {
      setCategories((prev) => prev.filter((c) => c.id !== category.id));
    }
  };

  const updateCategory = async (id: string, updatedCategory: Partial<Category>) => {
    const prev = categories;
    setCategories((cats) => cats.map((cat) => (cat.id === id ? { ...cat, ...updatedCategory } : cat)));
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify(updatedCategory),
      });
      if (!res.ok) setCategories(prev);
    } catch {
      setCategories(prev);
    }
  };

  const deleteCategory = async (id: string) => {
    const prev = categories;
    setCategories((cats) => cats.filter((cat) => cat.id !== id));
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) setCategories(prev);
    } catch {
      setCategories(prev);
    }
  };

  const addMenuItem = async (categoryId: string, item: MenuItem) => {
    setCategories((prev) =>
      prev.map((cat) =>
        cat.id === categoryId ? { ...cat, items: [...cat.items, item] } : cat
      )
    );
    try {
      const res = await fetch("/api/items", {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          id: item.id,
          category_id: categoryId,
          name: item.name,
          description: item.description,
          price: item.price,
          image: item.image,
          popular: item.popular,
          ingredients: item.ingredients,
          image_aspect_ratio: item.imageAspectRatio,
        }),
      });
      if (!res.ok) await refreshMenu();
    } catch {
      await refreshMenu();
    }
  };

  const updateMenuItem = async (
    categoryId: string,
    itemId: string,
    updatedItem: Partial<MenuItem>
  ) => {
    const prev = categories;
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId
          ? {
            ...cat,
            items: cat.items.map((item) =>
              item.id === itemId ? { ...item, ...updatedItem } : item
            ),
          }
          : cat
      )
    );
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          ...updatedItem,
          image_aspect_ratio: updatedItem.imageAspectRatio
        }),
      });
      if (!res.ok) setCategories(prev);
    } catch {
      setCategories(prev);
    }
  };

  const deleteMenuItem = async (categoryId: string, itemId: string) => {
    const prev = categories;
    setCategories((cats) =>
      cats.map((cat) =>
        cat.id === categoryId
          ? { ...cat, items: cat.items.filter((item) => item.id !== itemId) }
          : cat
      )
    );
    try {
      const res = await fetch(`/api/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (!res.ok) setCategories(prev);
    } catch {
      setCategories(prev);
    }
  };

  const resetMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/seed", {
        method: "POST",
        headers: authHeaders(),
      });
      if (res.ok) {
        await refreshMenu();
      }
    } catch (e) {
      console.error("Failed to reset menu:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MenuContext.Provider
      value={{
        categories,
        isLoading,
        addCategory,
        updateCategory,
        deleteCategory,
        addMenuItem,
        updateMenuItem,
        deleteMenuItem,
        resetMenu,
        refreshMenu,
      }}
    >
      {children}
    </MenuContext.Provider>
  );
}

export function useMenu() {
  const context = useContext(MenuContext);
  if (context === undefined) {
    throw new Error("useMenu must be used within a MenuProvider");
  }
  return context;
}
