import { useState, useEffect, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import {
  X,
  BookMarked,
  User,
  BookOpen,
  Calendar,
  CheckCircle2,
  Search,
  AlertCircle
} from 'lucide-react';
import { toast } from 'react-toastify';
import { loanService } from '../../services/loanService';
import { bookService } from '../../services/bookService';
import { memberService } from '../../services/memberService';

const getTodayString = () => new Date().toISOString().split('T')[0];

const getFutureDate = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
};

export default function IssueModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedBookId = null,
  preselectedMemberId = null
}) {
  const [books, setBooks] = useState([]);
  const [members, setMembers] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  // Search terms for select pickers
  const [memberSearch, setMemberSearch] = useState('');
  const [bookSearch, setBookSearch] = useState('');

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors }
  } = useForm({
    defaultValues: {
      memberId: '',
      bookId: '',
      issueDate: getTodayString(),
      dueDate: getFutureDate(14),
      remarks: ''
    }
  });

  const selectedMemberId = watch('memberId');
  const selectedBookId = watch('bookId');
  const watchedIssueDate = watch('issueDate');

  // Load active books & members on open
  useEffect(() => {
    if (isOpen) {
      let allBooks = bookService.getAllBooks();
      let allMembers = memberService.getAllMembers();
      setBooks(allBooks);
      setMembers(allMembers);

      if (
        !allBooks ||
        allBooks.length === 0 ||
        !allBooks.every((b) => b.apiId && String(b.apiId).includes('/works/')) ||
        !allMembers ||
        allMembers.length === 0 ||
        !allMembers.every((m) => m.apiId !== undefined)
      ) {
        Promise.all([
          (!allBooks || allBooks.length === 0 || !allBooks.every((b) => b.apiId && String(b.apiId).includes('/works/')))
            ? bookService.fetchBooksFromApi(25)
            : Promise.resolve(),
          (!allMembers || allMembers.length === 0 || !allMembers.every((m) => m.apiId !== undefined))
            ? memberService.fetchMembersFromApi(20)
            : Promise.resolve()
        ]).then(() => {
          setBooks(bookService.getAllBooks());
          setMembers(memberService.getAllMembers());
        });
      }

      if (preselectedBookId) {
        setValue('bookId', String(preselectedBookId));
      }
      if (preselectedMemberId) {
        setValue('memberId', String(preselectedMemberId));
      }
    } else {
      reset({
        memberId: '',
        bookId: '',
        issueDate: getTodayString(),
        dueDate: getFutureDate(14),
        remarks: ''
      });
      setMemberSearch('');
      setBookSearch('');
    }
  }, [isOpen, preselectedBookId, preselectedMemberId, reset, setValue]);

  // Selected object references
  const selectedMember = useMemo(() => {
    return members.find((m) => String(m.id) === String(selectedMemberId)) || null;
  }, [members, selectedMemberId]);

  const selectedBook = useMemo(() => {
    return books.find((b) => String(b.id) === String(selectedBookId)) || null;
  }, [books, selectedBookId]);

  // FEATURE: Duplicate Loan Detection
  const isDuplicateLoan = useMemo(() => {
    if (!selectedMember || !selectedBook) return false;
    return loanService.hasActiveLoanForBook(selectedMember.id, selectedBook.id);
  }, [selectedMember, selectedBook]);

  // Filtered lists for dropdown search
  const filteredMembers = useMemo(() => {
    if (!memberSearch.trim()) return members;
    const term = memberSearch.toLowerCase().trim();
    return members.filter(
      (m) =>
        m.name.toLowerCase().includes(term) ||
        m.membershipId.toLowerCase().includes(term) ||
        m.email.toLowerCase().includes(term)
    );
  }, [members, memberSearch]);

  const filteredBooks = useMemo(() => {
    if (!bookSearch.trim()) return books;
    const term = bookSearch.toLowerCase().trim();
    return books.filter(
      (b) =>
        b.title.toLowerCase().includes(term) ||
        b.author.toLowerCase().includes(term) ||
        (b.isbn && b.isbn.toLowerCase().includes(term))
    );
  }, [books, bookSearch]);

  if (!isOpen) return null;

  // Quick Due Date helpers
  const handleSetDueDays = (days) => {
    const baseDate = watchedIssueDate ? new Date(watchedIssueDate) : new Date();
    baseDate.setDate(baseDate.getDate() + days);
    setValue('dueDate', baseDate.toISOString().split('T')[0]);
  };

  const onSubmit = async (data) => {
    if (isDuplicateLoan) {
      toast.error('Duplicate issue prohibited: This member already has an active loan for this book.');
      return;
    }

    if (selectedBook && selectedBook.availableCopies <= 0) {
      toast.error('Cannot issue: Book is out of stock.');
      return;
    }

    setSubmitting(true);
    const res = loanService.issueBook({
      memberId: data.memberId,
      bookId: data.bookId,
      issueDate: data.issueDate,
      dueDate: data.dueDate,
      remarks: data.remarks
    });
    setSubmitting(false);

    if (res.success) {
      toast.success(res.message);
      onSuccess?.(res.loan);
      onClose();
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-150 overflow-y-auto">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-auto max-h-[92vh] flex flex-col">
        
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/70 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <BookMarked className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Issue a Book (Circulation Loan)</h3>
              <p className="text-xs text-slate-500">Record an authorized monograph loan to an active reader</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4" noValidate>
          
          {/* Section 1: Select Member */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-indigo-500" />
                Select Member <span className="text-red-500">*</span>
              </label>
              {members.length > 5 && (
                <span className="text-[11px] text-slate-400">Search by name or Card ID</span>
              )}
            </div>

            {/* Member Search input */}
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={memberSearch}
                onChange={(e) => setMemberSearch(e.target.value)}
                placeholder="Type to filter members list..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden bg-slate-50/50"
              />
            </div>

            <select
              {...register('memberId', { required: 'Please select a borrower member' })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-800 cursor-pointer"
            >
              <option value="">-- Choose Borrower Member --</option>
              {filteredMembers.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name} ({m.membershipId}) — {m.role} [{m.status}]
                </option>
              ))}
            </select>
            {errors.memberId && (
              <p className="mt-1 text-xs text-red-600">{errors.memberId.message}</p>
            )}

            {/* Selected Member Preview Card */}
            {selectedMember && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedMember.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(selectedMember.name)}`}
                    alt={selectedMember.name}
                    className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-200 bg-white shrink-0"
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{selectedMember.name}</h4>
                    <p className="text-[11px] text-slate-500 font-mono">
                      {selectedMember.membershipId} • {selectedMember.email}
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      selectedMember.status === 'Active'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {selectedMember.status}
                  </span>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    {selectedMember.borrowedCount || 0} active loans
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Section 2: Select Book */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                Select Book Title <span className="text-red-500">*</span>
              </label>
              {books.length > 5 && (
                <span className="text-[11px] text-slate-400">Search by title or ISBN</span>
              )}
            </div>

            {/* Book Search input */}
            <div className="relative mb-2">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                value={bookSearch}
                onChange={(e) => setBookSearch(e.target.value)}
                placeholder="Type to filter catalog titles..."
                className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-100 outline-hidden bg-slate-50/50"
              />
            </div>

            <select
              {...register('bookId', { required: 'Please select a book to loan' })}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white text-slate-800 cursor-pointer"
            >
              <option value="">-- Choose Book Volume --</option>
              {filteredBooks.map((b) => (
                <option key={b.id} value={b.id} disabled={b.availableCopies <= 0}>
                  {b.title} by {b.author} ({b.availableCopies} / {b.totalCopies} copies available)
                  {b.availableCopies <= 0 ? ' [OUT OF STOCK]' : ''}
                </option>
              ))}
            </select>
            {errors.bookId && (
              <p className="mt-1 text-xs text-red-600">{errors.bookId.message}</p>
            )}

            {/* Selected Book Preview Card */}
            {selectedBook && (
              <div className="mt-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-3 animate-in fade-in">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedBook.coverImage}
                    alt={selectedBook.title}
                    className="w-10 h-14 object-cover rounded-md shadow-2xs border border-slate-200 shrink-0"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=100';
                    }}
                  />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{selectedBook.title}</h4>
                    <p className="text-[11px] text-slate-500">{selectedBook.author}</p>
                    <p className="text-[10px] font-mono text-slate-400">ISBN: {selectedBook.isbn}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span
                    className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${
                      selectedBook.availableCopies > 0
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-rose-50 text-rose-700 border-rose-200'
                    }`}
                  >
                    {selectedBook.availableCopies > 0
                      ? `${selectedBook.availableCopies} Available`
                      : 'Out of Stock'}
                  </span>
                  <span className="text-[10px] text-slate-400 block mt-0.5">
                    Category: {selectedBook.category}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* DUPLICATE ISSUE WARNING BANNER */}
          {isDuplicateLoan && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 flex items-start gap-2.5 text-xs animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Duplicate Loan Blocked:</strong> Member{' '}
                <span className="font-semibold">{selectedMember?.name}</span> already has an active,
                unreturned copy of <span className="italic font-semibold">"{selectedBook?.title}"</span>.
                The system prevents issuing multiple copies of the same title to a single member.
              </div>
            </div>
          )}

          {/* Section 3: Dates (Issue Date & Return Due Date) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-1">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Issue Date <span className="text-red-500">*</span>
              </label>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  {...register('issueDate', { required: 'Issue date is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.issueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.issueDate.message}</p>
              )}
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-semibold text-slate-700">
                  Return Due Date <span className="text-red-500">*</span>
                </label>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleSetDueDays(7)}
                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded-md cursor-pointer"
                  >
                    7d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDueDays(14)}
                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded-md cursor-pointer"
                  >
                    14d
                  </button>
                  <button
                    type="button"
                    onClick={() => handleSetDueDays(30)}
                    className="text-[10px] font-semibold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-1.5 py-0.5 rounded-md cursor-pointer"
                  >
                    30d
                  </button>
                </div>
              </div>
              <div className="relative rounded-lg">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <input
                  type="date"
                  {...register('dueDate', { required: 'Return due date is required' })}
                  className="w-full pl-9 pr-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
                />
              </div>
              {errors.dueDate && (
                <p className="mt-1 text-xs text-red-600">{errors.dueDate.message}</p>
              )}
            </div>
          </div>

          {/* Section 4: Remarks */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Loan Remarks / Conditions (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Clean hardcover, CD included, research reference"
              {...register('remarks')}
              className="w-full px-3 py-2 text-xs sm:text-sm rounded-xl border border-slate-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-hidden bg-white"
            />
          </div>

          {/* Form Actions Footer */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 shrink-0">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs sm:text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting || isDuplicateLoan || (selectedBook && selectedBook.availableCopies <= 0)}
              className="px-5 py-2 text-xs sm:text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-xs transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-1.5"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>{submitting ? 'Issuing Book...' : 'Authorize & Issue Book'}</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
