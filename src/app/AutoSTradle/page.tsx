"use client";

import React, { useEffect, useState } from "react";
import { 
    Activity, 
    Layers, 
    TrendingUp, 
    TrendingDown, 
    Clock, 
    RefreshCcw,
    AlertCircle,
    CheckCircle2,
    Shield,
    Zap,
    ChevronRight,
    Target,
    Wallet,
    Plus,
    Pencil,
    Trash2,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AutoStradle } from "@/types/autostradle";
import { AutoStradleFormModal } from "@/components/AutoStradleFormModal";

export default function AutoStraddlePage() {
    const [strategies, setStrategies] = useState<AutoStradle[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedStrategy, setSelectedStrategy] = useState<AutoStradle | null>(null);

    const baseUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:3000";

    const fetchData = async (silent = false) => {
        if (!silent) setLoading(true);
        try {
            const response = await fetch(`${baseUrl}/strategy/auto-stradle`);
            if (!response.ok) {
                throw new Error(`Failed to fetch: ${response.statusText}`);
            }
            const data = await response.json();
            
            if (Array.isArray(data)) {
                setStrategies(data);
            } else if (data && typeof data === 'object') {
                const possibleArray = data.strategies || data.data || [data];
                setStrategies(Array.isArray(possibleArray) ? possibleArray : []);
            } else {
                setStrategies([]);
            }
        } catch (err: any) {
            setError(err.message || "An unexpected error occurred while fetching data.");
        } finally {
            if (!silent) setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        const interval = setInterval(() => fetchData(true), 10000);
        return () => clearInterval(interval);
    }, []);

    const handleSubmit = async (data: Partial<AutoStradle>, id?: string) => {
        try {
            const method = id ? "PUT" : "POST";
            const url = id ? `${baseUrl}/strategy/auto-stradle/${id}` : `${baseUrl}/strategy/auto-stradle`;
            
            const response = await fetch(url, {
                method,
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`Failed to ${id ? 'update' : 'create'} strategy`);
            }

            setIsModalOpen(false);
            fetchData(true);
        } catch (err: any) {
            alert(err.message || "Something went wrong.");
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this strategy?")) return;
        
        try {
            const response = await fetch(`${baseUrl}/strategy/auto-stradle/${id}`, {
                method: "DELETE",
            });

            if (!response.ok) {
                throw new Error("Failed to delete strategy");
            }

            fetchData(true);
        } catch (err: any) {
            alert(err.message || "Something went wrong.");
        }
    };

    const openEditModal = (strategy: AutoStradle) => {
        setSelectedStrategy(strategy);
        setIsModalOpen(true);
    };

    const openAddModal = () => {
        setSelectedStrategy(null);
        setIsModalOpen(true);
    };

    if (loading && strategies.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="flex flex-col items-center gap-4 text-center">
                    <div className="relative">
                        <div className="absolute inset-0 blur-xl bg-blue-500/20 animate-pulse rounded-full" />
                        <RefreshCcw className="h-12 w-12 animate-spin text-blue-500 relative" />
                    </div>
                    <p className="text-gray-400 font-medium tracking-wide animate-pulse">Initializing Dashboard...</p>
                </div>
            </div>
        );
    }

    if (error && strategies.length === 0) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center p-6">
                <div className="rounded-3xl bg-red-500/5 p-12 border border-red-500/10 text-center max-w-lg shadow-2xl backdrop-blur-sm">
                    <div className="bg-red-500/10 w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                        <AlertCircle className="h-10 w-10 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-red-500 mb-3">System Sync Failure</h2>
                    <p className="text-gray-400 mb-8 leading-relaxed">{error}</p>
                    <button
                        onClick={fetchData}
                        className="px-8 py-3 bg-red-500 text-white rounded-2xl hover:bg-red-600 transition-all flex items-center gap-3 mx-auto font-bold shadow-lg shadow-red-500/20"
                    >
                        <RefreshCcw className="h-5 w-5" /> Reconnect Now
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto space-y-8 p-4 md:p-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-white/5">
                <div className="space-y-2">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] font-black uppercase tracking-widest mb-2">
                        <Zap className="h-3 w-3" /> System Operational
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-gray-100">
                        Auto Straddle <span className="text-blue-500 text-3xl font-bold">Engine</span>
                    </h1>
                </div>
                <div className="flex items-center gap-4">
                    <button
                        onClick={openAddModal}
                        className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl transition-all font-bold shadow-lg shadow-blue-500/20"
                    >
                        <Plus className="h-5 w-5" /> Add New Straddle
                    </button>
                    <button
                        onClick={fetchData}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all group overflow-hidden relative"
                    >
                        <RefreshCcw className={cn("h-5 w-5 text-gray-400 group-hover:text-blue-400 relative", loading && "animate-spin")} />
                    </button>
                </div>
            </div>

            {strategies.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-32 bg-white/[0.02] rounded-[2.5rem] border border-dashed border-white/10">
                    <Layers className="h-12 w-12 text-gray-600 mb-4" />
                    <h3 className="text-xl font-bold text-gray-300">No Strategies Found</h3>
                    <p className="text-gray-500 text-sm">Automated configurations will appear here once registered.</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {strategies.map((strategy) => {
                        const isSell = strategy.side === 'SELL';
                        return (
                            <div
                                key={strategy._id}
                                className="group relative rounded-[2rem] bg-white/[0.03] border border-white/10 overflow-hidden hover:border-blue-500/30 transition-all duration-300 flex flex-col xl:flex-row"
                            >
                                {/* LEFT SECTION: Main Identity */}
                                <div className="p-8 xl:w-80 flex-shrink-0 bg-blue-500/[0.02] border-r border-white/5 flex flex-col justify-between">
                                    <div>
                                        <div className="flex items-center justify-between mb-4">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border",
                                                isSell ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-emerald-500/10 border-emerald-500/20 text-emerald-500"
                                            )}>
                                                {isSell ? <TrendingDown className="h-6 w-6" /> : <TrendingUp className="h-6 w-6" />}
                                            </div>
                                            <div className="flex gap-2">
                                                <button 
                                                    onClick={() => openEditModal(strategy)}
                                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-blue-400 hover:border-blue-500/30 transition-all"
                                                >
                                                    <Pencil className="h-4 w-4" />
                                                </button>
                                                <button 
                                                    onClick={() => handleDelete(strategy._id)}
                                                    className="p-2 rounded-xl bg-white/5 border border-white/10 text-gray-400 hover:text-red-400 hover:border-red-500/30 transition-all"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </button>
                                            </div>
                                        </div>
                                        <div>
                                            <h3 className="text-2xl font-black text-gray-100 uppercase tracking-tight">{strategy.symbolName}</h3>
                                            <div className="flex items-center gap-2 mt-1">
                                                <span className={cn(
                                                    "px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-tighter",
                                                    isSell ? "bg-red-500/10 text-red-400" : "bg-emerald-500/10 text-emerald-400"
                                                )}>
                                                    {strategy.side}
                                                </span>
                                                <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">{strategy.exchange}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-6 pt-6 border-t border-white/5 space-y-4">
                                        <div className="flex items-center justify-between">
                                            <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Live Price</span>
                                            <p className="text-lg font-mono font-black text-blue-400">₹{strategy.ltp?.toLocaleString() || '---'}</p>
                                        </div>
                                        <div className={cn(
                                            "w-full py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border text-center",
                                            strategy.status === 'ACTIVE' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                        )}>
                                            {strategy.status}
                                        </div>
                                    </div>
                                </div>

                                {/* CENTER SECTION: Parameters & Tech Info */}
                                <div className="flex-grow p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-center border-r border-white/5 bg-black/10">
                                    {/* Strategy Info */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2 flex items-center gap-2">
                                                <Target className="h-3 w-3" /> STRATEGY ENGINE
                                            </p>
                                            <p className="text-sm font-bold text-gray-100">{strategy.strategyName}</p>
                                            <p className="text-[10px] font-mono text-gray-500 mt-1">ID: {strategy._id}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2">MASTER TOKEN</p>
                                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-white/5 border border-white/10">
                                                <span className="text-xs font-mono text-blue-300">{strategy.tokenNumber}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Risk & Execution */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2">RISK BOUNDARIES</p>
                                            <div className="flex items-center gap-3">
                                                <div className="flex-1 px-3 py-2 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
                                                    <p className="text-[8px] text-emerald-500/60 font-black uppercase">Profit Book</p>
                                                    <p className="text-sm font-mono text-emerald-400">+{strategy.profitBookingPercentage}%</p>
                                                </div>
                                                <div className="flex-1 px-3 py-2 rounded-xl bg-red-500/5 border border-red-500/10">
                                                    <p className="text-[8px] text-red-500/60 font-black uppercase">Stop Loss</p>
                                                    <p className="text-sm font-mono text-red-400">-{strategy.stoplossBookingPercentage}%</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2">EXECUTION PARAMS</p>
                                            <div className="flex items-center gap-4">
                                                <div>
                                                    <p className="text-[8px] text-gray-500 font-black uppercase">OTM Offset</p>
                                                    <p className="text-lg font-black text-gray-100">{strategy.otmDifference}%</p>
                                                </div>
                                                <div className="w-px h-8 bg-white/10" />
                                                <div>
                                                    <p className="text-[8px] text-gray-500 font-black uppercase">Product</p>
                                                    <p className="text-xs font-bold text-gray-300">{strategy.productType}</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Deployment & Timing */}
                                    <div className="space-y-6">
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2 flex items-center gap-2">
                                                <Wallet className="h-3 w-3" /> CAPITAL ALLOCATION
                                            </p>
                                            <p className="text-2xl font-black text-gray-100 tracking-tighter">₹{strategy.amountForLotCalEachLeg?.toLocaleString()}</p>
                                            <p className="text-[10px] text-gray-500 font-bold uppercase mt-1">{strategy.quantityLots} LOTS PER LEG</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] uppercase font-black text-gray-500 tracking-[0.2em] mb-2">SYSTEM TIMESTAMPS</p>
                                            <div className="space-y-1">
                                                <div className="flex items-center gap-2 text-[8px] font-bold text-gray-500">
                                                    <Clock className="h-2.5 w-2.5" /> CREATED: {new Date(strategy.createdAt).toLocaleString()}
                                                </div>
                                                <div className="flex items-center gap-2 text-[8px] font-bold text-blue-400/60">
                                                    <RefreshCcw className="h-2.5 w-2.5" /> UPDATED: {new Date(strategy.updatedAt).toLocaleString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* RIGHT SECTION: Composition/Legs */}
                                <div className="p-8 xl:w-[450px] flex-shrink-0 bg-black/40 flex flex-col justify-center">
                                    <div className="flex items-center justify-between mb-6">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] flex items-center gap-2">
                                            <Layers className="h-3 w-3" /> STRADDLE COMPONENTS
                                        </p>
                                        <span className="text-[9px] px-2 py-1 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-black uppercase">
                                            {strategy.legs} ACTIVE LEGS
                                        </span>
                                    </div>
                                    <div className="space-y-3">
                                        {strategy.legsData?.map((leg, idx) => (
                                            <div key={idx} className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-all group/leg">
                                                <div className="flex items-center justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={cn(
                                                            "text-[10px] font-black px-2 py-0.5 rounded-lg border",
                                                            leg.optionType === 'CE' ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-red-500/10 text-red-400 border-red-500/20"
                                                        )}>{leg.optionType}</span>
                                                        <span className="text-[10px] font-black text-gray-400 uppercase">{leg.side}</span>
                                                    </div>
                                                    <p className="text-[9px] text-gray-500 font-mono font-bold">{leg.expiry}</p>
                                                </div>
                                                <div className="flex items-end justify-between">
                                                    <div className="space-y-1">
                                                        <p className="text-xs font-black text-gray-200 uppercase tracking-tight truncate max-w-[180px]">
                                                            {leg.tradingSymbol || leg.instrument}
                                                        </p>
                                                        <p className="text-[8px] font-mono text-gray-500">TOK: {leg.tokenNumber || '---'}</p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-xs font-bold text-gray-400">{leg.quantityLots || strategy.quantityLots} QTY</p>
                                                        {leg.ratio && (
                                                            <div className="mt-1">
                                                                <span className="text-[9px] px-1.5 py-0.5 rounded bg-blue-500/10 border border-blue-500/20 text-blue-400 font-bold">
                                                                    trades will be placed in this ratio: {leg.ratio}
                                                                </span>
                                                            </div>
                                                        )}
                                                        <div className="flex items-center gap-1 justify-end text-blue-400 mt-1">
                                                            <span className="text-[10px] font-mono font-bold">₹{leg.legLtp || '---'}</span>
                                                            <ExternalLink className="h-2.5 w-2.5 opacity-0 group-hover/leg:opacity-100 transition-opacity" />
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <AutoStradleFormModal 
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSubmit={handleSubmit}
                initialData={selectedStrategy}
            />
        </div>
    );
}
