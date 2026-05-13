import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { FileText, Target, CheckCircle2, Zap, ArrowRight, ShieldCheck, LayoutTemplate } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { MouseEffect } from '@/components/mouse-effect';
import { HeroIntro } from '@/components/home/HeroIntro';
import { DottedSurface } from '@/components/ui/dotted-surface';
import LanguageToggle from '@/components/language-toggle';
import {
  ADVANCED_AI_CREDIT_COST,
  BILLING_PACKAGES,
  FREE_SIGNUP_AI_CREDITS,
  FREE_SIGNUP_EXPORTS,
  PDF_EXPORT_CREDIT_COST,
  formatUsd,
} from '@/lib/billing-config';
import { getBillingSummaryText } from '@/lib/billing';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import { cvTemplateSeeds, getLocalizedText, buildCvStateFromTemplate } from '@/lib/cv-templates';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import fs from 'node:fs';
import path from 'node:path';

export const metadata: Metadata = {
  title: 'AI Resume Builder and ATS Resume Tools',
  description: 'Build an ATS-friendly resume, optimize keywords, and improve job application outcomes with Pathica.',
  alternates: {
    canonical: '/',
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
  const billingSummaryText = getBillingSummaryText();
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');
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
  const sectionTitleClass = 'text-3xl md:text-5xl font-normal tracking-[-0.04em] text-slate-900';
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
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans cursor-none">
      <MouseEffect />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      {/* Navigation */}
      <header className="fixed top-4 left-0 right-0 z-50 mx-auto max-w-6xl px-4 sm:px-6 animate-in slide-in-from-top-4 duration-700 fade-in">
        <div className="bg-white/80 backdrop-blur-xl border border-white/50 shadow-[0_8px_30px_rgb(0,0,0,0.08)] rounded-full h-20 flex items-center justify-between px-2 pr-4 sm:px-6 transition-all duration-500 hover:shadow-[0_8px_40px_rgb(0,0,0,0.12)] hover:bg-white/90">
          <Link href="/" className="ml-3 flex items-center gap-2 text-xl font-bold text-primary group">
            <div className="relative pl-1">
              <><Image src={logoSrc} alt={t('Pathica logo', 'Pathica logosu')} width={144} height={144} className="h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-110 dark:hidden" /><Image src={footerLogoSrc} alt={t('Pathica dark logo', 'Pathica koyu logosu')} width={144} height={144} className="hidden h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-110 dark:block" /></>
            </div>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
              <Link href="#how-it-works" className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                {t('How It Works', 'Nasıl Çalışır')}
              </Link>
            </nav>
            <LanguageToggle locale={locale} className="inline-flex" />
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors px-2">
                  {t('Sign In', 'Giriş Yap')}
                </Link>
              )}
              <Button asChild className="px-6 h-11 font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0">
                <Link href={navCtaHref}>{navCtaLabel}</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white pt-32 pb-20 lg:pt-40 lg:pb-32 border-b">
          <DottedSurface className="!absolute inset-0 !z-0 opacity-35" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
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
                <p className="text-lg text-slate-500 leading-relaxed md:px-12">
                  {t('Pathica simplifies the creation of your professional footprint. We analyze recruiter patterns and use AI to output the perfect resume.', 'Pathica profesyonel profilini hızla oluşturmanı sağlar. İşveren beklentilerini analiz eder ve daha güçlü bir CV çıkartmana yardım eder.')}
                </p>
              </div>

              {/* Video in Browser Frame (Centered) */}
              <div className="relative w-full mb-16">
                {/* Decorative background glow */}
                <div className="absolute -inset-4 z-0 rounded-[3rem] bg-gradient-to-br from-blue-100/50 via-transparent to-primary/5 blur-2xl pointer-events-none" />

                {/* Browser Window */}
                <div className="relative z-10 overflow-hidden rounded-xl md:rounded-2xl bg-white shadow-[0_20px_60px_-15px_rgba(0,0,0,0.15)] ring-1 ring-slate-200 group">
                  {/* Browser Window Header */}
                  <div className="flex items-center bg-slate-100 border-b border-slate-200 px-4 py-3 gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-amber-400 shadow-sm" />
                    <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                  </div>

                  {/* Video Content */}
                  <div className="bg-white relative">
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('Enter Your Information', 'Bilgilerini Gir')}</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('Export as PDF', 'PDF Olarak İndir')}</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">{t('Apply Anywhere', 'Her Yerde Başvur')}</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      {t('Use your polished resume to apply for your dream jobs directly on Pathica or any other platform seamlessly.', 'Hazır CV’ni Pathica veya dilediğin platformda kolayca kullanarak başvur.')}
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>

        {/* ATS Templates */}
        <section className="relative overflow-hidden bg-slate-50/60 py-20">
          <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="container relative z-10 mx-auto px-6">
            <div className="relative mb-12">
              <div className="relative z-10 mx-auto max-w-3xl text-center">
                <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-blue-700">
                  {t('ATS Template Library', 'ATS Şablon Kütüphanesi')}
                </span>
                <h2 className={`${sectionTitleClass} mb-4`}>
                  {t('Pick a Template and Start Editing Instantly', 'Bir Şablon Seç ve Anında Düzenlemeye Başla')}
                </h2>
                <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
                  {t(
                    'All templates use ATS-friendly section names and clean hierarchy. Choose one, make a few edits, then continue securely from login.',
                    'Tüm şablonlar ATS uyumlu bölüm isimleri ve temiz hiyerarşi kullanır. Birini seç, birkaç düzenleme yap, sonra login ekranından güvenle devam et.',
                  )}
                </p>
              </div>
            </div>

            <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
              {cvTemplateSeeds.map((template) => {
                const cvPreviewState = buildCvStateFromTemplate(template, locale);
                const previewSkin =
                  template.slug === 'entry-starter'
                    ? {
                      frameBg: 'bg-[linear-gradient(180deg,#ecfff5_0%,#e3f7ed_100%)]',
                      accent: 'bg-emerald-500',
                      frameBorder: 'border-emerald-100',
                    }
                    : template.slug === 'technical-impact'
                      ? {
                        frameBg: 'bg-[linear-gradient(180deg,#ecf3ff_0%,#e4edff_100%)]',
                        accent: 'bg-blue-600',
                        frameBorder: 'border-blue-100',
                      }
                      : template.slug === 'career-switch'
                        ? {
                          frameBg: 'bg-[linear-gradient(180deg,#fff3e9_0%,#ffead9_100%)]',
                          accent: 'bg-orange-500',
                          frameBorder: 'border-orange-100',
                        }
                        : {
                          frameBg: 'bg-[linear-gradient(180deg,#f4f6ff_0%,#e9eeff_100%)]',
                          accent: 'bg-indigo-500',
                          frameBorder: 'border-indigo-100',
                        };

                return (
                  <Card key={template.slug} className="border-slate-200 bg-white transition-all hover:-translate-y-1 hover:shadow-md">
                    <CardHeader>
                      <div className={`relative mb-4 overflow-hidden rounded-xl border p-3 ${previewSkin.frameBorder} ${previewSkin.frameBg}`}>
                        <div className={`absolute inset-x-3 top-3 h-1 rounded-full ${previewSkin.accent}`} />
                        <div className="mx-auto mt-3 h-[272px] w-[192px] overflow-hidden rounded-[4px] border border-slate-300 bg-white shadow-[0_14px_28px_rgba(15,23,42,0.22)]">
                          <div
                            style={{
                              width: '794px',
                              height: '1123px',
                              transform: 'scale(0.242)',
                              transformOrigin: 'top left',
                            }}
                          >
                            <CVTemplate cv={cvPreviewState} />
                          </div>
                        </div>
                        <div className="absolute left-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-lg border border-blue-100 bg-white/90 text-blue-700">
                          <LayoutTemplate className="h-4 w-4" />
                        </div>
                      </div>
                      <CardTitle>{getLocalizedText(template.name, locale)}</CardTitle>
                      <CardDescription>{getLocalizedText(template.target, locale)}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <p className="text-sm text-slate-600">{getLocalizedText(template.headline, locale)}</p>
                      <ul className="list-disc space-y-1 pl-5 text-xs text-slate-500">
                        {template.sections.slice(0, 3).map((section) => (
                          <li key={section.title.en}>{getLocalizedText(section.title, locale)}</li>
                        ))}
                      </ul>
                      <Button asChild className="w-full">
                        <Link href={`/cv/new?template=${template.slug}`}>{t('Use This Template', 'Bu Şablonu Kullan')}</Link>
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>

            <p className="mt-8 text-center text-xs text-slate-500">
              {t(
                'Guest mode is temporary. If you leave before signing in, your changes are discarded.',
                'Misafir modu geçicidir. Giriş yapmadan ayrılırsan değişikliklerin silinir.',
              )}
            </p>
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </section>

        {/* {t('How It Works', 'Nasıl Çalışır')} */}
        <section className="relative overflow-hidden border-y border-slate-200 bg-[radial-gradient(circle_at_20%_20%,rgba(59,130,246,0.08),transparent_40%),radial-gradient(circle_at_80%_30%,rgba(16,185,129,0.08),transparent_40%),#ffffff] py-24" id="how-it-works">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-300 to-transparent" />
          <div className="pointer-events-none absolute right-2 top-1/2 hidden h-[420px] w-[240px] -translate-y-1/2 opacity-25 xl:block">
            <div className="absolute inset-0 rounded-[24px] bg-gradient-to-l from-slate-200/65 via-slate-200/20 to-transparent blur-xl" />
            <div className="relative ml-auto h-full w-[190px] overflow-hidden rounded-2xl">
              <div className="grid h-full grid-cols-2 gap-2">
                <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/35 p-1">
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

                <div className="overflow-hidden rounded-xl border border-slate-200/60 bg-white/35 p-1">
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
              <span className="mb-3 block text-[10px] font-bold uppercase tracking-[0.3em] text-blue-700">
                {t('Guided Workflow', 'Yönlendirilmiş Akış')}
              </span>
              <h2 className={`${sectionTitleClass} mb-4`}>
                {t('How It Works', 'Nasıl Çalışır')}
              </h2>
              <p className="mx-auto max-w-2xl text-sm leading-relaxed text-slate-600">
                {t('From an empty page to a confirmed interview in three simple steps.', 'Boş bir sayfadan görüşmeye uzanan süreç üç net adımda.')}
              </p>
            </div>

            <div className="relative grid gap-6 md:grid-cols-3">
              <div className="pointer-events-none absolute left-[16.5%] right-[16.5%] top-10 hidden h-px bg-gradient-to-r from-blue-200 via-indigo-200 to-emerald-200 md:block" />

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(37,99,235,0.45)]">
                <span className="absolute right-5 top-5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">01</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100 to-slate-200 text-slate-900 ring-1 ring-slate-200/70">
                  <FileText className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900">{t('Build Your Base CV', 'Temel CV’ni Hazırla')}</h3>
                <p className="text-[15px] leading-7 text-slate-600">
                  {t('Enter your details into our builder with ATS-safe structure and instant A4 formatting.', 'Bilgilerini ATS güvenli yapıyla editöre gir, A4 formatını anında hazırla.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-blue-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('Foundation', 'Temel Kurulum')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(37,99,235,0.45)]">
                <span className="absolute right-5 top-5 rounded-full border border-indigo-100 bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700">02</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-100 text-blue-700 ring-1 ring-blue-100/70">
                  <Target className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900">{t('Tailor with AI', 'AI ile Özelleştir')}</h3>
                <p className="text-[15px] leading-7 text-slate-600">
                  {t("Paste your target job and let AI sharpen your bullets for role-matched keywords.", 'Hedef ilanını yapıştır, AI madde içeriklerini role uygun anahtar kelimelerle güçlendirsin.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-indigo-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('Optimization', 'Optimizasyon')}</p>
              </div>

              <div className="group relative overflow-hidden rounded-3xl border border-slate-200 bg-white/90 p-7 shadow-[0_16px_40px_-26px_rgba(15,23,42,0.45)] transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_24px_50px_-25px_rgba(16,185,129,0.45)]">
                <span className="absolute right-5 top-5 rounded-full border border-emerald-100 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">03</span>
                <div className="mb-5 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-50 to-green-100 text-emerald-700 ring-1 ring-emerald-100/70">
                  <CheckCircle2 className="h-7 w-7" />
                </div>
                <h3 className="mb-3 text-2xl font-semibold tracking-[-0.02em] text-slate-900">{t('Apply & Track', 'Başvur ve Takip Et')}</h3>
                <p className="text-[15px] leading-7 text-slate-600">
                  {t('Export your polished CV, apply confidently, and track outcomes in one workflow.', 'Güçlendirilmiş CV’ni dışa aktar, güvenle başvur ve sonuçlarını tek akışta takip et.')}
                </p>
                <div className="mt-6 h-px w-full bg-gradient-to-r from-emerald-100 via-slate-200 to-transparent" />
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">{t('Delivery', 'Teslimat')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing */}
        <section className="border-t bg-white py-24">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className={sectionTitleClass}>{t('Simple Fixed-USD Pricing', 'Sabit USD Fiyatlandırma')}</h2>
              <p className="mt-3 text-slate-600">
                {t('Build free. Preview free. Pay only when you export or need advanced tools.', 'Ücretsiz oluştur. Ücretsiz önizle. Sadece export veya gelişmiş araç gerektiğinde öde.')}
              </p>
              <p className="mt-2 text-sm text-slate-500">{billingSummaryText}</p>
            </div>

            <div className="mb-6 grid gap-5 md:grid-cols-2">
              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('Free Access', 'Ücretsiz Erişim')}</CardTitle>
                  <CardDescription>{t('For new registered users', 'Yeni kayıt olan kullanıcılar için')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700">
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
                  <p className="mt-4 text-xs text-slate-500">
                    {t('After free usage: PDF export costs', 'Ücretsiz hak sonrası: PDF export maliyeti')}{' '}
                    <strong>{PDF_EXPORT_CREDIT_COST}</strong> {t('credits, advanced AI call costs', 'kredi, gelişmiş AI çağrısı maliyeti')}{' '}
                    <strong>{ADVANCED_AI_CREDIT_COST}</strong> {t('credit.', 'kredi.')}
                  </p>
                </CardContent>
              </Card>

              <Card className="border-slate-200">
                <CardHeader>
                  <CardTitle className="text-2xl">{t('Paid Scope', 'Ücretli Kapsam')}</CardTitle>
                  <CardDescription>{t('What credits are used for', 'Kredilerin kullanıldığı özellikler')}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 text-sm text-slate-700">
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
                <Card key={pkg.code} className={`border ${pkg.highlight ? 'border-slate-900 shadow-sm' : 'border-slate-200'}`}>
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
                    <div className="text-4xl font-bold text-slate-900">{formatUsd(pkg.priceUsd)}</div>
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

        {/* FAQ */}
        <section className="border-t bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className={sectionTitleClass}>{t('Frequently Asked Questions', 'Sık Sorulan Sorular')}</h2>
              <p className="mt-3 text-slate-600">{t('Key answers about pricing, ATS compatibility, and resume optimization workflows.', 'Fiyatlandırma, ATS uyumluluğu ve CV optimizasyon akışları hakkında temel yanıtlar.')}</p>
            </div>

            <div className="mx-auto grid max-w-4xl gap-4">
              {faqItems.map((item) => (
                <Card key={item.question} className="border-slate-200">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg">{item.question}</CardTitle>
                  </CardHeader>
                  <CardContent className="text-slate-600">{item.answer}</CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <Image src={footerLogoSrc} alt={t('Pathica footer logo', 'Pathica alt logosu')} width={144} height={144} className="h-36 w-36 object-contain" />
          </div>
          <p className="mb-6 max-w-sm mx-auto">
            {t('The automated, AI-driven way to build resumes that pass ATS tests and win interviews.', 'ATS testlerini geçen ve mülakat şansını artıran özgeçmişleri AI destekli şekilde oluştur.')}
          </p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} {t('All rights reserved.', 'Tüm hakları saklıdır.')}
          </div>
        </div>
      </footer>
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
