export interface PublicTemplate {
  slug: string;
  name: string;
  target: string;
  strengths: string[];
  useHref: string;
}

export const publicTemplates: PublicTemplate[] = [
  {
    slug: 'classic-ats',
    name: 'Classic ATS',
    target: 'General professional roles',
    strengths: ['Clean hierarchy', 'ATS-safe labels', 'Fast recruiter scan'],
    useHref: '/cv/new',
  },
  {
    slug: 'entry-starter',
    name: 'Entry Starter',
    target: 'Entry-level and internship roles',
    strengths: ['Skills-forward layout', 'Education emphasis', 'Project-ready sections'],
    useHref: '/cv/new',
  },
  {
    slug: 'technical-impact',
    name: 'Technical Impact',
    target: 'Engineering and data roles',
    strengths: ['Project impact blocks', 'Tool and stack clarity', 'Metrics-friendly bullets'],
    useHref: '/cv/new',
  },
  {
    slug: 'growth-marketing',
    name: 'Growth Marketing',
    target: 'Marketing and growth roles',
    strengths: ['Campaign outcome focus', 'Channel-specific skills', 'Experiment highlights'],
    useHref: '/cv/new',
  },
  {
    slug: 'customer-success',
    name: 'Customer Success',
    target: 'Support and success roles',
    strengths: ['Retention metric visibility', 'Communication clarity', 'Case-driven bullets'],
    useHref: '/cv/new',
  },
  {
    slug: 'career-switch',
    name: 'Career Switch',
    target: 'Career transition candidates',
    strengths: ['Transferable skills spotlight', 'Bridge summary style', 'Structured transition narrative'],
    useHref: '/cv/new',
  },
];
