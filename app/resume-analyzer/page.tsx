import type { Metadata } from 'next';
import { ResumeToolPanel } from '@/components/tools/ResumeToolPanel';

export const metadata: Metadata = {
  title: 'Resume Analyzer | Pathica',
  description: 'Analyze your resume against a target role and receive actionable improvements in seconds.',
  alternates: {
    canonical: '/resume-analyzer',
  },
};

export default function ToolPage() {
  return (
    <ResumeToolPanel
      mode='resume-analyzer'
      title='Resume Analyzer'
      description='Analyze your resume against a target role and receive actionable improvements in seconds.'
    />
  );
}
