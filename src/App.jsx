import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider } from './context/AuthContext';
import Navbar from './components/common/Navbar';
import Footer from './components/common/Footer';
import ProtectedRoute from './components/auth/ProtectedRoute';
import PublicRoute from './components/auth/PublicRoute';

import { bookService } from './services/bookService';
import { memberService } from './services/memberService';
import { loanService } from './services/loanService';
import { categoryService } from './services/categoryService';

import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import BookList from './pages/BookList';
import BookDetails from './pages/BookDetails';
import Categories from './pages/Categories';
import Dashboard from './pages/Dashboard';
import MemberList from './pages/MemberList';
import MemberProfile from './pages/MemberProfile';
import Circulation from './pages/Circulation';
import Fines from './pages/Fines';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';

function AppContent() {
  const location = useLocation();
  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);

  // Global API Initialization on Application Boot
  useEffect(() => {
    const initAppData = async () => {
      try {
        const books = bookService.getAllBooks();
        const hasValidApiBooks =
          books.length > 0 && books.every((b) => b.apiId && String(b.apiId).includes('/works/'));
        if (!hasValidApiBooks) {
          await bookService.fetchBooksFromApi(25);
        }

        const members = memberService.getAllMembers();
        const hasValidApiMembers = members.length > 0 && members.every((m) => m.apiId !== undefined);
        if (!hasValidApiMembers) {
          await memberService.fetchMembersFromApi(20);
        }

        loanService.initLoans();
        categoryService.initCategories();
      } catch (err) {
        console.warn('App global API init note:', err);
      }
    };
    initAppData();
  }, []);

  return (
    <div className={`w-full flex flex-col bg-slate-50 text-slate-800 font-sans selection:bg-indigo-600 selection:text-white ${isAuthPage ? 'h-screen overflow-hidden' : 'min-h-screen'}`}>
      <Navbar />
      <main className={`flex-1 w-full flex flex-col ${isAuthPage ? 'overflow-hidden' : ''}`}>
        <Routes>
          {/* Root redirect to Dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Public Authentication Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />
          <Route
            path="/forgot-password"
            element={
              <PublicRoute>
                <ForgotPassword />
              </PublicRoute>
            }
          />

          {/* Protected Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books"
            element={
              <ProtectedRoute>
                <BookList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/books/:id"
            element={
              <ProtectedRoute>
                <BookDetails />
              </ProtectedRoute>
            }
          />
          <Route
            path="/categories"
            element={
              <ProtectedRoute>
                <Categories />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members"
            element={
              <ProtectedRoute>
                <MemberList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/members/:id"
            element={
              <ProtectedRoute>
                <MemberProfile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/circulation"
            element={
              <ProtectedRoute>
                <Circulation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/fines"
            element={
              <ProtectedRoute>
                <Fines />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />

          {/* 404 Catch-All */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>
      {!isAuthPage && <Footer />}

      {/* Toast Notification Container */}
      <ToastContainer
        position="top-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
    </div>
  );
}

export default function App() {
  return (
    <Router>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Router>
  );
}
