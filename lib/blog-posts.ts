export interface BlogPostData {
  slug: string;
  title: string;
  category: 'resume' | 'job-application' | 'interview' | 'career';
  keyword: string;
  searchIntent: string;
  excerpt: string;
}

const rawPosts: Omit<BlogPostData, 'slug'>[] = [
  { title: 'How to Write a Resume in 2026', category: 'resume', keyword: 'how to write a resume', searchIntent: 'Learn resume writing from scratch', excerpt: 'A practical framework for writing a clear and interview-ready resume.' },
  { title: 'Best Resume Format for Job Seekers', category: 'resume', keyword: 'best resume format', searchIntent: 'Compare resume format types', excerpt: 'Choose the format that best fits your experience and target role.' },
  { title: 'ATS-Friendly Resume Checklist', category: 'resume', keyword: 'ats friendly resume checklist', searchIntent: 'Improve ATS compatibility', excerpt: 'Use this checklist to avoid ATS parsing mistakes before applying.' },
  { title: 'Resume Mistakes That Get You Rejected', category: 'resume', keyword: 'resume mistakes', searchIntent: 'Avoid common resume errors', excerpt: 'Fix the high-impact issues that hurt response rates.' },
  { title: 'One-Page Resume: When to Use It', category: 'resume', keyword: 'one page resume', searchIntent: 'Decide ideal resume length', excerpt: 'Know when one page is enough and when it limits your story.' },
  { title: 'Two-Page Resume: Is It Ever Okay?', category: 'resume', keyword: 'two page resume', searchIntent: 'Understand two-page resume use cases', excerpt: 'A simple decision guide for resume length by career stage.' },
  { title: 'Resume Summary Examples by Industry', category: 'resume', keyword: 'resume summary examples', searchIntent: 'Find summary statement examples', excerpt: 'Use industry-specific summary examples and adapt them fast.' },
  { title: 'Resume Objective Examples for Beginners', category: 'resume', keyword: 'resume objective examples', searchIntent: 'Find beginner objective statement examples', excerpt: 'When to use an objective and how to write one that works.' },
  { title: 'Resume Skills Examples Employers Want', category: 'resume', keyword: 'resume skills examples', searchIntent: 'Find relevant resume skills', excerpt: 'Build a targeted skills section without generic filler.' },
  { title: 'Work Experience Section: Best Practices', category: 'resume', keyword: 'work experience resume section', searchIntent: 'Improve experience section writing', excerpt: 'Write role achievements that are measurable and recruiter-friendly.' },
  { title: 'Education Section on Resume (With Examples)', category: 'resume', keyword: 'education section resume', searchIntent: 'Format education section correctly', excerpt: 'Examples for students, graduates, and experienced candidates.' },
  { title: 'How to List Certifications on a Resume', category: 'resume', keyword: 'certifications on resume', searchIntent: 'Place certifications correctly', excerpt: 'Show credentials clearly and match them to role requirements.' },
  { title: 'How to Add Projects to a Resume', category: 'resume', keyword: 'projects on resume', searchIntent: 'Add project section effectively', excerpt: 'Project bullets that communicate real outcomes and ownership.' },
  { title: 'How to Write Resume Bullet Points', category: 'resume', keyword: 'resume bullet points', searchIntent: 'Write stronger resume bullets', excerpt: 'Transform weak bullets into impact-driven statements.' },
  { title: 'Action Verbs for Resume Writing', category: 'resume', keyword: 'action verbs for resume', searchIntent: 'Find strong resume verbs', excerpt: 'A practical verb bank to make your achievements more compelling.' },
  { title: 'Entry-Level Resume Example (No Experience)', category: 'resume', keyword: 'entry level resume example', searchIntent: 'See no-experience resume example', excerpt: 'Build confidence with a proven first-job resume structure.' },
  { title: 'Internship Resume Example for Students', category: 'resume', keyword: 'internship resume example', searchIntent: 'Find internship resume template', excerpt: 'A student-focused internship resume framework and checklist.' },
  { title: 'Student Resume Example for First Job', category: 'resume', keyword: 'student resume example', searchIntent: 'Build first student resume', excerpt: 'Show potential and transferable skills even without formal experience.' },
  { title: 'Software Engineer Resume Example', category: 'resume', keyword: 'software engineer resume example', searchIntent: 'Find software engineer resume sample', excerpt: 'Highlight technical impact with role-specific resume structure.' },
  { title: 'Data Analyst Resume Example', category: 'resume', keyword: 'data analyst resume example', searchIntent: 'Find data analyst resume sample', excerpt: 'Present analytics projects and business outcomes effectively.' },
  { title: 'Product Manager Resume Example', category: 'resume', keyword: 'product manager resume example', searchIntent: 'Find PM resume sample', excerpt: 'Show product impact, roadmap ownership, and stakeholder execution.' },
  { title: 'Marketing Resume Example', category: 'resume', keyword: 'marketing resume example', searchIntent: 'Find marketing resume sample', excerpt: 'Use clear metrics to present growth and campaign results.' },
  { title: 'Sales Resume Example', category: 'resume', keyword: 'sales resume example', searchIntent: 'Find sales resume sample', excerpt: 'Show quota performance, pipeline growth, and closing results.' },
  { title: 'Customer Service Resume Example', category: 'resume', keyword: 'customer service resume example', searchIntent: 'Find customer service resume sample', excerpt: 'Highlight communication, resolution rate, and customer outcomes.' },
  { title: 'Graphic Designer Resume Example', category: 'resume', keyword: 'graphic designer resume example', searchIntent: 'Find designer resume sample', excerpt: 'Balance portfolio context with ATS-readable resume structure.' },
  { title: 'UX Designer Resume Example', category: 'resume', keyword: 'ux designer resume example', searchIntent: 'Find UX resume sample', excerpt: 'Present case-study impact and cross-functional collaboration clearly.' },
  { title: 'Nurse Resume Example', category: 'resume', keyword: 'nurse resume example', searchIntent: 'Find nursing resume sample', excerpt: 'Emphasize patient care outcomes and clinical competencies.' },
  { title: 'Teacher Resume Example', category: 'resume', keyword: 'teacher resume example', searchIntent: 'Find teacher resume sample', excerpt: 'Show classroom impact, curriculum skills, and student outcomes.' },
  { title: 'Accountant Resume Example', category: 'resume', keyword: 'accountant resume example', searchIntent: 'Find accountant resume sample', excerpt: 'Highlight compliance, reporting quality, and cost optimization impact.' },
  { title: 'HR Resume Example', category: 'resume', keyword: 'hr resume example', searchIntent: 'Find HR resume sample', excerpt: 'Present hiring, retention, and process optimization achievements.' },
  { title: 'Remote Job Resume Tips', category: 'job-application', keyword: 'remote job resume tips', searchIntent: 'Improve remote role applications', excerpt: 'Tailor your resume for distributed teams and async workflows.' },
  { title: 'How to Tailor Your Resume for Each Job', category: 'job-application', keyword: 'tailor resume for job description', searchIntent: 'Customize resume per application', excerpt: 'A fast method to align your resume with each posting.' },
  { title: 'Keyword Optimization for ATS Resumes', category: 'job-application', keyword: 'resume keyword optimization', searchIntent: 'Optimize ATS keyword matching', excerpt: 'Use job-description terms strategically without keyword stuffing.' },
  { title: 'Resume vs CV: What Is the Difference?', category: 'resume', keyword: 'resume vs cv difference', searchIntent: 'Understand resume and CV differences', excerpt: 'Choose the right document based on country and role expectations.' },
  { title: 'Best Resume Templates for 2026', category: 'resume', keyword: 'best resume templates', searchIntent: 'Find current resume templates', excerpt: 'Template selection criteria focused on readability and ATS safety.' },
  { title: 'Minimal Resume Templates That Work', category: 'resume', keyword: 'minimal resume templates', searchIntent: 'Find minimal resume designs', excerpt: 'Simple layouts that look professional and parse correctly.' },
  { title: 'Creative Resume Templates: Pros and Cons', category: 'resume', keyword: 'creative resume templates', searchIntent: 'Evaluate creative template impact', excerpt: 'When creative resumes help and when they hurt your chances.' },
  { title: 'How to Write a Career Change Resume', category: 'resume', keyword: 'career change resume', searchIntent: 'Create resume for career switch', excerpt: 'Frame transferable skills and transition narrative effectively.' },
  { title: 'How to Explain Employment Gaps on Resume', category: 'resume', keyword: 'employment gap resume', searchIntent: 'Address employment gaps clearly', excerpt: 'Use concise wording to reduce recruiter concerns.' },
  { title: 'How to List Freelance Work on Resume', category: 'resume', keyword: 'freelance work on resume', searchIntent: 'Present freelance experience properly', excerpt: 'Position freelance projects as professional, outcome-driven work.' },
  { title: 'How to Write a Federal Resume', category: 'resume', keyword: 'federal resume guide', searchIntent: 'Understand federal resume format', excerpt: 'Core differences between federal and private-sector resume writing.' },
  { title: 'Cover Letter Examples by Job Title', category: 'job-application', keyword: 'cover letter examples', searchIntent: 'Find role-specific cover letter examples', excerpt: 'Use concise examples and adapt quickly for each role.' },
  { title: 'How to Write a Cover Letter in 2026', category: 'job-application', keyword: 'how to write a cover letter', searchIntent: 'Learn cover letter writing', excerpt: 'Build a strong cover letter structure that supports your resume.' },
  { title: 'LinkedIn Profile vs Resume: What Changes?', category: 'job-application', keyword: 'linkedin profile vs resume', searchIntent: 'Align LinkedIn with resume', excerpt: 'Optimize both documents for consistency and conversion.' },
  { title: 'How to Prepare for Behavioral Interviews', category: 'interview', keyword: 'behavioral interview preparation', searchIntent: 'Prepare for behavioral interviews', excerpt: 'Use structure and examples to answer behavioral questions clearly.' },
  { title: 'STAR Method Interview Answers', category: 'interview', keyword: 'star method interview answers', searchIntent: 'Use STAR method effectively', excerpt: 'A practical STAR response framework with sample answer patterns.' },
  { title: 'Common Interview Questions and Answers', category: 'interview', keyword: 'common interview questions', searchIntent: 'Practice interview Q&A', excerpt: 'Prepare concise, role-relevant answers to frequent interview prompts.' },
  { title: 'Salary Negotiation Tips for Job Seekers', category: 'career', keyword: 'salary negotiation tips', searchIntent: 'Negotiate compensation better', excerpt: 'Tactics and scripts for negotiating with confidence and clarity.' },
  { title: 'How to Follow Up After an Interview', category: 'interview', keyword: 'follow up after interview', searchIntent: 'Send interview follow-up correctly', excerpt: 'Timing, email format, and examples for better post-interview outcomes.' },
  { title: 'Job Application Tracker Template', category: 'job-application', keyword: 'job application tracker', searchIntent: 'Track applications and status', excerpt: 'A simple workflow to track applications and improve consistency.' },
  { title: 'Best Fonts and Formatting for Resumes', category: 'resume', keyword: 'best resume fonts', searchIntent: 'Choose readable resume typography', excerpt: 'Formatting and typography choices that improve readability.' },
  { title: 'Should You Include a Photo on Your Resume?', category: 'resume', keyword: 'photo on resume', searchIntent: 'Decide whether to include photo', excerpt: 'Country and industry context for resume photos.' },
  { title: 'Resume Headline Examples That Get Clicks', category: 'resume', keyword: 'resume headline examples', searchIntent: 'Write better resume headlines', excerpt: 'Headline formats that improve first-impression relevance.' },
  { title: 'Soft Skills vs Hard Skills on Resume', category: 'resume', keyword: 'soft skills vs hard skills resume', searchIntent: 'Balance skill types in resume', excerpt: 'Use both skill types in ways recruiters can verify quickly.' },
  { title: 'How to Quantify Achievements on Resume', category: 'resume', keyword: 'quantify resume achievements', searchIntent: 'Add measurable impact to resume', excerpt: 'Turn responsibilities into quantifiable accomplishments.' },
  { title: 'Internship Cover Letter Examples', category: 'job-application', keyword: 'internship cover letter examples', searchIntent: 'Find internship cover letter models', excerpt: 'Practical templates for student and early-career applicants.' },
  { title: 'Resume Tips for International Job Applications', category: 'job-application', keyword: 'international resume tips', searchIntent: 'Adapt resume for global applications', excerpt: 'Format and language considerations across regions.' },
  { title: 'Best Resume Keywords by Role', category: 'resume', keyword: 'best resume keywords', searchIntent: 'Find resume keywords by job role', excerpt: 'Keyword selection framework by role and seniority.' },
  { title: 'AI Resume Builder: Pros and Cons', category: 'career', keyword: 'ai resume builder pros and cons', searchIntent: 'Evaluate AI resume builder value', excerpt: 'What AI helps with and where manual editing still matters.' },
  { title: 'Resume Review Checklist Before You Apply', category: 'job-application', keyword: 'resume review checklist', searchIntent: 'Final resume QA before apply', excerpt: 'A final pass checklist to reduce avoidable application errors.' },
];

function toSlug(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

export const blogPosts: BlogPostData[] = rawPosts.map((post) => ({
  ...post,
  slug: toSlug(post.title),
}));

export function getBlogPost(slug: string): BlogPostData {
  const post = blogPosts.find((item) => item.slug === slug);
  if (!post) {
    throw new Error(`Blog post not found for slug: ${slug}`);
  }

  return post;
}

export const blogCategories = [
  { id: 'resume', label: 'Resume Writing' },
  { id: 'job-application', label: 'Job Applications' },
  { id: 'interview', label: 'Interview Tips' },
  { id: 'career', label: 'Career Advice' },
] as const;
