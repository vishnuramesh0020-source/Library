import { bookService } from './bookService';
import { memberService } from './memberService';
import { dashboardService } from './dashboardService';

const LOANS_STORAGE_KEY = 'lms_loans_store';

// Helper to format date strings YYYY-MM-DD
const formatDate = (date) => {
  const d = new Date(date);
  return d.toISOString().split('T')[0];
};

const getRelativeDate = (offsetDays) => {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  return formatDate(d);
};

// Dynamic initial circulation loan generator from live API books and members
export const generateDynamicLoans = () => {
  const books = bookService.getAllBooks();
  const members = memberService.getAllMembers();

  if (!books || books.length === 0 || !members || members.length === 0) {
    return [];
  }

  const b = (i) => books[i % books.length];
  const m = (i) => members[i % members.length];

  return [
    {
      id: 'LN-2026-801',
      bookId: b(0).id,
      bookTitle: b(0).title,
      bookAuthor: b(0).author,
      bookCover: b(0).coverImage,
      bookIsbn: b(0).isbn,
      bookCategory: b(0).category,
      memberId: m(1).id,
      memberName: m(1).name,
      membershipId: m(1).membershipId,
      memberEmail: m(1).email,
      memberPhone: m(1).phone,
      memberAvatar: m(1).avatar,
      issueDate: getRelativeDate(-5),
      dueDate: getRelativeDate(9),
      returnDate: null,
      status: 'Issued',
      overdueDays: 0,
      fineAmount: 0,
      remarks: 'Standard 14-day academic circulation'
    },
    {
      id: 'LN-2026-802',
      bookId: b(1).id,
      bookTitle: b(1).title,
      bookAuthor: b(1).author,
      bookCover: b(1).coverImage,
      bookIsbn: b(1).isbn,
      bookCategory: b(1).category,
      memberId: m(0).id,
      memberName: m(0).name,
      membershipId: m(0).membershipId,
      memberEmail: m(0).email,
      memberPhone: m(0).phone,
      memberAvatar: m(0).avatar,
      issueDate: getRelativeDate(-8),
      dueDate: getRelativeDate(6),
      returnDate: null,
      status: 'Issued',
      overdueDays: 0,
      fineAmount: 0,
      remarks: 'Faculty research circulation'
    },
    {
      id: 'LN-2026-803',
      bookId: b(2).id,
      bookTitle: b(2).title,
      bookAuthor: b(2).author,
      bookCover: b(2).coverImage,
      bookIsbn: b(2).isbn,
      bookCategory: b(2).category,
      memberId: m(4).id,
      memberName: m(4).name,
      membershipId: m(4).membershipId,
      memberEmail: m(4).email,
      memberPhone: m(4).phone,
      memberAvatar: m(4).avatar,
      issueDate: getRelativeDate(-22),
      dueDate: getRelativeDate(-8), // 8 days overdue
      returnDate: null,
      status: 'Overdue',
      overdueDays: 8,
      fineAmount: 80,
      fineStatus: 'Unpaid',
      paymentDate: null,
      paymentMethod: null,
      receiptNumber: null,
      remarks: 'Automated overdue reminder dispatched to student email'
    },
    {
      id: 'LN-2026-804',
      bookId: b(3).id,
      bookTitle: b(3).title,
      bookAuthor: b(3).author,
      bookCover: b(3).coverImage,
      bookIsbn: b(3).isbn,
      bookCategory: b(3).category,
      memberId: m(2).id,
      memberName: m(2).name,
      membershipId: m(2).membershipId,
      memberEmail: m(2).email,
      memberPhone: m(2).phone,
      memberAvatar: m(2).avatar,
      issueDate: getRelativeDate(-18),
      dueDate: getRelativeDate(-4),
      returnDate: getRelativeDate(-5), // Returned on time
      status: 'Returned',
      overdueDays: 0,
      fineAmount: 0,
      fineStatus: 'Paid',
      paymentDate: null,
      paymentMethod: null,
      receiptNumber: null,
      remarks: 'Returned in pristine condition'
    },
    {
      id: 'LN-2026-805',
      bookId: b(4).id,
      bookTitle: b(4).title,
      bookAuthor: b(4).author,
      bookCover: b(4).coverImage,
      bookIsbn: b(4).isbn,
      bookCategory: b(4).category,
      memberId: m(3).id,
      memberName: m(3).name,
      membershipId: m(3).membershipId,
      memberEmail: m(3).email,
      memberPhone: m(3).phone,
      memberAvatar: m(3).avatar,
      issueDate: getRelativeDate(-25),
      dueDate: getRelativeDate(-11),
      returnDate: getRelativeDate(-6), // Returned 5 days late
      status: 'Returned',
      overdueDays: 5,
      fineAmount: 50,
      fineStatus: 'Paid',
      paymentDate: getRelativeDate(-6),
      paymentMethod: 'UPI',
      receiptNumber: 'REC-2026-5120',
      remarks: 'Late return fine ₹50 collected via UPI'
    },
    {
      id: 'LN-2026-806',
      bookId: b(5).id,
      bookTitle: b(5).title,
      bookAuthor: b(5).author,
      bookCover: b(5).coverImage,
      bookIsbn: b(5).isbn,
      bookCategory: b(5).category,
      memberId: m(0).id,
      memberName: m(0).name,
      membershipId: m(0).membershipId,
      memberEmail: m(0).email,
      memberPhone: m(0).phone,
      memberAvatar: m(0).avatar,
      issueDate: getRelativeDate(-20),
      dueDate: getRelativeDate(-6),
      returnDate: getRelativeDate(-3), // Returned 3 days late
      status: 'Returned',
      overdueDays: 3,
      fineAmount: 30,
      fineStatus: 'Unpaid',
      paymentDate: null,
      paymentMethod: null,
      receiptNumber: null,
      remarks: 'Returned 3 days late; fine unpaid at drop-off'
    }
  ];
};

export const loanService = {
  // Synchronize loan records with current API books and API members
  syncLoansWithApiData(loans) {
    const books = bookService.getAllBooks();
    const members = memberService.getAllMembers();

    if (!books || books.length === 0 || !members || members.length === 0) {
      return loans;
    }

    let hasChanges = false;
    const synced = loans.map((loan, idx) => {
      let book = books.find((b) => String(b.id) === String(loan.bookId));
      if (!book) {
        book = books[idx % books.length];
      }

      let member = members.find((m) => String(m.id) === String(loan.memberId));
      if (!member) {
        member = members[idx % members.length];
      }

      const updated = {
        ...loan,
        bookId: book.id,
        bookTitle: book.title,
        bookAuthor: book.author,
        bookCover: book.coverImage,
        bookIsbn: book.isbn,
        bookCategory: book.category,
        memberId: member.id,
        memberName: member.name,
        membershipId: member.membershipId,
        memberEmail: member.email,
        memberPhone: member.phone,
        memberAvatar: member.avatar
      };

      if (
        loan.bookId !== updated.bookId ||
        loan.bookTitle !== updated.bookTitle ||
        loan.memberId !== updated.memberId ||
        loan.memberName !== updated.memberName ||
        loan.bookCover !== updated.bookCover ||
        loan.memberAvatar !== updated.memberAvatar
      ) {
        hasChanges = true;
      }
      return updated;
    });

    if (hasChanges) {
      this.saveLoans(synced);
    }
    return synced;
  },

  // Initialize loan transactions store
  initLoans() {
    try {
      const stored = localStorage.getItem(LOANS_STORAGE_KEY);
      let loans = stored ? JSON.parse(stored) : [];

      // Check if loans are empty or have any legacy mock books/members
      const hasLegacyMock = loans.some(
        (l) => l.bookTitle?.includes('Clean Architecture') || l.memberName === 'Alex Rivera'
      );

      if (loans.length === 0 || hasLegacyMock) {
        loans = generateDynamicLoans();
        if (loans.length > 0) {
          this.saveLoans(loans);
        }
      }

      loans = this.syncLoansWithApiData(loans);
      return this.evaluateOverdueLoans(loans);
    } catch {
      return generateDynamicLoans();
    }
  },

  saveLoans(loans) {
    try {
      localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(loans));
    } catch (e) {
      console.error('Error saving loans to localStorage', e);
    }
  },

  // Automatically update status to 'Overdue' and calculate fine if today > dueDate and not yet returned
  evaluateOverdueLoans(loans) {
    const today = new Date().toISOString().split('T')[0];
    let hasChanges = false;

    const updated = loans.map((loan) => {
      if (loan.status !== 'Returned') {
        if (loan.dueDate < today) {
          const diffMs = new Date(today) - new Date(loan.dueDate);
          const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
          const fine = diffDays * 10; // ₹10 per overdue day

          if (
            loan.status !== 'Overdue' ||
            loan.fineAmount !== fine ||
            loan.overdueDays !== diffDays ||
            !loan.fineStatus
          ) {
            hasChanges = true;
            return {
              ...loan,
              status: 'Overdue',
              overdueDays: diffDays,
              fineAmount: fine,
              fineStatus: loan.fineStatus || 'Unpaid'
            };
          }
        }
      } else if (loan.fineAmount > 0 && !loan.fineStatus) {
        hasChanges = true;
        return {
          ...loan,
          fineStatus: 'Paid'
        };
      }
      return loan;
    });

    if (hasChanges) {
      this.saveLoans(updated);
    }
    return updated;
  },

  getAllLoans() {
    return this.initLoans();
  },

  getLoanById(id) {
    const loans = this.getAllLoans();
    return loans.find((l) => String(l.id) === String(id)) || null;
  },

  // Check active loan for member: Prevent duplicate book issue
  hasActiveLoanForBook(memberId, bookId) {
    const loans = this.getAllLoans();
    return loans.some(
      (loan) =>
        String(loan.memberId) === String(memberId) &&
        String(loan.bookId) === String(bookId) &&
        loan.status !== 'Returned'
    );
  },

  getActiveLoansByMember(memberId) {
    const loans = this.getAllLoans();
    return loans.filter(
      (loan) => String(loan.memberId) === String(memberId) && loan.status !== 'Returned'
    );
  },

  getActiveLoansByBook(bookId) {
    const loans = this.getAllLoans();
    return loans.filter(
      (loan) => String(loan.bookId) === String(bookId) && loan.status !== 'Returned'
    );
  },

  // Issue Book with all validation and state synchronization
  issueBook({ memberId, bookId, issueDate, dueDate, remarks }) {
    const book = bookService.getBookById(bookId);
    if (!book) {
      return { success: false, message: 'Selected book could not be found in catalog.' };
    }

    if (book.availableCopies <= 0) {
      return {
        success: false,
        message: `"${book.title}" is currently out of stock. All copies are on loan.`
      };
    }

    const member = memberService.getMemberById(memberId);
    if (!member) {
      return { success: false, message: 'Selected member was not found in registry.' };
    }

    if (member.status === 'Suspended') {
      return {
        success: false,
        message: `Member "${member.name}" is currently suspended. Please resolve outstanding fines or restrictions before issuing books.`
      };
    }

    // FEATURE: Prevent Duplicate Book Issue
    if (this.hasActiveLoanForBook(member.id, book.id)) {
      return {
        success: false,
        message: `Member "${member.name}" already has an active loan for "${book.title}". Duplicate issue of the same title is not permitted.`
      };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const finalIssueDate = issueDate || todayStr;

    // Default due date: 14 days after issue date
    let finalDueDate = dueDate;
    if (!finalDueDate) {
      const d = new Date(finalIssueDate);
      d.setDate(d.getDate() + 14);
      finalDueDate = formatDate(d);
    }

    // 1. Create Loan Record
    const newLoan = {
      id: `LN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      bookId: String(book.id),
      bookTitle: book.title,
      bookAuthor: book.author,
      bookCover: book.coverImage || 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500',
      bookIsbn: book.isbn,
      bookCategory: book.category,
      memberId: String(member.id),
      memberName: member.name,
      membershipId: member.membershipId,
      memberEmail: member.email,
      memberPhone: member.phone,
      memberAvatar: member.avatar,
      issueDate: finalIssueDate,
      dueDate: finalDueDate,
      returnDate: null,
      status: 'Issued',
      fineAmount: 0,
      remarks: remarks ? remarks.trim() : 'Issued via circulation counter'
    };

    const loans = this.getAllLoans();
    loans.unshift(newLoan);
    this.saveLoans(loans);

    // 2. FEATURE: Book Availability Update (decrement by 1)
    bookService.updateBook(book.id, {
      availableCopies: Math.max(0, book.availableCopies - 1)
    });

    // 3. Update Member's Borrowed Count
    const currentBorrowed = member.borrowedCount || 0;
    memberService.updateMember(member.id, {
      borrowedCount: currentBorrowed + 1
    });

    // 4. Update Dashboard metrics and activity stream
    try {
      dashboardService.recordIssueBook({
        bookTitle: book.title,
        memberName: member.name,
        dueDate: finalDueDate
      });
    } catch (e) {
      console.warn('Dashboard sync note:', e);
    }

    return {
      success: true,
      loan: newLoan,
      message: `Book "${book.title}" successfully issued to ${member.name}! Due on ${finalDueDate}.`
    };
  },

  // Return Book with overdue calculation and state synchronization
  returnBook(loanId, returnDate = null, returnRemarks = '') {
    const loans = this.getAllLoans();
    const index = loans.findIndex((l) => String(l.id) === String(loanId));

    if (index === -1) {
      return { success: false, message: 'Loan transaction record not found.' };
    }

    const loan = loans[index];
    if (loan.status === 'Returned') {
      return { success: false, message: 'This book has already been marked as returned.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const actualReturnDate = returnDate || todayStr;

    // Check if returned overdue
    let isLate = false;
    let fine = 0;
    if (actualReturnDate > loan.dueDate) {
      isLate = true;
      const diffMs = new Date(actualReturnDate) - new Date(loan.dueDate);
      const diffDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
      fine = diffDays * 10; // ₹10 per day overdue
    }

    const overdueDays = isLate
      ? Math.max(1, Math.ceil((new Date(actualReturnDate) - new Date(loan.dueDate)) / (1000 * 60 * 60 * 24)))
      : 0;

    const updatedLoan = {
      ...loan,
      returnDate: actualReturnDate,
      status: 'Returned',
      overdueDays,
      fineAmount: fine,
      fineStatus: fine > 0 ? (loan.fineStatus || 'Unpaid') : 'Paid',
      remarks: returnRemarks.trim()
        ? `${loan.remarks} | Return notes: ${returnRemarks.trim()}`
        : isLate
        ? `Returned ${overdueDays} days late. Fine: ₹${fine}`
        : 'Returned on-time in good condition'
    };

    loans[index] = updatedLoan;
    this.saveLoans(loans);

    // 1. FEATURE: Book Availability Update (increment by 1)
    const book = bookService.getBookById(loan.bookId);
    if (book) {
      bookService.updateBook(book.id, {
        availableCopies: Math.min(book.totalCopies, book.availableCopies + 1)
      });
    }

    // 2. Decrement Member's Borrowed Count
    const member = memberService.getMemberById(loan.memberId);
    if (member) {
      memberService.updateMember(member.id, {
        borrowedCount: Math.max(0, (member.borrowedCount || 1) - 1)
      });
    }

    // 3. Update Dashboard metrics and activity stream
    try {
      const data = dashboardService.getData();
      if (data.booksIssuedBase > 0) {
        data.booksIssuedBase -= 1;
      }
      if (loan.status === 'Overdue' && data.overdueBooksBase > 0) {
        data.overdueBooksBase -= 1;
      }

      const returnActivity = {
        id: `act-${Date.now()}`,
        type: 'return',
        title: isLate ? 'Overdue Book Returned' : 'Book Returned On-Time',
        description: `"${loan.bookTitle}" checked back in by ${loan.memberName}${fine > 0 ? ` (Overdue penalty: ₹${fine})` : ''}`,
        time: 'Just now',
        badge: isLate ? 'Returned Late' : 'Returned',
        badgeColor: isLate ? 'bg-amber-50 text-amber-700 border-amber-200' : 'bg-emerald-50 text-emerald-700 border-emerald-200',
        user: loan.memberName,
        timestamp: Date.now()
      };

      data.activities = [returnActivity, ...(data.activities || [])];
      dashboardService.saveData(data);
    } catch (e) {
      console.warn('Dashboard sync note:', e);
    }

    return {
      success: true,
      loan: updatedLoan,
      isLate,
      fine,
      message: isLate
        ? `Book returned successfully. Overdue fine assessed: ₹${fine}.`
        : `Book "${loan.bookTitle}" returned on-time. Shelf availability updated!`
    };
  },

  // Update specific loan record (e.g. fineStatus, payment details)
  updateLoan(loanId, updates) {
    const loans = this.getAllLoans();
    const index = loans.findIndex((l) => String(l.id) === String(loanId));
    if (index === -1) {
      return { success: false, message: 'Loan transaction record not found.' };
    }
    loans[index] = {
      ...loans[index],
      ...updates
    };
    this.saveLoans(loans);
    return { success: true, loan: loans[index] };
  },

  // Calculate summary statistics
  getStats() {
    const loans = this.getAllLoans();
    const active = loans.filter((l) => l.status === 'Issued').length;
    const overdue = loans.filter((l) => l.status === 'Overdue').length;
    const returned = loans.filter((l) => l.status === 'Returned').length;
    const totalFines = loans.reduce((acc, l) => acc + (l.fineAmount || 0), 0);

    return {
      totalLoans: loans.length,
      activeLoans: active,
      overdueLoans: overdue,
      returnedLoans: returned,
      totalFines
    };
  }
};
