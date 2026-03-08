import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { SeoIntentPageData } from '@/lib/seo-pages';

interface SeoIntentPageProps {
  page: SeoIntentPageData;
}

export function SeoIntentPage({ page }: SeoIntentPageProps) {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 md:py-24 text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.15em] text-blue-600">Pathica Guide</p>
          <h1 className="text-4xl md:text-5xl font-semibold tracking-[-0.03em] text-slate-900">{page.heroTitle}</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">{page.heroSubtitle}</p>

          <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link href={page.primaryCtaHref}>{page.primaryCtaLabel}</Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="h-12 rounded-full px-7">
              <Link href={page.secondaryCtaHref}>{page.secondaryCtaLabel}</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-8 px-6 py-12 md:grid-cols-[1.3fr_1fr]">
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle>Search Intent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700">{page.searchIntent}</CardContent>
          </Card>

          {page.contentSections.map((section) => (
            <Card key={section.heading}>
              <CardHeader>
                <CardTitle>{section.heading}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">{section.body}</p>
                <ul className="list-disc space-y-2 pl-5 text-slate-600">
                  {section.bullets.map((bullet) => (
                    <li key={bullet}>{bullet}</li>
                  ))}
                </ul>
                {section.ctaLabel && section.ctaHref && (
                  <div className="pt-2">
                    <Button asChild>
                      <Link href={section.ctaHref}>{section.ctaLabel}</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>

        <aside className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Page Structure</CardTitle>
            </CardHeader>
            <CardContent>
              <ol className="list-decimal space-y-2 pl-5 text-slate-600">
                {page.pageStructure.map((block) => (
                  <li key={block}>{block}</li>
                ))}
              </ol>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Action</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button asChild className="w-full">
                <Link href={page.primaryCtaHref}>{page.primaryCtaLabel}</Link>
              </Button>
              <Button asChild variant="outline" className="w-full">
                <Link href={page.secondaryCtaHref}>{page.secondaryCtaLabel}</Link>
              </Button>
            </CardContent>
          </Card>
        </aside>
      </section>
    </main>
  );
}
