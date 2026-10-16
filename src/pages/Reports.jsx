import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  BarChart3,
  BookOpen,
  BookMarked,
  CheckCircle2,
  Users,
  AlertTriangle,
  Layers,
  TrendingUp,
  Download,
  Printer,
  RefreshCw,
  FileSpreadsheet,
  PieChart,
  Calendar,
  IndianRupee,
  Activity
} from 'lucide-react';
import { toast } from 'react-toastify';
import { reportService } from '../services/reportService';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import { loanService } from '../services/loanService';
import MonthlyTrendChart from '../components/reports/MonthlyTrendChart';
import CategoryDonutChart from '../components/reports/CategoryDonutChart';
import WeeklyRhythmChart from '../components/reports/WeeklyRhythmChart';
import MonthlyReportTable from '../components/reports/MonthlyReportTable';
import CategoryBreakdownTable from '../components/reports/CategoryBreakdownTable';

export default function Reports() {
  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'monthly' | 'categories'
  const [timeRange, setTimeRange] = useState('12m'); // '6m' | '12m'
  const [loading, setLoading] = useState(false);

  // Live aggregated data states
  const [metrics, setMetrics] = useState(() => reportService.getSummaryMetrics());
  const [categoryData, setCategoryData] = useState(() => reportService.getCategoryWiseBookCount());
  const [monthlyData, setMonthlyData] = useState(() => reportService.getMonthlyIssueReport());
  const [chartData, setChartData] = useState(() => reportService.getDashboardChartsData());

  const refreshAllData = () => {
    setMetrics(reportService.getSummaryMetrics());
    setCategoryData(reportService.getCategoryWiseBookCount());
    setMonthlyData(reportService.getMonthlyIssueReport());
    setChartData(reportService.getDashboardChartsData());
  };

  // Ensure underlying API stores are initialized
  useEffect(() => {
    const initData = async () => {
      let needsRefresh = false;
      const books = bookService.getAllBooks();
      if (!books || books.length === 0 || !books.every((b) => b.apiId && String(b.apiId).includes('/works/'))) {
        await bookService.fetchBooksFromApi(25);
        needsRefresh = true;
      }
      const members = memberService.getAllMembers();
      if (!members || members.length === 0 || !members.every((m) => m.apiId !== undefined)) {
        await memberService.fetchMembersFromApi(20);
        needsRefresh = true;
      }
      if (needsRefresh) {
        refreshAllData();
      }
    };
    initData();
  }, []);

  const handleSyncData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        bookService.fetchBooksFromApi(25, true),
        memberService.fetchMembersFromApi(20, true)
      ]);
      loanService.initLoans();
      refreshAllData();
      toast.success('Live API stores and analytical telemetry synchronized successfully!');
    } catch {
      toast.error('Failed to sync live data.');
    } finally {
      setLoading(false);
    }
  };

  const handleExportFullAudit = () => {
    try {
      const csv = reportService.exportReportToCsv('audit');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Library_Audit_Summary_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Complete library executive audit exported to CSV!');
    } catch {
      toast.error('Failed to export audit report.');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  // KPI Metric Cards configuration
  const kpiCards = [
    {
      title: 'Total Books',
      value: Number(metrics.totalBooks).toLocaleString(),
      sub: `${metrics.totalTitles} unique titles cataloged`,
      icon: BookOpen,
      iconColor: 'text-indigo-600',
      bgColor: 'bg-indigo-50/80',
      link: '/books'
    },
    {
      title: 'Books Issued',
      value: Number(metrics.booksIssued).toLocaleString(),
      sub: `${metrics.circulationRate}% of collection on active loan`,
      icon: BookMarked,
      iconColor: 'text-blue-600',
      bgColor: 'bg-blue-50/80',
      link: '/circulation?filter=issued'
    },
    {
      title: 'Books Returned',
      value: Number(metrics.booksReturned).toLocaleString(),
      sub: `${metrics.returnEfficiency}% return completion rate`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-600',
      bgColor: 'bg-emerald-50/80',
      link: '/circulation?filter=returned'
    },
    {
      title: 'Active Members',
      value: Number(metrics.activeMembers).toLocaleString(),
      sub: `${metrics.totalMembers} total registered patrons`,
      icon: Users,
      iconColor: 'text-violet-600',
      bgColor: 'bg-violet-50/80',
      link: '/members'
    },
    {
      title: 'Overdue Books',
      value: Number(metrics.overdueBooks).toLocaleString(),
      sub: `${metrics.overdueBooks > 0 ? 'Requires student follow-up' : 'All loans in good standing'}`,
      icon: AlertTriangle,
      iconColor: 'text-rose-600',
      bgColor: 'bg-rose-50/80',
      link: '/circulation?filter=overdue'
    },
    {
      title: 'Books Available',
      value: Number(metrics.booksAvailable).toLocaleString(),
      sub: 'Ready on stacks for checkout',
      icon: Layers,
      iconColor: 'text-amber-600',
      bgColor: 'bg-amber-50/80',
      link: '/books'
    },
    {
      title: 'Fine Collected',
      value: `₹${Number(metrics.fineCollected).toLocaleString()}`,
      sub: `₹${Number(metrics.outstandingFines).toLocaleString()} outstanding`,
      icon: IndianRupee,
      iconColor: 'text-teal-600',
      bgColor: 'bg-teal-50/80',
      link: '/fines'
    }
  ];

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Executive Telemetry • Academic Repository Intelligence
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Library Analytics & Reports
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Holistic circulation reporting, category distribution analysis, monthly issue telemetry, and dashboard trends.
          </p>
        </div>

        {/* Global Report Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleSyncData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Synchronize live API metrics"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-indigo-600' : ''}`} />
            <span>{loading ? 'Syncing...' : 'Sync Data'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportFullAudit}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-xl bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 shadow-2xs transition-all cursor-pointer"
            title="Download CSV Executive Summary"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export Audit CSV</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs transition-all cursor-pointer"
            title="Print or Save PDF Report"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metrics Grid: Total Books, Books Issued, Books Returned, Active Members, Overdue Books, Books Available, Fine Collected */}
      <section>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-slate-700 flex items-center gap-2">
            <Activity className="w-4 h-4 text-indigo-600" />
            Core Library Metrics
          </h2>
          <span className="text-xs text-slate-400">Calculated from Live API Stores</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3 sm:gap-4">
          {kpiCards.map((kpi, idx) => {
            const Icon = kpi.icon;
            return (
              <Link
                key={idx}
                to={kpi.link}
                className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs hover:shadow-sm hover:border-indigo-200 hover:-translate-y-0.5 transition-all group"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-medium text-slate-500 leading-tight">
                    {kpi.title}
                  </span>
                  <div className={`p-1.5 rounded-lg ${kpi.bgColor} ${kpi.iconColor} group-hover:scale-105 transition-transform`}>
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>
                <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {kpi.value}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                  {kpi.sub}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Dashboard Charts & Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('monthly')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'monthly'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Monthly Issue Report</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('categories')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs sm:text-sm font-bold rounded-xl transition-all cursor-pointer ${
            activeTab === 'categories'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Category-wise Book Count</span>
        </button>
      </div>

      {/* Tab 1: Overview & Interactive Dashboard Charts */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Visuals Grid: Monthly Trend Chart & Category Donut Chart */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-7">
              <MonthlyTrendChart
                data={chartData.monthlyTrend}
                timeRange={timeRange}
                onTimeRangeChange={setTimeRange}
              />
            </div>
            <div className="lg:col-span-5">
              <CategoryDonutChart
                categories={categoryData}
                totalCopies={chartData.totalCatalogCopies}
              />
            </div>
          </div>

          {/* Secondary Visuals: Weekly Rhythm & Active Member Classification */}
          <WeeklyRhythmChart
            weeklyData={chartData.weeklyRhythm}
            memberTiers={chartData.memberTiers}
          />

          {/* Quick Previews of Tables */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Quick Monthly Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-indigo-600" />
                  Recent Monthly Circulation Highlights
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('monthly')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  View Full Ledger →
                </button>
              </div>
              <div className="space-y-2">
                {monthlyData.slice(-4).reverse().map((m, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-slate-800">{m.month}</span>
                      <span className="text-[11px] text-slate-400 block">
                        {m.activeBorrowers} readers • {m.returnRate}% return completion
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-right">
                      <span className="px-2 py-0.5 rounded-md bg-indigo-100 text-indigo-800 font-bold font-mono">
                        {m.booksIssued} issued
                      </span>
                      <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold font-mono">
                        {m.booksReturned} returned
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Category Summary */}
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-2xs space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Top Classification Holdings
                </h3>
                <button
                  type="button"
                  onClick={() => setActiveTab('categories')}
                  className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline cursor-pointer"
                >
                  View Category Audit →
                </button>
              </div>
              <div className="space-y-2">
                {categoryData.slice(0, 4).map((c, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        style={{ backgroundColor: c.color }}
                        className="w-2.5 h-2.5 rounded-full"
                      ></span>
                      <div>
                        <span className="font-bold text-slate-800">{c.name}</span>
                        <span className="text-[11px] text-slate-400 block">
                          {c.titleCount} titles • {c.availableCopies} available on shelf
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="font-extrabold text-slate-900 font-mono">
                        {c.totalCopies} copies
                      </span>
                      <span className="text-[11px] text-slate-500 block">
                        {c.percentage}% share
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Monthly Issue Report */}
      {activeTab === 'monthly' && (
        <div className="space-y-6">
          {/* Monthly Trend Visual Header */}
          <MonthlyTrendChart
            data={chartData.monthlyTrend}
            timeRange={timeRange}
            onTimeRangeChange={setTimeRange}
          />

          {/* Full Monthly Issue Report Table */}
          <MonthlyReportTable monthlyData={monthlyData} />
        </div>
      )}

      {/* Tab 3: Category-wise Book Count */}
      {activeTab === 'categories' && (
        <div className="space-y-6">
          {/* Category Graphic Header */}
          <CategoryDonutChart
            categories={categoryData}
            totalCopies={chartData.totalCatalogCopies}
          />

          {/* Full Category Inventory Audit Table */}
          <CategoryBreakdownTable
            categories={categoryData}
            totalCopies={chartData.totalCatalogCopies}
          />
        </div>
      )}

    </div>
  );
}
