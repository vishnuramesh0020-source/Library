import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, KeyRound, ShieldQuestion, ArrowLeft, ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PasswordInput from '../components/auth/PasswordInput';

export default function ForgotPassword() {
  const { fetchSecurityQuestion, verifySecurity, resetPassword } = useAuth();
  const navigate = useNavigate();

  // Steps: 1 = Email, 2 = Security Answer, 3 = New Password, 4 = Success
  const [step, setStep] = useState(1);
  const [targetEmail, setTargetEmail] = useState('');
  const [securityQuestion, setSecurityQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Forms for each step
  const emailForm = useForm({ defaultValues: { email: '' } });
  const answerForm = useForm({ defaultValues: { answer: '' } });
  const resetForm = useForm({ defaultValues: { newPassword: '', confirmNewPassword: '' } });

  // Handle Step 1: Submit Email
  const handleEmailSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    const email = data.email.trim();
    const question = fetchSecurityQuestion(email);

    setLoading(false);
    if (!question) {
      setErrorMessage('No library account found with this email address.');
      return;
    }

    setTargetEmail(email);
    setSecurityQuestion(question);
    setStep(2);
  };

  // Handle Step 2: Verify Security Answer
  const handleAnswerSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    const res = verifySecurity(targetEmail, data.answer);
    setLoading(false);

    if (res.success) {
      setStep(3);
    } else {
      setErrorMessage(res.message || 'Incorrect security answer. Please try again.');
    }
  };

  // Handle Step 3: Set New Password
  const handleResetSubmit = async (data) => {
    setErrorMessage('');
    setLoading(true);
    const res = await resetPassword(targetEmail, data.newPassword);
    setLoading(false);

    if (res.success) {
      setStep(4);
    } else {
      setErrorMessage(res.message || 'Failed to update password.');
    }
  };

  return (
    <div className="h-full w-full flex items-center justify-center p-3 sm:p-5 bg-gradient-to-br from-slate-50 via-indigo-50/20 to-violet-50/20 overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-2xl p-5 sm:p-7 shadow-sm border border-slate-200/80 my-auto">
        
        {/* Step Progress Pills */}
        <div className="flex items-center justify-between mb-8">
          <Link
            to="/login"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to login
          </Link>
          <div className="flex items-center gap-1.5">
            {[1, 2, 3].map((s) => (
              <span
                key={s}
                className={`w-6 h-1.5 rounded-full transition-all duration-300 ${
                  step >= s ? 'bg-indigo-600' : 'bg-slate-200'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Step 1: Identify Account */}
        {step === 1 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
              <Mail className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Reset your password
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-6">
              Enter your registered library email address and we'll verify your identity.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={emailForm.handleSubmit(handleEmailSubmit)} className="space-y-4" noValidate>
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Registered Email
                </label>
                <div className="relative rounded-xl shadow-xs">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    id="reset-email"
                    type="email"
                    placeholder="e.g. librarian@library.com"
                    {...emailForm.register('email', {
                      required: 'Email address is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Enter a valid email address'
                      }
                    })}
                    className="w-full pl-10 pr-4 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden transition-all"
                  />
                </div>
                {emailForm.formState.errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {emailForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-60"
              >
                {loading ? 'Checking records...' : 'Continue to Verification'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 2: Security Verification */}
        {step === 2 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
              <ShieldQuestion className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Security Verification
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-6">
              Answer the security question associated with <span className="font-semibold text-slate-700">{targetEmail}</span>.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={answerForm.handleSubmit(handleAnswerSubmit)} className="space-y-4" noValidate>
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <span className="text-xs font-semibold uppercase text-slate-400 block mb-1">
                  Your Security Question
                </span>
                <p className="text-sm font-semibold text-slate-800">{securityQuestion}</p>
              </div>

              <div>
                <label htmlFor="answer" className="block text-sm font-medium text-slate-700 mb-1.5">
                  Your Answer
                </label>
                <input
                  id="answer"
                  type="text"
                  placeholder="Type your security answer"
                  {...answerForm.register('answer', {
                    required: 'Security answer is required'
                  })}
                  className="w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 hover:border-slate-300 focus:border-indigo-500 focus:ring-3 focus:ring-indigo-100 outline-hidden transition-all"
                />
                {answerForm.formState.errors.answer && (
                  <p className="mt-1.5 text-xs text-red-600 font-medium">
                    {answerForm.formState.errors.answer.message}
                  </p>
                )}
              </div>

              {/* Demo Hint */}
              <div className="text-xs text-slate-500 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100">
                💡 <span className="font-semibold text-indigo-900">Demo Account Hint:</span> For <code className="text-indigo-700 font-mono">librarian@library.com</code>, answer is <span className="font-semibold text-slate-800">To Kill a Mockingbird</span>; for <code className="text-indigo-700 font-mono">student@library.com</code>, answer is <span className="font-semibold text-slate-800">The Great Gatsby</span>.
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setErrorMessage('');
                    setStep(1);
                  }}
                  className="w-1/3 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-all"
                >
                  Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-2/3 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-60"
                >
                  {loading ? 'Verifying...' : 'Verify Answer'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Step 3: Set New Password with Show/Hide */}
        {step === 3 && (
          <div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
              <KeyRound className="w-6 h-6" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
              Create New Password
            </h2>
            <p className="text-sm text-slate-500 mt-1.5 mb-6">
              Identity verified! Enter your new password below.
            </p>

            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={resetForm.handleSubmit(handleResetSubmit)} className="space-y-4" noValidate>
              <PasswordInput
                id="newPassword"
                name="newPassword"
                label="New Password"
                placeholder="At least 6 characters"
                register={resetForm.register}
                validationRules={{
                  required: 'New password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters'
                  }
                }}
                error={resetForm.formState.errors.newPassword}
              />

              <PasswordInput
                id="confirmNewPassword"
                name="confirmNewPassword"
                label="Confirm New Password"
                placeholder="Re-type new password"
                register={resetForm.register}
                validationRules={{
                  required: 'Please confirm your new password',
                  validate: (val) =>
                    val === resetForm.watch('newPassword') || 'Passwords do not match'
                }}
                error={resetForm.formState.errors.confirmNewPassword}
              />

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 transition-all cursor-pointer shadow-md shadow-indigo-100 disabled:opacity-60"
              >
                {loading ? 'Updating Password...' : 'Save New Password'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        )}

        {/* Step 4: Success Notification */}
        {step === 4 && (
          <div className="text-center py-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-slate-900 mb-2">Password Reset Complete!</h2>
            <p className="text-sm text-slate-600 max-w-sm mx-auto mb-6">
              Your password has been updated in local storage. You can now log into your account using your new credentials.
            </p>
            <button
              onClick={() => navigate('/login')}
              className="w-full py-3 px-4 rounded-xl text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 shadow-md shadow-indigo-100 transition-all cursor-pointer"
            >
              Sign In Now
            </button>
          </div>
        )}

      </div>
    </div>
  );
}
