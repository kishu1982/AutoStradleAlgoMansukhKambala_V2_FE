import { Signal } from "./signal";

export interface AutoStradleLeg {
    exch: string;
    instrument: string;
    optionType: "CE" | "PE";
    expiry: string;
    side: "BUY" | "SELL";
    tokenNumber?: string;
    tradingSymbol?: string;
    legLtp?: number;
    quantityLots?: number;
    ratio?: number;
}

export interface AutoStradle {
    _id: string;
    strategyName: string;
    tokenNumber: string;
    exchange: string;
    symbolName: string;
    quantityLots: number;
    side: "BUY" | "SELL";
    productType: string;
    legs: number;
    legsData: AutoStradleLeg[];
    amountForLotCalEachLeg: number;
    profitBookingPercentage: number;
    stoplossBookingPercentage: number;
    otmDifference: number;
    status: "ACTIVE" | "INACTIVE";
    ltp: number;
    createdAt: string;
    updatedAt: string;
    // Normalized properties for display robustness
    SymbolName?: string;
    symbol?: string;
    tradingSymbol?: string;
    amount_for_lot_cal_each_leg?: number;
    profit_booking_percentage?: number;
    stoploss_booking_percentage?: number;
    otm_difference?: number;
    legs_data?: AutoStradleLeg[];
}

export interface MatchedStrategy {
    autoStradle: AutoStradle;
    signalConfig?: Signal;
}

export interface MorningHighLow {
    highestHigh: number;
    highestHighTime: string;
    lowestLow: number;
    lowestLowTime: string;
}
