const normalizeArray = (arr = []) =>
  (Array.isArray(arr) ? arr : [])
    .map((item) => item?.toString().toLowerCase().trim())
    .filter(Boolean);

const sampleJobs = [
  {
    id: 'frontend-accessibility-engineer',
    title: 'Frontend Accessibility Engineer',
    company: 'Inclusion Labs',
    location: 'Remote',
    workMode: 'remote',
    type: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '$80k - $110k',
    skillsRequired: ['React', 'TypeScript', 'WCAG', 'ARIA', 'Testing Library'],
    accessibilitySupport: ['screen-reader', 'keyboard-navigation', 'high-contrast'],
    industry: 'Technology',
    summary: 'Build inclusive UI systems and drive accessibility reviews across the product surface area.',
    benefits: ['Remote-first', 'Flexible hours', 'Assistive tech stipend'],
    featured: true
  },
  {
    id: 'voice-ui-specialist',
    title: 'Voice UI Specialist',
    company: 'AbleTech',
    location: 'Hybrid - Bengaluru',
    workMode: 'hybrid',
    type: 'full-time',
    experienceLevel: 'mid',
    salaryRange: '₹18L - ₹24L',
    skillsRequired: ['Conversation Design', 'Speech Recognition', 'JavaScript', 'Node.js'],
    accessibilitySupport: ['voice-control', 'captioning', 'flex-hours'],
    industry: 'Assistive Technology',
    summary: 'Design and build multimodal voice experiences with a focus on accessibility compliance.',
    benefits: ['Onsite accessibility lab', 'L&D stipend', 'Health cover']
  },
  {
    id: 'a11y-program-manager',
    title: 'Accessibility Program Manager',
    company: 'CareersPlus',
    location: 'Remote – India',
    workMode: 'remote',
    type: 'contract',
    experienceLevel: 'senior',
    salaryRange: '$60/hr - $80/hr',
    skillsRequired: ['Program Management', 'Accessibility Audits', 'Stakeholder Management'],
    accessibilitySupport: ['remote-first', 'sign-language', 'ergonomic-budget'],
    industry: 'Enterprise Consulting',
    summary: 'Lead cross-functional accessibility roadmaps and coach teams on inclusive best practices.',
    benefits: ['Remote stipend', 'Flexible schedule']
  },
  {
    id: 'data-analyst-inclusive-hiring',
    title: 'Inclusive Hiring Data Analyst',
    company: 'HireBetter',
    location: 'Gurugram',
    workMode: 'onsite',
    type: 'full-time',
    experienceLevel: 'entry',
    salaryRange: '₹8L - ₹12L',
    skillsRequired: ['Python', 'SQL', 'PowerBI', 'Accessibility Metrics'],
    accessibilitySupport: ['step-free-office', 'ergonomic-setup'],
    industry: 'HR Tech',
    summary: 'Analyze candidate funnels and design dashboards that highlight accessibility KPIs.',
    benefits: ['Onsite physiotherapy', 'Transport allowance']
  },
  {
    id: 'content-strategist-inclusive-design',
    title: 'Inclusive Design Content Strategist',
    company: 'Narrative Studio',
    location: 'Remote - Europe/India overlap',
    workMode: 'remote',
    type: 'part-time',
    experienceLevel: 'mid',
    salaryRange: '$45/hr - $55/hr',
    skillsRequired: ['Content Design', 'Plain Language', 'Accessibility', 'Figma'],
    accessibilitySupport: ['async-work', 'captioning', 'flex-hours'],
    industry: 'Design Services',
    summary: 'Create accessible content systems, guidelines, and component documentation.',
    benefits: ['Equipment budget', 'Wellness allowance']
  }
];

const scoreJobForUser = (user, job) => {
  const userSkills = new Set(normalizeArray(user.skills));
  const jobSkills = normalizeArray(job.skillsRequired);

  const skillMatches = jobSkills.filter((skill) => userSkills.has(skill)).length;
  const skillScore = jobSkills.length ? (skillMatches / jobSkills.length) * 55 : 0;

  const accessibilityNeeds = normalizeArray(user.preferences?.accessibilityRequirements);
  const accessibilityScore = job.accessibilitySupport?.some((support) =>
    accessibilityNeeds.includes(support)
  )
    ? 15
    : 0;

  const preferredIndustries = normalizeArray(user.preferences?.preferredIndustries);
  const industryScore = preferredIndustries.includes(job.industry.toLowerCase()) ? 5 : 0;

  const workModeScore = user.jobPreferences?.workModes?.includes(job.workMode) ? 10 : 0;

  const locationScore = (user.jobPreferences?.preferredLocations || []).some((loc) =>
    job.location.toLowerCase().includes(loc.toLowerCase())
  )
    ? 5
    : 0;

  const experienceScore =
    user.jobPreferences?.experienceLevel === job.experienceLevel ? 5 : 0;

  return Math.min(
    100,
    Math.round(skillScore + accessibilityScore + industryScore + workModeScore + locationScore + experienceScore)
  );
};

const buildRecommendations = (userDoc) => {
  const user = userDoc.toObject ? userDoc.toObject() : userDoc;

  const recommendations = sampleJobs.map((job) => ({
    ...job,
    matchScore: scoreJobForUser(user, job)
  }));

  return recommendations.sort((a, b) => b.matchScore - a.matchScore).slice(0, 5);
};

module.exports = {
  buildRecommendations
};

