"use client";

import React from "react";

import { useMarketData } from "@/hooks/useMarketData";
import { DashboardLayout } from "@/components/DashboardLayout";
import { GammaExposureChart } from "@/components/charts/GammaExposureChart";
import { FlowDominanceGauge } from "@/components/charts/FlowDominanceGauge";

export default function Home() {
  const { spotPrice, gammaExposure, flowDominance, status, regime, timeframe, changeTimeframe } = useMarketData();

  return (
    <DashboardLayout spotPrice={spotPrice} status={status} regime={regime}>
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* Main Chart Section (Gamma) */}
        <div className="lg:col-span-8 space-y-4">
          {/* <div className="bg-slate-900/40 p-1 rounded-t flex items-center justify-between px-3 border-b border-slate-800"> // REMOVED HEADER as it's now internal to chart
            <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Analysis // GEX</span>
          </div> */}
          <GammaExposureChart
            data={gammaExposure}
            spotPrice={spotPrice}
            timeframe={timeframe}
            onChangeTimeframe={changeTimeframe}
          />

          {/* Placeholder for secondary info or volume */}
          <div className="grid grid-cols-3 gap-4 mt-4">
            <MetricCard label="Net GEX" value="+$4.2B" trend="bullish" />
            <MetricCard label="Zero Gamma" value="4815" />
            <MetricCard label="Vol Risk" value="High" trend="bearish" />
          </div>
        </div>

        {/* Side Panel (Flow & Stats) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Flow Gauge */}
          <div className="space-y-4">
            <div className="bg-slate-900/40 p-1 rounded-t flex items-center justify-between px-3 border-b border-slate-800">
              <span className="text-xs font-mono text-slate-500 uppercase tracking-wider">Sentiment // Flow</span>
            </div>
            <FlowDominanceGauge flowDominance={flowDominance} />
          </div>

          {/* Additional Data List */}
          <div className="bg-slate-900/20 border border-slate-800 rounded p-4">
            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Market Internals</h4>
            <div className="space-y-3 font-mono text-sm">
              <Row label="VIX" value="13.45" change="+1.2%" changeColor="text-bullish" />
              <Row label="PC Ratio" value="0.85" change="-0.02" changeColor="text-bearish" />
              <Row label="Dark Pool" value="42%" />
              <Row label="Gamma Flip" value="4780" />
            </div>
          </div>

          <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded p-4">
            <div className="flex items-center gap-2 mb-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
              <h4 className="text-indigo-300 text-xs font-bold uppercase tracking-wider">AI Signal</h4>
            </div>
            <p className="text-sm text-indigo-100/80 leading-relaxed">
              Bullish divergence detected on flow dominance. Gamma support strengthening at 4800.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

import { motion, useSpring, useTransform } from "framer-motion";

function AnimatedNumber({ value }: { value: string }) {
  const numericValue = parseFloat(value.replace(/[^0-9.-]/g, ''));
  const suffix = value.replace(/[0-9.-]/g, '');
  const spring = useSpring(numericValue, { stiffness: 50, damping: 15 });
  const display = useTransform(spring, (latest) =>
    (latest < 0 ? '-' : '') + (suffix.startsWith('$') ? '$' : '') + Math.abs(latest).toFixed(2) + (suffix.endsWith('%') || suffix.endsWith('B') ? suffix.replace('$', '') : '')
  );

  React.useEffect(() => {
    spring.set(numericValue);
  }, [numericValue, spring]);

  return <motion.span>{display}</motion.span>;
}

function MetricCard({ label, value, trend }: { label: string, value: string, trend?: "bullish" | "bearish" }) {
  // Check if it's a numeric value we can animate
  const isNumeric = /[0-9]/.test(value) && !value.includes(':');

  return (
    <div className="bg-slate-900/30 border border-slate-800 p-3 rounded flex flex-col items-center justify-center hover:bg-slate-800/50 transition-colors group overflow-hidden">
      <span className="text-xs text-slate-500 uppercase tracking-wider mb-1 group-hover:text-slate-300 transition-colors">{label}</span>
      <div className={clsx(
        "text-lg font-mono font-bold",
        trend === "bullish" ? "text-bullish" : trend === "bearish" ? "text-bearish" : "text-white"
      )}>
        {isNumeric ? <AnimatedNumber value={value} /> : value}
      </div>
    </div>
  )
}

function Row({ label, value, change, changeColor }: { label: string, value: string, change?: string, changeColor?: string }) {
  return (
    <div className="flex justify-between items-center group">
      <span className="text-slate-500 group-hover:text-slate-400 transition-colors">{label}</span>
      <div className="flex gap-3">
        <span className="text-white">{value}</span>
        {change && <span className={changeColor || "text-slate-400"}>{change}</span>}
      </div>
    </div>
  )
}

import clsx from "clsx";
