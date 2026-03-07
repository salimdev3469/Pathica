# ATS-Compliant PDF Template — Strict Rules & Implementation Guide

## Overview
When generating the CV PDF using Puppeteer, you MUST enforce every rule below without exception. These rules are derived from real ATS system analysis. The user cannot override these rules — they are locked by the system to guarantee ATS compatibility.

---

## Typography Rules (LOCKED — user cannot change)

- **Font family:** Arial ONLY. No serif fonts (no Georgia, Palatino, Times New Roman). No decorative fonts. Apply to every single element: name, contact, section titles, body text, dates.
- **Font sizes:**
  - Full name: 18pt
  - Contact info line: 10pt
  - Section titles: 12pt bold
  - Job title / Company name: 11pt bold
  - Body text / bullet points: 11pt regular
  - Dates: 11pt regular
- **Line height:** 1.4 for body text, 1.2 for section titles
- **Bold usage:** ONLY for company names, job titles, project names, and section headers. Never bold random keywords inside bullet point sentences.
- **Italic usage:** ONLY for degree names and school names in Education section.
- **Color:** #000000 black ONLY for all text. No gray, no blue, no colored text anywhere. Exception: URLs must be written as plain black text, not blue hyperlinks.

---

## Layout Rules (LOCKED)

- **Single column ONLY.** No multi-column layouts, no CSS grid with multiple columns, no flexbox rows for content.
- **No tables.** Never use `<table>`, `<tr>`, `<td>` for layout purposes.
- **No text boxes.** No absolutely positioned content blocks.
- **Page size:** A4 (794px × 1123px at 96dpi, or use Puppeteer's `format: 'A4'`)
- **Margins:** 54px (≈0.75 inch) on all four sides. Never less than this.
- **Page width for content:** 686px (794 - 54 - 54)

---

## Contact Information Line (CRITICAL)

### ❌ NEVER do this:
```html
<!-- WRONG: Unicode icons break ATS parsing -->
<p>☎ +91-99999 99999 &nbsp; ✉ email@gmail.com &nbsp; <img src="linkedin-icon.svg"/> linkedin.com/in/user</p>
```

### ✅ ALWAYS do this:
```html
<!-- CORRECT: Plain text, pipe separator, no icons, no symbols -->
<p style="text-align: center; font-size: 10pt; font-family: Arial;">
  +91-99999 99999 | email@gmail.com | linkedin.com/in/username | github.com/username
</p>
```

**Rules:**
- Separator between items: ` | ` (space-pipe-space)
- No Unicode symbols (no ☎ ✉ 📧 or any other symbol)
- No SVG or PNG icons
- No emoji
- All plain text, same font, same size, same color
- Write full URLs without hyperlinking (no `<a>` tags)

---

## Section Title Rules
```html
<!-- CORRECT section title format -->
<div style="margin-top: 16px; margin-bottom: 6px;">
  <h2 style="
    font-family: Arial;
    font-size: 12pt;
    font-weight: bold;
    text-transform: uppercase;
    color: #000000;
    margin: 0 0 3px 0;
    padding-bottom: 3px;
    border-bottom: 1.5px solid #000000;
    letter-spacing: 0.5px;
  ">EXPERIENCE</h2>
</div>
```

**Rules:**
- ALL CAPS
- Bold
- Thin horizontal rule beneath (border-bottom)
- No background color
- No colored text
- No icons next to title
- Use ATS-standard names (see mapping below)

### Section Name Mapping (ATS Standard)
Always output these exact standard names regardless of what the user typed:

| User might type | Output in PDF |
|----------------|---------------|
| Work Experience / Career / Jobs | EXPERIENCE |
| Education / School / Studies | EDUCATION |
| Skills / Technical Skills / Tools | SKILLS |
| Projects / Portfolio / Work | PROJECTS |
| Certifications / Certificates / Courses | CERTIFICATIONS |
| Summary / About Me / Objective | PROFILE SUMMARY |
| Languages | LANGUAGES |
| Volunteer / Volunteering | VOLUNTEER EXPERIENCE |
| Awards / Achievements | ACHIEVEMENTS |

---

## Lists and Bullet Points (CRITICAL)

### ❌ NEVER do this:
```html
<!-- WRONG: Multi-column list — ATS reads left-to-right across columns, creates nonsense -->
<ul style="column-count: 2;">
  <li>Data Integrity</li>
  <li>Data Governance</li>
  <li>Generative AI</li>
  <li>Requirement Gathering</li>
</ul>
```

### ✅ For Skills/Coursework — always single line or single column:
```html
<!-- CORRECT option 1: comma-separated inline -->
<p style="font-family: Arial; font-size: 11pt;">
  Data Integrity, Data Governance, Generative AI, Requirement Gathering, Data Visualization
</p>

<!-- CORRECT option 2: single column bullet list -->
<ul style="margin: 0; padding-left: 18px; list-style-type: disc;">
  <li style="font-family: Arial; font-size: 11pt; margin-bottom: 3px;">Data Integrity</li>
  <li style="font-family: Arial; font-size: 11pt; margin-bottom: 3px;">Data Governance</li>
</ul>
```

**Rules:**
- `column-count` CSS property: NEVER USE
- `display: grid` with multiple columns for content: NEVER USE
- All bullet points must be in a single column
- Bullet character: standard disc `•` only
- No custom bullet icons or images

---

## Experience / Education Entry Format
```html
<!-- CORRECT experience entry -->
<div style="margin-bottom: 12px;">
  <!-- Row 1: Company + Date (use flexbox only for this single row) -->
  <div style="display: flex; justify-content: space-between; align-items: baseline;">
    <span style="font-family: Arial; font-size: 11pt; font-weight: bold;">Company Name</span>
    <span style="font-family: Arial; font-size: 11pt;">Jun 2024 – Present</span>
  </div>
  <!-- Row 2: Job Title + Location -->
  <div style="display: flex; justify-content: space-between; align-items: baseline;">
    <span style="font-family: Arial; font-size: 11pt; font-style: italic;">Job Title</span>
    <span style="font-family: Arial; font-size: 11pt;">City, Country</span>
  </div>
  <!-- Bullet points -->
  <ul style="margin: 4px 0 0 0; padding-left: 18px;">
    <li style="font-family: Arial; font-size: 11pt; margin-bottom: 3px;">
      Achieved X by doing Y, resulting in Z% improvement.
    </li>
  </ul>
</div>
```

**Date format rules:**
- Always: `Mon YYYY – Mon YYYY` (e.g., `Jun 2024 – Present`)
- Never: `6/2024`, `2024-06`, `June 2024`, `06-2024`
- "Present" for current job, not "Now" or "Current" or "Ongoing"

---

## URLs and Hyperlinks

### ❌ NEVER do this:
```html
<!-- WRONG: Blue clickable link looks fine to humans but some ATS strip href -->
<a href="https://dashboard.example.com" style="color: blue;">Live Dashboard</a>
```

### ✅ ALWAYS do this:
```html
<!-- CORRECT: Plain text URL in parentheses -->
<span style="font-family: Arial; font-size: 11pt;">
  Festive Campaign Analysis | SQL, Power BI (https://dashboard.example.com)
</span>
```

---

## What to NEVER Include in the PDF

These elements will break ATS parsing. The system must never render them:

- No `<img>` tags (no profile photo, no company logos, no icons)
- No SVG graphics
- No CSS `background-image`
- No charts or progress bars for skills (e.g., "JavaScript ████░░ 80%")
- No colored background sections or sidebars
- No header/footer in the PDF (no page numbers, no watermarks)
- No text in PDF headers/footers metadata layer
- No Unicode decorative characters (★ ✓ → ◆ etc.)
- No emoji anywhere

---

## Puppeteer Configuration
```typescript
// /app/api/cv/generate-pdf/route.ts

import puppeteer from 'puppeteer';

export async function POST(req: Request) {
  const { cvData } = await req.json();
  
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  
  const html = generateCVHtml(cvData); // Your HTML template function
  
  await page.setContent(html, { waitUntil: 'networkidle0' });
  
  const pdf = await page.pdf({
    format: 'A4',
    printBackground: false,        // No backgrounds — keeps it clean for ATS
    margin: {
      top: '0.75in',
      bottom: '0.75in',
      left: '0.75in',
      right: '0.75in'
    },
    displayHeaderFooter: false,    // No header/footer
  });
  
  await browser.close();
  
  // Build filename from user's name
  const firstName = cvData.personalInfo?.firstName?.replace(/\s/g, '') || 'CV';
  const lastName = cvData.personalInfo?.lastName?.replace(/\s/g, '') || '';
  const filename = `${firstName}_${lastName}_CV.pdf`;
  
  return new Response(pdf, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}
```

---

## Full HTML Template Function
```typescript
function generateCVHtml(cvData: CVData): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    body {
      font-family: Arial, sans-serif;
      font-size: 11pt;
      color: #000000;
      background: #ffffff;
      width: 794px;
    }
    .page {
      padding: 54px;
      width: 794px;
    }
    .name {
      font-size: 18pt;
      font-weight: bold;
      text-align: center;
      font-family: Arial, sans-serif;
      margin-bottom: 4px;
    }
    .contact-line {
      font-size: 10pt;
      text-align: center;
      font-family: Arial, sans-serif;
      color: #000000;
      margin-bottom: 14px;
    }
    .section-title {
      font-size: 12pt;
      font-weight: bold;
      text-transform: uppercase;
      font-family: Arial, sans-serif;
      border-bottom: 1.5px solid #000000;
      padding-bottom: 3px;
      margin-top: 16px;
      margin-bottom: 8px;
      letter-spacing: 0.5px;
    }
    .entry-header {
      display: flex;
      justify-content: space-between;
      align-items: baseline;
    }
    .entry-company {
      font-weight: bold;
      font-size: 11pt;
      font-family: Arial, sans-serif;
    }
    .entry-date {
      font-size: 11pt;
      font-family: Arial, sans-serif;
    }
    .entry-title {
      font-style: italic;
      font-size: 11pt;
      font-family: Arial, sans-serif;
    }
    .entry-location {
      font-size: 11pt;
      font-family: Arial, sans-serif;
    }
    ul {
      padding-left: 18px;
      margin-top: 4px;
    }
    li {
      font-size: 11pt;
      font-family: Arial, sans-serif;
      margin-bottom: 3px;
      line-height: 1.4;
    }
    .skills-line {
      font-size: 11pt;
      font-family: Arial, sans-serif;
      margin-bottom: 4px;
    }
    .skills-category {
      font-weight: bold;
    }
  </style>
</head>
<body>
  <div class="page">
    
    <!-- NAME -->
    <div class="name">${cvData.personalInfo.fullName}</div>
    
    <!-- CONTACT LINE — plain text, pipe separated, no icons -->
    <div class="contact-line">
      ${[
        cvData.personalInfo.phone,
        cvData.personalInfo.email,
        cvData.personalInfo.linkedin,
        cvData.personalInfo.github,
        cvData.personalInfo.portfolio
      ].filter(Boolean).join(' | ')}
    </div>

    <!-- DYNAMIC SECTIONS -->
    ${cvData.sections.map(section => renderSection(section)).join('')}
    
  </div>
</body>
</html>
  `;
}

function renderSection(section: Section): string {
  const standardTitle = mapSectionTitle(section.title);
  
  return `
    <div class="section-title">${standardTitle}</div>
    ${section.entries.map(entry => renderEntry(entry, section.type)).join('')}
  `;
}

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
```

---

## ATS Compliance Checklist (Run Before Every PDF Export)

Before generating the PDF, validate these programmatically:
```typescript
function validateATSCompliance(cvData: CVData): string[] {
  const warnings: string[] = [];

  // Check for empty sections
  cvData.sections.forEach(section => {
    if (section.entries.length === 0) {
      warnings.push(`Section "${section.title}" is empty — consider removing it`);
    }
  });

  // Check date formats
  const dateRegex = /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec) \d{4}$/;
  // validate all date fields against this regex

  // Check bullet points aren't too long (>2 lines ≈ >200 chars)
  cvData.sections.forEach(section => {
    section.entries.forEach(entry => {
      entry.bullets?.forEach(bullet => {
        if (bullet.length > 200) {
          warnings.push(`A bullet point is too long (${bullet.length} chars). Keep under 200.`);
        }
      });
    });
  });

  return warnings;
}
```

---

## Summary of Absolute Rules

1. Font: Arial everywhere, no exceptions
2. Colors: Black #000000 only, white background only
3. Layout: Single column only, no tables, no multi-column CSS
4. Contact line: Plain text with pipe separator, zero icons or symbols
5. Lists: Single column only, standard disc bullet
6. Dates: "Mon YYYY – Mon YYYY" format only
7. Links: Plain text URLs in parentheses, no blue hyperlinks
8. No images, no icons, no SVG, no emoji, no Unicode decorators
9. Bold: Only for company names, job titles, section headers
10. Margins: 0.75 inch minimum all sides
11. PDF settings: printBackground false, displayHeaderFooter false
12. Filename: FirstName_LastName_CV.pdf