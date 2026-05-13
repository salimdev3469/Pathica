import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = (process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000').replace(/\/$/, '');

  return {
    rules: {
      userAgent: '*',
      allow: ['/', '/cv/new', '/blog'],
      disallow: ['/api/', '/auth/', '/login', '/register', '/welcome', '/dashboard', '/applications', '/cv/', '/share/', '/email/'],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
