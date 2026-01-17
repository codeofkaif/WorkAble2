import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Briefcase, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { getJobRecommendations, getUserProfile, UserProfile } from '../services/userAPI';

interface JobRecommendation {
  id: string;
  title: string;
  company: string;
  location: string;
  workMode: string;
  type: string;
  salaryRange: string;
  experienceLevel: string;
  skillsRequired: string[];
  summary: string;
  matchScore: number;
}

const JobRecommendationEngine: React.FC = () => {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [recommendedJobs, setRecommendedJobs] = useState<JobRecommendation[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    setError(null);
    try {
      const [profile, jobs] = await Promise.all([getUserProfile(), getJobRecommendations()]);
      setUserProfile(profile);
      setRecommendedJobs(jobs);
    } catch (err: any) {
      setError(err?.message || 'Could not load recommendations. Save your profile and retry.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const generateRecommendations = async () => {
    setIsGenerating(true);
    try {
      const jobs = await getJobRecommendations();
      setRecommendedJobs(jobs);
    } catch (err: any) {
      setError(err?.message || 'Unable to refresh recommendations right now.');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Job Recommendation Engine
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Discover jobs that match your skills and accessibility needs
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Profile */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
              <Card>
              <CardHeader>
                <CardTitle className="text-xl text-gray-900">Your Profile</CardTitle>
              </CardHeader>
              <CardContent>
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 text-navy-600 animate-spin" />
                    </div>
                  ) : userProfile ? (
                    <div className="space-y-3">
                      <div>
                        <p className="font-semibold text-gray-900">{userProfile.name}</p>
                        <p className="text-sm text-gray-500">{userProfile.headline}</p>
                      </div>
                      <div>
                        <p className="text-xs uppercase tracking-widest text-gray-400">Key Skills</p>
                        <div className="mt-1 flex flex-wrap gap-2">
                          {userProfile.skills.slice(0, 6).map((skill) => (
                            <span
                              key={skill}
                              className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                            >
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                      <Button
                        onClick={generateRecommendations}
                        disabled={isGenerating}
                        className="w-full bg-gradient-to-r from-navy-600 to-magenta-600 hover:from-navy-700 hover:to-magenta-700 text-white"
                      >
                        {isGenerating ? 'Generating...' : 'Refresh Recommendations'}
                      </Button>
                    </div>
                  ) : (
                    <div className="text-sm text-gray-500">
                      Complete your profile to unlock personalized job recommendations.
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Recommendations */}
          <motion.div 
            className="lg:col-span-2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
              <Card>
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900">Recommended Jobs</CardTitle>
              </CardHeader>
              <CardContent>
                  {error && (
                    <div className="mb-4 rounded-lg border border-red-100 bg-red-50 px-4 py-2 text-sm text-red-600">
                      {error}
                    </div>
                  )}
                  {loading ? (
                    <div className="flex justify-center py-10">
                      <Loader2 className="w-6 h-6 text-navy-600 animate-spin" />
                    </div>
                  ) : recommendedJobs.length === 0 ? (
                    <div className="text-center py-12">
                      <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <p className="text-gray-500">Save your profile to see tailored jobs.</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {recommendedJobs.map((job) => (
                        <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div>
                              <h3 className="text-lg font-semibold">{job.title}</h3>
                              <p className="text-gray-600">{job.company}</p>
                              <p className="text-sm text-gray-500">
                                {job.location} • {job.workMode.toUpperCase()}
                              </p>
                            </div>
                            <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-semibold">
                              {job.matchScore}% Match
                            </span>
                          </div>
                          <p className="text-sm text-gray-500 mt-2">{job.summary}</p>
                          <div className="mt-3 flex flex-wrap gap-2">
                            {job.skillsRequired.slice(0, 4).map((skill) => (
                              <span
                                key={skill}
                                className="px-2 py-1 rounded-full bg-gray-100 text-xs text-gray-600"
                              >
                                {skill}
                              </span>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default JobRecommendationEngine;
