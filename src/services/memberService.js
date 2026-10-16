import axios from 'axios';
import { dashboardService } from './dashboardService';

const MEMBERS_STORAGE_KEY = 'lms_members_store';
const PRIMARY_USERS_API = 'https://dummyjson.com/users';
const FALLBACK_USERS_API = 'https://jsonplaceholder.typicode.com/users';

// Transform DummyJSON user to Member model
const transformUserToMember = (user, index) => {
  const roles = ['Student Member', 'Faculty Scholar', 'Research Fellow', 'Alumni Member'];
  const role = user.company?.title || roles[index % roles.length];
  const fullAddress = user.address
    ? `${user.address.address}, ${user.address.city}, ${user.address.state} ${user.address.postalCode}`
    : '42 University Boulevard, Campus Enclave, New Delhi 110025';

  return {
    id: `mem-${user.id}`,
    apiId: user.id,
    name: `${user.firstName} ${user.lastName}`,
    email: user.email,
    phone: user.phone || `+91 ${9810000000 + user.id * 12345}`,
    address: fullAddress,
    membershipId: `MEM-2025-${String(user.id).padStart(3, '0')}`,
    membershipDate: user.birthDate || '2024-03-15',
    status: 'Active',
    role,
    avatar: user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.firstName + ' ' + user.lastName)}`,
    borrowedCount: 0
  };
};

// Transform JSONPlaceholder user fallback to Member model
const transformJpUserToMember = (user, index) => {
  const roles = ['Student Member', 'Faculty Scholar', 'Research Fellow', 'Alumni Member'];
  const address = user.address
    ? `${user.address.street}, ${user.address.suite}, ${user.address.city} ${user.address.zipcode}`
    : '104 Academic Enclave, North Campus, Mumbai 400012';

  return {
    id: `mem-${user.id}`,
    apiId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    address,
    membershipId: `MEM-2025-${String(user.id).padStart(3, '0')}`,
    membershipDate: '2024-03-15',
    status: 'Active',
    role: roles[index % roles.length],
    avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}`,
    borrowedCount: 0
  };
};

export const memberService = {
  // Save members to localStorage
  saveMembers(members) {
    try {
      localStorage.setItem(MEMBERS_STORAGE_KEY, JSON.stringify(members));
    } catch (e) {
      console.error('Error saving members to localStorage', e);
    }
  },

  // Get currently loaded members from local cache with dynamic active loans count
  getAllMembers() {
    try {
      const stored = localStorage.getItem(MEMBERS_STORAGE_KEY);
      if (stored) {
        const members = JSON.parse(stored);
        let activeLoansMap = {};
        try {
          const storedLoans = localStorage.getItem('lms_loans_store');
          if (storedLoans) {
            const loans = JSON.parse(storedLoans);
            loans.forEach((l) => {
              if (l.status !== 'Returned') {
                activeLoansMap[l.memberId] = (activeLoansMap[l.memberId] || 0) + 1;
              }
            });
          }
        } catch {
          // fallback
        }

        return members.map((m) => ({
          ...m,
          borrowedCount: activeLoansMap[m.id] !== undefined ? activeLoansMap[m.id] : (m.borrowedCount || 0)
        }));
      }
      return [];
    } catch {
      return [];
    }
  },

  getMemberById(id) {
    const members = this.getAllMembers();
    return (
      members.find(
        (m) => String(m.id) === String(id) || String(m.membershipId) === String(id)
      ) || null
    );
  },

  // Fetch members from Third-Party REST API (API-First Architecture)
  async fetchMembersFromApi(limit = 20, force = false) {
    const existing = this.getAllMembers();
    const hasValidApiMembers = existing && existing.length > 0 && existing.every((m) => m.apiId !== undefined);
    if (!force && hasValidApiMembers) {
      return { success: true, members: existing, source: 'cache' };
    }

    try {
      // Primary Third-Party API Call (DummyJSON Users)
      const res = await axios.get(`${PRIMARY_USERS_API}?limit=${limit}&select=firstName,lastName,email,phone,address,image,birthDate,company`, {
        timeout: 8000
      });

      const users = res.data.users || [];
      const transformed = users.map(transformUserToMember);

      this.saveMembers(transformed);
      return { success: true, members: transformed, source: 'api (DummyJSON Users)' };
    } catch (primaryErr) {
      console.warn('Primary users API fetch failed, trying fallback API:', primaryErr.message);

      try {
        // Fallback Third-Party API Call (JSONPlaceholder Users)
        const resFallback = await axios.get(`${FALLBACK_USERS_API}?_limit=${limit}`, {
          timeout: 6000
        });

        const users = resFallback.data || [];
        const transformedFallback = users.map(transformJpUserToMember);

        this.saveMembers(transformedFallback);
        return { success: true, members: transformedFallback, source: 'api (JSONPlaceholder Users)' };
      } catch (fallbackErr) {
        console.error('All member APIs failed:', fallbackErr);

        if (existing && existing.length > 0) {
          return { success: true, members: existing, source: 'cache (offline)' };
        }

        return {
          success: false,
          message: primaryErr.response?.data?.message || primaryErr.message || 'Third-Party Members API network error'
        };
      }
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
      (m) =>
        m.membershipId.toLowerCase().trim() === membershipId.toLowerCase().trim() &&
        String(m.id) !== String(excludeId)
    );
  },

  isEmailUnique(email, excludeId = null) {
    const members = this.getAllMembers();
    return !members.some(
      (m) =>
        m.email.toLowerCase().trim() === email.toLowerCase().trim() &&
        String(m.id) !== String(excludeId)
    );
  },

  // Add Member via API POST
  async addMember(data) {
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

    // Third-party API POST request
    try {
      await axios.post(`${PRIMARY_USERS_API}/add`, {
        firstName: newMember.name.split(' ')[0],
        lastName: newMember.name.split(' ').slice(1).join(' ') || 'Member',
        email: newMember.email,
        phone: newMember.phone
      });
    } catch (err) {
      console.warn('API POST simulation note:', err.message);
    }

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

  // Update Member via API PUT
  async updateMember(id, data) {
    const members = this.getAllMembers();
    const index = members.findIndex((m) => String(m.id) === String(id));

    if (index === -1) {
      return { success: false, message: 'Member record not found.' };
    }

    if (data.membershipId && !this.isMembershipIdUnique(data.membershipId, id)) {
      return { success: false, message: `Membership ID "${data.membershipId}" is already taken by another member.` };
    }

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

    // Third-party API PUT request
    try {
      const numericId = String(id).replace('mem-', '');
      await axios.put(`${PRIMARY_USERS_API}/${numericId || 1}`, {
        firstName: updatedMember.name,
        email: updatedMember.email,
        phone: updatedMember.phone
      });
    } catch (err) {
      console.warn('API PUT simulation note:', err.message);
    }

    members[index] = updatedMember;
    this.saveMembers(members);

    return { success: true, member: updatedMember, message: `Member profile for ${updatedMember.name} updated.` };
  },

  // Delete Member via API DELETE
  async deleteMember(id) {
    const members = this.getAllMembers();
    const target = members.find((m) => String(m.id) === String(id));

    if (!target) {
      return { success: false, message: 'Member record not found.' };
    }

    // Third-party API DELETE request
    try {
      const numericId = String(id).replace('mem-', '');
      await axios.delete(`${PRIMARY_USERS_API}/${numericId || 1}`);
    } catch (err) {
      console.warn('API DELETE simulation note:', err.message);
    }

    const remaining = members.filter((m) => String(m.id) !== String(id));
    this.saveMembers(remaining);

    return { success: true, message: `Member "${target.name}" (${target.membershipId}) deleted from registry.` };
  }
};
