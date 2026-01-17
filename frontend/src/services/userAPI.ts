import api from './api';

export interface ExperienceItem {
  title: string;
  company: string;
  location?: string;
  startDate?: string;
  endDate?: string;
  currentlyWorking?: boolean;
  summary?: string;
  achievements?: string[];
  technologies?: string[];
}

export interface EducationItem {
  institution: string;
  degree: string;
  fieldOfStudy?: string;
  startDate?: string;
  endDate?: string;
  description?: string;
}

export interface ProjectItem {
  name: string;
  role?: string;
  description?: string;
  impact?: string;
  technologies?: string[];
}

export interface JobPreference {
  desiredRoles?: string[];
  preferredLocations?: string[];
  workModes?: ('onsite' | 'remote' | 'hybrid')[];
  salaryRange?: {
    currency?: string;
    min?: number;
    max?: number;
  };
  experienceLevel?: 'entry' | 'mid' | 'senior' | 'lead';
  availability?: 'immediate' | '<30 days' | '1-3 months' | 'negotiable';
}

export interface UserProfile {
  name: string;
  headline?: string;
  summary?: string;
  location?: string;
  email: string;
  phone?: string;
  disabilityType?: string;
  avatar?: string;
  skills: string[];
  socialLinks?: {
    website?: string;
    linkedin?: string;
    github?: string;
    portfolio?: string;
  };
  experience: ExperienceItem[];
  education: EducationItem[];
  projects: ProjectItem[];
  certifications: {
    name?: string;
    organization?: string;
    year?: string;
    credentialId?: string;
  }[];
  languages: {
    name?: string;
    proficiency?: string;
  }[];
  achievements: string[];
  preferences?: {
    workFromHome?: boolean;
    flexibleHours?: boolean;
    accessibilityRequirements?: string[];
    preferredIndustries?: string[];
    salaryRange?: {
      min?: number;
      max?: number;
    };
  };
  jobPreferences?: JobPreference;
  profileCompletion?: number;
  profileCompleted?: boolean;
}

export const getUserProfile = async (): Promise<UserProfile> => {
  const { data } = await api.get('/users/profile');
  return data.data;
};

export const updateUserProfile = async (payload: Partial<UserProfile>) => {
  const { data } = await api.put('/users/profile', payload);
  return data.data;
};

export const getJobRecommendations = async () => {
  const { data } = await api.get('/users/profile/recommendations');
  return data.data;
};

