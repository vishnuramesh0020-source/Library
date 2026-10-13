import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, ShieldQuestion, BookOpen, ArrowRight, Shield } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/auth/PasswordInput';

export default function Register() {
  const { register: registerUser } = useAuth();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      role: 'Member',
      phone: '',
      password: '',
      confirmPassword: '',
      securityQuestion: 'What is your favorite book?',
      securityAnswer: '',
      agreeTerms: false
    }
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setSubmitting(true);
    const result = await registerUser({
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone,
      password: data.password,
      securityQuestion: data.securityQuestion,
      securityAnswer: data.securityAnswer
    });
    setSubmitting(false);

    if (result.success) {
      navigate('/dashboard', { replace: true });
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-3 sm:p-5 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/30 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-slate-200/80 my-auto">
        
        {/* Header */}
        <div className="text-center mb-3.5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 mb-1.5 shadow-xs">
            <BookOpen className="w-4 h-4" />
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Create Library Account
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Register to borrow books, access e-journals, and manage reservations.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
          
          {/* Full Name & Role */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="name" className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-3.5 h-3.5" />
                </div>
                <input
                  id="name"
                  type="text"
                  placeholder="e.g. Eleanor Vance"
                  {...register('name', {
                    required: 'Full name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters'
                    }
                  })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 outline-hidden ${
                    errors.name
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                      : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.name && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.name.message}
                </p>
              )}
            </div>

            {/* Role Select */}
            <div>
              <label htmlFor="role" className="block text-xs font-semibold text-slate-700 mb-1">
                Account Role
              </label>
              <div className="relative rounded-lg shadow-xs">
                <select
                  id="role"
                  {...register('role', { required: 'Please select a role' })}
                  className="w-full px-3 py-2 text-xs sm:text-sm rounded-lg border border-slate-200 bg-white text-slate-800 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 transition-all outline-hidden cursor-pointer"
                >
                  <option value="Member">🎓 Student / Faculty Member</option>
                  <option value="Librarian">🏛️ Library Staff / Librarian</option>
                </select>
              </div>
            </div>
          </div>

          {/* Email & Phone */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="e.g. member@university.edu"
                  {...register('email', {
                    required: 'Email address is required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Please enter a valid email address'
                    }
                  })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 outline-hidden ${
                    errors.email
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                      : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <div className="relative rounded-lg shadow-xs">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  id="phone"
                  type="tel"
                  placeholder="e.g. +1 (555) 012-3456"
                  {...register('phone', {
                    required: 'Phone number is required for SMS notices',
                    pattern: {
                      value: /^[0-9+\s\-()]{7,20}$/,
                      message: 'Please enter a valid phone number'
                    }
                  })}
                  className={`w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 outline-hidden ${
                    errors.phone
                      ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
                      : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="mt-1 text-[11px] text-red-600 font-medium">
                  {errors.phone.message}
                </p>
              )}
            </div>
          </div>

          {/* Password & Confirm Password */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              placeholder="Create strong password"
              autoComplete="new-password"
              register={register}
              validationRules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'At least 6 characters required'
                },
                pattern: {
                  value: /^(?=.*[A-Za-z])(?=.*\d)/,
                  message: 'Must contain letter & number'
                }
              }}
              error={errors.password}
            />

            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              label="Confirm Password"
              placeholder="Re-enter password"
              autoComplete="new-password"
              register={register}
              validationRules={{
                required: 'Please confirm your password',
                validate: (value) =>
                  value === passwordValue || 'Passwords do not match'
              }}
              error={errors.confirmPassword}
            />
          </div>

          {/* Security Question for Account Recovery */}
          <div className="p-3 rounded-xl bg-indigo-50/50 border border-indigo-100 space-y-2">
            <div className="flex items-center gap-1.5">
              <Shield className="w-3.5 h-3.5 text-indigo-600" />
              <span className="text-[11px] font-semibold text-indigo-900 uppercase tracking-wider">
                Account Recovery Setup
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <div>
                <label htmlFor="securityQuestion" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Security Question
                </label>
                <select
                  id="securityQuestion"
                  {...register('securityQuestion')}
                  className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-slate-200 bg-white text-slate-800 focus:border-indigo-500 outline-hidden"
                >
                  <option value="What is your favorite book?">What is your favorite book?</option>
                  <option value="What was the name of your first school?">What was the name of your first school?</option>
                  <option value="What is your mother's maiden name?">What is your mother's maiden name?</option>
                  <option value="What city were you born in?">What city were you born in?</option>
                </select>
              </div>

              <div>
                <label htmlFor="securityAnswer" className="block text-[11px] font-medium text-slate-700 mb-1">
                  Security Answer
                </label>
                <div className="relative rounded-lg">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <ShieldQuestion className="w-3 h-3" />
                  </div>
                  <input
                    id="securityAnswer"
                    type="text"
                    placeholder="Your secret answer"
                    {...register('securityAnswer', {
                      required: 'Security answer is required'
                    })}
                    className={`w-full pl-8 pr-2.5 py-1.5 text-xs rounded-lg border transition-all outline-hidden ${
                      errors.securityAnswer
                        ? 'border-red-400 bg-red-50/40 text-red-900 focus:border-red-500'
                        : 'border-slate-200 bg-white text-slate-800 focus:border-indigo-500'
                    }`}
                  />
                </div>
                {errors.securityAnswer && (
                  <p className="mt-0.5 text-[10px] text-red-600 font-medium">
                    {errors.securityAnswer.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Terms Agreement */}
          <div className="pt-0.5">
            <label className="flex items-start gap-2 cursor-pointer">
              <input
                type="checkbox"
                {...register('agreeTerms', {
                  required: 'You must agree to the Library Regulations'
                })}
                className="mt-0.5 w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
              />
              <span className="text-xs text-slate-600 leading-tight">
                I agree to the Library Code of Conduct and accept responsibility for timely book returns.
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="mt-1 text-[11px] text-red-600 font-medium">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting}
            className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-sm transition-all duration-200 disabled:opacity-60 cursor-pointer mt-1"
          >
            {submitting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                <span>Creating Account...</span>
              </>
            ) : (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        {/* Footer Link */}
        <div className="mt-3.5 pt-2.5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600">
            Already have a library account?{' '}
            <Link
              to="/login"
              className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-0.5"
            >
              Sign in here
            </Link>
          </p>
        </div>

      </div>
    </div>
  );
}
