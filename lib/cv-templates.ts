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
    previewImage: '/template-previews/classic-ats.png?v=20260515d',
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
    name: { en: 'Entry Starter ATS', tr: 'Yeni Mezun ATS' },
    target: { en: 'Internship, graduate, and junior roles', tr: 'Staj, yeni mezun ve junior roller' },
    previewImage: '/template-previews/entry-starter.png?v=20260515d',
    previewAlt: { en: 'Entry Starter resume preview', tr: 'Yeni Mezun Baslangic ozgecmis onizlemesi' },
    headline: {
      en: 'Education + internship-forward ATS layout for early-career applications.',
      tr: 'Erken kariyer başvuruları için eğitim ve staj odaklı ATS düzeni.',
    },
    summaryTitle: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
    summary: {
      en: 'Early-career analyst with internship execution, KPI reporting, and project delivery experience. Strong foundation in SQL, dashboarding, and data storytelling.',
      tr: 'Staj deneyimi, KPI raporlama ve proje teslimi tecrübesine sahip erken kariyer analist. SQL, dashboard ve veri hikayeleştirme alanlarında güçlü temel.',
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
        title: { en: 'Education', tr: 'Eğitim' },
        items: [
          {
            title: { en: 'Metro University', tr: 'Metro University' },
            subtitle: { en: 'B.Sc. Statistics', tr: 'İstatistik Lisans' },
            date: '2020 - 2024',
            location: { en: 'Boston, MA', tr: 'Ankara, TR' },
            bullets: {
              en: '- Relevant coursework: Data Analysis, Probability, A/B Testing, Business Analytics.\n- Capstone project awarded for practical retail forecasting methodology.',
              tr: '- İlgili dersler: Veri Analizi, Olasılık, A/B Testi, İş Analitiği.\n- Perakende tahmin metodolojisiyle bitirme projesi ödüllendirildi.',
            },
          },
        ],
      },
      {
        title: { en: 'Experience', tr: 'Deneyim' },
        items: [
          {
            title: { en: 'Nexa Insights', tr: 'Nexa Insights' },
            subtitle: { en: 'Data Analytics Intern', tr: 'Veri Analitiği Stajyeri' },
            date: '2023 - 2024',
            location: { en: 'Boston, MA', tr: 'Ankara, TR' },
            bullets: {
              en: '- Automated weekly reporting template, reducing manual prep time by 35%.\n- Built SQL queries for campaign performance tracking and quality checks.\n- Prepared slide-ready insights for manager and stakeholder meetings.',
              tr: '- Haftalık raporlama şablonunu otomatikleştirerek manuel hazırlık süresini %35 azalttı.\n- Kampanya performans takibi ve kalite kontrolleri için SQL sorguları geliştirdi.\n- Yönetici ve paydaş toplantıları için sunuma hazır içgörüler hazırladı.',
            },
          },
        ],
      },
      {
        title: { en: 'Projects', tr: 'Projeler' },
        items: [
          {
            title: { en: 'Sales Forecast Dashboard', tr: 'Satış Tahmin Dashboardu' },
            subtitle: { en: 'Power BI, SQL, Excel', tr: 'Power BI, SQL, Excel' },
            date: '2024',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Designed dashboard tracking 12 monthly KPIs and trend alerts.\n- Modeled data from 3 sources and documented assumptions for reproducibility.\n- Presented insights that improved weekly planning decisions.',
              tr: '- 12 aylık KPI ve trend uyarıları içeren dashboard tasarladı.\n- 3 kaynaktan veriyi modelleyip tekrar üretilebilirlik için varsayımları dokümante etti.\n- Haftalık planlama kararlarını iyileştiren içgörüler sundu.',
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
              en: 'SQL, Python, Power BI, Excel, Tableau, Data Cleaning, A/B Testing, Presentation Skills',
              tr: 'SQL, Python, Power BI, Excel, Tableau, Veri Temizleme, A/B Testi, Sunum Yetkinliği',
            },
          },
        ],
      },
    ],
  },
  {
    slug: 'technical-impact',
    name: { en: 'Technical Impact ATS', tr: 'Teknik Etki ATS' },
    target: { en: 'Software engineering and platform roles', tr: 'Yazılım mühendisliği ve platform rolleri' },
    previewImage: '/template-previews/technical-impact.png?v=20260515d',
    previewAlt: { en: 'Technical Impact resume preview', tr: 'Teknik Etki ozgecmis onizlemesi' },
    headline: {
      en: 'Metric-heavy engineering format highlighting system reliability and shipped impact.',
      tr: 'Sistem güvenilirliği ve yayınlanan etkileri öne çıkaran metrik yoğun mühendislik formatı.',
    },
    summaryTitle: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
    summary: {
      en: 'Software engineer experienced in full-stack delivery, API performance optimization, and production observability. Delivers maintainable systems with measurable reliability improvements.',
      tr: 'Full-stack teslim, API performans optimizasyonu ve production gözlemlenebilirliği deneyimli yazılım mühendisi. Ölçülebilir güvenilirlik artışı sağlayan sürdürülebilir sistemler geliştirir.',
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
              en: '- Shipped a Next.js + Node feature set used by 35k monthly active users.\n- Cut API response latency by 41% via query optimization and Redis caching.\n- Introduced CI quality gates reducing release regressions by 32%.',
              tr: '- Aylık 35 bin aktif kullanıcıya hizmet veren Next.js + Node özellik seti yayınladı.\n- Sorgu optimizasyonu ve Redis cache ile API gecikmesini %41 düşürdü.\n- CI kalite kontrolleriyle sürüm regresyonlarını %32 azalttı.',
            },
          },
          {
            title: { en: 'Polar Stack', tr: 'Polar Stack' },
            subtitle: { en: 'Backend Engineer', tr: 'Backend Mühendisi' },
            date: '2019 - 2021',
            location: { en: 'Seattle, WA', tr: 'Uzaktan' },
            bullets: {
              en: '- Scaled event ingestion pipeline to process 2.4x higher peak traffic.\n- Designed idempotent payment-webhook handlers reducing duplicate transactions.\n- Partnered with product to define SLA and incident-response playbooks.',
              tr: '- Event ingestion pipeline’ını 2.4 kat daha yüksek pik trafiğe ölçekledi.\n- Duplicate işlemleri azaltan idempotent ödeme webhook işleyicileri tasarladı.\n- Ürün ekibiyle SLA ve incident response playbook’ları tanımladı.',
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
              en: '- Built internal tracing toolkit adopted by 4 product squads.\n- Reduced MTTR by standardizing incident dashboards and alert routing.',
              tr: '- 4 ürün ekibinin kullandığı iç tracing toolkit geliştirdi.\n- Incident dashboard ve alarm yönlendirmesini standartlaştırarak MTTR süresini düşürdü.',
            },
          },
        ],
      },
      {
        title: { en: 'Certifications', tr: 'Sertifikalar' },
        items: [
          {
            title: { en: 'AWS Certified Developer – Associate', tr: 'AWS Certified Developer – Associate' },
            subtitle: { en: '', tr: '' },
            date: '2023',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Focused on cloud architecture, serverless services, and secure deployment practices.',
              tr: '- Cloud mimari, serverless servisler ve güvenli deployment pratiklerine odaklandı.',
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
    name: { en: 'Career Switch ATS', tr: 'Kariyer Geçişi ATS' },
    target: { en: 'Candidates transitioning into a new field', tr: 'Yeni alana geçiş yapan adaylar' },
    previewImage: '/template-previews/career-switch.png?v=20260515d',
    previewAlt: { en: 'Career Switch resume preview', tr: 'Kariyer Gecisi ozgecmis onizlemesi' },
    headline: {
      en: 'Transition-focused ATS template with transferable outcomes and relevant projects.',
      tr: 'Aktarılabilir çıktıları ve ilgili projeleri öne çıkaran geçiş odaklı ATS şablonu.',
    },
    summaryTitle: { en: 'Professional Summary', tr: 'Profesyonel Özet' },
    summary: {
      en: 'Operations leader transitioning into product analytics with strong stakeholder management, prioritization, and KPI design experience. Converts customer and process signals into actionable product improvements.',
      tr: 'Paydaş yönetimi, önceliklendirme ve KPI tasarımı tecrübesiyle ürün analitiğine geçiş yapan operasyon lideri. Müşteri ve süreç sinyallerini uygulanabilir ürün iyileştirmelerine dönüştürür.',
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
        title: { en: 'Skills', tr: 'Yetenekler' },
        items: [
          {
            title: { en: 'Core Transition Skills', tr: 'Geçişte Öne Çıkan Yetkinlikler' },
            subtitle: { en: '', tr: '' },
            date: '',
            location: { en: '', tr: '' },
            bullets: {
              en: 'Product Thinking, SQL, KPI Design, Data Storytelling, Stakeholder Management, Backlog Prioritization, Experiment Readouts',
              tr: 'Ürün Düşüncesi, SQL, KPI Tasarımı, Veri Hikayeleştirme, Paydaş Yönetimi, Backlog Önceliklendirme, Deney Çıktısı Yorumlama',
            },
          },
        ],
      },
      {
        title: { en: 'Experience', tr: 'Deneyim' },
        items: [
          {
            title: { en: 'Lumen Retail Group', tr: 'Lumen Retail Group' },
            subtitle: { en: 'Team Lead (Operations)', tr: 'Takım Lideri (Operasyon)' },
            date: '2019 - Present',
            location: { en: 'Denver, CO', tr: 'Bursa, TR' },
            bullets: {
              en: '- Managed planning process for 20+ store initiatives with measurable outcomes.\n- Led customer-feedback analysis and converted findings into product backlog items.\n- Facilitated cross-team delivery cadence and executive reporting.',
              tr: '- 20+ mağaza inisiyatifi için planlama süreçlerini ölçülebilir çıktılarla yönetti.\n- Müşteri geri bildirim analizini ürün backlog maddelerine dönüştürdü.\n- Ekipler arası teslim ritmi ve yönetici raporlamasını yönetti.',
            },
          },
        ],
      },
      {
        title: { en: 'Projects', tr: 'Projeler' },
        items: [
          {
            title: { en: 'Product Metrics Revamp', tr: 'Ürün Metrik Yenileme' },
            subtitle: { en: 'Analytics, Experimentation', tr: 'Analitik, Deneysellik' },
            date: '2024',
            location: { en: '', tr: '' },
            bullets: {
              en: '- Built KPI framework and reporting templates for weekly product reviews.\n- Improved decision speed by standardizing experiment readouts.\n- Created a common insight format used by product, ops, and leadership.',
              tr: '- Haftalık ürün değerlendirmeleri için KPI çerçevesi ve rapor şablonları oluşturdu.\n- Deney çıktıları standardizasyonuyla karar hızını artırdı.\n- Ürün, operasyon ve yönetimin kullandığı ortak içgörü formatı oluşturdu.',
            },
          },
        ],
      },
      {
        title: { en: 'Education', tr: 'Eğitim' },
        items: [
          {
            title: { en: 'Frontier University', tr: 'Frontier University' },
            subtitle: { en: 'B.A. Business Management', tr: 'İşletme Lisans' },
            date: '2014 - 2018',
            location: { en: 'United States', tr: 'Türkiye' },
            bullets: {
              en: '- Focus areas: business operations, customer analytics, and decision frameworks.',
              tr: '- Odak alanları: iş operasyonları, müşteri analitiği ve karar çerçeveleri.',
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
