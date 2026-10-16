import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  BookMarked,
  RotateCcw,
  Search,
  AlertTriangle,
  CheckCircle2,
  Clock,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  FileText,
  IndianRupee
} from 'lucide-react';
import { loanService } from '../services/loanService';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import IssueModal from '../components/loans/IssueModal';
import ReturnModal from '../components/loans/ReturnModal';
import LoanReceiptModal from '../components/loans/LoanReceiptModal';

export default function Circulation() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialFilter = searchParams.get('filter') || 'all';

  const [loans, setLoans] = useState(() => loanService.getAllLoans());
  const [stats, setStats] = useState(() => loanService.getStats());

  // Ensure API books and members are loaded on mount and sync circulation loans
  useEffect(() => {
    const initCirculation = async () => {
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
        setLoans(loanService.getAllLoans());
        setStats(loanService.getStats());
      }
    };
    initCirculation();
  }, []);

  // Search, Filter, Sort state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(initialFilter); // 'all' | 'issued' | 'overdue' | 'returned'
  const [sortBy, setSortBy] = useState('issue_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(8);

  // Modal states
  const [isIssueModalOpen, setIsIssueModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [selectedLoan, setSelectedLoan] = useState(null);

  // Keep query params in sync if filter changes
  useEffect(() => {
    const urlFilter = searchParams.get('filter');
    if (urlFilter && ['all', 'issued', 'overdue', 'returned'].includes(urlFilter)) {
      setStatusFilter(urlFilter);
    }
  }, [searchParams]);

  const refreshData = () => {
    setLoans(loanService.getAllLoans());
    setStats(loanService.getStats());
  };

  // Filter & Sort logic
  const filteredLoans = useMemo(() => {
    return loans
      .filter((loan) => {
        // Status filter
        if (statusFilter === 'issued' && loan.status !== 'Issued') return false;
        if (statusFilter === 'overdue' && loan.status !== 'Overdue') return false;
        if (statusFilter === 'returned' && loan.status !== 'Returned') return false;

        // Search filter (Title, Author, Member name, Membership ID, ISBN, Ref)
        if (!searchTerm.trim()) return true;
        const term = searchTerm.toLowerCase().trim();
        return (
          loan.bookTitle.toLowerCase().includes(term) ||
          loan.bookAuthor.toLowerCase().includes(term) ||
          loan.memberName.toLowerCase().includes(term) ||
          loan.membershipId.toLowerCase().includes(term) ||
          (loan.bookIsbn && loan.bookIsbn.toLowerCase().includes(term)) ||
          loan.id.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => {
        if (sortBy === 'issue_desc') {
          return new Date(b.issueDate) - new Date(a.issueDate);
        }
        if (sortBy === 'issue_asc') {
          return new Date(a.issueDate) - new Date(b.issueDate);
        }
        if (sortBy === 'due_asc') {
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'overdue_first') {
          if (a.status === 'Overdue' && b.status !== 'Overdue') return -1;
          if (b.status === 'Overdue' && a.status !== 'Overdue') return 1;
          return new Date(a.dueDate) - new Date(b.dueDate);
        }
        if (sortBy === 'member_asc') {
          return a.memberName.localeCompare(b.memberName);
        }
        return 0;
      });
  }, [loans, statusFilter, searchTerm, sortBy]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, sortBy]);

  // Pagination calculations
  const totalPages = Math.ceil(filteredLoans.length / pageSize) || 1;
  const paginatedLoans = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredLoans.slice(start, start + pageSize);
  }, [filteredLoans, currentPage, pageSize]);

  // Open Return Modal
  const handleOpenReturn = (loan) => {
    setSelectedLoan(loan);
    setIsReturnModalOpen(true);
  };

  // Open Receipt Modal
  const handleOpenReceipt = (loan) => {
    setSelectedLoan(loan);
    setIsReceiptModalOpen(true);
  };

  const handleFilterChange = (filter) => {
    setStatusFilter(filter);
    setSearchParams(filter === 'all' ? {} : { filter });
  };

  const handleResetFilters = () => {
    setSearchTerm('');
    handleFilterChange('all');
    setSortBy('issue_desc');
    setCurrentPage(1);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-500">
              Circulation Desk • {stats.totalLoans} Total Transactions Recorded
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-1">
            Book Circulation & Loan Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Issue books to students & faculty, process returns, update live shelf inventory, and track loan histories.
          </p>
        </div>

        {/* Primary Action Button */}
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsIssueModalOpen(true)}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all cursor-pointer"
          >
            <BookMarked className="w-4 h-4" />
            <span>Issue a Book</span>
          </button>
        </div>
      </div>

      {/* Circulation KPI Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        
        {/* Metric 1: Active Loans */}
        <div
          onClick={() => handleFilterChange('issued')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'issued' ? 'border-blue-400 ring-2 ring-blue-100' : 'border-slate-200/80 hover:border-blue-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Active Loans</span>
            <div className="p-1.5 rounded-lg bg-blue-50 text-blue-600">
              <BookMarked className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.activeLoans}</p>
          <p className="text-[11px] text-blue-600 font-medium mt-0.5">Currently with borrowers</p>
        </div>

        {/* Metric 2: Overdue Loans */}
        <div
          onClick={() => handleFilterChange('overdue')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'overdue' ? 'border-rose-400 ring-2 ring-rose-100' : 'border-slate-200/80 hover:border-rose-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Overdue Books</span>
            <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-rose-600 tracking-tight">{stats.overdueLoans}</p>
          <p className="text-[11px] text-rose-600 font-medium mt-0.5">Late return notices</p>
        </div>

        {/* Metric 3: Books Returned */}
        <div
          onClick={() => handleFilterChange('returned')}
          className={`p-4 bg-white rounded-2xl border transition-all cursor-pointer shadow-2xs ${
            statusFilter === 'returned' ? 'border-emerald-400 ring-2 ring-emerald-100' : 'border-slate-200/80 hover:border-emerald-200'
          }`}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Books Returned</span>
            <div className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">{stats.returnedLoans}</p>
          <p className="text-[11px] text-emerald-600 font-medium mt-0.5">Shelf stock restored</p>
        </div>

        {/* Metric 4: Total Fines Collected */}
        <div
          onClick={() => navigate('/fines')}
          className="p-4 bg-white rounded-2xl border border-slate-200/80 hover:border-amber-300 hover:shadow-xs transition-all cursor-pointer shadow-2xs"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-500">Total Fines Assessed</span>
            <div className="p-1.5 rounded-lg bg-amber-50 text-amber-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-extrabold text-slate-900 tracking-tight">₹{stats.totalFines}</p>
          <p className="text-[11px] text-amber-600 font-medium mt-0.5">Manage fines & ledger →</p>
        </div>

      </div>

      {/* Filter Tabs & Search Toolbar */}
      <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-2xs space-y-3">
        
        {/* Status Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 border-b border-slate-100">
          <button
            onClick={() => handleFilterChange('all')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === 'all'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            All Loans ({stats.totalLoans})
          </button>
          <button
            onClick={() => handleFilterChange('issued')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === 'issued'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Active Loans ({stats.activeLoans})
          </button>
          <button
            onClick={() => handleFilterChange('overdue')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === 'overdue'
                ? 'bg-rose-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overdue ({stats.overdueLoans})
          </button>
          <button
            onClick={() => handleFilterChange('returned')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer shrink-0 ${
              statusFilter === 'returned'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Returned ({stats.returnedLoans})
          </button>
        </div>

        {/* Search & Sort Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-3 items-center">
          
          {/* Search Input (8 cols) */}
          <div className="lg:col-span-8 relative rounded-xl shadow-2xs">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by book title, author, member name, membership ID, or ISBN..."
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all bg-white"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Sort Dropdown (4 cols) */}
          <div className="lg:col-span-4">
            <div className="relative rounded-xl">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-700 cursor-pointer"
              >
                <option value="issue_desc">📅 Newest Issue Date</option>
                <option value="issue_asc">📅 Oldest Issue Date</option>
                <option value="due_asc">⏰ Return Due Date (Earliest)</option>
                <option value="overdue_first">⚠️ Overdue Books First</option>
                <option value="member_asc">👤 Member Name (A-Z)</option>
              </select>
            </div>
          </div>

        </div>

        {/* Toolbar Sub-bar */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-xs text-slate-500">
          <div>
            <span>Showing <strong className="text-slate-800">{filteredLoans.length}</strong> matching circulation records</span>
          </div>

          {(searchTerm || statusFilter !== 'all' || sortBy !== 'issue_desc') && (
            <button
              onClick={handleResetFilters}
              className="inline-flex items-center gap-1 text-xs text-indigo-600 hover:text-indigo-800 font-semibold hover:underline cursor-pointer"
            >
              <RotateCcw className="w-3 h-3" />
              Reset filters
            </button>
          )}
        </div>

      </div>

      {/* Issue History Table Section */}
      <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
        
        {filteredLoans.length === 0 ? (
          <div className="py-16 text-center p-8 space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto shadow-2xs">
              <BookOpen className="w-7 h-7" />
            </div>
            <h3 className="text-lg font-bold text-slate-800">No circulation records found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              No loan records matched your current query or filter tab.
            </p>
            <div className="pt-2">
              <button
                onClick={handleResetFilters}
                className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs transition-all cursor-pointer"
              >
                Clear All Filters
              </button>
            </div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-600 uppercase font-semibold text-[11px] tracking-wider">
                  <th className="py-3 px-4">Loan Ref</th>
                  <th className="py-3 px-4">Circulated Monograph</th>
                  <th className="py-3 px-4">Borrower Member</th>
                  <th className="py-3 px-4">Issue Date</th>
                  <th className="py-3 px-4">Due Date</th>
                  <th className="py-3 px-4">Return Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedLoans.map((loan) => {
                  const isReturned = loan.status === 'Returned';
                  const isOverdue = loan.status === 'Overdue';

                  return (
                    <tr key={loan.id} className="hover:bg-slate-50/60 transition-colors">
                      
                      {/* Ref ID */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className="font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
                          {loan.id}
                        </span>
                      </td>

                      {/* Book Volume */}
                      <td className="py-3.5 px-4 max-w-[240px]">
                        <div className="flex items-center gap-3">
                          <img
                            src={loan.bookCover}
                            alt={loan.bookTitle}
                            className="w-9 h-12 object-cover rounded-md shadow-2xs border border-slate-200 shrink-0"
                            onError={(e) => {
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                            }}
                          />
                          <div className="min-w-0">
                            <h4 className="font-bold text-slate-900 truncate" title={loan.bookTitle}>
                              {loan.bookTitle}
                            </h4>
                            <p className="text-[11px] text-slate-500 truncate">{loan.bookAuthor}</p>
                            <p className="text-[10px] font-mono text-slate-400">ISBN: {loan.bookIsbn}</p>
                          </div>
                        </div>
                      </td>

                      {/* Borrower Member */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <img
                            src={loan.memberAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(loan.memberName)}`}
                            alt={loan.memberName}
                            className="w-8 h-8 rounded-xl object-cover ring-1 ring-slate-200 bg-slate-100 shrink-0"
                          />
                          <div>
                            <p className="font-bold text-slate-900 line-clamp-1">{loan.memberName}</p>
                            <span className="font-mono text-[11px] text-indigo-600 font-semibold block">
                              {loan.membershipId}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Issue Date */}
                      <td className="py-3.5 px-4 font-mono text-slate-700">
                        {loan.issueDate}
                      </td>

                      {/* Return Due Date */}
                      <td className="py-3.5 px-4 font-mono">
                        <span className={isOverdue ? 'text-rose-600 font-bold' : 'text-slate-800'}>
                          {loan.dueDate}
                        </span>
                      </td>

                      {/* Actual Return Date */}
                      <td className="py-3.5 px-4 font-mono">
                        {loan.returnDate ? (
                          <span className="text-emerald-700 font-medium">{loan.returnDate}</span>
                        ) : (
                          <span className="text-slate-400 italic">Active Loan</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-4">
                        {isReturned ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Returned
                          </span>
                        ) : isOverdue ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
                            <AlertTriangle className="w-3 h-3 text-rose-600" />
                            Overdue (₹{loan.fineAmount})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                            <Clock className="w-3 h-3 text-blue-600" />
                            On Loan
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="inline-flex items-center gap-1.5">
                          
                          {/* Return Button if not yet returned */}
                          {!isReturned && (
                            <button
                              onClick={() => handleOpenReturn(loan)}
                              className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 transition-colors cursor-pointer flex items-center gap-1"
                              title="Process Book Return"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Return</span>
                            </button>
                          )}

                          {/* View Receipt Voucher */}
                          <button
                            onClick={() => handleOpenReceipt(loan)}
                            className="p-1.5 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors cursor-pointer"
                            title="View Circulation Receipt Voucher"
                          >
                            <FileText className="w-4 h-4" />
                          </button>

                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

      </div>

      {/* Pagination Footer */}
      {filteredLoans.length > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-200 text-xs text-slate-500">
          
          <div className="flex items-center gap-3">
            <span>
              Showing <strong className="text-slate-800">{Math.min((currentPage - 1) * pageSize + 1, filteredLoans.length)}</strong> to{' '}
              <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredLoans.length)}</strong> of{' '}
              <strong className="text-slate-800">{filteredLoans.length}</strong> loans
            </span>

            <div className="flex items-center gap-1.5 pl-2 border-l border-slate-200">
              <span>Per page:</span>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="px-2 py-1 rounded-lg border border-slate-200 bg-white text-slate-700 outline-hidden font-semibold cursor-pointer"
              >
                <option value={4}>4</option>
                <option value={8}>8</option>
                <option value={12}>12</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`min-w-8 h-8 px-2 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                  currentPage === page
                    ? 'bg-blue-600 text-white shadow-2xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {page}
              </button>
            ))}

            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

        </div>
      )}

      {/* Issue Modal */}
      <IssueModal
        isOpen={isIssueModalOpen}
        onClose={() => setIsIssueModalOpen(false)}
        onSuccess={refreshData}
      />

      {/* Return Modal */}
      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
        onSuccess={refreshData}
      />

      {/* Receipt Modal */}
      <LoanReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedLoan(null);
        }}
        loan={selectedLoan}
      />

    </div>
  );
}
