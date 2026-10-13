import { BookOpen, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 bg-white/60 py-4 text-sm text-slate-500">
      <div className="w-full px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 font-medium text-slate-700">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          <span>Athenaeum Library Management System</span>
          <span className="text-xs bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-mono">
            v1.0.0
          </span>
        </div>

        <div className="flex items-center gap-6 text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
            <ShieldCheck className="w-4 h-4" /> Secure Client Session (LocalStorage)
          </span>
        </div>
      </div>
    </footer>
  );
}
