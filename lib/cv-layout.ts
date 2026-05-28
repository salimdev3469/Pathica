export interface CvPageMargins {
  top: number;
  right: number;
  bottom: number;
  left: number;
}

export const CV_PAGE_WIDTH_PX = 794;
export const CV_PAGE_HEIGHT_PX = 1123;
export const CV_PAGE_MARGIN_MIN_PX = 0;
export const CV_PAGE_MARGIN_MAX_PX = 180;

export const DEFAULT_CV_PAGE_MARGINS: CvPageMargins = {
  top: 54,
  right: 54,
  bottom: 54,
  left: 54,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeSide(value: unknown, fallback: number): number {
  if (typeof value !== 'number' || !Number.isFinite(value)) {
    return fallback;
  }
  return clamp(Math.round(value), CV_PAGE_MARGIN_MIN_PX, CV_PAGE_MARGIN_MAX_PX);
}

export function normalizeCvPageMargins(value?: Partial<CvPageMargins> | null): CvPageMargins {
  return {
    top: normalizeSide(value?.top, DEFAULT_CV_PAGE_MARGINS.top),
    right: normalizeSide(value?.right, DEFAULT_CV_PAGE_MARGINS.right),
    bottom: normalizeSide(value?.bottom, DEFAULT_CV_PAGE_MARGINS.bottom),
    left: normalizeSide(value?.left, DEFAULT_CV_PAGE_MARGINS.left),
  };
}
