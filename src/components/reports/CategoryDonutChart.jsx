import { useState } from 'react';
import { PieChart, Layers } from 'lucide-react';

export default function CategoryDonutChart({ categories = [], totalCopies = 0 }) {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [viewMode, setViewMode] = useState('donut'); // 'donut' | 'bars'

  // Dynamic Total Calculation
  const catalogTotal =
    totalCopies > 0
      ? totalCopies
      : categories.reduce((sum, c) => sum + (parseInt(c.totalCopies, 10) || 0), 0) || 1;

  // SVG Geometry Settings
  const radius = 68;
  const strokeWidth = 22;
  const circumference = 2 * Math.PI * radius;

  // Pre-calculate precise SVG slice offsets
  let accumulatedLength = 0;
  const renderedSlices = categories.map((cat) => {
    const share = catalogTotal > 0 ? (parseInt(cat.totalCopies, 10) || 0) / catalogTotal : 0;
    const strokeDash = share * circumference;
    const strokeOffset = -accumulatedLength;
    accumulatedLength += strokeDash;

    return {
      ...cat,
      share,
      strokeDash,
      strokeOffset
    };
  });

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/80 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <PieChart className="w-4 h-4 text-amber-600" />
              Category-wise Book Distribution
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {categories.length} Disciplines
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Holistic breakdown of repository copies across academic classifications
          </p>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-slate-100 p-0.5 rounded-xl text-xs font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setViewMode('donut')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'donut' ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Donut
          </button>
          <button
            type="button"
            onClick={() => setViewMode('bars')}
            className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
              viewMode === 'bars' ? 'bg-white text-indigo-600 font-bold shadow-2xs' : 'hover:text-slate-900'
            }`}
          >
            Bars
          </button>
        </div>
      </div>

      {viewMode === 'donut' ? (
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Donut Graphic Hub */}
          <div className="md:col-span-5 flex justify-center py-2 relative">
            <div className="relative w-52 h-52 sm:w-60 sm:h-60">
              <svg
                className="w-full h-full -rotate-90 transform overflow-visible"
                viewBox="0 0 180 180"
              >
                {/* Background Ring */}
                <circle
                  cx="90"
                  cy="90"
                  r={radius}
                  fill="none"
                  stroke="#f1f5f9"
                  strokeWidth={strokeWidth}
                />

                {/* Slices with correct negative offset and clean uniform geometry */}
                {renderedSlices.map((cat, idx) => {
                  const isHovered = hoveredCategory?.name === cat.name;
                  const isAnyHovered = hoveredCategory !== null;

                  // Apply a tiny 1.5px gap between slices if there are multiple slices
                  const gap = categories.length > 1 ? 1.5 : 0;
                  const dashLength = Math.max(0.5, cat.strokeDash - gap);

                  return (
                    <circle
                      key={idx}
                      cx="90"
                      cy="90"
                      r={radius}
                      fill="none"
                      stroke={cat.color || '#6366f1'}
                      strokeWidth={isHovered ? strokeWidth + 2 : strokeWidth}
                      strokeDasharray={`${dashLength} ${circumference}`}
                      strokeDashoffset={cat.strokeOffset}
                      strokeLinecap="butt"
                      className="cursor-pointer transition-all duration-200"
                      style={{
                        opacity: isAnyHovered ? (isHovered ? 1 : 0.45) : 1,
                        filter: isHovered ? 'drop-shadow(0 2px 6px rgba(0,0,0,0.15))' : 'none'
                      }}
                      onMouseEnter={() => setHoveredCategory(cat)}
                      onMouseLeave={() => setHoveredCategory(null)}
                    />
                  );
                })}
              </svg>

              {/* Center Informational Badge - Displays FULL category name without truncation */}
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-4 select-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 max-w-[140px] text-center leading-snug line-clamp-2 px-1">
                  {hoveredCategory ? hoveredCategory.name : 'Total Catalog'}
                </span>
                <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight my-0.5 font-mono">
                  {hoveredCategory ? hoveredCategory.totalCopies : catalogTotal}
                </span>
                <span className="text-xs font-semibold text-indigo-600">
                  {hoveredCategory
                    ? `${hoveredCategory.percentage}% of stock`
                    : `${categories.length} Disciplines`}
                </span>
              </div>
            </div>
          </div>

          {/* Interactive Legend & Details List */}
          <div className="md:col-span-7 space-y-2 max-h-64 overflow-y-auto pr-1">
            {categories.map((cat, idx) => {
              const isSelected = hoveredCategory?.name === cat.name;
              return (
                <div
                  key={idx}
                  onMouseEnter={() => setHoveredCategory(cat)}
                  onMouseLeave={() => setHoveredCategory(null)}
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex items-center justify-between gap-3 ${
                    isSelected
                      ? 'bg-slate-50 border-indigo-300 shadow-xs ring-1 ring-indigo-200'
                      : 'border-slate-100 hover:bg-slate-50/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span
                      style={{ backgroundColor: cat.color }}
                      className="w-3 h-3 rounded-full shrink-0 shadow-2xs"
                    ></span>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">{cat.name}</p>
                      <p className="text-[11px] text-slate-400">
                        {cat.titleCount} titles • {cat.availableCopies} available shelf stock
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold text-slate-900 font-mono">{cat.totalCopies} copies</p>
                    <span className="text-[11px] font-semibold text-slate-500">
                      {cat.percentage}%
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* Horizontal Progress Bars View */
        <div className="space-y-3 pt-2">
          {categories.map((cat, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between items-center text-xs">
                <span className="font-semibold text-slate-700">{cat.name}</span>
                <span className="font-mono text-slate-500">
                  {cat.totalCopies} copies ({cat.percentage}%)
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
                <div
                  style={{
                    width: `${cat.percentage}%`,
                    backgroundColor: cat.color || '#6366f1'
                  }}
                  className="h-full rounded-full transition-all duration-500"
                ></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
