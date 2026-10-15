import { X, Printer, IndianRupee, CheckCircle2, ShieldCheck, BookOpen, User } from 'lucide-react';

export default function FineReceiptModal({ isOpen, onClose, record }) {
  if (!isOpen || !record) return null;

  const handlePrint = () => {
    window.print();
  };

  const receiptNumber = record.receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
  const paymentDate = record.paymentDate || new Date().toISOString().split('T')[0];
  const paymentMethod = record.paymentMethod || 'Desk Cash / UPI';
  const fineAmount = record.fineAmount || 0;
  const overdueDays = record.overdueDays || 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between px-6 py-3.5 border-b border-slate-100 bg-slate-50/80 print:hidden">
          <div className="flex items-center gap-2">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Settlement Slip Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Receipt Paper */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-6 flex-1 bg-white text-slate-800">
          
          {/* Header */}
          <div className="border-b-2 border-slate-900 pb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white">
                  <BookOpen className="w-4 h-4" />
                </div>
                <h1 className="text-xl font-black text-slate-900 tracking-tight">Athenaeum Central Library</h1>
              </div>
              <p className="text-xs text-slate-500">University Campus • Academic Circulation Division</p>
              <p className="text-[11px] text-slate-400">Library Service Center • New Delhi 110025</p>
            </div>

            <div className="text-left sm:text-right">
              <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold mb-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>CLEARED / PAID</span>
              </div>
              <p className="text-xs font-mono font-bold text-slate-800">{receiptNumber}</p>
              <p className="text-[11px] text-slate-500">Date: {paymentDate}</p>
            </div>
          </div>

          {/* Subtitle */}
          <div className="text-center py-1 border-b border-slate-100">
            <span className="text-xs font-bold uppercase tracking-widest text-slate-600">
              Official Overdue Fine Clearance Voucher
            </span>
          </div>

          {/* Member & Book Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            {/* Borrower Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                <User className="w-3 h-3 text-indigo-500" /> Borrower Profile
              </span>
              <p className="text-sm font-bold text-slate-900">{record.memberName}</p>
              <p className="font-mono text-slate-600 font-medium">Card: {record.membershipId}</p>
              <p className="text-slate-500">{record.memberEmail}</p>
              <p className="text-slate-500">{record.memberPhone}</p>
            </div>

            {/* Book Details */}
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1.5">
              <span className="text-[10px] font-bold uppercase text-slate-400 block tracking-wider flex items-center gap-1">
                <BookOpen className="w-3 h-3 text-indigo-500" /> Monograph Details
              </span>
              <p className="text-sm font-bold text-slate-900 line-clamp-1">{record.bookTitle}</p>
              <p className="text-slate-600">Author: {record.bookAuthor}</p>
              <p className="font-mono text-slate-500">ISBN: {record.bookIsbn}</p>
              <p className="text-slate-500">Category: {record.bookCategory || 'General Collection'}</p>
            </div>
          </div>

          {/* Circulation Dates & Timeline */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Issue Date</span>
              <span className="font-semibold text-slate-800">{record.issueDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Scheduled Due Date</span>
              <span className="font-semibold text-rose-600">{record.dueDate || 'N/A'}</span>
            </div>
            <div>
              <span className="text-[10px] font-semibold uppercase text-slate-400 block">Settled / Returned</span>
              <span className="font-semibold text-slate-800">{record.returnDate || paymentDate}</span>
            </div>
          </div>

          {/* Assessment Breakdown Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden text-xs">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold text-[10px]">
                <tr>
                  <th className="px-4 py-2.5">Penalty Description</th>
                  <th className="px-4 py-2.5 text-center">Duration</th>
                  <th className="px-4 py-2.5 text-center">Daily Tariff</th>
                  <th className="px-4 py-2.5 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-slate-800 block">Overdue Retention Fee</span>
                    <span className="text-[11px] text-slate-400">Circulation rule #LMS-SEC-4</span>
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700">
                    {overdueDays} Day{overdueDays !== 1 ? 's' : ''}
                  </td>
                  <td className="px-4 py-3 text-center font-medium text-slate-700">
                    ₹{record.dailyRate || 10}.00
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">
                    ₹{fineAmount}.00
                  </td>
                </tr>
              </tbody>
              <tfoot className="bg-slate-50/80 border-t border-slate-200">
                <tr>
                  <td colSpan="3" className="px-4 py-2.5 font-bold text-right text-slate-700">
                    Total Amount Settled:
                  </td>
                  <td className="px-4 py-2.5 text-right font-black text-sm text-indigo-700">
                    ₹{fineAmount}.00
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Payment Mode & Stamp */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Payment Mode:</span> {paymentMethod}
              </p>
              <p className="text-[11px] text-slate-500">
                <span className="font-semibold text-slate-700">Reference:</span> {record.receiptNumber || receiptNumber}
              </p>
              {record.remarks && (
                <p className="text-[11px] text-slate-500 italic max-w-sm">
                  "{record.remarks}"
                </p>
              )}
            </div>

            {/* Official Stamp Box */}
            <div className="border border-dashed border-emerald-300 rounded-xl p-3 bg-emerald-50/40 text-center w-48">
              <div className="flex items-center justify-center gap-1 text-emerald-700 font-bold text-xs uppercase tracking-wider mb-0.5">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Clean</span>
              </div>
              <p className="text-[10px] text-slate-500">Athenaeum Library Registry</p>
              <p className="text-[9px] text-slate-400 font-mono mt-1">{new Date().toLocaleDateString()}</p>
            </div>
          </div>

          {/* Footer Terms */}
          <div className="pt-4 border-t border-slate-100 text-[10px] text-slate-400 text-center space-y-0.5">
            <p>Computer-generated clearance voucher. No physical signature required.</p>
            <p>Borrower borrowing privileges are reinstated upon full settlement of outstanding overdue fees.</p>
          </div>

        </div>

        {/* Action Bar (Hidden in Print) */}
        <div className="px-6 py-3.5 border-t border-slate-100 bg-slate-50/80 flex items-center justify-between print:hidden">
          <span className="text-xs text-slate-500">Receipt saved to transaction history</span>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-4 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="px-4 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors cursor-pointer"
            >
              Done
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
