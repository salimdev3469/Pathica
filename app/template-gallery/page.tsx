import type { Metadata } from 'next';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { CopyLinkButton } from '@/components/ui/copy-link-button';
import { publicTemplates } from '@/lib/template-gallery';

export const metadata: Metadata = {
  title: 'Public Resume Template Gallery | Pathica',
  description: 'Explore public ATS-friendly resume templates and start building your own resume with Pathica.',
  alternates: {
    canonical: '/template-gallery',
  },
};

export default function TemplateGalleryPage() {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">Public Resume Template Gallery</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Discover resume structures that are ATS-friendly and easy to customize for your target role.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link href="/cv/new">Create My Resume Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {publicTemplates.map((template) => {
            const shareUrl = `${appUrl}/template-gallery#${template.slug}`;

            return (
              <Card key={template.slug} id={template.slug} className="transition-shadow hover:shadow-md">
                <CardHeader>
                  <CardTitle>{template.name}</CardTitle>
                  <CardDescription>{template.target}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="list-disc space-y-2 pl-5 text-sm text-slate-600">
                    {template.strengths.map((strength) => (
                      <li key={strength}>{strength}</li>
                    ))}
                  </ul>

                  <div className="flex flex-wrap gap-2">
                    <Button asChild size="sm">
                      <Link href={template.useHref}>Use Template</Link>
                    </Button>
                    <CopyLinkButton url={shareUrl} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>
    </main>
  );
}
