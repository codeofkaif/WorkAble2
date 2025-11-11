import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Briefcase
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';

interface UserProfile {
  skills: string[];
  disabilityType: string[];
  experience: 'entry' | 'mid' | 'senior';
  preferredLocation: string[];
  salaryRange: string;
  workType: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
}

interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote' | 'hybrid';
  salary: string;
  experience: 'entry' | 'mid' | 'senior';
  requiredSkills: string[];
  preferredSkills: string[];
  disabilityFriendly: boolean;
  accessibilityFeatures: string[];
  description: string;
  postedDate: string;
  applicationDeadline: string;
  companySize: 'startup' | 'small' | 'medium' | 'large';
  industry: string;
  benefits: string[];
  matchScore: number;
}

const JobRecommendationEngine: React.FC = () => {
  // User profile data (currently static, would be dynamic in production)
  const userProfile: UserProfile = {
    skills: ['React', 'JavaScript', 'Python', 'Communication'],
    disabilityType: ['visual', 'mobility'],
    experience: 'mid',
    preferredLocation: ['Remote', 'New York', 'San Francisco'],
    salaryRange: '$60,000 - $100,000',
    workType: 'full-time'
  };

  // Use userProfile in job matching logic
  const calculateJobMatch = (job: Job): number => {
    const userSkillSet = new Set(userProfile.skills.map(skill => skill.toLowerCase()));
    const jobSkills = [...job.requiredSkills, ...job.preferredSkills];
    const matchedSkills = jobSkills.filter(skill => 
      userSkillSet.has(skill.toLowerCase())
    ).length;
    return Math.round((matchedSkills / jobSkills.length) * 100);
  };

  const [recommendedJobs, setRecommendedJobs] = useState<Job[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  // Sample job data
  const sampleJobs: Job[] = [
    {
      id: '1',
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      location: 'Remote',
      type: 'full-time',
      salary: '$80,000 - $120,000',
      experience: 'mid',
      requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS'],
      preferredSkills: ['TypeScript', 'Node.js', 'UI/UX Design'],
      disabilityFriendly: true,
      accessibilityFeatures: ['Screen reader support', 'Keyboard navigation', 'High contrast mode'],
      description: 'Join our team to build accessible web applications that make a difference.',
      postedDate: '2024-08-20',
      applicationDeadline: '2024-09-20',
      companySize: 'medium',
      industry: 'Technology',
      benefits: ['Health insurance', 'Remote work', 'Flexible hours', 'Professional development'],
      matchScore: 0
    }
  ];

  const generateRecommendations = async () => {
    setIsGenerating(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const jobsWithScores = sampleJobs.map(job => ({
      ...job,
      matchScore: calculateJobMatch(job) // Use actual skill matching instead of random
    }));
    
    setRecommendedJobs(jobsWithScores);
    setIsGenerating(false);
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
                <Button
                  onClick={generateRecommendations}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-navy-600 to-magenta-600 hover:from-navy-700 hover:to-magenta-700 text-white"
                >
                  {isGenerating ? 'Generating...' : 'Generate Recommendations'}
                </Button>
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
                {recommendedJobs.length === 0 ? (
                  <div className="text-center py-12">
                    <Briefcase className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">Click "Generate Recommendations" to see jobs</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {recommendedJobs.map((job) => (
                      <div key={job.id} className="p-4 border border-gray-200 rounded-lg">
                        <h3 className="text-lg font-semibold">{job.title}</h3>
                        <p className="text-gray-600">{job.company}</p>
                        <p className="text-sm text-gray-500">{job.location} • {job.salary}</p>
                        <div className="mt-2">
                          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {job.matchScore}% Match
                          </span>
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
