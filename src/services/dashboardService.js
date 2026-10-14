import { authService } from './authService';

const DASHBOARD_DATA_KEY = 'lms_dashboard_data';

const INITIAL_DASHBOARD_DATA = {
  totalBooksBase: 4850,
  booksIssuedBase: 845,
  overdueBooksBase: 42,
  fineCollectedBase: 1420.50,
  categories: [
    { name: 'Computer Science', count: 1240, color: 'bg-indigo-500' },
    { name: 'Literature & Fiction', count: 980, color: 'bg-violet-500' },
    { name: 'Engineering & Tech', count: 820, color: 'bg-blue-500' },
    { name: 'Natural Sciences', count: 640, color: 'bg-emerald-500' },
    { name: 'History & Biography', count: 520, color: 'bg-amber-500' },
    { name: 'Philosophy & Ethics', count: 380, color: 'bg-rose-500' },
    { name: 'Mathematics & Logic', count: 270, color: 'bg-teal-500' }
  ],
  activities: [
    {
      id: 'act-1',
      type: 'return',
      title: 'Book Returned On-Time',
      description: '"Clean Architecture" returned by Alex Rivera (MEM-2025-42)',
      time: '10 minutes ago',
      badge: 'Returned',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      user: 'Alex Rivera',
      timestamp: Date.now() - 1000 * 60 * 10
    },
    {
      id: 'act-2',
      type: 'issue',
      title: 'Monograph Issued',
      description: '"Design Patterns: Elements of Reusable Object-Oriented Software" issued to Sarah Jenkins',
      time: '45 minutes ago',
      badge: 'Issued',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      user: 'Sarah Jenkins',
      timestamp: Date.now() - 1000 * 60 * 45
    },
    {
      id: 'act-3',
      type: 'overdue',
      title: 'Overdue Notice Dispatched',
      description: 'System flagged "Introduction to Algorithms, 4th Ed." (Loan #LN-8012)',
      time: '2 hours ago',
      badge: 'Overdue',
      badgeColor: 'bg-red-50 text-red-700 border-red-200',
      user: 'Marcus Vance',
      timestamp: Date.now() - 1000 * 60 * 120
    },
    {
      id: 'act-4',
      type: 'fine',
      title: 'Late Return Fine Collected',
      description: 'Paid ₹150 via UPI - Receipt #F-9201 for 5 days overdue',
      time: '3 hours ago',
      badge: 'Fine Paid',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      user: 'Elena Rostova',
      timestamp: Date.now() - 1000 * 60 * 180
    },
    {
      id: 'act-5',
      type: 'member',
      title: 'New Member Registered',
      description: 'Faculty membership created with full research repository privileges',
      time: '5 hours ago',
      badge: 'Enrolled',
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
      user: 'Dr. Arthur Pendelton',
      timestamp: Date.now() - 1000 * 60 * 300
    },
    {
      id: 'act-6',
      type: 'catalog',
      title: 'New Catalog Acquisition',
      description: 'Added 5 new hardcovers of "Deep Learning with Python, 2nd Edition"',
      time: 'Yesterday at 4:30 PM',
      badge: 'Added',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      user: 'Central Acquisitions',
      timestamp: Date.now() - 1000 * 60 * 1440
    }
  ]
};

export const dashboardService = {
  getData() {
    try {
      const stored = localStorage.getItem(DASHBOARD_DATA_KEY);
      if (!stored) {
        localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(INITIAL_DASHBOARD_DATA));
        return INITIAL_DASHBOARD_DATA;
      }
      const parsed = JSON.parse(stored);
      if (parsed.activities) {
        parsed.activities = parsed.activities.map((act) => ({
          ...act,
          description: act.description ? act.description.replace(/\$/g, '₹') : act.description
        }));
      }
      return parsed;
    } catch {
      return INITIAL_DASHBOARD_DATA;
    }
  },

  saveData(data) {
    try {
      localStorage.setItem(DASHBOARD_DATA_KEY, JSON.stringify(data));
    } catch (e) {
      console.error('Error saving dashboard data to local storage', e);
    }
  },

  getStats() {
    const data = this.getData();
    // Dynamically calculate registered members from Member store & Auth user store
    let membersCount = 10;
    try {
      const storedMembers = localStorage.getItem('lms_members_store');
      if (storedMembers) {
        membersCount = JSON.parse(storedMembers).length;
      }
    } catch {
      const registeredUsers = authService.getUsers() || [];
      membersCount = registeredUsers.length;
    }
    const baseMembers = 1240;
    const totalMembers = baseMembers + membersCount;

    const totalBooks = data.totalBooksBase;
    const booksIssued = data.booksIssuedBase;
    const booksAvailable = totalBooks - booksIssued;
    const overdueBooks = data.overdueBooksBase;
    const totalCategories = data.categories.length;
    const fineCollected = data.fineCollectedBase;

    return {
      totalBooks,
      totalMembers,
      booksIssued,
      booksAvailable,
      overdueBooks,
      totalCategories,
      fineCollected: Number(fineCollected).toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    };
  },

  getActivities() {
    const data = this.getData();
    return data.activities || [];
  },

  getCategories() {
    const data = this.getData();
    return data.categories || [];
  },

  recordIssueBook({ bookTitle, memberName, dueDate }) {
    const data = this.getData();
    data.booksIssuedBase += 1;

    const newActivity = {
      id: `act-${Date.now()}`,
      type: 'issue',
      title: 'Book Issued',
      description: `"${bookTitle}" issued to ${memberName} (Due: ${dueDate})`,
      time: 'Just now',
      badge: 'Issued',
      badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
      user: memberName,
      timestamp: Date.now()
    };

    data.activities = [newActivity, ...data.activities];
    this.saveData(data);
    return { success: true };
  },

  recordNewBook({ title, category, copies }) {
    const data = this.getData();
    const count = parseInt(copies, 10) || 1;
    data.totalBooksBase += count;

    // Check if category exists or add
    const catIdx = data.categories.findIndex(
      (c) => c.name.toLowerCase() === category.toLowerCase()
    );
    if (catIdx !== -1) {
      data.categories[catIdx].count += count;
    } else {
      data.categories.push({
        name: category,
        count: count,
        color: 'bg-indigo-500'
      });
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      type: 'catalog',
      title: 'New Book Cataloged',
      description: `Added ${count} copy/copies of "${title}" in [${category}]`,
      time: 'Just now',
      badge: 'Added',
      badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      user: 'Librarian Staff',
      timestamp: Date.now()
    };

    data.activities = [newActivity, ...data.activities];
    this.saveData(data);
    return { success: true };
  },

  recordCollectFine({ memberName, amount, reason }) {
    const data = this.getData();
    const parsedAmount = parseFloat(amount) || 0;
    data.fineCollectedBase += parsedAmount;
    if (data.overdueBooksBase > 0) {
      data.overdueBooksBase -= 1;
    }

    const newActivity = {
      id: `act-${Date.now()}`,
      type: 'fine',
      title: 'Fine Collected',
      description: `Collected ₹${parsedAmount.toFixed(2)} from ${memberName} for ${reason}`,
      time: 'Just now',
      badge: 'Fine Paid',
      badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
      user: memberName,
      timestamp: Date.now()
    };

    data.activities = [newActivity, ...data.activities];
    this.saveData(data);
    return { success: true };
  }
};
