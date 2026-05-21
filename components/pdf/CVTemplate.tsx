import React from 'react';
import { CVState, Section, Item } from '@/context/CVContext';
import { getCvFontStack } from '@/lib/cv-fonts';

interface WrapperProps {
  children: React.ReactNode;
  id: string;
  isContinuation?: boolean;
}

interface PhotoInteractiveProps {
  onPointerDown?: React.PointerEventHandler<HTMLDivElement>;
  isDragging?: boolean;
}

interface CVTemplateProps {
  cv: CVState;
  SectionWrapper?: React.FC<WrapperProps>;
  ItemWrapper?: React.FC<WrapperProps & { sectionId: string }>;
  photoPositionOverride?: { x: number; y: number };
  photoInteractive?: PhotoInteractiveProps;
  previewMode?: boolean;
}

type PaginatedPage = {
  includeHeader: boolean;
  includeSummary: boolean;
  sections: Section[];
};

const DefaultSectionWrapper: React.FC<WrapperProps> = ({ children }) => <div style={{ marginBottom: '14px' }}>{children}</div>;
const DefaultItemWrapper: React.FC<WrapperProps> = ({ children }) => <div>{children}</div>;

const PAGE_WIDTH = 794;
const PAGE_HEIGHT = 1123;
const PAGE_MARGIN = 54;
const DEFAULT_PHOTO_SIZE = 112;
const MIN_PHOTO_SIZE = 72;
const MAX_PHOTO_SIZE = 200;
const HEADER_HEIGHT = 82;
const CONTENT_HEIGHT = PAGE_HEIGHT - PAGE_MARGIN * 2;
const CV_LAYOUT_VARIANTS = ['classic-ats', 'entry-starter', 'technical-impact', 'career-switch'] as const;

type CvLayoutVariant = (typeof CV_LAYOUT_VARIANTS)[number];
type ListMarkerType = 'disc' | 'circle' | 'square';

type CvLayoutTheme = {
  headerAlign: 'center' | 'left';
  nameTransform: 'uppercase' | 'none';
  jobTransform: 'uppercase' | 'none';
  contactSeparator: string;
  summaryBulletType: ListMarkerType;
  itemBulletType: ListMarkerType;
  subtitleStyle: 'italic' | 'normal';
  summaryContainerStyle: React.CSSProperties;
  headingStyle: {
    color: string;
    borderBottom: string;
    backgroundColor: string;
    borderLeft: string;
    borderRadius: string;
    padding: string;
    textTransform: 'uppercase' | 'none';
    letterSpacing: string;
  };
  pageAccentStyle?: React.CSSProperties;
};

type ContactEntry =
  | { kind: 'text'; value: string }
  | { kind: 'link'; value: string; href: string };

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}


function ptToPx(pt: number): number {
  return pt * 1.333;
}

// Chars per line based on font size, using ~0.52 em-width ratio (for monospace-like average)
function countWrappedLines(text: string, fontSizePt: number, isBullet = true): number {
  if (!text) return 0;
  // Available content width in px: page 794 - 2*margin 54 = 686px
  // Bullets add 18px left padding → 668px
  const availWidth = isBullet ? 668 : 686;
  // 0.42 = conservative char width ratio — prevents overestimating line wraps
  const charWidthPx = ptToPx(fontSizePt) * 0.42;
  const charsPerLine = Math.max(10, Math.floor(availWidth / charWidthPx));
  const lines = text.split('\n').map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) return 0;
  return lines.reduce((acc, line) => acc + Math.ceil(Math.max(1, line.length) / charsPerLine), 0);
}

function estimateSummaryHeight(summary?: string, fontSize = 11, titleFontSize = 12): number {
  if (!summary?.trim()) return 0;
  // h2: lineHeight 1.4, marginTop 6, marginBottom 3, paddingBottom 3, parent-div marginTop 6, marginBottom 6
  const h2Px = ptToPx(titleFontSize) * 1.4;
  const headingBlock = h2Px + 6 + 3 + 3 + 6 + 6; // wrapper margins + h2 margins
  // Each bullet li: lineHeight 1.4, marginBottom 3
  const lines = Math.max(1, countWrappedLines(summary, fontSize, true));
  const bulletsBlock = 4 + lines * (ptToPx(fontSize) * 1.4 + 3); // ul marginTop + lis
  const wrapperMargin = 14; // div marginBottom
  return headingBlock + bulletsBlock + wrapperMargin;
}

function estimateItemHeight(item: Item): number {
  const titlePt = item.titleFontSize ?? 11;
  const subtitlePt = item.subtitleFontSize ?? 11;
  const bulletsPt = item.bulletsFontSize ?? 11;

  // Row 1: title + date (same line, baseline-aligned)
  let h = ptToPx(titlePt) * 1.4;

  // Row 2: subtitle + location (only if present)
  if (item.subtitle || item.location) {
    h += ptToPx(subtitlePt) * 1.4;
  }

  // Bullet rows
  if (item.bullets?.trim()) {
    const lines = countWrappedLines(item.bullets, bulletsPt, true);
    h += 4 + lines * (ptToPx(bulletsPt) * 1.4 + 3); // ul marginTop + each line
  }

  h += 12; // div marginBottom inside the item group
  return h;
}

function estimateSectionHeight(section: Section): number {
  const titlePt = section.titleFontSize ?? 12;
  // h2 block: h2 itself + margins + parent-div margins + sectionWrapper marginBottom
  const h2Px = ptToPx(titlePt) * 1.4;
  const headingBlock = h2Px + 16 + 6 + 3 + 6; // marginTop 16, marginBottom 6, paddingBottom 3, parent div marginBottom 6
  const sectionWrapperMargin = 14;
  const itemsHeight = (section.items || []).reduce((total, item) => total + estimateItemHeight(item), 0);
  return headingBlock + itemsHeight + sectionWrapperMargin;
}

function mapSectionTitle(title: string): string {
  const map: Record<string, string> = {
    'work experience': 'EXPERIENCE',
    experience: 'EXPERIENCE',
    career: 'EXPERIENCE',
    education: 'EDUCATION',
    skills: 'SKILLS',
    'technical skills': 'SKILLS',
    projects: 'PROJECTS',
    certifications: 'CERTIFICATIONS',
    certificates: 'CERTIFICATIONS',
    summary: 'PROFILE SUMMARY',
    'profile summary': 'PROFILE SUMMARY',
    'about me': 'PROFILE SUMMARY',
    languages: 'LANGUAGES',
    achievements: 'ACHIEVEMENTS',
    awards: 'ACHIEVEMENTS',
  };

  return map[title.toLowerCase()] ?? title.toUpperCase();
}

function normalizeBulletLine(line: string): string {
  return line.replace(/^[\s*\-\u2022]+/, '').trim();
}

function normalizeExternalUrl(url?: string): string | null {
  if (!url) return null;
  const trimmed = url.trim();
  if (!trimmed) return null;
  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return `https://${trimmed}`;
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '');
}

function isCvLayoutVariant(value: unknown): value is CvLayoutVariant {
  return typeof value === 'string' && (CV_LAYOUT_VARIANTS as readonly string[]).includes(value);
}

function resolveLayoutVariant(cv: CVState): CvLayoutVariant {
  if (isCvLayoutVariant(cv.templateSlug)) {
    return cv.templateSlug;
  }

  const cvId = String(cv.id || '').toLowerCase();
  const fromId = CV_LAYOUT_VARIANTS.find((variant) => cvId.includes(variant));
  if (fromId) {
    return fromId;
  }

  return 'classic-ats';
}

function getLayoutTheme(variant: CvLayoutVariant): CvLayoutTheme {
  switch (variant) {
    case 'entry-starter':
      return {
        headerAlign: 'left',
        nameTransform: 'none',
        jobTransform: 'none',
        contactSeparator: ' · ',
        summaryBulletType: 'circle',
        itemBulletType: 'disc',
        subtitleStyle: 'normal',
        summaryContainerStyle: {
          border: '1px solid #d1fae5',
          backgroundColor: '#f0fdf4',
          borderRadius: '6px',
          padding: '8px 10px',
        },
        headingStyle: {
          color: '#065f46',
          borderBottom: 'none',
          backgroundColor: '#ecfdf5',
          borderLeft: '4px solid #10b981',
          borderRadius: '6px',
          padding: '4px 8px 4px 10px',
          textTransform: 'none',
          letterSpacing: '0.2px',
        },
        pageAccentStyle: {
          position: 'absolute',
          left: `${PAGE_MARGIN}px`,
          right: `${PAGE_MARGIN}px`,
          top: `${PAGE_MARGIN - 20}px`,
          height: '6px',
          borderRadius: '999px',
          backgroundColor: '#10b981',
          opacity: 0.9,
        },
      };
    case 'technical-impact':
      return {
        headerAlign: 'left',
        nameTransform: 'uppercase',
        jobTransform: 'uppercase',
        contactSeparator: ' | ',
        summaryBulletType: 'square',
        itemBulletType: 'square',
        subtitleStyle: 'normal',
        summaryContainerStyle: {
          border: '1px solid #dbeafe',
          backgroundColor: '#eff6ff',
          borderRadius: '6px',
          padding: '8px 10px',
        },
        headingStyle: {
          color: '#1d4ed8',
          borderBottom: 'none',
          backgroundColor: '#eff6ff',
          borderLeft: '4px solid #2563eb',
          borderRadius: '6px',
          padding: '4px 8px 4px 10px',
          textTransform: 'uppercase',
          letterSpacing: '0.6px',
        },
        pageAccentStyle: {
          position: 'absolute',
          left: `${PAGE_MARGIN - 16}px`,
          top: `${PAGE_MARGIN - 6}px`,
          bottom: `${PAGE_MARGIN - 6}px`,
          width: '6px',
          borderRadius: '999px',
          backgroundColor: '#2563eb',
          opacity: 0.9,
        },
      };
    case 'career-switch':
      return {
        headerAlign: 'left',
        nameTransform: 'none',
        jobTransform: 'uppercase',
        contactSeparator: ' • ',
        summaryBulletType: 'disc',
        itemBulletType: 'circle',
        subtitleStyle: 'normal',
        summaryContainerStyle: {
          border: '1px solid #fed7aa',
          backgroundColor: '#fff7ed',
          borderRadius: '6px',
          padding: '8px 10px',
        },
        headingStyle: {
          color: '#9a3412',
          borderBottom: '1px solid #fdba74',
          backgroundColor: '#fff7ed',
          borderLeft: '4px solid #f97316',
          borderRadius: '6px',
          padding: '4px 8px 4px 10px',
          textTransform: 'none',
          letterSpacing: '0.4px',
        },
        pageAccentStyle: {
          position: 'absolute',
          right: `${PAGE_MARGIN - 16}px`,
          top: `${PAGE_MARGIN - 6}px`,
          bottom: `${PAGE_MARGIN - 6}px`,
          width: '6px',
          borderRadius: '999px',
          backgroundColor: '#f97316',
          opacity: 0.9,
        },
      };
    case 'classic-ats':
    default:
      return {
        headerAlign: 'center',
        nameTransform: 'uppercase',
        jobTransform: 'uppercase',
        contactSeparator: ' | ',
        summaryBulletType: 'disc',
        itemBulletType: 'disc',
        subtitleStyle: 'italic',
        summaryContainerStyle: {
          border: 'none',
          backgroundColor: 'transparent',
          borderRadius: 0,
          padding: 0,
        },
        headingStyle: {
          color: '#000000',
          borderBottom: '1.5px solid #000000',
          backgroundColor: 'transparent',
          borderLeft: 'none',
          borderRadius: 0,
          padding: '0 0 3px 0',
          textTransform: 'uppercase',
          letterSpacing: '0.5px',
        },
      };
  }
}

function paginateSectionsByPage(
  sections: Section[],
  firstPageAvailable: number,
  otherPageAvailable: number,
): Section[][] {
  if (sections.length === 0) {
    return [[]];
  }

  const pages: Section[][] = [];
  let currentPageSections: Section[] = [];
  let remaining = firstPageAvailable;
  let isFirstPage = true;

  const pushNewPage = () => {
    pages.push(currentPageSections);
    currentPageSections = [];
    isFirstPage = false;
    remaining = otherPageAvailable;
  };

  for (const section of sections) {
    const titlePt = section.titleFontSize ?? 12;
    const h2Px = ptToPx(titlePt) * 1.4;
    const headingHeight = h2Px + 16 + 6 + 3 + 6 + 14;

    // If section heading alone doesn't fit on the current page, start a new page
    // Allow bleeding 20px into bottom margin for headings
    if (remaining < headingHeight - 20 && currentPageSections.length > 0) {
      pushNewPage();
    }

    let currentSectionPart: Section = { ...section, items: [] };
    remaining -= headingHeight;
    currentPageSections.push(currentSectionPart);

    const items = section.items || [];
    for (const item of items) {
      const itemHeight = estimateItemHeight(item);

      // Allow items to bleed up to 48px into the bottom margin (safe since bottom margin is 54px)
      if (itemHeight > remaining + 48) {
        if (currentPageSections.length === 1 && currentSectionPart.items.length === 0 && remaining >= otherPageAvailable - headingHeight - 20) {
          // Extremely large single item on a fresh page. Let it stay to not loop infinitely.
          currentSectionPart.items.push(item);
          remaining -= itemHeight;
        } else {
          const itemsAlreadyOnPage = currentSectionPart.items.length > 0;
          if (!itemsAlreadyOnPage) {
            currentPageSections.pop();
            remaining += headingHeight;
          }

          pushNewPage();
          currentSectionPart = { ...section, items: [], isContinuation: itemsAlreadyOnPage };
          currentPageSections.push(currentSectionPart);

          currentSectionPart.items.push(item);
          remaining -= itemHeight;
        }
      } else {
        currentSectionPart.items.push(item);
        remaining -= itemHeight;
      }
    }

    if (currentSectionPart.items.length === 0) {
      currentPageSections.pop();
      remaining += headingHeight;
    }
  }

  if (currentPageSections.length > 0) {
    pages.push(currentPageSections);
  }

  return pages;
}

export const CVTemplate: React.FC<CVTemplateProps> = ({
  cv,
  SectionWrapper = DefaultSectionWrapper,
  ItemWrapper = DefaultItemWrapper,
  photoPositionOverride,
  photoInteractive,
  previewMode = false,
}) => {
  const { personalInfo, summaryTitle, summary, sections } = cv;
  const layoutVariant = resolveLayoutVariant(cv);
  const layoutTheme = getLayoutTheme(layoutVariant);
  const fontFamily = getCvFontStack(cv.fontFamily);
  const { fullName, email, phone, location, linkedin, portfolio, github, photoDataUrl } = personalInfo || {};

  const linkedinUrl = normalizeExternalUrl(linkedin);
  const githubUrl = normalizeExternalUrl(github);
  const portfolioUrl = normalizeExternalUrl(portfolio);
  const contactEntries = [
    location ? { kind: 'text', value: location } : null,
    phone ? { kind: 'text', value: phone } : null,
    email ? { kind: 'text', value: email } : null,
    linkedinUrl ? { kind: 'link', value: 'LinkedIn', href: linkedinUrl } : null,
    githubUrl ? { kind: 'link', value: 'Github', href: githubUrl } : null,
    portfolioUrl ? { kind: 'link', value: displayUrl(portfolioUrl), href: portfolioUrl } : null,
  ].filter((entry): entry is ContactEntry => entry !== null);

  const hasPhoto = Boolean(photoDataUrl);
  const hasSummary = Boolean(summary?.trim());
  const summaryLines = (summary || '')
    .split(/\r?\n/)
    .map((line) => normalizeBulletLine(line))
    .filter(Boolean);
  const mappedSummaryTitle = mapSectionTitle(summaryTitle || 'Profile Summary');
  const resolvedSummaryTitle =
    layoutTheme.headingStyle.textTransform === 'none'
      ? mappedSummaryTitle
          .toLowerCase()
          .replace(/\b\w/g, (char) => char.toUpperCase())
      : mappedSummaryTitle;

  const photoSize = clamp(personalInfo?.photoSize ?? DEFAULT_PHOTO_SIZE, MIN_PHOTO_SIZE, MAX_PHOTO_SIZE);
  const defaultPhotoX = PAGE_WIDTH - photoSize;
  const defaultPhotoY = 0;

  const requestedX = photoPositionOverride?.x ?? personalInfo?.photoX ?? defaultPhotoX;
  const requestedY = photoPositionOverride?.y ?? personalInfo?.photoY ?? defaultPhotoY;

  const photoX = clamp(requestedX, 0, PAGE_WIDTH - photoSize);
  const photoY = clamp(requestedY, 0, PAGE_HEIGHT - photoSize);

  // Header height: h1 (fontPx * 1.4 + margin-bottom 6) + contact-div (contactPx * 1.3) + wrapper marginBottom 14
  const fullNamePx = ptToPx(personalInfo?.fullNameFontSize ?? 18);
  const jobTitlePx = ptToPx(personalInfo?.jobTitleFontSize ?? 14);
  const contactPx = ptToPx(personalInfo?.contactFontSize ?? 10);
  const actualHeaderHeight = (fullNamePx * 1.4 + 6) + (personalInfo?.jobTitle ? jobTitlePx * 1.4 + 4 : 0) + (contactPx * 1.3) + 14;

  const summaryBlockHeight = hasSummary ? estimateSummaryHeight(summary, cv.summaryFontSize ?? 11, cv.summaryTitleFontSize ?? 12) : 0;
  const firstPageAvailable = CONTENT_HEIGHT - actualHeaderHeight - summaryBlockHeight;
  const sectionPages = paginateSectionsByPage(sections || [], firstPageAvailable, CONTENT_HEIGHT);

  const paginatedPages: PaginatedPage[] = sectionPages.map((pageSections, index) => ({
    includeHeader: index === 0,
    includeSummary: index === 0 && hasSummary,
    sections: pageSections,
  }));

  const pagesToRender =
    previewMode && paginatedPages.length === 1
      ? [...paginatedPages, { includeHeader: false, includeSummary: false, sections: [] }]
      : paginatedPages;

  return (
    <div style={{ width: `${PAGE_WIDTH}px`, margin: '0 auto' }}>
      {pagesToRender.map((page, pageIndex) => {
        const isLastPage = pageIndex === pagesToRender.length - 1;

        return (
          <div
            key={`page-${pageIndex}`}
            style={{
              fontFamily,
              fontSize: '11pt',
              lineHeight: '1.4',
              color: '#000000',
              width: `${PAGE_WIDTH}px`,
              height: `${PAGE_HEIGHT}px`,
              padding: `${PAGE_MARGIN}px`,
              letterSpacing: `${cv.letterSpacing ?? 0}px`,
              fontFamily,
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: previewMode && !isLastPage ? '24px' : '0',
              pageBreakAfter: !previewMode && !isLastPage ? 'always' : 'auto',
            }}
          >
            <div style={{ height: '100%', overflow: previewMode ? 'visible' : 'hidden' }}>
              {page.includeHeader && layoutTheme.pageAccentStyle && <div style={layoutTheme.pageAccentStyle} />}
              {page.includeHeader && (
                <div style={{ marginBottom: '14px', minHeight: `${actualHeaderHeight}px`, textAlign: layoutTheme.headerAlign }}>
                  <h1
                    style={{
                      fontFamily,
                      fontSize: `${personalInfo?.fullNameFontSize ?? 18}pt`,
                      fontWeight: 'bold',
                      margin: '0 0 6px 0',
                      color: '#000000',
                      textTransform: layoutTheme.nameTransform,
                      letterSpacing: '0.2px',
                    }}
                  >
                    {fullName || 'YOUR NAME'}
                  </h1>

                  {personalInfo?.jobTitle && (
                    <div
                      style={{
                        fontFamily,
                        fontSize: `${personalInfo?.jobTitleFontSize ?? 14}pt`,
                        fontWeight: '600',
                        margin: '-4px 0 8px 0',
                        color: '#000000',
                        textTransform: layoutTheme.jobTransform,
                        letterSpacing: '0.5px',
                      }}
                    >
                      {personalInfo.jobTitle}
                    </div>
                  )}

                  <div
                    style={{
                      fontFamily,
                      fontSize: `${personalInfo?.contactFontSize ?? 10}pt`,
                      color: '#000000',
                      lineHeight: '1.3',
                      textAlign: layoutTheme.headerAlign,
                    }}
                  >
                    {contactEntries.map((entry, index) => (
                      <React.Fragment key={`contact-${index}`}>
                        {index > 0 ? layoutTheme.contactSeparator : null}
                        {entry.kind === 'link' ? (
                          <a
                            href={entry.href}
                            target="_blank"
                            rel="noreferrer"
                            style={{ color: '#000000', textDecoration: 'underline' }}
                          >
                            {entry.value}
                          </a>
                        ) : (
                          entry.value
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>
              )}

              {page.includeHeader && hasPhoto && (
                <div
                  onPointerDown={photoInteractive?.onPointerDown}
                  style={{
                    position: 'absolute',
                    left: `${photoX}px`,
                    top: `${photoY}px`,
                    width: `${photoSize}px`,
                    height: `${photoSize}px`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    border: photoInteractive?.isDragging ? '2px solid #2563eb' : '1px solid #d1d5db',
                    boxShadow: photoInteractive?.isDragging ? '0 12px 24px rgba(37,99,235,0.25)' : '0 2px 8px rgba(0,0,0,0.08)',
                    cursor: photoInteractive?.onPointerDown ? (photoInteractive.isDragging ? 'grabbing' : 'grab') : 'default',
                    userSelect: 'none',
                    touchAction: 'none',
                    backgroundColor: '#ffffff',
                    zIndex: 120,
                  }}
                  title={photoInteractive ? 'Drag to reposition' : undefined}
                >
                  <img
                    src={photoDataUrl}
                    alt="Profile"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', pointerEvents: 'none' }}
                  />
                </div>
              )}

              {page.includeSummary && hasSummary && (
                <div style={{ marginBottom: '14px', ...layoutTheme.summaryContainerStyle }}>
                  <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                    <h2
                      style={{
                        fontFamily,
                        fontSize: `${cv.summaryTitleFontSize ?? 12}pt`,
                        fontWeight: 'bold',
                        margin: '0 0 3px 0',
                        borderBottom: layoutTheme.headingStyle.borderBottom,
                        backgroundColor: layoutTheme.headingStyle.backgroundColor,
                        borderLeft: layoutTheme.headingStyle.borderLeft,
                        borderRadius: layoutTheme.headingStyle.borderRadius,
                        padding: layoutTheme.headingStyle.padding,
                        textTransform: layoutTheme.headingStyle.textTransform,
                        letterSpacing: layoutTheme.headingStyle.letterSpacing,
                        color: layoutTheme.headingStyle.color,
                      }}
                    >
                      {resolvedSummaryTitle}
                    </h2>
                  </div>

                  <ul style={{ margin: 0, paddingLeft: '18px' }}>
                    {(summaryLines.length > 0 ? summaryLines : [normalizeBulletLine(summary || '')]).map((line, i) => (
                      <li
                        key={`summary-${i}`}
                        style={{
                          marginBottom: '3px',
                          fontFamily,
                          fontSize: `${cv.summaryFontSize ?? 11}pt`,
                          listStyleType: layoutTheme.summaryBulletType,
                        }}
                      >
                        {line}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {page.sections.map((section) => {
                const standardTitle = mapSectionTitle(section.title);
                const sectionTitle =
                  layoutTheme.headingStyle.textTransform === 'none'
                    ? standardTitle
                        .toLowerCase()
                        .replace(/\b\w/g, (char) => char.toUpperCase())
                    : standardTitle;

                return (
                  <SectionWrapper key={`${section.id}-${pageIndex}`} id={section.id} isContinuation={section.isContinuation}>
                    {!section.isContinuation && (
                      <div style={{ marginTop: '16px', marginBottom: '6px' }}>
                        <h2
                          style={{
                            fontFamily,
                            fontSize: `${section.titleFontSize ?? 12}pt`,
                            fontWeight: 'bold',
                            margin: '0 0 3px 0',
                            borderBottom: layoutTheme.headingStyle.borderBottom,
                            backgroundColor: layoutTheme.headingStyle.backgroundColor,
                            borderLeft: layoutTheme.headingStyle.borderLeft,
                            borderRadius: layoutTheme.headingStyle.borderRadius,
                            padding: layoutTheme.headingStyle.padding,
                            textTransform: layoutTheme.headingStyle.textTransform,
                            letterSpacing: layoutTheme.headingStyle.letterSpacing,
                            color: layoutTheme.headingStyle.color,
                          }}
                        >
                          {sectionTitle}
                        </h2>
                      </div>
                    )}

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {section.items?.map((item) => (
                        <ItemWrapper key={item.id} id={item.id} sectionId={section.id}>
                          <div style={{ marginBottom: '12px' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontFamily, fontSize: `${item.titleFontSize ?? 11}pt`, fontWeight: 'bold' }}>{item.title}</span>
                              {item.date && <span style={{ fontFamily, fontSize: `${item.dateFontSize ?? 11}pt` }}>{item.date}</span>}
                            </div>

                            {(item.subtitle || item.location) && (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                <span style={{ fontFamily, fontSize: `${item.subtitleFontSize ?? 11}pt`, fontStyle: layoutTheme.subtitleStyle }}>{item.subtitle}</span>
                                {item.location && <span style={{ fontFamily, fontSize: `${item.locationFontSize ?? 11}pt` }}>{item.location}</span>}
                              </div>
                            )}

                            {item.bullets && (
                              <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                                {item.bullets
                                  .split('\n')
                                  .map((line) => line.trim())
                                  .filter(Boolean)
                                  .map((line, i) => (
                                    <li
                                      key={`${item.id}-${i}`}
                                      style={{
                                        fontFamily,
                                        fontSize: `${item.bulletsFontSize ?? 11}pt`,
                                        marginBottom: '3px',
                                        listStyleType: layoutTheme.itemBulletType,
                                      }}
                                    >
                                      {normalizeBulletLine(line)}
                                    </li>
                                  ))}
                              </ul>
                            )}
                          </div>
                        </ItemWrapper>
                      ))}
                    </div>
                  </SectionWrapper>
                );
              })}

              {isLastPage && (
                <div
                  style={{
                    position: 'absolute',
                    left: `${PAGE_MARGIN}px`,
                    right: `${PAGE_MARGIN}px`,
                    bottom: '14px',
                    textAlign: 'right',
                    fontFamily,
                    fontSize: '8pt',
                    color: '#666666',
                    letterSpacing: '0.2px',
                  }}
                >
                  Created with Pathica
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};
