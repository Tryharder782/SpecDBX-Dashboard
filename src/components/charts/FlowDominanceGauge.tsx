"use client";

import React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import clsx from "clsx";

interface FlowGaugeProps {
   flowDominance: number; // 0-100 (Altcoin Season %)
}

export function FlowDominanceGauge({ flowDominance }: FlowGaugeProps) {
   // Data for the gauge: [Bitcoin Season %, Altcoin Season %]
   const data = [
      { name: "Bitcoin Season", value: 100 - flowDominance },
      { name: "Altcoin Season", value: flowDominance },
   ];

   const COLORS = ["#f43f5e", "#34d399"];

   // Needle angle calculation (approximate for 180 semi-circle)
   // 0% -> 180 deg (Left, Put heavy?? No wait. )
   // Gauge usually: Left (0) to Right (100).
   // 0% Calls = All Puts (Red). 100% Calls = All Calls (Green).
   // startAngle 180 (Left) -> endAngle 0 (Right).

   return (
      <div className="w-full h-[300px] bg-slate-900/50 border border-slate-800 rounded p-4 flex flex-col items-center justify-center relative">
         <div className="absolute top-4 left-4">
            <h3 className="text-slate-400 text-sm font-semibold tracking-wider uppercase">Season Gauge</h3>
            <p className="text-xs text-slate-600 font-mono">Altcoin vs Bitcoin</p>
         </div>

         <div className="w-full h-[200px] mt-8 relative">
            <ResponsiveContainer width="100%" height="100%">
               <PieChart>
                  <Pie
                     data={data}
                     cx="50%"
                     cy="100%" // Semi-circle at bottom
                     startAngle={180}
                     endAngle={0}
                     innerRadius={60}
                     outerRadius={80}
                     paddingAngle={2}
                     dataKey="value"
                     stroke="none"
                     animationDuration={500}
                  >
                     {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index]} />
                     ))}
                  </Pie>
                  <Tooltip
                     contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '4px' }}
                     itemStyle={{ color: '#94a3b8', fontFamily: 'monospace' }}
                  />
               </PieChart>
            </ResponsiveContainer>

            {/* Center Text */}
            <div className="absolute bottom-0 w-full text-center pb-2">
               <div className="text-3xl font-mono font-bold text-white tracking-widest">
                  {flowDominance}%
               </div>
               <div className={clsx(
                  "text-xs font-mono tracking-widest uppercase font-bold",
                  flowDominance >= 60 ? "text-emerald-400" : "text-rose-500"
               )}>
                  {flowDominance >= 60 ? "ALTCOIN SEASON" : "BITCOIN SEASON"}
               </div>
            </div>
         </div>

         <div className="flex w-full justify-between px-8 mt-2 text-xs font-mono text-slate-500">
            <span className="text-rose-500">BITCOIN</span>
            <span className="text-emerald-400">ALTCOINS</span>
         </div>
      </div>
   );
}
