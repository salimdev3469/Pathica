import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { FileText, Target, CheckCircle2, Zap, ArrowRight, ShieldCheck, Star } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { MouseEffect } from '@/components/mouse-effect';
import { HeroIntro } from '@/components/home/HeroIntro';
import { TemplateLibraryGrid } from '@/components/home/TemplateLibraryGrid';
import { DottedSurface } from '@/components/ui/dotted-surface';
import LanguageToggle from '@/components/language-toggle';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  COVER_LETTER_CREDIT_COST,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  formatUsd,
} from '@/lib/billing-config';
import { getBillingSummaryText } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { cvTemplateSeeds, buildCvStateFromTemplate } from '@/lib/cv-templates';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: 'AI Resume Builder and ATS Resume Tools',
  description: 'Build an ATS-friendly resume, optimize keywords, and improve job application outcomes with Pathica.',
  alternates: {
    canonical: '/',
    languages: {
      en: '/en',
      tr: '/tr',
      'x-default': '/en',
    },
  },
  openGraph: {
    title: 'Pathica | AI Resume Builder and ATS Resume Tools',
    description: 'Create, optimize, and export ATS-friendly resumes with practical tools and templates.',
    type: 'website',
    url: '/',
    images: [{ url: '/logo_pathica.png', alt: 'Pathica logo' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pathica | AI Resume Builder and ATS Resume Tools',
    description: 'Create and optimize your resume with ATS-safe templates and AI tools.',
    images: ['/logo_pathica.png'],
  },
  keywords: [
    'ai resume builder',
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
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);
  const navCtaHref = isAuthenticated ? '/dashboard' : '/register';
  const navCtaLabel = isAuthenticated ? t('Dashboard', 'Panel') : t('Get Started', 'Başla');
  const heroPrimaryHref = isAuthenticated ? '/dashboard' : '/cv/new';
  const logoSrc = getLogoSrc();
  const footerLogoSrc = getFooterLogoSrc();
  const billingSummaryText = getBillingSummaryText(locale);
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pathica.tech').replace(/\/$/, '');
  const animatedColumnTemplatesLeft = cvTemplateSeeds;
  const animatedColumnTemplatesRight = [...cvTemplateSeeds].reverse();
  const paperTiltClasses = [
    '-rotate-[1.6deg]',
    'rotate-[1.3deg]',
    '-rotate-[1deg]',
    'rotate-[1.8deg]',
    '-rotate-[1.4deg]',
    'rotate-[1.1deg]',
  ];
  const sectionTitleClass = 'text-3xl md:text-5xl font-normal tracking-[-0.04em] text-slate-900 dark:text-slate-100';
  const faqItems = [
    {
      question: t('Is Pathica free to start?', 'Pathica ücretsiz başlatılabiliyor mu?'),
      answer: t(
        'Yes. Build and preview are free. New accounts get 1 free PDF export and 10 AI credits.',
        'Evet. CV oluşturma ve önizleme ücretsizdir. Yeni hesaplar 1 ücretsiz PDF export ve 10 AI kredi alır.',
      ),
    },
    {
      question: t('Can I tailor my resume to a job description?', 'CV’mi iş ilanına göre özelleştirebilir miyim?'),
      answer: t(
        'Yes. Paste the job description and use AI tools to align keywords and improve role relevance.',
        'Evet. İlan metnini yapıştırıp AI araçlarıyla anahtar kelime uyumu ve rol uygunluğunu artırabilirsin.',
      ),
    },
    {
      question: t('Does Pathica support ATS optimization?', 'Pathica ATS optimizasyonunu destekliyor mu?'),
      answer: t(
        'Yes. Pathica provides ATS scoring, resume analysis, and keyword optimization workflows.',
        'Evet. Pathica ATS skoru, CV analizi ve anahtar kelime optimizasyonu akışları sunar.',
      ),
    },
    {
      question: t('Can I use Pathica without design skills?', 'Pathica’yı tasarım bilgisi olmadan kullanabilir miyim?'),
      answer: t(
        'Yes. The builder uses structured sections and formatting defaults so you can focus on your content.',
        'Evet. Oluşturucu, yapılandırılmış bölümler ve varsayılan formatlarla tasarımdan çok içeriğe odaklanmanı sağlar.',
      ),
    },
  ];
  const reviewItems = [
    {
      name: 'Elif A.',
      role: t('HR Specialist · Istanbul', 'İK Uzmanı · İstanbul'),
      rating: 5,
      result: t('3 interview calls in 2 weeks', '2 haftada 3 mülakat çağrısı'),
      comment: t(
        'My old CV never passed ATS filters. With Pathica, I rewrote my summary and got real recruiter responses.',
        'Eski CV’m ATS filtrelerini geçemiyordu. Pathica ile özet kısmını yeniledim ve gerçek recruiter dönüşleri aldım.',
      ),
    },
    {
      name: 'Kerem B.',
      role: t('Data Analyst · Ankara', 'Veri Analisti · Ankara'),
      rating: 5,
      result: t('Passed ATS checks on 5 platforms', '5 farklı platformda ATS kontrolünü geçti'),
      comment: t(
        'The template structure and keyword suggestions saved me hours. I only changed content, not formatting.',
        'Şablon yapısı ve anahtar kelime önerileri saatler kazandırdı. Formatla uğraşmadan sadece içeriğe odaklandım.',
      ),
    },
    {
      name: 'Zeynep D.',
      role: t('Product Designer · Izmir', 'Ürün Tasarımcısı · İzmir'),
      rating: 4,
      result: t('First portfolio interview in 9 days', '9 gün içinde ilk portföy mülakatı'),
      comment: t(
        'I liked how the role-based tailoring changed my bullet points into stronger outcomes.',
        'Role göre özelleştirme özelliği, madde içeriklerimi daha güçlü sonuç odaklı hale getirdi.',
      ),
    },
    {
      name: 'Murat C.',
      role: t('Sales Ops Lead · Bursa', 'Satış Operasyon Lideri · Bursa'),
      rating: 5,
      result: t('Application-to-response rate doubled', 'Başvuru-geri dönüş oranı iki katına çıktı'),
      comment: t(
        'The before/after difference is obvious. Recruiters finally started asking for interviews.',
        'Önce/sonra farkı çok net. Recruiter’lar nihayet mülakat için ulaşmaya başladı.',
      ),
    },
    {
      name: 'Selin Y.',
      role: t('Junior Software Engineer · Antalya', 'Junior Yazılım Mühendisi · Antalya'),
      rating: 5,
      result: t('Landed first tech interview', 'İlk teknik mülakatını aldı'),
      comment: t(
        'As a new graduate, I needed structure. Pathica helped me present projects with the right wording.',
        'Yeni mezun olarak bir yapıya ihtiyacım vardı. Pathica projelerimi doğru ifadelerle sunmamı sağladı.',
      ),
    },
    {
      name: 'Can O.',
      role: t('Finance Associate · Kocaeli', 'Finans Uzmanı · Kocaeli'),
      rating: 4,
      result: t('Shortlisted by 2 enterprise firms', '2 kurumsal şirkette kısa listeye kaldı'),
      comment: t(
        'PDF output looked clean and professional. It felt like a recruiter-ready document from day one.',
        'PDF çıktısı temiz ve profesyonel görünüyordu. İlk günden recruiter’a hazır bir doküman hissi verdi.',
      ),
    },
  ];
  const averageRating = (reviewItems.reduce((total, item) => total + item.rating, 0) / reviewItems.length).toFixed(1);
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
        priceCurrency: 'TRY',
      },
      description: t(
        'Pathica helps job seekers build ATS-friendly resumes, optimize role keywords, and export professional PDF CVs.',
        'Pathica, iş arayanların ATS uyumlu CV oluşturmasına, anahtar kelimeleri optimize etmesine ve profesyonel PDF CV dışa aktarmasına yardımcı olur.',
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
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans cursor-none dark:bg-slate-950">
      <MouseEffect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* Navigation */}
      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-6xl px-3 sm:px-6 animate-in slide-in-from-top-4 duration-700 fade-in">
        <div className="flex h-20 items-center justify-between rounded-full border border-white/50 bg-white/80 px-2 pr-2 shadow-[0_8px_30px_rgb(0,0,0,0.08)] backdrop-blur-xl transition-all duration-500 hover:bg-white/90 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] sm:pr-4 dark:border-slate-700/60 dark:bg-slate-950/80 dark:hover:bg-slate-950">
          <Link href="/" className="ml-1 flex items-center gap-2 text-xl font-bold text-primary group sm:ml-3">
            <div className="relative pl-1">
              <><Image src={logoSrc} alt={t('Pathica logo', 'Pathica logosu')} width={144} height={144} className="h-20 w-20 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-24 sm:w-24 lg:h-28 lg:w-28 dark:hidden" /><Image src={footerLogoSrc} alt={t('Pathica dark logo', 'Pathica koyu logosu')} width={144} height={144} className="hidden h-20 w-20 object-contain transition-transform duration-500 group-hover:scale-110 sm:h-24 sm:w-24 lg:h-28 lg:w-28 dark:block" /></>
            </div>
          </Link>
          <div className="flex items-center gap-2 sm:gap-6">
            <nav className="hidden items-center gap-8 text-sm font-semibold text-slate-500 dark:text-slate-300 md:flex">
              <Link href="#how-it-works" className="relative transition-colors after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:text-primary hover:after:w-full dark:hover:text-slate-100 dark:after:bg-slate-100">
                {t('How It Works', 'Nasıl Çalışır')}
              </Link>
            </nav>
            <LanguageToggle locale={locale} className="inline-flex" />
            <div className="hidden h-8 w-[1px] bg-slate-200 dark:bg-slate-700 md:block"></div>
            <div className="flex items-center gap-2 sm:gap-3">
              {!isAuthenticated && (
                <Link href="/login" className="whitespace-nowrap px-1 text-xs font-bold text-slate-600 transition-colors hover:text-primary sm:px-2 sm:text-sm dark:text-slate-300 dark:hover:text-slate-100">
                  {t('Sign In', 'Giriş Yap')}
                </Link>
              )}
              <Button asChild className="h-10 shrink-0 whitespace-nowrap rounded-full border-0 bg-[#1a1a1a] px-4 text-sm font-semibold text-white shadow-md transition-all duration-300 hover:-translate-y-0.5 hover:bg-black hover:shadow-xl sm:h-11 sm:px-6 sm:text-base">
                <Link href={navCtaHref}>{navCtaLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden border-b bg-white pb-20 pt-32 dark:border-slate-800 dark:bg-slate-950 lg:pb-32 lg:pt-40">
          <DottedSurface className="!absolute inset-0 !z-0 opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] dark:opacity-20"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <HeroIntro headline={t('Land Your Dream Job with an AI-Optimized CV', 'Hayalindeki İşe AI Destekli CV ile Ulaş')} subtitle={t('Create ATS-friendly resumes that get past the bots. Tailor your applications to specific roles and track your success all in one powerful platform.', 'ATS dostu özgeçmişler oluştur, başvurularını role göre özelleştir ve tüm süreci tek bir platformdan yönet.')} />
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0" asChild>
                <Link href={heroPrimaryHref}>
                  {t('Build Free CV', 'Ücretsiz CV Oluştur')} <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
            </div>

            <div className="mt-16 text-sm font-medium text-slate-400 uppercase tracking-widest flex justify-center items-center gap-8 opacity-70 mb-16">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> {t('ATS Compliant', 'ATS Uyumlu')}</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> {t('AI Powered', 'AI Destekli')}</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> {t('Export to PDF', 'PDF Olarak İndir')}</div>
            </div>

            {/* Application Demo Video/GIF with Info */}
            <div className="mx-auto mt-16 max-w-5xl flex flex-col items-center px-4 sm:px-0">
              {/* Top Text */}
              <div className="text-center mb-12 max-w-3xl">
                <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-slate-900 dark:text-slate-100 mb-6">
                  {t('Build a Winning CV in Minutes', 'Dakikalar İçinde Kazandıran CV Hazırla')}
                </h2>
                <p className="text-lg leading-relaxed text-slate-500 dark:text-slate-300 md:px-12">
                  {t('Pathica simplifies the creation of your professional footprint. We analyze recruiter patterns and use AI to output the perfect resume.', 'Pathica profesyonel profilini hızla oluşturmanı sağlar. İşveren beklentilerini analiz eder ve daha güçlü bir CV çıkartmana yardım eder.')}
                </p>
              </div>

              {/* Video in Browser Frame (Centered) */}
              <div className="relative w-full mb-16">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 z-0 rounded-[3rem] bg-gradient-to-br from-blue-100/50 via-transparent to-primary/5 blur-2xl pointer-events-none" />

                {/* Browser Window */}
                <div className="group relative z-10 overflow-hidden rounded-xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-700/70 md:rounded-2xl">
                  {/* Browser Window Header */}
                  <div className="flex items-center gap-2 border-b border-slate-200 bg-slate-100 px-4 py-3 dark:border-slate-700 dark:bg-slate-800">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  </div>

                  {/* Video Content */}
                  <div className="relative bg-white dark:bg-slate-900">
                    <video
                      autoPlay
                      loop
                      muted
                      playsInline
                      src="/demo_1.mp4"
                      className="w-full h-auto block"
                    />
                  </div>
                </div>
              </div>

              {/* Bottom Steps Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-10 w-full text-left">
                {/* Step 1 */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-800">
                    1
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Enter Your Information', 'Bilgilerini Gir')}</h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                      {t('Flexibly enter your details into our intuitive form however you like. We handle the complex spacing and formatting behind the scenes.', 'Bilgilerini esnek ve kolay bir formla gir. Karmaşık boşluk ve formatlama işlerini arka planda biz hallederiz.')}
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-800">
                    2
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Export as PDF', 'PDF Olarak İndir')}</h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                      {t('Instantly convert your completed profile and save it as a perfectly formatted, ATS-compliant PDF document.', 'Profilini anında profesyonel ve ATS uyumlu bir PDF dosyasına dönüştür.')}
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-800">
                    3
                  </div>
                  <div>
                    <h3 className="mb-2 text-xl font-semibold text-slate-900 dark:text-slate-100">{t('Apply Anywhere', 'Her Yerde Başvur')}</h3>
                    <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 md:text-base">
                      {t('Use your polished resume to apply for your dream jobs directly on Pathica or any other platform seamlessly.', 'Hazır CV’ni Pathica veya dilediğin platformda kolayca kullanarak başvur.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ATS Templates */}
        <section className="relative overflow-hidden bg-slate-50/60 py-20 dark:bg-slate-900/70">
          <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
          <div className="container relative z-10 mx-auto px-6">
            <div className="relative mb-12">
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">
                  {t('ATS Template Library', 'ATS Şablon Kütüphanesi')}
                </span>
                <h2 className={`${sectionTitleClass} mb-4`}>
                  {t('Pick a Template and Start Editing Instantly', 'Bir Şablon Seç ve Anında Düzenlemeye Başla')}
                </h2>
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                  {t(
                    'All templates use ATS-friendly section names and clean hierarchy. Choose one, make a few edits, then continue securely from login.',
                    'Tüm şablonlar ATS uyumlu bölüm isimleri ve temiz hiyerarşi kullanır. Birini seç, birkaç düzenleme yap, sonra login ekranından güvenle devam et.',
                  )}
                </p>
              </div>
            </div>

            <TemplateLibraryGrid locale={locale} />

            <p className="mt-8 text-center text-xs text-slate-500 dark:text-slate-400">
              {t(
                'Guest mode is temporary. If you leave before signing in, your changes are discarded.',
                'Misafir modu geçicidir. Giriş yapmadan ayrılırsan değişikliklerin silinir.',
              )}
            </p>
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
        </section>

        {/* {t('How It Works', 'Nasıl Çalışır')} */}
        <section className="relative overflow-hidden border-y border-slate-200 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_40%),#ffffff] py-24 dark:border-slate-800 dark:bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.18),transparent_45%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.14),transparent_45%),#020617]" id="how-it-works">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent dark:via-slate-700" />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden h-[420px] w-[240px] -translate-y-1/2 opacity-25 xl:block">
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-l from-slate-200/65 via-slate-200/20 to-transparent blur-xl dark:from-slate-700/40 dark:via-slate-800/20" />
            <div className="relative ml-auto h-full w-[190px] overflow-hidden rounded-2xl">
              <div className="grid h-full grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/35 p-1 dark:border-slate-700/60 dark:bg-slate-900/35">
                  <div className="cv-paper-column-track space-y-2">
                    {[...animatedColumnTemplatesLeft, ...animatedColumnTemplatesLeft].map((template, index) => {
                      const cvPreviewState = buildCvStateFromTemplate(template, locale);
                      const tiltClass = paperTiltClasses[index % paperTiltClasses.length];

                      return (
                        <div key={`how-left-${template.slug}-${index}`} className={`mx-auto ${tiltClass}`}>
                          <div className="h-[164px] w-[116px] overflow-hidden rounded-md border border-slate-300/70 bg-white shadow-[0_12px_20px_-15px_rgba(15,23,42,0.75)]">
                            <div
                              style={{
                                width: '794px',
                                height: '1123px',
                                transform: 'scale(0.146)',
                                transformOrigin: 'top left',
                              }}
                            >
                              <CVTemplate cv={cvPreviewState} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/35 p-1 dark:border-slate-700/60 dark:bg-slate-900/35">
                  <div className="cv-paper-column-track cv-paper-column-track-fast space-y-2">
                    {[...animatedColumnTemplatesRight, ...animatedColumnTemplatesRight].map((template, index) => {
                      const cvPreviewState = buildCvStateFromTemplate(template, locale);
                      const tiltClass = paperTiltClasses[(index + 2) % paperTiltClasses.length];

                      return (
                        <div key={`how-right-${template.slug}-${index}`} className={`mx-auto ${tiltClass}`}>
                          <div className="h-[164px] w-[116px] overflow-hidden rounded-md border border-slate-300/70 bg-white shadow-[0_12px_20px_-15px_rgba(15,23,42,0.75)]">
                            <div
                              style={{
                                width: '794px',
                                height: '1123px',
                                transform: 'scale(0.146)',
                                transformOrigin: 'top left',
                              }}
                            >
                              <CVTemplate cv={cvPreviewState} />
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-14 max-w-3xl text-center">
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-blue-700 dark:text-blue-300">
                {t('Guided Workflow', 'Yönlendirilmiş Akış')}
              </span>
              <h2 className={`${sectionTitleClass} mb-4`}>
                {t('How It Works', 'Nasıl Çalışır')}
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600 dark:text-slate-300">
                {t('From an empty page to a confirmed interview in three simple steps.', 'Boş bir sayfadan görüşmeye uzanan süreç üç net adımda.')}
              </p>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-10 hidden h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 dark:from-blue-500/40 dark:via-indigo-500/40 dark:to-emerald-500/40 md:block" />

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(37,99,235,0.45)] dark:border-slate-700 dark:bg-slate-900/85">
                <span className="absolute right-5 top-5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">01</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 ring-1 ring-slate-200/70">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100">{t('Build Your Base CV', 'Temel CV’ni Hazırla')}</h3>
                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                  {t('Enter your details into our builder with ATS-safe structure and instant A4 formatting.', 'Bilgilerini ATS güvenli yapıyla editöre gir, A4 formatını anında hazırla.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-blue-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('Foundation', 'Temel Kurulum')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(37,99,235,0.45)] dark:border-slate-700 dark:bg-slate-900/85">
                <span className="absolute right-5 top-5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">02</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 ring-1 ring-blue-100/70">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100">{t('Tailor with AI', 'AI ile Özelleştir')}</h3>
                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                  {t("Paste your target job and let AI sharpen your bullets for role-matched keywords.", 'Hedef ilanını yapıştır, AI madde içeriklerini role uygun anahtar kelimelerle güçlendirsin.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-indigo-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('Optimization', 'Optimizasyon')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(16,185,129,0.45)] dark:border-slate-700 dark:bg-slate-900/85">
                <span className="absolute right-5 top-5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">03</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 ring-1 ring-emerald-100/70">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900 dark:text-slate-100">{t('Apply & Track', 'Başvur ve Takip Et')}</h3>
                <p className="text-[15px] leading-7 text-slate-600 dark:text-slate-300">
                  {t('Export your polished CV, apply confidently, and track outcomes in one workflow.', 'Güçlendirilmiş CV’ni dışa aktar, güvenle başvur ve sonuçlarını tek akışta takip et.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">{t('Delivery', 'Teslimat')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t bg-white py-24 dark:border-slate-800 dark:bg-slate-950">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className={sectionTitleClass}>{t('Simple Fixed-TL Pricing', 'Sabit TL Fiyatlandırma')}</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {t('Build free. Preview free. Pay only when you export or need advanced tools.', 'Ücretsiz oluştur. Ücretsiz önizle. Sadece export veya gelişmiş araç gerektiğinde öde.')}
              </p>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">{billingSummaryText}</p>
            </div>

            <div className="mb-6 grid gap-5 md:grid-cols-2">
              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/85">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('Free Access', 'Ücretsiz Erişim')}</CardTitle>
                  <CardDescription>{t('For new registered users', 'Yeni kayıt olan kullanıcılar için')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex">
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                      {t('CV builder, editing, and A4 preview stay free.', 'CV oluşturma, düzenleme ve A4 önizleme ücretsiz kalır.')}
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                      <strong className="mr-1">{FREE_SIGNUP_EXPORTS}</strong>
                      {t('free PDF export on your account.', 'ücretsiz PDF export hakkı.')}
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-emerald-600" />
                      {FREE_SIGNUP_AI_CREDITS} {t('free AI credits for advanced tools.', 'gelişmiş araçlar için ücretsiz AI kredi.')}
                    </li>
                  </ul>
                  <p className="mt-4 text-xs text-slate-500 dark:text-slate-400">
                    {t('After free usage: PDF export costs', 'Ücretsiz hak sonrası: PDF export maliyeti')}{' '}
                    <strong>{PDF_EXPORT_CREDIT_COST}</strong>{' '}
                    {t(
                      'credits. Tailor, Match Job, and Generate from Job cost',
                      'kredi. Tailor, Match Job ve Generate from Job maliyeti',
                    )}{' '}
                    <strong>{ADVANCED_AI_CREDIT_COST}</strong>{' '}
                    {t(
                      'credits each. Cover Letter costs',
                      'kredi (her biri). Cover Letter maliyeti',
                    )}{' '}
                    <strong>{COVER_LETTER_CREDIT_COST}</strong> {t('credits.', 'kredi.')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/85">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('Paid Scope', 'Ücretli Kapsam')}</CardTitle>
                  <CardDescription>{t('What credits are used for', 'Kredilerin kullanıldığı özellikler')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700 dark:text-slate-300">
                    <li className="flex">
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-slate-700" />
                      {t('PDF export (after first free export)', 'PDF export (ilk ücretsiz export sonrası)')}
                    </li>
                    <li className="flex">
                      <CheckCircle2 className="mr-2 h-4 w-4 shrink-0 text-slate-700" />
                      {t('Advanced AI: generate-from-job, match-job, tailor, cover-letter', 'Gelişmiş AI: generate-from-job, match-job, tailor, cover-letter')}
                    </li>
                  </ul>
                  <Button className="mt-6 w-full" asChild>
                    <Link href={isAuthenticated ? '/billing' : '/register'}>{t('Open Billing', 'Ödeme Sayfasını Aç')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-5 md:grid-cols-3">
              {BILLING_PACKAGES.map((pkg) => (
                <Card key={pkg.code} className={`border ${pkg.highlight ? 'border-slate-900 shadow-sm dark:border-slate-300' : 'border-slate-200 dark:border-slate-700'} dark:bg-slate-900/85`}>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span>{pkg.name}</span>
                      {pkg.highlight ? (
                        <span className="rounded-full bg-slate-900 px-2 py-1 text-xs font-semibold text-white">{t('Most Popular', 'En Popüler')}</span>
                      ) : null}
                    </CardTitle>
                    <CardDescription>
                      {pkg.credits} {t('credits', 'kredi')}
                    </CardDescription>
                    <div className="text-4xl font-bold text-slate-900 dark:text-slate-100">{formatUsd(pkg.priceUsd)}</div>
                  </CardHeader>
                  <CardContent>
                    <Button variant={pkg.highlight ? 'default' : 'outline'} className="w-full" asChild>
                      <Link href={isAuthenticated ? '/billing' : '/register'}>{t('Buy Credits', 'Kredi Satın Al')}</Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        {/* Social Proof */}
        <section className="border-t bg-slate-50/80 py-20 dark:border-slate-800 dark:bg-slate-900/70">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className={sectionTitleClass}>{t('Real Outcomes from Recent Users', 'Son Kullanıcılardan Gerçek Sonuçlar')}</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">
                {t(
                  'A quick look at recent applicant feedback after CV updates and ATS-focused edits.',
                  'CV güncellemeleri ve ATS odaklı düzenlemeler sonrası başvuru sahiplerinden gelen güncel geri bildirimler.',
                )}
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100">
                <span className="inline-flex items-center gap-1 text-amber-500">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <Star key={`avg-star-${index}`} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" strokeWidth={1.75} />
                  ))}
                </span>
                <span>{averageRating}/5</span>
                <span className="text-slate-500 dark:text-slate-400">{t('average rating', 'ortalama puan')}</span>
              </div>
            </div>

            <div className="reviews-marquee relative overflow-hidden rounded-2xl border border-slate-200 bg-white/70 py-4 dark:border-slate-700 dark:bg-slate-900/70">
              <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-20 bg-gradient-to-r from-slate-50/95 to-transparent dark:from-slate-900/95" />
              <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-20 bg-gradient-to-l from-slate-50/95 to-transparent dark:from-slate-900/95" />

              <div className="reviews-marquee-track flex w-max gap-4 px-4">
                {[...reviewItems, ...reviewItems].map((review, index) => (
                  <article
                    key={`${review.name}-${index}`}
                    className="w-[300px] shrink-0 rounded-xl border border-slate-200 bg-white p-4 shadow-[0_10px_30px_-24px_rgba(15,23,42,0.6)] dark:border-slate-700 dark:bg-slate-900"
                    aria-hidden={index >= reviewItems.length}
                  >
                    <div className="mb-3 flex items-center justify-between">
                      <div className="flex items-center gap-0.5 text-amber-500">
                        {Array.from({ length: 5 }).map((_, starIndex) => (
                          <Star
                            key={`${review.name}-${index}-star-${starIndex}`}
                            className={`h-3.5 w-3.5 ${starIndex < review.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
                            strokeWidth={1.75}
                          />
                        ))}
                      </div>
                      <span className="text-[11px] font-semibold uppercase tracking-[0.14em] text-emerald-600">
                        {review.result}
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-slate-700 dark:text-slate-300">{review.comment}</p>
                    <div className="mt-4 border-t border-slate-100 pt-3 dark:border-slate-700">
                      <p className="text-sm font-semibold text-slate-900 dark:text-slate-100">{review.name}</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{review.role}</p>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="border-t bg-white py-20 dark:border-slate-800 dark:bg-slate-950">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className={sectionTitleClass}>{t('Frequently Asked Questions', 'Sık Sorulan Sorular')}</h2>
              <p className="mt-3 text-slate-600 dark:text-slate-300">{t('Key answers about pricing, ATS compatibility, and resume optimization workflows.', 'Fiyatlandırma, ATS uyumluluğu ve CV optimizasyon akışları hakkında temel yanıtlar.')}</p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-4">
              {faqItems.map((item) => (
                <Card key={item.question} className="border-slate-200 dark:border-slate-700 dark:bg-slate-900/85">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600 dark:text-slate-300">{item.answer}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

    </div>
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

function getFooterLogoSrc() {
  try {
    const mtime = fs.statSync(path.join(process.cwd(), 'public', 'logo_pathica_footer.png')).mtimeMs;
    return `/logo_pathica_footer.png?v=${Math.floor(mtime)}`;
  } catch {
    return '/logo_pathica_footer.png';
  }
}
