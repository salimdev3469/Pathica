import type { MetadataRoute } from 'next';
import { getBaseUrl } from '@/lib/seo/config';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getBaseUrl();

  return {
    rules: [
      {
        userAgent: '*',
        allow: ['/', '/en', '/en/', '/tr', '/tr/', '/blog', '/cv/new'],
        disallow: [
          '/api/',
          '/auth/',
          '/login',
          '/register',
          '/welcome',
          '/dashboard',
          '/applications',
          '/admin',
          '/billing',
          '/cv/guest',
          '/cv/',
          '/share/',
          '/email/',
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
