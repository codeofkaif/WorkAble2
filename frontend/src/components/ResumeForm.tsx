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
      endDate: ''
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
    <Card className="h-full">
      <CardHeader>
        <CardTitle className="text-xl">Resume Details</CardTitle>
        <CardDescription>Fill in your information below</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6 max-h-[calc(100vh-250px)] overflow-y-auto">
        {/* Personal Information */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <h3 className="text-lg font-semibold text-gray-900">Personal Information</h3>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Full Name *
            </label>
            <Input
              value={resumeData.personalInfo?.fullName || ''}
              onChange={(e) => updateField(['personalInfo', 'fullName'], e.target.value)}
              placeholder="John Doe"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email *
            </label>
            <Input
              type="email"
              value={resumeData.personalInfo?.email || ''}
              onChange={(e) => updateField(['personalInfo', 'email'], e.target.value)}
              placeholder="john.doe@example.com"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Phone
            </label>
            <Input
              type="tel"
              value={resumeData.personalInfo?.phone || ''}
              onChange={(e) => updateField(['personalInfo', 'phone'], e.target.value)}
              placeholder="+1 (555) 123-4567"
              className="w-full"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Professional Summary
            </label>
            <Textarea
              value={resumeData.personalInfo?.summary || ''}
              onChange={(e) => updateField(['personalInfo', 'summary'], e.target.value)}
              placeholder="Brief overview of your professional background..."
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Experience</h3>
            <Button
              onClick={addExperience}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>

          {(resumeData.experience || []).map((exp, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Experience {index + 1}</h4>
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
                <Input
                  value={exp.position || ''}
                  onChange={(e) => updateExperience(index, 'position', e.target.value)}
                  placeholder="Job Title"
                  className="w-full"
                />
                <Input
                  value={exp.company || ''}
                  onChange={(e) => updateExperience(index, 'company', e.target.value)}
                  placeholder="Company Name"
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={exp.startDate || ''}
                    onChange={(e) => updateExperience(index, 'startDate', e.target.value)}
                    placeholder="Start Date"
                    className="w-full"
                  />
                  <Input
                    type="date"
                    value={exp.endDate || ''}
                    onChange={(e) => updateExperience(index, 'endDate', e.target.value)}
                    placeholder="End Date"
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
                        updateExperience(index, 'endDate', '');
                      }
                    }}
                    className="rounded"
                  />
                  <span className="text-sm text-gray-700">Current Position</span>
                </label>
                <Textarea
                  value={exp.description || ''}
                  onChange={(e) => updateExperience(index, 'description', e.target.value)}
                  placeholder="Job description and achievements..."
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
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Education</h3>
            <Button
              onClick={addEducation}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>

          {(resumeData.education || []).map((edu, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Education {index + 1}</h4>
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
                  placeholder="Institution Name"
                  className="w-full"
                />
                <Input
                  value={edu.degree || ''}
                  onChange={(e) => updateEducation(index, 'degree', e.target.value)}
                  placeholder="Degree"
                  className="w-full"
                />
                <Input
                  value={edu.field || ''}
                  onChange={(e) => updateEducation(index, 'field', e.target.value)}
                  placeholder="Field of Study"
                  className="w-full"
                />
                <div className="grid grid-cols-2 gap-3">
                  <Input
                    type="date"
                    value={edu.startDate || ''}
                    onChange={(e) => updateEducation(index, 'startDate', e.target.value)}
                    placeholder="Start Date"
                    className="w-full"
                  />
                  <Input
                    type="date"
                    value={edu.endDate || ''}
                    onChange={(e) => updateEducation(index, 'endDate', e.target.value)}
                    placeholder="End Date"
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
          <h3 className="text-lg font-semibold text-gray-900">Skills</h3>
          
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Technical Skills</label>
              <Button
                onClick={() => addSkill('technical')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(resumeData.skills?.technical || []).map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill('technical', index, e.target.value)}
                    placeholder="e.g., React, Python"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeSkill('technical', index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-medium text-gray-700">Soft Skills</label>
              <Button
                onClick={() => addSkill('soft')}
                variant="outline"
                size="sm"
                className="flex items-center space-x-1"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {(resumeData.skills?.soft || []).map((skill, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <Input
                    value={skill}
                    onChange={(e) => updateSkill('soft', index, e.target.value)}
                    placeholder="e.g., Leadership, Communication"
                    className="flex-1"
                  />
                  <Button
                    onClick={() => removeSkill('soft', index)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Projects */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900">Projects</h3>
            <Button
              onClick={addProject}
              variant="outline"
              size="sm"
              className="flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>Add</span>
            </Button>
          </div>

          {(resumeData.projects || []).map((project, index) => (
            <Card key={index} className="p-4">
              <div className="flex justify-between items-start mb-4">
                <h4 className="font-medium text-gray-900">Project {index + 1}</h4>
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
                  className="w-full"
                />
                <Textarea
                  value={project.description || ''}
                  onChange={(e) => updateProject(index, 'description', e.target.value)}
                  placeholder="Project description..."
                  rows={3}
                  className="w-full"
                />
                <Input
                  value={project.link || ''}
                  onChange={(e) => updateProject(index, 'link', e.target.value)}
                  placeholder="Project URL (optional)"
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

