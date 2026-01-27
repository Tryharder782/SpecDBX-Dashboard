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
   regime: "VOLATILE" | "TRENDING" | "RANGING";
   timeframe: "1D" | "1W" | "1M";
};

const BASE_STRIKE = 4800;

function generateGamma(timeframe: "1D" | "1W" | "1M"): GammaLevel[] {
   let step = 5;
   let valueMult = 3; // Max $B

   if (timeframe === "1W") {
      step = 10;
      valueMult = 12;
   }
   if (timeframe === "1M") {
      step = 25;
      valueMult = 45;
   }

   const count = 31; // More bars for a denser "terminal" look
   const startStrike = Math.floor(BASE_STRIKE / step) * step - (Math.floor(count / 2) * step);

   return Array.from({ length: count }, (_, i) => {
      const strike = startStrike + i * step;
      // Exponential distribution around center for more "realistic" curve
      const distanceFromCenter = Math.abs(i - Math.floor(count / 2));
      const bellCurve = Math.exp(-(distanceFromCenter ** 2) / (count * 1.5));

      return {
         strike,
         callGamma: (Math.random() * valueMult * bellCurve) + 0.5,
         putGamma: -((Math.random() * valueMult * bellCurve) + 0.5),
      }
   });
}

export function useMarketData() {
   const [data, setData] = useState<MarketData>({
      spotPrice: 4800.0,
      gammaExposure: generateGamma("1D"),
      flowDominance: 58,
      status: "OPEN",
      regime: "VOLATILE",
      timeframe: "1D",
   });

   const changeTimeframe = useCallback((tf: "1D" | "1W" | "1M") => {
      setData(prev => ({
         ...prev,
         timeframe: tf,
         gammaExposure: generateGamma(tf)
      }));
   }, []);

   useEffect(() => {
      const interval = setInterval(() => {
         setData((prev) => {
            // Fluctuate price
            const priceChange = (Math.random() - 0.5) * 2.0;
            const newPrice = prev.spotPrice + priceChange;

            // Fluctuate Gamma slightly
            const newGamma = prev.gammaExposure.map((g) => ({
               ...g,
               callGamma: Math.max(0, g.callGamma + (Math.random() - 0.5) * 0.5),
               putGamma: Math.min(0, g.putGamma + (Math.random() - 0.5) * 0.5),
            }));

            // Fluctuate Flow
            const flowChange = Math.floor((Math.random() - 0.5) * 5);
            const newFlow = Math.min(100, Math.max(0, prev.flowDominance + flowChange));

            return {
               ...prev,
               spotPrice: Number(newPrice.toFixed(2)),
               gammaExposure: newGamma,
               flowDominance: newFlow,
            };
         });
      }, 500);

      return () => clearInterval(interval);
   }, []);

   return { ...data, changeTimeframe };
}
