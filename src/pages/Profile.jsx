import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import { User, Mail, Phone, Shield, ArrowLeft, Save, CheckCircle2, Building, Calendar } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: user?.phone || '',
      department: user?.department || 'General Services'
    }
  });

  const onSubmit = async (data) => {
    setSaving(true);
    const res = updateProfile({
      name: data.name,
      phone: data.phone,
      department: data.department
    });
    setSaving(false);
    if (res.success) {
      setIsEditing(false);
    }
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Back link */}
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back to Dashboard
      </Link>

      {/* Profile Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 pb-6 border-b border-slate-100">
          <div className="flex items-center gap-4 sm:gap-5">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-50 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="text-2xl font-bold text-slate-900">{user?.name}</h1>
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-100">
                  {user?.role}
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-500">{user?.email}</p>
              <p className="text-xs text-slate-400 mt-1 font-mono">ID: {user?.membershipId}</p>
            </div>
          </div>

          <button
            onClick={() => setIsEditing(!isEditing)}
            className="px-4 py-2 text-xs sm:text-sm font-semibold rounded-xl border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50/50 text-slate-700 hover:text-indigo-600 transition-all cursor-pointer"
          >
            {isEditing ? 'Cancel Editing' : 'Edit Profile'}
          </button>
        </div>

        {/* Profile Details Form or View */}
        <div className="pt-6">
          {isEditing ? (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-w-xl">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Full Name
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-600 mt-1">{errors.name.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Phone Number
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input
                    type="tel"
                    {...register('phone', { required: 'Phone number is required' })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
                {errors.phone && (
                  <p className="text-xs text-red-600 mt-1">{errors.phone.message}</p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Department / Major
                </label>
                <div className="relative rounded-xl">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Building className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    {...register('department')}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden"
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer disabled:opacity-60"
                >
                  <Save className="w-4 h-4" />
                  <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Email Address
                </span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-indigo-500" />
                  {user?.email}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Contact Phone
                </span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Phone className="w-4 h-4 text-indigo-500" />
                  {user?.phone || 'Not configured'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Department / Program
                </span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Building className="w-4 h-4 text-indigo-500" />
                  {user?.department || 'General Library Access'}
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Membership Since
                </span>
                <p className="text-sm font-semibold text-slate-800 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-500" />
                  {user?.joinedDate || '2024-01-01'}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Security & Local Storage Summary Card */}
      <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex items-center gap-2">
          <Shield className="w-5 h-5 text-indigo-600" />
          <h2 className="text-base font-bold text-slate-900">Security & Account Standing</h2>
        </div>
        <p className="text-xs sm:text-sm text-slate-500">
          Your credentials and identity are validated locally with encrypted browser caching. Passwords are never exposed in user token payloads.
        </p>

        <div className="flex flex-wrap items-center gap-2 pt-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
            <CheckCircle2 className="w-3.5 h-3.5" /> Good Standing
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-100">
            Active Token Stored
          </span>
        </div>
      </div>

    </div>
  );
}
