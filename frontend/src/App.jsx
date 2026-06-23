import React, { useEffect, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AOS from 'aos';
import 'aos/dist/aos.css';
import { useAuthStore } from './store/authStore';
import Navbar from './components/Navbar';
import Loader from './components/Loader';

// Lazy load heavy or rarely used components
const Login = lazy(() => import('./pages/Login'));
const Signup = lazy(() => import('./pages/Signup'));
const Landing = lazy(() => import('./pages/Landing'));
const EventDetails = lazy(() => import('./pages/EventDetails'));
const ForgotPassword = lazy(() => import('./pages/ForgotPassword'));
const ResetPassword = lazy(() => import('./pages/ResetPassword'));

// Eagerly load core pages to prevent routing delay
import Dashboard from './pages/Dashboard';
import Discover from './pages/Discover';
import Profile from './pages/Profile';
import SavedEvents from './pages/SavedEvents';

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuthStore();
  
  if (loading) {
    return <div className="min-h-screen flex items-center justify-center dark:bg-slate-900 dark:text-white">Loading...</div>;
  }
  
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

function App() {
  const { initialize, user } = useAuthStore();

  useEffect(() => {
    initialize();
    AOS.init({
      duration: 800,
      once: false,
      offset: 100,
    });
  }, [initialize]);

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 font-sans text-slate-900 dark:text-slate-100">
      <Router>
        <Navbar />

        <Suspense fallback={<Loader />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/" element={<Landing />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/discover" 
              element={
                <ProtectedRoute>
                  <Discover />
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
            <Route 
              path="/saved" 
              element={
                <ProtectedRoute>
                  <SavedEvents />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/event/:id" 
              element={
                <ProtectedRoute>
                  <EventDetails />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Suspense>
      </Router>
    </div>
  );
}

export default App;
