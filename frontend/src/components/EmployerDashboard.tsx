import React from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  Users, 
  UserCheck, 
  FileText,
  Plus,
  Eye,
  Calendar
} from 'lucide-react';
import StatCard from './ui/StatCard';
import { DashboardData, Application } from '../services/dashboardAPI';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface EmployerDashboardProps {
  data: DashboardData;
}

/**
 * Employer Dashboard Component
 * Displays dashboard for employers with:
 * - Jobs posted count
 * - Applications received
 * - Shortlisted candidates
 * - Recent applications list
 * - Post new job button
 */
const EmployerDashboard: React.FC<EmployerDashboardProps> = ({ data }) => {
  const { state: accessibilityState } = useAccessibility();

  // Translations
  const translations: Record<string, Record<string, string>> = {
    en: {
      greeting: `Welcome, ${data.user.name}!`,
      dashboard: 'Employer Dashboard',
      stats: 'Your Statistics',
      jobsPosted: 'Jobs Posted',
      applicationsReceived: 'Applications Received',
      shortlistedCandidates: 'Shortlisted Candidates',
      activeJobs: 'Active Jobs',
      postNewJob: 'Post New Job',
      recentApplications: 'Recent Applications',
      viewApplicants: 'View Applicants',
      candidate: 'Candidate',
      jobTitle: 'Job Title',
      appliedDate: 'Applied Date',
      status: 'Status',
      pending: 'Pending',
      shortlisted: 'Shortlisted',
      rejected: 'Rejected',
      noApplications: 'No applications yet'
    },
    hi: {
      greeting: `स्वागत है, ${data.user.name}!`,
      dashboard: 'नियोक्ता डैशबोर्ड',
      stats: 'आपके आंकड़े',
      jobsPosted: 'पोस्ट की गई नौकरियां',
      applicationsReceived: 'प्राप्त आवेदन',
      shortlistedCandidates: 'शॉर्टलिस्ट उम्मीदवार',
      activeJobs: 'सक्रिय नौकरियां',
      postNewJob: 'नई नौकरी पोस्ट करें',
      recentApplications: 'हाल के आवेदन',
      viewApplicants: 'आवेदक देखें',
      candidate: 'उम्मीदवार',
      jobTitle: 'नौकरी का शीर्षक',
      appliedDate: 'आवेदन की तारीख',
      status: 'स्थिति',
      pending: 'लंबित',
      shortlisted: 'शॉर्टलिस्ट',
      rejected: 'अस्वीकृत',
      noApplications: 'अभी तक कोई आवेदन नहीं'
    }
  };

  // Get current language with fallback to 'en'
  const currentLanguage = accessibilityState?.language || 'en';
  const t = translations[currentLanguage] || translations.en;

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'shortlisted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex items-center justify-between flex-wrap gap-4"
        >
          <div>
            <h1 
              className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
              id="employer-dashboard-title"
              tabIndex={0}
            >
              {t.greeting}
            </h1>
            <p className="text-gray-600" aria-describedby="employer-dashboard-title">
              {t.dashboard}
            </p>
          </div>
          <button
            onClick={() => window.location.href = '/post-job'}
            className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-all duration-300 flex items-center space-x-2 shadow-md hover:shadow-lg"
            aria-label={t.postNewJob}
          >
            <Plus className="w-5 h-5" />
            <span>{t.postNewJob}</span>
          </button>
        </motion.div>

        {/* Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4" tabIndex={0}>
            {t.stats}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t.jobsPosted}
              value={data.stats.jobsPosted || 0}
              icon={<Briefcase className="w-8 h-8" />}
              color="blue"
              ariaLabel={`${t.jobsPosted}: ${data.stats.jobsPosted || 0}`}
            />
            <StatCard
              title={t.applicationsReceived}
              value={data.stats.applicationsReceived || 0}
              icon={<FileText className="w-8 h-8" />}
              color="purple"
              ariaLabel={`${t.applicationsReceived}: ${data.stats.applicationsReceived || 0}`}
            />
            <StatCard
              title={t.shortlistedCandidates}
              value={data.stats.shortlistedCandidates || 0}
              icon={<UserCheck className="w-8 h-8" />}
              color="green"
              ariaLabel={`${t.shortlistedCandidates}: ${data.stats.shortlistedCandidates || 0}`}
            />
            <StatCard
              title={t.activeJobs}
              value={data.stats.activeJobs || 0}
              icon={<Briefcase className="w-8 h-8" />}
              color="yellow"
              ariaLabel={`${t.activeJobs}: ${data.stats.activeJobs || 0}`}
            />
          </div>
        </motion.div>

        {/* Recent Applications Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900" tabIndex={0}>
              {t.recentApplications}
            </h2>
            <button
              onClick={() => window.location.href = '/applications'}
              className="px-4 py-2 text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg transition-colors flex items-center space-x-2"
              aria-label={t.viewApplicants}
            >
              <Eye className="w-5 h-5" />
              <span>{t.viewApplicants}</span>
            </button>
          </div>

          {data.recentApplications && data.recentApplications.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full" role="table" aria-label={t.recentApplications}>
                <thead>
                  <tr className="border-b-2 border-gray-200">
                    <th className="text-left py-3 px-4 font-semibold text-gray-900" scope="col">
                      {t.candidate}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900" scope="col">
                      {t.jobTitle}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900" scope="col">
                      {t.appliedDate}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900" scope="col">
                      {t.status}
                    </th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900" scope="col">
                      {t.viewApplicants}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {data.recentApplications.map((application: Application, index: number) => (
                    <motion.tr
                      key={application.id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className="border-b border-gray-100 hover:bg-gray-50 transition-colors"
                    >
                      <td className="py-4 px-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <Users className="w-5 h-5 text-blue-600" />
                          </div>
                          <span className="font-medium text-gray-900">
                            {application.candidateName || 'N/A'}
                          </span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-gray-700">
                        {application.jobTitle}
                      </td>
                      <td className="py-4 px-4 text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" aria-hidden="true" />
                          {new Date(application.appliedDate).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}
                          aria-label={`Status: ${application.status}`}
                        >
                          {application.status === 'shortlisted' 
                            ? t.shortlisted 
                            : application.status === 'rejected' 
                            ? t.rejected 
                            : t.pending}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <button
                          onClick={() => window.location.href = `/applications/${application.id}`}
                          className="text-blue-600 hover:text-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 rounded-lg px-3 py-1 transition-colors"
                          aria-label={`View application from ${application.candidateName}`}
                        >
                          <Eye className="w-5 h-5" />
                        </button>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <Users className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>{t.noApplications}</p>
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
};

export default EmployerDashboard;

