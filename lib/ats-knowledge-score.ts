import { ATS_ONTOLOGY, AtsContactField, AtsSectionConcept, AtsSectionConceptId } from '@/lib/ats-ontology';

type ScoreItem = {
    title?: string;
    subtitle?: string;
    date?: string;
    location?: string;
    bullets?: string;
    position?: number;
};

type ScoreSection = {
    title?: string;
    position?: number;
    items?: ScoreItem[];
};

type ScorePersonalInfo = Partial<Record<AtsContactField, string>>;

export type KnowledgeScoreInput = {
    title?: string;
    summary?: string;
    personalInfo?: ScorePersonalInfo;
    sections?: ScoreSection[];
};

export type KnowledgeScoreResult = {
    score: number;
    reason: string;
    ontologyVersion: string;
    matchedSections: AtsSectionConceptId[];
    missingRequiredSections: AtsSectionConceptId[];
};

const actionVerbSet = new Set(ATS_ONTOLOGY.actionVerbs.map((verb) => normalizeText(verb)));
const quantificationRegex = /(\d+%|\d+\+|[$€£₺]\s?\d+|\b\d{2,}\b)/g;
const normalizedSectionAliases = ATS_ONTOLOGY.sections.map((section) => ({
    ...section,
    normalizedAliases: section.aliases.map((alias) => normalizeText(alias)),
}));

export function calculateKnowledgeBasedAts(input: KnowledgeScoreInput): KnowledgeScoreResult {
    const orderedSections = (Array.isArray(input.sections) ? input.sections : [])
        .map((section, index) => ({
            ...section,
            items: Array.isArray(section.items) ? section.items : [],
            position: typeof section.position === 'number' ? section.position : index,
        }))
        .sort((a, b) => a.position - b.position);

    const sectionMatches = orderedSections.map((section) => ({
        section,
        concept: resolveSectionConcept(section.title),
    }));

    const matchedSectionSet = new Set<AtsSectionConceptId>();
    for (const match of sectionMatches) {
        if (match.concept) {
            matchedSectionSet.add(match.concept.id);
        }
    }

    let structureScore = 0;
    const missingRequiredSections: AtsSectionConceptId[] = [];
    for (const section of ATS_ONTOLOGY.sections) {
        if (matchedSectionSet.has(section.id)) {
            structureScore += section.weight;
        } else if (section.required) {
            missingRequiredSections.push(section.id);
        }
    }

    const personalInfo = input.personalInfo || {};
    let contactScore = 0;
    for (const contact of ATS_ONTOLOGY.contacts) {
        if (normalizeText(personalInfo[contact.field])) {
            contactScore += contact.weight;
        }
    }

    const summaryWordCount = countWords(input.summary || '');
    const summaryScore = scoreByThreshold(summaryWordCount, [
        { min: 40, score: 8 },
        { min: 20, score: 6 },
        { min: 10, score: 3 },
        { min: 1, score: 1 },
    ]);

    let bulletCount = 0;
    let actionBulletCount = 0;
    let quantifiedHits = 0;
    let datedItems = 0;
    let totalDateRelevantItems = 0;

    for (const match of sectionMatches) {
        for (const item of match.section.items) {
            const bulletLines = splitBullets(item.bullets || '');
            bulletCount += bulletLines.length;

            for (const bullet of bulletLines) {
                const firstToken = normalizeText(bullet).split(' ')[0] || '';
                if (firstToken && actionVerbSet.has(firstToken)) {
                    actionBulletCount += 1;
                }
            }

            const itemText = [item.title, item.subtitle, item.bullets].map((value) => normalizeText(value)).join(' ');
            quantifiedHits += (itemText.match(quantificationRegex) || []).length;

            if (match.concept?.expectsDates) {
                totalDateRelevantItems += 1;
                if (normalizeText(item.date)) {
                    datedItems += 1;
                }
            }
        }
    }

    const bulletScore = scoreByThreshold(bulletCount, [
        { min: 20, score: 10 },
        { min: 12, score: 8 },
        { min: 6, score: 5 },
        { min: 3, score: 3 },
    ]);

    const quantifiedScore = scoreByThreshold(quantifiedHits, [
        { min: 8, score: 10 },
        { min: 5, score: 8 },
        { min: 3, score: 6 },
        { min: 1, score: 3 },
    ]);

    const actionRatio = bulletCount > 0 ? actionBulletCount / bulletCount : 0;
    const actionScore = scoreByThreshold(actionRatio, [
        { min: 0.75, score: 6 },
        { min: 0.5, score: 4 },
        { min: 0.3, score: 2 },
        { min: 0.1, score: 1 },
    ]);

    const dateRatio = totalDateRelevantItems > 0 ? datedItems / totalDateRelevantItems : 0;
    const dateScore = scoreByThreshold(dateRatio, [
        { min: 0.8, score: 4 },
        { min: 0.5, score: 2 },
        { min: 0.2, score: 1 },
    ]);

    const contentScore = summaryScore + bulletScore + quantifiedScore + actionScore + dateScore;
    const totalScore = clampScore(contactScore + structureScore + contentScore);
    const reason = buildReason({
        score: totalScore,
        missingRequiredSections,
        summaryWordCount,
        bulletCount,
        quantifiedHits,
        actionRatio,
        dateRatio,
        totalDateRelevantItems,
    });

    return {
        score: totalScore,
        reason,
        ontologyVersion: ATS_ONTOLOGY.version,
        matchedSections: Array.from(matchedSectionSet),
        missingRequiredSections,
    };
}

function resolveSectionConcept(title: string | undefined): AtsSectionConcept | null {
    const normalizedTitle = normalizeText(title);
    if (!normalizedTitle) {
        return null;
    }

    for (const concept of normalizedSectionAliases) {
        if (concept.normalizedAliases.some((alias) => hasTokenizedMatch(normalizedTitle, alias))) {
            return concept;
        }
    }

    return null;
}

function splitBullets(text: string): string[] {
    if (!text) {
        return [];
    }

    return text
        .replace(/\r/g, '\n')
        .split(/\n+/)
        .flatMap((line) => line.split(/[•●▪◦]/g))
        .map((line) => line.trim())
        .filter(Boolean);
}

function scoreByThreshold(value: number, thresholds: Array<{ min: number; score: number }>): number {
    for (const threshold of thresholds) {
        if (value >= threshold.min) {
            return threshold.score;
        }
    }

    return 0;
}

function buildReason(input: {
    score: number;
    missingRequiredSections: AtsSectionConceptId[];
    summaryWordCount: number;
    bulletCount: number;
    quantifiedHits: number;
    actionRatio: number;
    dateRatio: number;
    totalDateRelevantItems: number;
}): string {
    const reasonParts: string[] = [];

    if (input.missingRequiredSections.length > 0) {
        const labels = input.missingRequiredSections.map((id) => sectionLabel(id)).join(', ');
        reasonParts.push(`Missing core sections: ${labels}.`);
    }

    if (input.summaryWordCount < 20) {
        reasonParts.push('Expand summary with role-specific keywords.');
    }

    if (input.bulletCount < 6) {
        reasonParts.push('Add more concise bullet points for recent roles.');
    }

    if (input.quantifiedHits < 3) {
        reasonParts.push('Include measurable outcomes (%/numbers) in achievements.');
    }

    if (input.actionRatio < 0.3) {
        reasonParts.push('Start bullet points with stronger action verbs.');
    }

    if (input.totalDateRelevantItems > 0 && input.dateRatio < 0.5) {
        reasonParts.push('Add clear dates for experience and education entries.');
    }

    if (reasonParts.length === 0) {
        if (input.score >= 85) {
            return 'Strong ATS baseline: complete structure, quantified impact, and clear role language.';
        }
        return 'ATS baseline is solid; improve role-specific keywords to increase competitiveness.';
    }

    return joinReasonPartsSafely(reasonParts);
}

function joinReasonPartsSafely(parts: string[]): string {
    const MAX_REASON_LENGTH = 260;
    const selectedParts: string[] = [];
    let totalLength = 0;

    for (const part of parts) {
        const normalizedPart = part.trim();
        if (!normalizedPart) {
            continue;
        }

        const additionalLength = selectedParts.length === 0 ? normalizedPart.length : normalizedPart.length + 1;
        if (selectedParts.length > 0 && totalLength + additionalLength > MAX_REASON_LENGTH) {
            break;
        }

        selectedParts.push(normalizedPart);
        totalLength += additionalLength;
    }

    if (selectedParts.length === 0) {
        return parts
            .map((part) => part.trim())
            .filter(Boolean)
            .join(' ');
    }

    return selectedParts.join(' ');
}

function sectionLabel(id: AtsSectionConceptId): string {
    switch (id) {
        case 'experience':
            return 'Experience';
        case 'education':
            return 'Education';
        case 'skills':
            return 'Skills';
        case 'projects':
            return 'Projects';
        case 'certifications':
            return 'Certifications';
        case 'languages':
            return 'Languages';
        default:
            return id;
    }
}

function hasTokenizedMatch(haystack: string, needle: string): boolean {
    if (!needle) {
        return false;
    }

    if (haystack === needle) {
        return true;
    }

    return (` ${haystack} `).includes(` ${needle} `);
}

function normalizeText(value: unknown): string {
    if (typeof value !== 'string') {
        return '';
    }

    return value
        .toLowerCase()
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
}

function clampScore(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
}

function countWords(text: string): number {
    return normalizeText(text)
        .split(' ')
        .filter(Boolean).length;
}
