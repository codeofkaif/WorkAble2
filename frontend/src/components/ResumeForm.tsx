import React from 'react';
import { motion } from 'framer-motion';
import { Plus, X, Trash2 } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { ResumeData } from '../services/resumeAPI';

interface ResumeFormProps {
  resumeData: ResumeData;
  onResumeDataChange: (data: ResumeData) => void;
}

const ResumeForm: React.FC<ResumeFormProps> = ({ resumeData, onResumeDataChange }) => {
  const updateField = (path: string[], value: any) => {
    const newData = { ...resumeData };
    let current: any = newData;
    
    for (let i = 0; i < path.length - 1; i++) {
      current = current[path[i]] = { ...current[path[i]] };
    }
    current[path[path.length - 1]] = value;
    
    onResumeDataChange(newData);
  };

  const addExperience = () => {
    const newExp = {
      company: '',
      position: '',
      startDate: '',
      endDate: '',
      current: false,
      description: ''
    };
    updateField(['experience'], [...(resumeData.experience || []), newExp]);
  };

  const removeExperience = (index: number) => {
    const newExp = [...(resumeData.experience || [])];
    newExp.splice(index, 1);
    updateField(['experience'], newExp);
  };

  const updateExperience = (index: number, field: string, value: any) => {
    const newExp = [...(resumeData.experience || [])];
    newExp[index] = { ...newExp[index], [field]: value };
    updateField(['experience'], newExp);
  };

  const addEducation = () => {
    const newEdu = {
      institution: '',
      degree: '',
      field: '',
      startDate: '',
      endDate: '',
      gpa: ''
    };
    updateField(['education'], [...(resumeData.education || []), newEdu]);
  };

  const removeEducation = (index: number) => {
    const newEdu = [...(resumeData.education || [])];
    newEdu.splice(index, 1);
    updateField(['education'], newEdu);
  };

  const updateEducation = (index: number, field: string, value: any) => {
    const newEdu = [...(resumeData.education || [])];
    newEdu[index] = { ...newEdu[index], [field]: value };
    updateField(['education'], newEdu);
  };

  const addSkill = (category: 'technical' | 'soft') => {
    const skills = resumeData.skills?.[category] || [];
    updateField(['skills', category], [...skills, '']);
  };

  const removeSkill = (category: 'technical' | 'soft', index: number) => {
    const skills = [...(resumeData.skills?.[category] || [])];
    skills.splice(index, 1);
    updateField(['skills', category], skills);
  };

  const updateSkill = (category: 'technical' | 'soft', index: number, value: string) => {
    const skills = [...(resumeData.skills?.[category] || [])];
    skills[index] = value;
    updateField(['skills', category], skills);
  };

  const addProject = () => {
    const newProject = {
      name: '',
      description: '',
      technologies: [],
      link: ''
    };
    updateField(['projects'], [...(resumeData.projects || []), newProject]);
  };

  const removeProject = (index: number) => {
    const newProjects = [...(resumeData.projects || [])];
    newProjects.splice(index, 1);
    updateField(['projects'], newProjects);
  };

  const updateProject = (index: number, field: string, value: any) => {
    const newProjects = [...(resumeData.projects || [])];
    newProjects[index] = { ...newProjects[index], [field]: value };
    updateField(['projects'], newProjects);
  };

  return (
    <Card className="h-full shadow-lg border-gray-200">
      <CardHeader>
        <CardTitle className="text-xl font-bold text-gray-900">Resume Details</CardTitle>
        <CardDescription>Extracted data is automatically populated. Edit or refine below.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto pr-2">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name *
            </label>
            <Input
              value={resumeData.personalInfo?.fullName || ''}
              onChange={(e) => updateField(['personalInfo', 'fullName'], e.target.value)}
              placeholder="e.g. Sebastian Bennett"
              className="w-full font-medium"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email *
              </label>
              <Input
                type="email"
                value={resumeData.personalInfo?.email || ''}
                onChange={(e) => updateField(['personalInfo', 'email'], e.target.value)}
                placeholder="e.g. hello@reallygreatsite.com"
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Phone
              </label>
              <Input
                type="tel"
                value={resumeData.personalInfo?.phone || ''}
                onChange={(e) => updateField(['personalInfo', 'phone'], e.target.value)}
                placeholder="e.g. +123-456-7890"
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address / Location
            </label>
            <Input
              value={resumeData.personalInfo?.address || ''}
              onChange={(e) => updateField(['personalInfo', 'address'], e.target.value)}
              placeholder="e.g. 123 Anywhere St., Any City"
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                LinkedIn URL
              </label>
              <Input
                value={resumeData.personalInfo?.linkedin || ''}
                onChange={(e) => updateField(['personalInfo', 'linkedin'], e.target.value)}
                placeholder="https://linkedin.com/in/..."
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Website / GitHub
              </label>
              <Input
                value={resumeData.personalInfo?.website || ''}
                onChange={(e) => updateField(['personalInfo', 'website'], e.target.value)}
                placeholder="https://github.com/..."
                className="w-full"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Professional Summary / About Me
            </label>
            <Textarea
              value={resumeData.personalInfo?.summary || ''}
              onChange={(e) => updateField(['personalInfo', 'summary'], e.target.value)}
              placeholder="Brief overview of your professional background, achievements, and core skills..."
              rows={4}
              className="w-full"
            />
          </div>
        </motion.div>

        {/* Experience */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Work Experience</h3>
            <Button
              onClick={addExperience}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Position</span>
            </Button>
          </div>

          {(resumeData.experience || []).map((exp, index) => (
            <Card key={index} className="p-4 border-gray-200 bg-gray-50/50">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">Position {index + 1}</h4>
                <Button
                  onClick={() => removeExperience(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={exp.position || (exp as any).title || ''}
                    onChange={(e) => updateExperience(index, 'position', e.target.value)}
                    placeholder="Job Title (e.g. Senior Accountant)"
                    className="w-full font-medium"
                  />
                  <Input
                    value={exp.company || ''}
                    onChange={(e) => updateExperience(index, 'company', e.target.value)}
                    placeholder="Company (e.g. Salford & Co.)"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="text"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    placeholder="Start Date (e.g. 2033 or Jan 2020)"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    placeholder="End Date (e.g. 2035 or Present)"
                    className="w-full"
                    disabled={exp.current}
                  />
                </div>
                <label className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={exp.current || false}
                    onChange={(e) => {
                      updateExperience(index, 'current', e.target.checked);
                      if (e.target.checked) {
                        updateExperience(index, 'endDate', 'Present');
                      }
                    }}
                    className="rounded text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">Currently Working Here</span>
                </label>
                <Textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Key responsibilities, projects, and achievements..."
                  rows={3}
                  className="w-full"
                />
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Education */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <Button
              onClick={addEducation}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Education</span>
            </Button>
          </div>

          {(resumeData.education || []).map((edu, index) => (
            <Card key={index} className="p-4 border-gray-200 bg-gray-50/50">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">Education {index + 1}</h4>
                <Button
                  onClick={() => removeEducation(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Input
                  value={edu.institution || ''}
                  onChange={(e) => updateEducation(index, 'institution', e.target.value)}
                  placeholder="Institution (e.g. Borcelle University)"
                  className="w-full font-medium"
                />
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    value={edu.degree || ''}
                    onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                    placeholder="Degree (e.g. Bachelor of Commerce)"
                    className="w-full"
                  />
                  <Input
                    value={edu.field || ''}
                    onChange={(e) => updateEducation(index, 'field', e.target.value)}
                    placeholder="Field of Study"
                    className="w-full"
                  />
                </div>
                <div className="grid grid-cols-3 gap-3">
                  <Input
                    type="text"
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="Start (e.g. 2026)"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="End (e.g. 2030)"
                    className="w-full"
                  />
                  <Input
                    type="text"
                    value={edu.gpa || ''}
                    onChange={(e) => updateEducation(index, 'gpa', e.target.value)}
                    placeholder="GPA / %"
                    className="w-full"
                  />
                </div>
              </div>
            </Card>
          ))}
        </motion.div>

        {/* Skills */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Technical & Domain Skills</h3>
            <Button
              onClick={() => addSkill('technical')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(resumeData.skills?.technical || []).map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={skill}
                  onChange={(e) => updateSkill('technical', index, e.target.value)}
                  placeholder="e.g. Auditing, Java, React"
                  className="flex-1"
                />
                <Button
                  onClick={() => removeSkill('technical', index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>

          <div className="flex items-center justify-between border-b pb-2 pt-4">
            <h3 className="text-lg font-semibold text-gray-900">Soft Skills</h3>
            <Button
              onClick={() => addSkill('soft')}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Skill</span>
            </Button>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {(resumeData.skills?.soft || []).map((skill, index) => (
              <div key={index} className="flex items-center space-x-2">
                <Input
                  value={skill}
                  onChange={(e) => updateSkill('soft', index, e.target.value)}
                  placeholder="e.g. Leadership, Communication"
                  className="flex-1"
                />
                <Button
                  onClick={() => removeSkill('soft', index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700 p-1"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b pb-2">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <Button
              onClick={addProject}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add Project</span>
            </Button>
          </div>

          {(resumeData.projects || []).map((project, index) => (
            <Card key={index} className="p-4 border-gray-200 bg-gray-50/50">
              <div className="flex justify-between items-start mb-3">
                <h4 className="font-semibold text-gray-900">Project {index + 1}</h4>
                <Button
                  onClick={() => removeProject(index)}
                  variant="ghost"
                  size="sm"
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-3">
                <Input
                  value={project.name || ''}
                  onChange={(e) => updateProject(index, 'name', e.target.value)}
                  placeholder="Project Name"
                  className="w-full font-medium"
                />
                <Input
                  value={project.link || ''}
                  onChange={(e) => updateProject(index, 'link', e.target.value)}
                  placeholder="Project Link / URL"
                  className="w-full"
                />
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Project description and impact..."
                  rows={2}
                  className="w-full"
                />
              </div>
            </Card>
          ))}
        </motion.div>
      </CardContent>
    </Card>
  );
};

export default ResumeForm;
