"use client";

import { useEffect, useState, useCallback } from "react";

export type GammaLevel = {
   strike: number;
   callGamma: number;
   putGamma: number;
};

export type MarketData = {
   spotPrice: number;
   gammaExposure: GammaLevel[];
   flowDominance: number; // 0-100, >50 Call heavy
   status: "OPEN" | "CLOSED" | "HALTED";
   regime: "ALTCOIN_SEASON" | "BITCOIN_SEASON" | "TRANSITION";
   timeframe: "30D" | "60D" | "90D";
};

function generateGamma(timeframe: "30D" | "60D" | "90D"): GammaLevel[] {
   let count = 30;
   let valueMult = 6;

   if (timeframe === "60D") {
      count = 60;
      valueMult = 9;
   }
   if (timeframe === "90D") {
      count = 90;
      valueMult = 12;
   }

   return Array.from({ length: count }, (_, i) => {
      const strike = i + 1;
      const distanceFromCenter = Math.abs(i - Math.floor(count / 2));
      const bellCurve = Math.exp(-(distanceFromCenter ** 2) / (count * 1.5));

      return {
         strike,
         callGamma: (Math.random() * valueMult * bellCurve) + 0.2,
         putGamma: -((Math.random() * valueMult * bellCurve) + 0.2),
      }
   });
}

export function useMarketData() {
   const [data, setData] = useState<MarketData>({
      spotPrice: 75.0,
      gammaExposure: generateGamma("30D"),
      flowDominance: 75,
      status: "OPEN",
      regime: "ALTCOIN_SEASON",
      timeframe: "30D",
   });

   const changeTimeframe = useCallback((tf: "30D" | "60D" | "90D") => {
      setData(prev => ({
         ...prev,
         timeframe: tf,
         gammaExposure: generateGamma(tf)
      }));
   }, []);

   useEffect(() => {
      const interval = setInterval(() => {
         setData((prev) => {
            const priceChange = (Math.random() - 0.5) * 1.6;
            const newPrice = Math.max(0, Math.min(100, prev.spotPrice + priceChange));

            // Fluctuate Gamma slightly
            const newGamma = prev.gammaExposure.map((g) => ({
               ...g,
               callGamma: Math.max(0, g.callGamma + (Math.random() - 0.5) * 0.5),
               putGamma: Math.min(0, g.putGamma + (Math.random() - 0.5) * 0.5),
            }));

            const flowChange = Math.floor((Math.random() - 0.5) * 5);
            const newFlow = Math.min(100, Math.max(0, prev.flowDominance + flowChange));

            const regime: MarketData["regime"] =
              newFlow >= 60 ? "ALTCOIN_SEASON" : newFlow <= 40 ? "BITCOIN_SEASON" : "TRANSITION";

            return {
               ...prev,
               spotPrice: Number(newPrice.toFixed(2)),
               gammaExposure: newGamma,
               flowDominance: newFlow,
               regime,
            };
         });
      }, 500);

      return () => clearInterval(interval);
   }, []);

   return { ...data, changeTimeframe };
}
