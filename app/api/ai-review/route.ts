import { NextResponse } from 'next/server';
import { serializeReviewForClient, type ResumeReviewRecord } from '@/lib/ai-review/report';
import { createClient } from '@/lib/supabase-server';
import { isMissingTableInSchemaCache } from '@/lib/supabase-errors';

export const runtime = 'nodejs';

type ResumeReviewRow = {
  id: string;
  file_name: string;
  file_type: string;
  category: string;
  field: string;
  experience_level: string;
  job_description: string | null;
  normalized_resume: ResumeReviewRecord['normalizedResume'];
  analysis: ResumeReviewRecord['analysis'];
  score: number;
  ontology_version: string;
  created_at: string;
};

export async function GET() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data, error } = await supabase
    .from('resume_reviews')
    .select(
      'id,file_name,file_type,category,field,experience_level,job_description,normalized_resume,analysis,score,ontology_version,created_at',
    )
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(30);

  if (error) {
    if (isMissingTableInSchemaCache(error, 'resume_reviews')) {
      return NextResponse.json({
        reviews: [],
        stats: {
          targetScore: 92,
          bestScore: null,
          avgScore: null,
          reviewCount: 0,
        },
        schemaMissing: true,
      });
    }

    console.error('AI Review history error:', error);
    return NextResponse.json({ error: 'Could not load AI Review history.' }, { status: 500 });
  }

  const reviews = ((data || []) as ResumeReviewRow[]).map((row) =>
    serializeReviewForClient({
      id: row.id,
      fileName: row.file_name,
      fileType: row.file_type,
      category: row.category,
      field: row.field,
      experienceLevel: row.experience_level,
      jobDescription: row.job_description || '',
      normalizedResume: row.normalized_resume,
      analysis: row.analysis,
      score: row.score,
      ontologyVersion: row.ontology_version,
      createdAt: row.created_at,
    }),
  );

  const scores = reviews.map((review) => review.score).filter((score) => Number.isFinite(score));
  const bestScore = scores.length > 0 ? Math.max(...scores) : null;
  const avgScore = scores.length > 0 ? Math.round(scores.reduce((sum, score) => sum + score, 0) / scores.length) : null;

  return NextResponse.json({
    reviews,
    stats: {
      targetScore: 92,
      bestScore,
      avgScore,
      reviewCount: reviews.length,
    },
  });
}
