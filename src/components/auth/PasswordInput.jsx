import { useState } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export default function PasswordInput({
  id,
  name,
  label,
  register,
  validationRules = {},
  error,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  helperText
}) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="w-full">
      {label && (
        <label
          htmlFor={id || name}
          className="block text-xs font-semibold text-slate-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative rounded-lg shadow-xs">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
          <Lock className="w-3.5 h-3.5" />
        </div>
        <input
          id={id || name}
          type={showPassword ? 'text' : 'password'}
          autoComplete={autoComplete}
          placeholder={placeholder}
          {...register(name, validationRules)}
          className={`w-full pl-9 pr-10 py-2 text-xs sm:text-sm rounded-lg border transition-all duration-200 outline-hidden ${
            error
              ? 'border-red-400 bg-red-50/30 text-red-900 focus:border-red-500'
              : 'border-slate-200 bg-white text-slate-800 placeholder-slate-400 hover:border-slate-300 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100'
          }`}
        />
        <button
          type="button"
          tabIndex={-1}
          onClick={() => setShowPassword((prev) => !prev)}
          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-hidden transition-colors cursor-pointer"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          {showPassword ? (
            <EyeOff className="w-3.5 h-3.5 text-slate-600" />
          ) : (
            <Eye className="w-3.5 h-3.5 text-slate-400" />
          )}
        </button>
      </div>
      {helperText && !error && (
        <p className="mt-1 text-[11px] text-slate-500">{helperText}</p>
      )}
      {error && (
        <p className="mt-1 text-[11px] text-red-600 font-medium flex items-center gap-1">
          <span className="inline-block w-1 h-1 rounded-full bg-red-500"></span>
          {error.message}
        </p>
      )}
    </div>
  );
}
