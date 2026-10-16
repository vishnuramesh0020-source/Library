import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Layers, Download, Search, ExternalLink, BookOpen, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { reportService } from '../../services/reportService';

export default function CategoryBreakdownTable({ categories, totalCopies }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('copies_desc');

  const filteredCategories = useMemo(() => {
    return categories
      .filter((cat) => {
        return (
          !searchTerm ||
          cat.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
        );
      })
      .sort((a, b) => {
        if (sortBy === 'copies_desc') return b.totalCopies - a.totalCopies;
        if (sortBy === 'copies_asc') return a.totalCopies - b.totalCopies;
        if (sortBy === 'titles_desc') return b.titleCount - a.titleCount;
        if (sortBy === 'avail_desc') return b.availableCopies - a.availableCopies;
        if (sortBy === 'name_asc') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [categories, searchTerm, sortBy]);

  const handleExportCsv = () => {
    try {
      const csvContent = reportService.exportReportToCsv('categories');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `Category_Wise_Book_Count_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('Category Book Count Report exported to CSV successfully!');
    } catch {
      toast.error('Failed to export CSV report.');
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-5 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-4 h-4 text-amber-600" />
              Category-wise Inventory Audit Ledger
            </h3>
            <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {filteredCategories.length} Disciplines
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Full inventory reconciliation showing titles, total copies, active loans, and available shelf stock per subject
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap items-center gap-2.5">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search category..."
              className="pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500/20 w-40 sm:w-48"
            />
          </div>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="py-1.5 px-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none text-slate-700 font-medium cursor-pointer"
          >
            <option value="copies_desc">Highest Stock</option>
            <option value="titles_desc">Most Titles</option>
            <option value="avail_desc">Most Available</option>
            <option value="name_asc">Name (A-Z)</option>
          </select>

          <button
            type="button"
            onClick={handleExportCsv}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200/80 transition-all cursor-pointer shadow-2xs"
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
              <th className="py-3 px-4">Category / Subject</th>
              <th className="py-3 px-4 text-center">Title Count</th>
              <th className="py-3 px-4 text-center">Total Copies</th>
              <th className="py-3 px-4 text-center">Available Copies</th>
              <th className="py-3 px-4 text-center">Currently Borrowed</th>
              <th className="py-3 px-4 text-center">Catalog Share</th>
              <th className="py-3 px-4 text-right">Quick Catalog</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 font-medium text-slate-700">
            {filteredCategories.length > 0 ? (
              filteredCategories.map((cat, idx) => (
                <tr key={idx} className="hover:bg-slate-50/70 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        style={{ backgroundColor: cat.color }}
                        className="w-2.5 h-2.5 rounded-full shrink-0 shadow-2xs"
                      ></span>
                      <div>
                        <span className="font-bold text-slate-900 block">{cat.name}</span>
                        <span className="text-[11px] text-slate-400">
                          {cat.percentage}% of overall collection
                        </span>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2 py-0.5 rounded-lg bg-slate-100 font-mono font-bold text-slate-700">
                      {cat.titleCount} titles
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-mono font-bold">
                      {cat.totalCopies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 font-mono font-bold">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      {cat.availableCopies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-lg bg-blue-50 text-blue-700 font-mono font-bold">
                      {cat.borrowedCopies}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <div className="w-20 bg-slate-100 rounded-full h-2 overflow-hidden">
                        <div
                          style={{
                            width: `${cat.percentage}%`,
                            backgroundColor: cat.color
                          }}
                          className="h-full rounded-full"
                        ></div>
                      </div>
                      <span className="font-mono text-slate-600">{cat.percentage}%</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <Link
                      to={`/books?category=${encodeURIComponent(cat.name)}`}
                      className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                    >
                      <span>Explore</span>
                      <ExternalLink className="w-3 h-3" />
                    </Link>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-400">
                  No categories matching search term.
                </td>
              </tr>
            )}
          </tbody>
          <tfoot className="bg-slate-50/80 font-bold text-slate-800 border-t border-slate-200 text-xs">
            <tr>
              <td className="py-3 px-4">Catalog Grand Total</td>
              <td className="py-3 px-4 text-center font-mono">
                {filteredCategories.reduce((s, c) => s + c.titleCount, 0)} titles
              </td>
              <td className="py-3 px-4 text-center font-mono text-indigo-700">
                {filteredCategories.reduce((s, c) => s + c.totalCopies, 0)} copies
              </td>
              <td className="py-3 px-4 text-center font-mono text-emerald-700">
                {filteredCategories.reduce((s, c) => s + c.availableCopies, 0)} available
              </td>
              <td className="py-3 px-4 text-center font-mono text-blue-700">
                {filteredCategories.reduce((s, c) => s + c.borrowedCopies, 0)} borrowed
              </td>
              <td className="py-3 px-4 text-center font-mono">100.0%</td>
              <td className="py-3 px-4 text-right">
                <Link
                  to="/books"
                  className="text-xs text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  All Books →
                </Link>
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  );
}
