import type { Metadata } from 'next';
import { ResumeToolPanel } from '@/components/tools/ResumeToolPanel';

export const metadata: Metadata = {
  title: 'ATS Resume Checker | Pathica',
  description: 'Get a fast ATS-style score, keyword match insights, and formatting suggestions for your resume.',
  alternates: {
    canonical: '/ats-resume-checker',
  },
};

export default function ToolPage() {
  return (
    <ResumeToolPanel
      mode='ats-checker'
      title='ATS Resume Checker'
      description='Get a fast ATS-style score, keyword match insights, and formatting suggestions for your resume.'
    />
  );
}
