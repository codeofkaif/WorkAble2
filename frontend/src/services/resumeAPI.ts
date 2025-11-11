import { api } from './api';

export interface ResumeData {
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    address?: string;
    linkedin?: string;
    website?: string;
    summary: string;
  };
  experience: Array<{
    company: string;
    position: string;
    startDate: string;
    endDate?: string;
    current?: boolean;
    description: string;
    achievements?: string[];
    skills?: string[];
  }>;
  education: Array<{
    institution: string;
    degree: string;
    field?: string;
    startDate: string;
    endDate?: string;
    gpa?: string;
    honors?: string[];
  }>;
  skills: {
    technical: string[];
    soft: string[];
    languages?: string[];
  };
  projects?: Array<{
    name: string;
    description: string;
    technologies: string[];
    link?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: Array<{
    name: string;
    issuer: string;
    date?: string;
    expiryDate?: string;
    link?: string;
  }>;
  accessibility?: {
    disabilityType: string;
    accommodations: string[];
    accessibilityPreferences?: string[];
  };
  template: 'modern' | 'classic' | 'creative' | 'minimal';
  aiGenerated?: boolean;
  aiPrompt?: string;
}

export interface AIResumeRequest {
  prompt: string;
  template: string;
}

export const resumeAPI = {
  // Create new resume
  create: async (resumeData: ResumeData): Promise<ResumeData> => {
    const response = await api.post('/resume', resumeData);
    return response.data.data;
  },

  // Get all resumes for current user
  getAll: async (): Promise<ResumeData[]> => {
    const response = await api.get('/resume');
    return response.data.data;
  },

  // Get specific resume by ID
  getById: async (id: string): Promise<ResumeData> => {
    const response = await api.get(`/resume/${id}`);
    return response.data.data;
  },

  // Update resume
  update: async (id: string, resumeData: Partial<ResumeData>): Promise<ResumeData> => {
    const response = await api.put(`/resume/${id}`, resumeData);
    return response.data.data;
  },

  // Delete resume (soft delete)
  delete: async (id: string): Promise<void> => {
    await api.delete(`/resume/${id}`);
  },

  // Generate AI resume
  generateAI: async (request: AIResumeRequest): Promise<ResumeData> => {
    const response = await api.post('/resume/generate', request);
    return response.data.data;
  },

  // Download PDF
  downloadPDF: async (id: string): Promise<Blob> => {
    const response = await api.get(`/resume/${id}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  },

  // Voice-to-text processing
  processVoice: async (audioFile: File): Promise<any> => {
    const formData = new FormData();
    formData.append('audio', audioFile);
    
    const response = await api.post('/resume/voice', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return response.data;
  },

  // Upload and extract text from resume file
  uploadResume: async (file: File): Promise<ResumeData> => {
    const formData = new FormData();
    formData.append('resume', file);
    
    try {
      const response = await api.post('/resume/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        timeout: 60000 // 60 seconds timeout for file processing
      });
      
      if (response.data.status === 'success' && response.data.data) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || 'Failed to extract resume data');
      }
    } catch (error: any) {
      // Re-throw with better error message
      if (error.response) {
        throw new Error(error.response.data?.message || error.response.data?.error || 'Failed to upload resume');
      } else if (error.request) {
        throw new Error('Network error: Could not connect to server. Please check if the backend is running.');
      } else {
        throw error;
      }
    }
  }
};
