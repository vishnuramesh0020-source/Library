import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  LogOut,
  User,
  Clock,
  Bookmark,
  Database,
  Award,
  ChevronRight,
  TrendingUp,
  Search
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const [showRawStorage, setShowRawStorage] = useState(false);

  // Simulated Library statistics
  const stats = [
    { title: 'Books Borrowed', value: user?.role === 'Librarian' ? '1,420' : '3', sub: 'Active checkouts', icon: BookOpen, color: 'text-indigo-600', bg: 'bg-indigo-50' },
    { title: 'Reservations', value: user?.role === 'Librarian' ? '86' : '1', sub: 'Held on shelf', icon: Bookmark, color: 'text-amber-600', bg: 'bg-amber-50' },
    { title: 'Overdue Books', value: '0', sub: 'Good standing', icon: Clock, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { title: 'Membership Status', value: 'Active', sub: user?.membershipId || 'N/A', icon: Award, color: 'text-violet-600', bg: 'bg-violet-50' }
  ];

  const recentBooks = [
    { title: 'Clean Architecture: A Craftsman\'s Guide', author: 'Robert C. Martin', due: 'In 6 days', code: 'QA 76.76.C65' },
    { title: 'Designing Data-Intensive Applications', author: 'Martin Kleppmann', due: 'In 12 days', code: 'QA 76.9.D3' },
    { title: 'The Pragmatic Programmer: 20th Anniversary Edition', author: 'David Thomas & Andrew Hunt', due: 'In 18 days', code: 'QA 76.6' }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome Banner Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-indigo-900 via-indigo-800 to-slate-900 text-white p-6 sm:p-10 shadow-xl">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-6">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl object-cover ring-4 ring-indigo-400/30 shadow-lg"
            />
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  {user?.role}
                </span>
                <span className="text-xs font-mono text-indigo-300">
                  ID: {user?.membershipId}
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
                Welcome back, {user?.name}!
              </h1>
              <p className="text-xs sm:text-sm text-indigo-200/80 mt-1">
                Connected account: <span className="text-white font-medium">{user?.email}</span> • {user?.department || 'Library Services'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/profile"
              className="px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all backdrop-blur-sm"
            >
              Manage Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-semibold rounded-xl bg-red-500/80 hover:bg-red-600 text-white shadow-md transition-all cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div
              key={i}
              className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-slate-500">{stat.title}</span>
                <div className={`p-2 rounded-xl ${stat.bg} ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <p className="text-2xl font-bold text-slate-900">{stat.value}</p>
              <p className="text-xs text-slate-500 mt-1">{stat.sub}</p>
            </div>
          );
        })}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Active Loans / Recent Activity */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h3 className="text-base font-bold text-slate-900">Current Borrowed Titles</h3>
                <p className="text-xs text-slate-500">Track and renew your ongoing loans</p>
              </div>
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700">
                3 active loans
              </span>
            </div>

            <div className="space-y-3">
              {recentBooks.map((book, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 border border-slate-100 hover:border-indigo-100 hover:bg-indigo-50/20 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-lg bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold text-xs">
                      {idx + 1}
                    </div>
                    <div>
                      <h4 className="text-xs sm:text-sm font-semibold text-slate-800 line-clamp-1">
                        {book.title}
                      </h4>
                      <p className="text-[11px] text-slate-500">{book.author} • <span className="font-mono">{book.code}</span></p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                      Due: {book.due}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Quick Actions Panel */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Library Quick Actions</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                <Search className="w-5 h-5 text-indigo-600 mb-2" />
                <h4 className="text-xs font-semibold text-slate-800">Search Catalog</h4>
                <p className="text-[11px] text-slate-500">Find books & articles</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                <Bookmark className="w-5 h-5 text-amber-600 mb-2" />
                <h4 className="text-xs font-semibold text-slate-800">Reserve a Desk</h4>
                <p className="text-[11px] text-slate-500">Book study cabin</p>
              </div>
              <div className="p-3.5 rounded-xl border border-slate-100 bg-slate-50 hover:bg-white hover:border-indigo-200 transition-all cursor-pointer">
                <TrendingUp className="w-5 h-5 text-emerald-600 mb-2" />
                <h4 className="text-xs font-semibold text-slate-800">Extend Loan</h4>
                <p className="text-[11px] text-slate-500">Auto renew titles</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Local Storage & User State Inspector */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">Stored LocalStorage Session</h3>
                  <p className="text-[11px] text-slate-500">Active user record cached in browser storage</p>
                </div>
              </div>
              <button
                onClick={() => setShowRawStorage(!showRawStorage)}
                className="text-xs text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                {showRawStorage ? 'Show Formatted' : 'View JSON'}
              </button>
            </div>

            {showRawStorage ? (
              <pre className="p-3.5 rounded-xl bg-slate-900 text-slate-200 text-xs font-mono overflow-x-auto max-h-80">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <div className="space-y-3 text-xs">
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Full Name</span>
                  <span className="font-semibold text-slate-800">{user?.name}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Email Address</span>
                  <span className="font-semibold text-slate-800">{user?.email}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Assigned Role</span>
                  <span className="font-semibold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">
                    {user?.role}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Membership ID</span>
                  <span className="font-mono font-semibold text-slate-800">{user?.membershipId}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Contact Phone</span>
                  <span className="font-semibold text-slate-800">{user?.phone}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-slate-100">
                  <span className="text-slate-500">Member Since</span>
                  <span className="font-semibold text-slate-800">{user?.joinedDate || '2024-01-01'}</span>
                </div>
                <div className="flex justify-between py-2">
                  <span className="text-slate-500">Storage Key</span>
                  <span className="font-mono text-slate-600 bg-slate-100 px-1.5 py-0.5 rounded">
                    lms_auth_user
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Profile Link Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center shadow-xs">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900">Need to update contact details?</h4>
                <p className="text-xs text-slate-600">Edit phone, name, or preferences</p>
              </div>
            </div>
            <Link
              to="/profile"
              className="p-2 rounded-xl bg-white text-indigo-600 hover:bg-indigo-600 hover:text-white transition-all shadow-xs"
            >
              <ChevronRight className="w-4 h-4" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
}
