'use client';;
import { useEffect, useMemo, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import {
  AlertTriangle,
  ArrowRight,
  Briefcase,
  CheckCircle2,
  ChevronRight,
  FileText,
  Sparkles,
  Target,
  Zap,
} from 'lucide-react';
import { CVTemplate } from '@/components/pdf/CVTemplate';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

import CheckoutButton from '@/components/billing/CheckoutButton';
import type { CVState } from '@/context/CVContext';
import { CV_PAGE_HEIGHT_PX, CV_PAGE_WIDTH_PX } from '@/lib/cv-layout';
import { buildCvStateFromTemplate, getCvTemplateSeed } from '@/lib/cv-templates';
import { cn } from '@/lib/utils';

type ProofMetric = {
  label: string;
  score: number;
  total: number;
};

type WorkflowStep = {
  number: string;
  title: string;
  description: string;
  label: string;
  icon: 'foundation' | 'tailor' | 'deliver';
};

type PricingPackage = {
  id: string;
  code?: string;
  name: string;
  displayPrice: string;
  description: string;
  features: string[];
  isPopular?: boolean;
  isConfigured?: boolean;
  ctaLabel: string;
  href: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type QuoteEntry = {
  text: string;
  author: string;
  role: string;
  initials: string;
};

type StatsBadge = {
  label: string;
  detail: string;
};

type ViewportDensity = 'regular' | 'compact' | 'tight';

type HomeCinematicExperienceProps = {
  isAuthenticated: boolean;
  logoSrc: string;
  navCtaHref: string;
  navCtaLabel: string;
  heroPrimaryHref: string;
  heroPrimaryLabel: string;
  heroSecondaryLabel: string;
  heroTitleTop: string;
  heroTitleAccent?: string;
  heroTitleAccentWords?: string[];
  heroTitleBottom: string;
  heroSubtitle: string;
  navLabels: {
    proof: string;
    flow: string;
    pricing: string;
    questions: string;
  };
  heroTrustItems: string[];
  proof: {
    label: string;
    title: string;
    description: string;
    findings: Array<{ title: string; body: string }>;
    scoreLabel: string;
    metrics: ProofMetric[];
  };
  workflow: {
    label: string;
    title: string;
    description: string;
    steps: WorkflowStep[];
  };
  quote: {
    label: string;
    entries: QuoteEntry[];
  };
  stats: {
    label: string;
    companyLabel: string;
    badges: StatsBadge[];
    values: Array<{ value: string; label: string }>;
  };
  pricing: {
    label: string;
    title: string;
    description: string;
    summary: string;
    footnote: string;
    packages: PricingPackage[];
  };
  faq: {
    label: string;
    title: string;
    items: FaqItem[];
    openLabel: string;
    closeLabel: string;
  };
};

const PRE_PRICING_SLIDE_IDS = ['tailor', 'discover', 'flow', 'quote', 'stats'] as const;
const POST_PRICING_SLIDE_IDS = ['questions'] as const;
const SLIDE_IDS = ['proof', ...PRE_PRICING_SLIDE_IDS, 'pricing', ...POST_PRICING_SLIDE_IDS] as const;
const ACCENT_CLASS = 'text-[#9bd5ff]';
const ACCENT_BG_CLASS = 'bg-[#9bd5ff]';
const PRE_PINNED_SCROLL_STEP_VH = 1.38;
const POST_PINNED_SCROLL_STEP_VH = 1.2;
const PINNED_STACK_TAIL_HOLD_VH = 0.58;
const PINNED_SLIDE_HOLD_RATIO = 0.74;
const HOME_PREVIEW_TEMPLATE = getCvTemplateSeed('classic-ats');
const HOME_PREVIEW_CV = HOME_PREVIEW_TEMPLATE
  ? ({
      ...buildCvStateFromTemplate(HOME_PREVIEW_TEMPLATE, 'en'),
    } as CVState)
  : null;

export function HomeCinematicExperience({
  isAuthenticated,
  logoSrc,
  navCtaHref,
  navCtaLabel,
  heroPrimaryHref,
  heroPrimaryLabel,
  heroSecondaryLabel,
  heroTitleTop,
  heroTitleAccent,
  heroTitleAccentWords,
  heroTitleBottom,
  heroSubtitle,
  navLabels,
  heroTrustItems,
  proof,
  workflow,
  quote,
  stats,
  pricing,
  faq
}: HomeCinematicExperienceProps) {
  const preStackRef = useRef<HTMLDivElement>(null);
  const pricingSectionRef = useRef<HTMLElement>(null);
  const postStackRef = useRef<HTMLDivElement>(null);
  const [preProgressIndex, setPreProgressIndex] = useState(0);
  const [postProgressIndex, setPostProgressIndex] = useState(0);
  const [activeSlideId, setActiveSlideId] = useState<(typeof SLIDE_IDS)[number]>('proof');
  const [openFaqIndex, setOpenFaqIndex] = useState(0);
  const [isDesktop, setIsDesktop] = useState(true);
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [supportEmail, setSupportEmail] = useState('');
  const [supportMessage, setSupportMessage] = useState('');
  const [isSubmittingSupport, setIsSubmittingSupport] = useState(false);

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!supportEmail || !supportMessage) return;
    setIsSubmittingSupport(true);
    try {
      const res = await fetch('/api/support', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: supportEmail, message: supportMessage }),
      });
      if (res.ok) {
        setIsSupportOpen(false);
        setSupportEmail('');
        setSupportMessage('');
        toast.success(locale === 'tr' ? 'Talebiniz alındı.' : 'Support ticket submitted.');
      } else {
        toast.error(locale === 'tr' ? 'Bir hata oluştu.' : 'Failed to submit ticket.');
      }
    } catch (e) {
      console.error(e);
      toast.error(locale === 'tr' ? 'Bir hata oluştu.' : 'Failed to submit ticket.');
    } finally {
      setIsSubmittingSupport(false);
    }
  };

  useEffect(() => {
    const handleResize = () => setIsDesktop(window.innerWidth >= 1024);
    handleResize(); // Initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(1080);
  const [heroAccentIndex, setHeroAccentIndex] = useState(0);
  const resolvedHeroAccentWords = useMemo(
    () => (heroTitleAccentWords?.length ? heroTitleAccentWords : heroTitleAccent ? [heroTitleAccent] : []),
    [heroTitleAccent, heroTitleAccentWords],
  );
  const preStackViewportCount = 1 + Math.max(PRE_PRICING_SLIDE_IDS.length - 1, 0) * PRE_PINNED_SCROLL_STEP_VH + PINNED_STACK_TAIL_HOLD_VH;
  const postStackViewportCount = 1 + Math.max(POST_PRICING_SLIDE_IDS.length - 1, 0) * POST_PINNED_SCROLL_STEP_VH + PINNED_STACK_TAIL_HOLD_VH;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    const handleMediaChange = () => setPrefersReducedMotion(mediaQuery.matches);
    handleMediaChange();
    mediaQuery.addEventListener('change', handleMediaChange);

    const update = () => {
      const currentViewportHeight = window.innerHeight;
      const viewportMarker = window.scrollY + currentViewportHeight * 0.45;
      let nextActiveSlideId: (typeof SLIDE_IDS)[number] = 'proof';

      const proofSection = document.getElementById('proof');
      if (proofSection) {
        const rect = proofSection.getBoundingClientRect();
        const top = window.scrollY + rect.top;
        const bottom = top + proofSection.offsetHeight;
        if (viewportMarker >= top && viewportMarker < bottom) {
          nextActiveSlideId = 'proof';
        }
      }

      if (preStackRef.current) {
        const rect = preStackRef.current.getBoundingClientRect();
        const totalScrollable = Math.max(currentViewportHeight * (preStackViewportCount - 1), 1);
        const scrolled = clamp(-rect.top, 0, totalScrollable);
        const nextIndex = clamp(scrolled / (currentViewportHeight * PRE_PINNED_SCROLL_STEP_VH), 0, PRE_PRICING_SLIDE_IDS.length - 1);
        const preTop = window.scrollY + rect.top;
        const preBottom = preTop + preStackRef.current.offsetHeight;

        setPreProgressIndex(nextIndex);

        if (viewportMarker >= preTop && viewportMarker < preBottom) {
          nextActiveSlideId = PRE_PRICING_SLIDE_IDS[resolveHeldSlideIndex(nextIndex, PRE_PRICING_SLIDE_IDS.length)] ?? 'proof';
        }
      }

      if (pricingSectionRef.current) {
        const rect = pricingSectionRef.current.getBoundingClientRect();
        const pricingTop = window.scrollY + rect.top;
        const pricingBottom = pricingTop + pricingSectionRef.current.offsetHeight;

        if (viewportMarker >= pricingTop && viewportMarker < pricingBottom) {
          nextActiveSlideId = 'pricing';
        }
      }

      if (postStackRef.current) {
        const rect = postStackRef.current.getBoundingClientRect();
        const totalScrollable = Math.max(currentViewportHeight * (postStackViewportCount - 1), 1);
        const scrolled = clamp(-rect.top, 0, totalScrollable);
        const nextIndex = clamp(scrolled / (currentViewportHeight * POST_PINNED_SCROLL_STEP_VH), 0, Math.max(POST_PRICING_SLIDE_IDS.length - 1, 0));
        const postTop = window.scrollY + rect.top;
        const postBottom = postTop + postStackRef.current.offsetHeight;

        setPostProgressIndex(nextIndex);

        if (viewportMarker >= postTop && viewportMarker < postBottom) {
          nextActiveSlideId = POST_PRICING_SLIDE_IDS[resolveHeldSlideIndex(nextIndex, POST_PRICING_SLIDE_IDS.length)] ?? 'questions';
        }
      }

      setActiveSlideId(nextActiveSlideId);
    };

    let rafId: number | null = null;
    const scheduleUpdate = () => {
      if (rafId !== null) return;
      rafId = window.requestAnimationFrame(() => {
        rafId = null;
        update();
      });
    };

    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      scheduleUpdate();
    };

    setViewportHeight(window.innerHeight);
    scheduleUpdate();
    window.addEventListener('scroll', scheduleUpdate, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId !== null) {
        window.cancelAnimationFrame(rafId);
      }
      mediaQuery.removeEventListener('change', handleMediaChange);
      window.removeEventListener('scroll', scheduleUpdate);
      window.removeEventListener('resize', handleResize);
    };
  }, [postStackViewportCount, preStackViewportCount]);

  useEffect(() => {
    if (resolvedHeroAccentWords.length <= 1 || prefersReducedMotion) return;

    const intervalId = window.setInterval(() => {
      setHeroAccentIndex((current) => (current + 1) % resolvedHeroAccentWords.length);
    }, 1500);

    return () => window.clearInterval(intervalId);
  }, [resolvedHeroAccentWords, prefersReducedMotion]);

  const activePreSlideIndex = prefersReducedMotion
    ? Math.round(preProgressIndex)
    : resolveHeldSlideIndex(preProgressIndex, PRE_PRICING_SLIDE_IDS.length);
  const activePostSlideIndex = prefersReducedMotion
    ? Math.round(postProgressIndex)
    : resolveHeldSlideIndex(postProgressIndex, POST_PRICING_SLIDE_IDS.length);
  const activeSlideIndex = Math.max(0, SLIDE_IDS.findIndex((slideId) => slideId === activeSlideId));
  const viewportDensity: ViewportDensity = viewportHeight < 840 ? 'tight' : viewportHeight < 1040 ? 'compact' : 'regular';
  const heroCanvasHeight = Math.max(viewportHeight - 80, 560);
  const slideBottomInset = viewportDensity === 'tight' ? 74 : viewportDensity === 'compact' ? 82 : 90;
  const slideCanvasHeight = Math.max(viewportHeight - 80 - slideBottomInset, 420);
  const quoteScrollProgress = clamp((preProgressIndex - 3) / 0.8, 0, 0.999);
  const activeQuoteIndex = Math.min(quote.entries.length - 1, Math.floor(quoteScrollProgress * quote.entries.length));

  const slideMeta = useMemo(
    () => [
      { id: 'proof', navLabel: navLabels.proof },
      { id: 'tailor', navLabel: '' },
      { id: 'discover', navLabel: '' },
      { id: 'flow', navLabel: navLabels.flow },
      { id: 'quote', navLabel: '' },
      { id: 'stats', navLabel: '' },
      { id: 'pricing', navLabel: navLabels.pricing },
      { id: 'questions', navLabel: navLabels.questions },
    ],
    [navLabels.flow, navLabels.pricing, navLabels.proof, navLabels.questions],
  );

  const scrollToHero = () => {
    if (typeof window === 'undefined') return;
    window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const scrollToSlide = (slideId: (typeof SLIDE_IDS)[number]) => {
    if (!isDesktop) {
      const el = document.getElementById(slideId);
      if (el) {
        // Adjust for header height
        const top = el.getBoundingClientRect().top + window.scrollY - 100;
        window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      }
      return;
    }

    if (typeof window === 'undefined') return;

    let top = 0;

    if (slideId === 'proof') {
      const el = document.getElementById('proof');
      if (el) {
        top = el.getBoundingClientRect().top + window.scrollY - 80;
      }
    } else if (PRE_PRICING_SLIDE_IDS.includes(slideId as (typeof PRE_PRICING_SLIDE_IDS)[number]) && preStackRef.current) {
      const slideIndex = PRE_PRICING_SLIDE_IDS.findIndex((s) => s === slideId);
      top = preStackRef.current.getBoundingClientRect().top + window.scrollY + slideIndex * window.innerHeight * PRE_PINNED_SCROLL_STEP_VH;
    } else if (slideId === 'pricing' && pricingSectionRef.current) {
      top = pricingSectionRef.current.getBoundingClientRect().top + window.scrollY;
    } else if (POST_PRICING_SLIDE_IDS.includes(slideId as (typeof POST_PRICING_SLIDE_IDS)[number]) && postStackRef.current) {
      const slideIndex = POST_PRICING_SLIDE_IDS.findIndex((s) => s === slideId);
      top = postStackRef.current.getBoundingClientRect().top + window.scrollY + slideIndex * window.innerHeight * POST_PINNED_SCROLL_STEP_VH;
    } else {
      return;
    }

    window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
  };

  const renderSlide = (slideId: (typeof SLIDE_IDS)[number]) => {
    if (slideId === 'proof') {
      return <ProofSection proof={proof} density={viewportDensity} />;
    }
    if (slideId === 'tailor') {
      return <TailorSlide density={viewportDensity} />;
    }
    if (slideId === 'discover') {
      return <DiscoverSlide density={viewportDensity} />;
    }
    if (slideId === 'flow') {
      return <WorkflowSlide workflow={workflow} density={viewportDensity} />;
    }
    if (slideId === 'quote') {
      return <QuoteSlide quote={quote} density={viewportDensity} activeQuoteIndex={activeQuoteIndex} />;
    }
    if (slideId === 'stats') {
      return <StatsSlide stats={stats} density={viewportDensity} />;
    }
    if (slideId === 'pricing') {
      return (
        <PricingSlide
          pricing={pricing}
          density={viewportDensity}
          isAuthenticated={isAuthenticated} />
      );
    }
    return <FaqSlide faq={faq} openFaqIndex={openFaqIndex} onOpenFaq={setOpenFaqIndex} density={viewportDensity} />;
  };

  return (
    <div className="min-h-screen bg-[#05070b] text-white">
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="bg-gradient-to-r from-blue-600/90 via-indigo-600/90 to-purple-600/90 backdrop-blur-md px-4 py-3.5 flex items-center justify-center text-center text-sm font-medium text-white border-b border-blue-400/20 shadow-[0_4px_20px_-5px_rgba(79,70,229,0.3)]">
          {locale === 'tr' ? (
            <p className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="font-bold text-blue-50">Sınırsız & Ücretsiz:</span> 
              <span>Dilediğin kadar CV üret, depola ve Pathica linki ile sınırsız paylaş! +10 Kredi ve 1 PDF Export ilk kayıtta hediye.</span>
            </p>
          ) : (
            <p className="flex items-center justify-center gap-1.5 flex-wrap">
              <span className="font-bold text-blue-50">Unlimited & Free:</span> 
              <span>Create, store, and share CVs via Pathica link as much as you want! +10 Credits and 1 PDF Export free on signup.</span>
            </p>
          )}
        </div>
        <div className="bg-[#05070b]/78 backdrop-blur-xl">
          <div className="mx-auto flex h-24 max-w-7xl items-center justify-between px-5 sm:px-6 lg:px-8">
            <button type="button" onClick={scrollToHero} className="group flex items-center" aria-label="Pathica home">
              <Image
                src={logoSrc}
                alt="Pathica"
                width={288}
                height={288}
                className="h-20 sm:h-24 w-auto object-contain brightness-0 invert transition-transform duration-300 group-hover:scale-[1.02]"
              />
            </button>

          <nav className="hidden items-center gap-7 text-sm font-medium text-white/50 md:flex">
            {slideMeta
              .filter((item) => item.navLabel)
              .map((item) => {
                const isActive = activeSlideId === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => scrollToSlide(item.id as (typeof SLIDE_IDS)[number])}
                    className={cn('transition-colors', isActive ? 'text-white' : 'hover:text-white')}
                  >
                    {item.navLabel}
                  </button>
                );
              })}
          </nav>

          <div className="flex items-center gap-3 sm:gap-4">

            <Dialog open={isSupportOpen} onOpenChange={setIsSupportOpen}>
              <DialogTrigger asChild>
                <button className="hidden text-sm font-medium text-white/65 transition-colors hover:text-white md:inline-flex">
                  {locale === 'tr' ? 'Destek' : 'Support'}
                </button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px] bg-[#0a101a] text-white border-white/10">
                <DialogHeader>
                  <DialogTitle className="text-white">{locale === 'tr' ? 'Destek Talebi' : 'Support Ticket'}</DialogTitle>
                  <DialogDescription className="text-white/60">
                    {locale === 'tr' ? 'Sorularınız veya sorunlarınız için bize ulaşın.' : 'Contact us for any questions or issues.'}
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleSupportSubmit} className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="email" className="text-white/80">{locale === 'tr' ? 'E-posta' : 'Email'}</Label>
                    <Input
                      id="email"
                      type="email"
                      value={supportEmail}
                      onChange={(e) => setSupportEmail(e.target.value)}
                      placeholder="E.g. name@example.com"
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30"
                      required
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="message" className="text-white/80">{locale === 'tr' ? 'Mesaj' : 'Message'}</Label>
                    <Textarea
                      id="message"
                      value={supportMessage}
                      onChange={(e) => setSupportMessage(e.target.value)}
                      placeholder={locale === 'tr' ? 'Nasıl yardımcı olabiliriz?' : 'How can we help?'}
                      className="bg-white/5 border-white/10 text-white placeholder:text-white/30 min-h-[100px]"
                      required
                    />
                  </div>
                  <Button type="submit" disabled={isSubmittingSupport} className="bg-[#9bd5ff] text-slate-950 hover:bg-[#b5e2ff] border-0">
                    {isSubmittingSupport ? (locale === 'tr' ? 'Gönderiliyor...' : 'Submitting...') : (locale === 'tr' ? 'Gönder' : 'Submit')}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
            <Button
              asChild
              className="h-11 rounded-full border-0 bg-[#9bd5ff] px-5 text-sm font-semibold text-slate-950 shadow-[0_20px_55px_-28px_rgba(155,213,255,0.9)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b5e2ff] sm:px-6"
            >
              <Link href={navCtaHref}>{navCtaLabel}</Link>
            </Button>
          </div>
        </div>
        </div>
      </header>
      <main>
        <section className="relative min-h-[100svh] overflow-hidden border-b border-slate-700/30 pt-32">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_22%,rgba(155,213,255,0.16),transparent_30%),radial-gradient(circle_at_82%_18%,rgba(80,130,255,0.14),transparent_28%),linear-gradient(180deg,#06070b_0%,#090d16_58%,#08111d_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.04)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.04)_1px,transparent_1px)] bg-[size:110px_110px] opacity-[0.07]" />

          <div
            className="relative mx-auto grid w-full max-w-7xl items-start gap-8 px-5 pb-8 pt-5 sm:px-6 lg:grid-cols-[0.9fr_1.1fr] lg:px-8 lg:pt-6"
            style={{ minHeight: `${heroCanvasHeight}px` }}
          >
            <div className="max-w-[48rem]">
              <h1
                className={cn(
                  'mt-5 font-semibold leading-[0.9] tracking-[-0.07em] text-white',
                  viewportDensity === 'tight'
                    ? 'text-[clamp(2.3rem,4.8vw,4.2rem)]'
                    : viewportDensity === 'compact'
                      ? 'text-[clamp(2.55rem,5.5vw,4.85rem)]'
                      : 'text-[clamp(2.8rem,6vw,5.65rem)]',
                )}
              >
                <span className="block">{heroTitleTop}</span>
                <RotatingHeroLine
                  words={resolvedHeroAccentWords}
                  activeIndex={heroAccentIndex}
                  prefersReducedMotion={prefersReducedMotion}
                  className={ACCENT_CLASS}
                />
                <span className="block">{heroTitleBottom}</span>
              </h1>
              <p
                className={cn(
                  'mt-6 max-w-[33rem] text-white/66',
                  viewportDensity === 'tight'
                    ? 'max-w-[30rem] text-[15px] leading-6'
                    : viewportDensity === 'compact'
                      ? 'max-w-[31rem] text-[16px] leading-7'
                      : 'max-w-[33rem] text-[16px] leading-7 sm:text-[1.05rem] sm:leading-8',
                )}
              >
                {heroSubtitle}
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Button
                  size="lg"
                  asChild
                  className="h-12 rounded-full bg-[#9bd5ff] px-7 text-sm font-semibold text-slate-950 shadow-[0_28px_70px_-30px_rgba(155,213,255,0.88)] transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#b5e2ff]"
                >
                  <Link href={heroPrimaryHref}>
                    {heroPrimaryLabel}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  type="button"
                  onClick={() => scrollToSlide('proof')}
                  className="h-12 rounded-full border-white/12 bg-white/[0.03] px-7 text-sm font-semibold text-white shadow-none transition-all duration-300 hover:bg-white/[0.06]"
                >
                  {heroSecondaryLabel}
                </Button>
              </div>

              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2.5 text-xs text-white/55 sm:text-sm">
                {heroTrustItems.map((item) => (
                  <div key={item} className="inline-flex items-center gap-2">
                    <span className={cn('h-1.5 w-1.5 rounded-full', ACCENT_BG_CLASS)} />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="hidden lg:flex lg:justify-end">
              <HeroShowcase density={viewportDensity} />
            </div>
          </div>
        </section>

        <section
          id="proof"
          className="relative bg-[#05070b] py-20 lg:py-28 overflow-hidden border-b border-slate-700/30"
        >
          <div className="mx-auto max-w-7xl px-5 sm:px-6 lg:px-8">
            <ProofSection proof={proof} density={viewportDensity} />
          </div>
        </section>

        <div ref={preStackRef} className="relative" style={{ height: isDesktop ? `${preStackViewportCount * 100}vh` : 'auto' }}>
          <div className={cn(isDesktop ? "sticky top-0 h-screen overflow-hidden [perspective:1800px]" : "flex flex-col gap-24 py-16")}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(155,213,255,0.1),transparent_24%),linear-gradient(180deg,#06070b_0%,#05070b_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.035)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.035)_1px,transparent_1px)] bg-[size:110px_110px] opacity-[0.05]" />

            {isDesktop && (
              <div className="pointer-events-none absolute right-5 top-36 z-30 hidden text-right font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.36em] text-white/35 lg:block">
                <span>{String(activeSlideIndex + 1).padStart(2, '0')}</span>
                <span className="mx-2 text-white/18">/</span>
                <span>{String(SLIDE_IDS.length).padStart(2, '0')}</span>
              </div>
            )}

            {PRE_PRICING_SLIDE_IDS.map((slideId, index) => {
              const isActive = index === activePreSlideIndex;
              const globalIndex = SLIDE_IDS.indexOf(slideId);
              const isPast = globalIndex < activeSlideIndex;

              return (
                <section
                  key={slideId}
                  id={slideId}
                  data-slide={slideId}
                  className={cn(isDesktop ? "absolute inset-x-0 bottom-0 top-32 flex items-center px-0" : "relative w-full")}
                  style={isDesktop ? {
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? 'translate3d(0, 0, 0) scale(1)'
                      : `translate3d(0, ${isPast ? '-4vh' : '4vh'}, 0) scale(0.985)`,
                    pointerEvents: isActive ? 'auto' : 'none',
                    visibility: isActive ? 'visible' : 'hidden',
                    zIndex: isActive ? 30 : 10 - index,
                    transformOrigin: '50% 40%',
                    transition: prefersReducedMotion
                      ? 'none'
                      : 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1), visibility 600ms',
                  } : undefined}
                >
                  <div
                    className={cn("mx-auto flex w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8", isDesktop && "overflow-hidden")}
                    style={{ height: isDesktop ? `${slideCanvasHeight}px` : 'auto' }}
                  >
                    <PinnedSlideFrame active={isDesktop ? isActive : true} prefersReducedMotion={prefersReducedMotion}>
                      {renderSlide(slideId)}
                    </PinnedSlideFrame>
                  </div>
                </section>
              );
            })}

            {isDesktop && (
              <SlideDots
                activeSlideId={activeSlideId}
                viewportDensity={viewportDensity}
                onSelect={scrollToSlide}
              />
            )}
          </div>
        </div>

        <section
          id="pricing"
          ref={pricingSectionRef}
          className="relative overflow-hidden border-y border-slate-700/30 py-20 lg:py-24"
        >
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(155,213,255,0.08),transparent_24%),linear-gradient(180deg,#06070b_0%,#05070b_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:110px_110px] opacity-[0.04]" />
          <div className="pointer-events-none absolute right-5 top-36 z-20 hidden text-right font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.36em] text-white/35 lg:block">
            <span>{String(SLIDE_IDS.findIndex((slideId) => slideId === 'pricing') + 1).padStart(2, '0')}</span>
            <span className="mx-2 text-white/18">/</span>
            <span>{String(SLIDE_IDS.length).padStart(2, '0')}</span>
          </div>
          <div className="relative mx-auto flex w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8" style={{ minHeight: isDesktop ? `${slideCanvasHeight}px` : 'auto' }}>
            {renderSlide('pricing')}
          </div>
        </section>

        <div ref={postStackRef} className="relative" style={{ height: isDesktop ? `${postStackViewportCount * 100}vh` : 'auto' }}>
          <div className={cn(isDesktop ? "sticky top-0 h-screen overflow-hidden [perspective:1800px]" : "flex flex-col gap-24 py-16 border-b border-slate-700/30")}>
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(155,213,255,0.08),transparent_24%),linear-gradient(180deg,#06070b_0%,#05070b_100%)]" />
            <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(180deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:110px_110px] opacity-[0.04]" />

            {isDesktop && (
              <div className="pointer-events-none absolute right-5 top-36 z-30 hidden text-right font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.36em] text-white/35 lg:block">
                <span>{String(activeSlideIndex + 1).padStart(2, '0')}</span>
                <span className="mx-2 text-white/18">/</span>
                <span>{String(SLIDE_IDS.length).padStart(2, '0')}</span>
              </div>
            )}

            {POST_PRICING_SLIDE_IDS.map((slideId, index) => {
              const isActive = index === activePostSlideIndex;
              const globalIndex = SLIDE_IDS.indexOf(slideId);
              const isPast = globalIndex < activeSlideIndex;

              return (
                <section
                  key={slideId}
                  id={slideId}
                  data-slide={slideId}
                  className={cn(isDesktop ? "absolute inset-x-0 bottom-0 top-32 flex items-center px-0" : "relative w-full")}
                  style={isDesktop ? {
                    opacity: isActive ? 1 : 0,
                    transform: isActive
                      ? 'translate3d(0, 0, 0) scale(1)'
                      : `translate3d(0, ${isPast ? '-4vh' : '4vh'}, 0) scale(0.985)`,
                    pointerEvents: isActive ? 'auto' : 'none',
                    visibility: isActive ? 'visible' : 'hidden',
                    zIndex: isActive ? 30 : 10 - index,
                    transformOrigin: '50% 40%',
                    transition: prefersReducedMotion
                      ? 'none'
                      : 'opacity 600ms cubic-bezier(0.22, 1, 0.36, 1), transform 600ms cubic-bezier(0.22, 1, 0.36, 1), visibility 600ms',
                  } : undefined}
                >
                  <div
                    className={cn("mx-auto flex w-full max-w-7xl items-center px-5 sm:px-6 lg:px-8", isDesktop && "overflow-hidden")}
                    style={{ height: isDesktop ? `${slideCanvasHeight}px` : 'auto' }}
                  >
                    <PinnedSlideFrame active={isDesktop ? isActive : true} prefersReducedMotion={prefersReducedMotion}>
                      {renderSlide(slideId)}
                    </PinnedSlideFrame>
                  </div>
                </section>
              );
            })}

            {isDesktop && (
              <SlideDots
                activeSlideId={activeSlideId}
                viewportDensity={viewportDensity}
                onSelect={scrollToSlide}
              />
            )}
          </div>
        </div>
      </main>
      <style jsx global>{`
        @keyframes pinnedSlideReveal {
          0% {
            opacity: 0;
            transform: translate3d(0, 22px, 0);
            filter: brightness(0.92) saturate(0.98);
          }
          60% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: brightness(1.02) saturate(1.02);
          }
          100% {
            opacity: 1;
            transform: translate3d(0, 0, 0);
            filter: brightness(1) saturate(1);
          }
        }

        @keyframes pinnedSlideSweep {
          0% {
            opacity: 0;
            transform: translate3d(0, 42%, 0);
          }
          18% {
            opacity: 0.82;
          }
          100% {
            opacity: 0;
            transform: translate3d(0, -44%, 0);
          }
        }
      `}</style>
    </div>
  );
}

function HeroShowcase({
  density
}: {
  density: ViewportDensity;
}) {
  return (
    <div
      className={cn(
        'relative mt-10',
        density === 'tight'
          ? 'h-[28rem] w-[34rem]'
          : density === 'compact'
            ? 'h-[31rem] w-[38rem]'
            : 'h-[34rem] w-[43rem]',
      )}
    >
      <div className="absolute -top-12 right-6 z-30 font-semibold leading-[0.9] tracking-[-0.07em] text-white/90 text-[2rem] lg:text-[2.5rem]">
        Live Workspace
      </div>
      <div className="absolute -inset-x-8 bottom-8 top-8 rounded-full bg-[#9bd5ff]/10 blur-3xl" />
      <div className="absolute inset-0 rounded-[2.7rem] border border-white/10 bg-[linear-gradient(180deg,rgba(255,255,255,0.04),rgba(255,255,255,0.02))] shadow-[0_50px_140px_-58px_rgba(0,0,0,0.95)]" />

      <div className="absolute inset-[1px] overflow-hidden rounded-[2.65rem] bg-[#0a101a]">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_16%,rgba(155,213,255,0.16),transparent_24%),linear-gradient(110deg,#0a101a_0%,#0d1320_46%,#10182a_100%)]" />
        <div className="absolute inset-y-0 right-0 w-[70%] overflow-hidden">
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="auto"
            className="h-full w-full object-cover object-left-top opacity-[0.82]"
          >
            <source src="/demo_1.mp4" type="video/mp4" />
          </video>
          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(10,16,26,0.94)_0%,rgba(10,16,26,0.38)_48%,rgba(10,16,26,0.68)_100%)]" />
        </div>


        <div className="relative z-10 flex h-full flex-col justify-between p-6">
          <div className="max-w-[15rem] pt-14">
            <p className="text-[1.72rem] font-semibold leading-[1.03] tracking-[-0.05em] text-white">
              {locale === 'tr' ? 'Yaz, sıkılaştır, dışa aktar.' : 'Write, tailor, export.'}
            </p>
            <p className="mt-4 text-[14px] leading-6 text-white/58">
              {locale === 'tr'
                ? 'Editör hareket ederken nihai A4 çıktıyı aynı sahnede gör. Platform hissi burada başlar.'
                : 'See the moving editor and the final A4 output in the same scene. This is where the product feels real.'}
            </p>
          </div>

          <div className="flex items-end justify-between gap-6">
            <div className="grid gap-3">
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-white/42">ATS</p>
                <p className="mt-2 text-[1.9rem] font-semibold tracking-[-0.05em] text-white">93 / 100</p>
              </div>
              <div className="rounded-[1.3rem] border border-white/10 bg-white/[0.04] px-4 py-3 backdrop-blur">
                <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.18em] text-white/42">
                  {locale === 'tr' ? 'çıktı' : 'output'}
                </p>
                <p className="mt-2 text-sm leading-6 text-white/68">
                  {locale === 'tr' ? 'Recruiter-safe A4 ve export hazır PDF akışı.' : 'Recruiter-safe A4 and export-ready PDF flow.'}
                </p>
              </div>
            </div>

            <div className="relative mr-1">
              <div className="absolute -left-24 top-8 z-20 rounded-[1.2rem] border border-white/10 bg-[#07101c]/92 px-4 py-3 shadow-[0_25px_55px_-32px_rgba(0,0,0,0.9)] backdrop-blur">
                <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/40">
                  {locale === 'tr' ? 'anahtar eşleşme' : 'keyword match'}
                </p>
                <p className="mt-2 text-[1.35rem] font-semibold tracking-[-0.05em] text-white">8 / 8</p>
              </div>
              <ResumePagePreview
                scale={density === 'tight' ? 0.31 : density === 'compact' ? 0.35 : 0.40}
                className="translate-x-2 translate-y-4 rotate-[6deg] rounded-[1.1rem] border border-white/80 shadow-[0_60px_140px_-62px_rgba(0,0,0,1)]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function RotatingHeroLine({
  words,
  activeIndex,
  prefersReducedMotion,
  className,
}: {
  words: string[];
  activeIndex: number;
  prefersReducedMotion: boolean;
  className?: string;
}) {
  const [displayIndex, setDisplayIndex] = useState(activeIndex);
  const [isSnapping, setIsSnapping] = useState(false);
  const prevActiveRef = useRef(activeIndex);
  
  const normalizedWords = words.length ? [...words, words[0]] : [''];
  const itemHeight = '0.96em';

  useEffect(() => {
    if (activeIndex === prevActiveRef.current) return;
    
    if (activeIndex === 0 && prevActiveRef.current === words.length - 1) {
      setDisplayIndex(words.length);
      
      const timeout = setTimeout(() => {
        setIsSnapping(true);
        setDisplayIndex(0);
        
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            setIsSnapping(false);
          });
        });
      }, 560);

      prevActiveRef.current = activeIndex;
      return () => clearTimeout(timeout);
    }
    
    setDisplayIndex(activeIndex);
    prevActiveRef.current = activeIndex;
  }, [activeIndex, words.length]);

  const useSnap = isSnapping || prefersReducedMotion;

  return (
    <span className={cn('relative block overflow-hidden align-top leading-none', className)} style={{ height: itemHeight }}>
      <span
        className="block will-change-transform"
        style={{
          transform: `translate3d(0, calc(-${displayIndex} * ${itemHeight}), 0)`,
          transition: useSnap ? 'none' : 'transform 560ms cubic-bezier(0.22,1,0.36,1)',
        }}
      >
        {normalizedWords.map((word, i) => (
          <span
            key={`${word}-${i}`}
            className="flex w-full items-center whitespace-nowrap"
            style={{ height: itemHeight }}
          >
            {word}
          </span>
        ))}
      </span>
    </span>
  );
}

function ResumePagePreview({
  scale,
  className,
}: {
  scale: number;
  className?: string;
}) {
  if (!HOME_PREVIEW_CV) {
    return null;
  }

  return (
    <div
      className={cn('relative overflow-hidden bg-white', className)}
      style={{
        width: `${CV_PAGE_WIDTH_PX * scale}px`,
        height: `${CV_PAGE_HEIGHT_PX * scale}px`,
      }}
    >
      <div
        className="absolute left-0 top-0 origin-top-left bg-white"
        style={{
          width: `${CV_PAGE_WIDTH_PX}px`,
          height: `${CV_PAGE_HEIGHT_PX}px`,
          transform: `scale(${scale})`,
        }}
      >
        <CVTemplate previewMode cv={HOME_PREVIEW_CV} />
      </div>
    </div>
  );
}

function ProofSection({
  proof,
  density
}: {
  proof: HomeCinematicExperienceProps['proof'];
  density: ViewportDensity;
}) {
  return (
    <div className="relative flex w-full flex-col justify-center">
      <div className="max-w-4xl">
        <InlineLabel>{proof.label}</InlineLabel>
        <h2
          className={cn(
            'mt-5 max-w-4xl font-semibold leading-[0.95] tracking-[-0.06em] text-white',
            density === 'tight'
              ? 'text-[clamp(1.7rem,3.4vw,2.8rem)]'
              : density === 'compact'
                ? 'text-[clamp(1.9rem,3.8vw,3.2rem)]'
                : 'text-[clamp(2.1rem,4.2vw,3.9rem)]',
          )}
        >
          {proof.title}
        </h2>
        <p
          className={cn(
            'mt-5 max-w-2xl text-white/62',
            density === 'tight'
              ? 'max-w-[34rem] text-[13px] leading-6'
              : density === 'compact'
                ? 'max-w-[35rem] text-[14px] leading-6'
                : 'max-w-[36rem] text-[15px] leading-7 sm:text-base sm:leading-7',
          )}
        >
          {proof.description}
        </p>
      </div>
      <div className="relative mt-10 md:mt-12 lg:mt-16">
        <div className="relative mx-auto w-full max-w-[620px]">
          <div className="mx-auto w-fit">
            <ResumePagePreview
              scale={density === 'tight' ? 0.65 : density === 'compact' ? 0.72 : 0.78}
              className="border border-slate-200/90 bg-white shadow-[0_45px_110px_-55px_rgba(0,0,0,0.95)]"
            />
          </div>

          {/* Left Column (Desktop) */}
          <div className="absolute -left-48 top-6 z-20 hidden w-[17rem] flex-col gap-5 lg:flex">
            <ProofFindingCard findings={proof.findings} />
            <ProofBulletRewriteCard />
          </div>

          {/* Right Column (Desktop) */}
          <div className="absolute -right-48 top-6 z-20 hidden w-[17rem] flex-col gap-5 lg:flex">
            <ProofScoreCard proof={proof} />
            <ProofAIWriterCard />
          </div>
        </div>

        {/* Mobile/Tablet Card Stack */}
        <div className="mt-8 grid gap-4 md:grid-cols-2 lg:hidden">
          <ProofFindingCard findings={proof.findings} />
          <ProofScoreCard proof={proof} />
          <ProofBulletRewriteCard />
          <ProofAIWriterCard />
        </div>
      </div>
    </div>
  );
}

function ProofBulletRewriteCard({}: {}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131a]/92 p-5 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)] backdrop-blur">
      <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/40">
        {locale === 'tr' ? 'madde yeniden yazımı' : 'bullet rewrite'}
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.15em] text-rose-400/80 font-semibold">
            {locale === 'tr' ? 'ÖNCE' : 'BEFORE'}
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-white/54">
            {locale === 'tr'
              ? 'AWS EC2 üzerinde Docker ile bir Spring Boot uygulaması geliştirildi.'
              : 'Developed a Spring Boot app with Docker on AWS EC2.'}
          </p>
        </div>
        <div className="h-px w-full bg-white/8" />
        <div>
          <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.15em] text-[#9bd5ff] font-semibold">
            {locale === 'tr' ? 'SONRA' : 'AFTER'}
          </p>
          <p className="mt-1.5 text-[12px] leading-5 text-white/80 font-medium">
            {locale === 'tr'
              ? 'Spring Boot servislerini AWS EC2 üzerinde konteynerleştirerek canlıya alım süresini %40 kısalttı; güncellemeleri 30+ paydaşa günler yerine saatler içinde ulaştırdı.'
              : 'Cut deployment overhead 40% by containerizing Spring Boot services on AWS EC2, shipping releases to 30+ stakeholders in hours, not days.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProofAIWriterCard({}: {}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131a]/92 p-5 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)] backdrop-blur">
      <p className="font-[family:var(--font-geist-mono)] text-[10px] uppercase tracking-[0.2em] text-white/40">
        {locale === 'tr' ? 'yapay zeka içerik yazarı' : 'ai content writer'}
      </p>
      <h3 className="mt-3 text-[1.125rem] font-semibold tracking-[-0.04em] leading-snug text-white">
        {locale === 'tr' ? 'Herhangi bir rol için madde işaretlerini yeniden yaz.' : 'Rewrite any bullet for any role.'}
      </h3>
      <p className="mt-2 text-[12px] leading-5 text-white/54">
        {locale === 'tr' ? 'Sayısal sonuçlu, recruiter onaylı, saniyeler içinde.' : 'Quantified, recruiter-tested, in seconds.'}
      </p>
      <button
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-1.5 rounded-full bg-gradient-to-r from-pink-500 to-rose-400 px-4 py-2 text-xs font-semibold text-slate-950 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <span>{locale === 'tr' ? 'Madde oluştur' : 'Generate bullet'}</span>
        <ArrowRight className="h-3 w-3" />
      </button>
    </div>
  );
}

function WorkflowSlide({ workflow, density }: { workflow: HomeCinematicExperienceProps['workflow']; density: ViewportDensity }) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className={cn('grid w-full xl:grid-cols-[0.78fr_1.22fr]', density === 'tight' ? 'gap-6' : 'gap-8')}>
        <div className="max-w-xl">
          <InlineLabel>{workflow.label}</InlineLabel>
          <h2
            className={cn(
              'mt-5 font-semibold leading-[0.96] tracking-[-0.06em] text-white',
              density === 'tight'
                ? 'text-[clamp(1.7rem,3.6vw,2.9rem)]'
                : density === 'compact'
                  ? 'text-[clamp(1.9rem,3.9vw,3.25rem)]'
                  : 'text-[clamp(2.1rem,4.2vw,3.85rem)]',
            )}
          >
            {workflow.title}
          </h2>
          <p
            className={cn(
              'mt-5 max-w-lg text-white/62',
              density === 'tight'
                ? 'text-[13px] leading-6'
                : density === 'compact'
                  ? 'text-[14px] leading-6'
                  : 'text-[15px] leading-7 sm:text-base sm:leading-7',
            )}
          >
            {workflow.description}
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-3">
          {workflow.steps.map((step) => (
            <div
              key={step.number}
              className={cn(
                'flex flex-col rounded-xl border border-white/10 bg-white/[0.03] shadow-[0_24px_90px_-46px_rgba(0,0,0,0.85)]',
                density === 'tight' ? 'min-h-[16.5rem] p-3.5' : density === 'compact' ? 'min-h-[17.8rem] p-4' : 'min-h-[19rem] p-[1.125rem]',
              )}
            >
              <div className="flex items-start justify-end gap-4">
                <span className="font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.28em] text-white/35">{step.number}</span>
              </div>
              <h3
                className={cn(
                  'font-semibold tracking-[-0.05em] text-white',
                  density === 'tight'
                    ? 'mt-5 text-[1.4rem] leading-[1.05]'
                    : density === 'compact'
                      ? 'mt-5 text-[1.52rem] leading-[1.05]'
                      : 'mt-5 text-[1.65rem] leading-[1.06]',
                )}
              >
                {step.title}
              </h3>
              <p className={cn('mt-3 text-white/58', density === 'tight' ? 'text-[13px] leading-6' : 'text-sm leading-6')}>{step.description}</p>
              <div className={cn('mt-auto', density === 'tight' ? 'pt-5' : 'pt-6')}>
                <div className="h-px w-full bg-white/10" />
                <p className="mt-3 font-[family:var(--font-geist-mono)] text-[11px] uppercase tracking-[0.26em] text-[#9bd5ff]">
                  {step.label}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuoteSlide({
  quote,
  density,
  activeQuoteIndex,
}: {
  quote: HomeCinematicExperienceProps['quote'];
  density: ViewportDensity;
  activeQuoteIndex: number;
}) {
  const activeEntry = quote.entries[activeQuoteIndex] ?? quote.entries[0];

  return (
    <div className="flex h-full w-full items-center justify-center overflow-hidden">
      <div className={cn('mx-auto text-center', density === 'tight' ? 'max-w-3xl' : 'max-w-4xl')}>
        <InlineLabel>{quote.label}</InlineLabel>
        <p
          className={cn(
            "mt-8 font-['Iowan_Old_Style','Palatino_Linotype','Book_Antiqua',Georgia,serif] leading-[1.08] tracking-[-0.04em] text-white",
            density === 'tight'
              ? 'text-[clamp(1.45rem,3.2vw,2.45rem)]'
              : density === 'compact'
                ? 'text-[clamp(1.65rem,3.5vw,3rem)]'
                : 'text-[clamp(1.85rem,4vw,3.95rem)]',
          )}
        >
          <span className="text-[#9bd5ff]">“</span>
          {activeEntry.text}
          <span className="text-[#9bd5ff]">”</span>
        </p>
        <p className={cn('font-medium text-white/88', density === 'tight' ? 'mt-6 text-sm' : 'mt-8 text-base')}>{activeEntry.author}</p>
        <p className="mt-2 text-sm text-white/42">{activeEntry.role}</p>

        <div className={cn('flex justify-center', density === 'tight' ? 'mt-6' : 'mt-8')}>
          <div className="flex items-center">
            {quote.entries.map((entry, index) => (
              <div
                key={entry.author}
                className={cn(
                  'flex items-center justify-center rounded-xl border text-xs font-semibold shadow-[0_20px_40px_-28px_rgba(0,0,0,0.8)] transition-colors duration-300 overflow-hidden',
                  density === 'tight' ? 'h-10 w-10' : 'h-12 w-12',
                  index === activeQuoteIndex
                    ? 'border-[#9bd5ff]/40 bg-[#9bd5ff]/14 text-[#d8efff]'
                    : 'border-white/10 bg-white/[0.04] text-white/82',
                  index > 0 && '-ml-3',
                )}
              >
                {/* @ts-ignore */}
                {entry.avatar ? (
                  <Image src={(entry as any).avatar} alt={entry.author} width={48} height={48} className="object-cover h-full w-full" />
                ) : (
                  entry.initials
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 flex items-center justify-center gap-3">
          {quote.entries.map((entry, index) => (
            <div key={entry.initials} className="flex items-center gap-3">
              <span className={cn('h-px rounded-full transition-all duration-300', index === activeQuoteIndex ? 'w-10 bg-[#9bd5ff]' : 'w-6 bg-white/16')} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function StatsSlide({ stats, density }: { stats: HomeCinematicExperienceProps['stats']; density: ViewportDensity }) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className="w-full">
        <InlineLabel>{stats.label}</InlineLabel>
        <p
          className={cn(
            'text-center text-white/45',
            density === 'tight'
              ? 'mt-6 text-[12px] font-medium uppercase tracking-[0.16em]'
              : density === 'compact'
                ? 'mt-7 text-[13px] font-medium uppercase tracking-[0.18em]'
                : 'mt-8 text-[13px] font-medium uppercase tracking-[0.2em]',
          )}
        >
          {stats.companyLabel}
        </p>

        <div className={cn('grid md:grid-cols-2 xl:grid-cols-3', density === 'tight' ? 'mt-5 gap-3' : 'mt-6 gap-3.5')}>
          {stats.badges.map((badge, index) => (
            <div
              key={badge.label}
              className={cn(
                'relative overflow-hidden rounded-2xl border shadow-[0_24px_90px_-46px_rgba(0,0,0,0.85)]',
                density === 'tight' ? 'min-h-[6.25rem] p-4' : 'min-h-[6.9rem] p-[1.125rem]',
                index % 3 === 1
                  ? 'border-[#9bd5ff]/30 bg-[linear-gradient(180deg,rgba(155,213,255,0.1),rgba(255,255,255,0.03))]'
                  : 'border-white/10 bg-white/[0.035]',
              )}
            >
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_center,rgba(155,213,255,0.08),transparent_60%)]" />
              <div className="relative flex h-full flex-col items-center justify-center text-center">
                <div className="absolute top-1 right-1">
                  <span className={cn('block h-1.5 w-1.5 rounded-full', index % 3 === 1 ? ACCENT_BG_CLASS : 'bg-white/20')} />
                </div>
                <p className={cn('font-semibold tracking-tight text-white', density === 'tight' ? 'text-xl' : 'text-[1.4rem]')}>
                  {badge.label}
                </p>
                <p className={cn('mt-3 max-w-[16rem] text-white/50', density === 'tight' ? 'text-[13px] leading-relaxed' : 'text-[14px] leading-relaxed')}>
                  {badge.detail}
                </p>
              </div>
            </div>
          ))}
        </div>

        <div className={cn('grid gap-6 border-t border-white/8 lg:grid-cols-3', density === 'tight' ? 'mt-7 pt-6' : density === 'compact' ? 'mt-8 pt-7' : 'mt-9 pt-8')}>
          {stats.values.map((item) => (
            <div key={item.label} className="text-center">
              <p
                className={cn(
                  'font-semibold tracking-[-0.08em] text-white',
                  density === 'tight'
                    ? 'text-[clamp(2rem,4.1vw,3.2rem)]'
                    : density === 'compact'
                      ? 'text-[clamp(2.25rem,4.5vw,3.7rem)]'
                      : 'text-[clamp(2.45rem,5vw,4.2rem)]',
                )}
              >
                {item.value}
              </p>
              <p className="mt-2 font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.28em] text-white/36">
                {item.label}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PricingSlide({
  pricing,
  density,
  isAuthenticated
}: {
  pricing: HomeCinematicExperienceProps['pricing'];
  density: ViewportDensity;
  isAuthenticated: boolean;
}) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className="w-full">
        <div className="max-w-4xl">
          <InlineLabel>{pricing.label}</InlineLabel>
          <h2
            className={cn(
              'mt-5 font-semibold leading-[0.97] tracking-[-0.06em] text-white',
              density === 'tight'
                ? 'text-[clamp(1.7rem,3.6vw,2.8rem)]'
                : density === 'compact'
                  ? 'text-[clamp(1.9rem,3.9vw,3.25rem)]'
                  : 'text-[clamp(2.1rem,4.2vw,3.9rem)]',
            )}
          >
            {pricing.title}
          </h2>
          <p
            className={cn(
              'mt-5 max-w-2xl text-white/62',
              density === 'tight'
                ? 'text-[13px] leading-6'
                : density === 'compact'
                  ? 'text-[14px] leading-6'
                  : 'text-[15px] leading-7 sm:text-base sm:leading-7',
            )}
          >
            {pricing.description}
          </p>
        </div>

        <div className={cn('grid xl:grid-cols-3', density === 'tight' ? 'mt-5 gap-3' : density === 'compact' ? 'mt-6 gap-3.5' : 'mt-7 gap-4')}>
          {pricing.packages.map((pkg) => (
            <div
              key={pkg.id}
              className={cn(
                'flex flex-col rounded-2xl border shadow-[0_24px_90px_-46px_rgba(0,0,0,0.88)]',
                density === 'tight'
                  ? 'min-h-[18.2rem] p-3.5'
                  : density === 'compact'
                    ? 'min-h-[20rem] p-4'
                    : 'min-h-[22rem] p-[1.125rem]',
                pkg.isPopular
                  ? 'border-[#9bd5ff]/50 bg-[linear-gradient(180deg,rgba(155,213,255,0.1),rgba(255,255,255,0.03))]'
                  : 'border-white/10 bg-white/[0.03]',
              )}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.28em] text-white/35">
                    {pkg.isPopular
                      ? locale === 'tr'
                        ? 'en dengeli'
                        : 'most balanced'
                      : locale === 'tr'
                        ? 'kredi paketi'
                        : 'credit pack'}
                  </p>
                  <h3
                    className={cn(
                      'mt-4 font-semibold tracking-[-0.05em] text-white',
                      density === 'tight'
                        ? 'text-[1.55rem]'
                        : density === 'compact'
                          ? 'text-[1.7rem]'
                          : 'text-[1.85rem]',
                    )}
                  >
                    {pkg.name}
                  </h3>
                  <p className={cn('mt-2 text-white/56', density === 'tight' ? 'text-[13px] leading-6' : 'text-sm leading-6')}>{pkg.description}</p>
                </div>
                {pkg.isPopular ? (
                  <span className="font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.28em] text-[#9bd5ff]">
                    {locale === 'tr' ? 'öne çıkan' : 'featured'}
                  </span>
                ) : null}
              </div>

              <div
                className={cn(
                  'font-semibold tracking-[-0.08em] text-white',
                  density === 'tight'
                    ? 'mt-5 text-[2.15rem]'
                    : density === 'compact'
                      ? 'mt-6 text-[2.35rem]'
                      : 'mt-6 text-[2.55rem]',
                )}
              >
                {pkg.displayPrice}
              </div>

              <div className="mt-5 flex-1 pr-1">
                <ul className={cn(density === 'tight' ? 'space-y-2.5' : 'space-y-3')}>
                  {pkg.features.map((feature) => (
                    <li key={feature} className={cn('flex items-start gap-3 text-white/64', density === 'tight' ? 'text-[13px] leading-6' : 'text-sm leading-6')}>
                      <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#9bd5ff]" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {isAuthenticated && pkg.code ? (
                <CheckoutButton
                  packageCode={pkg.code}
                  disabled={!pkg.isConfigured}
                  className={cn(
                    'mt-5 w-full rounded-full text-sm font-semibold',
                    density === 'tight' ? 'h-10' : 'h-11',
                    pkg.isPopular
                      ? 'bg-[#9bd5ff] text-slate-950 shadow-[0_20px_60px_-32px_rgba(155,213,255,0.85)] hover:bg-[#b5e2ff]'
                      : 'border border-white/12 bg-transparent text-white hover:bg-white/[0.05]',
                  )}
                  label={pkg.isConfigured ? (locale === 'tr' ? 'Shopier ile Satın Al' : 'Buy with Shopier') : (locale === 'tr' ? 'Yapılandırılmadı' : 'Not Configured')}
                  theme="dark"
                />
              ) : (
                <Button
                  asChild
                  className={cn(
                    'mt-5 rounded-full text-sm font-semibold',
                    density === 'tight' ? 'h-10' : 'h-11',
                    pkg.isPopular
                      ? 'bg-[#9bd5ff] text-slate-950 shadow-[0_20px_60px_-32px_rgba(155,213,255,0.85)] hover:bg-[#b5e2ff]'
                      : 'border border-white/12 bg-transparent text-white hover:bg-white/[0.05]',
                  )}
                >
                  <Link href={pkg.href}>
                    {pkg.ctaLabel}
                    <ChevronRight className="h-5 w-5" />
                  </Link>
                </Button>
              )}
            </div>
          ))}
        </div>

        <div
          className={cn(
            'flex flex-col gap-3 border-t border-white/8 text-xs text-white/50 sm:text-sm lg:flex-row lg:items-center lg:justify-between',
            density === 'tight' ? 'mt-4 pt-4' : 'mt-5 pt-4',
          )}
        >
          <span>{pricing.summary}</span>
          <span>{pricing.footnote}</span>
        </div>
      </div>
    </div>
  );
}

function FaqSlide({
  faq,
  openFaqIndex,
  onOpenFaq,
  density,
}: {
  faq: HomeCinematicExperienceProps['faq'];
  openFaqIndex: number;
  onOpenFaq: (index: number) => void;
  density: ViewportDensity;
}) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className={cn('grid w-full lg:grid-cols-[0.62fr_1.38fr]', density === 'tight' ? 'gap-6' : 'gap-8')}>
        <div className="max-w-md">
          <InlineLabel>{faq.label}</InlineLabel>
          <h2
            className={cn(
              'mt-5 font-semibold leading-[0.98] tracking-[-0.06em] text-white',
              density === 'tight'
                ? 'text-[clamp(1.65rem,3.5vw,2.65rem)]'
                : density === 'compact'
                  ? 'text-[clamp(1.85rem,3.8vw,3.05rem)]'
                  : 'text-[clamp(2rem,4vw,3.55rem)]',
            )}
          >
            {faq.title}
          </h2>
        </div>

        <div className={cn('overflow-y-auto pr-2 sm:pr-4', density === 'tight' ? 'max-h-[48vh]' : density === 'compact' ? 'max-h-[50vh]' : 'max-h-[52vh]')}>
          {faq.items.map((item, index) => {
            const isOpen = index === openFaqIndex;
            return (
              <div key={item.question} className={cn('border-b border-white/10', density === 'tight' ? 'py-4' : 'py-5')}>
                <button
                  type="button"
                  onClick={() => onOpenFaq(isOpen ? -1 : index)}
                  className="flex w-full items-start justify-between gap-6 text-left"
                  aria-expanded={isOpen}
                >
                  <span
                    className={cn(
                      'max-w-4xl font-semibold leading-[1.15] tracking-[-0.04em] text-white',
                      density === 'tight'
                        ? 'text-[1.15rem] sm:text-[1.3rem]'
                        : density === 'compact'
                          ? 'text-[1.25rem] sm:text-[1.45rem]'
                          : 'text-[1.35rem] sm:text-[1.65rem]',
                    )}
                  >
                    {item.question}
                  </span>
                  <span className={cn('pt-2 font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.3em]', isOpen ? 'text-[#9bd5ff]' : 'text-white/30')}>
                    {isOpen ? faq.closeLabel : faq.openLabel}
                  </span>
                </button>
                {isOpen ? <p className={cn('mt-4 max-w-4xl text-white/62', density === 'tight' ? 'text-[13px] leading-6' : 'text-sm leading-6 sm:text-[15px]')}>{item.answer}</p> : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ProofFindingCard({
  findings
}: {
  findings: HomeCinematicExperienceProps['proof']['findings'];
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-4 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)]">
      <p className="font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.28em] text-white/28">
        {locale === 'tr' ? 'bulduklarımız' : 'what we found'}
      </p>
      <div className="mt-5 space-y-5">
        {findings.map((item, index) => (
          <div key={item.title}>
            <h3 className="text-[1.15rem] font-semibold tracking-[-0.04em] text-white">{item.title}</h3>
            <p className="mt-2.5 text-[13px] leading-6 text-white/54">{item.body}</p>
            {index < findings.length - 1 ? <div className="mt-4 h-px w-full bg-white/8" /> : null}
          </div>
        ))}
      </div>
    </div>
  );
}

function ProofScoreCard({ proof }: { proof: HomeCinematicExperienceProps['proof'] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-[#12131a] p-4 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)]">
      <div className="flex justify-center">
        <div className="relative flex h-24 w-24 items-center justify-center rounded-full border-[5px] border-[#9bd5ff]">
          <div className="text-center">
            <p className="text-[1.7rem] font-semibold tracking-[-0.05em] text-white">93</p>
            <p className="mt-1 text-sm text-white/35">/ 100</p>
          </div>
        </div>
      </div>
      <p className="mt-4 text-center font-[family:var(--font-geist-mono)] text-xs uppercase tracking-[0.3em] text-[#9bd5ff]">
        {proof.scoreLabel}
      </p>
      <div className="mt-5 space-y-3.5 border-t border-white/8 pt-4">
        {proof.metrics.map((metric) => (
          <div key={metric.label}>
            <div className="flex items-center justify-between text-xs text-white/62 sm:text-sm">
              <span>{metric.label}</span>
              <span>
                {metric.score}/{metric.total}
              </span>
            </div>
            <div className="mt-3 h-1.5 rounded-full bg-white/8">
              <div className="h-full rounded-full bg-[#9bd5ff]" style={{ width: `${(metric.score / metric.total) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function WorkflowIcon({ icon, className }: { icon: WorkflowStep['icon']; className?: string }) {
  if (icon === 'tailor') {
    return <Target className={cn('h-6 w-6', className)} />;
  }
  if (icon === 'deliver') {
    return <Zap className={cn('h-6 w-6', className)} />;
  }
  return <FileText className={cn('h-6 w-6', className)} />;
}

function PinnedSlideFrame({
  active,
  prefersReducedMotion,
  children,
}: {
  active: boolean;
  prefersReducedMotion: boolean;
  children: React.ReactNode;
}) {
  const shouldAnimate = active && !prefersReducedMotion;

  return (
    <div className="relative w-full overflow-visible">
      <div
        className="relative z-20 w-full"
        style={shouldAnimate ? { animation: 'pinnedSlideReveal 300ms cubic-bezier(0.22,1,0.36,1) both' } : undefined}
      >
        {children}
      </div>
      {shouldAnimate ? (
        <div
          className="pointer-events-none absolute inset-x-[10%] inset-y-[16%] z-30 overflow-hidden rounded-[2rem]"
          aria-hidden="true"
        >
          <div
            className="absolute inset-x-0 bottom-0 h-[34%] bg-[linear-gradient(180deg,rgba(155,213,255,0)_0%,rgba(155,213,255,0.12)_40%,rgba(255,255,255,0.07)_58%,rgba(155,213,255,0)_100%)] mix-blend-screen blur-2xl"
            style={{ animation: 'pinnedSlideSweep 360ms cubic-bezier(0.22,1,0.36,1) both' }}
          />
        </div>
      ) : null}
    </div>
  );
}

function SlideDots({
  activeSlideId,
  viewportDensity,
  onSelect,
}: {
  activeSlideId: (typeof SLIDE_IDS)[number];
  viewportDensity: ViewportDensity;
  onSelect: (id: (typeof SLIDE_IDS)[number]) => void;
}) {
  const activeIndex = Math.max(0, SLIDE_IDS.findIndex((slideId) => slideId === activeSlideId));

  return (
    <div className={cn('absolute left-1/2 z-30 flex -translate-x-1/2 items-center gap-3', viewportDensity === 'tight' ? 'bottom-5' : 'bottom-8')}>
      {SLIDE_IDS.map((slideId, index) => (
        <button
          key={slideId}
          type="button"
          onClick={() => onSelect(slideId)}
          className="group flex items-center gap-2"
          aria-label={`Go to ${slideId}`}
        >
          <span
            className={cn(
              'h-px rounded-full transition-all duration-300',
              index === activeIndex ? 'w-10 bg-[#9bd5ff]' : 'w-6 bg-white/20 group-hover:bg-white/40',
            )}
          />
        </button>
      ))}
    </div>
  );
}

function InlineLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="inline-flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#9bd5ff]/80">
      <span className={cn('h-1.5 w-1.5 rounded-full', ACCENT_BG_CLASS)} />
      <span>{children}</span>
    </div>
  );
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max);
}

function resolveHeldSlideIndex(progress: number, count: number) {
  if (count <= 1) return 0;

  const currentIndex = Math.floor(progress);
  if (currentIndex >= count - 1) return count - 1;

  const localProgress = progress - currentIndex;
  return localProgress < PINNED_SLIDE_HOLD_RATIO ? currentIndex : currentIndex + 1;
}

function TailorSlide({
  density
}: {
  density: ViewportDensity;
}) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className={cn('grid w-full items-center xl:grid-cols-[0.78fr_1.22fr]', density === 'tight' ? 'gap-6' : 'gap-8')}>
        <div className="max-w-xl">
          <InlineLabel>TAILOR</InlineLabel>
          <h2
            className={cn(
              'mt-5 font-semibold leading-[0.96] tracking-[-0.06em] text-white',
              density === 'tight'
                ? 'text-[clamp(1.9rem,4vw,3.2rem)]'
                : density === 'compact'
                  ? 'text-[clamp(2.1rem,4.5vw,3.6rem)]'
                  : 'text-[clamp(2.4rem,5vw,4.4rem)]',
            )}
          >
            Tailor for the role
          </h2>
          <p
            className={cn(
              'mt-6 max-w-lg text-white/62',
              density === 'tight'
                ? 'text-[14px] leading-relaxed'
                : density === 'compact'
                  ? 'text-[15px] leading-relaxed'
                  : 'text-[17px] leading-relaxed sm:text-[18px]',
            )}
          >
            Keep one strong base and tailor it in minutes. Generate role-specific cover letters and adjust your bullets to match the job description.
          </p>
        </div>

        <div className="relative flex h-full w-full items-center justify-center xl:min-h-[600px] mt-10 xl:mt-0 px-4 sm:px-0">
          <div className={cn(
            "w-full max-w-[34rem] xl:max-w-[38rem] mx-auto rounded-2xl border border-white/10 bg-[#0A0D14]/90 backdrop-blur-xl shadow-2xl overflow-hidden flex flex-col",
            density === 'tight' ? 'scale-90' : density === 'compact' ? 'scale-95' : 'scale-100'
          )}>
            <div className="flex items-center gap-2.5 px-6 py-4 border-b border-white/5 bg-white/[0.02]">
              <div className="flex gap-2">
                <div className="w-3 h-3 rounded-full bg-[#FF5F56] border border-[#FF5F56]/20" />
                <div className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-[#FFBD2E]/20" />
                <div className="w-3 h-3 rounded-full bg-[#27C93F] border border-[#27C93F]/20" />
              </div>
              <div className="mx-auto font-[family:var(--font-geist-mono)] text-[12px] sm:text-[13px] text-white/40 uppercase tracking-[0.2em] translate-x-[-20px]">
                {locale === 'tr' ? 'Yapay Zeka Çalışma Alanı' : 'AI Workspace'}
              </div>
            </div>
            
            <div className="p-6 sm:p-8 flex flex-col gap-6 sm:gap-8">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Briefcase className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <span className="text-[13px] sm:text-[14px] font-medium text-white/60 uppercase tracking-wider">{locale === 'tr' ? 'İş Tanımı: Ürün Müdürü' : 'Job Description: Product Manager'}</span>
                </div>
                <div className="rounded-xl bg-white/[0.03] border border-white/5 p-6 text-[15px] sm:text-[17px] leading-[1.65] text-white/60">
                  {locale === 'tr' ? (
                    <>
                      Ekibimize katılacak, <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Süreç Optimizasyonu</span> konusunda uzman ve <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Çapraz Fonksiyonel</span> ekipleri yönetecek bir lider arıyoruz. <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Veri Analizi</span> zorunludur.
                    </>
                  ) : (
                    <>
                      Looking for a leader with strong skills in <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Process Optimization</span> and a proven track record in <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Cross-functional</span> team alignment. Experience with <span className="text-[#9bd5ff] bg-[#9bd5ff]/10 px-1.5 py-0.5 rounded-md font-medium text-white/80">Data Analysis</span> is required.
                    </>
                  )}
                </div>
              </div>

              <div className="flex justify-center -my-4 relative z-10">
                <button className="flex items-center gap-2 px-8 py-3 rounded-full bg-gradient-to-r from-pink-500/20 to-rose-400/20 border border-pink-500/30 text-pink-300 text-[15px] font-semibold backdrop-blur-md shadow-[0_0_20px_rgba(236,72,153,0.15)]">
                  <Sparkles className="w-5 h-5" />
                  {locale === 'tr' ? 'Otomatik Uyarla' : 'Auto-Tailor'}
                </button>
              </div>

              <div>
                <div className="flex items-center gap-2 mb-3">
                  <FileText className="w-4 h-4 sm:w-5 sm:h-5 text-white/40" />
                  <span className="text-[13px] sm:text-[14px] font-medium text-white/60 uppercase tracking-wider">{locale === 'tr' ? 'Senin CV\'n' : 'Your Resume'}</span>
                </div>
                <div className="rounded-xl bg-gradient-to-b from-[#161b22] to-[#0A0D14] border border-white/10 p-6 text-[15px] sm:text-[17px] leading-[1.65] text-white/90 shadow-inner">
                  <div className="flex items-start gap-3">
                    <span className="text-pink-400/80 mt-1">•</span>
                    <span>
                      {locale === 'tr' ? (
                        <>
                          <span className="text-white font-medium">Süreç Optimizasyonu</span> girişimlerini yöneterek %40 verimlilik artışı sağladı; <span className="text-white font-medium">Çapraz Fonksiyonel</span> ekipleri hizaladı ve <span className="text-white font-medium">Veri Analizi</span> ile kararları destekledi.
                        </>
                      ) : (
                        <>
                          Led <span className="text-white font-medium">Process Optimization</span> initiatives driving 40% efficiency gains through <span className="text-white font-medium">Cross-functional</span> alignment and rigorous <span className="text-white font-medium">Data Analysis</span>.
                        </>
                      )}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DiscoverSlide({
  density
}: {
  density: ViewportDensity;
}) {
  return (
    <div className="flex h-full w-full items-center overflow-hidden">
      <div className={cn('grid w-full items-center xl:grid-cols-[0.78fr_1.22fr]', density === 'tight' ? 'gap-6' : 'gap-8')}>
        <div className="max-w-xl">
          <InlineLabel>DISCOVER</InlineLabel>
          <h2
            className={cn(
              'mt-5 font-semibold leading-[0.96] tracking-[-0.06em] text-white',
              density === 'tight'
                ? 'text-[clamp(1.9rem,4vw,3.2rem)]'
                : density === 'compact'
                  ? 'text-[clamp(2.1rem,4.5vw,3.6rem)]'
                  : 'text-[clamp(2.4rem,5vw,4.4rem)]',
            )}
          >
            See what recruiters see
          </h2>
          <p
            className={cn(
              'mt-6 max-w-lg text-white/62',
              density === 'tight'
                ? 'text-[14px] leading-relaxed'
                : density === 'compact'
                  ? 'text-[15px] leading-relaxed'
                  : 'text-[17px] leading-relaxed sm:text-[18px]',
            )}
          >
            Discover how ATS parses your CV. Identify missing keywords, fix structural issues, and ensure your application passes the first screen.
          </p>
        </div>

        <div className="relative flex h-full w-full items-center justify-center xl:min-h-[600px] mt-10 xl:mt-0 px-4 sm:px-0">
          <div className={cn(
            "w-full max-w-[34rem] xl:max-w-[38rem] mx-auto flex flex-col gap-5 sm:gap-6",
            density === 'tight' ? 'scale-90' : density === 'compact' ? 'scale-95' : 'scale-100'
          )}>
            {/* Top Dashboard Card */}
            <div className="flex items-center gap-6 sm:gap-8 rounded-2xl border border-white/10 bg-[#0c121e]/90 p-6 sm:p-8 shadow-[0_30px_90px_-46px_rgba(0,0,0,0.9)] backdrop-blur-xl">
              <div className="relative flex shrink-0 items-center justify-center w-24 h-24 sm:w-28 sm:h-28 rounded-full border-[6px] sm:border-[8px] border-[#27C93F]/20">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="50%" cy="50%" r="42%" stroke="currentColor" strokeWidth="12%" fill="none" className="text-[#27C93F]" strokeDasharray="264" strokeDashoffset="31.6" strokeLinecap="round" />
                </svg>
                <div className="flex flex-col items-center">
                  <span className="text-2xl sm:text-3xl font-bold text-white tracking-tight">88<span className="text-sm sm:text-base text-white/50">%</span></span>
                  <span className="font-[family:var(--font-geist-mono)] text-[9px] sm:text-[10px] uppercase tracking-widest text-white/40 mt-0.5">{locale === 'tr' ? 'EŞLEŞME' : 'MATCH'}</span>
                </div>
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-[#27C93F] shadow-[0_0_10px_rgba(39,201,63,0.8)] animate-pulse" />
                  <span className="font-[family:var(--font-geist-mono)] text-[11px] sm:text-xs font-medium uppercase tracking-[0.15em] text-white/60">{locale === 'tr' ? 'ATS TARAYICI' : 'ATS SCANNER'}</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-semibold text-white tracking-tight">Alex Morgan</h3>
                <p className="text-sm sm:text-base text-white/50 mt-1">{locale === 'tr' ? 'Başvurulan Rol: Ürün Müdürü' : 'Applying for: Product Manager'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
              {/* Found Keywords */}
              <div className="rounded-2xl border border-[#27C93F]/20 bg-[#27C93F]/[0.02] p-6 shadow-inner">
                <div className="flex items-center gap-2.5 mb-5">
                  <CheckCircle2 className="w-4 h-4 sm:w-5 sm:h-5 text-[#27C93F]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider">{locale === 'tr' ? 'Tespit Edildi' : 'Identified'}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1.5 rounded-md bg-[#27C93F]/10 border border-[#27C93F]/20 text-xs sm:text-sm font-medium text-[#27C93F]">Agile</span>
                  <span className="px-3 py-1.5 rounded-md bg-[#27C93F]/10 border border-[#27C93F]/20 text-xs sm:text-sm font-medium text-[#27C93F]">Jira</span>
                  <span className="px-3 py-1.5 rounded-md bg-[#27C93F]/10 border border-[#27C93F]/20 text-xs sm:text-sm font-medium text-[#27C93F]">Roadmaps</span>
                  <span className="px-3 py-1.5 rounded-md bg-[#27C93F]/10 border border-[#27C93F]/20 text-xs sm:text-sm font-medium text-[#27C93F]">SQL</span>
                </div>
              </div>

              {/* Missing Keywords */}
              <div className="rounded-2xl border border-[#FFBD2E]/20 bg-[#FFBD2E]/[0.02] p-6 shadow-inner">
                <div className="flex items-center gap-2.5 mb-5">
                  <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-[#FFBD2E]" />
                  <span className="text-xs sm:text-sm font-semibold text-white/80 uppercase tracking-wider">{locale === 'tr' ? 'Eksik' : 'Missing'}</span>
                </div>
                <div className="flex flex-wrap gap-2.5">
                  <span className="px-3 py-1.5 rounded-md bg-[#FFBD2E]/10 border border-[#FFBD2E]/20 text-xs sm:text-sm font-medium text-[#FFBD2E]">GTM Strategy</span>
                  <span className="px-3 py-1.5 rounded-md bg-[#FFBD2E]/10 border border-[#FFBD2E]/20 text-xs sm:text-sm font-medium text-[#FFBD2E]">A/B Testing</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
