import type { Metadata } from 'next';
import { ResumeToolPanel } from '@/components/tools/ResumeToolPanel';

export const metadata: Metadata = {
  title: 'Resume Score Tool | Pathica',
  description: 'Measure your resume quality with a 0-100 score across readability, structure, and keyword relevance.',
  alternates: {
    canonical: '/resume-score',
  },
};

export default function ToolPage() {
  return (
    <ResumeToolPanel
      mode='resume-score'
      title='Resume Score Tool'
      description='Measure your resume quality with a 0-100 score across readability, structure, and keyword relevance.'
    />
  );
}
