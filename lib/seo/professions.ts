import { localizedPath } from '@/lib/seo/config';

export interface ProfessionSeed {
  slug: string;
  roleName: {
    en: string;
    tr: string;
  };
  summary: {
    en: string;
    tr: string;
  };
  coreSkills: {
    en: string[];
    tr: string[];
  };
  achievementIdeas: {
    en: string[];
    tr: string[];
  };
}

export const professionSeeds: ProfessionSeed[] = [
  {
    slug: 'software-engineer',
    roleName: { en: 'Software Engineer', tr: 'Yazılım Mühendisi' },
    summary: {
      en: 'Build a resume that highlights shipped features, system impact, and measurable engineering outcomes.',
      tr: 'Yayınlanan özellikleri, sistem etkisini ve ölçülebilir mühendislik çıktıları öne çıkaran bir CV hazırla.',
    },
    coreSkills: {
      en: ['TypeScript', 'System Design', 'API Development', 'Testing', 'Cloud Deployment', 'Git'],
      tr: ['TypeScript', 'Sistem Tasarımı', 'API Geliştirme', 'Test Süreçleri', 'Bulut Dağıtımı', 'Git'],
    },
    achievementIdeas: {
      en: ['Reduced API latency by 35% through query optimization.', 'Improved deployment success rate from 92% to 99%.', 'Shipped 4 product features used by 20K+ monthly active users.'],
      tr: ['Sorgu optimizasyonu ile API gecikmesini %35 azalttı.', 'Dağıtım başarı oranını %92’den %99’a çıkardı.', 'Aylık 20K+ aktif kullanıcıya ulaşan 4 özelliği yayına aldı.'],
    },
  },
  {
    slug: 'frontend-developer',
    roleName: { en: 'Frontend Developer', tr: 'Frontend Geliştirici' },
    summary: {
      en: 'Showcase interface quality, performance improvements, and collaboration with design/product teams.',
      tr: 'Arayüz kalitesini, performans iyileştirmelerini ve tasarım/ürün ekipleriyle iş birliğini öne çıkar.',
    },
    coreSkills: {
      en: ['React', 'Next.js', 'TypeScript', 'Accessibility', 'Performance', 'UI Testing'],
      tr: ['React', 'Next.js', 'TypeScript', 'Erişilebilirlik', 'Performans', 'UI Testleri'],
    },
    achievementIdeas: {
      en: ['Raised Lighthouse performance score from 68 to 93.', 'Reduced page load time by 1.8 seconds on key flows.', 'Implemented a reusable component system used across 12 screens.'],
      tr: ['Lighthouse performans skorunu 68’den 93’e yükseltti.', 'Kritik akışlarda sayfa yüklenme süresini 1.8 saniye azalttı.', '12 ekranda kullanılan tekrar kullanılabilir bileşen sistemi kurdu.'],
    },
  },
  {
    slug: 'backend-developer',
    roleName: { en: 'Backend Developer', tr: 'Backend Geliştirici' },
    summary: {
      en: 'Focus on scalability, reliability, and data integrity outcomes for backend systems.',
      tr: 'Backend sistemlerinde ölçeklenebilirlik, güvenilirlik ve veri bütünlüğü çıktılarının altını çiz.',
    },
    coreSkills: {
      en: ['Node.js', 'SQL', 'Distributed Systems', 'Caching', 'Observability', 'Security'],
      tr: ['Node.js', 'SQL', 'Dağıtık Sistemler', 'Cache', 'Gözlemlenebilirlik', 'Güvenlik'],
    },
    achievementIdeas: {
      en: ['Cut failed background jobs by 42% with retry strategy.', 'Designed event-driven pipeline processing 3M records/day.', 'Improved API uptime to 99.95% with monitoring and alerting.'],
      tr: ['Yeniden deneme stratejisiyle başarısız arka plan işleri %42 azaldı.', 'Günde 3M kayıt işleyen event-driven pipeline tasarladı.', 'İzleme ve alarm altyapısıyla API uptime’ını %99.95’e çıkardı.'],
    },
  },
  {
    slug: 'data-analyst',
    roleName: { en: 'Data Analyst', tr: 'Veri Analisti' },
    summary: {
      en: 'Emphasize business decisions influenced by analysis, dashboards, and reporting automation.',
      tr: 'Analiz çıktılarının iş kararlarına etkisini, dashboard ve raporlama otomasyonunu vurgula.',
    },
    coreSkills: {
      en: ['SQL', 'Python', 'Power BI', 'A/B Testing', 'Data Cleaning', 'Stakeholder Reporting'],
      tr: ['SQL', 'Python', 'Power BI', 'A/B Testi', 'Veri Temizleme', 'Paydaş Raporlama'],
    },
    achievementIdeas: {
      en: ['Automated weekly reporting and saved 6 analyst hours/week.', 'Identified funnel leak that improved conversion by 11%.', 'Built dashboard used by 5 teams for planning decisions.'],
      tr: ['Haftalık raporlamayı otomatikleştirerek haftada 6 saat kazandırdı.', 'Dönüşümü %11 artıran funnel kaybını tespit etti.', '5 ekibin planlama kararlarında kullandığı dashboard geliştirdi.'],
    },
  },
  {
    slug: 'product-manager',
    roleName: { en: 'Product Manager', tr: 'Ürün Yöneticisi' },
    summary: {
      en: 'Show roadmap ownership, user impact, and cross-functional execution with measurable outcomes.',
      tr: 'Yol haritası sahipliği, kullanıcı etkisi ve ekipler arası yürütmeyi ölçülebilir çıktılarla göster.',
    },
    coreSkills: {
      en: ['Roadmapping', 'User Research', 'Prioritization', 'Experimentation', 'Stakeholder Management', 'Analytics'],
      tr: ['Yol Haritası', 'Kullanıcı Araştırması', 'Önceliklendirme', 'Deney Tasarımı', 'Paydaş Yönetimi', 'Analitik'],
    },
    achievementIdeas: {
      en: ['Launched onboarding redesign that reduced churn by 8%.', 'Prioritized backlog that accelerated release cadence by 25%.', 'Improved activation rate by 14% through experiment-led iterations.'],
      tr: ['Onboarding yeniden tasarımıyla churn oranını %8 düşürdü.', 'Backlog önceliklendirmesiyle release hızını %25 artırdı.', 'Deney odaklı iterasyonlarla aktivasyon oranını %14 yükseltti.'],
    },
  },
  {
    slug: 'project-manager',
    roleName: { en: 'Project Manager', tr: 'Proje Yöneticisi' },
    summary: {
      en: 'Demonstrate planning discipline, delivery predictability, and risk management in complex initiatives.',
      tr: 'Karmaşık projelerde planlama disiplini, teslim öngörülebilirliği ve risk yönetimini göster.',
    },
    coreSkills: {
      en: ['Project Planning', 'Risk Management', 'Agile Delivery', 'Budget Tracking', 'Vendor Coordination', 'Communication'],
      tr: ['Proje Planlama', 'Risk Yönetimi', 'Çevik Teslim', 'Bütçe Takibi', 'Tedarikçi Koordinasyonu', 'İletişim'],
    },
    achievementIdeas: {
      en: ['Delivered a 9-month project 3 weeks ahead of schedule.', 'Reduced project budget variance from 18% to 6%.', 'Implemented risk tracking cadence across 4 concurrent workstreams.'],
      tr: ['9 aylık projeyi planlanandan 3 hafta önce teslim etti.', 'Bütçe sapmasını %18’den %6’ya düşürdü.', '4 eşzamanlı iş akışında düzenli risk takip modeli kurdu.'],
    },
  },
  {
    slug: 'marketing-manager',
    roleName: { en: 'Marketing Manager', tr: 'Pazarlama Yöneticisi' },
    summary: {
      en: 'Highlight campaign ROI, channel strategy, and growth metrics tied to revenue outcomes.',
      tr: 'Kampanya ROI’si, kanal stratejisi ve gelir etkili büyüme metriklerini öne çıkar.',
    },
    coreSkills: {
      en: ['Campaign Strategy', 'SEO', 'Paid Media', 'Lifecycle Marketing', 'Analytics', 'Conversion Optimization'],
      tr: ['Kampanya Stratejisi', 'SEO', 'Ücretli Medya', 'Yaşam Döngüsü Pazarlama', 'Analitik', 'Dönüşüm Optimizasyonu'],
    },
    achievementIdeas: {
      en: ['Increased inbound leads by 38% in two quarters.', 'Lowered CAC by 19% through channel mix optimization.', 'Improved email conversion by 27% with lifecycle segmentation.'],
      tr: ['İki çeyrekte inbound lead sayısını %38 artırdı.', 'Kanal karması optimizasyonuyla CAC’i %19 düşürdü.', 'Segmentasyon ile e-posta dönüşümünü %27 yükseltti.'],
    },
  },
  {
    slug: 'sales-manager',
    roleName: { en: 'Sales Manager', tr: 'Satış Yöneticisi' },
    summary: {
      en: 'Present quota performance, pipeline health, and team coaching impact with numbers.',
      tr: 'Kota performansı, pipeline sağlığı ve ekip koçluğu etkisini sayılarla sun.',
    },
    coreSkills: {
      en: ['Quota Management', 'Pipeline Forecasting', 'Negotiation', 'CRM', 'Team Coaching', 'Account Growth'],
      tr: ['Kota Yönetimi', 'Pipeline Tahmini', 'Müzakere', 'CRM', 'Ekip Koçluğu', 'Hesap Büyütme'],
    },
    achievementIdeas: {
      en: ['Exceeded annual quota by 121%.', 'Increased win rate from 23% to 31%.', 'Coached 6 reps and raised team attainment by 17%.'],
      tr: ['Yıllık kotayı %121 ile aştı.', 'Kazanma oranını %23’ten %31’e çıkardı.', '6 temsilciye koçluk vererek ekip başarısını %17 artırdı.'],
    },
  },
  {
    slug: 'business-analyst',
    roleName: { en: 'Business Analyst', tr: 'İş Analisti' },
    summary: {
      en: 'Show requirements clarity, process redesign impact, and stakeholder alignment outcomes.',
      tr: 'Gereksinim netliği, süreç yeniden tasarım etkisi ve paydaş hizalaması çıktıları göster.',
    },
    coreSkills: {
      en: ['Requirement Gathering', 'Process Mapping', 'Documentation', 'Stakeholder Workshops', 'UAT', 'Data Analysis'],
      tr: ['Gereksinim Toplama', 'Süreç Haritalama', 'Dokümantasyon', 'Paydaş Atölyeleri', 'UAT', 'Veri Analizi'],
    },
    achievementIdeas: {
      en: ['Reduced requirement defects by 40% with improved discovery process.', 'Mapped and redesigned 7 workflows to shorten cycle time by 22%.', 'Coordinated UAT for enterprise rollout with 0 critical defects at launch.'],
      tr: ['Keşif sürecini iyileştirerek gereksinim hatalarını %40 azalttı.', '7 iş akışını yeniden tasarlayarak çevrim süresini %22 kısalttı.', 'Kurumsal yayında UAT sürecini yönetip kritik hata olmadan canlıya çıktı.'],
    },
  },
  {
    slug: 'customer-service-representative',
    roleName: { en: 'Customer Service Representative', tr: 'Müşteri Temsilcisi' },
    summary: {
      en: 'Focus on resolution speed, satisfaction metrics, and process improvements across support channels.',
      tr: 'Çözüm hızı, memnuniyet metrikleri ve destek süreç iyileştirmelerine odaklan.',
    },
    coreSkills: {
      en: ['Ticket Resolution', 'Customer Communication', 'CRM', 'Conflict Management', 'Escalation Handling', 'Service Quality'],
      tr: ['Talep Çözümü', 'Müşteri İletişimi', 'CRM', 'Çatışma Yönetimi', 'Eskalasyon Yönetimi', 'Hizmet Kalitesi'],
    },
    achievementIdeas: {
      en: ['Raised CSAT from 82% to 91% in 6 months.', 'Reduced average first response time by 45%.', 'Created macro library that improved agent throughput by 20%.'],
      tr: ['CSAT oranını 6 ayda %82’den %91’e çıkardı.', 'Ortalama ilk yanıt süresini %45 düşürdü.', 'Makro kütüphanesiyle temsilci verimini %20 artırdı.'],
    },
  },
  {
    slug: 'graphic-designer',
    roleName: { en: 'Graphic Designer', tr: 'Grafik Tasarımcı' },
    summary: {
      en: 'Demonstrate brand consistency, campaign contribution, and measurable creative output.',
      tr: 'Marka tutarlılığı, kampanya katkısı ve ölçülebilir yaratıcı çıktıları göster.',
    },
    coreSkills: {
      en: ['Adobe Creative Suite', 'Brand Systems', 'Layout Design', 'Visual Storytelling', 'Print Production', 'Collaboration'],
      tr: ['Adobe Creative Suite', 'Marka Sistemleri', 'Yerleşim Tasarımı', 'Görsel Hikayeleme', 'Baskı Üretimi', 'İş Birliği'],
    },
    achievementIdeas: {
      en: ['Delivered 120+ campaign assets with 98% on-time rate.', 'Redesigned social templates and increased engagement by 24%.', 'Built brand guideline pack adopted across 3 business units.'],
      tr: ['%98 zamanında teslim oranıyla 120+ kampanya görseli üretti.', 'Sosyal şablonları yenileyerek etkileşimi %24 artırdı.', '3 iş biriminde kullanılan marka rehberi oluşturdu.'],
    },
  },
  {
    slug: 'ux-designer',
    roleName: { en: 'UX Designer', tr: 'UX Tasarımcı' },
    summary: {
      en: 'Show user research rigor, usability improvements, and collaboration with product and engineering.',
      tr: 'Kullanıcı araştırması disiplini, kullanılabilirlik iyileştirmeleri ve ekip iş birliğini göster.',
    },
    coreSkills: {
      en: ['User Research', 'Wireframing', 'Interaction Design', 'Usability Testing', 'Design Systems', 'Prototyping'],
      tr: ['Kullanıcı Araştırması', 'Wireframe', 'Etkileşim Tasarımı', 'Kullanılabilirlik Testi', 'Tasarım Sistemleri', 'Prototipleme'],
    },
    achievementIdeas: {
      en: ['Improved checkout completion by 16% after usability study.', 'Reduced navigation drop-off by 21% with IA redesign.', 'Built component standards adopted by design and frontend teams.'],
      tr: ['Kullanılabilirlik çalışması sonrası checkout tamamlama oranını %16 artırdı.', 'Bilgi mimarisi revizyonuyla navigasyon terk oranını %21 düşürdü.', 'Tasarım ve frontend ekiplerinde kullanılan bileşen standartları oluşturdu.'],
    },
  },
  {
    slug: 'registered-nurse',
    roleName: { en: 'Registered Nurse', tr: 'Hemşire' },
    summary: {
      en: 'Present patient-care outcomes, clinical competencies, and compliance with care protocols.',
      tr: 'Hasta bakım çıktıları, klinik yetkinlikler ve bakım protokollerine uyumu öne çıkar.',
    },
    coreSkills: {
      en: ['Patient Care', 'Clinical Documentation', 'Medication Administration', 'Care Coordination', 'Emergency Response', 'Communication'],
      tr: ['Hasta Bakımı', 'Klinik Dokümantasyon', 'İlaç Uygulama', 'Bakım Koordinasyonu', 'Acil Müdahale', 'İletişim'],
    },
    achievementIdeas: {
      en: ['Maintained 100% compliance with medication safety checks.', 'Improved patient discharge readiness process across ward team.', 'Supported high-volume unit with stable care quality metrics.'],
      tr: ['İlaç güvenliği kontrollerinde %100 uyum sağladı.', 'Servis ekibinde taburculuk hazırlık sürecini iyileştirdi.', 'Yoğun birimde bakım kalitesi metriklerini istikrarlı şekilde korudu.'],
    },
  },
  {
    slug: 'teacher',
    roleName: { en: 'Teacher', tr: 'Öğretmen' },
    summary: {
      en: 'Highlight classroom outcomes, curriculum planning, and measurable student progress.',
      tr: 'Sınıf çıktıları, müfredat planlaması ve ölçülebilir öğrenci gelişimini vurgula.',
    },
    coreSkills: {
      en: ['Curriculum Planning', 'Classroom Management', 'Assessment Design', 'Parent Communication', 'Student Engagement', 'Differentiated Instruction'],
      tr: ['Müfredat Planlama', 'Sınıf Yönetimi', 'Ölçme-Değerlendirme', 'Veli İletişimi', 'Öğrenci Katılımı', 'Farklılaştırılmış Öğretim'],
    },
    achievementIdeas: {
      en: ['Raised average class performance by 12% over one term.', 'Designed project-based module adopted across grade level.', 'Improved attendance consistency with engagement interventions.'],
      tr: ['Bir dönem içinde sınıf ortalamasını %12 artırdı.', 'Sınıf düzeyinde uygulanan proje tabanlı modül tasarladı.', 'Katılım odaklı müdahalelerle devamlılık oranını iyileştirdi.'],
    },
  },
  {
    slug: 'accountant',
    roleName: { en: 'Accountant', tr: 'Muhasebeci' },
    summary: {
      en: 'Focus on reporting accuracy, compliance, and process efficiency improvements.',
      tr: 'Raporlama doğruluğu, mevzuat uyumu ve süreç verimliliği kazanımlarına odaklan.',
    },
    coreSkills: {
      en: ['Financial Reporting', 'Reconciliation', 'Tax Compliance', 'ERP Systems', 'Audit Support', 'Process Controls'],
      tr: ['Finansal Raporlama', 'Mutabakat', 'Vergi Uyum', 'ERP Sistemleri', 'Denetim Desteği', 'Süreç Kontrolü'],
    },
    achievementIdeas: {
      en: ['Reduced month-end close cycle from 8 days to 5 days.', 'Improved reconciliation accuracy to 99.8%.', 'Prepared audit documentation with zero major findings.'],
      tr: ['Ay sonu kapanış süresini 8 günden 5 güne indirdi.', 'Mutabakat doğruluğunu %99.8 seviyesine taşıdı.', 'Büyük bulgu olmadan denetim dokümantasyonu hazırladı.'],
    },
  },
  {
    slug: 'human-resources-specialist',
    roleName: { en: 'Human Resources Specialist', tr: 'İK Uzmanı' },
    summary: {
      en: 'Emphasize hiring throughput, onboarding quality, and employee experience outcomes.',
      tr: 'İşe alım hızı, onboarding kalitesi ve çalışan deneyimi çıktılarının altını çiz.',
    },
    coreSkills: {
      en: ['Recruitment', 'Onboarding', 'HRIS', 'Policy Management', 'Employee Relations', 'People Analytics'],
      tr: ['İşe Alım', 'Onboarding', 'HRIS', 'Politika Yönetimi', 'Çalışan İlişkileri', 'People Analytics'],
    },
    achievementIdeas: {
      en: ['Reduced time-to-hire by 26% with structured pipeline.', 'Improved new-hire 90-day retention by 13%.', 'Implemented onboarding checklist used company-wide.'],
      tr: ['Yapılandırılmış pipeline ile işe alım süresini %26 kısalttı.', '90 günlük yeni çalışan tutundurma oranını %13 artırdı.', 'Şirket genelinde kullanılan onboarding kontrol listesi kurdu.'],
    },
  },
  {
    slug: 'operations-manager',
    roleName: { en: 'Operations Manager', tr: 'Operasyon Yöneticisi' },
    summary: {
      en: 'Show operational efficiency, cost control, and cross-team process reliability gains.',
      tr: 'Operasyonel verimlilik, maliyet kontrolü ve süreç güvenilirliği kazanımlarını göster.',
    },
    coreSkills: {
      en: ['Process Improvement', 'KPI Management', 'Resource Planning', 'Vendor Management', 'Cost Optimization', 'SOP Design'],
      tr: ['Süreç İyileştirme', 'KPI Yönetimi', 'Kaynak Planlama', 'Tedarikçi Yönetimi', 'Maliyet Optimizasyonu', 'SOP Tasarımı'],
    },
    achievementIdeas: {
      en: ['Reduced operating cost by 14% while maintaining SLA targets.', 'Standardized SOPs across 5 teams and lowered error rate by 29%.', 'Improved fulfillment cycle time by 18%.'],
      tr: ['SLA hedeflerini koruyarak operasyon maliyetini %14 düşürdü.', '5 ekipte SOP standardı kurup hata oranını %29 azalttı.', 'Operasyon çevrim süresini %18 iyileştirdi.'],
    },
  },
  {
    slug: 'office-manager',
    roleName: { en: 'Office Manager', tr: 'Ofis Yöneticisi' },
    summary: {
      en: 'Present organization, budget coordination, and administrative reliability in daily operations.',
      tr: 'Günlük operasyonlarda organizasyon, bütçe koordinasyonu ve idari güvenilirliği göster.',
    },
    coreSkills: {
      en: ['Administrative Operations', 'Scheduling', 'Procurement', 'Budget Tracking', 'Vendor Coordination', 'Internal Communication'],
      tr: ['İdari Operasyonlar', 'Takvim Yönetimi', 'Satın Alma', 'Bütçe Takibi', 'Tedarikçi Koordinasyonu', 'İç İletişim'],
    },
    achievementIdeas: {
      en: ['Improved procurement cycle speed by 30%.', 'Reduced office supply spend by 17% through vendor negotiations.', 'Standardized admin workflows and reduced approval delays.'],
      tr: ['Satın alma çevrim hızını %30 iyileştirdi.', 'Tedarikçi görüşmeleriyle ofis giderlerini %17 azalttı.', 'İdari iş akışlarını standartlaştırarak onay gecikmelerini düşürdü.'],
    },
  },
];

export const PROGRAMMATIC_CATEGORY_SEGMENTS = {
  en: 'resume-examples',
  tr: 'cv-ornekleri',
} as const;

export function getProfessionBySlug(slug: string): ProfessionSeed | undefined {
  return professionSeeds.find((item) => item.slug === slug);
}

export function getProfessionPath(locale: Locale, slug: string): string {
  return localizedPath(locale, `${PROGRAMMATIC_CATEGORY_SEGMENTS[locale]}/${slug}`);
}

export function getProfessionStaticParams() {
  return professionSeeds.flatMap((item) => [
    { locale: 'en', profession: item.slug },
    { locale: 'tr', profession: item.slug },
  ]);
}

export function getProfessionListPath(locale: Locale): string {
  return localizedPath(locale, PROGRAMMATIC_CATEGORY_SEGMENTS[locale]);
}
