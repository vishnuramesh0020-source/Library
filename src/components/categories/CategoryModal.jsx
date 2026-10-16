import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, Layers, Check, Palette, AlertCircle } from 'lucide-react';
import { toast } from 'react-toastify';
import { categoryService } from '../../services/categoryService';

const COLOR_OPTIONS = [
  { id: 'indigo', name: 'Indigo', bg: 'bg-indigo-500', ring: 'ring-indigo-500' },
  { id: 'violet', name: 'Violet', bg: 'bg-violet-500', ring: 'ring-violet-500' },
  { id: 'blue', name: 'Blue', bg: 'bg-blue-500', ring: 'ring-blue-500' },
  { id: 'emerald', name: 'Emerald', bg: 'bg-emerald-500', ring: 'ring-emerald-500' },
  { id: 'amber', name: 'Amber', bg: 'bg-amber-500', ring: 'ring-amber-500' },
  { id: 'rose', name: 'Rose', bg: 'bg-rose-500', ring: 'ring-rose-500' },
  { id: 'teal', name: 'Teal', bg: 'bg-teal-500', ring: 'ring-teal-500' },
  { id: 'cyan', name: 'Cyan', bg: 'bg-cyan-500', ring: 'ring-cyan-500' },
  { id: 'orange', name: 'Orange', bg: 'bg-orange-500', ring: 'ring-orange-500' },
  { id: 'slate', name: 'Slate', bg: 'bg-slate-500', ring: 'ring-slate-500' }
];

export default function CategoryModal({ isOpen, onClose, category, onSuccess }) {
  const isEditing = Boolean(category);
  const [submitting, setSubmitting] = useState(false);
  const [selectedColor, setSelectedColor] = useState('indigo');

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      description: ''
    }
  });

  useEffect(() => {
    if (category) {
      setValue('name', category.name);
      setValue('description', category.description || '');
      setSelectedColor(category.color || 'indigo');
    } else {
      reset({
        name: '',
        description: ''
      });
      setSelectedColor('indigo');
    }
  }, [category, setValue, reset, isOpen]);

  if (!isOpen) return null;

  const onSubmit = (data) => {
    setSubmitting(true);
    try {
      let res;
      if (isEditing) {
        res = categoryService.updateCategory(category.id, {
          name: data.name,
          description: data.description,
          color: selectedColor
        });
      } else {
        res = categoryService.addCategory({
          name: data.name,
          description: data.description,
          color: selectedColor
        });
      }

      if (res.success) {
        toast.success(res.message);
        if (onSuccess) onSuccess(res.category);
        onClose();
      } else {
        toast.error(res.message || 'Operation failed');
      }
    } catch {
      toast.error('An unexpected error occurred.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600 border border-indigo-200/60">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEditing ? 'Edit Category' : 'Create New Category'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEditing
                  ? 'Update classification taxonomy and associated monographs'
                  : 'Add a new academic genre or literature classification'}
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

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4" noValidate>
          
          {/* Category Name */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Category Name *
            </label>
            <input
              type="text"
              placeholder="e.g. Artificial Intelligence or World History"
              {...register('name', {
                required: 'Category name is required',
                minLength: { value: 2, message: 'Must be at least 2 characters' },
                maxLength: { value: 60, message: 'Cannot exceed 60 characters' }
              })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-medium"
            />
            {errors.name && (
              <p className="mt-1 text-xs text-rose-600">{errors.name.message}</p>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description / Genre Scope
            </label>
            <textarea
              rows={3}
              placeholder="Brief summary of monographs and academic works filed under this category..."
              {...register('description', {
                maxLength: { value: 250, message: 'Cannot exceed 250 characters' }
              })}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden resize-none"
            />
            {errors.description && (
              <p className="mt-1 text-xs text-rose-600">{errors.description.message}</p>
            )}
          </div>

          {/* Theme Color Selector */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5">
              <Palette className="w-3.5 h-3.5 text-indigo-500" />
              <span>Badge Theme Accent</span>
            </label>
            <div className="grid grid-cols-5 gap-2">
              {COLOR_OPTIONS.map((c) => {
                const isSelected = selectedColor === c.id;
                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => setSelectedColor(c.id)}
                    className={`p-2 rounded-xl border flex items-center gap-2 transition-all cursor-pointer ${
                      isSelected
                        ? 'border-indigo-600 bg-indigo-50/40 ring-1 ring-indigo-500'
                        : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <span className={`w-3.5 h-3.5 rounded-full ${c.bg} shrink-0`}></span>
                    <span className="text-[11px] font-semibold text-slate-700 truncate">{c.name}</span>
                    {isSelected && <Check className="w-3 h-3 text-indigo-600 ml-auto" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Edit Warning Note */}
          {isEditing && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200/80 flex items-start gap-2 text-xs text-amber-800">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p>
                Renaming this category will automatically update all existing catalog books filed under <strong className="text-amber-900">"{category.name}"</strong> to keep inventory aligned.
              </p>
            </div>
          )}

          {/* Footer Actions */}
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
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs sm:text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{submitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
