import { api } from './api';

export interface DashboardStats {
  jobsApplied?: number;
  shortlisted?: number;
  rejected?: number;
  interviews?: number;
  jobsPosted?: number;
  applicationsReceived?: number;
  shortlistedCandidates?: number;
  activeJobs?: number;
}

export interface RecommendedJob {
  id: string;
  title: string;
  company: string;
  location: string;
  type: string;
  salary: string;
  matchScore: number;
  postedDate: string;
}

export interface Application {
  id: string;
  candidateName?: string;
  jobTitle: string;
  appliedDate: string;
  status: string;
}

export interface DashboardData {
  role: 'job_seeker' | 'employer';
  user: {
    name: string;
    email: string;
    avatar?: string;
    location?: string;
  };
  profileCompletion?: number;
  stats: DashboardStats;
  recommendedJobs?: RecommendedJob[];
  recentApplications?: Application[];
}

export const dashboardAPI = {
  // Get dashboard data based on user role
  getDashboard: async (): Promise<DashboardData> => {
    const response = await api.get('/dashboard');
    return response.data.data;
  }
};

