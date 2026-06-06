import crypto from 'node:crypto';
import { AI_REVIEW_ONTOLOGY } from '@/lib/ai-review/ontology';
import { generateGeminiText } from '@/lib/gemini';

export type NormalizedResumeItem = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
  position: number;
};

export type NormalizedResumeSection = {
  title: string;
  concept: string;
  position: number;
  items: NormalizedResumeItem[];
};

export type NormalizedResume = {
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
  summary: string;
  sections: NormalizedResumeSection[];
  rawTextHash: string;
  wordCount: number;
};

export type ExtractedResumeText = {
  text: string;
  fileHash: string;
  fileType: string;
};

const PDF_MIME = 'application/pdf';
const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
const TXT_MIME = 'text/plain';

export function isSupportedReviewFile(fileName: string, mimeType: string): boolean {
  const lowerName = fileName.toLowerCase();
  return (
    mimeType === PDF_MIME ||
    mimeType === DOCX_MIME ||
    mimeType === TXT_MIME ||
    lowerName.endsWith('.pdf') ||
    lowerName.endsWith('.docx') ||
    lowerName.endsWith('.txt')
  );
}

export function isUnsupportedLegacyDoc(fileName: string, mimeType: string): boolean {
  return mimeType === 'application/msword' || fileName.toLowerCase().endsWith('.doc');
}

export async function extractTextFromResumeFile(input: {
  buffer: Buffer;
  fileName: string;
  mimeType: string;
}): Promise<ExtractedResumeText> {
  const fileHash = crypto.createHash('sha256').update(input.buffer).digest('hex');
  const lowerName = input.fileName.toLowerCase();
  const fileType =
    input.mimeType === PDF_MIME || lowerName.endsWith('.pdf')
      ? 'pdf'
      : input.mimeType === DOCX_MIME || lowerName.endsWith('.docx')
        ? 'docx'
        : 'txt';

  if (fileType === 'pdf') {
    // @ts-expect-error - bypassing index.js to avoid module.parent bug in Next.js/ESM environments
    const { default: pdfParse } = await import('pdf-parse/lib/pdf-parse.js');
    const parsed = await pdfParse(input.buffer);
    return { text: normalizeExtractedText(parsed.text || ''), fileHash, fileType };
  }

  if (fileType === 'docx') {
    const mammoth = await import('mammoth');
    const parsed = await mammoth.extractRawText({ buffer: input.buffer });
    return { text: normalizeExtractedText(parsed.value || ''), fileHash, fileType };
  }

  return {
    text: normalizeExtractedText(input.buffer.toString('utf8')),
    fileHash,
    fileType,
  };
}

export async function normalizeResumeWithLLM(text: string, fileName = 'Uploaded Resume'): Promise<NormalizedResume> {
  const normalizedText = normalizeExtractedText(text);
  
  const prompt = `You are an expert resume parsing AI. 
I have extracted raw text from a PDF resume. Due to multi-column layouts, the text might be scrambled (a "word salad").
Your job is to semantically understand the text and reconstruct the resume into a perfectly structured JSON object.
Ensure all data is structured correctly. If skills are mixed within experience descriptions, extract them out into the 'skills' array.
DO NOT use markdown formatting like **bold** or *italic* anywhere in the output. Return plain text only.

Follow these strict rules:
1. Identify the sections logically even if the text lines are mixed up.
2. Group all skills under a "skills" section. If there isn't one clearly labeled, but you see a list of technologies, put them in a "skills" section.
3. Group all experiences under "experience", education under "education", projects under "projects".
4. Output ONLY valid JSON matching this exact TypeScript type:
type NormalizedResume = {
  title: string; // The person's full name or "Uploaded Resume"
  personalInfo: {
    fullName: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  summaryTitle: string; // usually "Profile Summary"
  summary: string;
  sections: Array<{
    title: string; // e.g. "Experience", "Skills", "Education"
    concept: string; // MUST be one of: "experience", "education", "skills", "projects", "certifications", "languages"
    position: number; // 0, 1, 2...
    items: Array<{
      title: string; // e.g. Job Title or Degree
      subtitle: string; // e.g. Company Name or University
      date: string;
      location: string;
      bullets: string; // The actual content/bullet points, separated by newlines \n
      position: number;
    }>;
  }>;
};

Raw Resume Text:
${normalizedText}

Return ONLY the raw JSON object. Do not include markdown code blocks (\`\`\`json).`;

  try {
    const responseText = await generateGeminiText({
      request: {
        contents: [{ role: 'user', parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.1 },
      },
      modelOrder: ['flash', 'pro'], // Use flash first for speed and cost
      timeoutMs: 30000,
    });
    
    // Clean potential markdown blocks just in case
    const cleaned = responseText.replace(/^```json\s*/i, '').replace(/```\s*$/i, '').trim();
    const firstBrace = cleaned.indexOf('{');
    const lastBrace = cleaned.lastIndexOf('}');
    if (firstBrace === -1 || lastBrace === -1) {
      throw new Error('No JSON object found in response.');
    }
    const jsonString = cleaned.slice(firstBrace, lastBrace + 1);
    const parsed = JSON.parse(jsonString) as NormalizedResume;
    
    // Fill in required hash and wordcount
    parsed.rawTextHash = crypto.createHash('sha256').update(normalizedText).digest('hex');
    parsed.wordCount = countWords(normalizedText);
    
    return parsed;
  } catch (error) {
    console.error('LLM Parsing failed, falling back to heuristic parsing:', error);
    return normalizeResumeFromText(text, fileName);
  }
}

export function normalizeResumeFromText(text: string, fileName = 'Uploaded Resume'): NormalizedResume {
  const normalizedText = normalizeExtractedText(text);
  const lines = normalizedText
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  const personalInfo = extractPersonalInfo(normalizedText, lines);
  const sectionBlocks = splitIntoSections(lines);
  const summaryBlock = sectionBlocks.find((block) => block.concept === 'summary');
  const contentSections = sectionBlocks.filter((block) => block.concept !== 'summary');
  const sections = contentSections.map((block, index) => ({
    title: block.title,
    concept: block.concept,
    position: index,
    items: parseItems(block.lines, index),
  }));

  return {
    title: personalInfo.fullName || cleanFileTitle(fileName),
    personalInfo,
    summaryTitle: 'Profile Summary',
    summary: summaryBlock ? summaryBlock.lines.join(' ').slice(0, 900) : inferSummary(lines),
    sections: sections.length > 0 ? sections : buildFallbackSections(lines),
    rawTextHash: crypto.createHash('sha256').update(normalizedText).digest('hex'),
    wordCount: countWords(normalizedText),
  };
}

export function normalizeExtractedText(text: string): string {
  return text
    .replace(/\r/g, '\n')
    .replace(/\u0000/g, ' ')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

function extractPersonalInfo(text: string, lines: string[]): NormalizedResume['personalInfo'] {
  const email = text.match(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/i)?.[0] || '';
  const phone = text.match(/(\+?\d[\d\s().-]{7,}\d)/)?.[0]?.replace(/\s+/g, ' ').trim() || '';
  const linkedin = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/[^\s|]+/i)?.[0] || '';
  const github = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[^\s|]+/i)?.[0] || '';
  const portfolio = text.match(/https?:\/\/(?!.*(?:linkedin|github))[^\s|]+/i)?.[0] || '';
  const fullName = inferFullName(lines, email);
  const location = inferLocation(lines);

  return {
    fullName,
    email,
    phone,
    location,
    linkedin,
    portfolio,
    github,
  };
}

function inferFullName(lines: string[], email: string): string {
  const candidates = lines.slice(0, 8).filter((line) => {
    const words = line.split(/\s+/).filter(Boolean);
    return (words.length >= 2 &&
    words.length <= 5 &&
    line.length <= 60 &&
    !line.includes('@') &&
    !/\d/.test(line) && !resolveSectionConcept(line));
  });

  if (candidates[0]) {
    return candidates[0].replace(/[|•].*$/, '').trim();
  }

  return email ? email.split('@')[0].replace(/[._-]+/g, ' ') : '';
}

function inferLocation(lines: string[]): string {
  const topLines = lines.slice(0, 12);
  const locationLine = topLines.find((line) => /istanbul|ankara|izmir|turkey|türkiye|remote|hybrid/i.test(line));
  return locationLine?.split('|').map((part) => part.trim()).find((part) => /istanbul|ankara|izmir|turkey|türkiye|remote|hybrid/i.test(part)) || '';
}

function splitIntoSections(lines: string[]): Array<{ title: string; concept: string; lines: string[] }> {
  const blocks: Array<{ title: string; concept: string; lines: string[] }> = [];
  let current: { title: string; concept: string; lines: string[] } | null = null;

  for (const line of lines) {
    const concept = resolveSectionConcept(line);
    if (concept) {
      if (current) blocks.push(current);
      current = { title: normalizeSectionTitle(line, concept), concept, lines: [] };
      continue;
    }

    if (current) {
      current.lines.push(line);
    }
  }

  if (current) blocks.push(current);
  return blocks.filter((block) => block.lines.length > 0);
}

function resolveSectionConcept(line: string): string | null {
  const normalized = normalizeForMatch(line);
  if (!normalized || normalized.length > 42) return null;

  for (const [concept, aliases] of Object.entries(AI_REVIEW_ONTOLOGY.sectionAliases)) {
    if (aliases.some((alias) => normalizeForMatch(alias) === normalized)) {
      return concept;
    }
  }

  return null;
}

function normalizeSectionTitle(line: string, concept: string): string {
  const labels: Record<string, string> = {
    experience: 'Experience',
    education: 'Education',
    skills: 'Technical Skills',
    projects: 'Projects',
    certifications: 'Certifications',
    languages: 'Languages',
    summary: 'Profile Summary',
  };
  return labels[concept] || line;
}

function parseItems(lines: string[], sectionIndex: number): NormalizedResumeItem[] {
  const items: NormalizedResumeItem[] = [];
  let current: NormalizedResumeItem | null = null;

  const ensureCurrent = () => {
    if (!current) {
      current = {
        title: 'Entry',
        subtitle: '',
        date: '',
        location: '',
        bullets: '',
        position: items.length,
      };
    }
    return current;
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    const bullet = line.match(/^[-*•]\s*(.+)$/)?.[1];
    if (bullet) {
      const item = ensureCurrent();
      item.bullets = appendLine(item.bullets, `- ${bullet.trim()}`);
      continue;
    }

    if (looksLikeItemHeading(line)) {
      if (current) items.push(current);
      current = {
        title: stripDate(line),
        subtitle: '',
        date: extractDate(line),
        location: '',
        bullets: '',
        position: items.length,
      };
      continue;
    }

    const item = ensureCurrent();
    if (!item.subtitle && line.length < 100) {
      item.subtitle = stripDate(line);
      item.date = item.date || extractDate(line);
    } else {
      item.bullets = appendLine(item.bullets, line.startsWith('-') ? line : `- ${line}`);
    }
  }

  if (current) items.push(current);

  return items.length > 0
    ? items.map((item, index) => ({
        ...item,
        title: item.title === 'Entry' ? `Entry ${sectionIndex + 1}.${index + 1}` : item.title,
        position: index,
      }))
    : [
        {
          title: `Entry ${sectionIndex + 1}`,
          subtitle: '',
          date: '',
          location: '',
          bullets: lines.map((line) => `- ${line}`).join('\n'),
          position: 0,
        },
      ];
}

function looksLikeItemHeading(line: string): boolean {
  if (line.length > 90) return false;
  if (/^[-*•]/.test(line)) return false;
  if (/^(gpa|not|note|email|phone)\b/i.test(line)) return false;
  return /(\d{4}|present|devam|company|university|engineer|developer|analyst|manager|uzman|mühendis|muhendis)/i.test(line);
}

function extractDate(line: string): string {
  return line.match(/((?:19|20)\d{2}\s*[-–]\s*(?:(?:19|20)\d{2}|present|devam|now)|(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)[a-z]*\s+(?:19|20)\d{2}[^|]*)/i)?.[0] || '';
}

function stripDate(line: string): string {
  const date = extractDate(line);
  return date ? line.replace(date, '').replace(/[-–|,]+$/, '').trim() : line;
}

function appendLine(value: string, line: string): string {
  return value ? `${value}\n${line}` : line;
}

function inferSummary(lines: string[]): string {
  const body = lines.filter((line) => !resolveSectionConcept(line)).slice(1, 5).join(' ');
  return body.length > 50 ? body.slice(0, 700) : '';
}

function buildFallbackSections(lines: string[]): NormalizedResumeSection[] {
  return [
    {
      title: 'Experience',
      concept: 'experience',
      position: 0,
      items: [
        {
          title: 'Uploaded Resume Content',
          subtitle: '',
          date: '',
          location: '',
          bullets: lines.slice(0, 18).map((line) => `- ${line}`).join('\n'),
          position: 0,
        },
      ],
    },
  ];
}

function cleanFileTitle(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, '').replace(/[_-]+/g, ' ').trim() || 'Uploaded Resume';
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ğüşöçıİ\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function countWords(text: string): number {
  return text.split(/\s+/).filter((token) => token.length > 1).length;
}
