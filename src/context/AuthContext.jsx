import { createContext, useState } from 'react';
import { toast } from 'react-toastify';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  // Initialize state synchronously from localStorage to eliminate cascading renders
  const [user, setUser] = useState(() => {
    try {
      authService.initUsers();
      return authService.getCurrentUser();
    } catch (e) {
      console.error('Failed to initialize auth state:', e);
      return null;
    }
  });
  
  const [loading] = useState(false);

  // Login handler
  const login = async (email, password) => {
    try {
      const result = authService.login(email, password);
      if (result.success) {
        setUser(result.user);
        toast.success(`Welcome back, ${result.user.name}!`);
        return { success: true };
      } else {
        toast.error(result.message || 'Login failed. Please check your credentials.');
        return { success: false, message: result.message };
      }
    } catch (err) {
      toast.error('An unexpected error occurred during login.');
      return { success: false, message: err.message };
    }
  };

  // Register handler
  const register = async (userData) => {
    try {
      const result = authService.register(userData);
      if (result.success) {
        setUser(result.user);
        toast.success('Registration successful! Welcome to the Library.');
        return { success: true };
      } else {
        toast.error(result.message || 'Registration failed.');
        return { success: false, message: result.message };
      }
    } catch (err) {
      toast.error('An unexpected error occurred during registration.');
      return { success: false, message: err.message };
    }
  };

  // Logout handler
  const logout = () => {
    authService.clearCurrentUser();
    setUser(null);
    toast.info('You have been logged out.');
  };

  // Forgot password & reset handler
  const resetPassword = async (email, newPassword) => {
    try {
      const result = authService.resetPassword(email, newPassword);
      if (result.success) {
        toast.success(result.message);
        return { success: true };
      } else {
        toast.error(result.message);
        return { success: false, message: result.message };
      }
    } catch (err) {
      toast.error('Failed to reset password.');
      return { success: false, message: err.message };
    }
  };

  // Verify security answer
  const verifySecurity = (email, answer) => {
    return authService.verifySecurityAnswer(email, answer);
  };

  // Get security question for email
  const fetchSecurityQuestion = (email) => {
    return authService.getSecurityQuestion(email);
  };

  // Update profile
  const updateProfile = (updatedFields) => {
    if (!user) return { success: false };
    const result = authService.updateUserProfile(user.id, updatedFields);
    if (result.success) {
      setUser(result.user);
      toast.success('Profile updated successfully!');
      return { success: true };
    } else {
      toast.error(result.message || 'Profile update failed.');
      return { success: false, message: result.message };
    }
  };

  const value = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    register,
    logout,
    resetPassword,
    verifySecurity,
    fetchSecurityQuestion,
    updateProfile
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export { AuthContext };
export { useAuth } from './useAuth';
