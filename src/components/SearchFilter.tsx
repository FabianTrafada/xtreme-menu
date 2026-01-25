"use client";

import { useState, useEffect } from "react";

interface SearchFilterProps {
    onSearch: (query: string) => void;
    onFilterChange: (filter: string) => void;
}

export default function SearchFilter({ onSearch, onFilterChange }: SearchFilterProps) {
    const [query, setQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            onSearch(query);
        }, 600); // Debounce search (wait for user to stop typing)

        return () => clearTimeout(timeoutId);
    }, [query, onSearch]);

    const handleFilterClick = (filter: string) => {
        setActiveFilter(filter);
        onFilterChange(filter);
    };

    return (
        <div className="px-4 py-4 space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border/40">
            {/* Search Input */}
            <div className="relative">
                <input
                    type="text"
                    placeholder="Search menu..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-secondary/50 border border-border focus:border-primary/50 focus:ring-1 focus:ring-primary/50 outline-none transition-all placeholder:text-muted-foreground/70"
                />
                <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                    />
                </svg>
                {query && (
                    <button
                        onClick={() => setQuery("")}
                        className="absolute right-3 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-black/10 text-muted-foreground"
                    >
                        <svg
                            className="w-3 h-3"
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M6 18L18 6M6 6l12 12"
                            />
                        </svg>
                    </button>
                )}
            </div>

            {/* Filter Chips */}
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                <button
                    onClick={() => handleFilterClick("all")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${activeFilter === "all"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                        }`}
                >
                    All Items
                </button>
                <button
                    onClick={() => handleFilterClick("popular")}
                    className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors whitespace-nowrap ${activeFilter === "popular"
                            ? "bg-primary text-primary-foreground border-primary"
                            : "bg-transparent text-muted-foreground border-border hover:border-primary/50"
                        }`}
                >
                    Popular
                </button>
            </div>
        </div>
    );
}
