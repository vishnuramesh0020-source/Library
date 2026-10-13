// LocalStorage Keys
const USERS_STORAGE_KEY = 'lms_registered_users';
const CURRENT_USER_KEY = 'lms_auth_user';

// Pre-seeded default users for immediate demo & testing
const DEFAULT_USERS = [
  {
    id: 'user-admin-01',
    name: 'Sarah Jenkins',
    email: 'librarian@library.com',
    password: 'Password@123',
    role: 'Librarian',
    membershipId: 'LIB-2025-01',
    phone: '+1 (555) 234-5678',
    securityQuestion: 'What is your favorite book?',
    securityAnswer: 'To Kill a Mockingbird',
    joinedDate: '2024-03-15',
    avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    department: 'Central Archive & Acquisitions'
  },
  {
    id: 'user-member-02',
    name: 'Alex Rivera',
    email: 'student@library.com',
    password: 'Password@123',
    role: 'Member',
    membershipId: 'MEM-2025-42',
    phone: '+1 (555) 876-5432',
    securityQuestion: 'What is your favorite book?',
    securityAnswer: 'The Great Gatsby',
    joinedDate: '2024-08-20',
    avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    department: 'Computer Science & Literature'
  }
];

export const authService = {
  // Initialize storage if empty
  initUsers() {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      if (!stored) {
        localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(DEFAULT_USERS));
        return DEFAULT_USERS;
      }
      return JSON.parse(stored);
    } catch {
      return DEFAULT_USERS;
    }
  },

  getUsers() {
    return this.initUsers();
  },

  getCurrentUser() {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  saveCurrentUser(user) {
    try {
      // Omit sensitive password from current user session token/object
      const { password: _password, securityAnswer: _securityAnswer, ...safeUser } = user;
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(safeUser));
      return safeUser;
    } catch (e) {
      console.error('Error saving current user to localStorage', e);
      return null;
    }
  },

  clearCurrentUser() {
    try {
      localStorage.removeItem(CURRENT_USER_KEY);
    } catch (e) {
      console.error('Error removing current user from localStorage', e);
    }
  },

  login(email, password) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (!user) {
      return { success: false, message: 'No registered user found with this email address.' };
    }

    if (user.password !== password) {
      return { success: false, message: 'Incorrect password. Please verify and try again.' };
    }

    const safeUser = this.saveCurrentUser(user);
    return { success: true, user: safeUser, message: 'Login successful!' };
  },

  register(userData) {
    const users = this.getUsers();
    const emailExists = users.some(
      (u) => u.email.toLowerCase().trim() === userData.email.toLowerCase().trim()
    );

    if (emailExists) {
      return {
        success: false,
        message: 'An account with this email address already exists. Please log in.'
      };
    }

    const newId = `user-${Date.now()}`;
    const membershipPrefix = userData.role === 'Librarian' ? 'LIB' : 'MEM';
    const membershipId = `${membershipPrefix}-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    const newUser = {
      id: newId,
      name: userData.name.trim(),
      email: userData.email.toLowerCase().trim(),
      password: userData.password,
      role: userData.role || 'Member',
      membershipId,
      phone: userData.phone || '+1 (555) 000-0000',
      securityQuestion: userData.securityQuestion || 'What is your favorite book?',
      securityAnswer: userData.securityAnswer ? userData.securityAnswer.trim() : 'Library',
      joinedDate: new Date().toISOString().split('T')[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(userData.name)}`,
      department: userData.department || 'General Library Access'
    };

    users.push(newUser);
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const safeUser = this.saveCurrentUser(newUser);
    return { success: true, user: safeUser, message: 'Account registered successfully!' };
  },

  findUserByEmail(email) {
    const users = this.getUsers();
    const found = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!found) return null;
    const { password: _password, ...safe } = found;
    return safe;
  },

  getSecurityQuestion(email) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!user) return null;
    return user.securityQuestion || 'What is your favorite book?';
  },

  verifySecurityAnswer(email, answer) {
    const users = this.getUsers();
    const user = users.find(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );
    if (!user) {
      return { success: false, message: 'User not found.' };
    }

    const isMatch =
      user.securityAnswer &&
      user.securityAnswer.toLowerCase().trim() === answer.toLowerCase().trim();

    if (!isMatch) {
      return { success: false, message: 'Security answer is incorrect.' };
    }

    return { success: true, message: 'Security answer verified.' };
  },

  resetPassword(email, newPassword) {
    const users = this.getUsers();
    const index = users.findIndex(
      (u) => u.email.toLowerCase().trim() === email.toLowerCase().trim()
    );

    if (index === -1) {
      return { success: false, message: 'User not found with this email.' };
    }

    users[index].password = newPassword;
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    // If currently logged in user is this person, update state
    const current = this.getCurrentUser();
    if (current && current.email.toLowerCase() === email.toLowerCase()) {
      this.clearCurrentUser();
    }

    return {
      success: true,
      message: 'Password has been reset successfully! Please log in with your new password.'
    };
  },

  updateUserProfile(userId, updatedFields) {
    const users = this.getUsers();
    const index = users.findIndex((u) => u.id === userId);
    if (index === -1) return { success: false, message: 'User not found.' };

    users[index] = { ...users[index], ...updatedFields };
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));

    const safeUser = this.saveCurrentUser(users[index]);
    return { success: true, user: safeUser, message: 'Profile updated successfully!' };
  }
};
