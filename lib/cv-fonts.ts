export type CvFontKey =
  | 'calibri'
  | 'arial'
  | 'times_new_roman'
  | 'cambria'
  | 'georgia'
  | 'garamond'
  | 'helvetica'
  | 'trebuchet_ms';

export const DEFAULT_CV_FONT: CvFontKey = 'calibri';

export const CV_FONT_OPTIONS: Array<{ value: CvFontKey; label: string; stack: string }> = [
  {
    value: 'calibri',
    label: 'Calibri',
    stack: "Calibri, Candara, Segoe, 'Segoe UI', Optima, Arial, sans-serif",
  },
  { value: 'arial', label: 'Arial', stack: 'Arial, Helvetica, sans-serif' },
  { value: 'times_new_roman', label: 'Times New Roman', stack: "'Times New Roman', Times, serif" },
  { value: 'cambria', label: 'Cambria', stack: 'Cambria, Georgia, serif' },
  { value: 'georgia', label: 'Georgia', stack: 'Georgia, Times, serif' },
  { value: 'garamond', label: 'Garamond', stack: "Garamond, Baskerville, 'Times New Roman', serif" },
  { value: 'helvetica', label: 'Helvetica', stack: "'Helvetica Neue', Helvetica, Arial, sans-serif" },
  { value: 'trebuchet_ms', label: 'Trebuchet MS', stack: "'Trebuchet MS', Tahoma, Verdana, Arial, sans-serif" },
];

const FONT_SET = new Set<string>(CV_FONT_OPTIONS.map((option) => option.value));

export function normalizeCvFont(value: unknown): CvFontKey {
  if (typeof value === 'string' && FONT_SET.has(value)) {
    return value as CvFontKey;
  }
  return DEFAULT_CV_FONT;
}

export function getCvFontStack(font: unknown): string {
  const key = normalizeCvFont(font);
  return CV_FONT_OPTIONS.find((option) => option.value === key)?.stack ?? CV_FONT_OPTIONS[0].stack;
}
