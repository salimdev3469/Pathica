import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-posts';

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'https://www.pathica.tech').replace(/\/$/, '');
  const now = new Date();

  const staticPaths = [
    '',
    '/cv/new',
    '/blog',
  ];

  const staticEntries = staticPaths.map((path) => ({
    url: `${baseUrl}${path}`,
    lastModified: now,
    changeFrequency: 'weekly' as const,
    priority: path === '' ? 1 : path === '/cv/new' ? 0.9 : 0.8,
  }));

  const blogEntries = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: now,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }));

  return [...staticEntries, ...blogEntries];
}
