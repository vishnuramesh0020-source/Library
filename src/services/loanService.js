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

export const INITIAL_LOANS = [
  {
    id: 'LN-2026-801',
    bookId: 'book-1',
    bookTitle: 'Clean Architecture: A Craftsman\'s Guide to Software Structure',
    bookAuthor: 'Robert C. Martin',
    bookCover: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0134494166',
    bookCategory: 'Computer Science',
    memberId: 'mem-2',
    memberName: 'Alex Rivera',
    membershipId: 'MEM-2025-42',
    memberEmail: 'student@library.com',
    memberPhone: '+91 98123 45678',
    memberAvatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-5),
    dueDate: getRelativeDate(9),
    returnDate: null,
    status: 'Issued', // 'Issued' | 'Returned' | 'Overdue'
    fineAmount: 0,
    remarks: 'Standard 14-day academic loan'
  },
  {
    id: 'LN-2026-802',
    bookId: 'book-2',
    bookTitle: 'Designing Data-Intensive Applications',
    bookAuthor: 'Martin Kleppmann',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-1449373320',
    bookCategory: 'Computer Science',
    memberId: 'mem-1',
    memberName: 'Sarah Jenkins',
    membershipId: 'LIB-2025-01',
    memberEmail: 'librarian@library.com',
    memberPhone: '+91 98765 43210',
    memberAvatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-8),
    dueDate: getRelativeDate(6),
    returnDate: null,
    status: 'Issued',
    fineAmount: 0,
    remarks: 'Faculty research circulation'
  },
  {
    id: 'LN-2026-803',
    bookId: 'book-4',
    bookTitle: 'Introduction to Algorithms (CLRS)',
    bookAuthor: 'Thomas H. Cormen & Charles E. Leiserson',
    bookCover: 'https://images.unsplash.com/photo-1509266272358-7701da638078?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0262046305',
    bookCategory: 'Mathematics & Logic',
    memberId: 'mem-5',
    memberName: 'Marcus Vance',
    membershipId: 'MEM-2025-77',
    memberEmail: 'marcus.v@polytechnic.edu',
    memberPhone: '+91 95456 78901',
    memberAvatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-22),
    dueDate: getRelativeDate(-8), // 8 days overdue
    returnDate: null,
    status: 'Overdue',
    overdueDays: 8,
    fineAmount: 80, // ₹10 per day * 8 days
    fineStatus: 'Unpaid',
    paymentDate: null,
    paymentMethod: null,
    receiptNumber: null,
    remarks: 'Automated overdue reminder sent to student email'
  },
  {
    id: 'LN-2026-804',
    bookId: 'book-3',
    bookTitle: 'The Pragmatic Programmer: Your Journey to Mastery',
    bookAuthor: 'David Thomas & Andrew Hunt',
    bookCover: 'https://images.unsplash.com/photo-1532012164546-f432f2e3edd4?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0135957059',
    bookCategory: 'Computer Science',
    memberId: 'mem-3',
    memberName: 'Dr. Arthur Pendelton',
    membershipId: 'FAC-2024-18',
    memberEmail: 'arthur.p@university.edu',
    memberPhone: '+91 97234 56789',
    memberAvatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-18),
    dueDate: getRelativeDate(-4),
    returnDate: getRelativeDate(-5), // Returned on time before due
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
    bookId: 'book-5',
    bookTitle: '1984',
    bookAuthor: 'George Orwell',
    bookCover: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0451524935',
    bookCategory: 'Literature & Fiction',
    memberId: 'mem-4',
    memberName: 'Elena Rostova',
    membershipId: 'MEM-2025-104',
    memberEmail: 'elena.rostova@academics.org',
    memberPhone: '+91 96345 67890',
    memberAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
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
    bookId: 'book-6',
    bookTitle: 'To Kill a Mockingbird',
    bookAuthor: 'Harper Lee',
    bookCover: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0060935467',
    bookCategory: 'Literature & Fiction',
    memberId: 'mem-6',
    memberName: 'Priyanka Sharma',
    membershipId: 'RES-2025-09',
    memberEmail: 'priyanka.sharma@research.in',
    memberPhone: '+91 94567 89012',
    memberAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-3),
    dueDate: getRelativeDate(11),
    returnDate: null,
    status: 'Issued',
    overdueDays: 0,
    fineAmount: 0,
    fineStatus: 'Paid',
    paymentDate: null,
    paymentMethod: null,
    receiptNumber: null,
    remarks: 'Literature department coursework'
  },
  {
    id: 'LN-2026-807',
    bookId: 'book-7',
    bookTitle: 'JavaScript: The Definitive Guide',
    bookAuthor: 'David Flanagan',
    bookCover: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-1491952023',
    bookCategory: 'Computer Science',
    memberId: 'mem-7',
    memberName: 'David Chen',
    membershipId: 'MEM-2025-50',
    memberEmail: 'david.chen@mit.edu',
    memberPhone: '+91 93678 90123',
    memberAvatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
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
    remarks: 'Returned 3 days late; fine unpaid at time of drop-off'
  },
  {
    id: 'LN-2026-808',
    bookId: 'book-2',
    bookTitle: 'Designing Data-Intensive Applications',
    bookAuthor: 'Martin Kleppmann',
    bookCover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-1449373320',
    bookCategory: 'Computer Science',
    memberId: 'mem-6',
    memberName: 'Priyanka Sharma',
    membershipId: 'RES-2025-09',
    memberEmail: 'priyanka.sharma@research.in',
    memberPhone: '+91 94567 89012',
    memberAvatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-26),
    dueDate: getRelativeDate(-12), // 12 days overdue
    returnDate: null,
    status: 'Overdue',
    overdueDays: 12,
    fineAmount: 120, // 12 * 10
    fineStatus: 'Unpaid',
    paymentDate: null,
    paymentMethod: null,
    receiptNumber: null,
    remarks: 'Reminder sent; borrower requested research extension'
  },
  {
    id: 'LN-2026-809',
    bookId: 'book-8',
    bookTitle: 'The Great Gatsby',
    bookAuthor: 'F. Scott Fitzgerald',
    bookCover: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=500&auto=format&fit=crop&q=80',
    bookIsbn: '978-0743273565',
    bookCategory: 'Literature & Fiction',
    memberId: 'mem-8',
    memberName: 'Ananya Deshmukh',
    membershipId: 'MEM-2025-88',
    memberEmail: 'ananya.d@iitb.ac.in',
    memberPhone: '+91 92567 89012',
    memberAvatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    issueDate: getRelativeDate(-18),
    dueDate: getRelativeDate(-4),
    returnDate: getRelativeDate(-1), // Returned 3 days late
    status: 'Returned',
    overdueDays: 3,
    fineAmount: 30,
    fineStatus: 'Paid',
    paymentDate: getRelativeDate(-1),
    paymentMethod: 'Cash',
    receiptNumber: 'REC-2026-7840',
    remarks: 'Settled at front circulation desk'
  }
];

export const loanService = {
  // Initialize loan transactions store
  initLoans() {
    try {
      const stored = localStorage.getItem(LOANS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(LOANS_STORAGE_KEY, JSON.stringify(INITIAL_LOANS));
        return INITIAL_LOANS;
      }
      const parsed = JSON.parse(stored);
      // Dynamically re-evaluate overdue status on load
      return this.evaluateOverdueLoans(parsed);
    } catch {
      return INITIAL_LOANS;
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
