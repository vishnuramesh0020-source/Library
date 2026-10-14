import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, PlusCircle, Book, Hash } from 'lucide-react';
import { toast } from 'react-toastify';
import { dashboardService } from '../../services/dashboardService';
import { bookService } from '../../services/bookService';

const generateFallbackIsbn = () => `978-${Math.floor(1000000000 + Math.random() * 9000000000)}`;
const getCurrentYear = () => new Date().getFullYear();

export default function AddBookModal({ isOpen, onClose, onActionSuccess }) {
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      category: 'Computer Science',
      copies: 1,
      isbn: ''
    }
  });

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    await bookService.addBook({
      title: data.title,
      author: 'Academic Faculty / Staff',
      category: data.category,
      isbn: data.isbn || generateFallbackIsbn(),
      publisher: 'University Press',
      publishedYear: getCurrentYear(),
      totalCopies: Number(data.copies),
      availableCopies: Number(data.copies),
      description: 'Acquisition cataloged via quick dashboard action.'
    });
    dashboardService.recordNewBook({
      title: data.title,
      category: data.category,
      copies: data.copies
    });
    setSubmitting(false);
    toast.success(`"${data.title}" added to library catalog!`);
    reset();
    onActionSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
              <PlusCircle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Add New Book Title</h3>
              <p className="text-xs text-slate-500">Catalog a new title into the library repository</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Title & Author
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Book className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. The Pragmatic Programmer"
                {...register('title', { required: 'Book title is required' })}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>
            {errors.title && (
              <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category
              </label>
              <div className="relative rounded-lg">
                <select
                  {...register('category')}
                  className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white cursor-pointer"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Literature & Fiction">Literature & Fiction</option>
                  <option value="Engineering & Tech">Engineering & Tech</option>
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="History & Biography">History & Biography</option>
                  <option value="Philosophy & Ethics">Philosophy & Ethics</option>
                  <option value="Mathematics & Logic">Mathematics & Logic</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Number of Copies
              </label>
              <input
                type="number"
                min="1"
                max="500"
                {...register('copies', { required: 'Copies count is required' })}
                className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              ISBN / Catalog Code (Optional)
            </label>
            <div className="relative rounded-lg">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Hash className="w-4 h-4" />
              </div>
              <input
                type="text"
                placeholder="e.g. 978-0132350884"
                {...register('isbn')}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              Add to Catalog
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
