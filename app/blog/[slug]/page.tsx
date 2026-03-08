import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { blogPosts, getBlogPost } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface BlogPostPageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = blogPosts.find((item) => item.slug === params.slug);
  if (!post) {
    return {
      title: 'Post Not Found | Pathica',
      description: 'Requested blog post could not be found.',
    };
  }

  const title = `${post.title} | Pathica`;
  const description = `${post.excerpt} Keyword target: ${post.keyword}.`;

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/blog/${post.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((item) => item.slug === params.slug);
  if (!post) {
    notFound();
  }

  const safePost = getBlogPost(params.slug);

  return (
    <main className="min-h-screen bg-slate-50">
      <article className="mx-auto max-w-4xl px-6 py-14">
        <header className="mb-8">
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-blue-600">{safePost.category}</p>
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900">{safePost.title}</h1>
          <p className="mt-4 text-lg text-slate-600">{safePost.excerpt}</p>
        </header>

        <div className="mb-8 grid gap-4 md:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Search Intent</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700">{safePost.searchIntent}</CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Primary Keyword</CardTitle>
            </CardHeader>
            <CardContent className="text-slate-700">{safePost.keyword}</CardContent>
          </Card>
        </div>

        <section className="space-y-6 rounded-xl border bg-white p-6">
          <h2 className="text-2xl font-semibold text-slate-900">Quick Framework</h2>
          <p className="text-slate-700">
            Define your target role first, align keywords with the job description, and keep every section outcome-oriented.
            Use concise language so recruiters and ATS tools can parse your value immediately.
          </p>
          <h3 className="text-xl font-semibold text-slate-900">Implementation Checklist</h3>
          <ul className="list-disc space-y-2 pl-5 text-slate-700">
            <li>Start with a focused headline and summary.</li>
            <li>Rewrite bullet points using measurable outcomes.</li>
            <li>Align skills and keywords with the role you target.</li>
            <li>Keep formatting simple and ATS-safe.</li>
          </ul>
        </section>

        <section className="mt-8 rounded-xl border bg-white p-6 text-center">
          <h2 className="text-2xl font-semibold text-slate-900">Turn This Guidance Into a Resume</h2>
          <p className="mt-3 text-slate-600">
            Apply this framework directly inside Pathica and build your next resume draft in minutes.
          </p>
          <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
            <Button asChild>
              <Link href="/cv/new">Create Resume Free</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/blog">Back to Blog</Link>
            </Button>
          </div>
        </section>
      </article>
    </main>
  );
}
