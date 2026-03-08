import Image from 'next/image';
import Link from 'next/link';
import { cookies } from 'next/headers';
import { Button } from '@/components/ui/button';
import { FileText, Target, CheckCircle2, Zap, ArrowRight, ShieldCheck, Search, BarChart3, WandSparkles, BookOpen } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { MouseEffect } from '@/components/mouse-effect';
import { HeroIntro } from '@/components/home/HeroIntro';
import { DottedSurface } from '@/components/ui/dotted-surface';
import LanguageToggle from '@/components/language-toggle';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';
import fs from 'node:fs';
import path from 'node:path';

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
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans cursor-none">
      <MouseEffect />
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
            <Badge className="mb-6 mx-auto rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors cursor-default">
              {t('Powered by Google Gemini AI', 'Google Gemini AI ile güçlendirildi')}
            </Badge>
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
        {/* {t('Rejected', 'Eleniyor')} CV Showcase */}
        <section className="relative overflow-hidden bg-slate-50/50 py-20 dark:bg-slate-950">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
          <div className="pointer-events-none absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-50 to-transparent dark:from-slate-900" />

          <div className="container relative z-10 mx-auto px-6">
            <div className="mb-16 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-3 block">{t('ATS Failure Profile', 'ATS Başarısızlık Profili')}</span>
              <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-slate-900 dark:text-slate-100 mb-4">
                {t('Why 75% of CVs are', 'CV’lerin %75’i Neden')} <span className="text-red-600 font-extrabold drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">{t('Rejected', 'Eleniyor')}</span>
              </h2>
              <p className="mx-auto max-w-lg text-sm leading-relaxed text-slate-500 dark:text-slate-400"> {t("Creative layouts often confuse AI parsers. If the bot can't read it, your application never reaches a human desk.", 'Aşırı yaratıcı tasarımlar AI ayrıştırıcıları şaşırtır. Bot metni okuyamazsa başvurun bir insana ulaşmaz.')}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  src: 'https://www.slideteam.net/media/catalog/product/cache/1280x720/b/u/business_professional_resume_sample_a4_cv_template_slide01.jpg',
                  tag: t('Level 1: Unparseable', 'Seviye 1: Okunamıyor'),
                  reason: t('Graphics Overflow', 'Görsel Ağırlık'),
                  detail: t('Heavy images and decorative icons block text extraction.', 'Ağır görseller ve dekoratif ikonlar metin çıkarmayı bozar.')
                },
                {
                  src: 'https://www.my-resume-templates.com/wp-content/uploads/2024/01/cv-template-online-252.jpg',
                  tag: t('Level 2: Jumbled', 'Seviye 2: Karışık'),
                  reason: t('Multi-Column Mess', 'Çoklu Sütun Sorunu'),
                  detail: t('Non-standard columns cause text to merge in the wrong order.', 'Standart dışı sütunlar metin sırasını bozup anlamı dağıtır.')
                },
                {
                  src: 'https://www.my-resume-templates.com/wp-content/uploads/2023/05/college-resume-template-example-1-350x495.jpg',
                  tag: t('Level 3: Filtered', 'Seviye 3: Filtrelendi'),
                  reason: t('Keyword Deficit', 'Anahtar Kelime Eksiği'),
                  detail: t('Style-over-substance leads to zero matching role keywords.', 'İçerik zayıf kalınca role uyumlu anahtar kelimeler yakalanmaz.')
                },
              ].map((cv, index) => (
                <div
                  key={index}
                  className="group relative aspect-[1/1.41] w-full overflow-hidden border border-slate-200 bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] transition-all duration-500 hover:-translate-y-1 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] dark:border-slate-700 dark:bg-slate-900"
                >
                  {/* Subtle Scan Overlay */}
                  <div className="absolute inset-0 bg-[linear-gradient(transparent_50%,rgba(0,0,0,0.02)_50%)] bg-[length:100%_4px] pointer-events-none z-10 opacity-30 group-hover:opacity-50 transition-opacity" />

                  {/* CV Image */}
                  <img
                    src={cv.src}
                    alt={cv.reason}
                    className="h-full w-full object-cover object-top grayscale-[30%] group-hover:grayscale-0 transition-all duration-700 opacity-60 group-hover:opacity-90"
                    loading="lazy"
                  />

                  {/* Stamp Design */}
                  <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none opacity-40 group-hover:opacity-100 transition-opacity duration-300">
                    <div className="border-[3px] border-rose-600 px-3 py-1.5 rotate-[-12deg] bg-rose-50/10 backdrop-blur-[1px] shadow-[0_0_15px_rgba(225,29,72,0.1)] group-hover:scale-110 transition-transform duration-500">
                      <span className="text-xl font-black tracking-[0.2em] text-rose-600">
                        {t('DENIED', 'REDDEDİLDİ')}
                      </span>
                    </div>
                  </div>

                  {/* Info Panel - Sliding Up on Hover */}
                  <div className="absolute bottom-0 left-0 right-0 p-4 z-30 translate-y-full group-hover:translate-y-0 transition-transform duration-500 ease-out">
                    <div className="bg-slate-900/90 backdrop-blur-md p-4 border-t border-white/10 shadow-2xl">
                      <span className="text-[9px] font-bold text-rose-400 uppercase tracking-widest block mb-1">{cv.tag}</span>
                      <h3 className="text-base font-bold text-white mb-1">{cv.reason}</h3>
                      <p className="text-[11px] text-slate-300 leading-normal font-medium">{cv.detail}</p>
                    </div>
                  </div>

                  {/* Top Badge */}
                  <div className="absolute top-3 right-3 z-20 flex items-center gap-1.5 border border-slate-200 bg-white/80 px-2 py-1 shadow-sm backdrop-blur-sm dark:border-slate-700 dark:bg-slate-900/80">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[9px] font-bold tracking-tight text-slate-600 dark:text-slate-300">{t('FAILED SCAN', 'TARAMA BAŞARISIZ')}</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="mb-6 text-[12px] font-medium italic text-slate-400 dark:text-slate-500">{t("Don't risk your career on a bad template.", 'Kariyerini kötü bir şablona emanet etme.')}</p>
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0" asChild>
                <Link href={heroPrimaryHref}>{t('Create Compliant CV', 'Uyumlu CV Oluştur')}</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 h-px w-full -translate-x-1/2 bg-gradient-to-r from-transparent via-slate-200 to-transparent dark:via-slate-700" />
        </section>

        {/* {t('How It Works', 'Nasıl Çalışır')} */}
        <section className="py-24 bg-slate-50" id="how-it-works">
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-slate-900 dark:text-slate-100 mb-4">{t('How It Works', 'Nasıl Çalışır')}</h2>
            <p className="text-slate-500 mb-16 max-w-2xl mx-auto">{t('From an empty page to a confirmed interview in three simple steps.', 'Boş bir sayfadan görüşmeye uzanan süreç üç net adımda.')}</p>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('1. Build Your Base CV', '1. Temel CV’ni Hazırla')}</h3>
                <p className="text-slate-600">{t('Enter your details into our beautiful, intuitive builder. Our templates are guaranteed to be 100% readable by Applicant Tracking Systems.', 'Bilgilerini sezgisel editöre gir. Şablonlarımız ATS tarafından %100 okunabilir olacak şekilde tasarlanmıştır.')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('2. Tailor with AI', '2. AI ile Özelleştir')}</h3>
                <p className="text-slate-600">{t("Find a job you love? Paste the description and let Gemini AI rewrite your achievements to perfectly match the role's keywords.", 'İlan metnini yapıştır, AI başarılarını role uygun anahtar kelimelerle güçlendirsin.')}</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-6 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">{t('3. Apply & Track', '3. Başvur ve Takip Et')}</h3>
                <p className="text-slate-600">{t('Generate a custom cover letter, refine your resume with AI, and apply with confidence.', 'Özel ön yazı oluştur, CV’ni geliştir ve başvurularını güvenle yönet.')}</p>
              </div>
            </div>
          </div>
        </section>

        {/* Free Plan */}
        <section className="py-24 bg-white border-t" >
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-medium tracking-[-0.04em] text-slate-900 dark:text-slate-100 mb-4">{t('Start Free', 'Ücretsiz Başla')}</h2>
              <p className="text-slate-500">{t('Everything you need to build an ATS-friendly CV and export it.', 'ATS uyumlu CV hazırlayıp dışa aktarmak için gereken her şey burada.')}</p>
            </div>

            <div className="grid grid-cols-1 max-w-2xl mx-auto">
              <Card className="border-2 border-slate-100 hover:border-slate-200 transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl">Standard</CardTitle>
                  <CardDescription>{t('Perfect for creating a basic, ATS-compliant resume.', 'Temel ve ATS uyumlu bir özgeçmiş oluşturmak için ideal.')}</CardDescription>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0
                    <span className="ml-1 text-xl font-medium text-slate-500">{t('/ forever', '/ sonsuza dek')}</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mt-6 space-y-4">
                    {['1 Free ATS-Compliant PDF Export', 'Intuitive Drag & Drop Builder', 'Real-time A4 Preview', 'Unlimited Resume Editing'].map((feature) => (
                      <li key={feature} className="flex">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8 h-12 font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-primary/30 hover:text-primary" variant="outline" asChild>
                    <Link href="/cv/new">{t('Get Started Free', 'Ücretsiz Başla')}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Tools and Guides */}
        <section className="border-t bg-slate-50 py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-12 max-w-3xl text-center">
              <h2 className="text-3xl font-medium tracking-[-0.03em] text-slate-900">{t('Free Tools for Smarter Applications', 'Daha Akıllı Başvurular İçin Ücretsiz Araçlar')}</h2>
              <p className="mt-3 text-slate-600">{t('Use Pathica tools to improve ATS match, strengthen wording, and apply with more confidence.', 'Pathica araçlarıyla ATS uyumunu artır, dili güçlendir ve daha güvenli başvur.')}</p>
            </div>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-4">
              <Link href="/ats-resume-checker" className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                <Search className="mb-3 h-6 w-6 text-blue-600" />
                <h3 className="font-semibold text-slate-900">{t('ATS Resume Checker', 'ATS CV Kontrolü')}</h3>
                <p className="mt-2 text-sm text-slate-600">{t('Get a quick ATS-style score and fix parsing issues.', 'Hızlı bir ATS puanı al ve ayrıştırma hatalarını düzelt.')}</p>
              </Link>
              <Link href="/resume-analyzer" className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                <BarChart3 className="mb-3 h-6 w-6 text-emerald-600" />
                <h3 className="font-semibold text-slate-900">{t('Resume Analyzer', 'CV Analizörü')}</h3>
                <p className="mt-2 text-sm text-slate-600">{t('See readability, structure, and keyword gaps in one view.', 'Okunabilirlik, yapı ve anahtar kelime boşluklarını tek ekranda gör.')}</p>
              </Link>
              <Link href="/resume-score" className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                <Target className="mb-3 h-6 w-6 text-amber-600" />
                <h3 className="font-semibold text-slate-900">{t('Resume Score', 'CV Skoru')}</h3>
                <p className="mt-2 text-sm text-slate-600">{t('Track your resume quality with a practical 0-100 score.', 'Özgeçmiş kaliteni pratik bir 0-100 skorla takip et.')}</p>
              </Link>
              <Link href="/resume-keyword-optimizer" className="group rounded-2xl border bg-white p-5 transition hover:-translate-y-1 hover:shadow-md">
                <WandSparkles className="mb-3 h-6 w-6 text-violet-600" />
                <h3 className="font-semibold text-slate-900">{t('Keyword Optimizer', 'Anahtar Kelime Optimizörü')}</h3>
                <p className="mt-2 text-sm text-slate-600">{t('Match role-specific terms from any job description.', 'İlan metninden role özel terimleri eşleştir.')}</p>
              </Link>
            </div>

            <div className="mt-12 flex justify-center">
              <Button asChild variant="outline" className="rounded-full px-7">
                <Link href="/template-gallery">{t('Explore Public Templates', 'Açık Şablonları Keşfet')}</Link>
              </Button>
            </div>
          </div>
        </section>

        {/* SEO Guide Hub */}
        <section className="border-t bg-white py-20">
          <div className="container mx-auto max-w-6xl px-6">
            <div className="mx-auto mb-10 max-w-3xl text-center">
              <h2 className="text-3xl font-medium tracking-[-0.03em] text-slate-900">{t('Resume Guides and Examples', 'Özgeçmiş Rehberleri ve Örnekler')}</h2>
              <p className="mt-3 text-slate-600">{t('Read focused guides, copy practical patterns, and convert them into your resume draft.', 'Odaklı rehberleri oku, pratik kalıpları kopyala ve CV taslağına dönüştür.')}</p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {[
                { href: '/resume-examples', title: t('Resume Examples', 'Özgeçmiş Örnekleri'), text: t('Role-based examples you can adapt quickly.', 'Role göre hızla uyarlayabileceğin örnekler.') },
                { href: '/how-to-write-a-resume', title: t('How to Write a Resume', 'Özgeçmiş Nasıl Yazılır'), text: t('A step-by-step writing framework.', 'Adım adım yazım çerçevesi.') },
                { href: '/ats-friendly-resume', title: t('ATS-Friendly Resume Guide', 'ATS Uyumlu Özgeçmiş Rehberi'), text: t('Checklist to improve ATS compatibility.', 'ATS uyumunu artıran kontrol listesi.') },
                { href: '/resume-summary-examples', title: t('Summary Examples', 'Özet Örnekleri'), text: t('Fast templates for stronger profile summaries.', 'Daha güçlü profil özetleri için hızlı kalıplar.') },
                { href: '/resume-skills-examples', title: t('Skills Examples', 'Beceri Örnekleri'), text: t('Role-relevant skills lists and usage tips.', 'Role uygun beceri listeleri ve kullanım ipuçları.') },
                { href: '/blog', title: t('Career Blog', 'Kariyer Blogu'), text: t('60+ SEO guides on resumes, interviews, and careers.', 'Özgeçmiş, mülakat ve kariyer için 60+ rehber.') },
              ].map((item) => (
                <Link key={item.href} href={item.href} className="rounded-2xl border bg-slate-50 p-5 transition hover:bg-slate-100">
                  <BookOpen className="mb-3 h-5 w-5 text-slate-600" />
                  <h3 className="font-semibold text-slate-900">{item.title}</h3>
                  <p className="mt-2 text-sm text-slate-600">{item.text}</p>
                </Link>
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

// Inline Badge component for simpler layout
function Badge({ children, className }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`inline-flex items-center justify-center font-medium ${className}`}>
      {children}
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














