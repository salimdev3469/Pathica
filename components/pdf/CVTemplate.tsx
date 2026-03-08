import React from 'react';
import { CVState, Section, Item } from '@/context/CVContext';
import { getCvFontStack } from '@/lib/cv-fonts';

interface WrapperProps {
  children: React.ReactNode;
  id: string;
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

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function countLines(text?: string): number {
  if (!text) return 0;
  return text
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean).length;
}

function estimateSummaryHeight(summary?: string): number {
  if (!summary?.trim()) return 0;
  const lines = Math.max(1, countLines(summary));
  return 32 + lines * 16 + 8;
}

function estimateItemHeight(item: Item): number {
  const bulletLines = Math.max(1, countLines(item.bullets));
  const subtitleRow = item.subtitle || item.location ? 18 : 0;
  return 30 + subtitleRow + bulletLines * 15 + 10;
}

function estimateSectionHeight(section: Section): number {
  const heading = 30;
  const itemsHeight = (section.items || []).reduce((total, item) => total + estimateItemHeight(item), 0);
  return heading + itemsHeight + 8;
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
  return line.replace(/^[\s*-\u2022]+/, '').trim();
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
  let sectionIndex = 0;
  let isFirstPage = true;

  while (sectionIndex < sections.length) {
    let remaining = isFirstPage ? firstPageAvailable : otherPageAvailable;
    const pageSections: Section[] = [];

    if (isFirstPage && remaining <= 120) {
      pages.push([]);
      isFirstPage = false;
      continue;
    }

    while (sectionIndex < sections.length) {
      const section = sections[sectionIndex];
      const sectionHeight = estimateSectionHeight(section);

      if (pageSections.length > 0 && sectionHeight > remaining) {
        break;
      }

      if (pageSections.length === 0 && sectionHeight > remaining) {
        pageSections.push(section);
        sectionIndex += 1;
        remaining = 0;
        break;
      }

      pageSections.push(section);
      sectionIndex += 1;
      remaining -= sectionHeight;
    }

    pages.push(pageSections);
    isFirstPage = false;
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
  const fontFamily = getCvFontStack(cv.fontFamily);
  const { fullName, email, phone, location, linkedin, portfolio, github, photoDataUrl } = personalInfo || {};

  const contactItems = [
    phone,
    email,
    linkedin?.replace(/^https?:\/\/(www\.)?/, ''),
    github?.replace(/^https?:\/\/(www\.)?/, ''),
    portfolio?.replace(/^https?:\/\/(www\.)?/, ''),
  ].filter(Boolean);

  const hasPhoto = Boolean(photoDataUrl);
  const hasSummary = Boolean(summary?.trim());
  const summaryLines = (summary || '')
    .split(/\r?\n/)
    .map((line) => normalizeBulletLine(line))
    .filter(Boolean);

  const photoSize = clamp(personalInfo?.photoSize ?? DEFAULT_PHOTO_SIZE, MIN_PHOTO_SIZE, MAX_PHOTO_SIZE);
  const defaultPhotoX = PAGE_WIDTH - photoSize;
  const defaultPhotoY = 0;

  const requestedX = photoPositionOverride?.x ?? personalInfo?.photoX ?? defaultPhotoX;
  const requestedY = photoPositionOverride?.y ?? personalInfo?.photoY ?? defaultPhotoY;

  const photoX = clamp(requestedX, 0, PAGE_WIDTH - photoSize);
  const photoY = clamp(requestedY, 0, PAGE_HEIGHT - photoSize);

  const summaryBlockHeight = hasSummary ? estimateSummaryHeight(summary) : 0;
  const firstPageAvailable = CONTENT_HEIGHT - HEADER_HEIGHT - summaryBlockHeight;
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
              backgroundColor: '#ffffff',
              boxSizing: 'border-box',
              position: 'relative',
              overflow: 'hidden',
              marginBottom: previewMode && !isLastPage ? '24px' : '0',
              pageBreakAfter: !previewMode && !isLastPage ? 'always' : 'auto',
            }}
          >
            {page.includeHeader && (
              <div style={{ marginBottom: '14px', minHeight: `${HEADER_HEIGHT}px`, textAlign: 'center' }}>
                <h1
                  style={{
                    fontFamily,
                    fontSize: '18pt',
                    fontWeight: 'bold',
                    margin: '0 0 6px 0',
                    color: '#000000',
                    textTransform: 'uppercase',
                    letterSpacing: '0.2px',
                  }}
                >
                  {fullName || 'YOUR NAME'}
                </h1>

                <div
                  style={{
                    fontFamily,
                    fontSize: '10pt',
                    color: '#000000',
                    lineHeight: '1.3',
                    textAlign: 'center',
                  }}
                >
                  {location && <span>{location}{contactItems.length > 0 ? ' | ' : ''}</span>}
                  {contactItems.join(' | ')}
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
              <div style={{ marginBottom: '14px' }}>
                <div style={{ marginTop: '6px', marginBottom: '6px' }}>
                  <h2
                    style={{
                      fontFamily,
                      fontSize: '12pt',
                      fontWeight: 'bold',
                      margin: '0 0 3px 0',
                      borderBottom: '1.5px solid #000000',
                      paddingBottom: '3px',
                      textTransform: 'uppercase',
                      letterSpacing: '0.5px',
                      color: '#000000',
                    }}
                  >
                    {mapSectionTitle(summaryTitle || 'Profile Summary')}
                  </h2>
                </div>

                <ul style={{ margin: 0, paddingLeft: '18px' }}>
                  {(summaryLines.length > 0 ? summaryLines : [normalizeBulletLine(summary || '')]).map((line, i) => (
                    <li
                      key={`summary-${i}`}
                      style={{
                        marginBottom: '3px',
                        fontFamily,
                        fontSize: '11pt',
                        listStyleType: 'disc',
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

              return (
                <SectionWrapper key={section.id} id={section.id}>
                  <div style={{ marginTop: '16px', marginBottom: '6px' }}>
                    <h2
                      style={{
                        fontFamily,
                        fontSize: '12pt',
                        fontWeight: 'bold',
                        margin: '0 0 3px 0',
                        borderBottom: '1.5px solid #000000',
                        paddingBottom: '3px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        color: '#000000',
                      }}
                    >
                      {standardTitle}
                    </h2>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {section.items?.map((item) => (
                      <ItemWrapper key={item.id} id={item.id} sectionId={section.id}>
                        <div style={{ marginBottom: '12px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                            <span style={{ fontFamily, fontSize: '11pt', fontWeight: 'bold' }}>{item.title}</span>
                            {item.date && <span style={{ fontFamily, fontSize: '11pt' }}>{item.date}</span>}
                          </div>

                          {(item.subtitle || item.location) && (
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                              <span style={{ fontFamily, fontSize: '11pt', fontStyle: 'italic' }}>{item.subtitle}</span>
                              {item.location && <span style={{ fontFamily, fontSize: '11pt' }}>{item.location}</span>}
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
                                      fontSize: '11pt',
                                      marginBottom: '3px',
                                      listStyleType: 'disc',
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
        );
      })}
    </div>
  );
};
