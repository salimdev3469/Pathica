const STOP_WORDS = new Set([
  'a',
  'an',
  'and',
  'are',
  'as',
  'at',
  'be',
  'by',
  'for',
  'from',
  'has',
  'have',
  'if',
  'in',
  'into',
  'is',
  'it',
  'its',
  'of',
  'on',
  'or',
  'our',
  'that',
  'the',
  'their',
  'this',
  'to',
  'was',
  'we',
  'will',
  'with',
  'you',
  'your',
  'job',
  'role',
  'required',
  'preferred',
  'experience',
  'team',
  'teams',
  'work',
  'years',
  'year',
  'gorev',
  'pozisyon',
  'aday',
  'deneyim',
  'ekip',
  'olan',
  'olmak',
  'icin',
  'ile',
  've',
  'veya',
  'bir',
  'bu',
  'olarak',
  'gibi',
  'tercihen',
  'zorunlu',
  'minimum',
  'sorumluluk',
  'sorumluluklar',
  'nitelikler',
  'gereksinimler',
]);

function normalizeForTokenizing(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9çğıöşüâîû+#./\-\s]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function normalizeForMatching(text: string): string {
  return ` ${normalizeForTokenizing(text)} `;
}

function isValidToken(token: string): boolean {
  if (token.length < 2) {
    return false;
  }

  if (STOP_WORDS.has(token)) {
    return false;
  }

  if (/^\d+$/.test(token)) {
    return false;
  }

  return true;
}

function scoreToken(token: string): number {
  if (/[+#./-]/.test(token)) {
    return 2.25;
  }

  if (token.length >= 10) {
    return 1.5;
  }

  if (token.length >= 6) {
    return 1.2;
  }

  return 1;
}

export function extractJobKeywords(text: string, limit = 18): string[] {
  const normalized = normalizeForTokenizing(text);
  if (!normalized) {
    return [];
  }

  const tokens = normalized.split(' ').filter(Boolean);
  const scores = new Map<string, number>();

  for (const token of tokens) {
    if (!isValidToken(token)) {
      continue;
    }
    scores.set(token, (scores.get(token) || 0) + scoreToken(token));
  }

  for (let index = 0; index < tokens.length - 1; index += 1) {
    const left = tokens[index];
    const right = tokens[index + 1];
    if (!isValidToken(left) || !isValidToken(right)) {
      continue;
    }

    const phrase = `${left} ${right}`;
    const phraseScore = (scoreToken(left) + scoreToken(right)) * 0.9;
    scores.set(phrase, (scores.get(phrase) || 0) + phraseScore);
  }

  return Array.from(scores.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([keyword]) => keyword)
    .filter((keyword, index, list) => list.indexOf(keyword) === index)
    .slice(0, limit);
}

export function extractMissingKeywords(jobDescription: string, cvText: string, limit = 12): string[] {
  const jdKeywords = extractJobKeywords(jobDescription, Math.max(limit * 2, 30));
  const cvNormalized = normalizeForMatching(cvText);

  return jdKeywords
    .filter((keyword) => {
      if (keyword.includes(' ')) {
        return !cvNormalized.includes(` ${keyword} `);
      }
      return !cvNormalized.includes(` ${keyword} `);
    })
    .slice(0, limit);
}

export function extractEmbeddedKeywords(cvText: string, keywords: string[], limit = 18): string[] {
  const cvNormalized = normalizeForMatching(cvText);
  const seen = new Set<string>();
  const embedded: string[] = [];

  for (const keyword of keywords) {
    const normalizedKeyword = keyword.trim().toLowerCase();
    if (!normalizedKeyword || seen.has(normalizedKeyword)) {
      continue;
    }

    if (cvNormalized.includes(` ${normalizedKeyword} `)) {
      embedded.push(normalizedKeyword);
      seen.add(normalizedKeyword);
    }

    if (embedded.length >= limit) {
      break;
    }
  }

  return embedded;
}
