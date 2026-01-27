"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
   ComposedChart,
   Bar,
   XAxis,
   YAxis,
   Tooltip,
   ResponsiveContainer,
   ReferenceLine,
   Brush,
   BarChart,
} from "recharts";
import { GammaLevel } from "@/hooks/useMarketData";
import clsx from "clsx";

interface GammaChartProps {
   data: GammaLevel[];
   spotPrice: number;
   timeframe?: "1D" | "1W" | "1M";
   onChangeTimeframe?: (tf: "1D" | "1W" | "1M") => void;
}

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: { value: number; name: string }[]; label?: string | number }) => {
   if (active && payload && payload.length) {
      return (
         <div className="bg-black border border-slate-800 p-2 rounded shadow-2xl min-w-[200px]">
            <div className="flex justify-between items-center mb-2 border-b border-slate-800 pb-1">
               <span className="text-slate-500 font-mono text-xs uppercase">Strike</span>
               <span className="text-white font-mono font-bold text-sm">{label}</span>
            </div>
            <div className="space-y-1">
               <div className="flex justify-between text-xs font-mono">
                  <span className="text-emerald-400">CALL GEX</span>
                  <span className="text-white">{(payload[0].value).toFixed(2)}B</span>
               </div>
               <div className="flex justify-between text-xs font-mono">
                  <span className="text-rose-500">PUT GEX</span>
                  <span className="text-white">{(payload[1].value).toFixed(2)}B</span>
               </div>
               <div className="flex justify-between text-xs font-mono pt-1 mt-1 border-t border-slate-900">
                  <span className="text-slate-400">NET GEX</span>
                  <span className={clsx(
                     (payload[0].value + payload[1].value) > 0 ? "text-emerald-400" : "text-rose-500"
                  )}>
                     ${(payload[0].value + payload[1].value).toFixed(2)}B
                  </span>
               </div>
            </div>
         </div>
      );
   }
   return null;
};

import { motion, AnimatePresence } from "framer-motion";

export function GammaExposureChart({ data, spotPrice, timeframe = "1D", onChangeTimeframe }: GammaChartProps) {
   // 1. State for the zoom range (indices)
   const [range, setRange] = useState<{ start: number; end: number }>({ start: 0, end: data.length - 1 });

   // 2. Stable data for the Brush (it only cares about the strikes/ruler)
   const brushData = useMemo(() => {
      return data.map(d => ({ strike: d.strike }));
   }, [data]); // Only regenerate if data changes

   // 3. Reset zoom when timeframe changes
   useEffect(() => {
      setRange({ start: 0, end: data.length - 1 });
   }, [timeframe, data.length]);

   // 4. Data actually displayed in the main chart
   const displayedData = useMemo(() => {
      return data.slice(range.start, range.end + 1);
   }, [data, range]);

   return (
      <div className="w-full h-[580px] bg-slate-950 border border-slate-900 rounded p-4 relative flex flex-col overflow-hidden">
         {/* Header */}
         <div className="flex justify-between items-start mb-2 z-10">
            <div>
               <h3 className="text-slate-200 text-sm font-bold tracking-wider uppercase">Gamma Exposure Profile</h3>
               <p className="text-xs text-slate-600 font-mono">Real-time Notional ($B)</p>
            </div>
            <div className="flex bg-slate-900 rounded p-0.5 border border-slate-800">
               {(["1D", "1W", "1M"] as const).map((tf) => (
                  <button
                     key={tf}
                     onClick={() => onChangeTimeframe?.(tf)}
                     className={clsx(
                        "px-3 py-1 text-xs font-mono font-bold rounded transition-all duration-200",
                        timeframe === tf ? "bg-indigo-600 text-white shadow-lg scale-105" : "text-slate-500 hover:text-slate-300"
                     )}
                  >
                     {tf}
                  </button>
               ))}
            </div>
         </div>

         {/* Main Chart View with AnimatePresence for timeframe switching */}
         <div className="flex-1 w-full min-h-0 relative">
            <AnimatePresence mode="popLayout">
               <motion.div
                  key={timeframe}
                  initial={{ opacity: 0, scale: 0.9, filter: "brightness(2) blur(10px)" }}
                  animate={{ opacity: 1, scale: 1, filter: "brightness(1) blur(0px)" }}
                  exit={{ opacity: 0, scale: 1.1, filter: "brightness(0.5) blur(10px)" }}
                  transition={{
                     duration: 0.5,
                     ease: [0.23, 1, 0.32, 1], // Custom cubic-bezier for "zoom" feel
                     opacity: { duration: 0.3 }
                  }}
                  className="w-full h-full absolute inset-0"
               >
                  <ResponsiveContainer width="100%" height="100%">
                     <ComposedChart
                        data={displayedData}
                        margin={{ top: 20, right: 30, left: 10, bottom: 5 }}
                        stackOffset="sign"
                     >
                        <defs>
                           <linearGradient id="colorCall" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#34d399" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#34d399" stopOpacity={0.1} />
                           </linearGradient>
                           <linearGradient id="colorPut" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.8} />
                              <stop offset="95%" stopColor="#f43f5e" stopOpacity={0.1} />
                           </linearGradient>
                        </defs>

                        <XAxis
                           dataKey="strike"
                           stroke="#334155"
                           tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                           tickLine={false}
                           axisLine={false}
                           minTickGap={10}
                        />
                        <YAxis
                           stroke="#334155"
                           tick={{ fill: "#64748b", fontSize: 10, fontFamily: "monospace" }}
                           tickFormatter={(val) => `$${val}B`}
                           axisLine={false}
                           tickLine={false}
                           width={40}
                        />
                        <Tooltip
                           content={<CustomTooltip />}
                           cursor={{ stroke: 'rgba(255,255,255,0.1)', strokeWidth: 1, strokeDasharray: '4 4' }}
                           animationDuration={200}
                        />

                        <ReferenceLine y={0} stroke="#1e293b" strokeWidth={1} />

                        <ReferenceLine
                           x={Math.round(spotPrice / 10) * 10}
                           stroke="#f59e0b"
                           strokeDasharray="4 4"
                           strokeWidth={2}
                           label={{
                              value: "SPOT",
                              position: 'insideTop',
                              fill: '#f59e0b',
                              fontSize: 10,
                              fontFamily: "monospace",
                              dy: -10
                           }}
                        />

                        <Bar
                           dataKey="callGamma"
                           barSize={18}
                           fill="url(#colorCall)"
                           stroke="#34d399"
                           strokeWidth={1}
                           radius={[2, 2, 0, 0]}
                           animationDuration={600}
                           cursor="pointer"
                        />
                        <Bar
                           dataKey="putGamma"
                           barSize={18}
                           fill="url(#colorPut)"
                           stroke="#f43f5e"
                           strokeWidth={1}
                           radius={[0, 0, 2, 2]}
                           animationDuration={600}
                           cursor="pointer"
                        />
                     </ComposedChart>
                  </ResponsiveContainer>
               </motion.div>
            </AnimatePresence>
         </div>

         {/* The Control Slider (Invisible Chart + Visible Brush) */}
         <div className="w-full h-[40px] mt-2 border-t border-slate-900 pt-2 px-10">
            <ResponsiveContainer width="100%" height="100%">
               <BarChart data={brushData}>
                  <XAxis dataKey="strike" hide />
                  <Brush
                     dataKey="strike"
                     height={20}
                     stroke="#475569"
                     fill="#0f172a"
                     tickFormatter={() => ''}
                     travellerWidth={10}
                     onChange={(e: { startIndex?: number; endIndex?: number }) => {
                        if (e.startIndex !== undefined && e.endIndex !== undefined) {
                           setRange({ start: e.startIndex, end: e.endIndex });
                        }
                     }}
                  />
               </BarChart>
            </ResponsiveContainer>
         </div>
      </div>
   );
}
