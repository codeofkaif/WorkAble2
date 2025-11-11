import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { 
  Target, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  ExternalLink,
  Search,
  Star,
  Clock
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';

interface Skill {
  name: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: 'technical' | 'soft' | 'domain' | 'tool';
}

interface JobRequirement {
  title: string;
  company: string;
  requiredSkills: string[];
  preferredSkills: string[];
  disabilityFriendly: boolean;
  accessibilityFeatures: string[];
  salary: string;
  location: string;
  type: 'full-time' | 'part-time' | 'contract' | 'remote';
}

interface Course {
  id: string;
  title: string;
  provider: string;
  duration: string;
  level: 'beginner' | 'intermediate' | 'advanced';
  rating: number;
  price: string;
  url: string;
  skills: string[];
  accessibility: string[];
}

interface SkillGapResult {
  missingSkills: string[];
  skillGapScore: number;
  recommendedCourses: Course[];
  jobMatchScore: number;
}

const SkillGapAnalyzer: React.FC = () => {
  const [userSkills, setUserSkills] = useState<Skill[]>([]);
  const [selectedJob, setSelectedJob] = useState<JobRequirement | null>(null);
  const [skillGapResult, setSkillGapResult] = useState<SkillGapResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Static data for demonstration
  const sampleSkills: Skill[] = useMemo(() => [
    { name: 'React', level: 'intermediate', category: 'technical' },
    { name: 'JavaScript', level: 'advanced', category: 'technical' },
    { name: 'Python', level: 'beginner', category: 'technical' },
    { name: 'Project Management', level: 'intermediate', category: 'soft' },
    { name: 'Communication', level: 'advanced', category: 'soft' },
    { name: 'Agile', level: 'beginner', category: 'domain' },
    { name: 'Git', level: 'intermediate', category: 'tool' }
  ], []);

  const sampleJobs: JobRequirement[] = [
    {
      title: 'Frontend Developer',
      company: 'TechCorp Inc.',
      requiredSkills: ['React', 'JavaScript', 'HTML', 'CSS', 'Git'],
      preferredSkills: ['TypeScript', 'Node.js', 'UI/UX Design'],
      disabilityFriendly: true,
      accessibilityFeatures: ['Screen reader support', 'Keyboard navigation', 'High contrast mode', 'Flexible hours'],
      salary: '$80,000 - $120,000',
      location: 'Remote',
      type: 'full-time'
    },
    {
      title: 'Software Engineer',
      company: 'InnovateTech',
      requiredSkills: ['Python', 'JavaScript', 'SQL', 'Git'],
      preferredSkills: ['React', 'Node.js', 'AWS', 'Machine Learning'],
      disabilityFriendly: true,
      accessibilityFeatures: ['Assistive technology support', 'Remote work options', 'Flexible scheduling'],
      salary: '$90,000 - $130,000',
      location: 'San Francisco, CA',
      type: 'full-time'
    },
    {
      title: 'Project Manager',
      company: 'Global Solutions',
      requiredSkills: ['Project Management', 'Communication', 'Agile', 'Leadership'],
      preferredSkills: ['Technical background', 'PMP certification', 'Risk management'],
      disabilityFriendly: true,
      accessibilityFeatures: ['Voice recognition software', 'Screen magnification', 'Speech-to-text tools'],
      salary: '$70,000 - $100,000',
      location: 'New York, NY',
      type: 'full-time'
    }
  ];

  const sampleCourses: Course[] = [
    {
      id: '1',
      title: 'Complete React Developer Course',
      provider: 'Udemy',
      duration: '40 hours',
      level: 'beginner',
      rating: 4.6,
      price: '$29.99',
      url: 'https://udemy.com/react-course',
      skills: ['React', 'JavaScript', 'HTML', 'CSS'],
      accessibility: ['Closed captions', 'Audio descriptions', 'Keyboard navigation']
    },
    {
      id: '2',
      title: 'Python for Beginners',
      provider: 'Coursera',
      duration: '25 hours',
      level: 'beginner',
      rating: 4.8,
      price: 'Free',
      url: 'https://coursera.org/python-beginners',
      skills: ['Python', 'Programming fundamentals'],
      accessibility: ['Screen reader compatible', 'High contrast mode', 'Adjustable playback speed']
    },
    {
      id: '3',
      title: 'Advanced Project Management',
      provider: 'edX',
      duration: '60 hours',
      level: 'advanced',
      rating: 4.7,
      price: '$199',
      url: 'https://edx.org/project-management',
      skills: ['Project Management', 'Leadership', 'Risk Management'],
      accessibility: ['Transcripts available', 'Mobile friendly', 'Offline access']
    },
    {
      id: '4',
      title: 'TypeScript Masterclass',
      provider: 'Pluralsight',
      duration: '15 hours',
      level: 'intermediate',
      rating: 4.5,
      price: '$39.99',
      url: 'https://pluralsight.com/typescript',
      skills: ['TypeScript', 'JavaScript', 'Web Development'],
      accessibility: ['Audio descriptions', 'Closed captions', 'Interactive exercises']
    }
  ];

  useEffect(() => {
    setUserSkills(sampleSkills);
  }, [sampleSkills]);

  const analyzeSkillGap = async () => {
    if (!selectedJob) {
      alert('Please select a job first');
      return;
    }

    setIsAnalyzing(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const userSkillNames = userSkills.map(skill => skill.name.toLowerCase());
    const requiredSkills = selectedJob.requiredSkills.map(skill => skill.toLowerCase());
    const preferredSkills = selectedJob.preferredSkills.map(skill => skill.toLowerCase());

    // Find missing skills
    const missingSkills = [...requiredSkills, ...preferredSkills].filter(
      skill => !userSkillNames.includes(skill)
    );

    // Calculate skill gap score (0-100)
    const totalRequiredSkills = requiredSkills.length;
    const matchedRequiredSkills = requiredSkills.filter(skill => 
      userSkillNames.includes(skill)
    ).length;
    const skillGapScore = Math.round((matchedRequiredSkills / totalRequiredSkills) * 100);

    // Calculate job match score
    const totalSkills = requiredSkills.length + preferredSkills.length;
    const matchedSkills = [...requiredSkills, ...preferredSkills].filter(skill => 
      userSkillNames.includes(skill)
    ).length;
    const jobMatchScore = Math.round((matchedSkills / totalSkills) * 100);

    // Find relevant courses for missing skills
    const recommendedCourses = sampleCourses.filter(course =>
      course.skills.some(skill => 
        missingSkills.includes(skill.toLowerCase())
      )
    ).slice(0, 3);

    const result: SkillGapResult = {
      missingSkills: Array.from(new Set(missingSkills)),
      skillGapScore,
      recommendedCourses,
      jobMatchScore
    };

    setSkillGapResult(result);
    setIsAnalyzing(false);
  };

  const addSkill = () => {
    const newSkill: Skill = {
      name: '',
      level: 'beginner',
      category: 'technical'
    };
    setUserSkills([...userSkills, newSkill]);
  };

  const updateSkill = (index: number, field: keyof Skill, value: string) => {
    const updatedSkills = [...userSkills];
    updatedSkills[index] = { ...updatedSkills[index], [field]: value };
    setUserSkills(updatedSkills);
  };

  const removeSkill = (index: number) => {
    setUserSkills(userSkills.filter((_, i) => i !== index));
  };

  const filteredJobs = sampleJobs.filter(job =>
    job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    job.company.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getSkillLevelColor = (level: string) => {
    switch (level) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-blue-100 text-blue-800';
      case 'advanced': return 'bg-purple-100 text-purple-800';
      case 'expert': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getMatchScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <motion.div 
          className="text-center mb-12"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            Skill Gap Analyzer
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Compare your skills with job requirements and discover what you need to learn next
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* User Skills Section */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-navy-600" />
                  Your Skills
                </CardTitle>
                <CardDescription>
                  Add and manage your current skills
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userSkills.map((skill, index) => (
                  <div key={index} className="p-3 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-2 mb-2">
                      <Input
                        value={skill.name}
                        onChange={(e) => updateSkill(index, 'name', e.target.value)}
                        placeholder="Skill name"
                        className="flex-1"
                      />
                      <select
                        value={skill.level}
                        onChange={(e) => updateSkill(index, 'level', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500"
                      >
                        <option value="beginner">Beginner</option>
                        <option value="intermediate">Intermediate</option>
                        <option value="advanced">Advanced</option>
                        <option value="expert">Expert</option>
                      </select>
                      <button
                        onClick={() => removeSkill(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-md"
                        aria-label="Remove skill"
                      >
                        <XCircle className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="flex items-center space-x-2">
                      <select
                        value={skill.category}
                        onChange={(e) => updateSkill(index, 'category', e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-navy-500 text-sm"
                      >
                        <option value="technical">Technical</option>
                        <option value="soft">Soft Skills</option>
                        <option value="domain">Domain</option>
                        <option value="tool">Tools</option>
                      </select>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getSkillLevelColor(skill.level)}`}>
                        {skill.level}
                      </span>
                    </div>
                  </div>
                ))}
                
                <Button
                  onClick={addSkill}
                  variant="outline"
                  className="w-full"
                >
                  + Add New Skill
                </Button>
              </CardContent>
            </Card>
          </motion.div>

          {/* Job Selection Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <Search className="w-6 h-6 mr-2 text-magenta-600" />
                  Select Job
                </CardTitle>
                <CardDescription>
                  Choose a job to analyze skill gaps
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Input
                    placeholder="Search jobs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                </div>

                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {filteredJobs.map((job, index) => (
                    <div
                      key={index}
                      className={`p-4 border rounded-lg cursor-pointer transition-all duration-200 ${
                        selectedJob === job
                          ? 'border-navy-500 bg-navy-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedJob(job)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">{job.title}</h3>
                          <p className="text-sm text-gray-600">{job.company}</p>
                          <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                            <span className="flex items-center">
                              <Clock className="w-3 h-3 mr-1" />
                              {job.type}
                            </span>
                            <span>{job.location}</span>
                            <span className="font-medium text-green-600">{job.salary}</span>
                          </div>
                        </div>
                        {job.disabilityFriendly && (
                          <div className="flex items-center text-green-600">
                            <CheckCircle className="w-4 h-4 mr-1" />
                            <span className="text-xs">Accessible</span>
                          </div>
                        )}
                      </div>
                      
                      {selectedJob === job && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          className="mt-3 pt-3 border-t border-gray-200"
                        >
                          <div className="space-y-2">
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Required Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {job.requiredSkills.map((skill, skillIndex) => (
                                  <span key={skillIndex} className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Preferred Skills:</p>
                              <div className="flex flex-wrap gap-1">
                                {job.preferredSkills.map((skill, skillIndex) => (
                                  <span key={skillIndex} className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs">
                                    {skill}
                                  </span>
                                ))}
                              </div>
                            </div>
                            <div>
                              <p className="text-xs font-medium text-gray-700 mb-1">Accessibility Features:</p>
                              <div className="flex flex-wrap gap-1">
                                {job.accessibilityFeatures.map((feature, featureIndex) => (
                                  <span key={featureIndex} className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                                    {feature}
                                  </span>
                                ))}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </div>
                  ))}
                </div>

                {selectedJob && (
                  <Button
                    onClick={analyzeSkillGap}
                    disabled={isAnalyzing}
                    className="w-full bg-gradient-to-r from-navy-600 to-magenta-600 hover:from-navy-700 hover:to-magenta-700 text-white"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="w-4 h-4 mr-2" />
                        Analyze Skill Gap
                      </>
                    )}
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>

          {/* Results Section */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
            <Card className="h-fit">
              <CardHeader>
                <CardTitle className="text-2xl text-gray-900 flex items-center">
                  <TrendingUp className="w-6 h-6 mr-2 text-green-600" />
                  Analysis Results
                </CardTitle>
                <CardDescription>
                  Your skill gap analysis and recommendations
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!skillGapResult ? (
                  <div className="text-center py-12">
                    <Target className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <p className="text-gray-500">
                      Select a job and click "Analyze Skill Gap" to see results
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Skill Gap Score */}
                    <div className="text-center p-4 bg-gradient-to-r from-navy-50 to-magenta-50 rounded-lg">
                      <div className="text-3xl font-bold text-navy-600 mb-2">
                        {skillGapResult.skillGapScore}%
                      </div>
                      <p className="text-sm text-gray-600">Required Skills Match</p>
                    </div>

                    {/* Job Match Score */}
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className={`text-2xl font-bold mb-2 ${getMatchScoreColor(skillGapResult.jobMatchScore)}`}>
                        {skillGapResult.jobMatchScore}%
                      </div>
                      <p className="text-sm text-gray-600">Overall Job Match</p>
                    </div>

                    {/* Missing Skills */}
                    {skillGapResult.missingSkills.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Missing Skills:</h4>
                        <div className="flex flex-wrap gap-2">
                          {skillGapResult.missingSkills.map((skill, index) => (
                            <span key={index} className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm">
                              {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Recommended Courses */}
                    {skillGapResult.recommendedCourses.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-gray-900 mb-3">Recommended Courses:</h4>
                        <div className="space-y-3">
                          {skillGapResult.recommendedCourses.map((course) => (
                            <div key={course.id} className="p-3 border border-gray-200 rounded-lg">
                              <div className="flex items-start justify-between mb-2">
                                <h5 className="font-medium text-gray-900">{course.title}</h5>
                                <span className="text-sm font-medium text-green-600">{course.price}</span>
                              </div>
                              <p className="text-sm text-gray-600 mb-2">{course.provider}</p>
                              <div className="flex items-center space-x-4 text-xs text-gray-500 mb-2">
                                <span className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {course.duration}
                                </span>
                                <span className="flex items-center">
                                  <Star className="w-3 h-3 mr-1" />
                                  {course.rating}
                                </span>
                                <span className={`px-2 py-1 rounded-full text-xs ${getSkillLevelColor(course.level)}`}>
                                  {course.level}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => window.open(course.url, '_blank')}
                                  className="flex-1"
                                >
                                  <ExternalLink className="w-3 h-3 mr-1" />
                                  View Course
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
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

export default SkillGapAnalyzer;
