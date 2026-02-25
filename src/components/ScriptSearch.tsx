"use client";

import { useState, useEffect, useRef } from "react";
import { useDebounce } from "@/hooks/useDebounce";
import { Search, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ScriptSearchResult {
    exchange: string;
    token: string;
    symbol: string;
    tradingSymbol: string;
    expiry: string | null;
    instrument: string;
    optionType: string | null;
    strikePrice: number | null;
    lotSize: number;
    tickSize: number;
}

interface ScriptSearchProps {
    onSelect: (result: ScriptSearchResult) => void;
    exchange?: string;
    placeholder?: string;
    className?: string;
    defaultValue?: string;
}

export function ScriptSearch({ onSelect, exchange, placeholder = "Search script...", className, defaultValue }: ScriptSearchProps) {
    const [query, setQuery] = useState(defaultValue || "");
    const [results, setResults] = useState<ScriptSearchResult[]>([]);
    const [loading, setLoading] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const [selectedExchange, setSelectedExchange] = useState(exchange || "NSE");
    const wrapperRef = useRef<HTMLDivElement>(null);

    const debouncedQuery = useDebounce(query, 500);

    useEffect(() => {
        // Sync internal state if defaultValue changes externally
        if (defaultValue !== undefined && defaultValue !== query) {
            setQuery(defaultValue);
        }
    }, [defaultValue]);

    useEffect(() => {
        if (exchange) {
            setSelectedExchange(exchange);
        }
    }, [exchange]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowResults(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchScripts = async () => {
            if (!debouncedQuery || debouncedQuery.length < 2) {
                setResults([]);
                return;
            }

            setLoading(true);
            try {
                const params = new URLSearchParams({
                    symbol: debouncedQuery,
                    exchange: selectedExchange,
                });

                const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/market/search?${params}`);
                if (response.ok) {
                    const data = await response.json();
                    setResults(Array.isArray(data) ? data : []);
                    setShowResults(true);
                }
            } catch (error) {
                console.error("Search failed:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchScripts();
    }, [debouncedQuery, selectedExchange]);

    const handleSelect = (result: ScriptSearchResult) => {
        setQuery(result.tradingSymbol || result.symbol);
        setShowResults(false);
        onSelect(result);
    };

    const exchanges = ["NSE", "NFO", "BSE", "BFO", "MCX"];

    return (
        <div ref={wrapperRef} className={cn("relative flex gap-2", className)}>
            <select
                value={selectedExchange}
                onChange={(e) => setSelectedExchange(e.target.value)}
                className="h-9 rounded-md border border-input bg-background px-3 py-1 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
                {exchanges.map((ex) => (
                    <option key={ex} value={ex}>{ex}</option>
                ))}
            </select>
            <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <input
                    type="text"
                    value={query}
                    onChange={(e) => {
                        setQuery(e.target.value);
                        setShowResults(true);
                    }}
                    placeholder={placeholder}
                    className="flex h-9 w-full rounded-md border border-input bg-background pl-9 pr-3 py-1 text-sm shadow-sm transition-colors placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                />
                {loading && (
                    <div className="absolute right-3 top-2.5">
                        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                    </div>
                )}
            </div>

            {showResults && results.length > 0 && (
                <div className="absolute left-0 right-0 top-full z-[100] mt-1 max-h-60 w-full overflow-y-auto rounded-md border bg-background text-popover-foreground shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <ul className="p-1">
                        {results.map((result, index) => (
                            <li
                                key={`${result.token}-${index}`}
                                onClick={() => handleSelect(result)}
                                className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-accent hover:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
                            >
                                <div className="flex flex-col w-full">
                                    <div className="flex justify-between">
                                        <span className="font-medium">{result.tradingSymbol || result.symbol}</span>
                                        <span className="text-xs text-muted-foreground">{result.exchange}</span>
                                    </div>
                                    <div className="flex flex-wrap gap-x-2 text-xs text-muted-foreground">
                                        <span>Tok: {result.token}</span>
                                        {result.expiry && <span>Exp: {result.expiry}</span>}
                                        {result.strikePrice && <span>Strk: {result.strikePrice}</span>}
                                        {result.optionType && <span>{result.optionType}</span>}
                                    </div>
                                </div>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
