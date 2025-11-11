import { api } from './api';

export const skillsAPI = {
  jobsAutocomplete: async (contains: string) => {
    const res = await api.get(`/jobs/autocomplete`, { params: { contains } });
    return res.data.data as Array<{ uuid: string; title: string }>;
  },
  skillsAutocomplete: async (contains: string) => {
    const res = await api.get(`/skills/autocomplete`, { params: { contains } });
    return res.data.data as Array<{ uuid: string; name?: string; title?: string }>;
  }
};


