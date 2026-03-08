import type { Metadata } from 'next';
import { ResumeToolPanel } from '@/components/tools/ResumeToolPanel';

export const metadata: Metadata = {
  title: 'Resume Keyword Optimizer | Pathica',
  description: 'Find missing job-description keywords and optimize your resume content for stronger matching.',
  alternates: {
    canonical: '/resume-keyword-optimizer',
  },
};

export default function ToolPage() {
  return (
    <ResumeToolPanel
      mode='keyword-optimizer'
      title='Resume Keyword Optimizer'
      description='Find missing job-description keywords and optimize your resume content for stronger matching.'
    />
  );
}
