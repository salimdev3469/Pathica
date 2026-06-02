import { AI_REVIEW_ONTOLOGY, getExperienceLevel, getReviewField, type ExperienceLevelId, type ReviewCategoryId, type ReviewFieldId } from '@/lib/ai-review/ontology';
import type { NormalizedResume, NormalizedResumeItem } from '@/lib/ai-review/extract';

export type ReviewFindingSeverity = 'critical' | 'warning' | 'info';

export type ReviewFinding = {
  id: string;
  category: 'atsStructure' | 'contentEvidence' | 'writingQuality' | 'jobMatch' | 'readiness';
  severity: ReviewFindingSeverity;
  title: string;
  detail: string;
  impact: number;
};

export type ReviewAnalysis = {
  ontologyVersion: string;
  score: number;
  targetScore: number;
  rating: string;
  breakdown: {
    atsStructure: number;
    contentEvidence: number;
    writingQuality: number;
    jobMatch: number;
    readiness: number;
  };
  maxBreakdown: {
    atsStructure: 20;
    contentEvidence: 40;
    writingQuality: 10;
    jobMatch: 25;
    readiness: 5;
  };
  matchedSkills: string[];
  missingSkills: string[];
  findings: ReviewFinding[];
};

type ScoreInput = {
  resume: NormalizedResume;
  categoryId: ReviewCategoryId;
  fieldId: ReviewFieldId;
  experienceLevelId: ExperienceLevelId;
  jobDescription?: string;
};

const quantificationRegex = /(\d+%|\d+\+|[$€£₺]\s?\d+|\b\d{2,}\b)/g;
const firstPersonRegex = /\b(i|me|my|ben|bana|benim)\b/i;

export function scoreResumeReview(input: ScoreInput): ReviewAnalysis {
  const field = getReviewField(input.fieldId) || AI_REVIEW_ONTOLOGY.fields[0];
  const experienceLevel = getExperienceLevel(input.experienceLevelId) || AI_REVIEW_ONTOLOGY.experienceLevels[1];
  const allItems = input.resume.sections.flatMap((section) => section.items);
  const bullets = allItems.flatMap((item) => splitBullets(item.bullets));
  const resumeText = buildResumeText(input.resume);
  const normalizedResumeText = normalizeForMatch(resumeText);
  const jobKeywords = extractKeywords(input.jobDescription || '');
  const fieldSkills = field.skills;
  const matchedSkills = fieldSkills.filter((skill) => normalizedResumeText.includes(normalizeForMatch(skill)));
  const missingSkills = fieldSkills.filter((skill) => !matchedSkills.includes(skill)).slice(0, 8);
  const jobKeywordHits = jobKeywords.filter((keyword) => normalizedResumeText.includes(keyword));
  const quantifiedHits = (resumeText.match(quantificationRegex) || []).length;
  const actionBulletCount = bullets.filter((bullet) => startsWithActionVerb(bullet)).length;
  const weakPhraseCount = AI_REVIEW_ONTOLOGY.weakPhrases.filter((phrase) => normalizedResumeText.includes(normalizeForMatch(phrase))).length;
  const datedItems = allItems.filter((item) => item.date.trim()).length;
  const findings: ReviewFinding[] = [];

  const hasContactEmail = Boolean(input.resume.personalInfo.email);
  const hasContactPhone = Boolean(input.resume.personalInfo.phone);
  const hasExperience = hasSection(input.resume, 'experience');
  const hasEducation = hasSection(input.resume, 'education');
  const hasSkills = hasSection(input.resume, 'skills');
  const hasSummary = input.resume.summary.split(/\s+/).filter(Boolean).length >= 20;

  let atsStructure = 0;
  atsStructure += hasContactEmail ? 4 : addFinding(findings, 'atsStructure', 'critical', 'Email is missing', 'ATS and recruiters need a stable email signal.', 4);
  atsStructure += hasContactPhone ? 3 : addFinding(findings, 'atsStructure', 'warning', 'Phone is missing', 'Add a phone number if you are comfortable being contacted directly.', 3);
  atsStructure += hasExperience ? 5 : addFinding(findings, 'atsStructure', 'critical', 'Experience section is missing', 'Add a clear work experience section with recent roles.', 5);
  atsStructure += hasEducation ? 3 : addFinding(findings, 'atsStructure', 'warning', 'Education section is missing', 'Education is a standard ATS section for most applications.', 3);
  atsStructure += hasSkills ? 3 : addFinding(findings, 'atsStructure', 'warning', 'Skills section is missing', 'Add a concise skills section mapped to the target field.', 3);
  atsStructure += datedItems >= Math.min(2, allItems.length) ? 2 : addFinding(findings, 'atsStructure', 'warning', 'Dates are incomplete', 'Add date ranges for experience and education entries.', 2);

  let contentEvidence = 0;
  contentEvidence += Math.min(12, Math.round((bullets.length / Math.max(1, experienceLevel.minBullets)) * 12));
  contentEvidence += Math.min(12, Math.round((quantifiedHits / Math.max(1, experienceLevel.minQuantified)) * 12));
  contentEvidence += Math.min(8, Math.round((actionBulletCount / Math.max(1, bullets.length)) * 8));
  contentEvidence += hasSummary ? 4 : 0;
  contentEvidence += experienceLevel.leadershipExpected && hasLeadershipSignal(normalizedResumeText) ? 4 : experienceLevel.leadershipExpected ? 0 : 4;
  if (bullets.length < experienceLevel.minBullets) {
    addFinding(findings, 'contentEvidence', 'critical', 'Not enough evidence bullets', `This level expects at least ${experienceLevel.minBullets} concrete bullets.`, 8);
  }
  if (quantifiedHits < experienceLevel.minQuantified) {
    addFinding(findings, 'contentEvidence', 'critical', 'Impact is not quantified enough', `Add at least ${experienceLevel.minQuantified} measurable outcomes for this experience level.`, 8);
  }
  if (actionBulletCount / Math.max(1, bullets.length) < 0.35) {
    addFinding(findings, 'contentEvidence', 'warning', 'Bullets need stronger verbs', 'Start more bullets with clear action verbs such as built, improved, led, or automated.', 4);
  }

  let writingQuality = 10;
  const longBulletCount = bullets.filter((bullet) => bullet.split(/\s+/).length > 34).length;
  if (longBulletCount > 0) {
    writingQuality -= Math.min(4, longBulletCount);
    addFinding(findings, 'writingQuality', 'warning', 'Some bullets are too long', 'Shorten long bullets so they scan cleanly in ATS and recruiter review.', 3);
  }
  if (weakPhraseCount > 0) {
    writingQuality -= Math.min(3, weakPhraseCount);
    addFinding(findings, 'writingQuality', 'warning', 'Weak phrasing found', 'Replace passive phrases with outcome-focused action statements.', 3);
  }
  if (firstPersonRegex.test(resumeText)) {
    writingQuality -= 2;
    addFinding(findings, 'writingQuality', 'info', 'First-person language appears', 'Resume bullets should usually avoid first-person phrasing.', 2);
  }

  let jobMatch = 0;
  jobMatch += Math.min(15, Math.round((matchedSkills.length / Math.max(1, fieldSkills.length)) * 15));
  jobMatch += jobKeywords.length > 0 ? Math.min(10, Math.round((jobKeywordHits.length / Math.max(1, jobKeywords.length)) * 10)) : 7;
  if (missingSkills.length > 0) {
    addFinding(findings, 'jobMatch', 'warning', 'Role keyword coverage is incomplete', `Missing high-signal terms: ${missingSkills.slice(0, 5).join(', ')}.`, 5);
  }
  if (jobKeywords.length > 0 && jobKeywordHits.length / Math.max(1, jobKeywords.length) < 0.35) {
    addFinding(findings, 'jobMatch', 'critical', 'Job description match is low', 'Important terms from the job description are not reflected in the CV.', 6);
  }

  let readiness = 5;
  if (!hasSummary) readiness -= 1;
  if (!hasContactEmail || !hasExperience || !hasSkills) readiness -= 2;
  if (/\[(add|your|replace)|placeholder/i.test(resumeText)) readiness -= 2;
  readiness = clamp(readiness, 0, 5);

  const breakdown = {
    atsStructure: clamp(Math.round(atsStructure), 0, 20),
    contentEvidence: clamp(Math.round(contentEvidence), 0, 40),
    writingQuality: clamp(Math.round(writingQuality), 0, 10),
    jobMatch: clamp(Math.round(jobMatch), 0, 25),
    readiness,
  };
  const score = clamp(Object.values(breakdown).reduce((sum, value) => sum + value, 0), 0, 100);
  const targetScore = clamp(score + 18 + Math.min(12, findings.reduce((sum, finding) => sum + finding.impact, 0)), 0, 95);

  return {
    ontologyVersion: AI_REVIEW_ONTOLOGY.version,
    score,
    targetScore,
    rating: score >= 85 ? 'Hire Zone' : score >= 70 ? 'Competitive' : score >= 55 ? 'Needs Work' : 'Critical',
    breakdown,
    maxBreakdown: AI_REVIEW_ONTOLOGY.weights,
    matchedSkills,
    missingSkills,
    findings: findings.sort((a, b) => b.impact - a.impact || a.id.localeCompare(b.id)).slice(0, 12),
  };
}

function addFinding(
  findings: ReviewFinding[],
  category: ReviewFinding['category'],
  severity: ReviewFindingSeverity,
  title: string,
  detail: string,
  impact: number,
): number {
  findings.push({
    id: `${category}-${normalizeForMatch(title).replace(/\s+/g, '-')}`,
    category,
    severity,
    title,
    detail,
    impact,
  });
  return 0;
}

function hasSection(resume: NormalizedResume, concept: string): boolean {
  return resume.sections.some((section) => section.concept === concept || normalizeForMatch(section.title).includes(concept));
}

function splitBullets(text: string): string[] {
  return text
    .split(/\n+/)
    .flatMap((line) => line.split(/[•●▪◦]/g))
    .map((line) => line.replace(/^[-*]\s*/, '').trim())
    .filter(Boolean);
}

function startsWithActionVerb(bullet: string): boolean {
  const first = normalizeForMatch(bullet).split(' ')[0] || '';
  return AI_REVIEW_ONTOLOGY.actionVerbs.some((verb) => normalizeForMatch(verb).split(' ')[0] === first);
}

function hasLeadershipSignal(text: string): boolean {
  return /\b(led|lead|managed|owned|mentored|architected|strategy|roadmap|yönettim|liderlik)\b/i.test(text);
}

function buildResumeText(resume: NormalizedResume): string {
  return [
    resume.title,
    resume.personalInfo.fullName,
    resume.personalInfo.email,
    resume.personalInfo.phone,
    resume.summary,
    ...resume.sections.flatMap((section) => [
      section.title,
      ...section.items.flatMap((item: NormalizedResumeItem) => [item.title, item.subtitle, item.date, item.location, item.bullets]),
    ]),
  ].join('\n');
}

function extractKeywords(text: string): string[] {
  const stopWords = new Set(['the', 'and', 'for', 'with', 'that', 'this', 'from', 'you', 'your', 'role', 'job', 'work', 'are', 'have', 'will']);
  const counts = new Map<string, number>();
  normalizeForMatch(text)
    .split(/\s+/)
    .filter((token) => token.length >= 3 && !stopWords.has(token))
    .forEach((token) => counts.set(token, (counts.get(token) || 0) + 1));

  return Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, 16)
    .map(([token]) => token);
}

function normalizeForMatch(value: string): string {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9ğüşöçıİ+.#\s-]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}
