// export default function MarketDataPage() {
//     return (
//         <div className="space-y-4">
//             <h1 className="text-3xl font-bold tracking-tight">Market Data Backend</h1>
//             <p className="text-muted-foreground">
//                 Status and configuration for the market data backend.
//             </p>
//             {/* Placeholder content */}
//             <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
//                 <div className="flex flex-col space-y-1.5 p-6">
//                     <h3 className="font-semibold leading-none tracking-tight">Backend Status</h3>
//                     <div className="flex items-center gap-2">
//                         <span className="flex h-2 w-2 rounded-full bg-green-500" />
//                         <span className="text-sm text-muted-foreground">Connected</span>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }

"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Activity,
  Layers,
  ListOrdered,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Position {
  stat: string;
  exch: string;
  tsym: string;
  s_prdt_ali: string;
  token: string;
  netqty: string;
  netavgprc: string;
  lp: string;
  rpnl: string;
  [key: string]: any;
}

interface TradeRaw {
  stat: string;
  norenordno: string;
  exch: string;
  prctyp: string;
  s_prdt_ali: string;
  prd: string;
  tsym: string;
  token: string;
  flqty: string;
  flprc: string;
  exch_tm: string;
  remarks: string;
  [key: string]: any;
}

interface Trade {
  _id: string;
  norenordno: string;
  exchordid: string;
  tradeDate: string;
  raw: TradeRaw;
}

interface OrderRaw {
  stat: string;
  exchordid: string;
  exch: string;
  tsym: string;
  prctyp: string;
  token: string;
  rprc: string;
  status: string;
  norentm: string;
  remarks: string;
  [key: string]: any;
}

interface Order {
  _id: string;
  norenordno: string;
  exchordid: string;
  tradeDate: string;
  raw: OrderRaw;
}

const headerMap: Record<string, string> = {
  exch: "Exchange",
  tsym: "Symbol Name",
  s_prdt_ali: "Product Type",
  token: "Token",
  netqty: "Net Qty",
  netavgprc: "Net Avg Price",
  lp: "LTP",
  rpnl: "Net Value",
  norenordno: "Order No",
  prctyp: "Price Type",
  prd: "Product",
  flqty: "Fill Qty",
  flprc: "Fill Price",
  exch_tm: "Exchange Time",
  remarks: "Remarks",
  exchordid: "Exch Order ID",
  rprc: "Req Price",
  status: "Status",
  norentm: "Noren Time",
  stat: "Status",
  urmtom: "Running Pnl",
  trantype: "Trade Side",
};

const StatusBadge = ({ status }: { status: string }) => {
  let colorClass = "bg-muted text-muted-foreground border-border";
  const s = status?.toUpperCase();
  if (s === "COMPLETE" || s === "OK")
    colorClass = "bg-emerald-500/10 text-emerald-500 border-emerald-500/20";
  else if (s === "CANCELED" || s === "REJECTED")
    colorClass = "bg-rose-500/10 text-rose-500 border-rose-500/20";
  else if (s === "OPEN" || s === "TRIGGER_PENDING")
    colorClass = "bg-amber-500/10 text-amber-500 border-amber-500/20";

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-medium border",
        colorClass,
      )}
    >
      {status || "-"}
    </span>
  );
};

const ColoredValue = ({ value }: { value: string | number }) => {
  const num = Number(value);
  if (isNaN(num) || num === 0) return <span>{value}</span>;
  return (
    <span
      className={
        num > 0 ? "text-emerald-500 font-medium" : "text-rose-500 font-medium"
      }
    >
      {value}
    </span>
  );
};

function ExpandedDetailsGrid({ data }: { data: any }) {
  if (!data) return null;
  // Filter out complex objects/arrays and keep flat values
  const entries = Object.entries(data).filter(
    ([_, value]) => typeof value !== "object" || value === null,
  );

  return (
    <div className="flex flex-wrap gap-3 p-2">
      {entries.map(([key, value]) => (
        <div
          key={key}
          className="flex flex-col space-y-0.5 bg-muted/20 px-3 py-2 rounded-md border border-border/50 transition-colors hover:bg-muted/40 w-fit min-w-[100px] max-w-sm"
        >
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground/80">
            {key.replace(/_/g, " ")}
          </span>
          <span
            className="text-sm font-medium text-foreground truncate"
            title={String(value)}
          >
            {value === null || value === "" ? "-" : String(value)}
          </span>
        </div>
      ))}
    </div>
  );
}

function ExpandableRow({
  item,
  columns,
  renderCol,
  rowClassName,
  children,
}: {
  item: any;
  columns: string[];
  renderCol: (col: string, item: any) => React.ReactNode;
  rowClassName?: string;
  children?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);

  return (
    <>
      <tr
        className={cn(
          "cursor-pointer border-b border-border/50 transition-all group",
          rowClassName
            ? rowClassName
            : "hover:bg-muted/40 odd:bg-transparent even:bg-muted/10",
        )}
        onClick={() => setExpanded(!expanded)}
      >
        {columns.map((col, idx) => (
          <td
            key={idx}
            className="p-4 align-middle whitespace-nowrap text-sm text-foreground/90 group-hover:text-foreground"
          >
            {renderCol(col, item)}
          </td>
        ))}
        <td className="p-4 align-middle w-10 text-right">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-transparent transition-colors group-hover:bg-muted">
            {expanded ? (
              <ChevronUp className="h-4 w-4 text-muted-foreground" />
            ) : (
              <ChevronDown className="h-4 w-4 text-muted-foreground" />
            )}
          </div>
        </td>
      </tr>
      {expanded && (
        <tr className="bg-muted/5 border-b border-border/50">
          <td colSpan={columns.length + 1} className="p-4 relative">
            <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary/30 rounded-r"></div>
            <div className="rounded-xl bg-card border border-border/50 p-4 shadow-sm">
              {children ? (
                children
              ) : (
                <ExpandedDetailsGrid data={item.raw || item} />
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

export default function MarketDataPage() {
  const [positions, setPositions] = useState<Position[]>([]);
  const [trades, setTrades] = useState<Trade[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);

  const [loading, setLoading] = useState(true);
  const [isManualRefreshing, setIsManualRefreshing] = useState(false);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>("ALL");

  const fetchData = useCallback(async (isSilent = false) => {
    if (!isSilent) setIsManualRefreshing(true);
    try {
      const [posRes, tradesRes, ordersRes] = await Promise.all([
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/exchange-data/positions/filtered`,
        ).catch(() => null),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/exchange-data/trades/filtered`,
        ).catch(() => null),
        fetch(
          `${process.env.NEXT_PUBLIC_BACKEND_URL}/exchange-data/orders/filtered`,
        ).catch(() => null),
      ]);

      if (posRes?.ok) {
        const posJson = await posRes.json();
        if (posJson.success && Array.isArray(posJson.data))
          setPositions(posJson.data);
      }

      if (tradesRes?.ok) {
        const tradesJson = await tradesRes.json();
        if (Array.isArray(tradesJson)) setTrades(tradesJson);
      }

      if (ordersRes?.ok) {
        const ordersJson = await ordersRes.json();
        if (Array.isArray(ordersJson)) setOrders(ordersJson);
      }
    } catch (err) {
      console.error("Error fetching market data:", err);
    } finally {
      setLoading(false);
      if (!isSilent) setIsManualRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData(); // Initial load
    const intervalId = setInterval(() => {
      fetchData(true); // Silent auto-refresh every 2 seconds
    }, 2000);
    return () => clearInterval(intervalId);
  }, [fetchData]);

  const uniqueOrderStatuses = Array.from(
    new Set(orders.map((o) => o.raw?.status).filter(Boolean)),
  );
  const filteredOrders =
    orderStatusFilter === "ALL"
      ? orders
      : orders.filter((o) => o.raw?.status === orderStatusFilter);

  const positionCols = [
    "exch",
    "tsym",
    "s_prdt_ali",
    "token",
    "netqty",
    "netavgprc",
    "lp",
    "rpnl",
    "urmtom",
  ];
  const tradeCols = [
    "norenordno",
    "exch",
    "prctyp",
    "trantype",
    "s_prdt_ali",
    "prd",
    "tsym",
    "token",
    "flqty",
    "flprc",
    "exch_tm",
    "remarks",
  ];
  const orderCols = [
    "exchordid",
    "exch",
    "tsym",
    "prctyp",
    "trantype",
    "token",
    "rprc",
    "status",
    "norentm",
    "remarks",
  ];

  const getRowClass = (item: any) => {
    const type = item.raw?.trantype || item.trantype;
    if (type === "B")
      return "bg-sky-100/60 hover:bg-sky-200/60 dark:bg-sky-900/30 dark:hover:bg-sky-900/50";
    if (type === "S")
      return "bg-pink-100/60 hover:bg-pink-200/60 dark:bg-pink-900/30 dark:hover:bg-pink-900/50";
    return "";
  };

  const renderPositionCol = (col: string, item: any) => {
    let val = item[col] ?? "-";

    if (col === "urmtom") {
      const netqty = Number(item.netqty || 0);
      if (netqty !== 0) {
        const lp = Number(item.lp || 0);
        const rpnl = Number(item.rpnl || 0);
        const calculatedUrmtom = rpnl + netqty * lp;
        val = calculatedUrmtom.toFixed(2);
      }
    }

    if (col === "rpnl" || col === "netqty" || col === "urmtom")
      return <ColoredValue value={val} />;
    if (col === "tsym")
      return <span className="font-semibold text-foreground">{val}</span>;
    return val;
  };

  const renderTradeCol = (col: string, item: any) => {
    const val = item.raw?.[col] ?? "-";
    if (col === "trantype")
      return (
        <span className="font-semibold">
          {val === "B" ? "BUY" : val === "S" ? "SELL" : val}
        </span>
      );
    if (col === "tsym")
      return <span className="font-semibold text-foreground">{val}</span>;
    if (col === "stat") return <StatusBadge status={val} />;
    return val;
  };

  const renderOrderCol = (col: string, item: any) => {
    const val = item.raw?.[col] ?? "-";
    if (col === "trantype")
      return (
        <span className="font-semibold">
          {val === "B" ? "BUY" : val === "S" ? "SELL" : val}
        </span>
      );
    if (col === "tsym")
      return <span className="font-semibold text-foreground">{val}</span>;
    if (col === "status") return <StatusBadge status={val} />;
    return val;
  };

  const netMtm = positions.reduce((total, pos) => {
    const netqty = Number(pos.netqty || 0);
    const rpnl = Number(pos.rpnl || 0);
    if (netqty !== 0) {
      const lp = Number(pos.lp || 0);
      return total + rpnl + netqty * lp;
    }
    return total + rpnl;
  }, 0);

  return (
    <div className="space-y-8 pb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border shadow-sm backdrop-blur-xl">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">
            Market Data Backend
          </h1>
          <p className="text-muted-foreground flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
            </span>
            Live tracking active. Auto-refreshes every 2s.
          </p>
        </div>
        <button
          onClick={() => fetchData(false)}
          disabled={isManualRefreshing}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/90 transition-all shadow-sm hover:shadow active:scale-95 disabled:opacity-70 font-medium"
        >
          <RefreshCw
            className={cn("h-4 w-4", isManualRefreshing && "animate-spin")}
          />
          Refresh Data
        </button>
      </div>

      <div className="rounded-2xl border bg-card/40 backdrop-blur-sm text-card-foreground shadow-sm overflow-hidden flex flex-col ring-1 ring-border/50">
        <div className="flex items-center gap-3 p-5 border-b bg-card">
          <div className="p-2 bg-primary/10 rounded-lg">
            <Activity className="h-5 w-5 text-primary" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">
            Net Positions (NET MTM: <ColoredValue value={netMtm.toFixed(2)} />)
          </h3>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
          )}
        </div>
        <div className="p-0 overflow-x-auto max-h-[400px] overflow-y-auto relative custom-scrollbar">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b sticky top-0 bg-muted/80 backdrop-blur-md z-10">
              <tr className="border-b border-border/50">
                {positionCols.map((c) => (
                  <th
                    key={c}
                    className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {headerMap[c] || c}
                  </th>
                ))}
                <th className="h-11 px-4 align-middle w-10"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {positions.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={positionCols.length + 1}
                    className="p-8 text-center text-muted-foreground bg-muted/10"
                  >
                    No active positions found.
                  </td>
                </tr>
              ) : (
                positions.map((pos, i) => (
                  <ExpandableRow
                    key={i}
                    item={pos}
                    columns={positionCols}
                    renderCol={renderPositionCol}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      <div className="rounded-2xl border bg-card/40 backdrop-blur-sm text-card-foreground shadow-sm overflow-hidden flex flex-col ring-1 ring-border/50">
        <div className="flex items-center gap-3 p-5 border-b bg-card">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <Layers className="h-5 w-5 text-blue-500" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight">All Trades</h3>
          {loading && (
            <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
          )}
        </div>
        <div className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto relative flex-1 custom-scrollbar">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b sticky top-0 bg-muted/80 backdrop-blur-md z-10">
              <tr className="border-b border-border/50">
                {tradeCols.map((c) => (
                  <th
                    key={c}
                    className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {headerMap[c] || c}
                  </th>
                ))}
                <th className="h-11 px-4 align-middle w-10"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {trades.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={tradeCols.length + 1}
                    className="p-8 text-center text-muted-foreground bg-muted/10"
                  >
                    No recent trades found.
                  </td>
                </tr>
              ) : (
                trades.map((trade) => (
                  <ExpandableRow
                    key={trade._id || Math.random().toString()}
                    item={trade}
                    columns={tradeCols}
                    renderCol={renderTradeCol}
                    rowClassName={getRowClass(trade)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="rounded-2xl border bg-card/40 backdrop-blur-sm text-card-foreground shadow-sm overflow-hidden flex flex-col ring-1 ring-border/50">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 border-b bg-card">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-500/10 rounded-lg">
              <ListOrdered className="h-5 w-5 text-purple-500" />
            </div>
            <h3 className="text-lg font-semibold tracking-tight">All Orders</h3>
            {loading && (
              <Loader2 className="h-4 w-4 animate-spin text-muted-foreground ml-2" />
            )}
          </div>
          <div className="flex items-center gap-2">
            <label
              htmlFor="status-filter"
              className="text-xs font-semibold text-muted-foreground uppercase tracking-wider"
            >
              Status
            </label>
            <select
              id="status-filter"
              value={orderStatusFilter}
              onChange={(e) => setOrderStatusFilter(e.target.value)}
              className="h-9 rounded-lg border border-border bg-muted/30 px-3 py-1 text-sm shadow-sm transition-colors focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary min-w-[140px] font-medium"
            >
              <option value="ALL">All Statuses</option>
              {uniqueOrderStatuses.map((s) => (
                <option key={String(s)} value={String(s)}>
                  {String(s)}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="p-0 overflow-x-auto max-h-[500px] overflow-y-auto relative flex-1 custom-scrollbar">
          <table className="w-full caption-bottom text-sm">
            <thead className="[&_tr]:border-b sticky top-0 bg-muted/80 backdrop-blur-md z-10">
              <tr className="border-b border-border/50">
                {orderCols.map((c) => (
                  <th
                    key={c}
                    className="h-11 px-4 text-left align-middle text-xs font-semibold text-muted-foreground uppercase tracking-wider"
                  >
                    {headerMap[c] || c}
                  </th>
                ))}
                <th className="h-11 px-4 align-middle w-10"></th>
              </tr>
            </thead>
            <tbody className="[&_tr:last-child]:border-0">
              {filteredOrders.length === 0 && !loading ? (
                <tr>
                  <td
                    colSpan={orderCols.length + 1}
                    className="p-8 text-center text-muted-foreground bg-muted/10"
                  >
                    No orders match the current filter.
                  </td>
                </tr>
              ) : (
                filteredOrders.map((order) => (
                  <ExpandableRow
                    key={order._id || Math.random().toString()}
                    item={order}
                    columns={orderCols}
                    renderCol={renderOrderCol}
                    rowClassName={getRowClass(order)}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
