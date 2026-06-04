import type { NormalizedResume } from '@/lib/ai-review/extract';
import type { ReviewAnalysis } from '@/lib/ai-review/score';

export type ResumeReviewRecord = {
  id: string;
  fileName: string;
  fileType: string;
  category: string;
  field: string;
  experienceLevel: string;
  jobDescription: string;
  filePath?: string | null;
  normalizedResume: NormalizedResume;
  analysis: ReviewAnalysis;
  score: number;
  ontologyVersion: string;
  createdAt: string;
};

export function buildReviewHeadline(analysis: ReviewAnalysis): string {
  if (analysis.score >= 85) return 'Ready for strong applications';
  if (analysis.score >= 70) return 'Competitive with targeted fixes';
  if (analysis.score >= 55) return 'Needs focused improvements';
  return 'Rebuild core sections first';
}

export function serializeReviewForClient(input: ResumeReviewRecord) {
  return {
    id: input.id,
    fileName: input.fileName,
    fileType: input.fileType,
    category: input.category,
    field: input.field,
    experienceLevel: input.experienceLevel,
    filePath: input.filePath || null,
    normalizedResume: input.normalizedResume,
    analysis: input.analysis,
    score: input.score,
    ontologyVersion: input.ontologyVersion,
    createdAt: input.createdAt,
    headline: buildReviewHeadline(input.analysis),
  };
}
