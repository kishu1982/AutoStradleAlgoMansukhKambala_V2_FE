"use client";

import { useState, useEffect } from "react";
import { Signal, TradeLeg } from "@/types/signal";
import { X, Plus, Trash2, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { ScriptSearch } from "@/components/ScriptSearch";

interface SignalFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (signal: Partial<Signal>) => Promise<void>;
    initialData?: Partial<Signal> | null;
}

const emptyLeg: TradeLeg = {
    tokenNumber: "",
    exchange: "NSE",
    symbolName: "",
    quantityLots: 0,
    side: "BUY",
    productType: "INTRADAY",
    strategyName: "TradingViewSignals",
    legs: 0,
};

const emptySignal: Partial<Signal> = {
    strategyName: "TradingViewSignals",
    tokenNumber: "",
    exchange: "NSE",
    symbolName: "",
    quantityLots: 0,
    side: "BUY",
    productType: "INTRADAY",
    legs: 0,
    signalStatus: "ACTIVE",
    toBeTradedOn: [],
};

export function SignalFormModal({ isOpen, onClose, onSubmit, initialData }: SignalFormModalProps) {
    const [formData, setFormData] = useState<Partial<Signal>>(emptySignal);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                setFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy
            } else {
                setFormData({ ...emptySignal, toBeTradedOn: [] });
            }
        }
    }, [isOpen, initialData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            // Calculate legs count based on toBeTradedOn length
            const legsCount = formData.toBeTradedOn?.length || 0;
            const finalLegsCount = legsCount > 0 ? legsCount : 1;

            // Destructure to remove fields typically forbidden in request bodies by the backend
            const { _id, createdAt, updatedAt, __v, ...pureData } = formData as any;

            const dataToSubmit = {
                ...pureData,
                legs: finalLegsCount,
                toBeTradedOn: formData.toBeTradedOn?.map(leg => ({
                    ...leg,
                    legs: finalLegsCount
                })) || []
            };
            await onSubmit(dataToSubmit);
            // onClose(); // Let parent handle closing or we handle it here
        } catch (error) {
            console.error("Error submitting form:", error);
        } finally {
            setLoading(false);
        }
    };

    const addLeg = () => {
        setFormData({
            ...formData,
            toBeTradedOn: [...(formData.toBeTradedOn || []), { ...emptyLeg }],
        });
    };

    const removeLeg = (index: number) => {
        const newLegs = [...(formData.toBeTradedOn || [])];
        newLegs.splice(index, 1);
        setFormData({ ...formData, toBeTradedOn: newLegs });
    };

    const updateLeg = (index: number, field: keyof TradeLeg, value: any) => {
        const newLegs = [...(formData.toBeTradedOn || [])];
        newLegs[index] = { ...newLegs[index], [field]: value };
        setFormData({ ...formData, toBeTradedOn: newLegs });
    };

    const handleScriptSelect = (result: any) => {
        setFormData({
            ...formData,
            symbolName: result.tradingSymbol,
            tokenNumber: result.token,
            exchange: result.exchange
        });
    };

    const handleLegScriptSelect = (index: number, result: any) => {
        const newLegs = [...(formData.toBeTradedOn || [])];
        newLegs[index] = {
            ...newLegs[index],
            symbolName: result.tradingSymbol,
            tokenNumber: result.token,
            exchange: result.exchange
        };
        setFormData({ ...formData, toBeTradedOn: newLegs });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
            <div className="max-h-[90vh] w-full max-w-4xl overflow-y-auto rounded-lg bg-background p-6 shadow-lg">
                <div className="mb-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold">{initialData ? "Edit Signal" : "Add New Signal"}</h2>
                    <button onClick={onClose} className="rounded-full p-2 hover:bg-muted">
                        <X className="h-5 w-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        <div className="space-y-2 lg:col-span-3">
                            <label className="text-sm font-medium">Search Script</label>
                            <ScriptSearch
                                onSelect={handleScriptSelect}
                                placeholder="Search for main signal script..."
                                defaultValue={formData.symbolName}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Strategy Name</label>
                            <input
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.strategyName}
                                onChange={(e) => setFormData({ ...formData, strategyName: e.target.value })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Symbol</label>
                            <input
                                required
                                readOnly
                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm opacity-50 cursor-not-allowed"
                                value={formData.symbolName}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Token Number</label>
                            <input
                                required
                                readOnly
                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm opacity-50 cursor-not-allowed"
                                value={formData.tokenNumber}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Exchange</label>
                            <input
                                required
                                readOnly
                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm shadow-sm opacity-50 cursor-not-allowed"
                                value={formData.exchange}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Side</label>
                            <select
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.side}
                                onChange={(e) => setFormData({ ...formData, side: e.target.value as any })}
                            >
                                <option value="BUY">BUY</option>
                                <option value="SELL">SELL</option>
                                <option value="EXIT">EXIT</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Product Type</label>
                            <select
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.productType}
                                onChange={(e) => setFormData({ ...formData, productType: e.target.value as any })}
                            >
                                <option value="INTRADAY">INTRADAY</option>
                                <option value="NORMAL">NORMAL</option>
                                <option value="DELIVERY">DELIVERY</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Quantity (Lots)</label>
                            <input
                                type="number"
                                required
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.quantityLots}
                                onChange={(e) => setFormData({ ...formData, quantityLots: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Status</label>
                            <select
                                className="flex w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                value={formData.signalStatus}
                                onChange={(e) => setFormData({ ...formData, signalStatus: e.target.value as any })}
                            >
                                <option value="ACTIVE">ACTIVE</option>
                                <option value="INACTIVE">INACTIVE</option>
                            </select>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center justify-between border-b pb-2">
                            <h3 className="text-lg font-semibold">Strategy Legs</h3>
                            <button
                                type="button"
                                onClick={addLeg}
                                className="flex items-center space-x-1 rounded-md bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
                            >
                                <Plus className="h-4 w-4" />
                                <span>Add Leg</span>
                            </button>
                        </div>

                        <div className="space-y-4">
                            {formData.toBeTradedOn?.map((leg, index) => (
                                <div key={index} className="relative rounded-lg border bg-muted/30 p-4">
                                    <button
                                        type="button"
                                        onClick={() => removeLeg(index)}
                                        className="absolute right-2 top-2 rounded-full p-1.5 text-destructive hover:bg-destructive/10"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </button>

                                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4 pr-8">
                                        <div className="space-y-2 lg:col-span-4">
                                            <label className="text-xs font-medium">Search Leg Script</label>
                                            <ScriptSearch
                                                onSelect={(result) => handleLegScriptSelect(index, result)}
                                                placeholder="Search for leg script..."
                                                defaultValue={leg.symbolName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Symbol</label>
                                            <input
                                                required
                                                readOnly
                                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                                                value={leg.symbolName}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Token</label>
                                            <input
                                                required
                                                readOnly
                                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                                                value={leg.tokenNumber}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Strategy Name</label>
                                            <input
                                                required
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={leg.strategyName}
                                                onChange={(e) => updateLeg(index, "strategyName", e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Exchange</label>
                                            <input
                                                required
                                                readOnly
                                                className="flex w-full rounded-md border border-input bg-muted px-3 py-2 text-sm opacity-50 cursor-not-allowed"
                                                value={leg.exchange}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Side</label>
                                            <select
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={leg.side}
                                                onChange={(e) => updateLeg(index, "side", e.target.value)}
                                            >
                                                <option value="BUY">BUY</option>
                                                <option value="SELL">SELL</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Product Type</label>
                                            <select
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={leg.productType}
                                                onChange={(e) => updateLeg(index, "productType", e.target.value)}
                                            >
                                                <option value="INTRADAY">INTRADAY</option>
                                                <option value="NORMAL">NORMAL</option>
                                                <option value="DELIVERY">DELIVERY</option>
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-medium">Quantity</label>
                                            <input
                                                type="number"
                                                required
                                                className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                                                value={leg.quantityLots}
                                                onChange={(e) => updateLeg(index, "quantityLots", parseInt(e.target.value) || 0)}
                                            />
                                        </div>
                                    </div>
                                </div>
                            ))}

                            {(!formData.toBeTradedOn || formData.toBeTradedOn.length === 0) && (
                                <div className="text-center text-sm text-muted-foreground p-4 border border-dashed rounded-lg">
                                    No legs added yet.
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center space-x-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                        >
                            <Save className="h-4 w-4" />
                            <span>{loading ? "Saving..." : "Save Signal"}</span>
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
