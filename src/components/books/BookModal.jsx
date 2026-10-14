import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, BookPlus, Edit3, Image, BookOpen, Layers, Hash, Building2, Calendar, Copy } from 'lucide-react';
import { toast } from 'react-toastify';
import { bookService } from '../../services/bookService';

export default function BookModal({ isOpen, onClose, onSuccess, initialBook = null, mode = 'add' }) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      title: '',
      author: '',
      isbn: '',
      publisher: '',
      category: 'Computer Science',
      publishedYear: new Date().getFullYear(),
      totalCopies: 5,
      availableCopies: 5,
      coverImage: '',
      description: ''
    }
  });

  const watchedCover = watch('coverImage');

  useEffect(() => {
    if (initialBook && isEdit) {
      reset({
        title: initialBook.title || '',
        author: initialBook.author || '',
        isbn: initialBook.isbn || '',
        publisher: initialBook.publisher || '',
        category: initialBook.category || 'Computer Science',
        publishedYear: initialBook.publishedYear || new Date().getFullYear(),
        totalCopies: initialBook.totalCopies || 5,
        availableCopies: initialBook.availableCopies || 5,
        coverImage: initialBook.coverImage || '',
        description: initialBook.description || ''
      });
    } else {
      reset({
        title: '',
        author: '',
        isbn: '',
        publisher: '',
        category: 'Computer Science',
        publishedYear: new Date().getFullYear(),
        totalCopies: 5,
        availableCopies: 5,
        coverImage: '',
        description: ''
      });
    }
  }, [initialBook, isEdit, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = async (data) => {
    setSubmitting(true);
    if (isEdit && initialBook) {
      const res = await bookService.updateBook(initialBook.id, data);
      setSubmitting(false);
      if (res.success) {
        toast.success(`"${data.title}" updated successfully!`);
        onSuccess(res.book);
        onClose();
      } else {
        toast.error(res.message || 'Failed to update book.');
      }
    } else {
      const res = await bookService.addBook(data);
      setSubmitting(false);
      if (res.success) {
        toast.success(`"${data.title}" added to catalog!`);
        onSuccess(res.book);
        onClose();
      } else {
        toast.error('Failed to add new book.');
      }
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isEdit ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isEdit ? <Edit3 className="w-5 h-5" /> : <BookPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Book Details' : 'Add New Book'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update metadata, inventory counts, or synopsis' : 'Catalog a new accession into library inventory'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4" noValidate>
          
          {/* Title & Author */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Book Title <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <BookOpen className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Clean Code"
                  {...register('title', { required: 'Book title is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
              {errors.title && (
                <p className="mt-1 text-xs text-red-600">{errors.title.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Author Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Robert C. Martin"
                {...register('author', { required: 'Author name is required' })}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
              />
              {errors.author && (
                <p className="mt-1 text-xs text-red-600">{errors.author.message}</p>
              )}
            </div>
          </div>

          {/* ISBN & Publisher */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                ISBN Number <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. 978-0132350884"
                  {...register('isbn', { required: 'ISBN number is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
              {errors.isbn && (
                <p className="mt-1 text-xs text-red-600">{errors.isbn.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Publisher <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Building2 className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. O'Reilly Media"
                  {...register('publisher', { required: 'Publisher name is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
              {errors.publisher && (
                <p className="mt-1 text-xs text-red-600">{errors.publisher.message}</p>
              )}
            </div>
          </div>

          {/* Category & Published Year */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Category <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <select
                  {...register('category', { required: 'Category is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white cursor-pointer"
                >
                  <option value="Computer Science">Computer Science</option>
                  <option value="Literature & Fiction">Literature & Fiction</option>
                  <option value="Engineering & Tech">Engineering & Tech</option>
                  <option value="Natural Sciences">Natural Sciences</option>
                  <option value="History & Biography">History & Biography</option>
                  <option value="Philosophy & Ethics">Philosophy & Ethics</option>
                  <option value="Mathematics & Logic">Mathematics & Logic</option>
                  <option value="Economics & Business">Economics & Business</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Published Year
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="number"
                  min="1800"
                  max={new Date().getFullYear() + 1}
                  {...register('publishedYear', { required: 'Published year is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Copies: Available & Total */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Total Copies <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <input
                  type="number"
                  min="1"
                  max="1000"
                  {...register('totalCopies', { required: 'Total copies is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Available Copies
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Copy className="w-3.5 h-3.5" />
                </div>
                <input
                  type="number"
                  min="0"
                  max="1000"
                  {...register('availableCopies')}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Cover Image URL with preview */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Cover Image URL
            </label>
            <div className="flex gap-3 items-center">
              <div className="relative flex-1 rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Image className="w-3.5 h-3.5" />
                </div>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/..."
                  {...register('coverImage')}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
                />
              </div>
              {watchedCover && (
                <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-slate-50">
                  <img
                    src={watchedCover}
                    alt="Preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'; }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Book Description */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Book Description / Synopsis
            </label>
            <textarea
              rows={3}
              placeholder="Provide a brief summary, table of contents overview, or key themes of this volume..."
              {...register('description')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden"
            />
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60"
            >
              {submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Add Book'}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
}
