import { NextResponse } from 'next/server';
import { AI_REVIEW_ONTOLOGY, getExperienceLevel, getReviewField, type ReviewCategoryId } from '@/lib/ai-review/ontology';
import {
  extractTextFromResumeFile,
  normalizeResumeWithLLM,
  isSupportedReviewFile,
  isUnsupportedLegacyDoc,
} from '@/lib/ai-review/extract';
import { serializeReviewForClient } from '@/lib/ai-review/report';
import { scoreResumeReview } from '@/lib/ai-review/score';
import { createClient } from '@/lib/supabase-server';
import { isMissingTableInSchemaCache } from '@/lib/supabase-errors';
import crypto from 'node:crypto';

export const runtime = 'nodejs';

const MAX_UPLOAD_BYTES = 10 * 1024 * 1024;
const MIN_EXTRACTED_CHARS = 80;

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await req.formData();
    const file = formData.get('file');
    const category = normalizeField(formData.get('category'));
    const field = normalizeField(formData.get('field'));
    const experienceLevel = normalizeField(formData.get('experienceLevel'));
    const jobDescription = normalizeMultiline(formData.get('jobDescription')).slice(0, 6000);

    if (!(file instanceof File)) {
      return NextResponse.json({ error: 'Please upload a resume file.' }, { status: 400 });
    }

    if (file.size <= 0) {
      return NextResponse.json({ error: 'Uploaded file is empty.' }, { status: 400 });
    }

    if (file.size > MAX_UPLOAD_BYTES) {
      return NextResponse.json({ error: 'Upload limit is 10MB.' }, { status: 413 });
    }

    if (isUnsupportedLegacyDoc(file.name, file.type)) {
      return NextResponse.json(
        { error: '.doc files are not supported in AI Review v1. Please upload PDF, DOCX, or TXT.' },
        { status: 415 },
      );
    }

    if (!isSupportedReviewFile(file.name, file.type)) {
      return NextResponse.json({ error: 'Only PDF, DOCX, and TXT files are supported.' }, { status: 415 });
    }

    const categoryExists = AI_REVIEW_ONTOLOGY.categories.some((candidate) => candidate.id === category);
    const fieldConfig = getReviewField(field);
    const experienceConfig = getExperienceLevel(experienceLevel);

    if (!categoryExists || !fieldConfig || !experienceConfig) {
      return NextResponse.json({ error: 'Invalid review category, field, or experience level.' }, { status: 400 });
    }

    if (fieldConfig.categoryId !== category && !AI_REVIEW_ONTOLOGY.categories.find((item) => item.id === category)?.fields.includes(fieldConfig.id)) {
      return NextResponse.json({ error: 'Selected field does not belong to the selected category.' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const extracted = await extractTextFromResumeFile({
      buffer,
      fileName: file.name,
      mimeType: file.type,
    });

    if (extracted.text.length < MIN_EXTRACTED_CHARS) {
      return NextResponse.json(
        { error: 'Could not extract enough resume text from this file. Please upload a text-based PDF, DOCX, or TXT file.' },
        { status: 422 },
      );
    }

    const normalizedResume = await normalizeResumeWithLLM(extracted.text, file.name);
    const analysis = scoreResumeReview({
      resume: normalizedResume,
      categoryId: category as ReviewCategoryId,
      fieldId: fieldConfig.id,
      experienceLevelId: experienceConfig.id,
      jobDescription,
    });

    const fileId = crypto.randomUUID();
    const filePath = `${user.id}/${fileId}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_').toLowerCase()}`;
    const { error: uploadError } = await supabase.storage
      .from('resume_reviews_files')
      .upload(filePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.warn('Could not upload CV to storage:', uploadError);
      // We proceed even if storage fails, but without file_path
    }

    const { data: inserted, error } = await supabase
      .from('resume_reviews')
      .insert({
        user_id: user.id,
        file_name: file.name.slice(0, 180),
        file_type: extracted.fileType,
        file_hash: extracted.fileHash,
        category,
        field: fieldConfig.id,
        experience_level: experienceConfig.id,
        job_description: jobDescription || null,
        file_path: uploadError ? null : filePath,
        normalized_resume: normalizedResume,
        analysis,
        score: analysis.score,
        ontology_version: analysis.ontologyVersion,
      })
      .select(
        'id,file_name,file_type,category,field,experience_level,job_description,file_path,normalized_resume,analysis,score,ontology_version,created_at',
      )
      .single();

    if (error || !inserted) {
      if (isMissingTableInSchemaCache(error, 'resume_reviews')) {
        return NextResponse.json(
          {
            error: 'AI Review database schema is missing. Please apply supabase/schema.sql before analyzing resumes.',
            code: 'DATABASE_SCHEMA_MISSING',
          },
          { status: 503 },
        );
      }

      console.error('AI Review insert error:', error);
      return NextResponse.json({ error: 'Could not save AI Review result.' }, { status: 500 });
    }

    return NextResponse.json({
      review: serializeReviewForClient({
        id: inserted.id,
        fileName: inserted.file_name,
        fileType: inserted.file_type,
        category: inserted.category,
        field: inserted.field,
        experienceLevel: inserted.experience_level,
        jobDescription: inserted.job_description || '',
        filePath: inserted.file_path,
        normalizedResume: inserted.normalized_resume,
        analysis: inserted.analysis,
        score: inserted.score,
        ontologyVersion: inserted.ontology_version,
        createdAt: inserted.created_at,
      }),
    });
  } catch (error) {
    console.error('AI Review analyze error:', error);
    return NextResponse.json({ error: 'Could not analyze this resume.' }, { status: 500 });
  }
}

function normalizeField(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.trim() : '';
}

function normalizeMultiline(value: FormDataEntryValue | null): string {
  return typeof value === 'string' ? value.replace(/\r/g, '\n').replace(/[ \t]+/g, ' ').trim() : '';
}
