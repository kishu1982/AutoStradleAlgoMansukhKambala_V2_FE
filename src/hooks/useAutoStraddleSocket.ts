import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";

export interface MarketTick {
  t?: string; // Touchline feed type (e.g. "tf")
  e?: string; // Exchange (e.g. "NFO")
  tk?: string; // Token number
  token?: string; // Alternative token key
  ft?: string; // Feed time timestamp
  v?: string; // Volume
  bp1?: string | number; // Best bid price
  bq1?: string; // Best bid quantity
  sq1?: string; // Best ask quantity (or sell quantity)
  sp1?: string | number; // Best ask price (sometimes sp1)
  lp?: string | number; // Last traded price (as string or number)
  lastPrice?: string | number; // Alternative last price key
  price?: string | number; // Alternative price key
}

export function useAutoStraddleSocket(baseUrl: string, tokens: string[]) {
  const [prices, setPrices] = useState<Record<string, number>>({});
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  // Use a ref to store active tokens to prevent socket connection churn when tokens array reference changes
  const tokensRef = useRef<string[]>(tokens);
  useEffect(() => {
    tokensRef.current = tokens;
    // console.log("[Socket] Tokens list updated in hook ref:", tokens);
  }, [tokens]);

  useEffect(() => {
    if (!baseUrl) {
      console.warn("[Socket] No baseUrl provided. Cannot connect.");
      return;
    }

    console.log("[Socket] Initializing connection to:", baseUrl);
    const socket = io(`${baseUrl}/market-data`, {
      transports: ["websocket", "polling"],
      reconnectionAttempts: 15,
      reconnectionDelay: 2000,
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      console.log(`[Socket] Connected successfully! ID: ${socket.id}`);
      setConnected(true);
    });

    socket.on("disconnect", (reason) => {
      console.warn("[Socket] Disconnected from backend, reason:", reason);
      setConnected(false);
    });

    socket.on("connect_error", (error) => {
      console.error("[Socket] Connection/CORS error:", error.message, error);
      setConnected(false);
    });

    socket.on("error", (error) => {
      console.error("[Socket] General socket error:", error);
    });

    const handleTickData = (data: any) => {
      if (!data) return;

      let parsedData = data;
      // Handle stringified JSON formats automatically
      if (typeof data === "string") {
        try {
          parsedData = JSON.parse(data);
        } catch (e) {
          // Ignore if not a valid JSON string
          return;
        }
      }

      const ticks = Array.isArray(parsedData) ? parsedData : [parsedData];

      setPrices((prev) => {
        let updated = false;
        const newPrices = { ...prev };

        for (const tick of ticks) {
          if (tick && typeof tick === "object") {
            // Find token number supporting tk or token keys
            const rawToken = tick.tk ?? tick.token;
            if (rawToken !== undefined && rawToken !== null) {
              const tokenStr = String(rawToken).trim();

              // Extract price using lp, lastPrice, price, bp1, or sp1
              const rawPrice =
                tick.lp ?? tick.lastPrice ?? tick.price ?? tick.bp1 ?? tick.sp1;
              if (rawPrice !== undefined && rawPrice !== null) {
                const priceNum = parseFloat(String(rawPrice));
                if (!isNaN(priceNum) && priceNum !== 0) {
                  if (newPrices[tokenStr] !== priceNum) {
                    newPrices[tokenStr] = priceNum;
                    updated = true;
                    // console.log(
                    //   `[Socket] Tick update for token ${tokenStr} -> ₹${priceNum}`,
                    // );
                  }
                }
              }
            }
          }
        }

        return updated ? newPrices : prev;
      });
    };

    // Listen on standard channels
    socket.on("tick", handleTickData);
    socket.on("market-data", handleTickData);
    socket.on("feed", handleTickData);
    socket.on("touchline", handleTickData);
    socket.on("message", (msg) => {
      if (msg) handleTickData(msg);
    });

    // Listen on any incoming event for troubleshooting/compatibility
    socket.onAny((event, ...args) => {
      if (
        !["ping", "pong", "connect", "disconnect", "connect_error"].includes(
          event,
        )
      ) {
        // console.log(`[Socket debug] Raw event received "${event}":`, args);
        if (args && args.length > 0) {
          handleTickData(args[0]);
        }
      }
    });

    return () => {
      console.log("[Socket] Cleaning up socket resources");
      socket.disconnect();
      socketRef.current = null;
    };
  }, [baseUrl]); // Only reconnect if baseUrl changes

  return { prices, connected };
}
