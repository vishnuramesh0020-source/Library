import { AlertTriangle, Trash2, X } from 'lucide-react';

export default function MemberDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  memberName,
  membershipId,
  isDeleting = false
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-150">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-red-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-red-100 text-red-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Confirm Member Deletion</h3>
              <p className="text-xs text-slate-500">Revoke membership credentials</p>
            </div>
          </div>
          <button
            onClick={onClose}
            disabled={isDeleting}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-3">
          <p className="text-sm text-slate-600 leading-relaxed">
            Are you sure you want to remove member <strong className="text-slate-900 font-bold">{memberName || 'this member'}</strong>?
          </p>
          {membershipId && (
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 font-mono text-xs text-slate-700 flex items-center justify-between">
              <span className="text-slate-400 font-sans">Membership ID:</span>
              <span className="font-bold text-indigo-600">{membershipId}</span>
            </div>
          )}
          <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
            ⚠️ This will revoke their library card, erase local account privileges, and archive their record.
          </p>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-slate-50/70 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isDeleting}
            className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-200/60 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={isDeleting}
            className="px-4 py-2 text-xs sm:text-sm font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
          >
            <Trash2 className="w-4 h-4" />
            <span>{isDeleting ? 'Removing...' : 'Delete Member'}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
