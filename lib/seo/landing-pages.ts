import { localizedPath } from '@/lib/seo/config';

export type SeoLandingKey =
  | 'resume-builder'
  | 'cv-builder'
  | 'free-builder'
  | 'online-builder'
  | 'ats-builder'
  | 'ai-builder'
  | 'maker'
  | 'preparation'
  | 'templates'
  | 'cover-letter'
  | 'cover-letter-writing';

export interface SeoLandingSection {
  title: string;
  body: string;
}

export interface SeoLandingFaq {
  question: string;
  answer: string;
}

export interface SeoLandingPage {
  key: SeoLandingKey;
  slug: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  primaryKeyword: string;
  secondaryKeywords: string[];
  searchIntent: string;
  ctaLabel: string;
  ctaHref: string;
  sections: SeoLandingSection[];
  faq: SeoLandingFaq[];
}

export const seoLandingPages: SeoLandingPage[] = [
  {
    key: 'resume-builder',
    locale: 'en',
    slug: 'resume-builder',
    title: 'Resume Builder for ATS-Friendly Applications',
    description: 'Build and preview a professional resume for free, then pay only when you export PDF.',
    h1: 'Resume Builder That Balances Speed and Quality',
    intro:
      'Create a focused resume, customize it for each role, and export a recruiter-ready PDF only when you decide to buy export credits.',
    primaryKeyword: 'resume builder',
    secondaryKeywords: ['online resume builder', 'ats resume builder', 'free resume builder'],
    searchIntent: 'Create a high-quality resume online without paying upfront.',
    ctaLabel: 'Start Building Free',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Build Free, Preview Free, Export When Needed',
        body: 'Draft and preview your resume at no cost. You only pay at the final export step, so you can iterate without pressure.',
      },
      {
        title: 'Structured for ATS Parsing',
        body: 'Sections, headings, and formatting are optimized for applicant tracking systems while remaining readable for recruiters.',
      },
      {
        title: 'Customize Per Job Description',
        body: 'Adjust keywords and achievements to each posting so your resume reflects role-specific relevance instead of generic content.',
      },
    ],
    faq: [
      {
        question: 'Is this resume builder free to use?',
        answer: 'Yes. Building and previewing are free. Payment is only required for PDF export.',
      },
      {
        question: 'Can I edit my resume after creating it?',
        answer: 'Yes. You can return and refine sections before exporting.',
      },
      {
        question: 'Does this builder support ATS-friendly formatting?',
        answer: 'Yes. The editor uses ATS-safe structure and readable layout defaults.',
      },
    ],
  },
  {
    key: 'resume-builder',
    locale: 'tr',
    slug: 'cv-olustur',
    title: 'CV Oluştur: ATS Uyumlu ve Hızlı CV Builder',
    description: 'CV’ni ücretsiz oluştur, ücretsiz önizle, sadece PDF export alırken ödeme yap.',
    h1: 'ATS Uyumlu CV Oluşturmayı Kolaylaştıran Sistem',
    intro:
      'İlana göre özelleştirebileceğin, hızlı düzenleyebileceğin ve yalnızca export aşamasında ücret ödeyeceğin pratik bir CV oluşturma deneyimi.',
    primaryKeyword: 'cv oluştur',
    secondaryKeywords: ['online cv oluştur', 'ücretsiz cv oluştur', 'cv oluşturucu'],
    searchIntent: 'Ücretsiz başlayıp profesyonel CV hazırlamak.',
    ctaLabel: 'Ücretsiz CV Oluştur',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Ücretsiz Başla, Ücretsiz Önizle',
        body: 'CV hazırlama ve önizleme ücretsizdir. Ücretlendirme yalnızca PDF export aşamasında devreye girer.',
      },
      {
        title: 'ATS Dostu Yapı',
        body: 'Başlıklar ve bölüm sıralaması ATS sistemlerinin okuyabileceği sade bir düzende sunulur.',
      },
      {
        title: 'İlana Göre İçerik Uyarlama',
        body: 'Her başvuruda anahtar kelime ve deneyim anlatımını rol beklentisine göre hızlıca güncelleyebilirsin.',
      },
    ],
    faq: [
      {
        question: 'CV oluşturmak gerçekten ücretsiz mi?',
        answer: 'Evet. Oluşturma ve önizleme ücretsizdir, sadece export sırasında ödeme yapılır.',
      },
      {
        question: 'Sonradan düzenleme yapabilir miyim?',
        answer: 'Evet. CV içeriğini istediğin zaman güncelleyebilirsin.',
      },
      {
        question: 'ATS uyumlu bir format sunuyor mu?',
        answer: 'Evet. Sistem ATS için uygun ve işe alım uzmanları için okunabilir bir yapı kullanır.',
      },
    ],
  },
  {
    key: 'cv-builder',
    locale: 'en',
    slug: 'cv-builder',
    title: 'CV Builder for International Job Applications',
    description: 'Create a modern CV online, tailor sections for each role, and export a clean PDF when ready.',
    h1: 'CV Builder for Practical, Role-Focused Applications',
    intro: 'Build an application-ready CV with clear sections, measurable achievements, and ATS-safe formatting.',
    primaryKeyword: 'cv builder',
    secondaryKeywords: ['cv maker', 'online cv builder', 'ats cv builder'],
    searchIntent: 'Create a professional CV quickly for job applications.',
    ctaLabel: 'Create CV Free',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Keep Your CV Focused',
        body: 'Use concise summaries and impact-driven bullets that show outcomes instead of generic responsibilities.',
      },
      {
        title: 'Write for Recruiters and ATS',
        body: 'Readable typography and predictable section structures improve both scanability and parser accuracy.',
      },
      {
        title: 'Export Professional PDF',
        body: 'Finalize your CV only when it is ready and pay only at export.',
      },
    ],
    faq: [
      {
        question: 'What is the difference between a CV and a resume?',
        answer: 'The terms vary by region. This builder supports concise, job-focused documents for modern applications.',
      },
      {
        question: 'Can I create multiple versions?',
        answer: 'Yes. You can adapt your CV per role and keep different drafts.',
      },
      {
        question: 'Can I preview before paying?',
        answer: 'Yes. Preview is free and unlimited.',
      },
    ],
  },
  {
    key: 'cv-builder',
    locale: 'tr',
    slug: 'cv-olusturucu',
    title: 'CV Oluşturucu: Hızlı ve Düzenlenebilir Online CV',
    description: 'Online CV oluşturucu ile CV’ni dakikalar içinde hazırla, ücretsiz önizle ve gerektiğinde export al.',
    h1: 'CV Oluşturucu ile Başvuruya Hazır CV',
    intro:
      'Karmaşık tasarımlarla uğraşmadan düzenli, okunabilir ve ATS tarafından anlaşılır bir CV oluştur.',
    primaryKeyword: 'cv oluşturucu',
    secondaryKeywords: ['online cv oluştur', 'cv maker', 'cv hazırlama'],
    searchIntent: 'Online bir araçla hızlı ve düzenli CV hazırlamak.',
    ctaLabel: 'CV Oluşturmaya Başla',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Düzenli Bölüm Yapısı',
        body: 'Deneyim, eğitim ve yetkinlik blokları net bir akışla sunulur; işe alım uzmanı önemli bilgiyi hızlıca görür.',
      },
      {
        title: 'Kolay Güncelleme',
        body: 'Başvurudan önce metinleri değiştirip farklı şirketler için birden fazla sürüm oluşturabilirsin.',
      },
      {
        title: 'Ödeme Modeli Şeffaf',
        body: 'Oluşturma ve önizleme ücretsiz, ödeme sadece export aşamasında yapılır.',
      },
    ],
    faq: [
      {
        question: 'CV oluşturucu ücretsiz mi?',
        answer: 'Evet. Oluşturma ve önizleme ücretsizdir.',
      },
      {
        question: 'İş ilanına göre CV düzenleyebilir miyim?',
        answer: 'Evet. Anahtar kelime ve başarı metriklerini ilana göre düzenleyebilirsin.',
      },
      {
        question: 'PDF çıktısı alabiliyor muyum?',
        answer: 'Evet. Son aşamada export alarak PDF indirebilirsin.',
      },
    ],
  },
  {
    key: 'free-builder',
    locale: 'en',
    slug: 'free-resume-builder',
    title: 'Free Resume Builder: Build First, Pay on Export',
    description: 'Use a free resume builder workflow with unlimited previews and pay only when you export PDF.',
    h1: 'Free Resume Builder With No Upfront Lock-In',
    intro: 'Test templates, improve your content, and finalize only when your resume is ready to send.',
    primaryKeyword: 'free resume builder',
    secondaryKeywords: ['resume builder free', 'resume maker', 'build resume online'],
    searchIntent: 'Find a truly free way to create and preview resumes before paying.',
    ctaLabel: 'Build Resume Free',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'No Payment Before Value',
        body: 'You can complete drafting and previewing without a card. Payment is tied only to final export.',
      },
      {
        title: 'Job-Specific Revisions Included',
        body: 'Adjust wording and keywords for each opportunity before deciding to export.',
      },
      {
        title: 'Cleaner Conversion Path',
        body: 'Free creation flow lowers friction and helps applicants ship better final resumes.',
      },
    ],
    faq: [
      {
        question: 'Do I need to pay to start?',
        answer: 'No. You can start, edit, and preview for free.',
      },
      {
        question: 'Is there a free preview?',
        answer: 'Yes. Preview is available without payment.',
      },
      {
        question: 'When do I pay?',
        answer: 'Only when you choose to export your resume as PDF.',
      },
    ],
  },
  {
    key: 'free-builder',
    locale: 'tr',
    slug: 'ucretsiz-cv-olustur',
    title: 'Ücretsiz CV Oluştur ve Önizle',
    description: 'Ücretsiz CV oluştur, düzenle ve önizle. PDF export almak istediğinde ödeme yap.',
    h1: 'Ücretsiz CV Oluşturma Süreci',
    intro: 'Önce CV’ni tamamla, sonra export gerektiğinde ödeme yaparak süreci kontrol altında tut.',
    primaryKeyword: 'ücretsiz cv oluştur',
    secondaryKeywords: ['cv oluştur', 'online cv oluştur', 'cv hazırlama sitesi'],
    searchIntent: 'Masraf yapmadan CV hazırlamaya başlamak.',
    ctaLabel: 'Ücretsiz Başla',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Başlangıç Maliyeti Yok',
        body: 'CV oluşturma, düzenleme ve önizleme aşamalarında ödeme gerekmez.',
      },
      {
        title: 'İlan Bazlı Revize İmkanı',
        body: 'Aynı CV’yi farklı ilanlara göre optimize ederek daha isabetli başvurular yapabilirsin.',
      },
      {
        title: 'Sadece Son Adımda Ödeme',
        body: 'PDF export almak istediğinde ödeme yaparsın, böylece gereksiz harcama olmaz.',
      },
    ],
    faq: [
      {
        question: 'Ücretsiz kullanımda sınır var mı?',
        answer: 'CV oluşturma ve önizleme ücretsizdir; export aşaması ücretlidir.',
      },
      {
        question: 'Önizleme ücretsiz mi?',
        answer: 'Evet, ücretsizdir.',
      },
      {
        question: 'Ödeme ne zaman alınır?',
        answer: 'Sadece PDF export almak istediğinde.',
      },
    ],
  },
  {
    key: 'online-builder',
    locale: 'en',
    slug: 'online-resume-builder',
    title: 'Online Resume Builder for Fast Customization',
    description: 'Build and edit your resume online from any device with ATS-safe sections and PDF export.',
    h1: 'Online Resume Builder for Real Job Workflows',
    intro: 'Use a browser-based editor to create, revise, and optimize resumes without installing software.',
    primaryKeyword: 'online resume builder',
    secondaryKeywords: ['resume builder', 'resume maker', 'resume builder online'],
    searchIntent: 'Create and edit resumes online from anywhere.',
    ctaLabel: 'Use Online Builder',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Work From Anywhere',
        body: 'Access your draft in the browser and keep your job-search workflow lightweight.',
      },
      {
        title: 'Keep Edits Structured',
        body: 'Content blocks encourage concise writing and consistent quality across sections.',
      },
      {
        title: 'Export When Application-Ready',
        body: 'Only pay once you are satisfied and ready to submit your resume.',
      },
    ],
    faq: [
      {
        question: 'Can I use this on mobile or desktop?',
        answer: 'Yes. It is web-based and works across devices.',
      },
      {
        question: 'Do I need design skills?',
        answer: 'No. Layout defaults are handled for you.',
      },
      {
        question: 'Can I tailor by job posting?',
        answer: 'Yes. You can revise keywords and bullets per role.',
      },
    ],
  },
  {
    key: 'online-builder',
    locale: 'tr',
    slug: 'online-cv-olustur',
    title: 'Online CV Oluştur: Web Tabanlı CV Builder',
    description: 'Tarayıcı üzerinden online CV oluştur, düzenle, önizle ve hazır olduğunda PDF export al.',
    h1: 'Online CV Oluşturma ve Düzenleme',
    intro: 'Kurulum gerektirmeyen web tabanlı araç ile CV hazırlama sürecini hızlandır.',
    primaryKeyword: 'online cv oluştur',
    secondaryKeywords: ['cv oluşturucu', 'cv hazırlama', 'cv hazırlama sitesi'],
    searchIntent: 'Tarayıcı üzerinden hızlı şekilde CV hazırlamak.',
    ctaLabel: 'Online CV Oluştur',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Her Yerden Erişim',
        body: 'Bilgisayar veya mobil fark etmeksizin CV düzenleme sürecini tek panelde yönetebilirsin.',
      },
      {
        title: 'Başvuru Odaklı İçerik',
        body: 'Bölüm yapısı, işe alım ekiplerinin hızlıca değerlendirme yapmasına yardımcı olur.',
      },
      {
        title: 'Hazır Olduğunda Export',
        body: 'İçerik tamamlandığında PDF export ile başvuru dosyanı tamamlayabilirsin.',
      },
    ],
    faq: [
      {
        question: 'Online CV oluşturma ücretsiz mi?',
        answer: 'Evet. Oluşturma ve önizleme ücretsizdir.',
      },
      {
        question: 'Program kurmak gerekiyor mu?',
        answer: 'Hayır. Tarayıcı üzerinden çalışır.',
      },
      {
        question: 'CV’yi sonradan düzenleyebilir miyim?',
        answer: 'Evet. Dilediğin zaman içerik güncellemesi yapabilirsin.',
      },
    ],
  },
  {
    key: 'ats-builder',
    locale: 'en',
    slug: 'ats-resume-builder',
    title: 'ATS Resume Builder With Keyword Guidance',
    description: 'Create an ATS-friendly resume with clear structure, keyword alignment, and practical editing workflows.',
    h1: 'ATS Resume Builder for Better Match Quality',
    intro:
      'Build a resume that remains readable for humans while preserving the structure and keyword clarity needed for ATS systems.',
    primaryKeyword: 'ats resume builder',
    secondaryKeywords: ['ats-friendly resume', 'resume keyword optimization', 'resume checker'],
    searchIntent: 'Build a resume that passes ATS parsing and relevance checks.',
    ctaLabel: 'Build ATS Resume',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'ATS-Safe Formatting Defaults',
        body: 'Avoid complex visual layouts that break parsing and reduce match accuracy.',
      },
      {
        title: 'Keyword Relevance Without Stuffing',
        body: 'Align terms with the job description naturally so your resume stays credible.',
      },
      {
        title: 'Consistent Review Workflow',
        body: 'Run a final check on headings, chronology, and skill relevance before export.',
      },
    ],
    faq: [
      {
        question: 'What makes a resume ATS-friendly?',
        answer: 'Clear section labels, standard formatting, and role-relevant language.',
      },
      {
        question: 'Can I overuse keywords?',
        answer: 'Yes. Keyword stuffing can hurt readability. Use terms where context justifies them.',
      },
      {
        question: 'Does ATS formatting mean boring design?',
        answer: 'No. You can stay professional and readable while keeping parser-safe structure.',
      },
    ],
  },
  {
    key: 'ats-builder',
    locale: 'tr',
    slug: 'ats-cv-olusturucu',
    title: 'ATS CV Oluşturucu ile Uyumlu CV Hazırlama',
    description: 'ATS uyumlu CV oluşturucu ile doğru bölüm yapısı ve ilan odaklı anahtar kelime dengesi kur.',
    h1: 'ATS CV Oluşturucu ile Daha Uyumlu Başvurular',
    intro:
      'CV’nin hem ATS sistemleri tarafından okunabilir hem de işe alım uzmanı için anlaşılır kalmasını sağlayan düzenli bir yaklaşım.',
    primaryKeyword: 'ats cv oluşturucu',
    secondaryKeywords: ['ats uyumlu cv', 'cv oluşturucu', 'cv hazırlama'],
    searchIntent: 'ATS sistemlerinden daha iyi geçebilecek bir CV hazırlamak.',
    ctaLabel: 'ATS Uyumlu CV Hazırla',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'ATS Uyumlu Bölüm Düzeni',
        body: 'Standart başlıklar ve sade yerleşim ATS analizinde veri kaybını azaltır.',
      },
      {
        title: 'Anahtar Kelime Dengelemesi',
        body: 'İlan terimlerini doğal cümlelerde kullanarak hem uyum hem okunabilirlik korunur.',
      },
      {
        title: 'Son Kontrol Rutini',
        body: 'Export öncesi deneyim, yetkinlik ve kronoloji tutarlılığı gözden geçirilir.',
      },
    ],
    faq: [
      {
        question: 'ATS uyumlu CV ne demek?',
        answer: 'ATS tarafından teknik olarak okunabilen ve role göre anahtar kelime uyumu taşıyan CV demektir.',
      },
      {
        question: 'Anahtar kelimeyi çok yazmak iyi midir?',
        answer: 'Hayır. Aşırı tekrar kaliteyi düşürür, doğal kullanım tercih edilmelidir.',
      },
      {
        question: 'ATS uyumlu CV’de tasarım tamamen yasak mı?',
        answer: 'Hayır. Sade ve okunabilir bir tasarım tercih edilmelidir.',
      },
    ],
  },
  {
    key: 'ai-builder',
    locale: 'en',
    slug: 'ai-resume-builder',
    title: 'AI Resume Builder for ATS-Friendly Job Applications',
    description: 'Use an AI resume builder to draft, optimize, and export ATS-friendly resumes for role-specific applications.',
    h1: 'AI Resume Builder That Focuses on Real Job Relevance',
    intro:
      'Start with AI-assisted drafting, then refine your resume for recruiter clarity and ATS keyword alignment before export.',
    primaryKeyword: 'ai resume builder',
    secondaryKeywords: ['ai cv builder', 'resume ai tool', 'ats resume builder'],
    searchIntent: 'Create a stronger resume faster with AI guidance and ATS-safe structure.',
    ctaLabel: 'Start AI Resume Builder',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'AI Drafting With Human Control',
        body: 'Generate a strong first version quickly, then edit wording and priorities based on the exact role you target.',
      },
      {
        title: 'Keyword Alignment Without Keyword Stuffing',
        body: 'Use AI suggestions to match job-description terms naturally, keeping your resume readable and specific.',
      },
      {
        title: 'Export Only When Ready',
        body: 'Iterate your content for free, then finalize and export when your application narrative is complete.',
      },
    ],
    faq: [
      {
        question: 'Is AI resume builder output enough without editing?',
        answer: 'Not fully. AI gives a strong draft, but role-specific edits improve credibility and outcomes.',
      },
      {
        question: 'Can AI help with ATS keywords?',
        answer: 'Yes. It can surface relevant terms and help you place them in context.',
      },
      {
        question: 'Does AI replace resume strategy?',
        answer: 'No. Your final results still depend on clear achievements and role alignment.',
      },
    ],
  },
  {
    key: 'ai-builder',
    locale: 'tr',
    slug: 'ai-cv-olusturucu',
    title: 'AI CV Oluşturucu ile ATS Uyumlu CV Hazırla',
    description: 'AI CV oluşturucu ile hızlı taslak çıkar, ilan anahtar kelimelerine göre optimize et ve ATS uyumlu CV hazırla.',
    h1: 'AI CV Oluşturucu ile Daha Hızlı ve Uyumlu Başvuru',
    intro:
      'Yapay zeka destekli taslakla başla, ardından rol beklentisine göre metni netleştirerek CV kalitesini yükselt.',
    primaryKeyword: 'ai cv oluşturucu',
    secondaryKeywords: ['yapay zeka cv oluşturucu', 'cv oluşturucu', 'ats uyumlu cv'],
    searchIntent: 'Yapay zeka desteğiyle hızlı ve ATS uyumlu CV oluşturmak.',
    ctaLabel: 'AI CV Oluştur',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Hızlı İlk Taslak',
        body: 'Sıfırdan başlamak yerine AI ile ilk sürümü hızlıca oluşturup düzenleme süresini kısaltabilirsin.',
      },
      {
        title: 'İlan Bazlı Anahtar Kelime Uyumu',
        body: 'İlan metnindeki kritik terimleri doğal cümlelerle kullanarak ATS uyumunu ve okunabilirliği birlikte koruyabilirsin.',
      },
      {
        title: 'Son Karar Sende',
        body: 'AI önerileri başlangıç sağlar; son metin ve ton kontrolüyle CV’ni pozisyona göre güçlendirebilirsin.',
      },
    ],
    faq: [
      {
        question: 'AI CV oluşturucu tamamen otomatik mi?',
        answer: 'Taslak üretimi hızlıdır ancak en iyi sonuç için manuel düzenleme önerilir.',
      },
      {
        question: 'ATS için anahtar kelime desteği verir mi?',
        answer: 'Evet. İlanla uyumlu terimlerin metne doğal şekilde yerleşmesine yardımcı olur.',
      },
      {
        question: 'Yeni mezunlar için uygun mu?',
        answer: 'Evet. Özellikle yapı kurma ve ifade netliği açısından faydalıdır.',
      },
    ],
  },
  {
    key: 'maker',
    locale: 'en',
    slug: 'resume-maker',
    title: 'Resume Maker and CV Maker for Fast Drafting',
    description: 'Use a practical resume maker to draft faster, edit smarter, and export clean ATS-friendly PDFs.',
    h1: 'Resume Maker Designed for Iteration',
    intro: 'Turn rough notes into a complete resume and improve each section with structured editing prompts.',
    primaryKeyword: 'resume maker',
    secondaryKeywords: ['cv maker', 'resume builder', 'online resume builder'],
    searchIntent: 'Find an efficient resume maker that supports multiple revisions.',
    ctaLabel: 'Open Resume Maker',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Draft Quickly',
        body: 'Start with core sections and expand details where recruiters need proof of impact.',
      },
      {
        title: 'Edit With Purpose',
        body: 'Use focused rewrites to improve clarity, measurable outcomes, and relevance.',
      },
      {
        title: 'Publish Confidently',
        body: 'Export only when your final version is ready to submit.',
      },
    ],
    faq: [
      {
        question: 'Is a resume maker different from a resume builder?',
        answer: 'They are often used interchangeably. This page targets users looking for quick resume creation tools.',
      },
      {
        question: 'Can I create CV versions too?',
        answer: 'Yes. The same workflow supports both resume and CV style documents.',
      },
      {
        question: 'Is PDF export included?',
        answer: 'Yes. Export is available when you finalize your draft.',
      },
    ],
  },
  {
    key: 'maker',
    locale: 'tr',
    slug: 'cv-maker',
    title: 'CV Maker ile Hızlı CV Hazırlama',
    description: 'CV maker ile hızlıca taslak oluştur, ilan bazlı düzenle ve hazır olduğunda PDF export al.',
    h1: 'CV Maker ile Hızlı ve Esnek Düzenleme',
    intro: 'Kısa sürede taslak çıkar, ardından bölüm bazlı düzenleme ile CV’ni güçlendir.',
    primaryKeyword: 'cv maker',
    secondaryKeywords: ['cv oluşturucu', 'online cv oluştur', 'cv hazırlama sitesi'],
    searchIntent: 'Pratik bir araçla CV oluşturma ve düzenleme yapmak.',
    ctaLabel: 'CV Maker Aç',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Hızlı Taslak Üret',
        body: 'Temel başlıkları kısa sürede doldurup başvuruya uygun bir ilk sürüm oluştur.',
      },
      {
        title: 'İçeriği Güçlendir',
        body: 'Deneyim maddelerini ölçülebilir sonuçlarla zenginleştir.',
      },
      {
        title: 'Hazır Olduğunda Export',
        body: 'Son kontrolü yaptıktan sonra PDF export ile başvurunu tamamla.',
      },
    ],
    faq: [
      {
        question: 'CV maker ücretsiz mi?',
        answer: 'Oluşturma ve önizleme ücretsizdir.',
      },
      {
        question: 'Farklı pozisyonlar için farklı CV yapabilir miyim?',
        answer: 'Evet. Her ilan için farklı versiyon hazırlayabilirsin.',
      },
      {
        question: 'Export sonrası düzenleme mümkün mü?',
        answer: 'Evet. İçeriği güncelleyip yeniden export alabilirsin.',
      },
    ],
  },
  {
    key: 'preparation',
    locale: 'en',
    slug: 'resume-preparation-guide',
    title: 'Resume Preparation Guide for Better Applications',
    description: 'Plan, write, and review your resume with a structured preparation workflow for real job applications.',
    h1: 'Resume Preparation Workflow That Improves Quality',
    intro: 'Use a repeatable process to define target roles, align keywords, and finalize interview-ready resumes.',
    primaryKeyword: 'resume preparation',
    secondaryKeywords: ['resume writing workflow', 'resume checklist', 'ats resume review'],
    searchIntent: 'Learn how to prepare a stronger resume step by step.',
    ctaLabel: 'Start Preparation',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Define Role Targeting',
        body: 'Start with one role family and tailor your language to relevant responsibilities.',
      },
      {
        title: 'Collect Measurable Achievements',
        body: 'Replace vague descriptions with outcomes, percentages, and project impact.',
      },
      {
        title: 'Run Final ATS and Readability Check',
        body: 'Review chronology, formatting, and keyword relevance before export.',
      },
    ],
    faq: [
      {
        question: 'How long should resume preparation take?',
        answer: 'Initial drafting can be quick, but role-specific refinement is where most quality gains happen.',
      },
      {
        question: 'Should I use one resume for all jobs?',
        answer: 'No. Tailored versions generally perform better.',
      },
      {
        question: 'What is the most common preparation mistake?',
        answer: 'Submitting generic bullets without role-specific language.',
      },
    ],
  },
  {
    key: 'preparation',
    locale: 'tr',
    slug: 'cv-hazirlama',
    title: 'CV Hazırlama Rehberi: Etkili ve ATS Uyumlu',
    description: 'CV hazırlama sürecini adım adım yönet, doğru içerik yapısı kur ve başvuru kalitesini artır.',
    h1: 'CV Hazırlama Sürecini Sistemli Hale Getir',
    intro: 'Hedef rol belirleme, içerik yazımı ve son kontrol adımlarıyla daha güçlü başvurular üret.',
    primaryKeyword: 'cv hazırlama',
    secondaryKeywords: ['cv hazırlama sitesi', 'cv oluştur', 'ats uyumlu cv'],
    searchIntent: 'CV hazırlamayı adım adım öğrenmek ve uygulamak.',
    ctaLabel: 'CV Hazırlamaya Başla',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Hedef Rolü Netleştir',
        body: 'CV içeriğini tek bir rol grubuna odaklayarak daha güçlü bir anlatım elde et.',
      },
      {
        title: 'Ölçülebilir Başarıları Topla',
        body: 'Sorumluluk cümleleri yerine sonuç odaklı metriklerle farkını göster.',
      },
      {
        title: 'ATS ve Okunabilirlik Kontrolü',
        body: 'Başlıklar, kronoloji ve anahtar kelime uyumu export öncesi mutlaka kontrol edilmelidir.',
      },
    ],
    faq: [
      {
        question: 'CV hazırlama sürecinde ilk adım ne olmalı?',
        answer: 'İlk adım, başvuracağın rolü netleştirip içerik tonunu buna göre ayarlamaktır.',
      },
      {
        question: 'Tek CV ile tüm ilanlara başvurmalı mıyım?',
        answer: 'Hayır. İlan bazlı uyarlama daha yüksek dönüş sağlar.',
      },
      {
        question: 'En sık yapılan hata nedir?',
        answer: 'Genel ve ölçümsüz deneyim maddeleri kullanmaktır.',
      },
    ],
  },
  {
    key: 'templates',
    locale: 'en',
    slug: 'resume-templates',
    title: 'Resume Templates That Stay ATS-Friendly',
    description: 'Explore practical resume templates with clean hierarchy and strong readability for ATS and recruiters.',
    h1: 'Resume Templates Built for Hiring Workflows',
    intro: 'Use templates that prioritize clarity, hierarchy, and relevance over visual noise.',
    primaryKeyword: 'resume templates',
    secondaryKeywords: ['cv templates', 'ats resume template', 'professional resume format'],
    searchIntent: 'Find resume templates that look professional and parse correctly.',
    ctaLabel: 'Use a Template',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Template Choice Should Reduce Risk',
        body: 'The right template should avoid parsing errors and help recruiters find key information fast.',
      },
      {
        title: 'Keep Layout Decisions Practical',
        body: 'Consistent spacing, heading structure, and typography improve scan quality.',
      },
      {
        title: 'Pair Templates With Role-Specific Content',
        body: 'Strong formatting alone is not enough. Match your content to the target role.',
      },
    ],
    faq: [
      {
        question: 'Are visual templates better for ATS?',
        answer: 'Not always. Cleaner and standard layouts are usually safer for parsing.',
      },
      {
        question: 'Can I change template later?',
        answer: 'Yes. You can iterate before export.',
      },
      {
        question: 'Do templates guarantee interviews?',
        answer: 'No. Content quality and role alignment are still the core drivers.',
      },
    ],
  },
  {
    key: 'templates',
    locale: 'tr',
    slug: 'cv-sablonlari',
    title: 'CV Şablonları: ATS Dostu ve Profesyonel',
    description: 'CV şablonları ile okunabilir, düzenli ve ATS uyumlu bir başvuru dosyası hazırla.',
    h1: 'CV Şablonları ile Daha Düzenli Başvurular',
    intro: 'Şablon seçimini estetikten çok okunabilirlik ve başvuru performansına göre yap.',
    primaryKeyword: 'cv şablonları',
    secondaryKeywords: ['cv hazırlama', 'ats uyumlu cv', 'cv oluşturucu'],
    searchIntent: 'Profesyonel ve ATS uyumlu CV şablonları bulmak.',
    ctaLabel: 'Şablonla Başla',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Şablon Seçimi Performansı Etkiler',
        body: 'Doğru şablon, işe alım uzmanının kritik bilgileri hızlıca görmesini sağlar.',
      },
      {
        title: 'Sade Yerleşim Daha Güvenlidir',
        body: 'Karmaşık görsel öğeler yerine sade ve düzenli bölüm yapısı tercih edilmelidir.',
      },
      {
        title: 'İçerik Her Zaman Öncelikli',
        body: 'Şablon iyi olsa da sonuç odaklı deneyim yazımı olmadan dönüşüm düşük kalır.',
      },
    ],
    faq: [
      {
        question: 'Her şablon ATS uyumlu mudur?',
        answer: 'Hayır. Standart başlıklar ve sade düzen kullanılan şablonlar daha güvenlidir.',
      },
      {
        question: 'Şablonu sonradan değiştirebilir miyim?',
        answer: 'Evet. Export öncesi değişiklik yapabilirsin.',
      },
      {
        question: 'Sadece şablon seçmek yeterli mi?',
        answer: 'Hayır. İçerik kalitesi ve ilan uyumu belirleyici faktördür.',
      },
    ],
  },
  {
    key: 'cover-letter',
    locale: 'en',
    slug: 'cover-letter-generator',
    title: 'Cover Letter Generator for Job-Specific Drafts',
    description: 'Generate and edit concise cover letters that align with your resume and job description.',
    h1: 'Cover Letter Generator for Role-Matched Messaging',
    intro: 'Build a clear first draft, then personalize it with role-specific context before sending.',
    primaryKeyword: 'cover letter generator',
    secondaryKeywords: ['cover letter examples', 'how to write a cover letter', 'job application letter'],
    searchIntent: 'Create personalized cover letters faster without generic language.',
    ctaLabel: 'Generate Cover Letter',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Start With a Practical Draft',
        body: 'Generate a baseline structure that you can adapt to each company and position.',
      },
      {
        title: 'Align With Resume Content',
        body: 'Keep role narrative consistent across your resume and cover letter.',
      },
      {
        title: 'Keep It Specific and Concise',
        body: 'Highlight 2-3 relevant achievements and close with clear motivation.',
      },
    ],
    faq: [
      {
        question: 'Should every job application include a cover letter?',
        answer: 'When optional, a concise and relevant cover letter can still strengthen your application.',
      },
      {
        question: 'How long should it be?',
        answer: 'Usually one page or less with direct, role-specific messaging.',
      },
      {
        question: 'Can I reuse one cover letter for all jobs?',
        answer: 'No. Personalization materially improves relevance.',
      },
    ],
  },
  {
    key: 'cover-letter',
    locale: 'tr',
    slug: 'on-yazi-olusturucu',
    title: 'Ön Yazı Oluşturucu: Başvuruya Uygun Ön Yazı Hazırla',
    description: 'Ön yazı oluşturucu ile role uygun bir taslak üret, CV’nle uyumlu şekilde düzenle ve başvurunu güçlendir.',
    h1: 'Ön Yazı Oluşturucu ile Hızlı Taslak ve Düzenleme',
    intro: 'Ön yazını sıfırdan yazmak yerine net bir taslakla başla, sonra şirkete ve role göre kişiselleştir.',
    primaryKeyword: 'ön yazı oluşturucu',
    secondaryKeywords: ['cover letter generator', 'ön yazı örnekleri', 'iş başvuru ön yazısı'],
    searchIntent: 'Kısa sürede role uygun ön yazı hazırlamak.',
    ctaLabel: 'Ön Yazı Oluştur',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Hızlı Taslak Üretimi',
        body: 'Temel yapıyı hızlıca oluşturup zamanını kişiselleştirmeye ayırabilirsin.',
      },
      {
        title: 'CV ile Uyumlu Anlatım',
        body: 'Ön yazı metni, CV’deki deneyim ve başarılarla tutarlı bir şekilde ilerlemelidir.',
      },
      {
        title: 'Kısa ve Somut Mesaj',
        body: 'Uzun metinler yerine role uygun 2-3 güçlü kanıtla etkili bir kapanış yap.',
      },
    ],
    faq: [
      {
        question: 'Her başvuruda ön yazı gerekli mi?',
        answer: 'Zorunlu olmasa da doğru hazırlanmış ön yazı başvurunu güçlendirebilir.',
      },
      {
        question: 'Ön yazı ne kadar uzun olmalı?',
        answer: 'Genellikle bir sayfayı aşmayan kısa ve odaklı bir metin yeterlidir.',
      },
      {
        question: 'Tek ön yazıyı tüm başvurularda kullanabilir miyim?',
        answer: 'Önerilmez. Rol ve şirket bazlı kişiselleştirme daha etkilidir.',
      },
    ],
  },
  {
    key: 'cover-letter-writing',
    locale: 'en',
    slug: 'cover-letter-writing-guide',
    title: 'How to Write a Cover Letter for Job Applications',
    description: 'Learn how to write a cover letter with a practical structure, role-specific messaging, and clear closing.',
    h1: 'Cover Letter Writing Guide for Better Job Applications',
    intro: 'Use a simple writing framework to avoid generic text and deliver a focused, role-matched cover letter.',
    primaryKeyword: 'how to write a cover letter',
    secondaryKeywords: ['cover letter writing', 'cover letter format', 'job application cover letter'],
    searchIntent: 'Understand cover letter writing steps and create stronger application letters.',
    ctaLabel: 'Create Cover Letter Draft',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'Open With Role and Motivation',
        body: 'State the role, the company, and why your background matches this opportunity in the first paragraph.',
      },
      {
        title: 'Show 2-3 Relevant Proof Points',
        body: 'Use measurable achievements connected to the job requirements instead of repeating your full resume.',
      },
      {
        title: 'Close With Clear Next Step',
        body: 'End with concise motivation and a call for conversation, keeping the tone professional and direct.',
      },
    ],
    faq: [
      {
        question: 'Should I use the same cover letter for every application?',
        answer: 'No. Relevance improves when you customize by role and company context.',
      },
      {
        question: 'Can I keep it under one page?',
        answer: 'Yes. Most effective cover letters are concise and usually below one page.',
      },
      {
        question: 'What is the most common writing mistake?',
        answer: 'Using generic claims without job-specific evidence.',
      },
    ],
  },
  {
    key: 'cover-letter-writing',
    locale: 'tr',
    slug: 'on-yazi-nasil-yazilir',
    title: 'Ön Yazı Nasıl Yazılır? İş Başvurusu İçin Pratik Rehber',
    description: 'Ön yazı nasıl yazılır sorusuna adım adım cevap veren pratik rehber: doğru yapı, somut kanıt ve güçlü kapanış.',
    h1: 'Ön Yazı Yazmak İçin Pratik ve Etkili Yol',
    intro: 'Ön yazı yazmayı zorlaştıran genel ifadeleri bırak, role odaklı ve kısa bir metin kurgusuyla ilerle.',
    primaryKeyword: 'ön yazı nasıl yazılır',
    secondaryKeywords: ['ön yazı yazmak', 'cover letter yazmak', 'iş başvuru ön yazısı'],
    searchIntent: 'İş başvurusu için etkili ön yazı yazım adımlarını öğrenmek.',
    ctaLabel: 'Ön Yazı Taslağı Oluştur',
    ctaHref: '/cv/new',
    sections: [
      {
        title: 'İlk Paragrafta Rol ve Niyet',
        body: 'Başvurduğun pozisyonu ve neden ilgini çektiğini net söyleyerek metni güçlü başlat.',
      },
      {
        title: '2-3 Somut Başarıyla Destekle',
        body: 'CV’nin tamamını tekrar etmek yerine, ilanın ihtiyacına doğrudan bağlanan kısa ve ölçülebilir örnekler kullan.',
      },
      {
        title: 'Net ve Kısa Kapanış Yap',
        body: 'Uygunluğunu özetleyen bir kapanış ve görüşme talebiyle ön yazıyı profesyonel biçimde tamamla.',
      },
    ],
    faq: [
      {
        question: 'Ön yazı her başvuruda gerekli mi?',
        answer: 'Her zaman zorunlu değil; ancak iyi yazılmış bir ön yazı başvurunu güçlendirebilir.',
      },
      {
        question: 'Ön yazı uzunluğu ne kadar olmalı?',
        answer: 'Genellikle bir sayfayı geçmeyen kısa ve odaklı metinler daha etkilidir.',
      },
      {
        question: 'En sık yapılan hata nedir?',
        answer: 'İlanla ilgisiz, genel cümlelerle dolu metin kullanmaktır.',
      },
    ],
  },
];

export function getSeoLandingPage(locale: Locale, slug: string): SeoLandingPage | undefined {
  return seoLandingPages.find((page) => page.locale === locale && page.slug === slug);
}

export function getSeoLandingPagesByLocale(locale: Locale): SeoLandingPage[] {
  return seoLandingPages.filter((page) => page.locale === locale);
}

export function getSeoLandingAlternates(key: SeoLandingKey): Record<Locale, string> {
  const pageGroup = seoLandingPages.filter((page) => page.key === key);

  const enPage = pageGroup.find((page) => page.locale === 'en');
  const trPage = pageGroup.find((page) => page.locale === 'tr');

  if (!enPage || !trPage) {
    throw new Error(`Missing localized landing page pair for key: ${key}`);
  }

  return {
    en: localizedPath('en', enPage.slug),
    tr: localizedPath('tr', trPage.slug),
  };
}

export function getSeoLandingStaticParams() {
  return seoLandingPages.map((page) => ({ locale: page.locale, slug: page.slug }));
}
