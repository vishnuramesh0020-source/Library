import { useState } from 'react';
import { X, AlertTriangle, Trash2, ArrowRight } from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryService } from '../../services/categoryService';

export default function DeleteCategoryModal({ isOpen, onClose, category, allCategories = [], onSuccess }) {
  const [submitting, setSubmitting] = useState(false);
  const [reassignTarget, setReassignTarget] = useState('General Collection');

  if (!isOpen || !category) return null;

  const affectedBooksCount = category.bookCount || 0;
  const availableAlternatives = allCategories.filter((c) => String(c.id) !== String(category.id));

  const handleDelete = () => {
    setSubmitting(true);
    try {
      const res = categoryService.deleteCategory(category.id, {
        reassignTo: reassignTarget
      });

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess();
        onClose();
      } else {
        toast.error(res.message || 'Failed to remove category.');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-rose-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-rose-100 text-rose-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Delete Category</h3>
              <p className="text-xs text-slate-500">Confirm removal of classification</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-4">
          <p className="text-sm text-slate-700">
            Are you sure you want to delete the category{' '}
            <strong className="text-slate-900 font-bold">"{category.name}"</strong>?
          </p>

          {affectedBooksCount > 0 ? (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                <span>{affectedBooksCount} book(s) currently belong to this category</span>
              </div>
              <p className="text-xs text-amber-800">
                To prevent orphaned catalog titles, select an existing category where these books will be reassigned:
              </p>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-wider text-amber-900 mb-1">
                  Reassign Books To:
                </label>
                <select
                  value={reassignTarget}
                  onChange={(e) => setReassignTarget(e.target.value)}
                  className="w-full px-3 py-2 text-xs font-semibold rounded-lg border border-amber-300 bg-white text-slate-800 outline-hidden"
                >
                  <option value="General Collection">General Collection (Recommended)</option>
                  {availableAlternatives.map((cat) => (
                    <option key={cat.id} value={cat.name}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          ) : (
            <p className="text-xs text-slate-500">
              No catalog books are currently assigned to this category. It can be safely removed.
            </p>
          )}

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={submitting}
              className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-xl shadow-xs transition-colors cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>{submitting ? 'Removing...' : 'Delete Category'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
