import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  IndianRupee,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Search,
  ArrowUpDown,
  Receipt,
  Printer,
  RefreshCw,
  Bell,
  RotateCcw,
  Calculator,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Mail,
  Phone
} from 'lucide-react';
import { toast } from 'react-toastify';
import { fineService } from '../services/fineService';
import { bookService } from '../services/bookService';
import { memberService } from '../services/memberService';
import PayFineModal from '../components/fines/PayFineModal';
import FineReceiptModal from '../components/fines/FineReceiptModal';
import FineCalculatorModal from '../components/fines/FineCalculatorModal';
import ReturnModal from '../components/loans/ReturnModal';

export default function Fines() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab: 'history' (Fine History & Ledger) | 'overdue' (Overdue Book List)
  const [activeTab, setActiveTab] = useState(() => searchParams.get('tab') || 'history');

  // Search & Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all' | 'unpaid' | 'paid'
  const [typeFilter, setTypeFilter] = useState('all'); // 'all' | 'overdue' | 'returned'
  const [sortBy, setSortBy] = useState('fineDesc'); // 'fineDesc' | 'fineAsc' | 'daysDesc' | 'dateDesc' | 'nameAsc'

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Data Store
  const [allFines, setAllFines] = useState(() => fineService.getAllFines());
  const [overdueBooks, setOverdueBooks] = useState(() => fineService.getOverdueBooks());
  const [stats, setStats] = useState(() => fineService.getFineStats());

  // Ensure API books and members are loaded on mount and sync fine records
  useEffect(() => {
    const initFines = async () => {
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
        setAllFines(fineService.getAllFines());
        setOverdueBooks(fineService.getOverdueBooks());
        setStats(fineService.getFineStats());
      }
    };
    initFines();
  }, []);

  // Modals state
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isReceiptModalOpen, setIsReceiptModalOpen] = useState(false);
  const [isCalcModalOpen, setIsCalcModalOpen] = useState(false);
  const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const [selectedFineRecord, setSelectedFineRecord] = useState(null);
  const [selectedLoanForReturn, setSelectedLoanForReturn] = useState(null);

  // Sync with URL query parameter changes
  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab && ['history', 'overdue'].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Refresh data from store
  const refreshData = () => {
    const fines = fineService.getAllFines();
    const overdues = fineService.getOverdueBooks();
    const statistics = fineService.getFineStats();
    setAllFines(fines);
    setOverdueBooks(overdues);
    setStats(statistics);
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, typeFilter, sortBy, activeTab]);

  // Filtered and sorted Fine History records
  const filteredFines = useMemo(() => {
    return allFines
      .filter((fine) => {
        // Search by Member (name, membershipId, email, phone) or Book (title, isbn)
        const term = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !term ||
          fine.memberName?.toLowerCase().includes(term) ||
          fine.membershipId?.toLowerCase().includes(term) ||
          fine.memberEmail?.toLowerCase().includes(term) ||
          fine.memberPhone?.toLowerCase().includes(term) ||
          fine.bookTitle?.toLowerCase().includes(term) ||
          fine.bookIsbn?.toLowerCase().includes(term) ||
          fine.receiptNumber?.toLowerCase().includes(term);

        // Filter by Paid / Unpaid
        let matchesStatus = true;
        if (statusFilter === 'unpaid') {
          matchesStatus = fine.fineStatus === 'Unpaid';
        } else if (statusFilter === 'paid') {
          matchesStatus = fine.fineStatus === 'Paid';
        }

        // Filter by Loan Type (Overdue on loan vs Returned late)
        let matchesType = true;
        if (typeFilter === 'overdue') {
          matchesType = fine.loanStatus === 'Overdue';
        } else if (typeFilter === 'returned') {
          matchesType = fine.loanStatus === 'Returned';
        }

        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        if (sortBy === 'fineDesc') return (b.fineAmount || 0) - (a.fineAmount || 0);
        if (sortBy === 'fineAsc') return (a.fineAmount || 0) - (b.fineAmount || 0);
        if (sortBy === 'daysDesc') return (b.overdueDays || 0) - (a.overdueDays || 0);
        if (sortBy === 'dateDesc') return new Date(b.dueDate) - new Date(a.dueDate);
        if (sortBy === 'nameAsc') return (a.memberName || '').localeCompare(b.memberName || '');
        return 0;
      });
  }, [allFines, searchTerm, statusFilter, typeFilter, sortBy]);

  // Filtered Overdue Books List
  const filteredOverdueBooks = useMemo(() => {
    const term = searchTerm.toLowerCase().trim();
    return overdueBooks
      .filter((loan) => {
        return (
          !term ||
          loan.memberName?.toLowerCase().includes(term) ||
          loan.membershipId?.toLowerCase().includes(term) ||
          loan.memberPhone?.toLowerCase().includes(term) ||
          loan.memberEmail?.toLowerCase().includes(term) ||
          loan.bookTitle?.toLowerCase().includes(term) ||
          loan.bookIsbn?.toLowerCase().includes(term)
        );
      })
      .sort((a, b) => (b.overdueDays || 0) - (a.overdueDays || 0));
  }, [overdueBooks, searchTerm]);

  // Pagination for Fine History
  const totalPages = Math.ceil(filteredFines.length / pageSize) || 1;
  const paginatedFines = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredFines.slice(start, start + pageSize);
  }, [filteredFines, currentPage, pageSize]);

  // Handlers
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchParams({ tab });
  };

  const handleOpenPayModal = (fine) => {
    setSelectedFineRecord(fine);
    setIsPayModalOpen(true);
  };

  const handleOpenReceiptModal = (fine) => {
    setSelectedFineRecord(fine);
    setIsReceiptModalOpen(true);
  };

  // Toggle fine payment status (UI Only)
  const handleToggleStatus = (loanId) => {
    const res = fineService.toggleFineStatus(loanId);
    if (res.success) {
      toast.info(`Payment status updated to "${res.newStatus}"`);
      refreshData();
    }
  };

  // Send automated overdue reminder simulation
  const handleSendReminder = (loan) => {
    toast.success(
      `Overdue notice sent to ${loan.memberName} (${loan.memberEmail})! Fine accrued: ₹${loan.fineAmount}.`
    );
  };

  // Trigger Return Modal from Overdue Books list
  const handleReturnFromOverdue = (loan) => {
    setSelectedLoanForReturn(loan);
    setIsReturnModalOpen(true);
  };

  return (
    <div className="w-full px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-teal-50 text-teal-700 border border-teal-200/60 inline-flex">
              <IndianRupee className="w-5 h-5" />
            </span>
            <span>Fines & Overdue Penalties</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Automated overdue calculation, circulation settlement ledger, and receipt generation
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsCalcModalOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors cursor-pointer"
          >
            <Calculator className="w-4 h-4 text-indigo-600" />
            <span>Fine Calculator</span>
          </button>

          <button
            onClick={refreshData}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white hover:bg-slate-50 border border-slate-200/80 rounded-xl shadow-xs transition-colors cursor-pointer"
            title="Refresh Ledger"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Refresh</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Overdue Books */}
        <div
          onClick={() => handleTabChange('overdue')}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            activeTab === 'overdue'
              ? 'border-rose-400 ring-2 ring-rose-100 shadow-sm'
              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overdue Books
            </span>
            <div className="p-2 rounded-lg bg-rose-50 text-rose-600">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900">{stats.overdueBooksCount}</span>
            <span className="text-xs text-rose-600 font-medium">Pending check-in</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">View overdue loan list →</p>
        </div>

        {/* Card 2: Unpaid Penalties */}
        <div
          onClick={() => {
            handleTabChange('history');
            setStatusFilter('unpaid');
          }}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            activeTab === 'history' && statusFilter === 'unpaid'
              ? 'border-amber-400 ring-2 ring-amber-100 shadow-sm'
              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Unpaid Penalties
            </span>
            <div className="p-2 rounded-lg bg-amber-50 text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-amber-700">₹{stats.totalUnpaidAmount}</span>
            <span className="text-xs text-amber-600 font-medium">({stats.unpaidCount} records)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Filter unpaid records →</p>
        </div>

        {/* Card 3: Total Fine Collected */}
        <div
          onClick={() => {
            handleTabChange('history');
            setStatusFilter('paid');
          }}
          className={`p-4 rounded-xl border bg-white transition-all cursor-pointer ${
            activeTab === 'history' && statusFilter === 'paid'
              ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-sm'
              : 'border-slate-200/80 hover:border-slate-300 hover:shadow-xs'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Settled / Collected
            </span>
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-700">₹{stats.totalPaidAmount}</span>
            <span className="text-xs text-emerald-600 font-medium">({stats.paidCount} cleared)</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Filter cleared receipts →</p>
        </div>

        {/* Card 4: Daily Penalty Rate */}
        <div className="p-4 rounded-xl border border-slate-200/80 bg-white">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Daily Tariff
            </span>
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-600">
              <IndianRupee className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-indigo-900">₹{stats.dailyRate}</span>
            <span className="text-xs text-slate-500 font-medium">/ day overdue</span>
          </div>
          <p className="mt-1 text-[11px] text-slate-400">Automated daily accumulation</p>
        </div>

      </div>

      {/* Main Tabs Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleTabChange('history')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'history'
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <Receipt className="w-4 h-4" />
            <span>Fine History & Ledger</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'history' ? 'bg-indigo-500/50 text-white' : 'bg-slate-200 text-slate-700'
            }`}>
              {allFines.length}
            </span>
          </button>

          <button
            onClick={() => handleTabChange('overdue')}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer flex items-center gap-2 ${
              activeTab === 'overdue'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <AlertTriangle className="w-4 h-4" />
            <span>Overdue Book List</span>
            <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${
              activeTab === 'overdue' ? 'bg-rose-500/50 text-white' : 'bg-rose-100 text-rose-700'
            }`}>
              {overdueBooks.length}
            </span>
          </button>
        </div>

        {/* Quick hint */}
        <span className="text-xs text-slate-400 flex items-center gap-1">
          <Clock className="w-3.5 h-3.5" />
          Fines automatically update based on today's calendar date
        </span>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="p-4 rounded-xl border border-slate-200/80 bg-white space-y-3">
        <div className="flex flex-col md:flex-row md:items-center gap-3">
          
          {/* Search by Member / Book */}
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </div>
            <input
              type="text"
              placeholder="Search by Member (Name, ID, Email, Phone) or Book (Title, ISBN)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Clear
              </button>
            )}
          </div>

          {/* Status Filter (Paid / Unpaid) - Only applicable for History */}
          {activeTab === 'history' && (
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 hidden lg:inline">Status:</span>
              <div className="flex rounded-xl bg-slate-100 p-1 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setStatusFilter('all')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    statusFilter === 'all'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  All Status
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('unpaid')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'unpaid'
                      ? 'bg-white text-amber-700 shadow-xs font-bold'
                      : 'text-amber-700 hover:text-amber-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                  Unpaid ({stats.unpaidCount})
                </button>
                <button
                  type="button"
                  onClick={() => setStatusFilter('paid')}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                    statusFilter === 'paid'
                      ? 'bg-white text-emerald-700 shadow-xs font-bold'
                      : 'text-emerald-700 hover:text-emerald-900'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                  Paid ({stats.paidCount})
                </button>
              </div>
            </div>
          )}

          {/* Loan Circulation Type Filter (History Tab) */}
          {activeTab === 'history' && (
            <div className="flex items-center gap-1.5">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="all">All Loan Types</option>
                <option value="overdue">Currently Overdue</option>
                <option value="returned">Returned Late</option>
              </select>
            </div>
          )}

          {/* Sort By Dropdown */}
          <div className="flex items-center gap-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 bg-white text-slate-700 outline-hidden cursor-pointer"
            >
              <option value="fineDesc">Highest Fine (₹)</option>
              <option value="fineAsc">Lowest Fine (₹)</option>
              <option value="daysDesc">Most Days Overdue</option>
              <option value="dateDesc">Newest Due Date</option>
              <option value="nameAsc">Member Name (A-Z)</option>
            </select>
          </div>

        </div>
      </div>

      {/* TAB 1: FINE HISTORY & PAYMENT LEDGER */}
      {activeTab === 'history' && (
        <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
          
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                <tr>
                  <th className="px-4 py-3">Receipt / Ref</th>
                  <th className="px-4 py-3">Member Details</th>
                  <th className="px-4 py-3">Book Information</th>
                  <th className="px-4 py-3">Due / Return Date</th>
                  <th className="px-4 py-3 text-center">Overdue Days</th>
                  <th className="px-4 py-3 text-right">Fine Amount</th>
                  <th className="px-4 py-3 text-center">Payment Status</th>
                  <th className="px-4 py-3">Payment Info</th>
                  <th className="px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedFines.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-6 py-12 text-center text-slate-400">
                      <Receipt className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                      <p className="text-sm font-semibold text-slate-700">No fine records found</p>
                      <p className="text-xs text-slate-400 mt-1">Try adjusting your member search or status filters.</p>
                    </td>
                  </tr>
                ) : (
                  paginatedFines.map((fine) => {
                    const isPaid = fine.fineStatus === 'Paid';
                    return (
                      <tr key={fine.id} className="hover:bg-slate-50/70 transition-colors">
                        
                        {/* Ref / Receipt ID */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-mono font-semibold text-indigo-700 block">
                            {fine.receiptNumber || fine.loanId}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {fine.loanStatus === 'Overdue' ? 'Active Loan' : 'Returned'}
                          </span>
                        </td>

                        {/* Member Details */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={fine.memberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={fine.memberName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[140px]">{fine.memberName}</p>
                              <p className="font-mono text-[11px] text-slate-500">{fine.membershipId}</p>
                              <p className="text-[10px] text-slate-400 truncate max-w-[140px]">{fine.memberPhone}</p>
                            </div>
                          </div>
                        </td>

                        {/* Book Information */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={fine.bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                              alt={fine.bookTitle}
                              className="w-7 h-10 rounded object-cover shadow-xs border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 line-clamp-1 max-w-[180px]">{fine.bookTitle}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[180px]">{fine.bookAuthor}</p>
                              <p className="font-mono text-[10px] text-slate-400">ISBN: {fine.bookIsbn}</p>
                            </div>
                          </div>
                        </td>

                        {/* Dates */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <p className="text-[11px] font-semibold text-rose-600">
                            Due: {fine.dueDate}
                          </p>
                          <p className="text-[10px] text-slate-400">
                            {fine.returnDate ? `Returned: ${fine.returnDate}` : 'Not Returned Yet'}
                          </p>
                        </td>

                        {/* Overdue Duration */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200/60">
                            {fine.overdueDays} Day{fine.overdueDays !== 1 ? 's' : ''}
                          </span>
                          <span className="text-[10px] text-slate-400 block mt-0.5">
                            @ ₹{fine.dailyRate}/d
                          </span>
                        </td>

                        {/* Fine Amount */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-sm font-black text-slate-900 block">
                            ₹{fine.fineAmount}.00
                          </span>
                        </td>

                        {/* Payment Status (UI Only toggle available) */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => handleToggleStatus(fine.loanId)}
                            title="Click to toggle status (UI Only)"
                            className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold cursor-pointer transition-all border ${
                              isPaid
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                            }`}
                          >
                            <span className={`w-1.5 h-1.5 rounded-full ${isPaid ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
                            <span>{isPaid ? 'Paid' : 'Unpaid'}</span>
                            <RotateCcw className="w-2.5 h-2.5 opacity-40 hover:opacity-100" />
                          </button>
                        </td>

                        {/* Payment Details */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          {isPaid ? (
                            <div>
                              <span className="font-semibold text-slate-800 text-[11px] block">
                                {fine.paymentMethod || 'Desk Cash'}
                              </span>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {fine.paymentDate || 'Settled'}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 font-medium">Pending Settlement</span>
                          )}
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isPaid ? (
                              <button
                                onClick={() => handleOpenPayModal(fine)}
                                className="px-3 py-1.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <CreditCard className="w-3.5 h-3.5" />
                                <span>Pay Fine</span>
                              </button>
                            ) : (
                              <button
                                onClick={() => handleOpenReceiptModal(fine)}
                                className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                                title="Print Clearance Voucher"
                              >
                                <Printer className="w-3.5 h-3.5" />
                                <span>Receipt</span>
                              </button>
                            )}
                          </div>
                        </td>

                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {filteredFines.length > 0 && (
            <div className="px-4 py-3 border-t border-slate-200/80 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3 text-slate-500">
                <span>
                  Showing <strong className="text-slate-800">{(currentPage - 1) * pageSize + 1}</strong> to{' '}
                  <strong className="text-slate-800">{Math.min(currentPage * pageSize, filteredFines.length)}</strong> of{' '}
                  <strong className="text-slate-800">{filteredFines.length}</strong> fine records
                </span>

                <div className="flex items-center gap-1">
                  <span>Page size:</span>
                  <select
                    value={pageSize}
                    onChange={(e) => {
                      setPageSize(Number(e.target.value));
                      setCurrentPage(1);
                    }}
                    className="px-2 py-0.5 rounded border border-slate-200 bg-white font-medium text-slate-700 outline-hidden cursor-pointer"
                  >
                    <option value={5}>5</option>
                    <option value={10}>10</option>
                    <option value={25}>25</option>
                    <option value={50}>50</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-1 self-end sm:self-auto">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 1)
                  .map((pageNum, idx, arr) => (
                    <span key={pageNum} className="flex items-center">
                      {idx > 0 && arr[idx - 1] !== pageNum - 1 && (
                        <span className="px-1 text-slate-400">...</span>
                      )}
                      <button
                        onClick={() => setCurrentPage(pageNum)}
                        className={`min-w-7 h-7 px-2 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
                          currentPage === pageNum
                            ? 'bg-indigo-600 text-white'
                            : 'border border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                        }`}
                      >
                        {pageNum}
                      </button>
                    </span>
                  ))}

                <button
                  onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      )}

      {/* TAB 2: OVERDUE BOOK LIST */}
      {activeTab === 'overdue' && (
        <div className="space-y-4">
          
          <div className="p-4 rounded-xl bg-rose-50/60 border border-rose-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-rose-900">Active Overdue Retentions</h3>
                <p className="text-xs text-rose-700">
                  Books currently held past their return due date. Automated fines accrue daily at ₹10/day.
                </p>
              </div>
            </div>
            <span className="text-xs font-bold text-rose-800 bg-rose-100/80 px-3 py-1.5 rounded-lg self-start sm:self-auto">
              Total Overdue Copies: {filteredOverdueBooks.length}
            </span>
          </div>

          <div className="rounded-xl border border-slate-200/80 bg-white overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-500 uppercase font-bold text-[10px] tracking-wider">
                  <tr>
                    <th className="px-4 py-3">Book Title & Details</th>
                    <th className="px-4 py-3">Borrower / Member</th>
                    <th className="px-4 py-3">Issue Date</th>
                    <th className="px-4 py-3">Due Date</th>
                    <th className="px-4 py-3 text-center">Days Overdue</th>
                    <th className="px-4 py-3 text-right">Accrued Fine</th>
                    <th className="px-4 py-3 text-center">Borrower Contact</th>
                    <th className="px-4 py-3 text-right">Circulation Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredOverdueBooks.length === 0 ? (
                    <tr>
                      <td colSpan="8" className="px-6 py-12 text-center text-slate-400">
                        <CheckCircle2 className="w-10 h-10 mx-auto text-emerald-400 mb-2" />
                        <p className="text-sm font-semibold text-slate-700">No overdue books at this time</p>
                        <p className="text-xs text-slate-400 mt-1">All borrowed books are within their active loan periods.</p>
                      </td>
                    </tr>
                  ) : (
                    filteredOverdueBooks.map((loan) => (
                      <tr key={loan.id} className="hover:bg-rose-50/20 transition-colors">
                        
                        {/* Book */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={loan.bookCover || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100'}
                              alt={loan.bookTitle}
                              className="w-9 h-12 rounded object-cover shadow-xs border border-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 line-clamp-1 max-w-[200px]">{loan.bookTitle}</p>
                              <p className="text-[11px] text-slate-500 truncate max-w-[200px]">{loan.bookAuthor}</p>
                              <p className="font-mono text-[10px] text-slate-400">ISBN: {loan.bookIsbn}</p>
                            </div>
                          </div>
                        </td>

                        {/* Borrower */}
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={loan.memberAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=100'}
                              alt={loan.memberName}
                              className="w-8 h-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <p className="font-bold text-slate-900 truncate max-w-[140px]">{loan.memberName}</p>
                              <p className="font-mono text-[11px] text-slate-500">{loan.membershipId}</p>
                            </div>
                          </div>
                        </td>

                        {/* Issue Date */}
                        <td className="px-4 py-3.5 text-slate-600 whitespace-nowrap">
                          {loan.issueDate}
                        </td>

                        {/* Due Date */}
                        <td className="px-4 py-3.5 whitespace-nowrap">
                          <span className="font-bold text-rose-600 block">{loan.dueDate}</span>
                          <span className="text-[10px] text-rose-500">Expired</span>
                        </td>

                        {/* Days Overdue */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                            <Clock className="w-3 h-3 text-rose-600" />
                            <span>{loan.overdueDays} Days Late</span>
                          </span>
                        </td>

                        {/* Accrued Fine */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <span className="text-base font-black text-rose-700 block">
                            ₹{loan.fineAmount}.00
                          </span>
                          <span className="text-[10px] text-slate-400">
                            ({loan.overdueDays}d × ₹10/d)
                          </span>
                        </td>

                        {/* Contact details */}
                        <td className="px-4 py-3.5 text-center whitespace-nowrap">
                          <div className="flex items-center justify-center gap-2">
                            <a
                              href={`tel:${loan.memberPhone}`}
                              title={loan.memberPhone}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <Phone className="w-3.5 h-3.5" />
                            </a>
                            <a
                              href={`mailto:${loan.memberEmail}`}
                              title={loan.memberEmail}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-slate-100 transition-colors"
                            >
                              <Mail className="w-3.5 h-3.5" />
                            </a>
                            <button
                              onClick={() => handleSendReminder(loan)}
                              title="Send Overdue Notification"
                              className="p-1.5 rounded-lg text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            >
                              <Bell className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </td>

                        {/* Actions */}
                        <td className="px-4 py-3.5 text-right whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1.5">
                            <button
                              onClick={() => handleReturnFromOverdue(loan)}
                              className="px-3 py-1.5 text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 rounded-lg shadow-xs transition-colors cursor-pointer flex items-center gap-1"
                              title="Check book back in and assess return fine"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Collect & Return</span>
                            </button>

                            <button
                              onClick={() => handleOpenPayModal(loan)}
                              className="px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:text-indigo-600 hover:bg-slate-100 border border-slate-200/80 rounded-lg transition-colors cursor-pointer"
                              title="Settle fine payment"
                            >
                              Pay Fine
                            </button>
                          </div>
                        </td>

                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      )}

      {/* Interactive Modals */}
      <PayFineModal
        isOpen={isPayModalOpen}
        onClose={() => {
          setIsPayModalOpen(false);
          setSelectedFineRecord(null);
        }}
        fineRecord={selectedFineRecord}
        onSuccess={refreshData}
        onViewReceipt={(clearedRecord) => {
          setSelectedFineRecord(clearedRecord);
          setIsReceiptModalOpen(true);
        }}
      />

      <FineReceiptModal
        isOpen={isReceiptModalOpen}
        onClose={() => {
          setIsReceiptModalOpen(false);
          setSelectedFineRecord(null);
        }}
        record={selectedFineRecord}
      />

      <FineCalculatorModal
        isOpen={isCalcModalOpen}
        onClose={() => setIsCalcModalOpen(false)}
      />

      <ReturnModal
        isOpen={isReturnModalOpen}
        onClose={() => {
          setIsReturnModalOpen(false);
          setSelectedLoanForReturn(null);
        }}
        loan={selectedLoanForReturn}
        onSuccess={refreshData}
      />

    </div>
  );
}
