import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Loader2,
  Save,
  Edit3,
  CheckCircle2,
  XCircle,
  Briefcase,
  Plus,
  UserCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import {
  getJobRecommendations,
  getUserProfile,
  updateUserProfile,
  UserProfile as UserProfileType
} from '../services/userAPI';

const emptyExperience = {
  title: '',
  company: '',
  location: '',
  startDate: '',
  endDate: '',
  summary: ''
};

const emptyEducation = {
  institution: '',
  degree: '',
  fieldOfStudy: '',
  startDate: '',
  endDate: ''
};

const emptyProject = {
  name: '',
  role: '',
  description: '',
  impact: ''
};

const defaultProfile: UserProfileType = {
  name: '',
  email: '',
  headline: '',
  summary: '',
  location: '',
  phone: '',
  disabilityType: 'none',
  avatar: '',
  skills: [],
  socialLinks: {
    linkedin: '',
    github: '',
    portfolio: '',
    website: ''
  },
  experience: [],
  education: [],
  projects: [],
  certifications: [],
  languages: [],
  achievements: [],
  preferences: {
    workFromHome: false,
    flexibleHours: false,
    accessibilityRequirements: [],
    preferredIndustries: [],
    salaryRange: {
      min: undefined,
      max: undefined
    }
  },
  jobPreferences: {
    desiredRoles: [],
    preferredLocations: [],
    workModes: ['remote'],
    salaryRange: {
      currency: 'USD',
      min: undefined,
      max: undefined
    },
    experienceLevel: 'mid',
    availability: 'immediate'
  },
  profileCompletion: 0,
  profileCompleted: false
};

const sectionClass = 'space-y-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-6';
const sectionTitle = 'text-lg font-semibold text-gray-900';
const fieldLabel = 'text-sm font-medium text-gray-600';
const fieldInput = 'bg-gray-50 focus:bg-white';

const UserProfile: React.FC = () => {
  const [profile, setProfile] = useState<UserProfileType>(defaultProfile);
  const [formState, setFormState] = useState<UserProfileType>(defaultProfile);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recommendations, setRecommendations] = useState<any[]>([]);
  const [recLoading, setRecLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const data = await getUserProfile();
        setProfile(data);
        setFormState({
          ...defaultProfile,
          ...data
        });
      } catch (error) {
        setMessage({ type: 'error', text: 'Failed to load profile. Please try again.' });
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const fetchRecommendations = async () => {
    setRecLoading(true);
    try {
      const data = await getJobRecommendations();
      setRecommendations(data);
    } catch (error) {
      setMessage({ type: 'error', text: 'Unable to generate recommendations right now.' });
    } finally {
      setRecLoading(false);
    }
  };

  useEffect(() => {
    if (!loading) {
      fetchRecommendations();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading]);

  const handleFieldChange = (field: keyof UserProfileType, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleNestedChange = (section: string, key: string, value: any) => {
    setFormState((prev) => ({
      ...prev,
      [section]: {
        ...(prev as any)[section],
        [key]: value
      }
    }));
  };

  const handleArrayChange = (field: keyof UserProfileType, index: number, key: string, value: any) => {
    setFormState((prev) => {
      const list = Array.isArray(prev[field]) ? [...(prev[field] as any[])] : [];
      list[index] = { ...(list[index] || {}), [key]: value };
      return { ...prev, [field]: list };
    });
  };

  const addArrayItem = (field: keyof UserProfileType, template: object) => {
    setFormState((prev) => {
      const list = Array.isArray(prev[field]) ? [...(prev[field] as any[])] : [];
      list.push({ ...template });
      return { ...prev, [field]: list };
    });
  };

  const removeArrayItem = (field: keyof UserProfileType, index: number) => {
    setFormState((prev) => {
      const list = Array.isArray(prev[field]) ? [...(prev[field] as any[])] : [];
      return {
        ...prev,
        [field]: list.filter((_, idx) => idx !== index)
      };
    });
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        ...formState,
        skills: formState.skills.map((skill) => skill.trim()).filter(Boolean),
        preferences: {
          ...formState.preferences,
          accessibilityRequirements:
            formState.preferences?.accessibilityRequirements?.map((req) => req.trim()).filter(Boolean) ||
            [],
          preferredIndustries:
            formState.preferences?.preferredIndustries?.map((req) => req.trim()).filter(Boolean) ||
            []
        },
        jobPreferences: {
          ...formState.jobPreferences,
          desiredRoles: formState.jobPreferences?.desiredRoles?.map((role) => role.trim()).filter(Boolean),
          preferredLocations:
            formState.jobPreferences?.preferredLocations?.map((loc) => loc.trim()).filter(Boolean),
          workModes: formState.jobPreferences?.workModes
        }
      };

      const updated = await updateUserProfile(payload);
      setProfile(updated);
      setFormState(updated);
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
      fetchRecommendations();
    } catch (error: any) {
      setMessage({
        type: 'error',
        text: error?.response?.data?.message || 'Failed to update profile. Please retry.'
      });
    } finally {
      setSaving(false);
    }
  };

  const completion = useMemo(() => profile?.profileCompletion || 0, [profile]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-navy-600 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-b from-gray-50 to-white py-10">
      <div className="max-w-6xl mx-auto px-4 space-y-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-navy-500 mb-2">Profile</p>
            <h1 className="text-3xl font-bold text-gray-900">Accessible Career Blueprint</h1>
            <p className="text-gray-500">
              Update your story once and let WorkAble tailor resumes & job matches for you.
            </p>
          </div>
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={() => setFormState(profile)}
              className="flex items-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Reset
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-gradient-to-r from-navy-600 to-magenta-600"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </Button>
          </div>
        </div>

        {message && (
          <div
            className={`rounded-2xl px-4 py-3 text-sm font-medium ${
              message.type === 'success'
                ? 'bg-green-50 text-green-700 border border-green-100'
                : 'bg-red-50 text-red-600 border border-red-100'
            }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <section className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Personal Profile</h2>
                <span className="inline-flex items-center gap-2 text-sm text-gray-500">
                  <Edit3 className="w-4 h-4" />
                  {completion}% complete
                </span>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Full Name</label>
                  <Input
                    value={formState.name}
                    onChange={(e) => handleFieldChange('name', e.target.value)}
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Professional Headline</label>
                  <Input
                    value={formState.headline || ''}
                    onChange={(e) => handleFieldChange('headline', e.target.value)}
                    placeholder="e.g., Accessibility-focused Frontend Engineer"
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Email</label>
                  <Input
                    type="email"
                    value={formState.email}
                    onChange={(e) => handleFieldChange('email', e.target.value)}
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Phone</label>
                  <Input
                    value={formState.phone || ''}
                    onChange={(e) => handleFieldChange('phone', e.target.value)}
                    placeholder="+91 9876543210"
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Location</label>
                  <Input
                    value={formState.location || ''}
                    onChange={(e) => handleFieldChange('location', e.target.value)}
                    placeholder="City, Country"
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Disability Context</label>
                  <select
                    value={formState.disabilityType || 'none'}
                    onChange={(e) => handleFieldChange('disabilityType', e.target.value)}
                    className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                  >
                    <option value="none">Prefer not to say</option>
                    <option value="physical">Physical</option>
                    <option value="visual">Visual</option>
                    <option value="hearing">Hearing</option>
                    <option value="cognitive">Cognitive</option>
                    <option value="mental">Mental Health</option>
                    <option value="other">Other</option>
                  </select>
                </div>
              </div>
              <div>
                <label className={fieldLabel}>Career Summary</label>
                <Textarea
                  rows={4}
                  value={formState.summary || ''}
                  onChange={(e) => handleFieldChange('summary', e.target.value)}
                  placeholder="Highlight impact, accessibility advocacy, and measurable results."
                  className={fieldInput}
                />
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionTitle}>Skills & Tools</h2>
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className={fieldLabel}>Key Skills (comma separated)</label>
                  <Input
                    value={formState.skills?.join(', ') || ''}
                    onChange={(e) =>
                      handleFieldChange(
                        'skills',
                        e.target.value.split(',').map((skill) => skill.trim())
                      )
                    }
                    placeholder="React, WCAG, ARIA, Leadership"
                    className={fieldInput}
                  />
                </div>
                <div>
                  <label className={fieldLabel}>Preferred Industries</label>
                  <Input
                    value={formState.preferences?.preferredIndustries?.join(', ') || ''}
                    onChange={(e) =>
                      handleNestedChange(
                        'preferences',
                        'preferredIndustries',
                        e.target.value.split(',').map((item) => item.trim())
                      )
                    }
                    placeholder="Fintech, Healthcare, Education"
                    className={fieldInput}
                  />
                </div>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Experience</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('experience', emptyExperience)}
                  className="flex items-center gap-1 text-navy-600"
                >
                  <Plus className="w-4 h-4" /> Add Role
                </Button>
              </div>
              <div className="space-y-4">
                {formState.experience.map((exp, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="flex justify-between text-sm text-gray-500">
                      <span>Role #{idx + 1}</span>
                      <button
                        type="button"
                        className="text-red-500"
                        onClick={() => removeArrayItem('experience', idx)}
                      >
                        Remove
                      </button>
                    </div>
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={exp.title || ''}
                        onChange={(e) => handleArrayChange('experience', idx, 'title', e.target.value)}
                        placeholder="Title"
                        className={fieldInput}
                      />
                      <Input
                        value={exp.company || ''}
                        onChange={(e) => handleArrayChange('experience', idx, 'company', e.target.value)}
                        placeholder="Company"
                        className={fieldInput}
                      />
                      <Input
                        value={exp.startDate || ''}
                        onChange={(e) =>
                          handleArrayChange('experience', idx, 'startDate', e.target.value)
                        }
                        placeholder="Start (e.g., Jan 2022)"
                        className={fieldInput}
                      />
                      <Input
                        value={exp.endDate || ''}
                        onChange={(e) =>
                          handleArrayChange('experience', idx, 'endDate', e.target.value)
                        }
                        placeholder="End or Present"
                        className={fieldInput}
                      />
                    </div>
                    <Textarea
                      rows={3}
                      value={exp.summary || ''}
                      onChange={(e) => handleArrayChange('experience', idx, 'summary', e.target.value)}
                      placeholder="Impact summary"
                      className={fieldInput}
                    />
                  </div>
                ))}
                {formState.experience.length === 0 && (
                  <p className="text-sm text-gray-500">Add your first role to unlock resume-ready data.</p>
                )}
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Education</h2>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => addArrayItem('education', emptyEducation)}
                  className="flex items-center gap-1 text-navy-600"
                >
                  <Plus className="w-4 h-4" /> Add Education
                </Button>
              </div>
              <div className="space-y-4">
                {formState.education.map((edu, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <div className="grid gap-3 md:grid-cols-2">
                      <Input
                        value={edu.institution || ''}
                        onChange={(e) =>
                          handleArrayChange('education', idx, 'institution', e.target.value)
                        }
                        placeholder="Institution"
                        className={fieldInput}
                      />
                      <Input
                        value={edu.degree || ''}
                        onChange={(e) => handleArrayChange('education', idx, 'degree', e.target.value)}
                        placeholder="Degree"
                        className={fieldInput}
                      />
                      <Input
                        value={edu.fieldOfStudy || ''}
                        onChange={(e) =>
                          handleArrayChange('education', idx, 'fieldOfStudy', e.target.value)
                        }
                        placeholder="Field of Study"
                        className={fieldInput}
                      />
                      <div className="grid grid-cols-2 gap-3">
                        <Input
                          value={edu.startDate || ''}
                          onChange={(e) =>
                            handleArrayChange('education', idx, 'startDate', e.target.value)
                          }
                          placeholder="Start"
                          className={fieldInput}
                        />
                        <Input
                          value={edu.endDate || ''}
                          onChange={(e) =>
                            handleArrayChange('education', idx, 'endDate', e.target.value)
                          }
                          placeholder="End"
                          className={fieldInput}
                        />
                      </div>
                    </div>
                    <Textarea
                      rows={2}
                      value={edu.description || ''}
                      onChange={(e) =>
                        handleArrayChange('education', idx, 'description', e.target.value)
                      }
                      placeholder="Highlights, GPA, societies"
                      className={fieldInput}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-red-500"
                        onClick={() => removeArrayItem('education', idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                {formState.education.length === 0 && (
                  <p className="text-sm text-gray-500">Add education history to complete the resume.</p>
                )}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionTitle}>Projects & Highlights</h2>
              <div className="space-y-4">
                {formState.projects.map((proj, idx) => (
                  <div key={idx} className="rounded-xl border border-gray-200 p-4 space-y-3">
                    <Input
                      value={proj.name || ''}
                      onChange={(e) => handleArrayChange('projects', idx, 'name', e.target.value)}
                      placeholder="Project Name"
                      className={fieldInput}
                    />
                    <Textarea
                      rows={2}
                      value={proj.description || ''}
                      onChange={(e) =>
                        handleArrayChange('projects', idx, 'description', e.target.value)
                      }
                      placeholder="What did you build?"
                      className={fieldInput}
                    />
                    <Textarea
                      rows={2}
                      value={proj.impact || ''}
                      onChange={(e) => handleArrayChange('projects', idx, 'impact', e.target.value)}
                      placeholder="Impact or accessibility improvements"
                      className={fieldInput}
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        className="text-sm text-red-500"
                        onClick={() => removeArrayItem('projects', idx)}
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => addArrayItem('projects', emptyProject)}
                  className="flex items-center gap-2 border-dashed w-full justify-center"
                >
                  <Plus className="w-4 h-4" /> Add Project
                </Button>
              </div>
            </section>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl border-0 shadow-md bg-gradient-to-br from-navy-700 to-navy-900 text-white">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-white">
                  <UserCircle className="w-10 h-10" />
                  Profile Health
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-4xl font-bold">{completion}%</div>
                <p className="text-sm text-white/80 mt-2">
                  Complete the highlighted sections to unlock stronger job matches & instant resume
                  builds.
                </p>
                <div className="mt-4 h-3 rounded-full bg-white/20">
                  <div
                    className="h-full rounded-full bg-white"
                    style={{ width: `${completion}%` }}
                  />
                </div>
              </CardContent>
            </Card>

            <section className={sectionClass}>
              <h2 className={sectionTitle}>Accessibility & Work Preferences</h2>
              <div className="space-y-3">
                <label className={fieldLabel}>Accessibility Requirements</label>
                <Input
                  value={formState.preferences?.accessibilityRequirements?.join(', ') || ''}
                  onChange={(e) =>
                    handleNestedChange(
                      'preferences',
                      'accessibilityRequirements',
                      e.target.value.split(',').map((item) => item.trim())
                    )
                  }
                  placeholder="Screen reader, quiet workspace, captions..."
                  className={fieldInput}
                />
                <div className="grid grid-cols-2 gap-3">
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={Boolean(formState.preferences?.workFromHome)}
                      onChange={(e) =>
                        handleNestedChange('preferences', 'workFromHome', e.target.checked)
                      }
                    />
                    Remote friendly
                  </label>
                  <label className="flex items-center gap-2 text-sm text-gray-600">
                    <input
                      type="checkbox"
                      checked={Boolean(formState.preferences?.flexibleHours)}
                      onChange={(e) =>
                        handleNestedChange('preferences', 'flexibleHours', e.target.checked)
                      }
                    />
                    Flexible hours
                  </label>
                </div>
              </div>
              <div className="space-y-3">
                <label className={fieldLabel}>Desired Roles</label>
                <Input
                  value={formState.jobPreferences?.desiredRoles?.join(', ') || ''}
                  onChange={(e) =>
                    handleNestedChange(
                      'jobPreferences',
                      'desiredRoles',
                      e.target.value.split(',').map((item) => item.trim())
                    )
                  }
                  placeholder="Accessibility Engineer, Product Designer..."
                  className={fieldInput}
                />
                <label className={fieldLabel}>Preferred Locations</label>
                <Input
                  value={formState.jobPreferences?.preferredLocations?.join(', ') || ''}
                  onChange={(e) =>
                    handleNestedChange(
                      'jobPreferences',
                      'preferredLocations',
                      e.target.value.split(',').map((item) => item.trim())
                    )
                  }
                  placeholder="Remote, Bengaluru, Pune..."
                  className={fieldInput}
                />
                <label className={fieldLabel}>Work Modes</label>
                <select
                  multiple
                  className="w-full rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm text-gray-700 focus:border-navy-500 focus:outline-none focus:ring-1 focus:ring-navy-500"
                  value={formState.jobPreferences?.workModes || []}
                  onChange={(e) =>
                    handleNestedChange(
                      'jobPreferences',
                      'workModes',
                      Array.from(e.target.selectedOptions).map((opt) => opt.value)
                    )
                  }
                >
                  <option value="remote">Remote</option>
                  <option value="onsite">Onsite</option>
                  <option value="hybrid">Hybrid</option>
                </select>
              </div>
            </section>

            <section className={sectionClass}>
              <div className="flex items-center justify-between">
                <h2 className={sectionTitle}>Job Recommendations</h2>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={fetchRecommendations}
                  disabled={recLoading}
                  className="flex items-center gap-2"
                >
                  {recLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Briefcase className="w-4 h-4" />
                  )}
                  Refresh
                </Button>
              </div>
              <div className="space-y-4">
                {recommendations.length === 0 && !recLoading && (
                  <p className="text-sm text-gray-500">Save your profile to view tailored roles.</p>
                )}
                {recommendations.map((job) => (
                  <motion.div
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="rounded-2xl border border-gray-100 bg-gradient-to-r from-white to-gray-50 p-4 space-y-2 shadow-sm"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-900">{job.title}</p>
                        <p className="text-sm text-gray-500">{job.company} • {job.location}</p>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-semibold bg-navy-50 text-navy-700">
                        {job.matchScore}% match
                      </span>
                    </div>
                    <p className="text-sm text-gray-600">{job.summary}</p>
                    <div className="flex flex-wrap gap-2">
                      {job.skillsRequired.slice(0, 3).map((skill: string) => (
                        <span
                          key={skill}
                          className="text-xs px-2 py-1 rounded-full bg-white border border-gray-200"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className={sectionClass}>
              <h2 className={sectionTitle}>Resume Snapshot</h2>
              <div className="space-y-4 text-sm text-gray-600">
                <div>
                  <p className="font-semibold text-gray-800">{formState.name}</p>
                  <p>{formState.headline}</p>
                  <p>{formState.location} • {formState.email}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Summary</p>
                  <p>{formState.summary || 'Add a compelling summary to highlight your story.'}</p>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Top Skills</p>
                  <div className="flex flex-wrap gap-2">
                    {formState.skills.slice(0, 6).map((skill) => (
                      <span key={skill} className="px-2 py-1 rounded-full bg-gray-100 text-xs">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium text-gray-800">Experience Highlights</p>
                  {formState.experience.slice(0, 2).map((exp, idx) => (
                    <div key={idx} className="mt-2">
                      <p className="font-semibold">{exp.title} — {exp.company}</p>
                      <p className="text-xs text-gray-500">{exp.startDate} - {exp.endDate || 'Present'}</p>
                      <p>{exp.summary}</p>
                    </div>
                  ))}
                  {formState.experience.length === 0 && (
                    <p className="text-xs text-gray-500">Add experience to auto-build your resume.</p>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-green-500" />
            <div>
              <p className="font-semibold text-gray-900">Build once, reuse everywhere</p>
              <p className="text-sm text-gray-500">
                This profile fuels the Resume Builder, AI Generator, and Job Recommendations instantly.
              </p>
            </div>
          </div>
          <Button
            onClick={handleSave}
            disabled={saving}
            className="bg-navy-600 hover:bg-navy-700 text-white"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Save & Continue'}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;

