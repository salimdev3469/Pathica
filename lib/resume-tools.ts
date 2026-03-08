const STOP_WORDS = new Set([
  'the',
  'and',
  'for',
  'with',
  'from',
  'that',
  'this',
  'you',
  'your',
  'have',
  'will',
  'are',
  'job',
  'role',
  'using',
  'into',
  'our',
  'its',
  'their',
  'about',
  'they',
  'them',
  'was',
  'were',
  'has',
  'had',
]);

export interface ResumeToolScore {
  score: number;
  readabilityScore: number;
  structureScore: number;
  keywordScore: number;
  matchedKeywords: string[];
  missingKeywords: string[];
  suggestions: string[];
}

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, ' ');
}

export function extractKeywords(text: string): string[] {
  const freq = new Map<string, number>();
  const words = normalize(text).split(/\s+/).filter(Boolean);

  for (const word of words) {
    if (word.length < 3 || STOP_WORDS.has(word)) {
      continue;
    }

    freq.set(word, (freq.get(word) || 0) + 1);
  }

  return [...freq.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 40)
    .map(([word]) => word);
}

function scoreReadability(resumeText: string): number {
  const lines = resumeText.split(/\n+/).map((line) => line.trim()).filter(Boolean);
  if (lines.length === 0) {
    return 0;
  }

  const avgLineLength = lines.reduce((sum, line) => sum + line.length, 0) / lines.length;
  const compactnessPenalty = avgLineLength > 140 ? 20 : avgLineLength > 110 ? 10 : 0;

  return Math.max(0, 100 - compactnessPenalty);
}

function scoreStructure(resumeText: string): { score: number; missingSections: string[] } {
  const requiredSections = ['summary', 'experience', 'education', 'skills'];
  const content = normalize(resumeText);
  const missingSections = requiredSections.filter((section) => !content.includes(section));
  const score = Math.max(0, 100 - missingSections.length * 25);

  return { score, missingSections };
}

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function calculateResumeToolScore(resumeText: string, jobDescriptionText: string): ResumeToolScore {
  const resumeKeywords = extractKeywords(resumeText);
  const jdKeywords = extractKeywords(jobDescriptionText);

  const resumeSet = new Set(resumeKeywords);
  const matchedKeywords = jdKeywords.filter((keyword) => resumeSet.has(keyword));
  const missingKeywords = jdKeywords.filter((keyword) => !resumeSet.has(keyword)).slice(0, 15);

  const readabilityScore = scoreReadability(resumeText);
  const { score: structureScore, missingSections } = scoreStructure(resumeText);

  const keywordCoverage = jdKeywords.length > 0 ? (matchedKeywords.length / jdKeywords.length) * 100 : 0;
  const keywordScore = clampScore(keywordCoverage);

  const score = clampScore(readabilityScore * 0.25 + structureScore * 0.35 + keywordScore * 0.4);

  const suggestions: string[] = [];

  if (missingSections.length > 0) {
    suggestions.push(`Add clear sections: ${missingSections.join(', ')}.`);
  }

  if (missingKeywords.length > 0) {
    suggestions.push('Include more role-specific keywords from the job description.');
  }

  if (readabilityScore < 80) {
    suggestions.push('Shorten long lines and use cleaner bullet points for readability.');
  }

  if (suggestions.length === 0) {
    suggestions.push('Great baseline. Keep tailoring bullet points to each role.');
  }

  return {
    score,
    readabilityScore,
    structureScore,
    keywordScore,
    matchedKeywords,
    missingKeywords,
    suggestions,
  };
}
