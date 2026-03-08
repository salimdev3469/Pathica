export interface SeoSection {
  heading: string;
  body: string;
  bullets: string[];
  ctaLabel?: string;
  ctaHref?: string;
}

export interface SeoIntentPageData {
  slug: string;
  metaTitle: string;
  metaDescription: string;
  heroTitle: string;
  heroSubtitle: string;
  searchIntent: string;
  pageStructure: string[];
  contentSections: SeoSection[];
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
}

export const seoIntentPages: SeoIntentPageData[] = [
  {
    slug: 'resume-builder',
    metaTitle: 'Resume Builder | Build an ATS-Friendly Resume Online',
    metaDescription: 'Use Pathica resume builder to create an ATS-friendly resume online in minutes. Start free and export a clean professional CV.',
    heroTitle: 'Build an ATS-Friendly Resume in Minutes',
    heroSubtitle: 'Create a professional resume that hiring systems can read and recruiters can scan fast.',
    searchIntent: 'Users want an online resume builder they can use immediately.',
    pageStructure: ['Hero', 'How it works', 'Feature blocks', 'Example resumes', 'FAQ', 'Final CTA'],
    contentSections: [
      {
        heading: 'How the Builder Works',
        body: 'Pathica gives you a guided editor so you can build a clean resume without formatting headaches.',
        bullets: ['Fill your details in structured sections', 'Reorder sections with drag and drop', 'Export ATS-safe PDF in one click'],
      },
      {
        heading: 'Why ATS-Friendly Formatting Matters',
        body: 'Most companies use applicant tracking systems before human review.',
        bullets: ['Simple layout prevents parsing errors', 'Clear headings improve section mapping', 'Keyword-ready sections improve relevance'],
      },
      {
        heading: 'Build Your Resume Faster',
        body: 'Use example-based prompts and content suggestions to avoid blank-page friction.',
        bullets: ['Professional summary starter lines', 'Skills and bullet point guidance', 'Role-focused example structure'],
        ctaLabel: 'Create My Resume Free',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Create My Resume Free',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'View Resume Examples',
    secondaryCtaHref: '/resume-examples',
  },
  {
    slug: 'free-resume-builder',
    metaTitle: 'Free Resume Builder | Build Your Resume Online',
    metaDescription: 'Build your resume for free with Pathica. Get a structured ATS-friendly resume builder and export your first professional CV.',
    heroTitle: 'Free Resume Builder for Job Seekers',
    heroSubtitle: 'Start with zero cost and build your first ATS-friendly resume quickly.',
    searchIntent: 'Users are searching specifically for a free resume builder.',
    pageStructure: ['Hero', 'What is free', 'Feature proof', 'Resume sample', 'FAQ', 'Final CTA'],
    contentSections: [
      {
        heading: 'What You Get for Free',
        body: 'You can create and structure a professional resume without paying upfront.',
        bullets: ['Guided resume editor', 'ATS-safe layout defaults', 'Export-ready PDF flow'],
      },
      {
        heading: 'Who This Is For',
        body: 'Ideal for students, entry-level candidates, and active job switchers.',
        bullets: ['Build first draft in under 15 minutes', 'Adapt resume for different roles', 'Improve clarity before applying'],
      },
      {
        heading: 'Start Now and Iterate Later',
        body: 'Your first resume should be live quickly. Refinement can happen over time.',
        bullets: ['No complex setup', 'Simple section-based editing', 'Fast publish workflow'],
        ctaLabel: 'Start Free Builder',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Start Free Builder',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'See ATS Resume Guide',
    secondaryCtaHref: '/ats-friendly-resume',
  },
  {
    slug: 'resume-examples',
    metaTitle: 'Resume Examples by Role and Experience',
    metaDescription: 'Browse resume examples by role, seniority, and career stage. Use proven structures and adapt them inside Pathica.',
    heroTitle: 'Resume Examples You Can Actually Use',
    heroSubtitle: 'Explore practical resume samples and turn them into your own ATS-friendly resume.',
    searchIntent: 'Users want resume examples before writing their own.',
    pageStructure: ['Hero', 'Examples by role', 'Examples by experience level', 'Best practices', 'CTA'],
    contentSections: [
      {
        heading: 'Examples by Role',
        body: 'Choose a structure that mirrors your target job.',
        bullets: ['Software engineer resume example', 'Marketing resume example', 'Internship resume example'],
      },
      {
        heading: 'Examples by Experience',
        body: 'Different experience levels need different emphasis.',
        bullets: ['Student-first education layout', 'Entry-level skills-forward structure', 'Experienced impact-focused bullet points'],
      },
      {
        heading: 'How to Adapt an Example',
        body: 'Never copy blindly. Align each section to your own achievements and keywords.',
        bullets: ['Match keywords to job description', 'Use measurable outcomes in bullets', 'Keep content concise and scannable'],
        ctaLabel: 'Use an Example in Builder',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Use an Example in Builder',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'How to Write a Resume',
    secondaryCtaHref: '/how-to-write-a-resume',
  },
  {
    slug: 'ats-friendly-resume',
    metaTitle: 'ATS-Friendly Resume Guide + Checklist',
    metaDescription: 'Learn what makes a resume ATS-friendly. Follow a practical checklist and build a resume format that passes screening systems.',
    heroTitle: 'How to Create an ATS-Friendly Resume',
    heroSubtitle: 'Use clear structure, relevant keywords, and parsing-safe formatting to improve interview chances.',
    searchIntent: 'Users want to optimize resumes for ATS systems.',
    pageStructure: ['Hero', 'ATS fundamentals', 'Checklist', 'Common mistakes', 'CTA'],
    contentSections: [
      {
        heading: 'ATS Basics',
        body: 'ATS tools parse your resume into structured data fields.',
        bullets: ['Use standard section titles', 'Avoid complex visual elements', 'Submit text-readable PDF'],
      },
      {
        heading: 'ATS Resume Checklist',
        body: 'Run this checklist before every application.',
        bullets: ['Targeted keywords included naturally', 'Clear chronology in experience', 'Skills aligned with job requirements'],
      },
      {
        heading: 'Common ATS Errors',
        body: 'Many resumes fail before human review due to avoidable formatting issues.',
        bullets: ['Tables and columns that break parsing', 'Missing job-specific terms', 'Vague bullet points without outcomes'],
        ctaLabel: 'Build ATS Resume Now',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build ATS Resume Now',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Try ATS Resume Checker',
    secondaryCtaHref: '/ats-resume-checker',
  },
  {
    slug: 'resume-template',
    metaTitle: 'Resume Templates for Modern Job Applications',
    metaDescription: 'Choose resume templates designed for ATS compatibility and recruiter readability. Start from template and customize quickly.',
    heroTitle: 'Resume Templates Built for Hiring Workflows',
    heroSubtitle: 'Start from proven layout patterns and adapt content for your role.',
    searchIntent: 'Users are looking for resume templates to start quickly.',
    pageStructure: ['Hero', 'Template categories', 'Selection guide', 'Template usage tips', 'CTA'],
    contentSections: [
      {
        heading: 'Template Categories',
        body: 'Choose based on role and experience level, not visual trend alone.',
        bullets: ['Classic professional template', 'Student and internship template', 'Technical role template'],
      },
      {
        heading: 'How to Pick the Right Template',
        body: 'Your template should support your story, not distract from it.',
        bullets: ['Prioritize readability', 'Keep section hierarchy clear', 'Avoid heavy decorative design'],
      },
      {
        heading: 'Template Customization Best Practices',
        body: 'Tailor each template with role-specific language.',
        bullets: ['Rewrite summary for each target role', 'Adjust skills list by job post', 'Highlight measurable outcomes'],
        ctaLabel: 'Choose a Template',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Choose a Template',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Browse Resume Examples',
    secondaryCtaHref: '/resume-examples',
  },
  {
    slug: 'resume-format',
    metaTitle: 'Best Resume Format in 2026 (With Examples)',
    metaDescription: 'Compare resume formats: reverse chronological, functional, and hybrid. Choose the best resume format for your experience level.',
    heroTitle: 'Choose the Best Resume Format for Your Background',
    heroSubtitle: 'Understand when to use reverse chronological, functional, or hybrid formats.',
    searchIntent: 'Users want to understand which resume format they should use.',
    pageStructure: ['Hero', 'Format comparison', 'Use cases', 'Mistakes to avoid', 'CTA'],
    contentSections: [
      {
        heading: 'Reverse Chronological Format',
        body: 'Best for most applicants with relevant experience history.',
        bullets: ['Most ATS-friendly structure', 'Easy recruiter scan', 'Strong for progressive career stories'],
      },
      {
        heading: 'Functional and Hybrid Formats',
        body: 'Useful in niche situations but require careful execution.',
        bullets: ['Functional for skill-heavy career pivots', 'Hybrid for balancing skills and timeline', 'Keep chronology visible when possible'],
      },
      {
        heading: 'Recommended Format Decision',
        body: 'When in doubt, use reverse chronological and tailor content by role.',
        bullets: ['Simple and proven', 'Easy to update quickly', 'High compatibility with ATS'],
        ctaLabel: 'Apply Recommended Format',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Apply Recommended Format',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Read Resume Writing Guide',
    secondaryCtaHref: '/how-to-write-a-resume',
  },
  {
    slug: 'how-to-write-a-resume',
    metaTitle: 'How to Write a Resume (Step-by-Step Guide)',
    metaDescription: 'Learn how to write a resume step by step: headline, summary, experience, skills, and ATS optimization tips.',
    heroTitle: 'How to Write a Resume That Gets Interviews',
    heroSubtitle: 'Follow a practical step-by-step framework and avoid the most common resume mistakes.',
    searchIntent: 'Users want a complete beginner-to-practical resume writing guide.',
    pageStructure: ['Hero', 'Step-by-step tutorial', 'Examples', 'Mistakes', 'CTA'],
    contentSections: [
      {
        heading: 'Step-by-Step Resume Writing Process',
        body: 'Write your resume in this order to move faster and stay focused.',
        bullets: ['Define target role first', 'Write summary and headline', 'Add quantified achievements'],
      },
      {
        heading: 'What Recruiters Look For',
        body: 'Clarity, relevance, and evidence of impact are key.',
        bullets: ['Role relevance in first screen', 'Keyword alignment to job post', 'Outcome-driven bullet points'],
      },
      {
        heading: 'Final Review Before Applying',
        body: 'Do one strict quality pass before sending.',
        bullets: ['Check grammar and consistency', 'Trim filler words', 'Verify ATS-safe formatting'],
        ctaLabel: 'Write My Resume Now',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Write My Resume Now',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'See Resume Format Options',
    secondaryCtaHref: '/resume-format',
  },
  {
    slug: 'entry-level-resume-example',
    metaTitle: 'Entry-Level Resume Example + Writing Tips',
    metaDescription: 'See a practical entry-level resume example and learn how to highlight education, projects, and transferable skills.',
    heroTitle: 'Entry-Level Resume Example',
    heroSubtitle: 'Build a strong first resume even with limited work experience.',
    searchIntent: 'Users with little experience want a concrete resume example.',
    pageStructure: ['Hero', 'Example structure', 'Section guidance', 'Optimization tips', 'CTA'],
    contentSections: [
      {
        heading: 'Entry-Level Resume Structure',
        body: 'Focus on potential, projects, and proof of initiative.',
        bullets: ['Strong summary with role target', 'Skills and tools section near top', 'Projects and coursework relevance'],
      },
      {
        heading: 'What to Emphasize',
        body: 'Employers evaluate readiness and learning speed.',
        bullets: ['Internships and volunteer work', 'Certifications and bootcamps', 'Outcome-based project bullets'],
      },
      {
        heading: 'Make It ATS-Friendly',
        body: 'Use role keywords directly from job posts.',
        bullets: ['Match skill terms exactly', 'Use standard section labels', 'Keep concise and readable'],
        ctaLabel: 'Build Entry-Level Resume',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Entry-Level Resume',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Student Resume Example',
    secondaryCtaHref: '/student-resume-example',
  },
  {
    slug: 'software-engineer-resume-example',
    metaTitle: 'Software Engineer Resume Example + Template',
    metaDescription: 'Software engineer resume example with project bullets, impact metrics, and ATS-ready keyword guidance.',
    heroTitle: 'Software Engineer Resume Example',
    heroSubtitle: 'Show technical depth and impact clearly with recruiter-friendly structure.',
    searchIntent: 'Developers need a role-specific resume example and phrasing guidance.',
    pageStructure: ['Hero', 'Example sections', 'Technical bullet writing', 'Keyword guidance', 'CTA'],
    contentSections: [
      {
        heading: 'Recommended Engineer Resume Sections',
        body: 'Prioritize problem-solving impact and production outcomes.',
        bullets: ['Summary with domain and stack', 'Experience with measurable engineering impact', 'Projects with architecture highlights'],
      },
      {
        heading: 'How to Write Better Engineering Bullets',
        body: 'Use challenge-action-result format.',
        bullets: ['Mention scale and latency metrics', 'Reference system improvements', 'Connect work to business outcomes'],
      },
      {
        heading: 'ATS Keywords for Engineering Roles',
        body: 'Align with the target job description language.',
        bullets: ['Framework and language keywords', 'Cloud and deployment tools', 'Testing and system design terms'],
        ctaLabel: 'Build Engineer Resume',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Engineer Resume',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Resume Skills Examples',
    secondaryCtaHref: '/resume-skills-examples',
  },
  {
    slug: 'internship-resume-example',
    metaTitle: 'Internship Resume Example for Students',
    metaDescription: 'Internship resume example for students with no full-time experience. Learn how to show projects, coursework, and skills.',
    heroTitle: 'Internship Resume Example',
    heroSubtitle: 'Create a focused internship resume that highlights potential and practical skills.',
    searchIntent: 'Students want internship-focused resume examples.',
    pageStructure: ['Hero', 'Internship sample structure', 'No-experience tactics', 'Checklist', 'CTA'],
    contentSections: [
      {
        heading: 'Internship Resume Layout',
        body: 'Show learning velocity and practical evidence of ability.',
        bullets: ['Education and coursework context', 'Project-based achievements', 'Relevant technical and soft skills'],
      },
      {
        heading: 'If You Have No Work Experience',
        body: 'Use alternative proof sections effectively.',
        bullets: ['Hackathons and student organizations', 'Open-source or class projects', 'Volunteer contributions'],
      },
      {
        heading: 'Internship Application Checklist',
        body: 'Small details can improve conversion significantly.',
        bullets: ['Role-specific summary line', 'Skills mapped to posting', 'Clean and brief bullet writing'],
        ctaLabel: 'Build Internship Resume',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Internship Resume',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Entry-Level Resume Example',
    secondaryCtaHref: '/entry-level-resume-example',
  },
  {
    slug: 'student-resume-example',
    metaTitle: 'Student Resume Example (No Experience Friendly)',
    metaDescription: 'Student resume example for first job applications. Learn how to highlight education, activities, and project work.',
    heroTitle: 'Student Resume Example',
    heroSubtitle: 'Create a first-job resume that is simple, professional, and ATS-safe.',
    searchIntent: 'Students need examples and structure for first resumes.',
    pageStructure: ['Hero', 'Student sample format', 'Section tips', 'Common mistakes', 'CTA'],
    contentSections: [
      {
        heading: 'Student Resume Core Structure',
        body: 'Keep it clear and relevant to your target job.',
        bullets: ['Education near top', 'Projects and activities with outcomes', 'Focused skills list'],
      },
      {
        heading: 'What Recruiters Expect from Students',
        body: 'They evaluate readiness, reliability, and communication.',
        bullets: ['Proof of initiative', 'Ability to learn quickly', 'Clear writing and consistency'],
      },
      {
        heading: 'Avoid These Student Resume Mistakes',
        body: 'Common errors reduce interview chances.',
        bullets: ['Overlong objective statements', 'Generic skill lists', 'Unstructured formatting'],
        ctaLabel: 'Build Student Resume',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Student Resume',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Internship Resume Example',
    secondaryCtaHref: '/internship-resume-example',
  },
  {
    slug: 'resume-summary-examples',
    metaTitle: 'Resume Summary Examples by Role',
    metaDescription: 'Browse resume summary examples for different jobs and experience levels. Copy, adapt, and use in your own resume.',
    heroTitle: 'Resume Summary Examples',
    heroSubtitle: 'Get summary lines that are clear, role-focused, and ATS-aware.',
    searchIntent: 'Users need ready-to-adapt summary statements.',
    pageStructure: ['Hero', 'Examples by role', 'How to customize', 'Checklist', 'CTA'],
    contentSections: [
      {
        heading: 'What Makes a Strong Resume Summary',
        body: 'A strong summary quickly states role fit and value.',
        bullets: ['Target role in first line', 'Key strengths and tools', 'Outcome-oriented language'],
      },
      {
        heading: 'Summary Example Patterns',
        body: 'Use role-specific phrasing, not generic statements.',
        bullets: ['Entry-level summary formula', 'Technical role summary formula', 'Career-change summary formula'],
      },
      {
        heading: 'Customize in 60 Seconds',
        body: 'Adapt one base summary for each application.',
        bullets: ['Swap target title', 'Inject JD keywords', 'Trim to 2-3 lines'],
        ctaLabel: 'Use in Resume Builder',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Use in Resume Builder',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Resume Objective Examples',
    secondaryCtaHref: '/resume-objective-examples',
  },
  {
    slug: 'resume-skills-examples',
    metaTitle: 'Resume Skills Examples (Hard and Soft Skills)',
    metaDescription: 'Find resume skills examples by role and industry. Learn how to choose relevant hard skills and soft skills for ATS.',
    heroTitle: 'Resume Skills Examples',
    heroSubtitle: 'Build a targeted skills section that aligns with job descriptions.',
    searchIntent: 'Users want specific skills to include in resumes.',
    pageStructure: ['Hero', 'Skills by role', 'Hard vs soft skills', 'Placement tips', 'CTA'],
    contentSections: [
      {
        heading: 'Choose Relevant Skills First',
        body: 'Your skills section should mirror target role requirements.',
        bullets: ['Extract top skills from job description', 'Prioritize technical requirements', 'Keep list concise and specific'],
      },
      {
        heading: 'Hard Skills and Soft Skills Balance',
        body: 'Use both types but let role requirements lead.',
        bullets: ['Hard skills for qualification match', 'Soft skills with proof in bullet points', 'Avoid vague standalone terms'],
      },
      {
        heading: 'Where to Place Skills in Resume',
        body: 'Placement changes by experience level.',
        bullets: ['Near top for entry-level candidates', 'After experience for senior roles', 'Repeat in context inside achievements'],
        ctaLabel: 'Build Skills Section',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Skills Section',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Keyword Optimizer Tool',
    secondaryCtaHref: '/resume-keyword-optimizer',
  },
  {
    slug: 'cover-letter-examples',
    metaTitle: 'Cover Letter Examples by Role',
    metaDescription: 'Browse practical cover letter examples by role and experience level. Learn a clear format that complements your resume.',
    heroTitle: 'Cover Letter Examples',
    heroSubtitle: 'Use concise, role-specific cover letter structures that support your resume.',
    searchIntent: 'Users want cover letter examples and writing guidance.',
    pageStructure: ['Hero', 'Example structure', 'Role examples', 'Mistakes', 'CTA'],
    contentSections: [
      {
        heading: 'Cover Letter Structure That Works',
        body: 'Keep your letter focused and role-specific.',
        bullets: ['Opening with role and context', 'Body with relevant achievements', 'Close with clear interest and next step'],
      },
      {
        heading: 'How to Align Cover Letter with Resume',
        body: 'Your letter should add context, not repeat everything.',
        bullets: ['Expand 1-2 key achievements', 'Match tone to company', 'Reference role priorities'],
      },
      {
        heading: 'Common Cover Letter Mistakes',
        body: 'Avoid broad and generic language.',
        bullets: ['Overly long paragraphs', 'No company-specific signal', 'No measurable evidence'],
        ctaLabel: 'Build Resume First',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Build Resume First',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'Resume Summary Examples',
    secondaryCtaHref: '/resume-summary-examples',
  },
  {
    slug: 'resume-objective-examples',
    metaTitle: 'Resume Objective Examples for Job Seekers',
    metaDescription: 'Resume objective examples for students, entry-level applicants, and career switchers. Learn when to use objective vs summary.',
    heroTitle: 'Resume Objective Examples',
    heroSubtitle: 'Use objective statements when they add clarity for your current career stage.',
    searchIntent: 'Users are searching for objective statement examples.',
    pageStructure: ['Hero', 'When to use objective', 'Examples by profile', 'Best practices', 'CTA'],
    contentSections: [
      {
        heading: 'When to Use a Resume Objective',
        body: 'Objective sections are useful in specific cases.',
        bullets: ['Students and first-job applicants', 'Career changers with new target role', 'Candidates with limited direct experience'],
      },
      {
        heading: 'Objective Statement Formula',
        body: 'Keep it short, targeted, and value-oriented.',
        bullets: ['State target role clearly', 'Mention relevant strengths', 'Connect to company value'],
      },
      {
        heading: 'Objective vs Summary',
        body: 'Choose the format that best represents your profile.',
        bullets: ['Objective for transition context', 'Summary for experienced professionals', 'Never use vague generic lines'],
        ctaLabel: 'Create Resume with Objective',
        ctaHref: '/cv/new',
      },
    ],
    primaryCtaLabel: 'Create Resume with Objective',
    primaryCtaHref: '/cv/new',
    secondaryCtaLabel: 'How to Write a Resume',
    secondaryCtaHref: '/how-to-write-a-resume',
  },
];

export function getSeoPage(slug: string): SeoIntentPageData {
  const page = seoIntentPages.find((item) => item.slug === slug);
  if (!page) {
    throw new Error(`SEO page not found for slug: ${slug}`);
  }

  return page;
}
