import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles, FileText, Target, CheckCircle2, Zap, ArrowRight, ShieldCheck, Search } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50 font-sans">
      {/* Navigation */}
      <header className="fixed top-0 w-full z-50 bg-white/80 backdrop-blur-md border-b shadow-sm">
        <div className="container mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 text-xl font-bold text-primary">
            <Sparkles className="h-6 w-6 text-blue-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
              Photonic CV
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-slate-600 hover:text-primary transition-colors">
              Sign In
            </Link>
            <Button asChild className="rounded-full px-6 shadow-md hover:shadow-lg transition-all">
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 pt-16">
        {/* Hero Section */}
        <section className="relative overflow-hidden bg-white py-20 lg:py-32 border-b">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]"></div>
          <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-blue-400 opacity-20 blur-[100px]"></div>

          <div className="container mx-auto px-6 relative z-10 text-center max-w-4xl">
            <Badge className="mb-6 mx-auto rounded-full px-4 py-1.5 bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100 transition-colors cursor-default">
              ✨ Powered by Google Gemini AI
            </Badge>
            <h1 className="text-5xl lg:text-7xl font-extrabold tracking-tight text-slate-900 mb-8 leading-[1.1]">
              Land Your Dream Job with an <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-blue-600">AI-Optimized</span> CV
            </h1>
            <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto leading-relaxed">
              Create ATS-friendly resumes that get past the bots. Tailor your applications to specific roles and track your success all in one powerful platform.
            </p>
            <div className="flex flex-col sm:flex-row justify-center items-center gap-4">
              <Button size="lg" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full shadow-xl hover:shadow-primary/25 transition-all" asChild>
                <Link href="/cv/new">
                  Build Free CV <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg rounded-full bg-white transition-all" asChild>
                <Link href="/jobs">
                  Search Jobs
                </Link>
              </Button>
            </div>

            <div className="mt-16 text-sm font-medium text-slate-400 uppercase tracking-widest flex justify-center items-center gap-8 opacity-70">
              <div className="flex items-center gap-2"><ShieldCheck className="w-4 h-4" /> ATS Compliant</div>
              <div className="flex items-center gap-2"><Zap className="w-4 h-4" /> AI Powered</div>
              <div className="flex items-center gap-2"><FileText className="w-4 h-4" /> Export to PDF</div>
            </div>
          </div>
        </section>

        {/* How It Works */}
        <section className="py-24 bg-slate-50" id="how-it-works">
          <div className="container mx-auto px-6 text-center max-w-5xl">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How Photonic CV Works</h2>
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
              <h2 className="text-3xl font-bold tracking-tight mb-4">Simple, Transparent Pricing</h2>
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
                  <Button className="w-full mt-8 h-12 rounded-xl" variant="outline" asChild>
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
                  <Button className="w-full mt-8 h-12 rounded-xl text-lg bg-gradient-to-r from-primary to-blue-600 hover:opacity-90 transition-opacity shadow-md" asChild>
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
            <Sparkles className="h-6 w-6 text-blue-500" />
            <span>Photonic CV</span>
          </div>
          <p className="mb-6 max-w-sm mx-auto">
            The automated, AI-driven way to build resumes that pass ATS tests and win interviews.
          </p>
          <div className="text-sm">
            &copy; {new Date().getFullYear()} Photonic CV. All rights reserved.
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
