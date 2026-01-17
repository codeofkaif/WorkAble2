import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { dashboardAPI, DashboardData } from '../services/dashboardAPI';
import JobSeekerDashboard from './JobSeekerDashboard';
import EmployerDashboard from './EmployerDashboard';
import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

/**
 * Main Dashboard Component
 * Detects user role and renders appropriate dashboard:
 * - Job Seeker Dashboard
 * - Employer Dashboard
 * 
 * Handles loading states and errors gracefully
 */
const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardAPI.getDashboard();
      setDashboardData(data);
    } catch (err: any) {
      console.error('Dashboard fetch error:', err);
      setError(
        err.response?.data?.message || 
        err.message || 
        'Failed to load dashboard. Please try again later.'
      );
    } finally {
      setLoading(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <Loader2 className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600" aria-live="polite">
            Loading dashboard...
          </p>
        </motion.div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-md p-8 max-w-md text-center"
          role="alert"
        >
          <h2 className="text-2xl font-bold text-red-600 mb-4">
            Error Loading Dashboard
          </h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button
            onClick={fetchDashboardData}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
            aria-label="Retry loading dashboard"
          >
            Try Again
          </button>
        </motion.div>
      </div>
    );
  }

  // No data state
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">No dashboard data available.</p>
        </div>
      </div>
    );
  }

  // Render appropriate dashboard based on role
  return (
    <div role="main" aria-label="Dashboard">
      {dashboardData.role === 'employer' ? (
        <EmployerDashboard data={dashboardData} />
      ) : (
        <JobSeekerDashboard data={dashboardData} />
      )}
    </div>
  );
};

export default Dashboard;

