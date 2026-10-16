import { Calendar, Flame, Users, BookOpen } from 'lucide-react';

export default function WeeklyRhythmChart({ weeklyData, memberTiers }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Weekly Circulation Rhythm (7 cols) */}
      <div className="lg:col-span-7 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Weekly Circulation Velocity & Peak Days
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Daily issue distribution showing student footfall and peak loan checkouts
            </p>
          </div>
          <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Flame className="w-3 h-3 text-emerald-600" />
            Wednesdays Peak
          </span>
        </div>

        {/* Bar chart for Days of the week */}
        <div className="pt-4 pb-2">
          <div className="h-44 flex items-end justify-between gap-2 sm:gap-4 px-2">
            {weeklyData.map((d, idx) => (
              <div key={idx} className="flex-1 flex flex-col items-center h-full justify-end group">
                <span className="text-[10px] font-mono font-bold text-slate-400 group-hover:text-indigo-600 transition-colors mb-1.5 opacity-0 group-hover:opacity-100">
                  {d.count}
                </span>
                <div className="w-full max-w-[28px] sm:max-w-[36px] bg-slate-100 rounded-t-lg h-36 flex items-end p-0.5">
                  <div
                    style={{ height: `${d.percentage}%` }}
                    className={`w-full rounded-t-md transition-all duration-300 ${
                      d.peak
                        ? 'bg-gradient-to-t from-indigo-600 to-indigo-500 shadow-sm'
                        : 'bg-indigo-400/80 group-hover:bg-indigo-500'
                    }`}
                  ></div>
                </div>
                <div className="mt-2 text-center">
                  <span
                    className={`text-xs font-bold block ${
                      d.peak ? 'text-indigo-600' : 'text-slate-600'
                    }`}
                  >
                    {d.day}
                  </span>
                  <span className="text-[10px] text-slate-400 hidden sm:block truncate max-w-[50px]">
                    {d.count} loans
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>* Measured across 4-week moving average</span>
          <span className="font-semibold text-slate-700">Highest checkout window: 11 AM - 3 PM</span>
        </div>
      </div>

      {/* Active Member Distribution by Classification (5 cols) */}
      <div className="lg:col-span-5 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-4 h-4 text-violet-600" />
              Active Member Classifications
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Demographic breakdown of authorized library cardholders
            </p>
          </div>
        </div>

        <div className="space-y-3 pt-1">
          {memberTiers.map((tier, idx) => {
            const totalMembers = memberTiers.reduce((s, t) => s + t.count, 0) || 1;
            const pct = Math.round((tier.count / totalMembers) * 100);

            return (
              <div key={idx} className="p-3 bg-slate-50/70 rounded-xl border border-slate-100 space-y-1.5">
                <div className="flex justify-between items-center text-xs">
                  <div>
                    <span className="font-bold text-slate-800">{tier.role}</span>
                    <span className="text-[11px] text-slate-400 block">{tier.badge}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-extrabold text-slate-900">{tier.count}</span>
                    <span className="text-[11px] text-slate-400 ml-1">({pct}%)</span>
                  </div>
                </div>

                <div className="w-full bg-slate-200/70 rounded-full h-2 overflow-hidden">
                  <div
                    style={{ width: `${pct}%` }}
                    className={`h-full rounded-full ${tier.color} transition-all duration-500`}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span>Borrowing limits: Students (3), Faculty (10)</span>
          <span className="font-semibold text-indigo-600">All Active Status</span>
        </div>
      </div>
    </div>
  );
}
