import type { MetadataRoute } from 'next';
import { blogPosts } from '@/lib/blog-posts';
import { getBaseUrl } from '@/lib/seo/config';
import { seoLandingPages, getSeoLandingAlternates } from '@/lib/seo/landing-pages';
import { professionSeeds, getProfessionListPath, getProfessionPath } from '@/lib/seo/professions';

function absolute(baseUrl: string, pathname: string): string {
  return `${baseUrl}${pathname}`;
}

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getBaseUrl();
  const now = new Date();

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: absolute(baseUrl, '/'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: absolute(baseUrl, '/cv/new'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.95,
    },
    {
      url: absolute(baseUrl, '/blog'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: absolute(baseUrl, '/en'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: {
        languages: {
          en: absolute(baseUrl, '/en'),
          tr: absolute(baseUrl, '/tr'),
        },
      },
    },
    {
      url: absolute(baseUrl, '/tr'),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.85,
      alternates: {
        languages: {
          en: absolute(baseUrl, '/en'),
          tr: absolute(baseUrl, '/tr'),
        },
      },
    },
    {
      url: absolute(baseUrl, '/gizlilik-politikasi'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/kvkk-aydinlatma-metni'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/kullanim-kosullari'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/mesafeli-satis-sozlesmesi'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/on-bilgilendirme-formu'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/iptal-iade-politikasi'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: absolute(baseUrl, '/iletisim'),
      lastModified: now,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ];

  const blogEntries: MetadataRoute.Sitemap = blogPosts.map((post) => ({
    url: absolute(baseUrl, `/blog/${post.slug}`),
    lastModified: now,
    changeFrequency: 'monthly',
    priority: 0.7,
  }));

  const landingKeys = Array.from(new Set(seoLandingPages.map((page) => page.key)));

  const landingEntries: MetadataRoute.Sitemap = landingKeys.flatMap((key) => {
    const alternates = getSeoLandingAlternates(key);

    return [
      {
        url: absolute(baseUrl, alternates.en),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.86,
        alternates: {
          languages: {
            en: absolute(baseUrl, alternates.en),
            tr: absolute(baseUrl, alternates.tr),
          },
        },
      },
      {
        url: absolute(baseUrl, alternates.tr),
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.86,
        alternates: {
          languages: {
            en: absolute(baseUrl, alternates.en),
            tr: absolute(baseUrl, alternates.tr),
          },
        },
      },
    ];
  });

  const programmaticListEntries: MetadataRoute.Sitemap = [
    {
      url: absolute(baseUrl, getProfessionListPath('en')),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.82,
      alternates: {
        languages: {
          en: absolute(baseUrl, getProfessionListPath('en')),
          tr: absolute(baseUrl, getProfessionListPath('tr')),
        },
      },
    },
    {
      url: absolute(baseUrl, getProfessionListPath('tr')),
      lastModified: now,
      changeFrequency: 'weekly',
      priority: 0.82,
      alternates: {
        languages: {
          en: absolute(baseUrl, getProfessionListPath('en')),
          tr: absolute(baseUrl, getProfessionListPath('tr')),
        },
      },
    },
  ];

  const professionEntries: MetadataRoute.Sitemap = professionSeeds.flatMap((profession) => {
    const enPath = getProfessionPath('en', profession.slug);
    const trPath = getProfessionPath('tr', profession.slug);

    return [
      {
        url: absolute(baseUrl, enPath),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.76,
        alternates: {
          languages: {
            en: absolute(baseUrl, enPath),
            tr: absolute(baseUrl, trPath),
          },
        },
      },
      {
        url: absolute(baseUrl, trPath),
        lastModified: now,
        changeFrequency: 'monthly',
        priority: 0.76,
        alternates: {
          languages: {
            en: absolute(baseUrl, enPath),
            tr: absolute(baseUrl, trPath),
          },
        },
      },
    ];
  });

  return [
    ...staticEntries,
    ...landingEntries,
    ...programmaticListEntries,
    ...professionEntries,
    ...blogEntries,
  ];
}
