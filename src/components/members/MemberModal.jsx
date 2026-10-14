import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { X, UserPlus, UserCheck, User, Mail, Phone, MapPin, Hash, Calendar, Sparkles, RefreshCw } from 'lucide-react';
import { toast } from 'react-toastify';
import { memberService } from '../../services/memberService';

const getTodayString = () => new Date().toISOString().split('T')[0];

export default function MemberModal({
  isOpen,
  onClose,
  onSuccess,
  initialMember = null,
  mode = 'add'
}) {
  const [submitting, setSubmitting] = useState(false);
  const isEdit = mode === 'edit';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      address: '',
      membershipId: '',
      membershipDate: getTodayString(),
      status: 'Active',
      role: 'Student Member',
      avatar: ''
    }
  });

  const watchedAvatar = watch('avatar');
  const watchedName = watch('name');

  useEffect(() => {
    if (initialMember && isEdit) {
      reset({
        name: initialMember.name || '',
        email: initialMember.email || '',
        phone: initialMember.phone || '',
        address: initialMember.address || '',
        membershipId: initialMember.membershipId || '',
        membershipDate: initialMember.membershipDate || getTodayString(),
        status: initialMember.status || 'Active',
        role: initialMember.role || 'Student Member',
        avatar: initialMember.avatar || ''
      });
    } else {
      reset({
        name: '',
        email: '',
        phone: '',
        address: '',
        membershipId: memberService.generateMembershipId(),
        membershipDate: getTodayString(),
        status: 'Active',
        role: 'Student Member',
        avatar: ''
      });
    }
  }, [initialMember, isEdit, reset, isOpen]);

  if (!isOpen) return null;

  const handleGenerateId = () => {
    setValue('membershipId', memberService.generateMembershipId(), { shouldValidate: true });
  };

  const onSubmit = async (data) => {
    setSubmitting(true);

    if (isEdit && initialMember) {
      const res = memberService.updateMember(initialMember.id, data);
      setSubmitting(false);

      if (res.success) {
        toast.success(res.message);
        onSuccess(res.member);
        onClose();
      } else {
        toast.error(res.message);
      }
    } else {
      const res = memberService.addMember(data);
      setSubmitting(false);

      if (res.success) {
        toast.success(res.message);
        onSuccess(res.member);
        onClose();
      } else {
        toast.error(res.message);
      }
    }
  };

  const currentPreviewAvatar =
    watchedAvatar && watchedAvatar.trim() !== ''
      ? watchedAvatar.trim()
      : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(watchedName || 'Member')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className={`p-2 rounded-xl ${isEdit ? 'bg-amber-50 text-amber-600' : 'bg-indigo-50 text-indigo-600'}`}>
              {isEdit ? <UserCheck className="w-5 h-5" /> : <UserPlus className="w-5 h-5" />}
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">
                {isEdit ? 'Edit Member Profile' : 'Enroll New Member'}
              </h3>
              <p className="text-xs text-slate-500">
                {isEdit ? 'Update reader information, contact details, or status' : 'Create new institutional reader card & borrowing account'}
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

        {/* Modal Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4" noValidate>
          
          {/* Top row: Avatar preview + Name */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 p-3.5 bg-slate-50/70 rounded-2xl border border-slate-100">
            <img
              src={currentPreviewAvatar}
              alt="Avatar preview"
              className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/20 bg-white shrink-0"
              onError={(e) => {
                e.currentTarget.src = `https://api.dicebear.com/7.x/initials/svg?seed=Member`;
              }}
            />
            <div className="flex-1">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="e.g. Sarah Jenkins or Alex Rivera"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: { value: 2, message: 'Name must be at least 2 characters' }
                  })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-xs text-red-600">{errors.name.message}</p>
              )}
            </div>
          </div>

          {/* Email & Mobile Number */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  placeholder="name@institution.edu"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Mobile Number <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  placeholder="+91 98765 43210"
                  {...register('phone', {
                    required: 'Mobile phone number is required',
                    minLength: { value: 7, message: 'Enter a valid phone number' }
                  })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-xs text-red-600">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Membership ID & Membership Date */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Membership ID <span className="text-red-500">*</span>
                </label>
                {!isEdit && (
                  <button
                    type="button"
                    onClick={handleGenerateId}
                    className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> Auto-generate
                  </button>
                )}
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Hash className="w-3.5 h-3.5" />
                </div>
                <input
                  type="text"
                  placeholder="MEM-2025-01"
                  {...register('membershipId', {
                    required: 'Membership ID is required',
                    minLength: { value: 4, message: 'Membership ID is too short' }
                  })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden font-mono uppercase bg-white"
                />
              </div>
              {errors.membershipId && (
                <p className="mt-1 text-xs text-red-600">{errors.membershipId.message}</p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Membership Date <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  {...register('membershipDate', { required: 'Membership date is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.membershipDate && (
                <p className="mt-1 text-xs text-red-600">{errors.membershipDate.message}</p>
              )}
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Residential / Campus Address <span className="text-red-500">*</span>
            </label>
            <div className="relative rounded-lg">
              <div className="absolute top-2.5 left-3 pointer-events-none text-slate-400">
                <MapPin className="w-3.5 h-3.5" />
              </div>
              <textarea
                rows={2}
                placeholder="e.g. 42 Academic Ridge, Hall 4, North Campus, New Delhi 110025"
                {...register('address', {
                  required: 'Address is required',
                  minLength: { value: 5, message: 'Please provide full residential or campus address' }
                })}
                className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
              />
            </div>
            {errors.address && (
              <p className="mt-1 text-xs text-red-600">{errors.address.message}</p>
            )}
          </div>

          {/* Role & Status */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Reader Category / Role
              </label>
              <select
                {...register('role')}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="Student Member">Student Member</option>
                <option value="Faculty Scholar">Faculty Scholar</option>
                <option value="Research Fellow">Research Fellow</option>
                <option value="Alumni Member">Alumni Member</option>
                <option value="Librarian Staff">Librarian Staff</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Membership Status
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="Active">🟢 Active (Full Borrowing Privileges)</option>
                <option value="Suspended">🔴 Suspended (Overdue Penalties)</option>
              </select>
            </div>
          </div>

          {/* Optional Avatar URL */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Custom Avatar / Photo URL (Optional)
            </label>
            <input
              type="url"
              placeholder="https://images.unsplash.com/... (Leave empty for auto-generated avatar)"
              {...register('avatar')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
            />
          </div>

          {/* Form Actions */}
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
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-60 flex items-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>{submitting ? 'Saving...' : isEdit ? 'Save Changes' : 'Enroll Member'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
