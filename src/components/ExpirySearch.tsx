"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Calendar, ChevronDown, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ExpirySearchProps {
    value: string;
    onChange: (expiry: string) => void;
    symbolName?: string;
    exchange?: string;
    className?: string;
    required?: boolean;
}

/**
 * Fetches all available expiry dates for a given symbol from the market search API.
 * Returns a de-duplicated, sorted list of unique non-null expiry strings.
 */
async function fetchExpiries(symbol: string, exchange: string): Promise<string[]> {
    if (!symbol || symbol.length < 2) return [];
    const params = new URLSearchParams({ symbol, exchange });
    const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/market/search?${params}`
    );
    if (!res.ok) return [];
    const data = await res.json();
    if (!Array.isArray(data)) return [];

    const raw: string[] = data
        .map((d: any) => d.expiry)
        .filter((e: string | null | undefined) => e && e.trim() !== "");

    // Deduplicate
    const unique = Array.from(new Set<string>(raw));

    // Sort chronologically using a simple date parser (DD-MMM-YYYY)
    const months: Record<string, number> = {
        JAN: 0, FEB: 1, MAR: 2, APR: 3, MAY: 4, JUN: 5,
        JUL: 6, AUG: 7, SEP: 8, OCT: 9, NOV: 10, DEC: 11,
    };
    unique.sort((a, b) => {
        const parseDate = (d: string) => {
            const parts = d.split("-");
            if (parts.length !== 3) return new Date(0);
            const [day, mon, year] = parts;
            return new Date(parseInt(year), months[mon.toUpperCase()] ?? 0, parseInt(day));
        };
        return parseDate(a).getTime() - parseDate(b).getTime();
    });

    return unique;
}

export function ExpirySearch({
    value,
    onChange,
    symbolName,
    exchange = "NFO",
    className,
    required,
}: ExpirySearchProps) {
    const [inputVal, setInputVal] = useState(value || "");
    const [allExpiries, setAllExpiries] = useState<string[]>([]);
    const [filtered, setFiltered] = useState<string[]>([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    // Sync external value changes
    useEffect(() => {
        setInputVal(value || "");
    }, [value]);

    // Close dropdown on outside click
    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener("mousedown", handler);
        return () => document.removeEventListener("mousedown", handler);
    }, []);

    // Load expiries whenever the symbol or exchange changes
    const loadExpiries = useCallback(async () => {
        if (!symbolName) return;
        setLoading(true);
        try {
            const expiries = await fetchExpiries(symbolName, exchange);
            setAllExpiries(expiries);
        } catch (err) {
            console.error("Failed to fetch expiries:", err);
        } finally {
            setLoading(false);
        }
    }, [symbolName, exchange]);

    useEffect(() => {
        loadExpiries();
    }, [loadExpiries]);

    // Filter whenever input or all expiries change
    useEffect(() => {
        const q = inputVal.trim().toUpperCase();
        if (!q) {
            setFiltered(allExpiries);
        } else {
            setFiltered(allExpiries.filter((e) => e.toUpperCase().includes(q)));
        }
    }, [inputVal, allExpiries]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const upper = e.target.value.toUpperCase();
        setInputVal(upper);
        onChange(upper);
        setShowDropdown(true);
    };

    const handleSelect = (expiry: string) => {
        setInputVal(expiry);
        onChange(expiry);
        setShowDropdown(false);
    };

    const handleFocus = () => {
        setShowDropdown(true);
    };

    const handleChevronClick = () => {
        setShowDropdown((prev) => !prev);
    };

    return (
        <div ref={wrapperRef} className={cn("relative w-full", className)}>
            {/* Input row */}
            <div className="relative flex items-center">
                <Calendar className="absolute left-3 h-3.5 w-3.5 text-gray-500 pointer-events-none" />
                <input
                    type="text"
                    required={required}
                    placeholder="DD-MMM-YYYY (type to filter)"
                    value={inputVal}
                    onChange={handleInputChange}
                    onFocus={handleFocus}
                    className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] pl-8 pr-8 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all placeholder:text-gray-600"
                />
                <button
                    type="button"
                    onClick={handleChevronClick}
                    className="absolute right-2 p-1 text-gray-500 hover:text-gray-300 transition-colors"
                    tabIndex={-1}
                >
                    {loading ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                        <ChevronDown className={cn("h-3.5 w-3.5 transition-transform", showDropdown && "rotate-180")} />
                    )}
                </button>
            </div>

            {/* Dropdown */}
            {showDropdown && (
                <div className="absolute left-0 right-0 top-full z-[200] mt-1 rounded-xl border border-white/10 bg-[#111] shadow-2xl shadow-black/50 overflow-hidden">
                    {filtered.length === 0 ? (
                        <div className="px-3 py-2 text-[10px] text-gray-500 text-center">
                            {allExpiries.length === 0 && !loading
                                ? "No expiry data — select a symbol first"
                                : loading
                                ? "Loading..."
                                : "No matches found"}
                        </div>
                    ) : (
                        <ul className="max-h-44 overflow-y-auto py-1 scrollbar-thin scrollbar-thumb-white/10">
                            {filtered.map((expiry) => (
                                <li
                                    key={expiry}
                                    onClick={() => handleSelect(expiry)}
                                    className={cn(
                                        "flex items-center gap-2 px-3 py-2 text-xs cursor-pointer select-none transition-colors",
                                        inputVal === expiry
                                            ? "bg-blue-500/20 text-blue-300"
                                            : "text-gray-300 hover:bg-white/5 hover:text-white"
                                    )}
                                >
                                    <Calendar className="h-3 w-3 shrink-0 opacity-50" />
                                    {expiry}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            )}
        </div>
    );
}
