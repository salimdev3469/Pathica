import type { CvFontKey } from '@/lib/cv-fonts';

export type TemplateLocale = 'en' | 'tr';

export type CvTemplateSlug =
  | 'classic-ats'
  | 'entry-starter'
  | 'technical-impact'
  | 'career-switch';

type LocalizedText = {
  en: string;
  tr: string;
};

export interface CvTemplateItemSeed {
  title: LocalizedText;
  subtitle: LocalizedText;
  date: string;
  location: LocalizedText;
  bullets: LocalizedText;
}

export interface CvTemplateSectionSeed {
  title: LocalizedText;
  items: CvTemplateItemSeed[];
}

export interface CvTemplateSeed {
  slug: CvTemplateSlug;
  name: LocalizedText;
  target: LocalizedText;
  previewImage: string;
  previewAlt: LocalizedText;
  headline: LocalizedText;
  summaryTitle: LocalizedText;
  summary: LocalizedText;
  personalInfo: {
    fullName: string;
    jobTitle: LocalizedText;
    email: string;
    phone: string;
    location: LocalizedText;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  sections: CvTemplateSectionSeed[];
}

export interface CvTemplatePreviewState {
  id: string;
  title: string;
  fontFamily: CvFontKey;
  templateSlug: CvTemplateSlug;
  personalInfo: {
    fullName: string;
    jobTitle: string;
    email: string;
    phone: string;
    location: string;
    linkedin: string;
    portfolio: string;
    github: string;
  };
  summaryTitle: string;
  summary: string;
  sections: Array<{
    id: string;
    title: string;
    position: number;
    items: Array<{
      id: string;
      title: string;
      subtitle: string;
      date: string;
      location: string;
      bullets: string;
      position: number;
    }>;
  }>;
}

export const cvTemplateSeeds: CvTemplateSeed[] = [
  {
    slug: 'classic-ats',
    name: { en: 'Classic ATS', tr: 'Klasik ATS' },
    target: { en: 'General professional roles', tr: 'Genel profesyonel roller' },
    previewImage: '/template-previews/classic-ats.svg',
    previewAlt: { en: 'Classic ATS resume preview', tr: 'Klasik ATS ozgecmis onizlemesi' },
    headline: {
      en: 'Balanced structure for most office and business jobs.',
      tr: 'Ofis ve iş odaklı roller için dengeli yapı.',
    },
    summaryTitle: { en: 'Profile Summary', tr: 'Profil Özeti' },
    summary: {
      en: 'Results-focused professional with strong communication, execution discipline, and proven ability to improve cross-team workflows.',
      tr: 'Sonuç odaklı, iletişimi güçlü, uygulama disiplini yüksek ve ekipler arası süreçleri iyileştirme tecrübesi olan profesyonel.',
    },
    personalInfo: {
      fullName: 'Alex Morgan',
      jobTitle: { en: 'Operations Specialist', tr: 'Operasyon Uzmanı' },
      email: 'alex.morgan@example.com',
      phone: '+1 555 010 900',
      location: { en: 'Austin, TX', tr: 'Istanbul, TR' },
      linkedin: 'linkedin.com/in/alexmorgan',
      portfolio: 'portfolio.example.com',
      github: '',
    },
    sections: [
      {
        title: { en: 'Experience', tr: 'Deneyim' },
        items: [
          {
            title: { en: 'Northbridge Solutions', tr: 'Northbridge Solutions' },
            subtitle: { en: 'Operations Specialist', tr: 'Operasyon Uzmanı' },
            date: '2022 - Present',
            location: { en: 'Austin, TX', tr: 'Istanbul, TR' },
            bullets: {
              en: '- Reduced processing time by 28% by redesigning internal handoff flow.\n- Built weekly KPI reporting workflow used by sales and delivery teams.\n- Coordinated cross-functional projects with 99% on-time completion.',
              tr: '- İç devir sürecini yeniden tasarlayarak işlem süresini %28 azalttı.\n- Satış ve teslim ekiplerinin kullandığı haftalık KPI raporlama akışı kurdu.\n- Ekipler arası projelerde %99 zamanında tamamlama oranı sağladı.',
            },
          },
        ],
      },
      {
        title: { en: 'Education', tr: 'Eğitim' },
        items: [
          {
            title: { en: 'State University', tr: 'State University' },
            subtitle: { en: 'B.A. Business Administration', tr: 'İşletme Lisans' },
            date: '2017 - 2021',
            location: { en: 'United States', tr: 'Türkiye' },
            bullets: {
              en: '- Focus on operations management and business analytics.',
              tr: '- Operasyon yönetimi ve iş analitiği odaklı eğitim.',
            },
          },
        ],
      },
      {
        title: { en: 'Skills', tr: 'Yetenekler' },
        items: [
          {
            title: { en: 'Core Skills', tr: 'Temel Yetenekler' },
            subtitle: { en: '', tr: '' },
            date: '',
            location: { en: '', tr: '' },
            bullets: {
              en: 'Process Optimization, Stakeholder Communication, KPI Reporting, SQL, Excel, Notion',
              tr: 'Süreç Optimizasyonu, Paydaş İletişimi, KPI Raporlama, SQL, Excel, Notion',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'entry-starter',
    name: { en: 'Entry Starter', tr: 'Yeni Mezun Başlangıç' },
    target: { en: 'Internship and entry-level roles', tr: 'Staj ve giriş seviyesi roller' },
    previewImage: '/template-previews/entry-starter.svg',
    previewAlt: { en: 'Entry Starter resume preview', tr: 'Yeni Mezun Baslangic ozgecmis onizlemesi' },
    headline: {
      en: 'Project-first template for candidates with limited experience.',
      tr: 'Deneyimi sınırlı adaylar için proje odaklı şablon.',
    },
    summaryTitle: { en: 'Profile Summary', tr: 'Profil Özeti' },
    summary: {
      en: 'Early-career candidate with strong learning agility, hands-on project experience, and practical problem-solving mindset.',
      tr: 'Öğrenme çevikliği yüksek, uygulamalı proje deneyimi olan ve pratik problem çözme yaklaşımıyla öne çıkan erken kariyer adayı.',
    },
    personalInfo: {
      fullName: 'Jordan Lee',
      jobTitle: { en: 'Junior Data Analyst', tr: 'Junior Veri Analisti' },
      email: 'jordan.lee@example.com',
      phone: '+1 555 010 250',
      location: { en: 'Boston, MA', tr: 'Ankara, TR' },
      linkedin: 'linkedin.com/in/jordanlee',
      portfolio: 'github.com/jordanlee',
      github: 'github.com/jordanlee',
    },
    sections: [
      {
        title: { en: 'Projects', tr: 'Projeler' },
        items: [
          {
            title: { en: 'Sales Forecast Dashboard', tr: 'Satış Tahmin Dashboardu' },
            subtitle: { en: 'Power BI, SQL', tr: 'Power BI, SQL' },
            date: '2024',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Designed dashboard tracking 12 monthly KPIs and trend alerts.\n- Cleaned and modeled raw data from 3 sources for analysis readiness.',
              tr: '- 12 aylık KPI ve trend uyarıları içeren dashboard tasarladı.\n- 3 kaynaktan gelen ham veriyi temizleyip analize hazır hale getirdi.',
            },
          },
        ],
      },
      {
        title: { en: 'Education', tr: 'Eğitim' },
        items: [
          {
            title: { en: 'Metro University', tr: 'Metro University' },
            subtitle: { en: 'B.Sc. Statistics', tr: 'İstatistik Lisans' },
            date: '2020 - 2024',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Relevant coursework: Data Analysis, Probability, Machine Learning Fundamentals.',
              tr: '- İlgili dersler: Veri Analizi, Olasılık, Makine Öğrenmesi Temelleri.',
            },
          },
        ],
      },
      {
        title: { en: 'Skills', tr: 'Yetenekler' },
        items: [
          {
            title: { en: 'Technical Skills', tr: 'Teknik Yetenekler' },
            subtitle: { en: '', tr: '' },
            date: '',
            location: { en: '', tr: '' },
            bullets: {
              en: 'SQL, Python, Power BI, Excel, Tableau, Data Cleaning, A/B Testing',
              tr: 'SQL, Python, Power BI, Excel, Tableau, Veri Temizleme, A/B Testi',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'technical-impact',
    name: { en: 'Technical Impact', tr: 'Teknik Etki' },
    target: { en: 'Software and data roles', tr: 'Yazılım ve veri rolleri' },
    previewImage: '/template-previews/technical-impact.svg',
    previewAlt: { en: 'Technical Impact resume preview', tr: 'Teknik Etki ozgecmis onizlemesi' },
    headline: {
      en: 'Emphasizes shipped work, metrics, and engineering ownership.',
      tr: 'Yayınlanan işler, metrikler ve mühendislik sahipliğini öne çıkarır.',
    },
    summaryTitle: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
    summary: {
      en: 'Engineer focused on building reliable products with measurable impact through clean architecture, experimentation, and collaboration.',
      tr: 'Temiz mimari, deneysel yaklaşım ve ekip iş birliğiyle ölçülebilir etki üreten güvenilir ürünler geliştirmeye odaklı mühendis.',
    },
    personalInfo: {
      fullName: 'Taylor Chen',
      jobTitle: { en: 'Software Engineer', tr: 'Yazılım Mühendisi' },
      email: 'taylor.chen@example.com',
      phone: '+1 555 010 480',
      location: { en: 'Seattle, WA', tr: 'Izmir, TR' },
      linkedin: 'linkedin.com/in/taylorchen',
      portfolio: 'taylorchen.dev',
      github: 'github.com/taylorchen',
    },
    sections: [
      {
        title: { en: 'Experience', tr: 'Deneyim' },
        items: [
          {
            title: { en: 'Beamline Labs', tr: 'Beamline Labs' },
            subtitle: { en: 'Software Engineer', tr: 'Yazılım Mühendisi' },
            date: '2021 - Present',
            location: { en: 'Seattle, WA', tr: 'Uzaktan' },
            bullets: {
              en: '- Shipped a Next.js + Node feature set used by 35k monthly active users.\n- Cut API response latency by 41% via query optimization and caching.\n- Introduced CI checks that reduced release regressions by 32%.',
              tr: '- Aylık 35 bin aktif kullanıcıya hizmet veren Next.js + Node özellik seti yayınladı.\n- Sorgu optimizasyonu ve cache ile API gecikmesini %41 düşürdü.\n- CI kontrolleri ekleyerek sürüm regresyonlarını %32 azalttı.',
            },
          },
        ],
      },
      {
        title: { en: 'Projects', tr: 'Projeler' },
        items: [
          {
            title: { en: 'Observability Toolkit', tr: 'Gözlemlenebilirlik Toolkit\'i' },
            subtitle: { en: 'TypeScript, OpenTelemetry, Grafana', tr: 'TypeScript, OpenTelemetry, Grafana' },
            date: '2023',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Built internal tracing toolkit adopted by 4 product squads.\n- Reduced MTTR by creating standardized incident dashboards.',
              tr: '- 4 ürün ekibinin kullandığı iç tracing toolkit geliştirdi.\n- Standart incident dashboardlarıyla MTTR süresini düşürdü.',
            },
          },
        ],
      },
      {
        title: { en: 'Skills', tr: 'Yetenekler' },
        items: [
          {
            title: { en: 'Tech Stack', tr: 'Teknoloji Yığını' },
            subtitle: { en: '', tr: '' },
            date: '',
            location: { en: '', tr: '' },
            bullets: {
              en: 'TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, Docker, AWS',
              tr: 'TypeScript, React, Next.js, Node.js, PostgreSQL, Redis, Docker, AWS',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'career-switch',
    name: { en: 'Career Switch', tr: 'Kariyer Geçişi' },
    target: { en: 'Candidates transitioning into a new field', tr: 'Yeni alana geçiş yapan adaylar' },
    previewImage: '/template-previews/career-switch.svg',
    previewAlt: { en: 'Career Switch resume preview', tr: 'Kariyer Gecisi ozgecmis onizlemesi' },
    headline: {
      en: 'Highlights transferable skills and transition story clearly.',
      tr: 'Aktarılabilir yetenekleri ve geçiş hikayesini net vurgular.',
    },
    summaryTitle: { en: 'Transition Summary', tr: 'Geçiş Özeti' },
    summary: {
      en: 'Professional transitioning into product and analytics roles, combining domain expertise with structured problem-solving and stakeholder communication.',
      tr: 'Ürün ve analitik rollerine geçiş yapan, alan tecrübesini yapılandırılmış problem çözme ve paydaş iletişimiyle birleştiren profesyonel.',
    },
    personalInfo: {
      fullName: 'Sam Rivera',
      jobTitle: { en: 'Product Analyst', tr: 'Ürün Analisti' },
      email: 'sam.rivera@example.com',
      phone: '+1 555 010 730',
      location: { en: 'Denver, CO', tr: 'Bursa, TR' },
      linkedin: 'linkedin.com/in/samrivera',
      portfolio: 'samrivera.me',
      github: '',
    },
    sections: [
      {
        title: { en: 'Transferable Experience', tr: 'Aktarılabilir Deneyim' },
        items: [
          {
            title: { en: 'Lumen Retail Group', tr: 'Lumen Retail Group' },
            subtitle: { en: 'Team Lead (Operations)', tr: 'Takım Lideri (Operasyon)' },
            date: '2019 - Present',
            location: { en: 'Denver, CO', tr: 'Bursa, TR' },
            bullets: {
              en: '- Managed planning process for 20+ store initiatives with measurable outcomes.\n- Led customer-feedback analysis and converted findings into product backlog items.\n- Facilitated cross-team delivery cadence and stakeholder reporting.',
              tr: '- 20+ mağaza inisiyatifi için planlama süreçlerini ölçülebilir çıktılarla yönetti.\n- Müşteri geri bildirim analizini ürün backlog maddelerine dönüştürdü.\n- Ekipler arası teslim ritmi ve paydaş raporlamasını yönetti.',
            },
          },
        ],
      },
      {
        title: { en: 'Relevant Projects', tr: 'İlgili Projeler' },
        items: [
          {
            title: { en: 'Product Metrics Revamp', tr: 'Ürün Metrik Yenileme' },
            subtitle: { en: 'Analytics, Experimentation', tr: 'Analitik, Deneysellik' },
            date: '2024',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Built KPI framework and reporting templates for weekly product reviews.\n- Improved decision speed by standardizing experiment readouts.',
              tr: '- Haftalık ürün değerlendirmeleri için KPI çerçevesi ve rapor şablonları oluşturdu.\n- Deney çıktılarını standartlaştırarak karar hızını artırdı.',
            },
          },
        ],
      },
      {
        title: { en: 'Skills', tr: 'Yetenekler' },
        items: [
          {
            title: { en: 'Core Skills', tr: 'Temel Yetenekler' },
            subtitle: { en: '', tr: '' },
            date: '',
            location: { en: '', tr: '' },
            bullets: {
              en: 'Product Thinking, SQL, Data Storytelling, Stakeholder Management, Roadmap Planning',
              tr: 'Ürün Düşüncesi, SQL, Veri Hikayeleştirme, Paydaş Yönetimi, Yol Haritası Planlama',
            },
          },
        ],
      },
    ],
  },
];

const templateBySlug = new Map(cvTemplateSeeds.map((template) => [template.slug, template]));
const TEMPLATE_FONT_BY_SLUG: Record<CvTemplateSlug, CvFontKey> = {
  'classic-ats': 'calibri',
  'entry-starter': 'arial',
  'technical-impact': 'helvetica',
  'career-switch': 'georgia',
};

export function getLocalizedText(text: LocalizedText, locale: TemplateLocale): string {
  return locale === 'tr' ? text.tr : text.en;
}

export function isCvTemplateSlug(value: string): value is CvTemplateSlug {
  return templateBySlug.has(value as CvTemplateSlug);
}

export function getCvTemplateSeed(slug?: string | null): CvTemplateSeed | null {
  if (!slug) {
    return null;
  }

  if (!isCvTemplateSlug(slug)) {
    return null;
  }

  return templateBySlug.get(slug) || null;
}

export function getCvTemplateDefaultFont(slug: CvTemplateSlug): CvFontKey {
  return TEMPLATE_FONT_BY_SLUG[slug] || 'calibri';
}

export function buildCvStateFromTemplate(template: CvTemplateSeed, locale: TemplateLocale): CvTemplatePreviewState {
  return {
    id: `${template.slug}-preview`,
    title: `${getLocalizedText(template.name, locale)} CV`,
    fontFamily: getCvTemplateDefaultFont(template.slug),
    templateSlug: template.slug,
    personalInfo: {
      fullName: template.personalInfo.fullName,
      jobTitle: getLocalizedText(template.personalInfo.jobTitle, locale),
      email: template.personalInfo.email,
      phone: template.personalInfo.phone,
      location: getLocalizedText(template.personalInfo.location, locale),
      linkedin: template.personalInfo.linkedin,
      portfolio: template.personalInfo.portfolio,
      github: template.personalInfo.github,
    },
    summaryTitle: getLocalizedText(template.summaryTitle, locale),
    summary: getLocalizedText(template.summary, locale),
    sections: template.sections.map((section, sectionIndex) => ({
      id: `${template.slug}-section-${sectionIndex}`,
      title: getLocalizedText(section.title, locale),
      position: sectionIndex,
      items: section.items.map((item, itemIndex) => ({
        id: `${template.slug}-section-${sectionIndex}-item-${itemIndex}`,
        title: getLocalizedText(item.title, locale),
        subtitle: getLocalizedText(item.subtitle, locale),
        date: item.date,
        location: getLocalizedText(item.location, locale),
        bullets: getLocalizedText(item.bullets, locale),
        position: itemIndex,
      })),
    })),
  };
}
