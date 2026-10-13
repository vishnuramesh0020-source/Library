import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, BookOpen, Sparkles, CheckCircle2, UserCheck, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/auth/PasswordInput';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  // Default redirect destination or where user attempted to go before being challenged
  const from = location.state?.from?.pathname || '/dashboard';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors }
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true
    }
  });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const res = await login(data.email, data.password);
    setSubmitting(false);

    if (res.success) {
      navigate(from, { replace: true });
    }
  };

  // Quick autofill for examiners / reviewers
  const handleQuickLogin = (email, password) => {
    setValue('email', email, { shouldValidate: true });
    setValue('password', password, { shouldValidate: true });
  };

  return (
    <div className="h-full w-full grid grid-cols-1 lg:grid-cols-12 bg-white overflow-hidden">
      
      {/* Left Side: Brand Showcase & Value Props */}
      <div className="lg:col-span-5 hidden lg:flex flex-col justify-between p-8 xl:p-10 bg-gradient-to-br from-indigo-950 via-indigo-900 to-slate-900 text-white h-full overflow-hidden">
        <div>
          <h1 className="text-2xl xl:text-3xl font-extrabold tracking-tight leading-tight mb-2">
            Welcome to <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-white to-violet-200">
              Athenaeum Digital
            </span>
          </h1>

          <p className="text-indigo-200/80 text-xs xl:text-sm leading-relaxed mb-6">
            Access the campus repository, track borrowed monographs, manage digital reservations, and collaborate with library curators seamlessly.
          </p>

          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Role-Based System</h4>
                <p className="text-[11px] text-indigo-200/70">Customized experiences for Librarians and Registered Members.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <ShieldCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Client Session Security</h4>
                <p className="text-[11px] text-indigo-200/70">Protected route boundaries powered by React Context and LocalStorage.</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-300 mt-0.5">
                <UserCheck className="w-3.5 h-3.5" />
              </div>
              <div>
                <h4 className="text-xs font-semibold text-white">Instant Account Recovery</h4>
                <p className="text-[11px] text-indigo-200/70">Security-question backed reset procedure without downtime.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-4 border-t border-indigo-700/50 flex items-center justify-between text-xs text-indigo-300/80">
          <span>Integrated with React 19 & Tailwind</span>
          <span>Athenaeum Core</span>
        </div>
      </div>

      {/* Right Side: Login Form */}
      <div className="lg:col-span-7 h-full flex items-center justify-center p-4 sm:p-6 lg:p-8 bg-white overflow-y-auto">
        <div className="w-full max-w-md my-auto">
          
          {/* Header */}
          <div className="mb-4">
            <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 mb-2.5 lg:hidden">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
              Sign in to your account
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Enter your credentials to access library services and resources.
            </p>
          </div>

          {/* Quick Demo Credentials Autofill Banner */}
          <div className="mb-3.5 p-2.5 rounded-xl border border-slate-200">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-indigo-600" />
                Quick Demo (1-Click Fill)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Password@123</span>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('librarian@library.com', 'Password@123')}
                className="flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 border border-slate-200 rounded-lg transition-all cursor-pointer text-left group"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-[11px] group-hover:text-indigo-700">🏛️ Librarian</p>
                  <p className="text-[10px] text-slate-500 truncate">librarian@library.com</p>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform ml-1">Use</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickLogin('student@library.com', 'Password@123')}
                className="flex items-center justify-between px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-indigo-50/60 hover:text-indigo-700 border border-slate-200 rounded-lg transition-all cursor-pointer text-left group"
              >
                <div>
                  <p className="font-semibold text-slate-800 text-[11px] group-hover:text-indigo-700">🎓 Student</p>
                  <p className="text-[10px] text-slate-500 truncate">student@library.com</p>
                </div>
                <span className="text-[11px] text-indigo-600 font-semibold group-hover:translate-x-0.5 transition-transform ml-1">Use</span>
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3" noValidate>
            
            {/* Email Field */}
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
                  autoComplete="email"
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

            {/* Password Field with Show/Hide toggle */}
            <PasswordInput
              id="password"
              name="password"
              label="Password"
              placeholder="Enter your password"
              register={register}
              validationRules={{
                required: 'Password is required',
                minLength: {
                  value: 6,
                  message: 'Password must be at least 6 characters'
                }
              }}
              error={errors.password}
            />

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-1.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  {...register('rememberMe')}
                  className="w-3.5 h-3.5 rounded-sm border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <span className="text-slate-600">Remember me</span>
              </label>

              <Link
                to="/forgot-password"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-xl text-xs sm:text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-hidden focus:ring-3 focus:ring-indigo-200 shadow-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>

          {/* Switch to Register */}
          <div className="mt-4 pt-3 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Don't have a library account?{' '}
              <Link
                to="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline ml-0.5"
              >
                Register here
              </Link>
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}
