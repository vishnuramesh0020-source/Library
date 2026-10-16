import { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Search,
  ArrowUpDown,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  IndianRupee,
  Users
} from 'lucide-react';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';

export default function MonthlyReportTable({ monthlyData }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedYear, setSelectedYear] = useState('All');
  const [sortBy, setSortBy] = useState('date_desc');

  // Filter & sort
  const filteredData = useMemo(() => {
    return monthlyData
      .filter((row) => {
        const matchesSearch =
          !searchTerm ||
          row.month.toLowerCase().includes(searchTerm.toLowerCase().trim());
        const matchesYear = selectedYear === 'All' || String(row.year) === selectedYear;
        return matchesSearch && matchesYear;
      })
      .sort((a, b) => {
        if (sortBy === 'issues_desc') return b.booksIssued - a.booksIssued;
        if (sortBy === 'issues_asc') return a.booksIssued - b.booksIssued;
        if (sortBy === 'returns_desc') return b.booksReturned - a.booksReturned;
        if (sortBy === 'rate_desc') return b.returnRate - a.returnRate;
        if (sortBy === 'fines_desc') return b.finesCollected - a.finesCollected;
        return 0; // Default order
      });
  }, [monthlyData, searchTerm, selectedYear, sortBy]);

  const handleExportCsv = () => {
    try {
      const csvContent = reportService.exportReportToCsv('monthly');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Monthly_Issue_Report_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Monthly Issue Report exported to CSV successfully!');
    } catch {
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Controls Header */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-600" />
              Monthly Issue & Return Telemetry Ledger
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
              {filteredData.length} Billing Periods
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Audit-ready monthly statement of monograph circulations, returns, overdue notices, and fine collections
          </p>
        </div>

        {/* Filter and Export Action Group */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter month..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 w-36 sm:w-44"
            />
          </div>

          {/* Year Filter */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium cursor-pointer"
          >
            <option value="All">All Years</option>
            <option value="2026">2026</option>
            <option value="2025">2025</option>
          </select>

          {/* Sort Select */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-slate-700 font-medium cursor-pointer"
          >
            <option value="date_desc">Chronological</option>
            <option value="issues_desc">Highest Issues</option>
            <option value="returns_desc">Highest Returns</option>
            <option value="rate_desc">Best Return %</option>
            <option value="fines_desc">Highest Fines</option>
          </select>

          {/* Export CSV Button */}
          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/80 transition-all cursor-pointer shadow-2xs"
            title="Download CSV Spreadsheet"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase tracking-wider text-[11px]">
            <tr>
              <th className="py-3 px-4">Period / Month</th>
              <th className="py-3 px-4 text-center">Books Issued</th>
              <th className="py-3 px-4 text-center">Books Returned</th>
              <th className="py-3 px-4 text-center">Return Efficiency</th>
              <th className="py-3 px-4 text-center">Overdue Notice</th>
              <th className="py-3 px-4 text-center">Active Borrowers</th>
              <th className="py-3 px-4 text-right">Fines Collected</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredData.length > 0 ? (
              filteredData.map((row, idx) => {
                const isCurrent = row.month.includes('Current');
                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50/70 transition-colors ${
                      isCurrent ? 'bg-indigo-50/40 font-semibold' : ''
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900">{row.month}</span>
                        {isCurrent && (
                          <span className="text-[10px] font-bold px-2 py-0.2 rounded-full bg-indigo-600 text-white">
                            Live
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold font-mono">
                        {row.booksIssued}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold font-mono">
                        {row.booksReturned}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        <div className="w-16 bg-slate-200 rounded-full h-1.5 overflow-hidden">
                          <div
                            style={{ width: `${row.returnRate}%` }}
                            className="bg-emerald-500 h-full rounded-full"
                          ></div>
                        </div>
                        <span className="font-mono text-slate-700">{row.returnRate}%</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-lg font-mono font-bold ${
                          row.overdueCount > 10
                            ? 'bg-rose-50 text-rose-700 border border-rose-200'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {row.overdueCount > 0 && <AlertTriangle className="w-3 h-3 text-rose-500" />}
                        {row.overdueCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-center font-mono text-slate-600">
                      {row.activeBorrowers} readers
                    </td>
                    <td className="py-3 px-4 text-right">
                      <span className="font-bold text-teal-700 font-mono">
                        ₹{row.finesCollected.toLocaleString()}
                      </span>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No monthly report data matching current filters.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50/80 font-bold text-slate-800 border-t border-slate-200 text-xs">
            <tr>
              <td className="py-3 px-4">Period Aggregate ({filteredData.length} Months)</td>
              <td className="py-3 px-4 text-center text-indigo-700 font-mono">
                {filteredData.reduce((s, r) => s + r.booksIssued, 0).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center text-emerald-700 font-mono">
                {filteredData.reduce((s, r) => s + r.booksReturned, 0).toLocaleString()}
              </td>
              <td className="py-3 px-4 text-center font-mono text-slate-700">
                {(
                  (filteredData.reduce((s, r) => s + r.booksReturned, 0) /
                    (filteredData.reduce((s, r) => s + r.booksIssued, 0) || 1)) *
                  100
                ).toFixed(1)}
                %
              </td>
              <td className="py-3 px-4 text-center text-rose-700 font-mono">
                {filteredData.reduce((s, r) => s + r.overdueCount, 0)}
              </td>
              <td className="py-3 px-4 text-center font-mono text-slate-700">
                {Math.round(
                  filteredData.reduce((s, r) => s + r.activeBorrowers, 0) /
                    (filteredData.length || 1)
                )}{' '}
                avg/mo
              </td>
              <td className="py-3 px-4 text-right text-teal-700 font-mono">
                ₹{filteredData.reduce((s, r) => s + r.finesCollected, 0).toLocaleString()}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
