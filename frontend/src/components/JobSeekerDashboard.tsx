import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  Calendar, 
  MapPin, 
  DollarSign,
  Mic,
  Search
} from 'lucide-react';
import StatCard from './ui/StatCard';
import { DashboardData, RecommendedJob } from '../services/dashboardAPI';
import { useAccessibility } from '../contexts/AccessibilityContext';

interface JobSeekerDashboardProps {
  data: DashboardData;
}

/**
 * Job Seeker Dashboard Component
 * Displays personalized dashboard for job seekers with:
 * - Profile completion
 * - Job statistics
 * - Recommended jobs
 * - Voice-assisted search
 * - Accessibility features
 */
const JobSeekerDashboard: React.FC<JobSeekerDashboardProps> = ({ data }) => {
  const { state: accessibilityState, toggleLanguage } = useAccessibility();
  const [voiceSearchActive, setVoiceSearchActive] = useState(false);

  // Translations (simple implementation - can be extended with i18n library)
  const translations: Record<string, Record<string, string>> = {
    en: {
      greeting: `Welcome back, ${data.user.name}!`,
      profileCompletion: 'Profile Completion',
      completeProfile: 'Complete Profile',
      jobStats: 'Your Job Statistics',
      recommendedJobs: 'Recommended Jobs',
      voiceSearch: 'Voice-Assisted Job Search',
      startVoiceSearch: 'Start Voice Search',
      stopVoiceSearch: 'Listening...',
      location: 'Location',
      salary: 'Salary',
      matchScore: 'Match Score',
      applyNow: 'Apply Now',
      viewDetails: 'View Details',
      jobsApplied: 'Jobs Applied',
      shortlisted: 'Shortlisted',
      rejected: 'Rejected',
      interviews: 'Interviews'
    },
    hi: {
      greeting: `वापसी पर स्वागत है, ${data.user.name}!`,
      profileCompletion: 'प्रोफ़ाइल पूर्णता',
      completeProfile: 'प्रोफ़ाइल पूर्ण करें',
      jobStats: 'आपके नौकरी आंकड़े',
      recommendedJobs: 'अनुशंसित नौकरियां',
      voiceSearch: 'आवाज-सहायक नौकरी खोज',
      startVoiceSearch: 'आवाज खोज शुरू करें',
      stopVoiceSearch: 'सुन रहे हैं...',
      location: 'स्थान',
      salary: 'वेतन',
      matchScore: 'मैच स्कोर',
      applyNow: 'अभी आवेदन करें',
      viewDetails: 'विवरण देखें',
      jobsApplied: 'आवेदन की गई नौकरियां',
      shortlisted: 'शॉर्टलिस्ट',
      rejected: 'अस्वीकृत',
      interviews: 'साक्षात्कार'
    }
  };

  // Get current language with fallback to 'en'
  const currentLanguage = accessibilityState?.language || 'en';
  const t = translations[currentLanguage] || translations.en;

  // Handle voice search (placeholder - integrate with actual voice recognition)
  const handleVoiceSearch = () => {
    setVoiceSearchActive(!voiceSearchActive);
    // TODO: Integrate with useVoiceCommands hook
    if (!voiceSearchActive) {
      console.log('Voice search started');
    } else {
      console.log('Voice search stopped');
    }
  };

  // Calculate profile completion percentage
  const profileCompletion = data.profileCompletion || 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 
            className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2"
            id="dashboard-title"
            tabIndex={0}
          >
            {t.greeting}
          </h1>
          <p className="text-gray-600" aria-describedby="dashboard-title">
            {data.user.location || 'Location not set'}
          </p>
        </motion.div>

        {/* Profile Completion Card */}
        {profileCompletion < 100 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8 bg-white rounded-lg shadow-md p-6 border-2 border-blue-200"
            role="alert"
            aria-live="polite"
          >
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex-1">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">
                  {t.profileCompletion}: {profileCompletion}%
                </h2>
                <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                  <div
                    className="bg-blue-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${profileCompletion}%` }}
                    role="progressbar"
                    aria-valuenow={profileCompletion}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Profile completion: ${profileCompletion} percent`}
                  />
                </div>
              </div>
              <button
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                onClick={() => window.location.href = '/profile'}
                aria-label={t.completeProfile}
              >
                {t.completeProfile}
              </button>
            </div>
          </motion.div>
        )}

        {/* Job Statistics Cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4" tabIndex={0}>
            {t.jobStats}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              title={t.jobsApplied}
              value={data.stats.jobsApplied || 0}
              icon={<Briefcase className="w-8 h-8" />}
              color="blue"
              ariaLabel={`${t.jobsApplied}: ${data.stats.jobsApplied || 0}`}
            />
            <StatCard
              title={t.shortlisted}
              value={data.stats.shortlisted || 0}
              icon={<CheckCircle className="w-8 h-8" />}
              color="green"
              ariaLabel={`${t.shortlisted}: ${data.stats.shortlisted || 0}`}
            />
            <StatCard
              title={t.rejected}
              value={data.stats.rejected || 0}
              icon={<XCircle className="w-8 h-8" />}
              color="red"
              ariaLabel={`${t.rejected}: ${data.stats.rejected || 0}`}
            />
            <StatCard
              title={t.interviews}
              value={data.stats.interviews || 0}
              icon={<Calendar className="w-8 h-8" />}
              color="purple"
              ariaLabel={`${t.interviews}: ${data.stats.interviews || 0}`}
            />
          </div>
        </motion.div>

        {/* Voice-Assisted Search Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-8"
        >
          <button
            onClick={handleVoiceSearch}
            className={`w-full sm:w-auto px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center justify-center space-x-2 focus:outline-none focus:ring-4 ${
              voiceSearchActive
                ? 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-300'
                : 'bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700 focus:ring-blue-300'
            }`}
            aria-label={voiceSearchActive ? t.stopVoiceSearch : t.startVoiceSearch}
            aria-pressed={voiceSearchActive}
          >
            <Mic className={`w-5 h-5 ${voiceSearchActive ? 'animate-pulse' : ''}`} />
            <span>{voiceSearchActive ? t.stopVoiceSearch : t.startVoiceSearch}</span>
          </button>
        </motion.div>

        {/* Recommended Jobs Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-4" tabIndex={0}>
            {t.recommendedJobs}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {data.recommendedJobs && data.recommendedJobs.length > 0 ? (
              data.recommendedJobs.map((job: RecommendedJob, index: number) => (
                <motion.div
                  key={job.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 + index * 0.1 }}
                  className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-2 border-transparent hover:border-blue-300"
                  role="article"
                  aria-label={`Job: ${job.title} at ${job.company}`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 mb-1">
                        {job.title}
                      </h3>
                      <p className="text-gray-600 font-medium">{job.company}</p>
                    </div>
                    <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-semibold">
                      {job.matchScore}%
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span>{job.location}</span>
                    </div>
                    <div className="flex items-center text-gray-600">
                      <DollarSign className="w-4 h-4 mr-2" aria-hidden="true" />
                      <span>{job.salary}</span>
                    </div>
                    <div className="text-sm text-gray-500">
                      {job.type} • Posted {new Date(job.postedDate).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-4 focus:ring-blue-300 transition-colors"
                      onClick={() => window.location.href = `/job-recommendations?jobId=${job.id}`}
                      aria-label={`${t.applyNow} for ${job.title}`}
                    >
                      {t.applyNow}
                    </button>
                    <button
                      className="px-4 py-2 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-4 focus:ring-gray-300 transition-colors"
                      onClick={() => window.location.href = `/job-recommendations?jobId=${job.id}`}
                      aria-label={`${t.viewDetails} for ${job.title}`}
                    >
                      <Search className="w-5 h-5" />
                    </button>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="col-span-full text-center py-12 text-gray-500">
                <p>{accessibilityState.language === 'hi' ? 'कोई अनुशंसित नौकरी नहीं मिली' : 'No recommended jobs found'}</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default JobSeekerDashboard;

