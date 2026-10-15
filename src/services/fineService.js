import { loanService } from './loanService';
import { dashboardService } from './dashboardService';

export const DAILY_FINE_RATE = 10; // ₹10 per day overdue

export const fineService = {
  getDailyRate() {
    return DAILY_FINE_RATE;
  },

  // Calculate fine given overdue days and optional custom rate
  calculateFine(daysOverdue, rate = DAILY_FINE_RATE) {
    const days = Math.max(0, parseInt(daysOverdue || 0, 10));
    return days * rate;
  },

  // Format fine records into a standardized structure
  getAllFines() {
    const loans = loanService.getAllLoans();
    // A fine record is any loan that has accrued a fine or is overdue
    const fineLoans = loans.filter(
      (l) => (l.fineAmount && l.fineAmount > 0) || l.status === 'Overdue'
    );

    return fineLoans.map((loan) => {
      const today = new Date().toISOString().split('T')[0];
      let overdueDays = loan.overdueDays;

      if (overdueDays === undefined || overdueDays === null) {
        if (loan.status === 'Overdue' || (loan.dueDate < today && loan.status !== 'Returned')) {
          const diffMs = new Date(today) - new Date(loan.dueDate);
          overdueDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        } else if (loan.returnDate && loan.returnDate > loan.dueDate) {
          const diffMs = new Date(loan.returnDate) - new Date(loan.dueDate);
          overdueDays = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        } else {
          overdueDays = 0;
        }
      }

      const fineAmount = loan.fineAmount || overdueDays * DAILY_FINE_RATE;
      const fineStatus = loan.fineStatus || (loan.status === 'Overdue' ? 'Unpaid' : 'Paid');

      return {
        id: loan.id,
        loanId: loan.id,
        bookId: loan.bookId,
        bookTitle: loan.bookTitle,
        bookAuthor: loan.bookAuthor,
        bookCover: loan.bookCover,
        bookIsbn: loan.bookIsbn,
        bookCategory: loan.bookCategory,
        memberId: loan.memberId,
        memberName: loan.memberName,
        membershipId: loan.membershipId,
        memberEmail: loan.memberEmail,
        memberPhone: loan.memberPhone,
        memberAvatar: loan.memberAvatar,
        issueDate: loan.issueDate,
        dueDate: loan.dueDate,
        returnDate: loan.returnDate,
        loanStatus: loan.status, // 'Overdue' | 'Returned' | 'Issued'
        overdueDays,
        dailyRate: DAILY_FINE_RATE,
        fineAmount,
        fineStatus, // 'Paid' | 'Unpaid'
        paymentDate: loan.paymentDate || null,
        paymentMethod: loan.paymentMethod || null, // 'UPI' | 'Cash' | 'Card' | 'Net Banking'
        receiptNumber: loan.receiptNumber || null,
        remarks: loan.remarks || ''
      };
    });
  },

  // Get only currently overdue books (Active on-loan, not yet returned)
  getOverdueBooks() {
    const today = new Date().toISOString().split('T')[0];
    const loans = loanService.getAllLoans();

    return loans
      .filter((loan) => loan.status !== 'Returned' && (loan.status === 'Overdue' || loan.dueDate < today))
      .map((loan) => {
        const diffMs = new Date(today) - new Date(loan.dueDate);
        const days = Math.max(1, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
        const fine = days * DAILY_FINE_RATE;

        return {
          ...loan,
          overdueDays: days,
          fineAmount: fine,
          fineStatus: loan.fineStatus || 'Unpaid'
        };
      });
  },

  // Compute summary metrics for KPI cards
  getFineStats() {
    const fines = this.getAllFines();
    const overdueBooks = this.getOverdueBooks();

    const totalFinesAssessed = fines.reduce((sum, f) => sum + (f.fineAmount || 0), 0);
    const paidFines = fines.filter((f) => f.fineStatus === 'Paid');
    const unpaidFines = fines.filter((f) => f.fineStatus === 'Unpaid');

    const totalPaidAmount = paidFines.reduce((sum, f) => sum + (f.fineAmount || 0), 0);
    const totalUnpaidAmount = unpaidFines.reduce((sum, f) => sum + (f.fineAmount || 0), 0);

    return {
      totalFinesAssessed,
      totalPaidAmount,
      totalUnpaidAmount,
      totalRecords: fines.length,
      paidCount: paidFines.length,
      unpaidCount: unpaidFines.length,
      overdueBooksCount: overdueBooks.length,
      dailyRate: DAILY_FINE_RATE
    };
  },

  // Process fine payment settlement
  payFine(loanId, { paymentMethod = 'UPI', amount = null, remarks = '' } = {}) {
    const loan = loanService.getLoanById(loanId);
    if (!loan) {
      return { success: false, message: 'Circulation record not found.' };
    }

    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNum = loan.receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const finalAmount = amount !== null ? parseFloat(amount) : (loan.fineAmount || 0);

    const updates = {
      fineStatus: 'Paid',
      paymentDate: todayStr,
      paymentMethod,
      receiptNumber: receiptNum,
      remarks: remarks.trim()
        ? `${loan.remarks} | Payment note: ${remarks.trim()}`
        : `${loan.remarks} | Fine of ₹${finalAmount} paid via ${paymentMethod}`
    };

    loanService.updateLoan(loanId, updates);

    // Sync to dashboard metrics and activity feed
    try {
      dashboardService.recordCollectFine({
        memberName: loan.memberName,
        amount: finalAmount,
        reason: `${loan.bookTitle} (${loan.overdueDays || 1}d overdue)`
      });
    } catch (e) {
      console.warn('Dashboard sync note:', e);
    }

    return {
      success: true,
      receiptNumber: receiptNum,
      amount: finalAmount,
      paymentMethod,
      paymentDate: todayStr,
      message: `Fine of ₹${finalAmount} successfully marked as PAID! Receipt: ${receiptNum}`
    };
  },

  // Quick toggle between 'Paid' and 'Unpaid' (UI Only status change)
  toggleFineStatus(loanId) {
    const loan = loanService.getLoanById(loanId);
    if (!loan) return { success: false, message: 'Record not found' };

    const currentStatus = loan.fineStatus || (loan.status === 'Overdue' ? 'Unpaid' : 'Paid');
    const newStatus = currentStatus === 'Paid' ? 'Unpaid' : 'Paid';

    const todayStr = new Date().toISOString().split('T')[0];
    const updates = {
      fineStatus: newStatus,
      paymentDate: newStatus === 'Paid' ? todayStr : null,
      paymentMethod: newStatus === 'Paid' ? (loan.paymentMethod || 'Desk Cash') : null,
      receiptNumber: newStatus === 'Paid' ? (loan.receiptNumber || `REC-2026-${Math.floor(1000 + Math.random() * 9000)}`) : null
    };

    loanService.updateLoan(loanId, updates);

    return {
      success: true,
      newStatus,
      message: `Fine status updated to ${newStatus}`
    };
  },

  // Waive fine with justification
  waiveFine(loanId, reason = 'Administrative waiver') {
    const loan = loanService.getLoanById(loanId);
    if (!loan) return { success: false, message: 'Record not found' };

    const todayStr = new Date().toISOString().split('T')[0];
    const receiptNum = `WAV-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const updates = {
      fineStatus: 'Paid',
      paymentDate: todayStr,
      paymentMethod: 'Waived',
      receiptNumber: receiptNum,
      remarks: `${loan.remarks} | Fee waived: ${reason}`
    };

    loanService.updateLoan(loanId, updates);

    return {
      success: true,
      message: `Fine of ₹${loan.fineAmount} waived successfully.`
    };
  }
};
