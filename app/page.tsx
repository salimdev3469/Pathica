import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Target, CheckCircle2, Zap, ArrowRight, ShieldCheck } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { createClient } from '@/lib/supabase-server';
import { MouseEffect } from '@/components/mouse-effect';
import { Typewriter } from '@/components/ui/typewriter-text';
import { DottedSurface } from '@/components/ui/dotted-surface';
import fs from 'node:fs';
import path from 'node:path';

export default async function Home() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isAuthenticated = Boolean(user);
  const navCtaHref = isAuthenticated ? '/dashboard' : '/register';
  const navCtaLabel = isAuthenticated ? 'Dashboard' : 'Get Started';
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
              <Image src={logoSrc} alt="Pathica logo" width={144} height={144} className="h-28 w-28 object-contain transition-transform duration-500 group-hover:scale-110" />
            </div>
          </Link>
          <div className="flex items-center gap-4 sm:gap-6">
            <nav className="hidden md:flex items-center gap-8 text-sm font-semibold text-slate-500">
              <Link href="#how-it-works" className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                How It Works
              </Link>
              <Link href="#pricing" className="hover:text-primary transition-colors relative after:absolute after:bottom-0 after:left-0 after:h-[2px] after:w-0 after:bg-primary after:transition-all hover:after:w-full">
                Pricing
              </Link>
            </nav>
            <div className="h-8 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="flex items-center gap-3">
              {!isAuthenticated && (
                <Link href="/login" className="text-sm font-bold text-slate-600 hover:text-primary transition-colors px-2">
                  Sign In
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
              Powered by Google Gemini AI
            </Badge>
            <h1 className="text-5xl lg:text-7xl tracking-[-0.04em] text-[#1a1a1a] mb-8 leading-tight min-h-[110px] sm:min-h-[150px]">
              <Typewriter
                text="Land Your Dream Job with an AI-Optimized CV"
                speed={50}
                loop={false}
              />
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create ATS-friendly resumes that get past the bots. Tailor your applications to specific roles and track your success all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0" asChild>
                <Link href={heroPrimaryHref}>
                  Build Free CV <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-primary/30 hover:text-primary" asChild>
                <Link href="/jobs">
                  Search Jobs
                </Link>
              </Button>
            </div>

            <div className="mt-16 text-sm font-medium text-slate-400 uppercase tracking-widest flex justify-center items-center gap-8 opacity-70 mb-16">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> ATS Compliant</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> AI Powered</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Export to PDF</div>
            </div>

            {/* Application Demo Video/GIF with Info */}
            <div className="mx-auto mt-16 max-w-5xl flex flex-col items-center px-4 sm:px-0">
              {/* Top Text */}
              <div className="text-center mb-12 max-w-3xl">
                <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#1a1a1a] mb-6">
                  Build a Winning CV in Minutes
                </h2>
                <p className="text-lg text-slate-500 leading-relaxed md:px-12">
                  Pathica simplifies the creation of your professional footprint. We analyze recruiter patterns and use AI to output the perfect resume.
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
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Enter Your Information</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Flexibly enter your details into our intuitive form however you like. We handle the complex spacing and formatting behind the scenes.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-800">
                    2
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Export as PDF</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Instantly convert your completed profile and save it as a perfectly formatted, ATS-compliant PDF document.
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col sm:flex-row gap-5 items-start">
                  <div className="flex-shrink-0 w-12 h-12 rounded-full bg-[#1a1a1a] text-white flex items-center justify-center font-bold text-xl shadow-md border border-slate-800">
                    3
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900 mb-2">Apply Anywhere</h3>
                    <p className="text-slate-600 text-sm md:text-base leading-relaxed">
                      Use your polished resume to apply for your dream jobs directly on Pathica or any other platform seamlessly.
                    </p>
                  </div>
                </div>
              </div>
            </div>

          </div>
        </section>
        {/* Rejected CV Showcase */}
        <section className="relative overflow-hidden bg-slate-50/50 py-20">
          {/* Decorative background elements */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none" />

          <div className="container relative z-10 mx-auto px-6">
            <div className="mb-16 text-center">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-rose-500 mb-3 block">ATS Failure Profile</span>
              <h2 className="text-3xl md:text-5xl font-normal tracking-[-0.04em] text-[#1a1a1a] mb-4">
                Why 75% of CVs are <span className="text-red-600 font-extrabold drop-shadow-[0_0_15px_rgba(220,38,38,0.5)]">Rejected</span>
              </h2>
              <p className="mx-auto max-w-lg text-slate-500 text-sm leading-relaxed">
                Creative layouts often confuse AI parsers. If the bot can't read it,
                your application never reaches a human desk.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3 max-w-4xl mx-auto">
              {[
                {
                  src: 'https://www.slideteam.net/media/catalog/product/cache/1280x720/b/u/business_professional_resume_sample_a4_cv_template_slide01.jpg',
                  tag: 'Level 1: Unparseable',
                  reason: 'Graphics Overflow',
                  detail: 'Heavy images and decorative icons block text extraction.'
                },
                {
                  src: 'https://www.my-resume-templates.com/wp-content/uploads/2024/01/cv-template-online-252.jpg',
                  tag: 'Level 2: Jumbled',
                  reason: 'Multi-Column Mess',
                  detail: 'Non-standard columns cause text to merge in the wrong order.'
                },
                {
                  src: 'https://www.my-resume-templates.com/wp-content/uploads/2023/05/college-resume-template-example-1-350x495.jpg',
                  tag: 'Level 3: Filtered',
                  reason: 'Keyword Deficit',
                  detail: 'Style-over-substance leads to zero matching role keywords.'
                },
              ].map((cv, index) => (
                <div
                  key={index}
                  className="group relative aspect-[1/1.41] w-full overflow-hidden bg-white shadow-[0_4px_20px_rgba(0,0,0,0.03)] border border-slate-200 transition-all duration-500 hover:shadow-[0_20px_40px_rgba(0,0,0,0.08)] hover:-translate-y-1"
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
                        DENIED
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
                  <div className="absolute top-3 right-3 z-20 bg-white/80 backdrop-blur-sm border border-slate-200 px-2 py-1 flex items-center gap-1.5 shadow-sm">
                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-pulse" />
                    <span className="text-[9px] font-bold text-slate-600 tracking-tight">FAILED SCAN</span>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-[12px] font-medium text-slate-400 mb-6 italic">Don't risk your career on a bad template.</p>
              <Button size="lg" className="h-12 px-8 text-sm font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0" asChild>
                <Link href={heroPrimaryHref}>Create Compliant CV</Link>
              </Button>
            </div>
          </div>
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </section>

        {/* How It Works */}
        <section className="py-24 bg-slate-50" id="how-it-works">
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <h2 className="text-3xl font-medium tracking-[-0.04em] text-[#1a1a1a] mb-4">How It Works</h2>
            <p className="text-slate-500 mb-16 max-w-2xl mx-auto">From an empty page to a confirmed interview in three simple steps.</p>

            <div className="grid md:grid-cols-3 gap-10">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center text-primary mb-6 shadow-sm">
                  <FileText className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">1. Build Your Base CV</h3>
                <p className="text-slate-600">Enter your details into our beautiful, intuitive builder. Our templates are guaranteed to be 100% readable by Applicant Tracking Systems.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-blue-100 flex items-center justify-center text-blue-600 mb-6 shadow-sm">
                  <Target className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">2. Tailor with AI</h3>
                <p className="text-slate-600">Find a job you love? Paste the description and let Gemini AI rewrite your achievements to perfectly match the role's keywords.</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center text-green-600 mb-6 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold mb-3">3. Apply & Track</h3>
                <p className="text-slate-600">Generate a custom cover letter, apply via our Adzuna integration, and manage all your applications directly from your dashboard.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features / Pricing */}
        <section className="py-24 bg-white border-t" id="pricing">
          <div className="container mx-auto px-6 max-w-5xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl font-medium tracking-[-0.04em] text-[#1a1a1a] mb-4">Simple, Transparent Pricing</h2>
              <p className="text-slate-500">Start for free, upgrade when you need the power of AI.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
              <Card className="border-2 border-slate-100 hover:border-slate-200 transition-colors">
                <CardHeader>
                  <CardTitle className="text-2xl">Standard</CardTitle>
                  <CardDescription>Perfect for creating a basic, ATS-compliant resume.</CardDescription>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold">
                    $0
                    <span className="ml-1 text-xl font-medium text-slate-500">/ forever</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mt-6 space-y-4">
                    {['1 Free ATS-Compliant PDF Export', 'Intuitive Drag & Drop Builder', 'Real-time A4 Preview', 'Basic Job Search'].map((feature) => (
                      <li key={feature} className="flex">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-green-500 shrink-0" />
                        <span className="text-slate-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8 h-12 font-semibold rounded-full shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-primary/30 hover:text-primary" variant="outline" asChild>
                    <Link href="/cv/new">Get Started Free</Link>
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-2 border-primary relative shadow-xl transform md:-translate-y-4">
                <div className="absolute top-0 right-0 -translate-y-1/2 translate-x-1/4">
                  <span className="bg-gradient-to-r from-orange-400 to-rose-400 text-white text-xs font-bold uppercase tracking-wider py-1 px-3 rounded-full shadow-md transform rotate-12 inline-block">
                    Most Popular
                  </span>
                </div>
                <CardHeader>
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-primary" />
                    <CardTitle className="text-2xl text-primary">Pro</CardTitle>
                  </div>
                  <CardDescription>Maximum power to guarantee you land the interviews.</CardDescription>
                  <div className="mt-4 flex items-baseline text-5xl font-extrabold text-slate-900">
                    $9.99
                    <span className="ml-1 text-xl font-medium text-slate-500">/ month</span>
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="mt-6 space-y-4">
                    {[
                      'Unlimited PDF Exports',
                      'Save & Manage Multiple CVs',
                      'AI CV Optimization & Tailoring',
                      'AI Job Match Scoring',
                      'AI Cover Letter Generation',
                      'Full Application Tracker',
                    ].map((feature) => (
                      <li key={feature} className="flex">
                        <CheckCircle2 className="mr-3 h-5 w-5 text-primary shrink-0" />
                        <span className="text-slate-700 font-medium">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="w-full mt-8 h-12 text-lg font-semibold rounded-full shadow-md hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300 bg-[#1a1a1a] text-white hover:bg-black border-0" asChild>
                    <Link href="/register">Go Pro Today</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 text-center text-slate-400 border-t border-slate-800">
        <div className="container mx-auto px-6 flex flex-col items-center">
          <div className="flex items-center gap-2 text-xl font-bold text-white mb-6">
            <Image src={footerLogoSrc} alt="Pathica footer logo" width={144} height={144} className="h-36 w-36 object-contain" />
          </div>
          <p className="mb-6 max-w-sm mx-auto">
            The automated, AI-driven way to build resumes that pass ATS tests and win interviews.
          </p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} All rights reserved.
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
