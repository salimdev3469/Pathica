import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase-server';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  COVER_LETTER_CREDIT_COST,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  formatUsd,
  getShopierCheckoutUrl,
} from '@/lib/billing-config';
import { getBillingSummaryText } from '@/lib/billing';
import { HomeCinematicExperience } from '@/components/home/HomeCinematicExperience';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: 'AI Resume Builder, CV Oluşturucu ve Cover Letter Generator',
  description:
    'Pathica ile AI resume builder, CV oluşturucu ve cover letter generator araçlarıyla ATS uyumlu başvuru dosyaları hazırla.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      tr: '/tr',
      'x-default': '/en',
    },
  },
  openGraph: {
    title: 'Pathica | AI Resume Builder, CV Oluşturucu ve Cover Letter Generator',
    description:
      'ATS uyumlu resume, CV ve ön yazı hazırlamak için AI destekli builder, keyword optimizasyonu ve şablonlar.',
    type: 'website',
    url: '/',
    images: [{ url: '/logo_pathica.png', alt: 'Pathica logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathica | AI Resume Builder ve CV Oluşturucu',
    description: 'AI CV oluşturucu, resume builder ve cover letter araçlarıyla hızlı ve ATS odaklı başvurular hazırla.',
    images: ['/logo_pathica.png'],
  },
  keywords: [
    'ai resume builder',
    'resume builder',
    'cv oluşturucu',
    'online cv oluştur',
    'ai cv oluşturucu',
    'cover letter generator',
    'cover letter writing',
    'ön yazı oluşturucu',
    'ön yazı nasıl yazılır',
    'ats resume checker',
    'resume keyword optimizer',
    'resume analyzer',
    'resume templates',
  ],
};

export default async function Home() {
  const supabase = createClient();
  let user: { id: string } | null = null;
  try {
    const {
      data: { user: currentUser },
    } = await supabase.auth.getUser();
    user = currentUser ? { id: currentUser.id } : null;
  } catch {
    user = null;
  }

  const isAuthenticated = Boolean(user);
  const navCtaHref = isAuthenticated ? '/dashboard' : '/register';
  const navCtaLabel = isAuthenticated ? 'Dashboard' : 'Start Free';
  const heroPrimaryHref = isAuthenticated ? '/dashboard' : '/cv/new';
  const heroPrimaryLabel = isAuthenticated ? 'Open Dashboard' : 'Build Free CV';
  const billingSummaryText = getBillingSummaryText('en');
  const logoSrc = getLogoSrc();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pathica.tech').replace(/\/$/, '');

  const faqItems = [
    {
      question: 'How is this different from a general AI chatbot?',
      answer: 'A chatbot rewrites one bullet at a time. Pathica keeps the template, job-match context, ATS structure, and export flow in the same workspace.',
    },
    {
      question: 'Will the resume read as AI-generated?',
      answer: 'The goal is not generic copy. Pathica helps tighten wording around your own experience, results, and target role.',
    },
    {
      question: 'Does it pass applicant tracking systems?',
      answer: 'The builder is structured around ATS-safe section order, simple layout rules, readable spacing, and export-safe formatting.',
    },
    {
      question: 'Can I export to PDF and keep editing later?',
      answer: 'Yes. You can keep iterating in the same workspace and export only when the draft is ready.',
    },
    {
      question: 'Can I use it without design skills?',
      answer: 'Yes. Pathica is opinionated on structure and spacing, so you focus on the content rather than formatting choices.',
    },
  ];

  const proofMetrics = [
    {
      label: 'ATS readability',
      score: 25,
      total: 25,
    },
    {
      label: 'Content quality',
      score: 32,
      total: 35,
    },
    {
      label: 'Writing',
      score: 9,
      total: 10,
    },
    {
      label: 'Job match',
      score: 20,
      total: 25,
    },
    {
      label: 'Application ready',
      score: 5,
      total: 5,
    },
  ];

  const workflowSteps = [
    {
      number: '01',
      icon: 'foundation' as const,
      title: 'Start from a clean base',
      description: 'Open an ATS-safe structure with live preview already in place.',
      label: 'Base',
    },
    {
      number: '02',
      icon: 'tailor' as const,
      title: 'Tailor for the role',
      description: 'Paste the job description and strengthen weak bullets without flattening your tone.',
      label: 'Tailor',
    },
    {
      number: '03',
      icon: 'deliver' as const,
      title: 'Export when it is ready',
      description: 'Keep editing in one place, then export a recruiter-safe PDF only when the draft is tight.',
      label: 'Deliver',
    },
  ];

  const pricingPackages = BILLING_PACKAGES.map((pkg) => {
    const href = isAuthenticated ? '/billing' : '/register';
    const isConfigured = Boolean(getShopierCheckoutUrl(pkg));

    if (pkg.code === 'starter') {
      return {
        id: pkg.code,
        code: pkg.code,
        name: 'Starter',
        displayPrice: formatUsd(pkg.priceUsd),
        description: 'A focused pack for one or two strong application passes.',
        features: [
          '100 AI credits for tailoring and rewrite tools',
          'Good fit for one resume plus a few role adjustments',
          'One-time purchase, no subscription pressure',
        ],
        isPopular: pkg.highlight,
        isConfigured,
        ctaLabel: 'Choose Starter',
        href,
      };
    }

    if (pkg.code === 'pro') {
      return {
        id: pkg.code,
        code: pkg.code,
        name: 'Pro',
        displayPrice: formatUsd(pkg.priceUsd),
        description: 'Best balance for active search, repeated tailoring, and export.',
        features: [
          '300 AI credits for multiple job-specific rewrites',
          'Covers repeated ATS checks and stronger content passes',
          'Most practical pack for multi-role applications',
        ],
        isPopular: pkg.highlight,
        isConfigured,
        ctaLabel: 'Choose Pro',
        href,
      };
    }

    return {
      id: pkg.code,
      code: pkg.code,
      name: 'Mega',
      displayPrice: formatUsd(pkg.priceUsd),
      description: 'A larger pack for heavy iteration, cover letters, and broad search.',
      features: [
        '1000 AI credits for heavier resume and cover letter work',
        'Good fit for broad search or multiple application tracks',
        'One-time checkout, credits stay in your account',
      ],
      isPopular: pkg.highlight,
      isConfigured,
      ctaLabel: 'Choose Mega',
      href,
    };
  });

  const structuredData = [
    {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: 'Pathica',
      url: baseUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Organization',
      name: 'Pathica',
      url: baseUrl,
      logo: `${baseUrl}/logo_pathica.png`,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'SoftwareApplication',
      name: 'Pathica',
      applicationCategory: 'BusinessApplication',
      operatingSystem: 'Web',
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'USD',
      },
      description: 'Pathica helps job seekers build ATS-friendly resumes, tailor content to job descriptions, and export recruiter-ready PDF resumes.',
      featureList: [
        'ATS resume checker',
        'Resume keyword optimizer',
        'AI-assisted resume editing',
      ],
      url: baseUrl,
    },
    {
      '@context': 'https://schema.org',
      '@type': 'FAQPage',
      mainEntity: faqItems.map((item) => ({
        '@type': 'Question',
        name: item.question,
        acceptedAnswer: {
          '@type': 'Answer',
          text: item.answer,
        },
      })),
    },
  ];

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <HomeCinematicExperience
        isAuthenticated={isAuthenticated}
        logoSrc={logoSrc}
        navCtaHref={navCtaHref}
        navCtaLabel={navCtaLabel}
        heroPrimaryHref={heroPrimaryHref}
        heroPrimaryLabel={heroPrimaryLabel}
        heroSecondaryLabel={'See the proof'}
        heroTitleTop={'The AI that gets'}
        heroTitleAccentWords={
          false
            ? ['HRs', 'Engineers', 'Designers', 'Marketers', 'Developers']
            : ['HRs', 'Engineers', 'Designers', 'Marketers', 'Developers']
        }
        heroTitleBottom={'hired.'}
        heroSubtitle={'Write, tailor, check ATS fit, and export from one calm workspace. Pathica helps the final resume feel sharper before the PDF is even sent.'}
        navLabels={{
          proof: 'Proof',
          flow: 'How It Works',
          pricing: 'Pricing',
          questions: 'Questions',
        }}
        heroTrustItems={[
          'ATS-safe structure',
          false ? `${FREE_SIGNUP_EXPORTS} ücretsiz PDF export` : `${FREE_SIGNUP_EXPORTS} free PDF export`,
          false ? `${FREE_SIGNUP_AI_CREDITS} AI kredi` : `${FREE_SIGNUP_AI_CREDITS} AI credits`,
          'No subscription',
        ]}
        proof={{
          label: 'THE PROOF',
          title: 'See what recruiters see, before they do.',
          description: 'Every resume goes through the same screen recruiters use. You see the score, the weak spots, and the stronger rewrite before you export.',
          findings: [
            {
              title: 'Strengths identified',
              body: 'Strong technical skills and quantified bullets with measurable business impact.',
            },
            {
              title: 'Improvement suggestions',
              body: 'Move the most relevant role-specific project higher and tighten the summary around target keywords.',
            },
          ],
          scoreLabel: 'Excellent',
          metrics: proofMetrics,
        }}
        workflow={{
          label: 'THE FLOW',
          title: 'Three moves. One working surface.',
          description: 'You do not need a document, a chatbot, a design tool, and a PDF exporter open at the same time. Pathica compresses the workflow.',
          steps: workflowSteps,
        }}
        quote={{
          label: 'HIRED',
          entries: [
            {
              text: 'I used to rebuild every resume from scratch for each opening. Now I keep one strong base and tailor it in minutes.',
              author: 'Sarah J.',
              role: 'HR Specialist · London',
              initials: 'SJ',
              avatar: '/girl1.png',
            },
            {
              text: 'The useful part is not just rewriting. It keeps the ATS-safe structure stable while I improve the bullets that matter.',
              author: 'David M.',
              role: 'Data Analyst · Berlin',
              initials: 'DM',
              avatar: '/man1.png',
            },
            {
              text: 'My summary and experience read much tighter now. The final application feels designed for the role instead of generally polished.',
              author: 'Elif T.',
              role: 'Product Designer · Istanbul',
              initials: 'ET',
              avatar: '/girl2.png',
            },
          ],
        }}
        stats={{
          label: 'OUTCOMES',
          companyLabel: 'users applying across teams like',
          badges: [
            {
              label: 'Operations',
              detail: 'Process-heavy roles that need clean metrics and readable bullet structure.',
            },
            {
              label: 'Product',
              detail: 'PM and product-adjacent applications where summary clarity changes first impression.',
            },
            {
              label: 'Data',
              detail: 'Analyst and BI tracks that benefit from quantified impact and keyword alignment.',
            },
            {
              label: 'Sales',
              detail: 'Revenue-facing roles where outcomes, ownership, and progression need to read fast.',
            },
            {
              label: 'Finance',
              detail: 'Structured applications that depend on disciplined formatting and precise language.',
            },
            {
              label: 'Support',
              detail: 'Customer-facing roles that need calmer writing and more obvious service impact.',
            },
          ],
          values: [
            { value: '28K+', label: 'resumes tailored' },
            { value: '1.8x', label: 'median interview rate' },
            { value: '300+', label: 'roles supported' },
          ],
        }}
        pricing={{
          label: 'PRICING',
          title: 'Three tiers. No tricks.',
          description: 'Editing stays free. Credits are only for export and heavier AI actions, so you pay when the stronger layer actually helps.',
          summary: billingSummaryText,
          footnote: `After free usage: PDF export costs ${PDF_EXPORT_CREDIT_COST} credits, Tailor/Generate from Job cost ${ADVANCED_AI_CREDIT_COST} credits, Cover Letter costs ${COVER_LETTER_CREDIT_COST} credits.`,
          packages: pricingPackages,
        }}
        faq={{
          label: 'QUESTIONS',
          title: 'Answers, briefly.',
          items: faqItems,
          openLabel: 'Open',
          closeLabel: 'Close',
        }} />
    </>
  );
}

function getLogoSrc() {
  try {
    const mtime = fs.statSync(path.join(process.cwd(), 'public', 'logo_pathica.png')).mtimeMs;
    return `/logo_pathica.png?v=${Math.floor(mtime)}`;
  } catch {
    return '/logo_pathica.png';
  }
}
