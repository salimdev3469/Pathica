type ImportablePersonalInfoKey =
  | 'fullName'
  | 'jobTitle'
  | 'email'
  | 'phone'
  | 'location'
  | 'linkedin'
  | 'portfolio'
  | 'github';

type ImportableItem = {
  id: string;
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
  position: number;
};

type ImportablePersonalInfo = {
  fullName: string;
  jobTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedin: string;
  portfolio: string;
  github: string;
};

type ImportableSection = {
  id: string;
  title: string;
  position: number;
  items: ImportableItem[];
};

type ImportableState = {
  id: string;
  title: string;
  personalInfo: ImportablePersonalInfo;
  summaryTitle: string;
  summary: string;
  sections: ImportableSection[];
};

export type CvImportMode = 'merge' | 'replace';

export type ImportedCvItem = {
  title: string;
  subtitle: string;
  date: string;
  location: string;
  bullets: string;
};

export type ImportedCvSection = {
  title: string;
  items: ImportedCvItem[];
};

export type ImportedCvDraft = {
  title?: string;
  personalInfo?: Partial<Record<ImportablePersonalInfoKey, string>>;
  summaryTitle?: string;
  summary?: string;
  sections?: ImportedCvSection[];
};

const PERSONAL_INFO_KEYS: ImportablePersonalInfoKey[] = [
  'fullName',
  'jobTitle',
  'email',
  'phone',
  'location',
  'linkedin',
  'portfolio',
  'github',
];

function cleanText(value: unknown): string {
  if (typeof value !== 'string') return '';
  return value.replace(/\r/g, '').trim();
}

function cleanBullets(value: unknown): string {
  const raw = cleanText(value);
  if (!raw) return '';

  return raw
    .split('\n')
    .map((line) => line.trim().replace(/^[-*•]\s*/, ''))
    .filter(Boolean)
    .join('\n');
}

export function normalizeImportedCvDraft(raw: unknown): ImportedCvDraft {
  if (!raw || typeof raw !== 'object') {
    return {};
  }

  const source = raw as Record<string, unknown>;
  const personalSource =
    source.personalInfo && typeof source.personalInfo === 'object'
      ? (source.personalInfo as Record<string, unknown>)
      : {};

  const personalInfo: Partial<Record<ImportablePersonalInfoKey, string>> = {};
  for (const key of PERSONAL_INFO_KEYS) {
    const value = cleanText(personalSource[key]);
    if (value) {
      personalInfo[key] = value;
    }
  }

  const sectionsSource = Array.isArray(source.sections) ? source.sections : [];
  const sections = sectionsSource
    .map((sectionRaw) => {
      if (!sectionRaw || typeof sectionRaw !== 'object') {
        return null;
      }

      const sectionObj = sectionRaw as Record<string, unknown>;
      const sectionTitle = cleanText(sectionObj.title);
      const itemsSource = Array.isArray(sectionObj.items) ? sectionObj.items : [];

      const items = itemsSource
        .map((itemRaw) => {
          if (!itemRaw || typeof itemRaw !== 'object') {
            return null;
          }

          const itemObj = itemRaw as Record<string, unknown>;
          const item = {
            title: cleanText(itemObj.title),
            subtitle: cleanText(itemObj.subtitle),
            date: cleanText(itemObj.date),
            location: cleanText(itemObj.location),
            bullets: cleanBullets(itemObj.bullets),
          };

          if (!item.title && !item.subtitle && !item.date && !item.location && !item.bullets) {
            return null;
          }

          return item;
        })
        .filter((item): item is ImportedCvItem => item !== null);

      if (!sectionTitle && items.length === 0) {
        return null;
      }

      return {
        title: sectionTitle,
        items,
      };
    })
    .filter((section): section is ImportedCvSection => section !== null);

  const draft: ImportedCvDraft = {};

  const title = cleanText(source.title);
  if (title) {
    draft.title = title;
  }

  if (Object.keys(personalInfo).length > 0) {
    draft.personalInfo = personalInfo;
  }

  const summaryTitle = cleanText(source.summaryTitle);
  if (summaryTitle) {
    draft.summaryTitle = summaryTitle;
  }

  const summary = cleanBullets(source.summary);
  if (summary) {
    draft.summary = summary;
  }

  if (sections.length > 0) {
    draft.sections = sections;
  }

  return draft;
}

function sectionKey(title: string): string {
  return title.trim().toLowerCase().replace(/\s+/g, ' ');
}

function ensureSectionTitle(rawTitle: string, index: number): string {
  const cleaned = cleanText(rawTitle);
  if (cleaned) return cleaned;
  return `Section ${index + 1}`;
}

function toImportableItems(items: ImportedCvItem[]): ImportableItem[] {
  return items.map((item, index) => ({
    id: crypto.randomUUID(),
    title: cleanText(item.title),
    subtitle: cleanText(item.subtitle),
    date: cleanText(item.date),
    location: cleanText(item.location),
    bullets: cleanBullets(item.bullets),
    position: index,
  }));
}

function toImportableSections(sections: ImportedCvSection[]): ImportableSection[] {
  return sections.map((section, index) => ({
    id: crypto.randomUUID(),
    title: ensureSectionTitle(section.title, index),
    position: index,
    items: toImportableItems(section.items),
  }));
}

export function applyImportedCvToState<T extends ImportableState>(
  state: T,
  importedDraftRaw: unknown,
  mode: CvImportMode,
): T {
  const importedDraft = normalizeImportedCvDraft(importedDraftRaw);
  const nextPersonalInfo = { ...state.personalInfo };

  for (const key of PERSONAL_INFO_KEYS) {
    const incomingValue = importedDraft.personalInfo?.[key];
    if (incomingValue) {
      nextPersonalInfo[key] = incomingValue;
    }
  }

  const nextTitle = importedDraft.title || state.title;
  const nextSummaryTitle = importedDraft.summaryTitle || state.summaryTitle;
  const nextSummary = importedDraft.summary || state.summary;
  const importedSections = toImportableSections(importedDraft.sections || []);

  let nextSections: ImportableSection[] = state.sections;
  if (importedSections.length > 0) {
    if (mode === 'replace') {
      nextSections = importedSections.map((section, index) => ({
        ...section,
        position: index,
      }));
    } else {
      const sectionsCopy: ImportableSection[] = state.sections.map((section, sectionIndex) => ({
        ...section,
        position: sectionIndex,
        items: section.items.map((item, itemIndex) => ({
          ...item,
          position: itemIndex,
        })),
      }));

      const sectionIndexByKey = new Map<string, number>();
      sectionsCopy.forEach((section, index) => {
        const key = sectionKey(section.title);
        if (key) {
          sectionIndexByKey.set(key, index);
        }
      });

      for (const importedSection of importedSections) {
        const key = sectionKey(importedSection.title);
        const existingIndex = key ? sectionIndexByKey.get(key) : undefined;

        if (existingIndex === undefined) {
          sectionsCopy.push({
            ...importedSection,
            position: sectionsCopy.length,
          });
          continue;
        }

        const existingSection = sectionsCopy[existingIndex];
        sectionsCopy[existingIndex] = {
          ...existingSection,
          title: importedSection.title || existingSection.title,
          items: importedSection.items.map((item, itemIndex) => {
            const existingItem = existingSection.items[itemIndex];
            return {
              ...item,
              id: existingItem?.id || crypto.randomUUID(),
              position: itemIndex,
            };
          }),
        };
      }

      nextSections = sectionsCopy.map((section, index) => ({
        ...section,
        position: index,
      }));
    }
  }

  return {
    ...state,
    title: nextTitle,
    personalInfo: nextPersonalInfo,
    summaryTitle: nextSummaryTitle,
    summary: nextSummary,
    sections: nextSections,
  };
}
