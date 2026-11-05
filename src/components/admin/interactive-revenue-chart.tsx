"use client";

import React, { useState, useRef } from "react";
import { ChevronDown, Calendar, Layers } from "lucide-react";

interface DataPoint {
  date: string;
  shortDate: string;
  thisWeek: number; // in thousands (e.g. 54 = 54M Rp or 54K)
  lastWeek: number;
}

const CHART_DATA: DataPoint[] = [
  { date: "16 Okt", shortDate: "16 Okt", thisWeek: 42, lastWeek: 37 },
  { date: "17 Okt", shortDate: "17 Okt", thisWeek: 50, lastWeek: 47 },
  { date: "18 Okt", shortDate: "18 Okt", thisWeek: 44, lastWeek: 48 },
  { date: "19 Okt", shortDate: "19 Okt", thisWeek: 54, lastWeek: 41 },
  { date: "20 Okt", shortDate: "20 Okt", thisWeek: 52, lastWeek: 55 },
  { date: "21 Okt", shortDate: "21 Okt", thisWeek: 48, lastWeek: 51 },
  { date: "22 Okt", shortDate: "22 Okt", thisWeek: 64, lastWeek: 47 },
];

export function InteractiveRevenueChart() {
  const [hoverIndex, setHoverIndex] = useState<number>(3); // Default at 19 Okt like in reference
  const [timeframe, setTimeframe] = useState<"Mingguan" | "Bulanan">("Mingguan");
  const svgRef = useRef<SVGSVGElement>(null);

  // Chart dimensions in viewBox coordinates
  const width = 800;
  const height = 240;
  const paddingX = 40;
  const paddingTop = 20;
  const paddingBottom = 40;

  const minY = 30;
  const maxY = 70;

  // Calculate (x, y) coordinates for data points
  const pointsThisWeek = CHART_DATA.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (CHART_DATA.length - 1);
    const y =
      height -
      paddingBottom -
      ((d.thisWeek - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);
    return { x, y, val: d.thisWeek };
  });

  const pointsLastWeek = CHART_DATA.map((d, i) => {
    const x = paddingX + (i * (width - 2 * paddingX)) / (CHART_DATA.length - 1);
    const y =
      height -
      paddingBottom -
      ((d.lastWeek - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);
    return { x, y, val: d.lastWeek };
  });

  // Generate smooth cubic Bezier path
  const getCubicBezierPath = (points: { x: number; y: number }[]) => {
    if (points.length === 0) return "";
    let d = `M ${points[0].x},${points[0].y}`;
    for (let i = 0; i < points.length - 1; i++) {
      const p0 = points[Math.max(i - 1, 0)];
      const p1 = points[i];
      const p2 = points[i + 1];
      const p3 = points[Math.min(i + 2, points.length - 1)];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePathThisWeek = getCubicBezierPath(pointsThisWeek);
  const linePathLastWeek = getCubicBezierPath(pointsLastWeek);

  const baselineY = height - paddingBottom;
  const areaPathThisWeek = `${linePathThisWeek} L ${pointsThisWeek[pointsThisWeek.length - 1].x},${baselineY} L ${pointsThisWeek[0].x},${baselineY} Z`;
  const areaPathLastWeek = `${linePathLastWeek} L ${pointsLastWeek[pointsLastWeek.length - 1].x},${baselineY} L ${pointsLastWeek[0].x},${baselineY} Z`;

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement>) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const mouseX = ((e.clientX - rect.left) / rect.width) * width;
    
    // Find closest data point
    let closestIndex = 0;
    let closestDist = Infinity;
    pointsThisWeek.forEach((p, index) => {
      const dist = Math.abs(p.x - mouseX);
      if (dist < closestDist) {
        closestDist = dist;
        closestIndex = index;
      }
    });
    setHoverIndex(closestIndex);
  };

  const activePointThisWeek = pointsThisWeek[hoverIndex];
  const activePointLastWeek = pointsLastWeek[hoverIndex];
  const activeData = CHART_DATA[hoverIndex];

  return (
    <div className="rounded-2xl bg-[var(--surface-card)] border border-[var(--border-subtle)] p-5 sm:p-6 shadow-[var(--shadow-card)]">
      {/* Chart Card Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4">
        <div>
          <h2 className="text-sm font-semibold text-[var(--text-secondary)]">
            Total Revenue & Optimasi Margin
          </h2>
          <div className="flex items-baseline gap-3 mt-1">
            <span className="text-2xl sm:text-3xl font-extrabold text-[var(--text-primary)] tracking-tight">
              Rp 352.804.000
            </span>
            <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400">
              +10.25% vs minggu lalu
            </span>
          </div>
        </div>

        {/* Filters & Legend */}
        <div className="flex items-center flex-wrap gap-3 text-xs">
          {/* Legend */}
          <div className="flex items-center gap-4 mr-2">
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-indigo-500" />
              <span className="text-[var(--text-muted)] font-medium">Minggu ini</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 rounded-full bg-cyan-500" />
              <span className="text-[var(--text-muted)] font-medium">Minggu lalu</span>
            </div>
          </div>

          {/* Date Range Pill */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-secondary)] font-medium shadow-2xs">
            <Calendar className="w-3.5 h-3.5 text-[var(--text-muted)]" />
            <span>16 Okt 2024 - 22 Okt 2024</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] ml-0.5" />
          </div>

          {/* Granularity Pill */}
          <button
            type="button"
            onClick={() => setTimeframe((prev) => (prev === "Mingguan" ? "Bulanan" : "Mingguan"))}
            className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[var(--border-default)] bg-[var(--surface-card)] text-[var(--text-secondary)] font-medium shadow-2xs hover:bg-[var(--surface-subtle)] transition-colors"
          >
            <span>{timeframe}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </button>
        </div>
      </div>

      {/* SVG Spline Chart Canvas */}
      <div className="relative w-full overflow-hidden select-none">
        <svg
          ref={svgRef}
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-56 sm:h-64 cursor-crosshair overflow-visible"
          onMouseMove={handleMouseMove}
        >
          <defs>
            {/* Violet/Indigo Gradient Fill */}
            <linearGradient id="violetGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.28" />
              <stop offset="60%" stopColor="#818cf8" stopOpacity="0.08" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.00" />
            </linearGradient>

            {/* Cyan Gradient Fill */}
            <linearGradient id="cyanGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.22" />
              <stop offset="60%" stopColor="#22d3ee" stopOpacity="0.06" />
              <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines (horizontal) */}
          {[70, 60, 50, 40, 30].map((val) => {
            const y =
              height -
              paddingBottom -
              ((val - minY) / (maxY - minY)) * (height - paddingTop - paddingBottom);
            return (
              <g key={val}>
                <line
                  x1={paddingX}
                  y1={y}
                  x2={width - paddingX}
                  y2={y}
                  stroke="currentColor"
                  className="text-[var(--border-subtle)]"
                  strokeWidth="1"
                />
                <text
                  x={paddingX - 12}
                  y={y + 4}
                  textAnchor="end"
                  className="fill-[var(--text-subtle)] text-[11px] font-medium"
                >
                  {val} Jt
                </text>
              </g>
            );
          })}

          {/* Area Fills */}
          <path d={areaPathLastWeek} fill="url(#cyanGradient)" />
          <path d={areaPathThisWeek} fill="url(#violetGradient)" />

          {/* Spline Lines */}
          <path
            d={linePathLastWeek}
            fill="none"
            stroke="#06b6d4"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d={linePathThisWeek}
            fill="none"
            stroke="#6366f1"
            strokeWidth="2.5"
            strokeLinecap="round"
          />

          {/* Data Points on Curves */}
          {pointsLastWeek.map((p, idx) => (
            <circle
              key={`last-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5 : 3.5}
              fill="#ffffff"
              stroke="#06b6d4"
              strokeWidth="2.5"
              className="transition-all duration-150"
            />
          ))}

          {pointsThisWeek.map((p, idx) => (
            <circle
              key={`this-${idx}`}
              cx={p.x}
              cy={p.y}
              r={hoverIndex === idx ? 5.5 : 3.5}
              fill="#ffffff"
              stroke="#6366f1"
              strokeWidth="2.5"
              className="transition-all duration-150"
            />
          ))}

          {/* Vertical Crosshair Line on Hover */}
          {activePointThisWeek && (
            <line
              x1={activePointThisWeek.x}
              y1={paddingTop}
              x2={activePointThisWeek.x}
              y2={height - paddingBottom}
              stroke="#6366f1"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              className="opacity-75"
            />
          )}

          {/* X Axis Labels */}
          {CHART_DATA.map((d, idx) => {
            const x =
              paddingX + (idx * (width - 2 * paddingX)) / (CHART_DATA.length - 1);
            const isSelected = hoverIndex === idx;
            return (
              <text
                key={d.date}
                x={x}
                y={height - 12}
                textAnchor="middle"
                className={`text-[11px] transition-colors ${
                  isSelected
                    ? "fill-[var(--brand-primary)] font-bold"
                    : "fill-[var(--text-muted)] font-medium"
                }`}
              >
                {d.shortDate}
              </text>
            );
          })}
        </svg>

        {/* Interactive Floating Tooltip Badge (positioned directly above cursor) */}
        {activePointThisWeek && (
          <div
            style={{
              left: `${(activePointThisWeek.x / width) * 100}%`,
              top: `${(Math.min(activePointThisWeek.y, activePointLastWeek.y) / height) * 100 - 18}%`,
            }}
            className="absolute -translate-x-1/2 pointer-events-none z-10 hidden sm:flex flex-col gap-1 p-2 rounded-xl bg-[var(--surface-card)] border border-[var(--border-default)] shadow-lg animate-in fade-in duration-150 min-w-[110px]"
          >
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-[var(--text-muted)] font-medium">
                {activeData.date}
              </span>
              <span className="font-bold text-indigo-600 dark:text-indigo-400 px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60">
                Rp {activeData.thisWeek} Jt
              </span>
            </div>
            <div className="flex items-center justify-between gap-3 text-[11px]">
              <span className="text-[var(--text-muted)] font-medium">Baseline</span>
              <span className="font-bold text-cyan-600 dark:text-cyan-400 px-1.5 py-0.5 rounded bg-cyan-50 dark:bg-cyan-950/60">
                Rp {activeData.lastWeek} Jt
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
