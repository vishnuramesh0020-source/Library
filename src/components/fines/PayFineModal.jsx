import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  IndianRupee,
  CreditCard,
  QrCode,
  Banknote,
  Building,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  User,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fineService } from '../../services/fineService';

export default function PayFineModal({ isOpen, onClose, fineRecord, onSuccess, onViewReceipt }) {
  const [submitting, setSubmitting] = useState(false);
  const [selectedMethod, setSelectedMethod] = useState('UPI');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      amount: '',
      remarks: '',
      paymentMethod: 'UPI'
    }
  });

  useEffect(() => {
    if (fineRecord) {
      setValue('amount', fineRecord.fineAmount || 0);
      setValue('paymentMethod', 'UPI');
      setSelectedMethod('UPI');
      setValue('remarks', `Settlement for ${fineRecord.overdueDays || 1} days overdue loan`);
    }
  }, [fineRecord, setValue]);

  if (!isOpen || !fineRecord) return null;

  const paymentMethods = [
    { id: 'UPI', label: 'UPI / QR Code', icon: QrCode, desc: 'Instant UPI transfer' },
    { id: 'Cash', label: 'Cash at Desk', icon: Banknote, desc: 'Physical currency' },
    { id: 'Card', label: 'Debit / Credit Card', icon: CreditCard, desc: 'POS machine swipe' },
    { id: 'Net Banking', label: 'Net Banking', icon: Building, desc: 'Bank wire / IMPS' }
  ];

  const onSubmit = (data) => {
    setSubmitting(true);
    try {
      const res = fineService.payFine(fineRecord.loanId, {
        paymentMethod: selectedMethod,
        amount: data.amount,
        remarks: data.remarks
      });

      if (res.success) {
        toast.success(`Fine of ₹${data.amount} successfully paid! Receipt #${res.receiptNumber}`);
        reset();
        if (onSuccess) onSuccess();
        onClose();
        if (onViewReceipt) {
          onViewReceipt({
            ...fineRecord,
            fineAmount: parseFloat(data.amount),
            fineStatus: 'Paid',
            paymentDate: res.paymentDate,
            paymentMethod: selectedMethod,
            receiptNumber: res.receiptNumber,
            remarks: data.remarks
          });
        }
      } else {
        toast.error(res.message || 'Failed to process payment');
      }
    } catch {
      toast.error('An unexpected error occurred while processing payment');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60">
              <IndianRupee className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Settle Overdue Fine</h3>
              <p className="text-xs text-slate-500">Record fine payment and issue clearance receipt</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Member & Book Preview Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Member Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                <span>Borrower</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={fineRecord.memberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                  alt={fineRecord.memberName}
                  className="w-10 h-10 rounded-full object-cover ring-2 ring-indigo-500/20"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 truncate">{fineRecord.memberName}</p>
                  <p className="text-[11px] font-mono text-slate-500">{fineRecord.membershipId}</p>
                  <p className="text-[11px] text-slate-400 truncate">{fineRecord.memberPhone}</p>
                </div>
              </div>
            </div>

            {/* Book Details */}
            <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                <span>Book Title</span>
              </div>
              <div className="flex items-center gap-3">
                <img
                  src={fineRecord.bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                  alt={fineRecord.bookTitle}
                  className="w-8 h-11 rounded object-cover shadow-xs border border-slate-200 shrink-0"
                />
                <div className="min-w-0">
                  <p className="text-xs font-bold text-slate-900 line-clamp-1">{fineRecord.bookTitle}</p>
                  <p className="text-[11px] text-slate-500 truncate">{fineRecord.bookAuthor}</p>
                  <p className="text-[11px] font-mono text-slate-400">ISBN: {fineRecord.bookIsbn}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Overdue Calculation Banner */}
          <div className="p-4 rounded-xl bg-amber-50/70 border border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-bold text-amber-900">Fine Calculation Breakdown</span>
              </div>
              <p className="text-xs text-amber-800">
                Due Date: <span className="font-semibold">{fineRecord.dueDate}</span>
                {fineRecord.returnDate ? (
                  <> • Returned: <span className="font-semibold">{fineRecord.returnDate}</span></>
                ) : (
                  <> • <span className="text-rose-600 font-semibold">Still On-Loan</span></>
                )}
              </p>
              <p className="text-[11px] text-amber-700">
                Overdue duration: <strong className="text-amber-900">{fineRecord.overdueDays} days</strong> × Standard rate of <strong>₹{fineRecord.dailyRate || 10}/day</strong>
              </p>
            </div>
            <div className="text-right sm:border-l sm:border-amber-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600 block">Total Due</span>
              <span className="text-2xl font-black text-amber-900">₹{fineRecord.fineAmount}</span>
            </div>
          </div>

          {/* Payment Form */}
          <form id="fine-payment-form" onSubmit={handleSubmit(onSubmit)} className="space-y-4" noValidate>
            
            {/* Payment Method Selector */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-2">
                Select Payment Mode
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {paymentMethods.map((pm) => {
                  const Icon = pm.icon;
                  const isSelected = selectedMethod === pm.id;
                  return (
                    <button
                      key={pm.id}
                      type="button"
                      onClick={() => {
                        setSelectedMethod(pm.id);
                        setValue('paymentMethod', pm.id);
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                        isSelected
                          ? 'border-indigo-600 bg-indigo-50/50 shadow-xs ring-1 ring-indigo-500'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <Icon className={`w-4 h-4 ${isSelected ? 'text-indigo-600' : 'text-slate-500'}`} />
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-indigo-600" />}
                      </div>
                      <span className="text-xs font-bold text-slate-800">{pm.label}</span>
                      <span className="text-[10px] text-slate-400 mt-0.5">{pm.desc}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Payment Amount & Remarks */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Amount Received (₹ INR) *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <IndianRupee className="w-4 h-4" />
                  </div>
                  <input
                    type="number"
                    step="1"
                    min="1"
                    {...register('amount', {
                      required: 'Payment amount is required',
                      min: { value: 1, message: 'Amount must be at least ₹1' }
                    })}
                    className="w-full pl-9 pr-3 py-2 text-sm font-semibold rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
                {errors.amount && (
                  <p className="mt-1 text-xs text-rose-600">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Transaction Notes / Receipt Ref
                </label>
                <input
                  type="text"
                  placeholder="e.g. UPI Ref / Cash register"
                  {...register('remarks')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>

          </form>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-slate-100 bg-slate-50/50 flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-xs text-slate-500">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span>Updates ledger and syncs to Dashboard</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="fine-payment-form"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Recording...' : 'Confirm Settlement'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
