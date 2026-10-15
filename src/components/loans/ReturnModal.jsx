import { useState, useMemo } from 'react';
import {
  X,
  RotateCcw,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  Check
} from 'lucide-react';
import { toast } from 'react-toastify';
import { loanService } from '../../services/loanService';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function ReturnModal({
  isOpen,
  onClose,
  loan,
  onSuccess
}) {
  const [returnDate, setReturnDate] = useState(getTodayString());
  const [returnRemarks, setReturnRemarks] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Calculate overdue days and fine dynamically based on selected return date
  const overdueCalculation = useMemo(() => {
    if (!loan || !loan.dueDate || !returnDate) {
      return { isLate: false, daysLate: 0, fine: 0 };
    }
    const due = new Date(loan.dueDate);
    const ret = new Date(returnDate);

    if (ret > due) {
      const diffMs = ret - due;
      const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      return {
        isLate: true,
        daysLate: days,
        fine: days * 10 // ₹10 per day
      };
    }

    return { isLate: false, daysLate: 0, fine: 0 };
  }, [loan, returnDate]);

  if (!isOpen || !loan) return null;

  const handleConfirmReturn = () => {
    setSubmitting(true);
    const res = loanService.returnBook(loan.id, returnDate, returnRemarks);
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      onSuccess?.(res.loan);
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Return Book / Check-In</h3>
              <p className="text-xs text-slate-500">Record check-in, update shelf stock, and resolve loans</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={submitting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          
          {/* Loan Metadata Summary */}
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
            
            {/* Book Details */}
            <div className="flex items-center gap-3">
              <img
                src={loan.bookCover}
                alt={loan.bookTitle}
                className="w-12 h-16 object-cover rounded-lg shadow-2xs border border-slate-200 shrink-0"
                onError={(e) => {
                  e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                }}
              />
              <div className="min-w-0 flex-1">
                <span className="text-[10px] font-mono text-slate-400 block uppercase">
                  Loan Ref: {loan.id}
                </span>
                <h4 className="text-sm font-bold text-slate-900 truncate" title={loan.bookTitle}>
                  {loan.bookTitle}
                </h4>
                <p className="text-xs text-slate-500 truncate">{loan.bookAuthor}</p>
                <p className="text-[11px] font-mono text-indigo-600">ISBN: {loan.bookIsbn}</p>
              </div>
            </div>

            {/* Borrower Member Details */}
            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <img
                  src={loan.memberAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(loan.memberName)}`}
                  alt={loan.memberName}
                  className="w-7 h-7 rounded-lg object-cover ring-1 ring-slate-200 bg-white"
                />
                <div>
                  <span className="font-bold text-slate-800">{loan.memberName}</span>
                  <span className="text-slate-400 font-mono ml-1.5 text-[11px]">({loan.membershipId})</span>
                </div>
              </div>
            </div>

            {/* Dates Bar */}
            <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 text-xs">
              <div>
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issue Date</span>
                <span className="font-mono text-slate-700">{loan.issueDate}</span>
              </div>
              <div className="text-right">
                <span className="text-[10px] text-slate-400 uppercase font-semibold block">Due Date</span>
                <span className="font-mono font-bold text-slate-800">{loan.dueDate}</span>
              </div>
            </div>

          </div>

          {/* Actual Return Date Picker */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Actual Return Date <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Calendar className="w-3.5 h-3.5" />
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
              />
            </div>
          </div>

          {/* Overdue & Fine Status Notice */}
          {overdueCalculation.isLate ? (
            <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 space-y-1 animate-in fade-in">
              <div className="flex items-center justify-between font-bold text-xs">
                <span className="flex items-center gap-1.5 text-amber-700">
                  <AlertTriangle className="w-4 h-4 text-amber-600" />
                  Overdue Return Detected
                </span>
                <span className="font-mono text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md">
                  {overdueCalculation.daysLate} Days Late
                </span>
              </div>
              <div className="flex items-center justify-between text-xs pt-1">
                <span className="text-slate-600">Late Penalty (Standard ₹10/day):</span>
                <span className="text-sm font-extrabold text-amber-800 font-mono">
                  ₹{overdueCalculation.fine}
                </span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-between text-xs animate-in fade-in">
              <span className="flex items-center gap-1.5 font-bold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                On-Time Return
              </span>
              <span className="font-mono font-semibold text-emerald-700">₹0 Penalty</span>
            </div>
          )}

          {/* Condition / Return Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Condition & Return Notes
            </label>
            <input
              type="text"
              value={returnRemarks}
              onChange={(e) => setReturnRemarks(e.target.value)}
              placeholder="e.g. Returned in good condition, spine intact"
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
            />
          </div>

        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirmReturn}
            disabled={submitting}
            className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            <span>{submitting ? 'Processing Return...' : 'Confirm Return & Restore Stock'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
