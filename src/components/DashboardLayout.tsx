"use client";

import React, { ReactNode } from "react";
import { MoveUp, MoveDown } from "lucide-react";
import clsx from "clsx";

interface DashboardLayoutProps {
   children: ReactNode;
   spotPrice: number;
   status: string;
   regime: string;
}

export function DashboardLayout({
   children,
   spotPrice,
   status,
   regime,
}: DashboardLayoutProps) {
   const [prevPrice, setPrevPrice] = React.useState(spotPrice);
   const [direction, setDirection] = React.useState<"up" | "down" | "neutral">(
      "neutral"
   );

   React.useEffect(() => {
      if (spotPrice > prevPrice) setDirection("up");
      else if (spotPrice < prevPrice) setDirection("down");
      setPrevPrice(spotPrice);

      // Reset direction after flash
      const timer = setTimeout(() => setDirection("neutral"), 300);
      return () => clearTimeout(timer);
   }, [spotPrice, prevPrice]);

   return (
      <div className="min-h-screen bg-background text-slate-400 font-sans selection:bg-bullish selection:text-black">
         {/* Header */}
         <header className="border-b border-slate-800 bg-[#0a0a0a]/80 backdrop-blur-md sticky top-0 z-50">
            <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
               <div className="flex items-center gap-6">
                  {/* Logo */}
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded flex items-center justify-center font-bold text-white text-xs tracking-tighter shadow-[0_0_15px_rgba(99,102,241,0.5)]">
                        DBX
                     </div>
                     <span className="text-white font-bold tracking-tight text-lg">
                        BLU X
                     </span>
                  </div>

                  {/* Ticker */}
                  <div className="hidden md:flex items-center gap-2 px-3 py-1 bg-slate-900 rounded border border-slate-800 text-white cursor-pointer hover:border-slate-700 transition-colors">
                     <span className="font-mono font-bold text-cyan-400">SPX</span>
                     <span className="text-xs text-slate-500">S&P 500 Index</span>
                  </div>
               </div>

               <div className="flex items-center gap-8">
                  {/* Live Price */}
                  <div className="flex flex-col items-end">
                     <div className="flex items-center gap-2">
                        <span
                           className={clsx(
                              "text-2xl font-mono font-bold transition-colors duration-300",
                              direction === "up" && "text-bullish drop-shadow-[0_0_8px_rgba(52,211,153,0.5)]",
                              direction === "down" && "text-bearish drop-shadow-[0_0_8px_rgba(244,63,94,0.5)]",
                              direction === "neutral" && "text-white"
                           )}
                        >
                           {spotPrice.toFixed(2)}
                        </span>
                        {direction === "up" && <MoveUp className="w-4 h-4 text-bullish animate-bounce" />}
                        {direction === "down" && <MoveDown className="w-4 h-4 text-bearish animate-bounce" />}
                     </div>
                     <span className="text-xs font-mono text-slate-500">LIVE SPOT</span>
                  </div>

                  {/* Status Badges */}
                  <div className="flex gap-2">
                     <Badge label="MARKET" value={status} active={status === "OPEN"} />
                     <Badge label="REGIME" value={regime} active={regime === "VOLATILE"} panic={regime === "VOLATILE"} />
                  </div>
               </div>
            </div>
         </header>

         {/* Main Content */}
         <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
            {children}
         </main>
      </div>
   );
}

function Badge({ label, value, active, panic }: { label: string, value: string, active?: boolean, panic?: boolean }) {
   return (
      <div className={clsx(
         "flex items-center gap-2 px-3 py-1.5 rounded-sm border text-xs font-mono tracking-widest uppercase",
         active ? "bg-emerald-950/30 border-emerald-900 text-emerald-400" : "bg-slate-900 border-slate-800 text-slate-500",
         panic && "bg-rose-950/30 border-rose-900 text-rose-500 animate-pulse"
      )}>
         {active && <div className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />}
         <span className="opacity-70">{label}:</span>
         <span className="font-bold">{value}</span>
      </div>
   )
}
