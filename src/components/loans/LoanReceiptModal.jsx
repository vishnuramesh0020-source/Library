import { X, Printer, BookOpen } from 'lucide-react';

export default function LoanReceiptModal({ isOpen, onClose, loan }) {
  if (!isOpen || !loan) return null;

  const isReturned = loan.status === 'Returned';
  const isOverdue = loan.status === 'Overdue';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-indigo-600" />
            <h3 className="text-sm font-bold text-slate-900">Circulation Voucher & Receipt</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Receipt Slip Body */}
        <div className="p-6 space-y-4">
          
          {/* Institution Header */}
          <div className="text-center pb-3 border-b border-dashed border-slate-200">
            <h2 className="text-base font-extrabold tracking-tight text-slate-900">
              ATHENAEUM CENTRAL LIBRARY
            </h2>
            <p className="text-[11px] text-slate-500">Official Monograph Loan Circulation Slip</p>
            <p className="text-xs font-mono font-bold text-indigo-600 mt-1">Transaction Ref: #{loan.id}</p>
          </div>

          {/* Status Badge */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-xs">
            <span className="text-slate-500 font-semibold uppercase text-[10px]">Loan Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full font-bold text-[11px] border ${
                isReturned
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                  : isOverdue
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-blue-50 text-blue-700 border-blue-200'
              }`}
            >
              {loan.status}
            </span>
          </div>

          {/* Borrower Record */}
          <div className="space-y-1.5 text-xs text-slate-700 border-b border-slate-100 pb-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Borrower Member</span>
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900">{loan.memberName}</span>
              <span className="font-mono text-indigo-600 font-semibold">{loan.membershipId}</span>
            </div>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>{loan.memberEmail}</span>
              <span className="font-mono">{loan.memberPhone}</span>
            </div>
          </div>

          {/* Monograph Item */}
          <div className="space-y-1.5 text-xs text-slate-700 border-b border-slate-100 pb-3">
            <span className="text-[10px] text-slate-400 uppercase font-bold block">Circulated Monograph</span>
            <p className="font-bold text-slate-900">{loan.bookTitle}</p>
            <div className="flex items-center justify-between text-slate-500 text-[11px]">
              <span>Author: {loan.bookAuthor}</span>
              <span className="font-mono text-slate-600">ISBN: {loan.bookIsbn}</span>
            </div>
          </div>

          {/* Key Dates Grid */}
          <div className="grid grid-cols-3 gap-2 text-center text-xs p-3 rounded-xl bg-slate-50 border border-slate-100">
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Issue Date</span>
              <span className="font-mono font-bold text-slate-800">{loan.issueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Due Date</span>
              <span className="font-mono font-bold text-indigo-600">{loan.dueDate}</span>
            </div>
            <div>
              <span className="text-[10px] text-slate-400 uppercase font-semibold block">Return Date</span>
              <span className="font-mono font-bold text-slate-800">{loan.returnDate || 'Pending'}</span>
            </div>
          </div>

          {/* Remarks & Fine */}
          <div className="flex items-center justify-between text-xs pt-1">
            <span className="text-slate-500 text-[11px] truncate max-w-[280px]">
              Notes: {loan.remarks || 'Standard academic borrowing'}
            </span>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase block font-semibold">Fine Fee</span>
              <span className="text-sm font-extrabold text-slate-900 font-mono">
                ₹{loan.fineAmount || 0}
              </span>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl shadow-2xs transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Printer className="w-4 h-4 text-slate-500" />
            <span>Print Voucher</span>
          </button>
        </div>

      </div>
    </div>
  );
}
