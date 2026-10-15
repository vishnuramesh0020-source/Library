import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Users,
  BookMarked,
  CheckCircle2,
  AlertTriangle,
  Layers,
  IndianRupee,
  PlusCircle,
  UserPlus,
  Receipt,
  Clock,
  Activity,
  ArrowUpRight,
  Database,
  ChevronRight,
  LogOut,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { dashboardService } from '../services/dashboardService';
import IssueModal from '../components/loans/IssueModal';
import AddBookModal from '../components/dashboard/AddBookModal';
import CollectFineModal from '../components/dashboard/CollectFineModal';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  // Dashboard Data State
  const [stats, setStats] = useState(() => dashboardService.getStats());
  const [activities, setActivities] = useState(() => dashboardService.getActivities());
  const [categories, setCategories] = useState(() => dashboardService.getCategories());
  const [activityFilter, setActivityFilter] = useState('all');
  const [showRawStorage, setShowRawStorage] = useState(false);

  // Modal Controllers
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isAddBookModalOpen, setIsAddBookModalOpen] = useState(false);
  const [isFineModalOpen, setIsFineModalOpen] = useState(false);

  // Refresh handler after modal submissions
  const refreshDashboard = () => {
    setStats(dashboardService.getStats());
    setActivities(dashboardService.getActivities());
    setCategories(dashboardService.getCategories());
  };

  // Filter activities
  const filteredActivities = activities.filter((act) => {
    if (activityFilter === 'all') return true;
    if (activityFilter === 'issue_return') return act.type === 'issue' || act.type === 'return';
    if (activityFilter === 'fine') return act.type === 'fine' || act.type === 'overdue';
    if (activityFilter === 'member') return act.type === 'member';
    return true;
  });

  // KPI Metrics Definition
  const metricCards = [
    {
      title: 'Total Books',
      value: Number(stats.totalBooks).toLocaleString(),
      sub: 'View all in catalog →',
      icon: BookOpen,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      borderColor: 'border-indigo-100',
      link: '/books'
    },
    {
      title: 'Total Members',
      value: Number(stats.totalMembers).toLocaleString(),
      sub: 'Manage directory →',
      icon: Users,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50/80',
      borderColor: 'border-violet-100',
      link: '/members'
    },
    {
      title: 'Books Issued',
      value: Number(stats.booksIssued).toLocaleString(),
      sub: 'View active loans →',
      icon: BookMarked,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      borderColor: 'border-blue-100',
      link: '/circulation?filter=issued'
    },
    {
      title: 'Books Available',
      value: Number(stats.booksAvailable).toLocaleString(),
      sub: 'Browse stock →',
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      borderColor: 'border-emerald-100',
      link: '/books'
    },
    {
      title: 'Overdue Books',
      value: Number(stats.overdueBooks).toLocaleString(),
      sub: 'Review penalties →',
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      borderColor: 'border-rose-100',
      link: '/circulation?filter=overdue'
    },
    {
      title: 'Total Categories',
      value: stats.totalCategories,
      sub: 'Academic genres',
      icon: Layers,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      borderColor: 'border-amber-100'
    },
    {
      title: 'Fine Collected',
      value: `₹${stats.fineCollected}`,
      sub: 'View fine ledger →',
      icon: IndianRupee,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/80',
      borderColor: 'border-teal-100',
      link: '/fines'
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-indigo-950 via-indigo-900 to-slate-900 text-white p-6 sm:p-7 shadow-md">
        <div className="absolute right-0 top-0 translate-x-1/4 -translate-y-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="flex items-center gap-4">
            <img
              src={user?.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user?.name || 'User')}`}
              alt={user?.name}
              className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl object-cover ring-2 ring-indigo-400/30 shadow-md"
            />
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/30 text-indigo-200 border border-indigo-400/20">
                  {user?.role || 'Librarian'}
                </span>
                <span className="text-xs font-mono text-indigo-300">
                  ID: {user?.membershipId}
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                Library Management Dashboard
              </h1>
              <p className="text-xs text-indigo-200/80 mt-0.5">
                Welcome back, <span className="text-white font-medium">{user?.name}</span> • Overview of repository operations & analytics
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              to="/books"
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white/20 hover:bg-white/30 text-white border border-white/30 transition-all cursor-pointer"
              title="Open Book Management Catalog"
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Catalog</span>
            </Link>
            <button
              onClick={refreshDashboard}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
              title="Refresh Data"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sync Data</span>
            </button>
            <Link
              to="/profile"
              className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all cursor-pointer"
            >
              My Profile
            </Link>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-red-500/80 hover:bg-red-600 text-white shadow-xs transition-all cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Metrics Grid: Total Books, Total Members, Books Issued, Books Available, Overdue Books, Total Categories, Fine Collected */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Core Library Metrics
          </h2>
          <span className="text-xs text-slate-400">Live LocalStorage Statistics</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          {metricCards.map((metric, idx) => {
            const Icon = metric.icon;
            const CardWrapper = metric.link ? Link : 'div';
            return (
              <CardWrapper
                key={idx}
                to={metric.link}
                className={`bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 transition-all ${
                  metric.link ? 'cursor-pointer hover:-translate-y-0.5' : ''
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 leading-tight">
                    {metric.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${metric.bgColor} ${metric.iconColor}`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {metric.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {metric.sub}
                </p>
              </CardWrapper>
            );
          })}
        </div>
      </section>

      {/* Quick Action Cards Section */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <ArrowUpRight className="w-4 h-4 text-indigo-600" />
            Quick Action Cards
          </h2>
          <span className="text-xs text-slate-400">One-click operations</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          
          {/* Action 1: Issue Book */}
          <div
            onClick={() => setIsIssueModalOpen(true)}
            className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-blue-50 text-blue-600 group-hover:scale-105 transition-transform">
                  <BookMarked className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Launch <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Issue a Book
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Lend title to a student or faculty member with return due date.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Standard 14-day loan</span>
              <span className="font-semibold text-blue-600">Quick Issue</span>
            </div>
          </div>

          {/* Action 2: Add New Book */}
          <div
            onClick={() => setIsAddBookModalOpen(true)}
            className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-indigo-50 text-indigo-600 group-hover:scale-105 transition-transform">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Launch <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                Add New Book
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Catalog new acquisitions, set categories, and record total copies.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Auto-increments total</span>
              <span className="font-semibold text-indigo-600">Catalog Title</span>
            </div>
          </div>

          {/* Action 3: Fine Management */}
          <div
            onClick={() => navigate('/fines')}
            className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-amber-50 text-amber-600 group-hover:scale-105 transition-transform">
                  <Receipt className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-amber-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Launch <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-amber-600 transition-colors">
                Fine & Penalty Ledger
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Receive overdue payments, resolve penalties, and issue receipts.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Resolves overdue status</span>
              <span className="font-semibold text-amber-600">Open Ledger</span>
            </div>
          </div>

          {/* Action 4: Member Directory */}
          <div
            onClick={() => navigate('/members')}
            className="group p-4 bg-white rounded-xl border border-slate-200/80 hover:border-violet-300 hover:shadow-md transition-all cursor-pointer flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="p-2.5 rounded-xl bg-violet-50 text-violet-600 group-hover:scale-105 transition-transform">
                  <UserPlus className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-violet-600 group-hover:translate-x-0.5 transition-transform flex items-center gap-0.5">
                  Directory <ChevronRight className="w-3 h-3" />
                </span>
              </div>
              <h3 className="text-sm font-bold text-slate-900 group-hover:text-violet-600 transition-colors">
                Member Directory & Enrollment
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                View reader identity cards, manage memberships, and enroll new students.
              </p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400">
              <span>Full Member Directory</span>
              <span className="font-semibold text-violet-600">Open Roster</span>
            </div>
          </div>

        </div>
      </section>

      {/* Main Two-Column Layout: Recent Activities & Categories Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Recent Activities Stream (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            
            {/* Activities Header with Filters */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  Recent Activities
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Audit trail of loans, check-ins, fines, and memberships
                </p>
              </div>

              {/* Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
                <button
                  onClick={() => setActivityFilter('all')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activityFilter === 'all'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActivityFilter('issue_return')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activityFilter === 'issue_return'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Loans
                </button>
                <button
                  onClick={() => setActivityFilter('fine')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activityFilter === 'fine'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Fines
                </button>
                <button
                  onClick={() => setActivityFilter('member')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors cursor-pointer ${
                    activityFilter === 'member'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  Members
                </button>
              </div>
            </div>

            {/* Activities List */}
            <div className="divide-y divide-slate-100 mt-2 max-h-[460px] overflow-y-auto pr-1">
              {filteredActivities.length > 0 ? (
                filteredActivities.map((act) => (
                  <div
                    key={act.id}
                    className="py-3 flex items-start justify-between gap-3 hover:bg-slate-50/50 rounded-xl px-2 transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 mt-0.5">
                        {act.type === 'issue' && <BookMarked className="w-4 h-4 text-blue-600" />}
                        {act.type === 'return' && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                        {act.type === 'overdue' && <AlertTriangle className="w-4 h-4 text-rose-600" />}
                        {act.type === 'fine' && <IndianRupee className="w-4 h-4 text-amber-600" />}
                        {act.type === 'member' && <Users className="w-4 h-4 text-purple-600" />}
                        {act.type === 'catalog' && <BookOpen className="w-4 h-4 text-indigo-600" />}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-slate-800">{act.title}</h4>
                          <span
                            className={`text-[10px] font-semibold px-2 py-0.2 rounded-full border ${act.badgeColor}`}
                          >
                            {act.badge}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                          {act.description}
                        </p>
                        <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-2">
                          <span>By: {act.user}</span>
                          <span>•</span>
                          <span>{act.time}</span>
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-400 text-xs">
                  No activities found for this filter.
                </div>
              )}
            </div>

          </div>
        </div>

        {/* Right Column: Categories Breakdown & Session Inspector (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          {/* Categories Overview */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Category Breakdown
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {stats.totalCategories} active catalog classifications
                </p>
              </div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {stats.totalBooks} titles
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {categories.map((cat, idx) => {
                const percentage = Math.round((cat.count / stats.totalBooks) * 100);
                return (
                  <div key={idx} className="space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-slate-700">{cat.name}</span>
                      <span className="text-slate-500 font-mono">
                        {cat.count.toLocaleString()} books ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className={`h-full ${cat.color} rounded-full transition-all duration-500`}
                        style={{ width: `${Math.max(percentage, 5)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Storage Session Inspector */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
                  <Database className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Active Session Record</h3>
                  <p className="text-[11px] text-slate-500">Stored in browser localStorage</p>
                </div>
              </div>
              <button
                onClick={() => setShowRawStorage(!showRawStorage)}
                className="text-[11px] text-indigo-600 font-semibold hover:underline cursor-pointer"
              >
                {showRawStorage ? 'Summary' : 'JSON Token'}
              </button>
            </div>

            {showRawStorage ? (
              <pre className="p-3 rounded-xl bg-slate-900 text-slate-200 text-[11px] font-mono overflow-x-auto max-h-48">
                {JSON.stringify(user, null, 2)}
              </pre>
            ) : (
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">User</span>
                  <span className="font-semibold text-slate-800 truncate block">{user?.name}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Role</span>
                  <span className="font-semibold text-indigo-600 block">{user?.role}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Card ID</span>
                  <span className="font-mono font-semibold text-slate-800 block truncate">{user?.membershipId}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-[10px] uppercase text-slate-400 block font-semibold">Storage Key</span>
                  <span className="font-mono text-slate-600 block truncate">lms_auth_user</span>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Interactive Action Modals */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={refreshDashboard}
      />
      <AddBookModal
        isOpen={isAddBookModalOpen}
        onClose={() => setIsAddBookModalOpen(false)}
        onActionSuccess={refreshDashboard}
      />
      <CollectFineModal
        isOpen={isFineModalOpen}
        onClose={() => setIsFineModalOpen(false)}
        onActionSuccess={refreshDashboard}
      />

    </div>
  );
}
