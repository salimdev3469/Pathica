export type ReviewCategoryId =
  | 'software_engineering'
  | 'engineering_stem'
  | 'business_finance'
  | 'design_creative'
  | 'marketing_sales'
  | 'operations_support';

export type ReviewFieldId =
  | 'general_software'
  | 'frontend'
  | 'backend'
  | 'fullstack'
  | 'mobile'
  | 'devops'
  | 'data'
  | 'ml_ai'
  | 'mechanical'
  | 'electrical'
  | 'finance'
  | 'product'
  | 'ux_ui'
  | 'growth'
  | 'operations';

export type ExperienceLevelId = 'intern' | 'entry' | 'mid' | 'senior' | 'staff';

export type ReviewCategory = {
  id: ReviewCategoryId;
  label: string;
  description: string;
  fields: ReviewFieldId[];
};

export type ReviewField = {
  id: ReviewFieldId;
  categoryId: ReviewCategoryId;
  label: string;
  escoUri?: string;
  onetCode?: string;
  skills: string[];
  aliases: string[];
};

export type ExperienceLevel = {
  id: ExperienceLevelId;
  label: string;
  range: string;
  minBullets: number;
  minQuantified: number;
  leadershipExpected: boolean;
};

export type AiReviewOntology = {
  version: string;
  weights: {
    atsStructure: 20;
    contentEvidence: 40;
    writingQuality: 10;
    jobMatch: 25;
    readiness: 5;
  };
  categories: ReviewCategory[];
  fields: ReviewField[];
  experienceLevels: ExperienceLevel[];
  sectionAliases: Record<string, string[]>;
  actionVerbs: string[];
  weakPhrases: string[];
};

export const AI_REVIEW_ONTOLOGY: AiReviewOntology = {
  version: 'ai-review-ontology-v1-2026-06-02',
  weights: {
    atsStructure: 20,
    contentEvidence: 40,
    writingQuality: 10,
    jobMatch: 25,
    readiness: 5,
  },
  categories: [
    {
      id: 'software_engineering',
      label: 'Software Engineering',
      description: 'Build the digital world',
      fields: ['general_software', 'frontend', 'backend', 'fullstack', 'mobile', 'devops', 'data', 'ml_ai'],
    },
    {
      id: 'engineering_stem',
      label: 'Engineering & STEM',
      description: 'Design, analyze, innovate',
      fields: ['mechanical', 'electrical', 'data'],
    },
    {
      id: 'business_finance',
      label: 'Business & Finance',
      description: 'Strategy, deals, growth',
      fields: ['finance', 'product', 'operations'],
    },
    {
      id: 'design_creative',
      label: 'Design & Creative',
      description: 'Craft experiences',
      fields: ['ux_ui', 'product'],
    },
    {
      id: 'marketing_sales',
      label: 'Marketing & Sales',
      description: 'Pipeline, campaigns, revenue',
      fields: ['growth', 'product'],
    },
    {
      id: 'operations_support',
      label: 'Operations & Support',
      description: 'Systems, customers, delivery',
      fields: ['operations', 'product'],
    },
  ],
  fields: [
    {
      id: 'general_software',
      categoryId: 'software_engineering',
      label: 'General Software Engineering',
      onetCode: '15-1252.00',
      skills: ['software development', 'debugging', 'testing', 'api', 'database', 'git', 'architecture'],
      aliases: ['software engineer', 'developer', 'programmer', 'yazilim', 'yazılım'],
    },
    {
      id: 'frontend',
      categoryId: 'software_engineering',
      label: 'Frontend Engineering',
      onetCode: '15-1254.00',
      skills: ['react', 'next.js', 'typescript', 'javascript', 'html', 'css', 'accessibility', 'performance'],
      aliases: ['frontend', 'front end', 'ui developer'],
    },
    {
      id: 'backend',
      categoryId: 'software_engineering',
      label: 'Backend Engineering',
      onetCode: '15-1252.00',
      skills: ['node.js', 'api', 'microservices', 'database', 'sql', 'authentication', 'scalability'],
      aliases: ['backend', 'back end', 'server-side', '.net', 'java', 'spring'],
    },
    {
      id: 'fullstack',
      categoryId: 'software_engineering',
      label: 'Full-Stack Engineering',
      onetCode: '15-1252.00',
      skills: ['react', 'node.js', 'api', 'database', 'typescript', 'deployment', 'full-stack'],
      aliases: ['fullstack', 'full-stack', 'full stack'],
    },
    {
      id: 'mobile',
      categoryId: 'software_engineering',
      label: 'Mobile Engineering',
      onetCode: '15-1252.00',
      skills: ['flutter', 'react native', 'ios', 'android', 'mobile', 'app store', 'play store', 'dart'],
      aliases: ['mobile', 'ios', 'android', 'flutter', 'react native'],
    },
    {
      id: 'devops',
      categoryId: 'software_engineering',
      label: 'DevOps Engineering',
      onetCode: '15-1244.00',
      skills: ['ci/cd', 'docker', 'kubernetes', 'aws', 'azure', 'linux', 'monitoring', 'terraform'],
      aliases: ['devops', 'sre', 'platform engineer'],
    },
    {
      id: 'data',
      categoryId: 'software_engineering',
      label: 'Data Engineering',
      onetCode: '15-2051.00',
      skills: ['sql', 'python', 'etl', 'data pipeline', 'power bi', 'tableau', 'analytics', 'warehouse'],
      aliases: ['data engineer', 'data analyst', 'analytics', 'business intelligence'],
    },
    {
      id: 'ml_ai',
      categoryId: 'software_engineering',
      label: 'ML/AI Engineering',
      onetCode: '15-2051.00',
      skills: ['machine learning', 'python', 'model', 'nlp', 'llm', 'tensorflow', 'pytorch', 'mlops'],
      aliases: ['machine learning', 'ml engineer', 'ai engineer', 'data scientist'],
    },
    {
      id: 'mechanical',
      categoryId: 'engineering_stem',
      label: 'Mechanical Engineering',
      onetCode: '17-2141.00',
      skills: ['cad', 'solidworks', 'manufacturing', 'simulation', 'quality', 'mechanical design'],
      aliases: ['mechanical engineer', 'makine'],
    },
    {
      id: 'electrical',
      categoryId: 'engineering_stem',
      label: 'Electrical Engineering',
      onetCode: '17-2071.00',
      skills: ['circuit', 'embedded', 'power systems', 'plc', 'electronics', 'matlab'],
      aliases: ['electrical engineer', 'electronics', 'elektrik'],
    },
    {
      id: 'finance',
      categoryId: 'business_finance',
      label: 'Finance',
      onetCode: '13-2051.00',
      skills: ['financial analysis', 'excel', 'budgeting', 'forecasting', 'modeling', 'reporting'],
      aliases: ['finance', 'financial analyst', 'accounting'],
    },
    {
      id: 'product',
      categoryId: 'business_finance',
      label: 'Product Management',
      onetCode: '11-2021.00',
      skills: ['roadmap', 'stakeholder', 'user research', 'analytics', 'prioritization', 'go-to-market'],
      aliases: ['product manager', 'product owner', 'business analyst'],
    },
    {
      id: 'ux_ui',
      categoryId: 'design_creative',
      label: 'UX/UI Design',
      onetCode: '15-1255.00',
      skills: ['figma', 'wireframe', 'prototype', 'user research', 'design system', 'usability'],
      aliases: ['ux', 'ui', 'product designer'],
    },
    {
      id: 'growth',
      categoryId: 'marketing_sales',
      label: 'Growth Marketing',
      onetCode: '11-2021.00',
      skills: ['seo', 'campaign', 'conversion', 'crm', 'analytics', 'a/b testing', 'content'],
      aliases: ['marketing', 'growth', 'sales'],
    },
    {
      id: 'operations',
      categoryId: 'operations_support',
      label: 'Operations',
      onetCode: '13-1081.00',
      skills: ['process improvement', 'customer support', 'operations', 'logistics', 'sla', 'workflow'],
      aliases: ['operations', 'support', 'customer success'],
    },
  ],
  experienceLevels: [
    { id: 'intern', label: 'Intern', range: '0y', minBullets: 4, minQuantified: 1, leadershipExpected: false },
    { id: 'entry', label: 'Entry', range: '0-2y', minBullets: 6, minQuantified: 2, leadershipExpected: false },
    { id: 'mid', label: 'Mid', range: '3-5y', minBullets: 10, minQuantified: 3, leadershipExpected: false },
    { id: 'senior', label: 'Senior', range: '6-10y', minBullets: 14, minQuantified: 5, leadershipExpected: true },
    { id: 'staff', label: 'Staff+', range: '10y+', minBullets: 18, minQuantified: 7, leadershipExpected: true },
  ],
  sectionAliases: {
    experience: ['experience', 'work experience', 'professional experience', 'employment', 'deneyim', 'is deneyimi', 'iş deneyimi'],
    education: ['education', 'academic background', 'egitim', 'eğitim'],
    skills: ['skills', 'technical skills', 'competencies', 'beceriler', 'teknik beceriler'],
    projects: ['projects', 'project experience', 'projeler'],
    certifications: ['certifications', 'certificates', 'licenses', 'sertifikalar'],
    languages: ['languages', 'language skills', 'diller'],
    summary: ['summary', 'profile', 'profile summary', 'profil ozeti', 'profil özeti'],
  },
  actionVerbs: [
    'achieved',
    'analyzed',
    'automated',
    'built',
    'created',
    'delivered',
    'designed',
    'developed',
    'drove',
    'implemented',
    'improved',
    'increased',
    'launched',
    'led',
    'managed',
    'optimized',
    'reduced',
    'scaled',
    'streamlined',
    'gelistirdim',
    'geliştirdim',
    'iyilestirdim',
    'iyileştirdim',
    'yonettim',
    'yönettim',
  ],
  weakPhrases: [
    'responsible for',
    'helped with',
    'worked on',
    'participated in',
    'gorev aldim',
    'görev aldım',
    'yardimci oldum',
    'yardımcı oldum',
  ],
};

export function getReviewField(fieldId: string | null | undefined): ReviewField | null {
  if (!fieldId) return null;
  return AI_REVIEW_ONTOLOGY.fields.find((field) => field.id === fieldId) || null;
}

export function getExperienceLevel(levelId: string | null | undefined): ExperienceLevel | null {
  if (!levelId) return null;
  return AI_REVIEW_ONTOLOGY.experienceLevels.find((level) => level.id === levelId) || null;
}
