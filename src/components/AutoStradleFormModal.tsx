"use client";

import { useState, useEffect } from "react";
import { AutoStradle, AutoStradleLeg } from "@/types/autostradle";
import { X, Plus, Trash2, Save, Calendar, Info, RefreshCcw, AlertCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScriptSearch } from "@/components/ScriptSearch";

interface AutoStradleFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: Partial<AutoStradle>, id?: string) => Promise<void>;
    initialData?: AutoStradle | null;
}

const emptyLeg: AutoStradleLeg = {
    exch: "NFO",
    instrument: "OPTIDX",
    optionType: "CE",
    expiry: "",
    side: "SELL",
};

const emptyStrategy: Partial<AutoStradle> = {
    strategyName: "StradleTrades",
    tokenNumber: "26000",
    exchange: "NSE",
    symbolName: "NIFTY",
    quantityLots: 1,
    side: "SELL",
    productType: "INTRADAY",
    legs: 2,
    legsData: [
        { ...emptyLeg, optionType: "CE" },
        { ...emptyLeg, optionType: "PE" }
    ],
    amountForLotCalEachLeg: 25000,
    profitBookingPercentage: 10,
    stoplossBookingPercentage: 10,
    otmDifference: 0.25,
    status: "ACTIVE",
    ltp: 0,
};

export function AutoStradleFormModal({ isOpen, onClose, onSubmit, initialData }: AutoStradleFormModalProps) {
    const [formData, setFormData] = useState<Partial<AutoStradle>>(emptyStrategy);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                // Ensure we have at least the empty structure if fields are missing
                setFormData({
                    ...emptyStrategy,
                    ...JSON.parse(JSON.stringify(initialData))
                });
            } else {
                setFormData({ ...emptyStrategy });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        const currentLegsCount = formData.legsData?.length || 0;
        if (currentLegsCount !== 2) {
            alert("due to ratio formula you need to add minimum and max 2 legs");
            return;
        }

        setLoading(true);
        try {
            // Destructure to remove fields typically forbidden in request bodies by the backend
            const { _id, createdAt, updatedAt, __v, ltp, ...pureData } = formData as any;

            const dataToSubmit = {
                ...pureData,
                legs: currentLegsCount,
            };
            await onSubmit(dataToSubmit, _id);
        } catch (error) {
            console.error("Error submitting AutoStradle form:", error);
        } finally {
            setLoading(false);
        }
    };

    const addLeg = () => {
        if ((formData.legsData?.length || 0) >= 2) {
            alert("Maximum 2 legs allowed for straddle strategies");
            return;
        }
        setFormData({
            ...formData,
            legsData: [...(formData.legsData || []), { ...emptyLeg }],
        });
    };

    const removeLeg = (index: number) => {
        const newLegs = [...(formData.legsData || [])];
        newLegs.splice(index, 1);
        setFormData({ ...formData, legsData: newLegs });
    };

    const updateLeg = (index: number, field: keyof AutoStradleLeg, value: any) => {
        const newLegs = [...(formData.legsData || [])];
        newLegs[index] = { ...newLegs[index], [field]: value };
        setFormData({ ...formData, legsData: newLegs });
    };

    const handleScriptSelect = (result: any) => {
        setFormData({
            ...formData,
            symbolName: result.symbol || result.tradingSymbol,
            tokenNumber: result.token,
            exchange: result.exchange
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-md animate-in fade-in duration-300">
            <div className="max-h-[90vh] w-full max-w-5xl overflow-y-auto rounded-3xl bg-[#0a0a0a] border border-white/10 p-8 shadow-2xl shadow-blue-500/10">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                            <Plus className="h-6 w-6 text-blue-500" />
                            {initialData ? "Edit Strategy" : "New Auto Straddle"}
                        </h2>
                        <p className="text-gray-400 text-sm mt-1">Configure automated straddle execution parameters</p>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="rounded-2xl p-2 bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-gray-400 hover:text-white"
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-10">
                    {/* Main Configuration Section */}
                    <div className="space-y-6">
                        <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest pl-1">
                            <Info className="h-4 w-4" /> Global Settings
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="md:col-span-3 space-y-2">
                                <label className="text-sm font-medium text-gray-300">Asset Selection</label>
                                <ScriptSearch
                                    onSelect={handleScriptSelect}
                                    placeholder="Search for index or stock (e.g. NIFTY, RELIANCE)..."
                                    defaultValue={formData.symbolName}
                                    className="script-search-modern"
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Strategy Name</label>
                                <input
                                    required
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.strategyName}
                                    onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Side</label>
                                <select
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                    value={formData.side}
                                    onChange={(e) => setFormData({ ...formData, side: e.target.value as any })}
                                >
                                    <option value="SELL" className="bg-[#0a0a0a]">SELL (Short)</option>
                                    <option value="BUY" className="bg-[#0a0a0a]">BUY (Long)</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Product Type</label>
                                <select
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                    value={formData.productType}
                                    onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
                                >
                                    <option value="INTRADAY" className="bg-[#0a0a0a]">INTRADAY</option>
                                    <option value="NORMAL" className="bg-[#0a0a0a]">NORMAL</option>
                                    <option value="DELIVERY" className="bg-[#0a0a0a]">DELIVERY</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Quantity (Lots)</label>
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.quantityLots}
                                    onChange={(e) => setFormData({ ...formData, quantityLots: parseInt(e.target.value) || 1 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Lot Amount (per Leg)</label>
                                <input
                                    type="number"
                                    required
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.amountForLotCalEachLeg}
                                    onChange={(e) => setFormData({ ...formData, amountForLotCalEachLeg: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">OTM Difference (%)</label>
                                <input
                                    type="number"
                                    step="0.01"
                                    required
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.otmDifference}
                                    onChange={(e) => setFormData({ ...formData, otmDifference: parseFloat(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Profit Target (%)</label>
                                <input
                                    type="number"
                                    required
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.profitBookingPercentage}
                                    onChange={(e) => setFormData({ ...formData, profitBookingPercentage: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Stop Loss (%)</label>
                                <input
                                    type="number"
                                    required
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                    value={formData.stoplossBookingPercentage}
                                    onChange={(e) => setFormData({ ...formData, stoplossBookingPercentage: parseInt(e.target.value) || 0 })}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-300">Status</label>
                                <select
                                    className="flex h-11 w-full rounded-2xl border border-white/10 bg-white/5 px-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all appearance-none"
                                    value={formData.status}
                                    onChange={(e) => setFormData({ ...formData, status: e.target.value as any })}
                                >
                                    <option value="ACTIVE" className="bg-[#0a0a0a]">ACTIVE</option>
                                    <option value="INACTIVE" className="bg-[#0a0a0a]">INACTIVE</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    {/* Legs Configuration Section */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between border-b border-white/10 pb-4">
                            <div className="flex items-center gap-2 text-blue-400 text-xs font-bold uppercase tracking-widest pl-1">
                                <Calendar className="h-4 w-4" /> Strategy Legs
                            </div>
                            <button
                                type="button"
                                onClick={addLeg}
                                disabled={(formData.legsData?.length || 0) >= 2}
                                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500/10 text-blue-400 hover:bg-blue-500 hover:text-white transition-all text-sm font-bold disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                <Plus className="h-4 w-4" /> Add Leg
                            </button>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                            {formData.legsData?.map((leg, index) => (
                                <div key={index} className="relative group rounded-3xl bg-white/5 border border-white/10 p-6 hover:border-blue-500/30 transition-all duration-300">
                                    <button
                                        type="button"
                                        onClick={() => removeLeg(index)}
                                        className="absolute right-4 top-4 p-2 rounded-xl bg-red-500/10 text-red-400 opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-red-500 hover:text-white"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Exchange</label>
                                            <select
                                                className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                                value={leg.exch}
                                                onChange={(e) => updateLeg(index, "exch", e.target.value)}
                                            >
                                                <option value="NFO">NFO</option>
                                                <option value="NSE">NSE</option>
                                                <option value="BSE">BSE</option>
                                                <option value="BFO">BFO</option>
                                                <option value="MCX">MCX</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Option Type</label>
                                            <div className="flex p-0.5 rounded-xl bg-[#0a0a0a] border border-white/10">
                                                <button
                                                    type="button"
                                                    onClick={() => updateLeg(index, "optionType", "CE")}
                                                    className={cn(
                                                        "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                                        leg.optionType === 'CE' ? "bg-blue-500 text-white" : "text-gray-500 hover:text-gray-300"
                                                    )}
                                                >
                                                    CE
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateLeg(index, "optionType", "PE")}
                                                    className={cn(
                                                        "flex-1 py-1.5 rounded-lg text-[10px] font-bold transition-all",
                                                        leg.optionType === 'PE' ? "bg-red-500 text-white" : "text-gray-500 hover:text-gray-300"
                                                    )}
                                                >
                                                    PE
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Instrument</label>
                                            <select
                                                className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                                value={leg.instrument}
                                                onChange={(e) => updateLeg(index, "instrument", e.target.value)}
                                            >
                                                <option value="OPTIDX">OPTIDX</option>
                                                <option value="OPTSTK">OPTSTK</option>
                                                <option value="FUTIDX">FUTIDX</option>
                                                <option value="FUTSTK">FUTSTK</option>
                                            </select>
                                        </div>

                                        <div className="space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Side</label>
                                            <select
                                                className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 appearance-none"
                                                value={leg.side}
                                                onChange={(e) => updateLeg(index, "side", e.target.value)}
                                            >
                                                <option value="SELL">SELL</option>
                                                <option value="BUY">BUY</option>
                                            </select>
                                        </div>

                                        <div className="col-span-2 space-y-1">
                                            <label className="text-[10px] uppercase font-bold text-gray-500 tracking-wider">Expiry (e.g. 17-FEB-2026)</label>
                                            <div className="relative">
                                                <input
                                                    required
                                                    placeholder="DD-MMM-YYYY"
                                                    className="flex h-10 w-full rounded-xl border border-white/10 bg-[#0a0a0a] px-4 text-xs text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                                    value={leg.expiry}
                                                    onChange={(e) => updateLeg(index, "expiry", e.target.value.toUpperCase())}
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {(!formData.legsData || formData.legsData.length !== 2) && (
                            <div className="flex flex-col items-center justify-center py-6 rounded-3xl border border-dashed border-red-500/20 bg-red-500/5">
                                <AlertCircle className="h-6 w-6 text-red-500 mb-2" />
                                <p className="text-xs text-red-400 font-bold uppercase tracking-widest">
                                    due to ratio formula you need to add minimum and max 2 legs
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center justify-end gap-4 pt-6 border-t border-white/10">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-8 py-3 rounded-2xl border border-white/10 text-sm font-bold text-gray-400 hover:bg-white/5 hover:text-white transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading || !formData.symbolName || (formData.legsData?.length !== 2)}
                            className="flex items-center gap-2 px-10 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-500 text-sm font-bold text-white shadow-lg shadow-blue-500/20 hover:from-blue-500 hover:to-blue-400 transition-all disabled:opacity-50 disabled:grayscale"
                        >
                            {loading ? (
                                <>
                                    <RefreshCcw className="h-4 w-4 animate-spin" />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save className="h-4 w-4" />
                                    {initialData ? "Save Changes" : "Create Strategy"}
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
