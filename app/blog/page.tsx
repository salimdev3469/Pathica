import type { Metadata } from 'next';
import Link from 'next/link';
import { blogPosts, blogCategories } from '@/lib/blog-posts';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export const metadata: Metadata = {
  title: 'Resume and Career Blog | Pathica',
  description:
    'Explore resume writing guides, job application tips, interview strategies, and career advice to land more interviews.',
};

export default function BlogIndexPage() {
  return (
    <main className="min-h-screen bg-slate-50">
      <section className="border-b bg-white">
        <div className="mx-auto max-w-5xl px-6 py-16 text-center">
          <h1 className="text-4xl font-semibold tracking-[-0.03em] text-slate-900 md:text-5xl">Pathica Career Blog</h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg text-slate-600">
            Actionable guides for resume writing, applications, interviews, and career growth.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="h-12 rounded-full px-7">
              <Link href="/cv/new">Create My Resume Free</Link>
            </Button>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {blogCategories.map((category) => {
            const count = blogPosts.filter((post) => post.category === category.id).length;
            return (
              <Card key={category.id}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg">{category.label}</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-slate-600">{count} guides</CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {blogPosts.map((post) => (
            <Card key={post.slug} className="transition-shadow hover:shadow-md">
              <CardHeader>
                <CardTitle className="text-xl">
                  <Link href={`/blog/${post.slug}`} className="hover:underline">
                    {post.title}
                  </Link>
                </CardTitle>
                <CardDescription>{post.excerpt}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-slate-500">Keyword: {post.keyword}</p>
                <div className="flex gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link href={`/blog/${post.slug}`}>Read Guide</Link>
                  </Button>
                  <Button asChild size="sm">
                    <Link href="/cv/new">Use in Builder</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </main>
  );
}
