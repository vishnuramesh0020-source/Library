import { useState, useId } from 'react';
import { X, Calculator, IndianRupee, Calendar, Clock, AlertCircle } from 'lucide-react';

export default function FineCalculatorModal({ isOpen, onClose }) {
  const [days, setDays] = useState(7);
  const [rate, setRate] = useState(10);
  const [dueDate, setDueDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d.toISOString().split('T')[0];
  });
  const [returnDate, setReturnDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [calcMode, setCalcMode] = useState('days'); // 'days' | 'dates'

  const daysSliderId = useId();
  const daysInputId = useId();
  const rateInputId = useId();
  const dueDateInputId = useId();
  const returnDateInputId = useId();

  if (!isOpen) return null;

  // Compute calculated days and fine
  let computedDays = days;
  if (calcMode === 'dates') {
    if (dueDate && returnDate) {
      const diffMs = new Date(returnDate) - new Date(dueDate);
      computedDays = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
    } else {
      computedDays = 0;
    }
  }

  const computedFine = computedDays * rate;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <Calculator className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Overdue Fine Calculator</h3>
              <p className="text-xs text-slate-500">Interactive penalty estimation tool</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          
          {/* Mode Switcher */}
          <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setCalcMode('days')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcMode === 'days' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calculate by Overdue Days
            </button>
            <button
              type="button"
              onClick={() => setCalcMode('dates')}
              className={`flex-1 py-1.5 rounded-lg transition-all cursor-pointer ${
                calcMode === 'dates' ? 'bg-white text-indigo-700 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Calculate by Dates (Due & Return)
            </button>
          </div>

          {/* Mode 1: Days */}
          {calcMode === 'days' ? (
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor={daysSliderId} className="text-xs font-bold text-slate-700">Days Overdue</label>
                  <span className="text-xs font-bold text-indigo-600">{days} Days</span>
                </div>
                <input
                  id={daysSliderId}
                  type="range"
                  min="0"
                  max="60"
                  value={days}
                  onChange={(e) => setDays(parseInt(e.target.value, 10))}
                  className="w-full accent-indigo-600 cursor-pointer"
                />
                <div className="flex gap-2 mt-2">
                  {[3, 7, 14, 21, 30].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setDays(preset)}
                      className={`px-2.5 py-1 text-xs rounded-lg border transition-all cursor-pointer ${
                        days === preset
                          ? 'border-indigo-600 bg-indigo-50 text-indigo-700 font-bold'
                          : 'border-slate-200 text-slate-600 hover:border-slate-300'
                      }`}
                    >
                      +{preset}d
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor={daysInputId} className="block text-xs font-bold text-slate-700 mb-1">
                  Manual Overdue Days Input
                </label>
                <input
                  id={daysInputId}
                  type="number"
                  min="0"
                  max="365"
                  value={days}
                  onChange={(e) => setDays(Math.max(0, parseInt(e.target.value || 0, 10)))}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>
          ) : (
            /* Mode 2: Dates */
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor={dueDateInputId} className="block text-xs font-bold text-slate-700 mb-1">
                  Scheduled Due Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Calendar className="w-4 h-4" />
                  </div>
                  <input
                    id={dueDateInputId}
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
              </div>

              <div>
                <label htmlFor={returnDateInputId} className="block text-xs font-bold text-slate-700 mb-1">
                  Actual Return Date
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Clock className="w-4 h-4" />
                  </div>
                  <input
                    id={returnDateInputId}
                    type="date"
                    value={returnDate}
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Daily Rate Input */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <label htmlFor={rateInputId} className="text-xs font-bold text-slate-700">Daily Fine Rate (₹ INR)</label>
              <span className="text-[11px] text-slate-500">Standard Policy: ₹10 / day</span>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <IndianRupee className="w-4 h-4" />
              </div>
              <input
                id={rateInputId}
                type="number"
                min="1"
                step="1"
                value={rate}
                onChange={(e) => setRate(Math.max(1, parseInt(e.target.value || 1, 10)))}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>
          </div>

          {/* Result Card */}
          <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-900 to-slate-900 text-white shadow-md">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-300 block">
                  Calculated Fine Amount
                </span>
                <span className="text-3xl font-black tracking-tight text-white mt-1 block">
                  ₹{computedFine.toLocaleString()}
                </span>
              </div>
              <div className="text-right text-xs text-indigo-200 space-y-0.5">
                <p><span className="font-bold text-white">{computedDays}</span> days overdue</p>
                <p>× <span className="font-bold text-white">₹{rate}</span> per day</p>
              </div>
            </div>

            <div className="mt-3 pt-3 border-t border-indigo-700/60 flex items-center gap-1.5 text-[11px] text-indigo-200">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400 shrink-0" />
              <span>Fines are automatically applied upon passing the return due date.</span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/50 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
          >
            Close Calculator
          </button>
        </div>

      </div>
    </div>
  );
}
