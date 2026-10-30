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
  livePrice?: number;
  openNetQty?: number;
  avgEntryPrice?: number;
  liveValue?: number;
  investedValue?: number;
  livePnL?: number;
  valueRatio?: number;
  valueRatioInvested?: number;
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
  underlyingDifference?: number;
  status: "ACTIVE" | "INACTIVE";
  ltp: number;
  createdAt: string;
  updatedAt: string;
  vwapValue?: number;
  vwapTriggerPercentage?: number;
  vwapUpdatedAt?: string;
  ceAmountMultiplier?: number;
  peAmountMultiplier?: number;
  exitRatio?: number;
  // Normalized properties for display robustness
  SymbolName?: string;
  symbol?: string;
  tradingSymbol?: string;
  amount_for_lot_cal_each_leg?: number;
  profit_booking_percentage?: number;
  stoploss_booking_percentage?: number;
  otm_difference?: number;
  underlying_difference?: number;
  legs_data?: AutoStradleLeg[];
  ce_amount_multiplier?: number;
  pe_amount_multiplier?: number;
  exit_ratio?: number;
  dayHighLowExitEnabled?: boolean;
  dayHighLowThresholdPercent?: number;
  underlyingPrice?: ActiveTradeUnderlyingPrice;
  underlyingDayRange?: UnderlyingDayRange;
}

export interface ActiveTradeUnderlyingPrice {
  entryPrice?: number;
  entryTimeIST?: string;
  livePrice?: number;
  liveTimeIST?: string;
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

export interface UnderlyingDayRange {
  dayHigh: number;
  dayLow: number;
  exitEnabled: boolean;
  thresholdPercent: number;
  highTriggerLevel: number | null;
  lowTriggerLevel: number | null;
  capturedAtIST: string;
  lastUpdatedIST: string;
}
