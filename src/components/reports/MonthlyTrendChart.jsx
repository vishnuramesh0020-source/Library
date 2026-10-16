import { useState } from 'react';
import { BarChart3, TrendingUp, Calendar, Info } from 'lucide-react';

export default function MonthlyTrendChart({ data, timeRange = '12m', onTimeRangeChange }) {
  const [activeItem, setActiveItem] = useState(null);
  const [chartType, setChartType] = useState('bar'); // 'bar' | 'area'

  // Filter based on selected time range
  const displayData = timeRange === '6m' ? data.slice(-6) : data;

  const maxVal = Math.max(
    ...displayData.map((d) => Math.max(d.issued, d.returned)),
    200
  );

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header with Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-indigo-600" />
              Monthly Circulation Trend (Issues vs Returns)
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              Interactive Telemetry
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Compare monthly monograph loans against return completions to evaluate library throughput
          </p>
        </div>

        {/* Chart View & Time Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {/* Time range toggle */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => onTimeRangeChange && onTimeRangeChange('6m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === '6m'
                  ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Last 6M
            </button>
            <button
              type="button"
              onClick={() => onTimeRangeChange && onTimeRangeChange('12m')}
              className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                timeRange === '12m'
                  ? 'bg-white text-indigo-600 font-bold shadow-2xs'
                  : 'hover:text-slate-900'
              }`}
            >
              Last 12M
            </button>
          </div>

          {/* Chart type switch */}
          <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
            <button
              type="button"
              onClick={() => setChartType('bar')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                chartType === 'bar' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Grouped Bar Chart"
            >
              <BarChart3 className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setChartType('area')}
              className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                chartType === 'area' ? 'bg-white text-indigo-600 shadow-2xs' : 'hover:text-slate-900'
              }`}
              title="Continuous Trend Curves"
            >
              <TrendingUp className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Legend & Hovered Data Readout */}
      <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50/70 p-3 rounded-xl border border-slate-100">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-3 rounded-md bg-indigo-600 inline-block shadow-2xs"></span>
            <span>Books Issued</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-700">
            <span className="w-3 h-3 rounded-md bg-emerald-500 inline-block shadow-2xs"></span>
            <span>Books Returned</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 font-medium text-slate-500">
            <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
            <span>Overdue Notices</span>
          </div>
        </div>

        {activeItem ? (
          <div className="flex items-center gap-3 font-mono font-semibold text-xs">
            <span className="text-slate-900">{activeItem.fullMonth}:</span>
            <span className="text-indigo-600">{activeItem.issued} Issued</span>
            <span className="text-slate-300">|</span>
            <span className="text-emerald-600">{activeItem.returned} Returned</span>
            <span className="text-slate-300">|</span>
            <span className="text-rose-500">{activeItem.overdue} Overdue</span>
          </div>
        ) : (
          <span className="text-[11px] text-slate-400 italic">
            Hover over any column or point for detailed monthly breakdown
          </span>
        )}
      </div>

      {/* Chart Canvas Area */}
      <div className="relative pt-6 pb-2 select-none">
        {/* Background Grid Lines */}
        <div className="absolute inset-0 top-6 bottom-8 flex flex-col justify-between pointer-events-none opacity-40">
          <div className="border-b border-dashed border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-1">
            {maxVal}
          </div>
          <div className="border-b border-dashed border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-1">
            {Math.round(maxVal * 0.75)}
          </div>
          <div className="border-b border-dashed border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-1">
            {Math.round(maxVal * 0.5)}
          </div>
          <div className="border-b border-dashed border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-1">
            {Math.round(maxVal * 0.25)}
          </div>
          <div className="border-b border-slate-200 w-full flex justify-end text-[10px] text-slate-400 pr-1">
            0
          </div>
        </div>

        {/* Bar View Mode */}
        {chartType === 'bar' && (
          <div className="relative z-10 h-64 flex items-end justify-between gap-1 sm:gap-2 px-2 sm:px-4">
            {displayData.map((d, idx) => {
              const issuedHeight = Math.max(8, Math.round((d.issued / maxVal) * 220));
              const returnedHeight = Math.max(8, Math.round((d.returned / maxVal) * 220));
              const isHovered = activeItem?.label === d.label;

              return (
                <div
                  key={idx}
                  onMouseEnter={() => setActiveItem(d)}
                  onMouseLeave={() => setActiveItem(null)}
                  className="flex-1 flex flex-col items-center h-full justify-end group cursor-pointer"
                >
                  {/* Grouped Bars Container */}
                  <div className="w-full flex items-end justify-center gap-1 sm:gap-1.5 h-56 transition-transform group-hover:scale-y-[1.02] origin-bottom">
                    {/* Issued Bar */}
                    <div
                      style={{ height: `${issuedHeight}px` }}
                      className={`w-full max-w-[14px] sm:max-w-[18px] rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-indigo-700 shadow-md ring-2 ring-indigo-400/40'
                          : 'bg-indigo-600/90 group-hover:bg-indigo-600'
                      }`}
                    ></div>

                    {/* Returned Bar */}
                    <div
                      style={{ height: `${returnedHeight}px` }}
                      className={`w-full max-w-[14px] sm:max-w-[18px] rounded-t-md transition-all duration-200 ${
                        isHovered
                          ? 'bg-emerald-600 shadow-md ring-2 ring-emerald-400/40'
                          : 'bg-emerald-500/90 group-hover:bg-emerald-500'
                      }`}
                    ></div>
                  </div>

                  {/* Month Label */}
                  <div className="mt-2 text-center">
                    <span
                      className={`text-[11px] font-semibold transition-colors block ${
                        isHovered ? 'text-indigo-600 font-bold' : 'text-slate-500'
                      }`}
                    >
                      {d.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Continuous Area / Line View Mode (Clean SVG) */}
        {chartType === 'area' && (
          <div className="relative z-10 h-64 px-2 sm:px-4">
            <svg
              className="w-full h-56 overflow-visible"
              viewBox={`0 0 1000 220`}
              preserveAspectRatio="none"
            >
              <defs>
                <linearGradient id="issuedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366f1" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                </linearGradient>
                <linearGradient id="returnedGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity="0.3" />
                  <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Compute coordinates */}
              {(() => {
                const count = displayData.length;
                const stepX = 1000 / (count - 1 || 1);
                const issuedPoints = displayData.map((d, i) => {
                  const x = i * stepX;
                  const y = 220 - (d.issued / maxVal) * 200;
                  return `${x},${y}`;
                });
                const returnedPoints = displayData.map((d, i) => {
                  const x = i * stepX;
                  const y = 220 - (d.returned / maxVal) * 200;
                  return `${x},${y}`;
                });

                const issuedArea = `M 0,220 L ${issuedPoints.join(' L ')} L 1000,220 Z`;
                const returnedArea = `M 0,220 L ${returnedPoints.join(' L ')} L 1000,220 Z`;

                return (
                  <>
                    {/* Shaded Areas */}
                    <path d={issuedArea} fill="url(#issuedGrad)" />
                    <path d={returnedArea} fill="url(#returnedGrad)" />

                    {/* Strokes */}
                    <path
                      d={`M ${issuedPoints.join(' L ')}`}
                      fill="none"
                      stroke="#4f46e5"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                    <path
                      d={`M ${returnedPoints.join(' L ')}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeDasharray="4 2"
                    />

                    {/* Data Points */}
                    {displayData.map((d, i) => {
                      const x = i * stepX;
                      const yIssued = 220 - (d.issued / maxVal) * 200;
                      const yRet = 220 - (d.returned / maxVal) * 200;
                      const isHovered = activeItem?.label === d.label;

                      return (
                        <g
                          key={i}
                          className="cursor-pointer group"
                          onMouseEnter={() => setActiveItem(d)}
                          onMouseLeave={() => setActiveItem(null)}
                        >
                          {/* Vertical marker line on hover */}
                          {isHovered && (
                            <line
                              x1={x}
                              y1="0"
                              x2={x}
                              y2="220"
                              stroke="#6366f1"
                              strokeWidth="1.5"
                              strokeDasharray="3 3"
                            />
                          )}
                          {/* Issued Circle */}
                          <circle
                            cx={x}
                            cy={yIssued}
                            r={isHovered ? 6 : 4}
                            fill="#4f46e5"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-all"
                          />
                          {/* Returned Circle */}
                          <circle
                            cx={x}
                            cy={yRet}
                            r={isHovered ? 5 : 3.5}
                            fill="#10b981"
                            stroke="#ffffff"
                            strokeWidth="2"
                            className="transition-all"
                          />
                        </g>
                      );
                    })}
                  </>
                );
              })()}
            </svg>

            {/* X-axis labels */}
            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mt-2 px-1">
              {displayData.map((d, i) => (
                <span
                  key={i}
                  className={`cursor-pointer transition-colors ${
                    activeItem?.label === d.label ? 'text-indigo-600 font-bold' : ''
                  }`}
                  onMouseEnter={() => setActiveItem(d)}
                  onMouseLeave={() => setActiveItem(null)}
                >
                  {d.label}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Summary Footer Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-100 text-xs text-slate-600">
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Period Issues</p>
          <p className="text-sm font-extrabold text-indigo-700 mt-0.5">
            {displayData.reduce((s, i) => s + i.issued, 0).toLocaleString()} Books
          </p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Total Period Returns</p>
          <p className="text-sm font-extrabold text-emerald-700 mt-0.5">
            {displayData.reduce((s, i) => s + i.returned, 0).toLocaleString()} Books
          </p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Period Return Rate</p>
          <p className="text-sm font-extrabold text-slate-800 mt-0.5">
            {(
              (displayData.reduce((s, i) => s + i.returned, 0) /
                (displayData.reduce((s, i) => s + i.issued, 0) || 1)) *
              100
            ).toFixed(1)}
            %
          </p>
        </div>
        <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
          <p className="text-[10px] uppercase font-bold text-slate-400">Peak Month Activity</p>
          <p className="text-sm font-extrabold text-violet-700 mt-0.5">
            {displayData.reduce((max, d) => (d.issued > max.issued ? d : max), displayData[0])?.fullMonth || 'August'}
          </p>
        </div>
      </div>
    </div>
  );
}
