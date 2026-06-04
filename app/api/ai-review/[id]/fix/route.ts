import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import type { NormalizedResume, NormalizedResumeItem, NormalizedResumeSection } from '@/lib/ai-review/extract';
import type { ReviewAnalysis } from '@/lib/ai-review/score';
import { consumeAdvancedAiCredit, refundConsumption } from '@/lib/billing';
import { AI_REVIEW_FIX_CREDIT_COST } from '@/lib/billing-config';
import { calculateKnowledgeBasedAts } from '@/lib/ats-knowledge-score';
import { generateGeminiText, mapGeminiErrorToResponse } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';
import { isMissingTableInSchemaCache } from '@/lib/supabase-errors';

export const runtime = 'nodejs';

type ResumeReviewRow = {
  id: string;
  file_name: string;
  field: string;
  experience_level: string;
  job_description: string | null;
  normalized_resume: NormalizedResume;
  analysis: ReviewAnalysis;
  score: number;
  ontology_version: string;
};

type PersistableCvItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
  position: number;
};

type PersistableCvSection = {
  id: string;
  title: string;
  position: number;
  items: PersistableCvItem[];
};

type PersistableCvState = {
  id: string;
  title: string;
  templateSlug: 'classic-ats';
  fontFamily: 'calibri';
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  summaryTitle: string;
  summary: string;
  sections: PersistableCvSection[];
};

export async function POST(_req: Request, { params }: { params: { id: string } }) {
  let userId: string | null = null;
  let consumption: Awaited<ReturnType<typeof consumeAdvancedAiCredit>> | null = null;
  let createdCvId: string | null = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured right now.' }, { status: 503 });
    }

    const { data: review, error: reviewError } = await supabase
      .from('resume_reviews')
      .select('id,file_name,field,experience_level,job_description,normalized_resume,analysis,score,ontology_version')
      .eq('id', params.id)
      .eq('user_id', user.id)
      .maybeSingle();

    if (reviewError) {
      if (isMissingTableInSchemaCache(reviewError, 'resume_reviews')) {
        return NextResponse.json(
          {
            error: 'AI Review database schema is missing. Please apply supabase/schema.sql before fixing resumes.',
            code: 'DATABASE_SCHEMA_MISSING',
          },
          { status: 503 },
        );
      }

      console.error('AI Review fix load error:', reviewError);
      return NextResponse.json({ error: 'Could not load review.' }, { status: 500 });
    }

    if (!review) {
      return NextResponse.json({ error: 'Review not found.' }, { status: 404 });
    }

    const typedReview = review as ResumeReviewRow;
    consumption = await consumeAdvancedAiCredit(user.id, 'ai_review_fix', {
      review_id: typedReview.id,
      score: typedReview.score,
      credit_cost: AI_REVIEW_FIX_CREDIT_COST,
    });

    if (!consumption.ok && consumption.code === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Buy a package to unlock the job-ready review.',
          code: 'INSUFFICIENT_CREDITS',
          status: 402,
          wallet: {
            creditBalance: consumption.creditBalance,
            freeExportsRemaining: consumption.freeExportsRemaining,
          },
        },
        { status: 402 },
      );
    }

    if (!consumption.ok) {
      return NextResponse.json({ error: 'Could not consume AI Review credits.' }, { status: 500 });
    }

    const fixedResume = await generateFixedResume(typedReview);
    const cvId = crypto.randomUUID();
    createdCvId = cvId;
    const cvState = buildCvStateFromNormalizedResume(cvId, fixedResume, typedReview.file_name);
    const atsMeta = calculateKnowledgeBasedAts(cvState);

    const { data: cvRow, error: cvError } = await supabase
      .from('cvs')
      .insert({
        id: cvId,
        user_id: user.id,
        title: cvState.title,
        ats_score: atsMeta.score,
        ats_score_updated_at: new Date().toISOString(),
      })
      .select('id')
      .single();

    if (cvError || !cvRow) {
      throw cvError || new Error('Could not create fixed CV.');
    }

    await persistCvState(supabase, cvState, atsMeta);

    return NextResponse.json({
      cvId,
      consumedCredits: consumption.consumedCredits,
    });
  } catch (error) {
    const supabase = createClient();

    if (createdCvId) {
      try {
        await supabase.from('cvs').delete().eq('id', createdCvId);
      } catch (cleanupError) {
        console.error('Failed to clean up failed AI Review CV:', cleanupError);
      }
    }

    if (userId && consumption?.ok) {
      try {
        await refundConsumption(
          userId,
          'ai_review_fix',
          consumption.consumedCredits,
          consumption.consumedFreeExport,
          { reason: 'ai_review_fix_failed', review_id: params.id },
        );
      } catch (refundError) {
        console.error('Failed to refund AI Review fix credits:', refundError);
      }
    }

    console.error('AI Review fix error:', error);
    const mappedError = mapGeminiErrorToResponse(error, 'Could not create the fixed CV.');
    return NextResponse.json({ error: mappedError.message, code: mappedError.code }, { status: mappedError.status });
  }
}

async function generateFixedResume(review: ResumeReviewRow): Promise<NormalizedResume> {
  const prompt = `You are a senior resume editor.
Your ONLY job is to enhance the text content (summary and bullet points) to resolve the findings, and to fix the structure if it's broken.
If skills are hidden inside an 'experience' block, you MUST pull them out into a new 'skills' section.
Do not hallucinate dates or locations. Keep the facts identical.
DO NOT use any markdown formatting (like **bold** or *italic*). Return plain text only.
You must return the JSON object representing the fixed resume. You may add a 'skills' section if it's missing, but otherwise keep the structure similar.

Target:
- field: ${review.field}
- experience level: ${review.experience_level}
- job description: ${review.job_description || 'N/A'}

Deterministic findings:
${review.analysis.findings.map((finding, index) => `${index + 1}. [${finding.severity}] ${finding.title}: ${finding.detail}`).join('\n')}

Normalized resume JSON:
${JSON.stringify(review.normalized_resume)}`;

  const rawText = await generateGeminiText({
    request: prompt,
    modelOrder: ['flash', 'pro'],
    timeoutMs: 60000,
    maxAttemptsPerModel: 2,
  });

  const parsed = parseJsonObject(rawText);
  return sanitizeFixedResume(parsed, review.normalized_resume);
}

function parseJsonObject(rawText: string): unknown {
  const cleaned = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleaned) as unknown;
  } catch {
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace <= firstBrace) {
      throw new Error('AI returned invalid JSON.');
    }

    return JSON.parse(cleaned.slice(firstBrace, lastBrace + 1)) as unknown;
  }
}

function sanitizeFixedResume(candidate: unknown, original: NormalizedResume): NormalizedResume {
  const raw = (candidate && typeof candidate === 'object' && !Array.isArray(candidate) ? candidate : {}) as Partial<NormalizedResume>;
  
  const sections = original.sections.map((origSec, secIndex) => {
    const candSec = (raw.sections || []).find((s: any) => s.concept === origSec.concept) || (raw.sections || [])[secIndex];
    if (!candSec) return origSec;

    const mergedItems = origSec.items.map((origItem, itemIndex) => {
      const candItem = (candSec.items || []).find((i: any) => i.position === origItem.position) || (candSec.items || [])[itemIndex];
      if (!candItem) return origItem;

      const candBullets = typeof candItem.bullets === 'string' && candItem.bullets.trim()
        ? normalizeBullets(sanitizeString(candItem.bullets, '', 2200))
        : origItem.bullets;

      return {
        ...origItem,
        title: sanitizeString(candItem.title, origItem.title, 120),
        subtitle: sanitizeString(candItem.subtitle, origItem.subtitle, 140),
        date: origItem.date,
        location: origItem.location,
        bullets: candBullets,
      };
    });

    return {
      ...origSec,
      title: sanitizeString(candSec.title, origSec.title, 90),
      items: mergedItems,
    };
  });
  
  // Allow the AI to add missing sections (like 'skills') if they were extracted from a broken original structure
  if (Array.isArray(raw.sections)) {
    for (const candSec of raw.sections) {
      if (candSec && typeof candSec === 'object' && candSec.concept && !original.sections.some(s => s.concept === candSec.concept)) {
        sections.push({
          title: sanitizeString(candSec.title, candSec.concept, 90),
          concept: candSec.concept,
          position: sections.length,
          items: (Array.isArray(candSec.items) ? candSec.items : []).map((candItem: any, index: number) => ({
            title: sanitizeString(candItem.title, 'Entry', 120),
            subtitle: sanitizeString(candItem.subtitle, '', 140),
            date: sanitizeString(candItem.date, '', 60),
            location: sanitizeString(candItem.location, '', 60),
            bullets: typeof candItem.bullets === 'string' ? normalizeBullets(sanitizeString(candItem.bullets, '', 2200)) : '',
            position: index,
          }))
        });
      }
    }
  }

  return {
    ...original,
    title: sanitizeString(raw.title, original.title, 140),
    summaryTitle: sanitizeString(raw.summaryTitle, original.summaryTitle || 'Profile Summary', 80),
    summary: sanitizeString(raw.summary, original.summary, 1200),
    sections,
  };
}

function buildCvStateFromNormalizedResume(cvId: string, resume: NormalizedResume, fileName: string): PersistableCvState {
  return {
    id: cvId,
    title: `${sanitizeCvTitle(resume.title || fileName)} - Job-Ready`,
    templateSlug: 'classic-ats',
    fontFamily: 'calibri',
    personalInfo: {
      fullName: resume.personalInfo.fullName,
      jobTitle: '',
      email: resume.personalInfo.email,
      phone: resume.personalInfo.phone,
      location: resume.personalInfo.location,
      linkedin: resume.personalInfo.linkedin,
      portfolio: resume.personalInfo.portfolio,
      github: resume.personalInfo.github,
    },
    summaryTitle: resume.summaryTitle || 'Profile Summary',
    summary: resume.summary || '',
    sections: resume.sections.map((section, sectionIndex) => ({
      id: crypto.randomUUID(),
      title: section.title,
      position: sectionIndex,
      items: section.items.map((item, itemIndex) => ({
        id: crypto.randomUUID(),
        title: item.title,
        subtitle: item.subtitle,
        date: item.date,
        location: item.location,
        bullets: item.bullets,
        position: itemIndex,
      })),
    })),
  };
}

async function persistCvState(
  supabase: ReturnType<typeof createClient>,
  cvState: PersistableCvState,
  atsMeta: ReturnType<typeof calculateKnowledgeBasedAts>,
): Promise<void> {
  const { data: personalInfoSection, error: personalInfoSectionError } = await supabase
    .from('cv_sections')
    .insert({ cv_id: cvState.id, title: '_personal_info', position: -2 })
    .select('id')
    .single();

  if (personalInfoSectionError || !personalInfoSection) {
    throw personalInfoSectionError || new Error('Could not create personal info section.');
  }

  const { error: personalInfoError } = await supabase.from('cv_fields').insert({
    section_id: personalInfoSection.id,
    label: 'personal_info',
    value: JSON.stringify(cvState.personalInfo),
    field_type: 'json',
    position: 0,
  });

  if (personalInfoError) throw personalInfoError;

  const { data: summarySection, error: summarySectionError } = await supabase
    .from('cv_sections')
    .insert({ cv_id: cvState.id, title: '_summary', position: -1 })
    .select('id')
    .single();

  if (summarySectionError || !summarySection) {
    throw summarySectionError || new Error('Could not create summary section.');
  }

  const { error: summaryFieldsError } = await supabase.from('cv_fields').insert([
    {
      section_id: summarySection.id,
      label: 'summary',
      value: cvState.summary,
      field_type: 'text',
      position: 0,
    },
    {
      section_id: summarySection.id,
      label: 'summary_title',
      value: cvState.summaryTitle,
      field_type: 'text',
      position: 1,
    },
    {
      section_id: summarySection.id,
      label: 'font_family',
      value: cvState.fontFamily,
      field_type: 'text',
      position: 2,
    },
    {
      section_id: summarySection.id,
      label: 'template_slug',
      value: cvState.templateSlug,
      field_type: 'text',
      position: 3,
    },
  ]);

  if (summaryFieldsError) throw summaryFieldsError;

  for (const section of cvState.sections) {
    const { data: insertedSection, error: sectionError } = await supabase
      .from('cv_sections')
      .insert({
        cv_id: cvState.id,
        title: section.title,
        position: section.position,
      })
      .select('id')
      .single();

    if (sectionError || !insertedSection) {
      throw sectionError || new Error('Could not create CV section.');
    }

    if (section.items.length === 0) {
      continue;
    }

    const { error: fieldsError } = await supabase.from('cv_fields').insert(
      section.items.map((item) => ({
        section_id: insertedSection.id,
        label: item.title || 'item',
        value: JSON.stringify(item),
        field_type: 'item',
        position: item.position,
      })),
    );

    if (fieldsError) throw fieldsError;
  }

  const { data: atsSection, error: atsSectionError } = await supabase
    .from('cv_sections')
    .insert({ cv_id: cvState.id, title: '_ats_meta', position: -3 })
    .select('id')
    .single();

  if (atsSectionError || !atsSection) {
    throw atsSectionError || new Error('Could not create ATS metadata section.');
  }

  const { error: atsFieldsError } = await supabase.from('cv_fields').insert([
    {
      section_id: atsSection.id,
      label: 'score',
      value: String(atsMeta.score),
      field_type: 'number',
      position: 0,
    },
    {
      section_id: atsSection.id,
      label: 'reason',
      value: atsMeta.reason,
      field_type: 'text',
      position: 1,
    },
    {
      section_id: atsSection.id,
      label: 'signature',
      value: `ai-review:${cvState.id}`,
      field_type: 'text',
      position: 2,
    },
    {
      section_id: atsSection.id,
      label: 'source',
      value: 'ai_review_fix',
      field_type: 'text',
      position: 3,
    },
  ]);

  if (atsFieldsError) throw atsFieldsError;
}

function sanitizeString(value: unknown, fallback: string, maxLength: number): string {
  const normalized = typeof value === 'string' ? value.replace(/[ \t]+/g, ' ').trim() : '';
  const selected = normalized || fallback;
  return selected.length > maxLength ? selected.slice(0, maxLength).trim() : selected;
}

function normalizeBullets(value: string): string {
  return value
    .replace(/\r/g, '\n')
    .split(/\n+/)
    .map((line) => line.replace(/^[-*•]\s*/, '').trim())
    .filter(Boolean)
    .slice(0, 8)
    .map((line) => `- ${line}`)
    .join('\n');
}

function sanitizeCvTitle(value: string): string {
  return value.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 90) || 'Fixed CV';
}
