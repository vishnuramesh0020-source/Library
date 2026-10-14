import { dashboardService } from './dashboardService';

const MEMBERS_STORAGE_KEY = 'lms_members_store';

export const INITIAL_MEMBERS = [
  {
    id: 'mem-1',
    name: 'Sarah Jenkins',
    email: 'librarian@library.com',
    phone: '+91 98765 43210',
    address: '42 Academic Ridge, University Campus, New Delhi 110025',
    membershipId: 'LIB-2025-01',
    membershipDate: '2024-03-15',
    status: 'Active',
    role: 'Librarian Staff',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 2
  },
  {
    id: 'mem-2',
    name: 'Alex Rivera',
    email: 'student@library.com',
    phone: '+91 98123 45678',
    address: '15 West End Hall, North Campus Road, Mumbai 400012',
    membershipId: 'MEM-2025-42',
    membershipDate: '2024-08-20',
    status: 'Active',
    role: 'Student Member',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 1
  },
  {
    id: 'mem-3',
    name: 'Dr. Arthur Pendelton',
    email: 'arthur.p@university.edu',
    phone: '+91 97234 56789',
    address: '88 Faculty Enclave, Science Block, Bengaluru 560012',
    membershipId: 'FAC-2024-18',
    membershipDate: '2024-01-10',
    status: 'Active',
    role: 'Faculty Scholar',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 3
  },
  {
    id: 'mem-4',
    name: 'Elena Rostova',
    email: 'elena.rostova@academics.org',
    phone: '+91 96345 67890',
    address: '104 Lotus Heights, Sector 62, Noida 201301',
    membershipId: 'MEM-2025-104',
    membershipDate: '2024-05-18',
    status: 'Active',
    role: 'Student Member',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 0
  },
  {
    id: 'mem-5',
    name: 'Marcus Vance',
    email: 'marcus.v@polytechnic.edu',
    phone: '+91 95456 78901',
    address: '77 Residency Circle, Civil Lines, Jaipur 302006',
    membershipId: 'MEM-2025-77',
    membershipDate: '2024-09-02',
    status: 'Suspended',
    role: 'Student Member',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 2
  },
  {
    id: 'mem-6',
    name: 'Priyanka Sharma',
    email: 'priyanka.sharma@research.in',
    phone: '+91 94567 89012',
    address: '12 Cyber City Road, DLF Phase 2, Gurugram 122002',
    membershipId: 'RES-2025-09',
    membershipDate: '2024-02-14',
    status: 'Active',
    role: 'Research Fellow',
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 4
  },
  {
    id: 'mem-7',
    name: 'David Chen',
    email: 'david.chen@mit.edu',
    phone: '+91 93678 90123',
    address: '50 Park Avenue, Jubilee Hills, Hyderabad 500033',
    membershipId: 'MEM-2025-50',
    membershipDate: '2024-07-11',
    status: 'Active',
    role: 'Student Member',
    avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 1
  },
  {
    id: 'mem-8',
    name: 'Ananya Deshmukh',
    email: 'ananya.d@iitb.ac.in',
    phone: '+91 92789 01234',
    address: '23 Powai Lake Road, Central Avenue, Mumbai 400076',
    membershipId: 'FAC-2025-23',
    membershipDate: '2024-06-30',
    status: 'Active',
    role: 'Faculty Scholar',
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 0
  },
  {
    id: 'mem-9',
    name: 'Rohan Mehta',
    email: 'rohan.mehta@alumni.org',
    phone: '+91 91890 12345',
    address: '14 Bapu Nagar, Ashram Road, Ahmedabad 380009',
    membershipId: 'MEM-2024-88',
    membershipDate: '2024-04-05',
    status: 'Active',
    role: 'Alumni Member',
    avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 1
  },
  {
    id: 'mem-10',
    name: 'Kavita Nair',
    email: 'kavita.nair@litstudies.ac.in',
    phone: '+91 90901 23456',
    address: '6 Palm Beach Road, Marine Drive, Kochi 682011',
    membershipId: 'MEM-2025-108',
    membershipDate: '2024-10-01',
    status: 'Active',
    role: 'Student Member',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&auto=format&fit=crop&q=80',
    borrowedCount: 0
  }
];

export const memberService = {
  initMembers() {
    try {
      const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(INITIAL_MEMBERS));
        return INITIAL_MEMBERS;
      }
      return JSON.parse(stored);
    } catch {
      return INITIAL_MEMBERS;
    }
  },

  getAllMembers() {
    return this.initMembers();
  },

  getMemberById(id) {
    const members = this.getAllMembers();
    return members.find((m) => String(m.id) === String(id) || String(m.membershipId) === String(id)) || null;
  },

  saveMembers(members) {
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Error saving members to localStorage', e);
    }
  },

  generateMembershipId() {
    const currentYear = new Date().getFullYear();
    const randomSuffix = Math.floor(100 + Math.random() * 900);
    return `MEM-${currentYear}-${randomSuffix}`;
  },

  isMembershipIdUnique(membershipId, excludeId = null) {
    const members = this.getAllMembers();
    return !members.some(
      (m) => m.membershipId.toLowerCase().trim() === membershipId.toLowerCase().trim() && String(m.id) !== String(excludeId)
    );
  },

  isEmailUnique(email, excludeId = null) {
    const members = this.getAllMembers();
    return !members.some(
      (m) => m.email.toLowerCase().trim() === email.toLowerCase().trim() && String(m.id) !== String(excludeId)
    );
  },

  addMember(data) {
    const members = this.getAllMembers();

    // Check unique membership ID
    if (!this.isMembershipIdUnique(data.membershipId)) {
      return { success: false, message: `Membership ID "${data.membershipId}" is already taken.` };
    }

    // Check unique email
    if (!this.isEmailUnique(data.email)) {
      return { success: false, message: `Email address "${data.email}" is already registered to a member.` };
    }

    const newMember = {
      id: `mem-${Date.now()}`,
      name: data.name.trim(),
      email: data.email.trim(),
      phone: data.phone.trim(),
      address: data.address.trim(),
      membershipId: data.membershipId.trim().toUpperCase(),
      membershipDate: data.membershipDate || new Date().toISOString().split('T')[0],
      status: data.status || 'Active',
      role: data.role || 'Student Member',
      avatar: data.avatar && data.avatar.trim() !== ''
        ? data.avatar.trim()
        : `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name.trim())}`,
      borrowedCount: 0
    };

    members.unshift(newMember);
    this.saveMembers(members);

    // Sync with Dashboard Activities
    try {
      const dashData = dashboardService.getData();
      const newActivity = {
        id: `act-${Date.now()}`,
        type: 'member',
        title: 'New Member Enrolled',
        description: `Issued card ${newMember.membershipId} to ${newMember.name}`,
        time: 'Just now',
        badge: 'Enrolled',
        badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
        user: newMember.name,
        timestamp: Date.now()
      };
      dashData.activities = [newActivity, ...(dashData.activities || [])];
      dashboardService.saveData(dashData);
    } catch (e) {
      console.warn('Dashboard sync note:', e);
    }

    return { success: true, member: newMember, message: `Member ${newMember.name} successfully registered!` };
  },

  updateMember(id, data) {
    const members = this.getAllMembers();
    const index = members.findIndex((m) => String(m.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Member record not found.' };
    }

    // Check unique membership ID
    if (data.membershipId && !this.isMembershipIdUnique(data.membershipId, id)) {
      return { success: false, message: `Membership ID "${data.membershipId}" is already taken by another member.` };
    }

    // Check unique email
    if (data.email && !this.isEmailUnique(data.email, id)) {
      return { success: false, message: `Email address "${data.email}" is already in use by another member.` };
    }

    const current = members[index];
    const updatedMember = {
      ...current,
      name: data.name ? data.name.trim() : current.name,
      email: data.email ? data.email.trim() : current.email,
      phone: data.phone ? data.phone.trim() : current.phone,
      address: data.address ? data.address.trim() : current.address,
      membershipId: data.membershipId ? data.membershipId.trim().toUpperCase() : current.membershipId,
      membershipDate: data.membershipDate || current.membershipDate,
      status: data.status || current.status,
      role: data.role || current.role,
      avatar: data.avatar && data.avatar.trim() !== '' ? data.avatar.trim() : current.avatar
    };

    members[index] = updatedMember;
    this.saveMembers(members);

    return { success: true, member: updatedMember, message: `Member profile for ${updatedMember.name} updated.` };
  },

  deleteMember(id) {
    const members = this.getAllMembers();
    const target = members.find((m) => String(m.id) === String(id));

    if (!target) {
      return { success: false, message: 'Member record not found.' };
    }

    const remaining = members.filter((m) => String(m.id) !== String(id));
    this.saveMembers(remaining);

    return { success: true, message: `Member "${target.name}" (${target.membershipId}) deleted from registry.` };
  }
};
