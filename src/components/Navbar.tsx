"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { LineChart, Radio, Database, Activity, RefreshCw } from "lucide-react";

const navItems = [
  // {
  //     title: "TradingView Signals",
  //     href: "/signals",
  //     icon: LineChart,
  // },
  {
    title: "WebSocket Subscribed",
    href: "/subscribed",
    icon: Radio,
  },
  {
    title: "Market Data Backend",
    href: "/market-data",
    icon: Database,
  },
  {
    title: "Auto Straddle",
    href: "/AutoSTradle",
    icon: Activity,
  },
];

export function Navbar() {
  const pathname = usePathname();

  const [algoId, setAlgoId] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const fetchAlgoId = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/exchange-data/algoid/`,
        );
        if (res.ok) {
          const data = await res.json();
          setAlgoId(data.AlgoId);
        }
      } catch (error) {
        console.error("Failed to fetch AlgoId", error);
      }
    };
    fetchAlgoId();
  }, []);

  // refresh symbol data
  const handleRefresh = async () => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/market/refresh-instruments`,
      );
      if (res.ok) {
        const data = await res.json();
        alert(`Successfully refreshed ${data.count} instruments.`);
      } else {
        alert("Failed to refresh instruments.");
      }
    } catch (error) {
      console.error("Failed to refresh instruments", error);
      alert("Error refreshing instruments.");
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <div className="mr-4 hidden md:flex">
          <Link
            href="/AutoSTradle"
            className="mr-6 flex items-center space-x-2"
          >
            <span className="hidden font-bold sm:inline-block">
              AlgoTrading {algoId ? `: ${algoId}` : ""}
            </span>
          </Link>
          <nav className="flex items-center space-x-6 text-sm font-medium">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "transition-colors hover:text-foreground/80",
                  pathname === item.href
                    ? "text-foreground"
                    : "text-foreground/60",
                )}
              >
                <div className="flex items-center gap-2">
                  <item.icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </div>
              </Link>
            ))}
          </nav>
        </div>
        <div className="flex flex-1 items-center justify-end space-x-2">
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className="p-2 rounded-md hover:bg-accent hover:text-accent-foreground disabled:opacity-50 transition-colors"
            title="Refresh Instruments"
          >
            <RefreshCw
              className={cn("h-5 w-5", isRefreshing && "animate-spin")}
            />
          </button>
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
}
