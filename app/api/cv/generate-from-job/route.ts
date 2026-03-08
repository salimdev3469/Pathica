import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { flashModel } from '@/lib/gemini';
import { createClient } from '@/lib/supabase-server';

type GenerateRequest = {
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

const GENERIC_RECOMMENDATION =
  '- Recommendation: Replace mock values with your real details before applying.';

export async function POST(req: Request) {
  try {
    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = (await req.json()) as GenerateRequest;
    const jobDescription = normalizeText(body.jobDescription);

    if (!jobDescription || jobDescription.length < 40) {
      return NextResponse.json(
        { error: 'Please provide a more detailed input (at least 40 characters).' },
        { status: 400 },
      );
    }

    const { data: cvRow, error: cvCreateError } = await supabase
      .from('cvs')
      .insert([
        {
          id: crypto.randomUUID(),
          user_id: user.id,
          title: 'AI Generated CV',
        },
      ])
      .select('id')
      .single();

    if (cvCreateError || !cvRow) {
      console.error('Failed to create CV row:', cvCreateError);
      return NextResponse.json({ error: 'Could not create CV shell.' }, { status: 500 });
    }

    const generated = await generateCvDraft(jobDescription);
    const cvState = buildCvState(cvRow.id, generated, jobDescription);

    return NextResponse.json({ cvId: cvRow.id, cvState }, { status: 200 });
  } catch (error) {
    console.error('Generate from job route error:', error);
    return NextResponse.json({ error: 'Failed to generate CV draft.' }, { status: 500 });
  }
}

async function generateCvDraft(jobDescription: string): Promise<RawGeneratedCv | null> {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return null;
    }

    const prompt = `You are an expert resume writer.
The user input can be in any language, but your output MUST be in English only.

Goal:
Create an editable resume draft from the user's input.

Hard rules:
1) Use user-provided facts when available (company names, schools, job titles, dates, tools).
2) If details are missing, add realistic MOCK suggestions marked with "(Mock)".
3) For every item, include at least one bullet starting with "Recommendation:" that tells the user what to replace or improve.
4) Do not claim unknown personal facts as real.
5) Keep everything in English, even if the input is not English.

Output format:
Return ONLY valid JSON and match this exact schema:
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
- Keep content dense and editable.

User input:
${jobDescription}`;

    const generationPromise = flashModel.generateContent(prompt);
    const timeoutPromise = new Promise<null>((resolve) => {
      setTimeout(() => resolve(null), 18000);
    });

    const result = await Promise.race([generationPromise, timeoutPromise]);
    if (result === null) {
      return null;
    }

    const text = result.response.text();
    const parsed = parseGeneratedJson(text);

    return parsed;
  } catch (error) {
    console.error('Gemini draft generation failed:', error);
    return null;
  }
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

function buildCvState(cvId: string, generated: RawGeneratedCv | null, sourceInput: string): CvStatePayload {
  const fallback = buildFallbackDraft(sourceInput);

  const title = sanitizeField(asString(generated?.title), 90) || fallback.title;
  const summary = sanitizeField(asString(generated?.summary), 900) || fallback.summary;
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
      bullets: ensureRecommendationLine(item.bullets),
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
      const title = sanitizeField(asString(section.title), 70) || 'Additional Section';
      const rawItems = Array.isArray(section.items) ? section.items : [];

      const items = rawItems
        .map((rawItem) => {
          const item = rawItem as RawGeneratedItem;

          const title = sanitizeField(asString(item.title), 90) || 'Editable Entry';
          const subtitle = sanitizeField(asString(item.subtitle), 130);
          const date = sanitizeField(asString(item.date), 50) || '[Add date range]';
          const location = sanitizeField(asString(item.location), 60) || '[Add location]';
          const bullets = normalizeBullets(item.bullets);

          return { title, subtitle, date, location, bullets };
        })
        .filter((item) => item.title.length > 0 || item.bullets.length > 0);

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

function buildFallbackDraft(sourceInput: string): {
  title: string;
  summary: string;
  sections: DraftSection[];
} {
  const roleHint = extractRoleHint(sourceInput);
  const keywordList = extractKeywords(sourceInput).slice(0, 12);

  return {
    title: `${roleHint} Resume`,
    summary:
      'AI-generated English draft based on your input. This draft uses provided facts when possible and includes mock suggestions for missing details. Update every placeholder and every Recommendation bullet before using the resume.',
    sections: [
      {
        title: 'Experience',
        items: [
          {
            title: 'Software Engineer (Mock)',
            subtitle: 'Example Company (Mock)',
            date: '2022 - Present',
            location: '[City, Country]',
            bullets:
              '- Built and maintained role-aligned features for web products.\n- Improved performance and delivery speed with measurable engineering changes.\n- Collaborated with cross-functional teams to prioritize high-impact tasks.\n- Recommendation: Replace company name, role scope, and metrics with your real experience.',
          },
        ],
      },
      {
        title: 'Education',
        items: [
          {
            title: 'B.Sc. in Computer Science (Mock)',
            subtitle: 'Example University (Mock)',
            date: '[Add start - end dates]',
            location: '[City, Country]',
            bullets:
              '- Relevant coursework: Data Structures, Databases, Software Engineering.\n- Capstone focus: Building practical systems for real-world use cases.\n- Recommendation: Replace degree, institution, dates, and coursework with your real education details.',
          },
        ],
      },
      {
        title: 'Projects',
        items: [
          {
            title: 'Role-Aligned Project (Mock)',
            subtitle: 'React, Next.js, Node.js',
            date: '[Add project dates]',
            location: '',
            bullets:
              '- Developed an end-to-end project relevant to the target role.\n- Added measurable outcomes such as reduced latency or improved conversion.\n- Recommendation: Replace project scope, stack, and impact metrics with your real project data.',
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
              `- ${keywordList.length > 0 ? keywordList.join(', ') : 'JavaScript, TypeScript, React, Node.js, SQL'}\n- Recommendation: Keep only skills you can confidently defend in interviews.`,
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
    .map((line) => sanitizeField(line, 200))
    .filter(Boolean)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`));

  if (normalizedLines.length === 0) {
    return `- Add role-aligned details from your background.\n${GENERIC_RECOMMENDATION}`;
  }

  return ensureRecommendationLine(normalizedLines.slice(0, 5).join('\n'));
}

function ensureRecommendationLine(bullets: string): string {
  const lines = bullets
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => (line.startsWith('-') ? line : `- ${line}`));

  const hasRecommendation = lines.some((line) => /recommendation\s*:/i.test(line));
  if (!hasRecommendation) {
    lines.push(GENERIC_RECOMMENDATION);
  }

  return lines.join('\n');
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
    .replace(/[^\p{L}\p{N}+.#\s-]/gu, ' ')
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

  return [...counts.entries()]
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