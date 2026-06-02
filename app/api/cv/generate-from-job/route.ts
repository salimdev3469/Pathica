import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { consumeAdvancedAiCredit, refundConsumption } from '@/lib/billing';
import { generateGeminiText, mapGeminiErrorToResponse } from '@/lib/gemini';
import { extractJobKeywords } from '@/lib/job-keywords';
import { createClient } from '@/lib/supabase-server';

type GenerateRequest = {
  jobTitle?: string;
  jobDescription?: string;
};

type RawGeneratedItem = {
  title?: unknown;
  subtitle?: unknown;
  date?: unknown;
  location?: unknown;
  bullets?: unknown;
};

type RawGeneratedSection = {
  title?: unknown;
  items?: unknown;
};

type RawGeneratedCv = {
  title?: unknown;
  summary?: unknown;
  sections?: unknown;
};

type CvItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
  position: number;
};

type CvSection = {
  id: string;
  title: string;
  position: number;
  items: CvItem[];
};

type CvStatePayload = {
  id: string;
  title: string;
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  summaryTitle: string;
  fontFamily: string;
  summary: string;
  sections: CvSection[];
};

type DraftItem = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
};

type DraftSection = {
  title: string;
  items: DraftItem[];
};

const SUMMARY_TITLE = 'Profile Summary';
const DEFAULT_GENERATED_BULLET =
  '- Add factual, role-relevant achievements, tools, and measurable outcomes from your own background.';

export async function POST(req: Request) {
  let userId: string | null = null;
  let consumption: Awaited<ReturnType<typeof consumeAdvancedAiCredit>> | null = null;

  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    userId = user.id;

    const body = (await req.json()) as GenerateRequest;
    const jobTitle = sanitizeField(normalizeText(body.jobTitle), 90);
    const jobDescription = normalizeText(body.jobDescription);
    const extractedKeywords = extractJobKeywords(jobDescription, 24);

    if (!jobDescription || jobDescription.length < 40) {
      return NextResponse.json(
        { error: 'Please provide a more detailed input (at least 40 characters).' },
        { status: 400 },
      );
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'AI service is not configured right now.' }, { status: 503 });
    }

    consumption = await consumeAdvancedAiCredit(user.id, 'generate_from_job', {
      input_length: jobDescription.length,
    });

    if (!consumption.ok && consumption.code === 'INSUFFICIENT_CREDITS') {
      return NextResponse.json(
        {
          error: 'Insufficient credits. Buy a package to use advanced AI tools.',
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
      return NextResponse.json({ error: 'Could not consume AI entitlement.' }, { status: 500 });
    }

    const generated = await generateCvDraft(jobDescription, jobTitle || null, extractedKeywords);
    const cvId = crypto.randomUUID();
    const cvState = buildCvState(cvId, generated, jobDescription, jobTitle || null, extractedKeywords);

    const { data: cvRow, error: cvCreateError } = await supabase
      .from('cvs')
      .insert([
        {
          id: cvId,
          user_id: user.id,
          title: cvState.title,
        },
      ])
      .select('id')
      .single();

    if (cvCreateError || !cvRow) {
      console.error('Failed to create CV row:', cvCreateError);
      throw new Error('Could not create CV shell.');
    }

    return NextResponse.json({ cvId: cvRow.id, cvState }, { status: 200 });
  } catch (error) {
    if (userId && consumption?.ok) {
      try {
        await refundConsumption(
          userId,
          'generate_from_job',
          consumption.consumedCredits,
          consumption.consumedFreeExport,
          { reason: 'ai_generation_failed' },
        );
      } catch (refundError) {
        console.error('Failed to refund generate-from-job credits:', refundError);
      }
    }

    console.error('Generate from job route error:', error);
    const mappedError = mapGeminiErrorToResponse(error, 'Failed to generate CV draft.');
    return NextResponse.json(
      {
        error: mappedError.message,
        code: mappedError.code,
      },
      { status: mappedError.status },
    );
  }
}

async function generateCvDraft(
  jobDescription: string,
  targetRoleTitle: string | null,
  extractedKeywords: string[],
): Promise<RawGeneratedCv | null> {
  const prompt = `You are an expert resume writer.
The user input can be in any language, but your output MUST be in English only.

Goal:
Create a clean, ATS-friendly CV draft framework based on the target job description.

Hard rules:
1) Never invent employers, schools, dates, locations, certifications, metrics, or personal facts.
2) If a field is unknown, use an empty string instead of placeholders.
3) Use the job description only to infer role priorities, tools, responsibilities, and keywords.
4) For unknown candidate history, write neutral editable guidance in bullets instead of fake achievements.
5) Do not use "(Mock)", "Recommendation:", square-bracket placeholders, or fake company/university names.
6) Return ONLY valid JSON.

Output format:
{
  "title": string,
  "summary": string,
  "sections": [
    {
      "title": string,
      "items": [
        {
          "title": string,
          "subtitle": string,
          "date": string,
          "location": string,
          "bullets": string
        }
      ]
    }
  ]
}

Requirements:
- Provide 4 to 6 sections.
- Must include Experience, Education, Projects, and Technical Skills.
- bullets must be newline-separated and start with "- ".
- Keep the draft practical, readable, and easy to personalize.
- Weave important job keywords naturally into the summary and skills section.

Important keywords:
${extractedKeywords.join(', ') || 'N/A'}

User input:
${targetRoleTitle ? `Target role title: ${targetRoleTitle}\n` : ''}${jobDescription}`;

  const text = await generateGeminiText({
    request: prompt,
    modelOrder: ['flash', 'pro'],
    timeoutMs: 20000,
    maxAttemptsPerModel: 2,
  });

  return parseGeneratedJson(text);
}

function parseGeneratedJson(rawText: string): RawGeneratedCv | null {
  const cleanedFence = rawText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();

  try {
    return JSON.parse(cleanedFence) as RawGeneratedCv;
  } catch {
    const firstBrace = cleanedFence.indexOf('{');
    const lastBrace = cleanedFence.lastIndexOf('}');

    if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
      return null;
    }

    const sliced = cleanedFence.slice(firstBrace, lastBrace + 1);
    try {
      return JSON.parse(sliced) as RawGeneratedCv;
    } catch {
      return null;
    }
  }
}

function buildCvState(
  cvId: string,
  generated: RawGeneratedCv | null,
  sourceInput: string,
  targetRoleTitle: string | null,
  extractedKeywords: string[],
): CvStatePayload {
  const fallback = buildGuidedDraft(sourceInput, targetRoleTitle, extractedKeywords);

  const title = sanitizeOptionalField(asString(generated?.title), 90) || fallback.title;
  const summary = sanitizeGeneratedSummary(asString(generated?.summary), fallback.summary);
  const normalizedSections = normalizeSections(generated?.sections);

  const sectionsWithRequired = ensureRequiredSections(
    normalizedSections && normalizedSections.length > 0 ? normalizedSections : fallback.sections,
    fallback.sections,
  );

  const sections: CvSection[] = sectionsWithRequired.slice(0, 6).map((section, sectionIndex) => ({
    id: crypto.randomUUID(),
    title: section.title,
    position: sectionIndex,
    items: section.items.slice(0, 8).map((item, itemIndex) => ({
      id: crypto.randomUUID(),
      title: item.title,
      subtitle: item.subtitle,
      date: item.date,
      location: item.location,
      bullets: item.bullets,
      position: itemIndex,
    })),
  }));

  return {
    id: cvId,
    title,
    personalInfo: {
      fullName: '',
      email: '',
      phone: '',
      location: '',
      linkedin: '',
      portfolio: '',
      github: '',
    },
    summaryTitle: SUMMARY_TITLE,
    fontFamily: 'calibri',
    summary,
    sections,
  };
}

function normalizeSections(input: unknown): DraftSection[] | null {
  if (!Array.isArray(input)) {
    return null;
  }

  const sections = input
    .map((rawSection) => {
      const section = rawSection as RawGeneratedSection;
      const title = sanitizeOptionalField(asString(section.title), 70) || 'Additional Section';
      const rawItems = Array.isArray(section.items) ? section.items : [];

      const items = rawItems
        .map((rawItem) => {
          const item = rawItem as RawGeneratedItem;

          const title = sanitizeOptionalField(asString(item.title), 90);
          const subtitle = sanitizeOptionalField(asString(item.subtitle), 130);
          const date = sanitizeOptionalField(asString(item.date), 50);
          const location = sanitizeOptionalField(asString(item.location), 60);
          const bullets = normalizeBullets(item.bullets);

          return { title, subtitle, date, location, bullets };
        })
        .filter(
          (item) =>
            item.title.length > 0 ||
            item.subtitle.length > 0 ||
            item.date.length > 0 ||
            item.location.length > 0 ||
            item.bullets.length > 0,
        );

      if (items.length === 0) {
        return null;
      }

      return { title, items };
    })
    .filter(Boolean) as DraftSection[];

  return sections.length > 0 ? sections : null;
}

function ensureRequiredSections(input: DraftSection[], fallbackSections: DraftSection[]): DraftSection[] {
  const sections = [...input];

  const hasSection = (pattern: RegExp) => sections.some((section) => pattern.test(section.title));

  const fallbackExperience =
    fallbackSections.find((section) => /experience|employment|work history/i.test(section.title)) ||
    fallbackSections[0];
  const fallbackEducation =
    fallbackSections.find((section) => /education|academic/i.test(section.title)) || fallbackSections[1];
  const fallbackProjects =
    fallbackSections.find((section) => /projects?/i.test(section.title)) || fallbackSections[2];
  const fallbackSkills =
    fallbackSections.find((section) => /skills?|technical/i.test(section.title)) || fallbackSections[3];

  if (!hasSection(/experience|employment|work history/i)) {
    sections.unshift(fallbackExperience);
  }

  if (!hasSection(/education|academic/i)) {
    sections.push(fallbackEducation);
  }

  if (!hasSection(/projects?/i)) {
    sections.push(fallbackProjects);
  }

  if (!hasSection(/skills?|technical/i)) {
    sections.push(fallbackSkills);
  }

  return sections;
}

function buildGuidedDraft(
  sourceInput: string,
  targetRoleTitle?: string | null,
  extractedKeywords: string[] = [],
): {
  title: string;
  summary: string;
  sections: DraftSection[];
} {
  const roleHint = targetRoleTitle && targetRoleTitle.trim().length > 2 ? targetRoleTitle.trim() : extractRoleHint(sourceInput);
  const keywordList = (extractedKeywords.length > 0 ? extractedKeywords : extractKeywords(sourceInput)).slice(0, 12);
  const summaryKeywords = keywordList.slice(0, 5);
  const summaryKeywordText =
    summaryKeywords.length > 0 ? summaryKeywords.join(', ') : 'the responsibilities and tools in the job description';
  const emphasisText = keywordList.length > 0 ? keywordList.slice(0, 4).join(', ') : 'the highest-priority job requirements';

  return {
    title: `${roleHint} Resume`,
    summary: `Targeting ${roleHint} roles with emphasis on ${summaryKeywordText}. Personalize this draft with your actual experience, tools, dates, and measurable results before applying.`,
    sections: [
      {
        title: 'Experience',
        items: [
          {
            title: 'Relevant Experience',
            subtitle: '',
            date: '',
            location: '',
            bullets: `- Highlight roles where you used ${emphasisText}.\n- Quantify results with real metrics such as performance, reliability, delivery speed, revenue, or user growth.\n- Keep every bullet factual and based on work you actually completed.`,
          },
        ],
      },
      {
        title: 'Education',
        items: [
          {
            title: 'Education',
            subtitle: '',
            date: '',
            location: '',
            bullets: `- Add your degree, institution, and dates only if they are accurate and relevant to ${roleHint} roles.\n- Include coursework, thesis, or academic projects only when they strengthen your fit for the job requirements.`,
          },
        ],
      },
      {
        title: 'Projects',
        items: [
          {
            title: 'Relevant Projects',
            subtitle: '',
            date: '',
            location: '',
            bullets: `- Add one or two projects that demonstrate ${emphasisText}.\n- Mention the stack, scope, users, and measurable outcomes using your real project details.`,
          },
        ],
      },
      {
        title: 'Technical Skills',
        items: [
          {
            title: 'Core Skills',
            subtitle: '',
            date: '',
            location: '',
            bullets:
              `- ${keywordList.length > 0 ? keywordList.join(', ') : 'Add the main tools, frameworks, languages, and platforms required for the role.'}\n- Remove any skill that you cannot support with real work, project, or academic experience.`,
          },
        ],
      },
    ],
  };
}

function normalizeBullets(value: unknown): string {
  const rawLines = Array.isArray(value) ? value.map((v) => asString(v)) : asString(value).split(/\n+/);

  const normalizedLines = rawLines
    .map((line) => line.replace(/^[-*\u2022]\s*/, '').trim())
    .map(stripMockMarkers)
    .map((line) => sanitizeField(line, 200))
    .filter((line) => !isDiscardableBulletLine(line))
    .filter(Boolean)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`));

  if (normalizedLines.length === 0) {
    return DEFAULT_GENERATED_BULLET;
  }

  return normalizedLines.slice(0, 5).join('\n');
}

function extractRoleHint(input: string): string {
  const firstMeaningful = input
    .split(/[\n.]/)
    .map((line) => line.trim())
    .find((line) => line.length > 0);

  if (!firstMeaningful) {
    return 'Target Role';
  }

  const clipped = firstMeaningful.slice(0, 60).trim();
  return clipped.length >= 8 ? clipped : 'Target Role';
}

function extractKeywords(text: string): string[] {
  const words = text
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşüâîû+.#\s-]/gi, ' ')
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length >= 3);

  const stopWords = new Set([
    'the',
    'and',
    'for',
    'with',
    'that',
    'this',
    'from',
    'your',
    'you',
    'job',
    'role',
    'work',
    'experience',
    'years',
    'required',
    'preferred',
    'will',
    'have',
    'has',
    'are',
  ]);

  const counts = new Map<string, number>();
  for (const word of words) {
    if (!stopWords.has(word)) {
      counts.set(word, (counts.get(word) || 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([word]) => word);
}

function asString(value: unknown): string {
  return typeof value === 'string' ? value : '';
}

function sanitizeField(value: string, maxLength: number): string {
  const normalized = normalizeText(value);
  if (!normalized) {
    return '';
  }

  return normalized.length > maxLength ? normalized.slice(0, maxLength) : normalized;
}

function normalizeText(value: string | undefined): string {
  if (!value) {
    return '';
  }

  return value.replace(/\s+/g, ' ').trim();
}

function sanitizeOptionalField(value: string, maxLength: number): string {
  const cleaned = sanitizeField(stripMockMarkers(value), maxLength);
  if (!cleaned) {
    return '';
  }

  return isPlaceholderLikeValue(cleaned) ? '' : cleaned;
}

function sanitizeGeneratedSummary(value: string, fallback: string): string {
  const cleaned = sanitizeField(
    stripMockMarkers(value).replace(/recommendation\s*:[^.]*\.?/gi, ''),
    900,
  );

  return cleaned || fallback;
}

function stripMockMarkers(value: string): string {
  return value.replace(/\(mock\)/gi, '').replace(/\bmock\b/gi, '').replace(/\s+/g, ' ').trim();
}

function isPlaceholderLikeValue(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    /^\[.*\]$/.test(normalized) ||
    normalized.startsWith('add ') ||
    normalized.startsWith('replace ') ||
    normalized.startsWith('enter ') ||
    normalized.startsWith('your ')
  );
}

function isDiscardableBulletLine(value: string): boolean {
  const normalized = value.trim().toLowerCase();
  return (
    normalized.length === 0 ||
    normalized.includes('recommendation:') ||
    normalized.includes('(mock)') ||
    /^\[.*\]$/.test(normalized)
  );
}
