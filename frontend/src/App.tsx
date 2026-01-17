import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './App.css';
import Home from './components/Home';
import ResumeBuilder from './components/ResumeBuilder';
import Login from './components/Login';
import Register from './components/Register';
import ForgotPassword from './components/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import { AccessibilityProvider } from './contexts/AccessibilityContext';
import { AuthProvider } from './contexts/AuthContext';
import AccessibilityToolbar from './components/AccessibilityToolbar';
import Header from './components/Header';
import Footer from './components/Footer';
import Contact from './components/Contact';
import JobRecommendationEngine from './components/JobRecommendationEngine';
import SearchResults from './components/SearchResults';
import UserProfile from './components/UserProfile';
import Dashboard from './components/Dashboard';

function App() {
  return (
    <AuthProvider>
      <AccessibilityProvider>
        <Router>
          <div className="App page-root">
            <Header />
            <main className="page-container">
              <AccessibilityToolbar />
              <Routes>
                {/* Public Routes */}
                <Route path="/" element={<Home />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Protected Routes */}
                <Route
                  path="/dashboard"
                  element={
                    <ProtectedRoute>
                      <Dashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/resume-builder"
                  element={
                    <ProtectedRoute>
                      <ResumeBuilder />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/job-recommendations"
                  element={
                    <ProtectedRoute>
                      <JobRecommendationEngine />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/profile"
                  element={
                    <ProtectedRoute>
                      <UserProfile />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/search"
                  element={
                    <ProtectedRoute>
                      <SearchResults />
                    </ProtectedRoute>
                  }
                />
                
                {/* Other Routes */}
                <Route path="/providers" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-700">Service Providers - Coming Soon</h1></div>} />
                <Route path="/training" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-700">Training - Coming Soon</h1></div>} />
                <Route path="/interview" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-700">Interview Prep - Coming Soon</h1></div>} />
                <Route path="/assistive-tools" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-700">Assistive Tools - Coming Soon</h1></div>} />
                <Route path="/stories" element={<div className="min-h-screen bg-gray-50 flex items-center justify-center"><h1 className="text-3xl font-bold text-gray-700">Success Stories - Coming Soon</h1></div>} />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AccessibilityProvider>
    </AuthProvider>
  );
}

export default App;
