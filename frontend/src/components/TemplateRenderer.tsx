import React from 'react';
import { ResumeData } from '../services/resumeAPI';
import { resumeStyles, TemplateType } from './resumeStyles';

interface TemplateRendererProps {
  resumeData: ResumeData;
  template: TemplateType;
}

const TemplateRenderer: React.FC<TemplateRendererProps> = ({ resumeData, template }) => {
  const styles = resumeStyles[template];
  const { personalInfo, experience, education, skills, projects } = resumeData;

  return (
    <div className={`${styles.container} p-8 min-h-full`}>
      {/* Header */}
      <div className={styles.header}>
        <h1 className={styles.name}>
          {personalInfo?.fullName || 'Your Name'}
        </h1>
        <div className={styles.contact}>
          {personalInfo?.email && (
            <span>{personalInfo.email}</span>
          )}
          {personalInfo?.phone && (
            <span>• {personalInfo.phone}</span>
          )}
        </div>
      </div>

      {/* Professional Summary */}
      {personalInfo?.summary && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {template === 'creative' && '📝 '}
            Professional Summary
          </h2>
          <p className={styles.text}>{personalInfo.summary}</p>
        </div>
      )}

      {/* Experience */}
      {experience && experience.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {template === 'creative' && '💼 '}
            Professional Experience
          </h2>
          {experience.map((exp, index) => (
            <div key={index} className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>
                {exp.position}
                {exp.company && ` at ${exp.company}`}
              </h3>
              <p className={styles.date}>
                {exp.startDate && new Date(exp.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
                {exp.endDate && !exp.current && (
                  <>
                    {' - '}
                    {new Date(exp.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </>
                )}
                {exp.current && ' - Present'}
              </p>
              {exp.description && (
                <p className={styles.text}>{exp.description}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Education */}
      {education && education.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {template === 'creative' && '🎓 '}
            Education
          </h2>
          {education.map((edu, index) => (
            <div key={index} className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>
                {edu.degree}
                {edu.field && ` in ${edu.field}`}
              </h3>
              <p className={styles.text}>{edu.institution}</p>
              <p className={styles.date}>
                {edu.startDate && new Date(edu.startDate).toLocaleDateString('en-US', { 
                  year: 'numeric', 
                  month: 'short' 
                })}
                {edu.endDate && (
                  <>
                    {' - '}
                    {new Date(edu.endDate).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'short' 
                    })}
                  </>
                )}
              </p>
              {edu.gpa && (
                <p className={styles.text}>GPA: {edu.gpa}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Skills */}
      {skills && (skills.technical?.length > 0 || skills.soft?.length > 0) && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {template === 'creative' && '🛠️ '}
            Skills
          </h2>
          {skills.technical && skills.technical.length > 0 && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Technical Skills</h3>
              <div>
                {skills.technical.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
          {skills.soft && skills.soft.length > 0 && (
            <div className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>Soft Skills</h3>
              <div>
                {skills.soft.map((skill, index) => (
                  <span key={index} className={styles.skillTag}>
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Projects */}
      {projects && projects.length > 0 && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>
            {template === 'creative' && '🚀 '}
            Projects
          </h2>
          {projects.map((project, index) => (
            <div key={index} className={styles.subsection}>
              <h3 className={styles.subsectionTitle}>
                {project.name}
                {project.link && (
                  <a
                    href={project.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 ml-2 text-sm"
                  >
                    (View)
                  </a>
                )}
              </h3>
              {project.description && (
                <p className={styles.text}>{project.description}</p>
              )}
              {project.technologies && project.technologies.length > 0 && (
                <div className="mt-2">
                  <span className="text-sm text-gray-600">Technologies: </span>
                  {project.technologies.map((tech, techIndex) => (
                    <span key={techIndex} className={styles.skillTag}>
                      {tech}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TemplateRenderer;

