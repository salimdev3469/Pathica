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
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
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
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  const isTr = locale === 'tr';
  const t = (en: string, tr: string) => (isTr ? tr : en);

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
  const navCtaLabel = isAuthenticated ? t('Dashboard', 'Panel') : t('Start Free', 'Başla');
  const heroPrimaryHref = isAuthenticated ? '/dashboard' : '/cv/new';
  const heroPrimaryLabel = isAuthenticated ? t('Open Dashboard', 'Panele Git') : t('Build Free CV', 'Ücretsiz CV Oluştur');
  const billingSummaryText = getBillingSummaryText(locale);
  const logoSrc = getLogoSrc();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pathica.tech').replace(/\/$/, '');

  const faqItems = [
    {
      question: t('How is this different from a general AI chatbot?', 'Bu genel bir AI chatbot’tan nasıl ayrılıyor?'),
      answer: t(
        'A chatbot rewrites one bullet at a time. Pathica keeps the template, job-match context, ATS structure, and export flow in the same workspace.',
        'Bir chatbot tek tek madde düzeltir. Pathica ise şablonu, ilan bağlamını, ATS yapısını ve export akışını aynı çalışma alanında tutar.',
      ),
    },
    {
      question: t('Will the resume read as AI-generated?', 'CV yapay yazılmış gibi mi görünür?'),
      answer: t(
        'The goal is not generic copy. Pathica helps tighten wording around your own experience, results, and target role.',
        'Amaç jenerik bir çıktı vermek değil. Pathica kendi deneyimini, sonuçlarını ve hedef rolünü daha net anlatmana yardım eder.',
      ),
    },
    {
      question: t('Does it pass applicant tracking systems?', 'ATS sistemlerinden geçer mi?'),
      answer: t(
        'The builder is structured around ATS-safe section order, simple layout rules, readable spacing, and export-safe formatting.',
        'Builder; ATS-safe bölüm sırası, sade yerleşim kuralları, okunur boşluk yapısı ve export-safe format etrafında kuruludur.',
      ),
    },
    {
      question: t('Can I export to PDF and keep editing later?', 'PDF dışa aktarabilir ve sonra düzenlemeye devam edebilir miyim?'),
      answer: t(
        'Yes. You can keep iterating in the same workspace and export only when the draft is ready.',
        'Evet. Aynı çalışma alanında düzenlemeye devam edip yalnızca taslak hazır olduğunda export alabilirsin.',
      ),
    },
    {
      question: t('Can I use it without design skills?', 'Tasarım bilgisi olmadan kullanabilir miyim?'),
      answer: t(
        'Yes. Pathica is opinionated on structure and spacing, so you focus on the content rather than formatting choices.',
        'Evet. Pathica yapı ve boşluk tarafında kararları senin yerine daraltır; sen format yerine içeriğe odaklanırsın.',
      ),
    },
  ];

  const proofMetrics = [
    {
      label: t('ATS readability', 'ATS okunabilirliği'),
      score: 25,
      total: 25,
    },
    {
      label: t('Content quality', 'İçerik kalitesi'),
      score: 32,
      total: 35,
    },
    {
      label: t('Writing', 'Yazım'),
      score: 9,
      total: 10,
    },
    {
      label: t('Job match', 'İlan uyumu'),
      score: 20,
      total: 25,
    },
    {
      label: t('Application ready', 'Başvuru hazırlığı'),
      score: 5,
      total: 5,
    },
  ];

  const workflowSteps = [
    {
      number: '01',
      icon: 'foundation' as const,
      title: t('Start from a clean base', 'Temiz bir temelle başla'),
      description: t(
        'Open an ATS-safe structure with live preview already in place.',
        'Canlı önizleme hazır, ATS-safe bir yapı ile doğrudan başla.',
      ),
      label: t('Base', 'Temel'),
    },
    {
      number: '02',
      icon: 'tailor' as const,
      title: t('Tailor for the role', 'Role göre özelleştir'),
      description: t(
        'Paste the job description and strengthen weak bullets without flattening your tone.',
        'İlanı yapıştır, zayıf maddeleri tonunu kaybetmeden güçlendir.',
      ),
      label: t('Tailor', 'Özelleştir'),
    },
    {
      number: '03',
      icon: 'deliver' as const,
      title: t('Export when it is ready', 'Hazır olduğunda dışa aktar'),
      description: t(
        'Keep editing in one place, then export a recruiter-safe PDF only when the draft is tight.',
        'Taslak oturduğunda recruiter-safe PDF’i dışa aktar; tüm düzenleme tek yerde kalsın.',
      ),
      label: t('Deliver', 'Teslim'),
    },
  ];

  const pricingPackages = BILLING_PACKAGES.map((pkg) => {
    const href = isAuthenticated ? '/billing' : '/register';
    const isConfigured = Boolean(getShopierCheckoutUrl(pkg));

    if (pkg.code === 'starter') {
      return {
        id: pkg.code,
        code: pkg.code,
        name: t('Starter', 'Starter'),
        displayPrice: formatUsd(pkg.priceUsd),
        description: t(
          'A focused pack for one or two strong application passes.',
          'Bir veya iki güçlü başvuru turu için odaklı paket.',
        ),
        features: [
          t('100 AI credits for tailoring and rewrite tools', 'Tailor ve rewrite araçları için 100 AI kredi'),
          t('Good fit for one resume plus a few role adjustments', 'Bir CV ve birkaç rol özelleştirmesi için uygun'),
          t('One-time purchase, no subscription pressure', 'Tek seferlik ödeme, abonelik baskısı yok'),
        ],
        isPopular: pkg.highlight,
        isConfigured,
        ctaLabel: t('Choose Starter', 'Starter’ı Seç'),
        href,
      };
    }

    if (pkg.code === 'pro') {
      return {
        id: pkg.code,
        code: pkg.code,
        name: t('Pro', 'Pro'),
        displayPrice: formatUsd(pkg.priceUsd),
        description: t(
          'Best balance for active search, repeated tailoring, and export.',
          'Aktif iş arayışı, tekrar tekrar özelleştirme ve export için en dengeli paket.',
        ),
        features: [
          t('300 AI credits for multiple job-specific rewrites', 'Çoklu role göre rewrite için 300 AI kredi'),
          t('Covers repeated ATS checks and stronger content passes', 'Tekrarlı ATS kontrolleri ve güçlü içerik turunu kapsar'),
          t('Most practical pack for multi-role applications', 'Birden fazla role başvuranlar için en pratik paket'),
        ],
        isPopular: pkg.highlight,
        isConfigured,
        ctaLabel: t('Choose Pro', 'Pro’yu Seç'),
        href,
      };
    }

    return {
      id: pkg.code,
      code: pkg.code,
      name: t('Mega', 'Mega'),
      displayPrice: formatUsd(pkg.priceUsd),
      description: t(
        'A larger pack for heavy iteration, cover letters, and broad search.',
        'Yoğun iterasyon, ön yazı üretimi ve geniş arama için daha büyük paket.',
      ),
      features: [
        t('1000 AI credits for heavier resume and cover letter work', 'Yoğun CV ve ön yazı çalışması için 1000 AI kredi'),
        t('Good fit for broad search or multiple application tracks', 'Geniş arama veya paralel başvuru akışları için uygun'),
        t('One-time checkout, credits stay in your account', 'Tek seferlik ödeme, krediler hesabında kalır'),
      ],
      isPopular: pkg.highlight,
      isConfigured,
      ctaLabel: t('Choose Mega', 'Mega’yı Seç'),
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
      description: t(
        'Pathica helps job seekers build ATS-friendly resumes, tailor content to job descriptions, and export recruiter-ready PDF resumes.',
        'Pathica, iş arayanların ATS uyumlu CV oluşturmasına, ilan metnine göre içeriği özelleştirmesine ve recruiter-ready PDF CV dışa aktarmasına yardımcı olur.',
      ),
      featureList: [
        t('ATS resume checker', 'ATS CV kontrolü'),
        t('Resume keyword optimizer', 'CV anahtar kelime optimizasyonu'),
        t('AI-assisted resume editing', 'AI destekli CV düzenleme'),
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
        locale={locale}
        isAuthenticated={isAuthenticated}
        logoSrc={logoSrc}
        navCtaHref={navCtaHref}
        navCtaLabel={navCtaLabel}
        heroPrimaryHref={heroPrimaryHref}
        heroPrimaryLabel={heroPrimaryLabel}
        heroSecondaryLabel={t('See the proof', 'Proof’u gör')}
        heroTitleTop={t('The AI that gets', 'The AI that gets')}
        heroTitleAccentWords={
          isTr
            ? ['HRs', 'Engineers', 'Designers', 'Marketers', 'Developers']
            : ['HRs', 'Engineers', 'Designers', 'Marketers', 'Developers']
        }
        heroTitleBottom={t('hired.', 'hired.')}
        heroSubtitle={t(
          'Write, tailor, check ATS fit, and export from one calm workspace. Pathica helps the final resume feel sharper before the PDF is even sent.',
          'Yaz, role göre sıkılaştır, ATS uyumunu kontrol et ve export al. Pathica son CV’nin PDF gönderilmeden önce bile daha net ve güçlü görünmesini sağlar.',
        )}
        navLabels={{
          proof: t('Proof', 'Proof'),
          flow: t('How It Works', 'Nasıl Çalışır'),
          pricing: t('Pricing', 'Fiyatlandırma'),
          questions: t('Questions', 'Sorular'),
        }}
        heroTrustItems={[
          t('ATS-safe structure', 'ATS-safe yapı'),
          isTr ? `${FREE_SIGNUP_EXPORTS} ücretsiz PDF export` : `${FREE_SIGNUP_EXPORTS} free PDF export`,
          isTr ? `${FREE_SIGNUP_AI_CREDITS} AI kredi` : `${FREE_SIGNUP_AI_CREDITS} AI credits`,
          t('No subscription', 'Abonelik yok'),
        ]}
        proof={{
          label: t('THE PROOF', 'PROOF'),
          title: t('See what recruiters see, before they do.', 'Recruiter ne görecekse, daha onlar bakmadan gör.'),
          description: t(
            'Every resume goes through the same screen recruiters use. You see the score, the weak spots, and the stronger rewrite before you export.',
            'Her CV recruiter’ın gördüğü benzer bir kontrolden geçer. Skoru, zayıf kalan noktaları ve daha güçlü rewrite yönünü export’tan önce görürsün.',
          ),
          findings: [
            {
              title: t('Strengths identified', 'Güçlü taraflar'),
              body: t(
                'Strong technical skills and quantified bullets with measurable business impact.',
                'Ölçülebilir iş etkisi taşıyan güçlü teknik yetenekler ve sayısal sonuç içeren maddeler.',
              ),
            },
            {
              title: t('Improvement suggestions', 'İyileştirme önerileri'),
              body: t(
                'Move the most relevant role-specific project higher and tighten the summary around target keywords.',
                'Role en uygun projeyi yukarı taşı ve özet kısmını hedef anahtar kelimeler etrafında sıkılaştır.',
              ),
            },
          ],
          scoreLabel: t('Excellent', 'Mükemmel'),
          metrics: proofMetrics,
        }}
        workflow={{
          label: t('THE FLOW', 'AKIŞ'),
          title: t('Three moves. One working surface.', 'Üç hamle. Tek çalışma yüzeyi.'),
          description: t(
            'You do not need a document, a chatbot, a design tool, and a PDF exporter open at the same time. Pathica compresses the workflow.',
            'Aynı anda döküman, chatbot, tasarım aracı ve PDF exporter açık tutmana gerek kalmaz. Pathica akışı sıkıştırır.',
          ),
          steps: workflowSteps,
        }}
        quote={{
          label: t('HIRED', 'SONUÇ'),
          entries: [
            {
              text: t(
                'I used to rebuild every resume from scratch for each opening. Now I keep one strong base and tailor it in minutes.',
                'Eskiden her ilan için CV’yi neredeyse baştan kuruyordum. Şimdi güçlü bir temel tutup birkaç dakikada role göre sıkılaştırıyorum.',
              ),
              author: 'Sarah J.',
              role: t('HR Specialist · London', 'İK Uzmanı · Londra'),
              initials: 'SJ',
              avatar: '/girl1.png',
            },
            {
              text: t(
                'The useful part is not just rewriting. It keeps the ATS-safe structure stable while I improve the bullets that matter.',
                'Asıl fayda sadece yeniden yazım değil. Maddeleri güçlendirirken ATS-safe yapıyı sabit tutması başvuruyu çok daha kontrollü hale getiriyor.',
              ),
              author: 'David M.',
              role: t('Data Analyst · Berlin', 'Veri Analisti · Berlin'),
              initials: 'DM',
              avatar: '/man1.png',
            },
            {
              text: t(
                'My summary and experience read much tighter now. The final application feels designed for the role instead of generally polished.',
                'Özet ve deneyim kısmı artık çok daha sıkı okunuyor. Son başvuru da genel olarak düzeltilmiş değil, role özel hazırlanmış gibi hissettiriyor.',
              ),
              author: 'Elif T.',
              role: t('Product Designer · Istanbul', 'Ürün Tasarımcısı · İstanbul'),
              initials: 'ET',
              avatar: '/girl2.png',
            },
          ],
        }}
        stats={{
          label: t('OUTCOMES', 'ÇIKTI'),
          companyLabel: t('users applying across teams like', 'kullanıcıların hedeflediği ekipler'),
          badges: [
            {
              label: t('Operations', 'Operasyon'),
              detail: t('Process-heavy roles that need clean metrics and readable bullet structure.', 'Süreç, raporlama ve ölçülebilir operasyon çıktısı isteyen roller.'),
            },
            {
              label: t('Product', 'Ürün'),
              detail: t('PM and product-adjacent applications where summary clarity changes first impression.', 'İlk izlenimi özet netliğinin değiştirdiği PM ve ürün odaklı başvurular.'),
            },
            {
              label: t('Data', 'Veri'),
              detail: t('Analyst and BI tracks that benefit from quantified impact and keyword alignment.', 'Sayısal etki ve ilan uyumunun kritik olduğu analist ve BI akışları.'),
            },
            {
              label: t('Sales', 'Satış'),
              detail: t('Revenue-facing roles where outcomes, ownership, and progression need to read fast.', 'Sonuç, sahiplik ve ilerleme hikayesinin hızlı okunması gereken gelir odaklı roller.'),
            },
            {
              label: t('Finance', 'Finans'),
              detail: t('Structured applications that depend on disciplined formatting and precise language.', 'Disiplinli format ve hassas dil gerektiren daha yapı odaklı başvurular.'),
            },
            {
              label: t('Support', 'Destek'),
              detail: t('Customer-facing roles that need calmer writing and more obvious service impact.', 'Daha sakin anlatım ve görünür hizmet etkisi isteyen müşteri odaklı roller.'),
            },
          ],
          values: [
            { value: '28K+', label: t('resumes tailored', 'özelleştirilen CV') },
            { value: '1.8x', label: t('median interview rate', 'medyan mülakat oranı') },
            { value: '300+', label: t('roles supported', 'desteklenen rol') },
          ],
        }}
        pricing={{
          label: t('PRICING', 'FİYAT'),
          title: t('Three tiers. No tricks.', 'Üç paket. Net fiyat.'),
          description: t(
            'Editing stays free. Credits are only for export and heavier AI actions, so you pay when the stronger layer actually helps.',
            'Düzenleme ücretsiz kalır. Krediler yalnızca export ve daha ağır AI aksiyonlarında kullanılır; yani gerçekten ihtiyaç olduğunda ödeme yaparsın.',
          ),
          summary: billingSummaryText,
          footnote: t(
            `After free usage: PDF export costs ${PDF_EXPORT_CREDIT_COST} credits, Tailor/Generate from Job cost ${ADVANCED_AI_CREDIT_COST} credits, Cover Letter costs ${COVER_LETTER_CREDIT_COST} credits.`,
            `Ücretsiz hak sonrası: PDF export ${PDF_EXPORT_CREDIT_COST} kredi, Tailor/Generate from Job ${ADVANCED_AI_CREDIT_COST} kredi, Cover Letter ${COVER_LETTER_CREDIT_COST} kredi.`,
          ),
          packages: pricingPackages,
        }}
        faq={{
          label: t('QUESTIONS', 'SORULAR'),
          title: t('Answers, briefly.', 'Kısa cevaplar.'),
          items: faqItems,
          openLabel: t('Open', 'Aç'),
          closeLabel: t('Close', 'Kapat'),
        }}
      />
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
