import React from 'react';
import { CVState } from '@/context/CVContext';

interface WrapperProps {
    children: React.ReactNode;
    id: string;
}

interface CVTemplateProps {
    cv: CVState;
    SectionWrapper?: React.FC<WrapperProps>;
    ItemWrapper?: React.FC<WrapperProps & { sectionId: string }>;
}

const DefaultSectionWrapper: React.FC<WrapperProps> = ({ children }) => <div style={{ marginBottom: '14px' }}>{children}</div>;
const DefaultItemWrapper: React.FC<WrapperProps> = ({ children }) => <div>{children}</div>;

// ATS specific standard section mappings
function mapSectionTitle(title: string): string {
    const map: Record<string, string> = {
        'work experience': 'EXPERIENCE',
        'experience': 'EXPERIENCE',
        'career': 'EXPERIENCE',
        'education': 'EDUCATION',
        'skills': 'SKILLS',
        'technical skills': 'SKILLS',
        'projects': 'PROJECTS',
        'certifications': 'CERTIFICATIONS',
        'certificates': 'CERTIFICATIONS',
        'summary': 'PROFILE SUMMARY',
        'profile summary': 'PROFILE SUMMARY',
        'about me': 'PROFILE SUMMARY',
        'languages': 'LANGUAGES',
        'achievements': 'ACHIEVEMENTS',
        'awards': 'ACHIEVEMENTS',
    };
    return map[title.toLowerCase()] ?? title.toUpperCase();
}

export const CVTemplate: React.FC<CVTemplateProps> = ({ cv, SectionWrapper = DefaultSectionWrapper, ItemWrapper = DefaultItemWrapper }) => {
    const { personalInfo, summary, sections } = cv;
    const { fullName, email, phone, location, linkedin, portfolio, github } = personalInfo || {};

    const contactItems = [
        phone,
        email,
        linkedin?.replace(/^https?:\/\/(www\.)?/, ''),
        github?.replace(/^https?:\/\/(www\.)?/, ''),
        portfolio?.replace(/^https?:\/\/(www\.)?/, '')
    ].filter(Boolean);

    return (
        <div
            style={{
                fontFamily: 'Arial, Helvetica, sans-serif',
                fontSize: '11pt',
                lineHeight: '1.4',
                color: '#000000',
                width: '794px', // A4 width at 96 DPI
                minHeight: '1123px', // A4 height at 96 DPI
                padding: '54px', // STRICT 54px margins for ATS
                margin: '0 auto',
                backgroundColor: '#ffffff',
                boxSizing: 'border-box',
            }}
        >
            {/* Header / Name */}
            <div style={{ textAlign: 'center', marginBottom: '14px' }}>
                <h1 style={{
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '18pt',
                    fontWeight: 'bold',
                    margin: '0 0 4px 0',
                    color: '#000000'
                }}>
                    {fullName || 'YOUR NAME'}
                </h1>

                {/* Contact Line - STRICT PLAIN TEXT */}
                <div style={{
                    fontFamily: 'Arial, Helvetica, sans-serif',
                    fontSize: '10pt',
                    textAlign: 'center',
                    color: '#000000',
                    lineHeight: '1.2'
                }}>
                    {location && <span>{location}{contactItems.length > 0 ? ' | ' : ''}</span>}
                    {contactItems.join(' | ')}
                </div>
            </div>

            {/* Profile Summary if exists */}
            {summary && (
                <div style={{ marginBottom: '14px' }}>
                    <div style={{ marginTop: '16px', marginBottom: '6px' }}>
                        <h2 style={{
                            fontFamily: 'Arial, Helvetica, sans-serif',
                            fontSize: '12pt',
                            fontWeight: 'bold',
                            margin: '0 0 3px 0',
                            borderBottom: '1.5px solid #000000',
                            paddingBottom: '3px',
                            textTransform: 'uppercase',
                            letterSpacing: '0.5px',
                            color: '#000000'
                        }}>
                            PROFILE SUMMARY
                        </h2>
                    </div>

                    <div style={{ paddingLeft: '18px', margin: 0 }}>
                        {summary.split('\n').filter(Boolean).map((line, i) => {
                            const cleanLine = line.replace(/^•\s*/, '');
                            return (
                                <div key={i} style={{
                                    display: 'list-item',
                                    listStyleType: 'disc',
                                    listStylePosition: 'outside',
                                    marginBottom: '3px',
                                    fontFamily: 'Arial, Helvetica, sans-serif',
                                    fontSize: '11pt'
                                }}>
                                    {cleanLine}
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {/* Other Sections */}
            {sections && sections.map((section) => {
                const standardTitle = mapSectionTitle(section.title);

                return (
                    <SectionWrapper key={section.id} id={section.id}>
                        <div style={{ marginTop: '16px', marginBottom: '6px' }}>
                            <h2 style={{
                                fontFamily: 'Arial, Helvetica, sans-serif',
                                fontSize: '12pt',
                                fontWeight: 'bold',
                                margin: '0 0 3px 0',
                                borderBottom: '1.5px solid #000000',
                                paddingBottom: '3px',
                                textTransform: 'uppercase',
                                letterSpacing: '0.5px',
                                color: '#000000'
                            }}>
                                {standardTitle}
                            </h2>
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                            {section.items && section.items.map((item) => (
                                <ItemWrapper key={item.id} id={item.id} sectionId={section.id}>
                                    <div style={{ marginBottom: '12px' }}>
                                        {/* Row 1: Company (Title) + Date */}
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                            <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt', fontWeight: 'bold' }}>
                                                {item.title}
                                            </span>
                                            {item.date && (
                                                <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt' }}>
                                                    {item.date}
                                                </span>
                                            )}
                                        </div>

                                        {/* Row 2: Job Title (Subtitle) + Location */}
                                        {(item.subtitle || item.location) && (
                                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                                                <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt', fontStyle: 'italic' }}>
                                                    {item.subtitle}
                                                </span>
                                                {item.location && (
                                                    <span style={{ fontFamily: 'Arial, Helvetica, sans-serif', fontSize: '11pt' }}>
                                                        {item.location}
                                                    </span>
                                                )}
                                            </div>
                                        )}

                                        {/* Bullets */}
                                        {item.bullets && (
                                            <ul style={{ margin: '4px 0 0 0', paddingLeft: '18px' }}>
                                                {item.bullets.split('\n').filter(Boolean).map((line, i) => {
                                                    const cleanLine = line.replace(/^•\s*/, '');
                                                    return (
                                                        <li key={i} style={{
                                                            fontFamily: 'Arial, Helvetica, sans-serif',
                                                            fontSize: '11pt',
                                                            marginBottom: '3px',
                                                            listStyleType: 'disc'
                                                        }}>
                                                            {cleanLine}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                        )}
                                    </div>
                                </ItemWrapper>
                            ))}
                        </div>
                    </SectionWrapper>
                )
            })}
        </div>
    );
};
