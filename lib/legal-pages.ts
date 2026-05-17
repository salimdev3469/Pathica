import type { Metadata } from 'next';

export type LegalPageSlug =
  | 'gizlilik-politikasi'
  | 'cerez-politikasi'
  | 'kvkk-aydinlatma-metni'
  | 'kullanim-kosullari'
  | 'mesafeli-satis-sozlesmesi'
  | 'on-bilgilendirme-formu'
  | 'iptal-iade-politikasi'
  | 'iletisim';

export type LegalPageSection = {
  title: string;
  paragraphs?: string[];
  bullets?: string[];
};

export type LegalPageContent = {
  slug: LegalPageSlug;
  title: string;
  description: string;
  intro: string[];
  sections: LegalPageSection[];
};

export const LEGAL_PAGE_LINKS: Array<{ href: `/${LegalPageSlug}`; label: string }> = [
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
  { href: '/kvkk-aydinlatma-metni', label: 'KVKK Aydınlatma Metni' },
  { href: '/kullanim-kosullari', label: 'Kullanım Koşulları' },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
  { href: '/on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu' },
  { href: '/iptal-iade-politikasi', label: 'İptal ve İade Politikası' },
  { href: '/iletisim', label: 'İletişim' },
];

export const CHECKOUT_CONSENT_DOCUMENTS: Array<{ href: string; label: string; suffix: string }> = [
  { href: '/on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu', suffix: "'nu" },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi', suffix: "'ni" },
  { href: '/kullanim-kosullari', label: 'Kullanım Koşulları', suffix: "'nı" },
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası', suffix: "'nı" },
  { href: '/cerez-politikasi', label: 'Çerez Politikası', suffix: "'nı" },
  { href: '/kvkk-aydinlatma-metni', label: 'KVKK Aydınlatma Metni', suffix: "'ni" },
];

const LEGAL_PAGES: Record<LegalPageSlug, LegalPageContent> = {
  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    description: 'Kişisel verilerin nasıl toplandığı, işlendiği, saklandığı ve korunduğuna ilişkin genel bilgilendirme metni.',
    intro: [
      'Bu metin, [MARKA/FIRMA ADI] tarafından sunulan dijital hizmetlerde kişisel verilerin korunmasına ilişkin genel çerçeveyi açıklar.',
      'Metin taslak bilgilendirme niteliğindedir; faaliyet yapınıza uygun nihai metin için hukuki danışmanlık almanız önerilir.',
    ],
    sections: [
      {
        title: '1. Toplanan Veriler',
        bullets: [
          'Kimlik ve iletişim verileri: ad-soyad, e-posta, kullanıcı adı gibi hesap bilgileriniz.',
          'İşlem verileri: satın alma talebi, paket bilgisi, ödeme doğrulama durumu, işlem zamanı.',
          'Teknik veriler: IP adresi, cihaz tipi, tarayıcı bilgileri, oturum ve güvenlik logları.',
        ],
      },
      {
        title: '2. Kullanıcı Hesabı ve Veri Güvenliği',
        paragraphs: [
          'Kullanıcı hesabınıza ait bilgiler sadece hizmetin sunulması, güvenliğin sağlanması ve hesap yönetimi amaçlarıyla işlenir.',
          'Yetkisiz erişime karşı makul teknik ve idari önlemler uygulanır; ancak internet üzerinden veri iletiminin tamamen risksiz olmadığı unutulmamalıdır.',
        ],
      },
      {
        title: '3. Ödeme Süreci (Shopier)',
        paragraphs: [
          'Ödeme işlemleri Shopier altyapısı üzerinden yürütülür. Kart numarası, son kullanma tarihi, CVV gibi ödeme kartı verileri tarafımızca saklanmaz ve işlenmez.',
          'Ödeme sırasında paylaşılan işlem bilgileri, sipariş doğrulama ve finansal kayıt süreçleri kapsamında sınırlı olarak işlenebilir.',
        ],
      },
      {
        title: '4. Çerezler ve Analitik Araçlar',
        paragraphs: [
          'Hizmet performansını artırmak, güvenliği sağlamak ve kullanım deneyimini geliştirmek için çerezler ile benzer teknolojiler kullanılabilir.',
          'Analitik araçlar kullanılıyorsa, bu araçlar üzerinden toplanan veriler genellikle toplulaştırılmış veya kimliği doğrudan belirlemeyen formatta değerlendirilir.',
        ],
      },
      {
        title: '5. Verilerin İşlenme Amaçları',
        bullets: [
          'Hesap oluşturma, oturum yönetimi ve hizmete erişim sağlama.',
          'Satın alma, ödeme doğrulama ve faturalama süreçlerini yürütme.',
          'Destek taleplerini yanıtlama, hizmet kalitesini geliştirme ve kötüye kullanımı önleme.',
          'Mevzuattan doğan saklama, raporlama ve denetim yükümlülüklerini yerine getirme.',
        ],
      },
      {
        title: '6. Üçüncü Taraf Servisler',
        paragraphs: [
          'Ödeme, altyapı, e-posta, analitik ve barındırma gibi alanlarda üçüncü taraf servis sağlayıcılarla çalışılabilir.',
          'Bu servis sağlayıcılara yapılan veri aktarımı, hizmetin kurulması ve yürütülmesi için gerekli olan kapsamla sınırlıdır.',
        ],
      },
      {
        title: '7. Veri Saklama Süresi',
        paragraphs: [
          'Kişisel veriler, işleme amacı için gerekli süre boyunca ve ilgili mevzuatta öngörülen yasal saklama süreleri kadar tutulur.',
          'Süre sonunda veriler silinir, yok edilir veya anonim hale getirilir.',
        ],
      },
      {
        title: '8. Kullanıcı Hakları',
        bullets: [
          'Hakkınızda veri işlenip işlenmediğini öğrenme.',
          'İşlenen verilere ilişkin bilgi talep etme, düzeltme veya güncelleme isteme.',
          'Kanuni şartlar oluştuğunda silme/yok etme talep etme.',
          'İtiraz, şikayet ve ilgili mevzuat kapsamındaki diğer hakları kullanma.',
        ],
      },
      {
        title: '9. İletişim',
        paragraphs: [
          'Gizlilik talepleriniz için: [DESTEK_EPOSTA] / [KEP_ADRESI]',
          'Veri sorumlusu iletişim bilgileri: [FIRMA_UNVAN], [ADRES], [TELEFON]',
        ],
      },
    ],
  },
  'cerez-politikasi': {
    slug: 'cerez-politikasi',
    title: 'Çerez Politikası',
    description: 'Sitede kullanılan çerez türleri, amaçları, saklama süreleri ve tercih yönetimi hakkında bilgilendirme metni.',
    intro: [
      'Bu politika, internet sitemizde kullanılan çerezler ve benzeri teknolojiler hakkında bilgilendirme sağlamak amacıyla hazırlanmıştır.',
      'Çerez tercihlerinizi, siteye girişte gösterilen panelden veya alt bilgide yer alan “Çerez Tercihleri” bağlantısından her zaman güncelleyebilirsiniz.',
    ],
    sections: [
      {
        title: '1. Çerez Nedir?',
        paragraphs: [
          'Çerezler, internet sitesini ziyaret ettiğinizde tarayıcınız üzerinden cihazınıza kaydedilen küçük metin dosyalarıdır.',
          'Çerezler, oturum sürekliliği, güvenlik, tercihlerin hatırlanması ve hizmet kalitesinin ölçülmesi gibi amaçlarla kullanılabilir.',
        ],
      },
      {
        title: '2. Çerez Kategorileri',
        bullets: [
          'Zorunlu Çerezler: Oturum güvenliği, kimlik doğrulama ve temel sayfa fonksiyonları için gereklidir.',
          'Analitik Çerezler: Site performansını ölçmek ve kullanım istatistikleri üretmek için kullanılır.',
          'Pazarlama Çerezleri: Reklam kampanyalarının ölçümü ve kişiselleştirilmiş içerik süreçlerinde kullanılabilir.',
        ],
      },
      {
        title: '3. Hukuki Dayanak ve Açık Rıza',
        paragraphs: [
          'Zorunlu çerezler, hizmetin teknik olarak sunulabilmesi için gerekli olması nedeniyle ilgili mevzuatta öngörülen istisnalar kapsamında kullanılabilir.',
          'Zorunlu olmayan analitik ve pazarlama çerezleri, yalnızca açık rıza vermeniz halinde etkinleştirilir.',
          'Çerez panelinde “Hepsini kabul et”, “Sadece zorunlu” ve “Tercihler” seçenekleri sunularak tercihinizi özgürce belirlemeniz amaçlanır.',
        ],
      },
      {
        title: '4. Kullanım Süreleri',
        bullets: [
          'Oturum çerezleri: Tarayıcı oturumu kapandığında silinir.',
          'Kalıcı çerezler: Belirli bir süre boyunca cihazınızda saklanır ve süre sonunda otomatik silinir.',
          'Çerez tercih kaydı: Tercihinizin tekrar sorulmaması için sınırlı süreyle saklanır.',
        ],
      },
      {
        title: '5. Birinci Taraf / Üçüncü Taraf Çerezler',
        paragraphs: [
          'Birinci taraf çerezler doğrudan internet sitemiz tarafından yerleştirilir.',
          'Üçüncü taraf çerezler, analitik veya entegrasyon hizmeti sağlayan iş ortakları tarafından yerleştirilebilir.',
          'Üçüncü taraf çerez kullanımında, aktarım ve işleme süreçleri için yürürlükteki mevzuata uygun teknik/idari tedbirler uygulanır.',
        ],
      },
      {
        title: '6. Çerez Tercihlerini Yönetme',
        bullets: [
          'Açılış çerez panelinden kategorileri seçebilir veya tamamını reddedebilirsiniz.',
          'Alt bilgideki “Çerez Tercihleri” bağlantısından tercihlerinizi sonradan değiştirebilirsiniz.',
          'Tarayıcı ayarlarınızdan çerezleri silme veya engelleme işlemi yapabilirsiniz; bu durumda bazı özellikler çalışmayabilir.',
        ],
      },
      {
        title: '7. İletişim',
        paragraphs: [
          'Çerez kullanımı ve kişisel verilerin işlenmesi hakkında talepleriniz için: [DESTEK_EPOSTA]',
          'Veri sorumlusu bilgileri: [FIRMA_UNVAN], [ADRES], [KEP_ADRESI]',
        ],
      },
    ],
  },
  'kvkk-aydinlatma-metni': {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Aydınlatma Metni',
    description: '6698 sayılı KVKK kapsamında kişisel verilerin işlenmesine ilişkin genel aydınlatma metni.',
    intro: [
      'Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu kapsamında veri sorumlusunun bilgilendirme yükümlülüğünü yerine getirmek amacıyla hazırlanmıştır.',
      'Metin genel taslak niteliğindedir ve şirketinize özel güncellemeler gerektirebilir.',
    ],
    sections: [
      {
        title: '1. Veri Sorumlusu',
        paragraphs: [
          'Veri sorumlusu: [FIRMA_UNVAN]',
          'MERSİS No: [MERSIS_NO] | Vergi Dairesi/No: [VERGI_DAIRESI] / [VERGI_NO]',
          'Adres: [ADRES] | E-posta: [DESTEK_EPOSTA] | KEP: [KEP_ADRESI]',
        ],
      },
      {
        title: '2. İşlenen Kişisel Veriler',
        bullets: [
          'Kimlik ve iletişim bilgileri (ad-soyad, e-posta, telefon vb.).',
          'Kullanım ve işlem bilgileri (hesap hareketleri, satın alma kayıtları, destek talepleri).',
          'Teknik veriler (IP, cihaz, oturum, log kayıtları).',
          'Finansal işlem bilgileri (ödeme tutarı, sipariş kodu, işlem zamanları).',
        ],
      },
      {
        title: '3. Kişisel Verilerin İşlenme Amaçları',
        bullets: [
          'Hizmetin sunulması, kullanıcı hesabının yönetimi ve teknik destek süreçlerinin yürütülmesi.',
          'Ödeme işlemleri, muhasebe ve finans operasyonlarının yürütülmesi.',
          'Bilgi güvenliği, hata tespiti, dolandırıcılık önleme ve denetim süreçlerinin yönetilmesi.',
          'Mevzuattan kaynaklanan yükümlülüklerin yerine getirilmesi.',
        ],
      },
      {
        title: '4. Hukuki Sebepler',
        paragraphs: [
          'Kişisel veriler; sözleşmenin kurulması/ifası, hukuki yükümlülüklerin yerine getirilmesi, veri sorumlusunun meşru menfaati ve gerektiğinde açık rıza hukuki sebeplerine dayanarak işlenebilir.',
        ],
      },
      {
        title: '5. Aktarım Yapılabilecek Taraflar',
        bullets: [
          'Ödeme altyapısı sağlayıcıları (örn. Shopier) ve finansal operasyon tarafları.',
          'Barındırma, yazılım, güvenlik, analitik ve e-posta hizmet sağlayıcıları.',
          'Kanunen yetkili kamu kurum ve kuruluşları ile yargı mercileri.',
        ],
      },
      {
        title: '6. Veri Toplama Yöntemi',
        paragraphs: [
          'Kişisel veriler; web sitesi formları, hesap oluşturma süreçleri, ödeme adımları, destek kanalları, çerezler ve log mekanizmaları üzerinden elektronik ortamda toplanabilir.',
        ],
      },
      {
        title: '7. KVKK Kapsamındaki Haklar',
        bullets: [
          'Kişisel verilerin işlenip işlenmediğini öğrenme.',
          'İşlenmişse bilgi talep etme.',
          'İşleme amacını ve amaca uygun kullanılıp kullanılmadığını öğrenme.',
          'Yurtiçinde/yurtdışında aktarıldığı üçüncü kişileri bilme.',
          'Eksik/yanlış işlenmiş verilerin düzeltilmesini isteme.',
          'KVKK madde 7 kapsamında silinmesini/yok edilmesini isteme.',
          'Kanuna aykırı işleme nedeniyle zarara uğranması halinde tazminat talep etme.',
        ],
      },
      {
        title: '8. Başvuru ve İletişim Yöntemi',
        paragraphs: [
          'KVKK başvurularınızı [DESTEK_EPOSTA] adresine veya [KEP_ADRESI] üzerinden iletebilirsiniz.',
          'Başvurularda ad-soyad, iletişim bilgisi, talep konusu ve kimlik doğrulama bilgileri açık şekilde belirtilmelidir.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Kullanım Koşulları',
    description: 'Platformun kullanım şartları, kullanıcı sorumlulukları ve hizmete ilişkin genel koşullar.',
    intro: [
      'Bu koşullar, [MARKA/FIRMA ADI] tarafından sunulan dijital hizmetlerin kullanım esaslarını düzenler.',
      'Hizmeti kullanarak bu koşulları kabul etmiş sayılırsınız.',
    ],
    sections: [
      {
        title: '1. Hizmetin Tanımı',
        paragraphs: [
          'Platform; kullanıcıların dijital içerik/araçlardan faydalanmasını, hesap yönetimini ve satın alma işlemlerini yürütmesini sağlayan bir web hizmetidir.',
        ],
      },
      {
        title: '2. Kullanıcı Hesabı ve Sorumluluklar',
        bullets: [
          'Hesap bilgilerinin doğru ve güncel tutulması kullanıcı sorumluluğundadır.',
          'Hesap güvenliği (şifre gizliliği, yetkisiz erişim bildirimi vb.) kullanıcı tarafından sağlanmalıdır.',
          'Kullanıcı, platformu hukuka ve dürüstlük kuralına uygun şekilde kullanmayı kabul eder.',
        ],
      },
      {
        title: '3. Yasaklı Kullanım',
        bullets: [
          'Sisteme izinsiz erişim, güvenlik testlerini kötüye kullanma, hizmeti engelleme veya bozma girişimleri.',
          'Başkalarına ait kişisel verilerin izinsiz paylaşımı, telif ihlali veya hukuka aykırı içerik üretimi.',
          'Hizmeti spam, dolandırıcılık, yasa dışı tanıtım veya haksız kazanç amacıyla kullanma.',
        ],
      },
      {
        title: '4. Dijital Hizmet/Ürün Kullanımı',
        paragraphs: [
          'Satın alınan dijital haklar ve özellikler, yalnızca ilgili kullanıcı hesabı kapsamında kullanılabilir.',
          'Kullanım hakkı kişiye özeldir; üçüncü kişilere devredilemez veya ticari olarak yeniden satılamaz.',
        ],
      },
      {
        title: '5. Ücretlendirme',
        paragraphs: [
          'Ücretli paketler, fiyatlandırma sayfasında ilan edilen tutarlar üzerinden sunulur.',
          'Ödeme hizmeti Shopier altyapısıyla yürütülür; ödeme tamamlanmadan ücretli haklar aktive edilmeyebilir.',
        ],
      },
      {
        title: '6. Hizmetin Değiştirilmesi veya Sonlandırılması',
        paragraphs: [
          'Platform özellikleri, fiyatlar veya kullanım kapsamı önceden bildirim yapılarak güncellenebilir.',
          'Hukuka aykırı kullanım veya güvenlik riski durumunda hesap erişimi geçici ya da kalıcı olarak sınırlandırılabilir.',
        ],
      },
      {
        title: '7. Sorumluluk Sınırları',
        paragraphs: [
          'Hizmet, teknik olarak mümkün olan en iyi seviyede sunulmakla birlikte kesintisiz veya hatasız çalışma garantisi verilmez.',
          'Dolaylı zararlar, veri kaybı veya üçüncü taraf servis kaynaklı kesintiler bakımından mevzuatın izin verdiği ölçüde sorumluluk sınırı uygulanır.',
        ],
      },
      {
        title: '8. Fikri Mülkiyet',
        paragraphs: [
          'Platformun yazılımı, tasarımı, içerikleri, marka unsurları ve dokümantasyonu üzerindeki tüm haklar [FIRMA_UNVAN] ve/veya lisans sağlayıcılarına aittir.',
        ],
      },
      {
        title: '9. Uyuşmazlık ve İletişim',
        paragraphs: [
          'Uyuşmazlıklarda öncelikle iyi niyetli çözüm ve destek kanalları işletilir.',
          'İletişim: [DESTEK_EPOSTA] | [ADRES] | [TELEFON]',
        ],
      },
    ],
  },
  'mesafeli-satis-sozlesmesi': {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Mesafeli Satış Sözleşmesi',
    description: 'Dijital hizmet/ürün satışlarında tarafların hak ve yükümlülüklerine ilişkin genel sözleşme taslağı.',
    intro: [
      'Bu sözleşme, elektronik ortamda yapılan satın alımlarda satıcı ve alıcının hak ve yükümlülüklerini düzenleyen taslak metindir.',
      'Nihai sözleşme metnini şirket bilgileriniz ve ürün kapsamınız doğrultusunda güncellemeniz önerilir.',
    ],
    sections: [
      {
        title: '1. Taraflar',
        paragraphs: [
          'Satıcı: [FIRMA_UNVAN], [ADRES], [VERGI_DAIRESI], [VERGI_NO], [DESTEK_EPOSTA]',
          'Alıcı: [ALICI_AD_SOYAD], [ALICI_EPOSTA], [ALICI_ADRES] (ödeme ve hesap kayıtlarından alınır).',
        ],
      },
      {
        title: '2. Hizmet/Ürün Bilgisi',
        paragraphs: [
          'Satın alınan dijital hizmet/ürün; paket adı, içerik kapsamı, kullanım hakkı ve varsa kullanım süresi ile sınırlıdır.',
        ],
      },
      {
        title: '3. Fiyat ve Ödeme Bilgisi',
        paragraphs: [
          'Satış fiyatı sipariş özetinde belirtilen toplam tutardır.',
          'Ödeme, Shopier ödeme altyapısı üzerinden tahsil edilir. Kart verileri satıcı sisteminde tutulmaz.',
        ],
      },
      {
        title: '4. Teslimat / Dijital Hizmetin Sunumu',
        paragraphs: [
          'Dijital hizmetler, ödeme onayı sonrasında hesap üzerinden erişilebilir hale getirilir.',
          'Teknik gecikmeler yaşanması halinde satıcı makul süre içinde erişim sorununu gidermek için destek sağlar.',
        ],
      },
      {
        title: '5. Cayma Hakkı ve İstisnaları',
        paragraphs: [
          'Mesafeli satışlarda cayma hakkı genel olarak mevzuatta düzenlendiği şekilde değerlendirilir.',
          'Dijital içerik/hizmetlerde, ifaya başlanması veya hizmetin kullanılması sonrası cayma hakkı bakımından mevzuattaki istisnalar uygulanabilir.',
        ],
      },
      {
        title: '6. İade Şartları',
        paragraphs: [
          'İade değerlendirmeleri, hizmetin kullanılıp kullanılmadığı, teknik hata durumu ve işlem kayıtlarına göre yapılır.',
          'Onaylanan iadelerde süreç ödeme sağlayıcısı ve bankanın işlem sürelerine göre tamamlanır.',
        ],
      },
      {
        title: '7. Uyuşmazlık Çözümü',
        paragraphs: [
          'Taraflar uyuşmazlık halinde öncelikle destek kanalları üzerinden çözüm arar.',
          'Yasal başvurular bakımından ilgili mevzuat, tüketici hakem heyetleri ve yetkili mahkemeler esas alınır.',
        ],
      },
      {
        title: '8. Yürürlük',
        paragraphs: [
          'Alıcı, ödeme adımında bu sözleşmeyi onayladığında sözleşme elektronik ortamda yürürlüğe girer.',
        ],
      },
    ],
  },
  'on-bilgilendirme-formu': {
    slug: 'on-bilgilendirme-formu',
    title: 'Ön Bilgilendirme Formu',
    description: 'Satın alma öncesi sunulan temel satış, ödeme, teslimat ve cayma hakkı bilgilendirmesi.',
    intro: [
      'Bu form, satın alma işlemi tamamlanmadan önce tüketicinin bilgilendirilmesi amacıyla hazırlanmıştır.',
      'Aşağıdaki bilgiler genel taslak niteliğindedir ve faaliyet modelinize göre güncellenmelidir.',
    ],
    sections: [
      {
        title: '1. Satıcı Bilgileri',
        paragraphs: [
          'Unvan: [FIRMA_UNVAN]',
          'Adres: [ADRES]',
          'E-posta: [DESTEK_EPOSTA] | Telefon: [TELEFON]',
          'Vergi Dairesi/No: [VERGI_DAIRESI] / [VERGI_NO]',
        ],
      },
      {
        title: '2. Hizmetin Temel Nitelikleri',
        paragraphs: [
          'Satın alınan paket; dijital ortamda sunulan özelliklerden, kredi/limit haklarından veya platform içi kullanım haklarından oluşabilir.',
        ],
      },
      {
        title: '3. Toplam Fiyat',
        paragraphs: [
          'Toplam satış bedeli, satın alma ekranında paket bazında açıkça gösterilir ve ödeme öncesi kullanıcı onayına sunulur.',
        ],
      },
      {
        title: '4. Ödeme Yöntemi',
        paragraphs: [
          'Ödemeler Shopier aracılığıyla güvenli ödeme adımında tamamlanır. Kart bilgileri satıcı sisteminde saklanmaz.',
        ],
      },
      {
        title: '5. Dijital Hizmetin Kullanımı',
        paragraphs: [
          'Ödeme onayından sonra ilgili dijital haklar kullanıcı hesabına tanımlanır.',
          'Hizmet kullanımına ilişkin teknik gereksinimler ve hesap sorumlulukları kullanım koşullarında ayrıca düzenlenir.',
        ],
      },
      {
        title: '6. Cayma Hakkı Bilgisi',
        paragraphs: [
          'Cayma hakkı ve istisnaları, mesafeli satış mevzuatı ve dijital hizmetin ifa durumu dikkate alınarak değerlendirilir.',
        ],
      },
      {
        title: '7. İletişim ve Destek',
        paragraphs: [
          'Ödeme, kullanım, iptal/iade ve teknik destek talepleriniz için: [DESTEK_EPOSTA]',
          'İş günlerinde geri dönüş hedef süresi: [X] saat.',
        ],
      },
    ],
  },
  'iptal-iade-politikasi': {
    slug: 'iptal-iade-politikasi',
    title: 'İptal ve İade Politikası',
    description: 'Dijital ürün ve hizmetlerde iptal, iade ve destek süreçlerine ilişkin genel politika metni.',
    intro: [
      'Bu politika, dijital hizmet ve ürün satın alımlarında iptal/iade yaklaşımının şeffaf şekilde açıklanması amacıyla hazırlanmıştır.',
      'Nihai uygulamalar yasal yükümlülükler, ödeme sağlayıcısı kuralları ve teknik işlem kayıtlarıyla birlikte değerlendirilir.',
    ],
    sections: [
      {
        title: '1. Dijital Hizmet/Ürün Satın Alımlarında Genel Yaklaşım',
        paragraphs: [
          'Dijital ürün ve hizmetlerde iade talepleri, hizmetin niteliği ve kullanım durumu dikkate alınarak vaka bazlı incelenir.',
        ],
      },
      {
        title: '2. Hizmet Kullanılmadan Önce İade Talebi',
        paragraphs: [
          'Satın alınan hizmet/ürün henüz kullanılmadıysa, makul süre içinde yapılan iade başvuruları değerlendirmeye alınır.',
        ],
      },
      {
        title: '3. Hizmet Kullanıldıktan Sonra İade Durumu',
        paragraphs: [
          'Hizmetin kısmen/tamamen kullanılmış olması halinde iade uygunluğu; kullanım düzeyi, sunulan fayda ve teknik kayıtlar doğrultusunda belirlenir.',
        ],
      },
      {
        title: '4. Hatalı veya Teknik Sorunlu İşlemler',
        paragraphs: [
          'Mükerrer çekim, başarısız teslimat veya teknik hata gibi durumlarda öncelikle sorun giderme sağlanır; gerekirse iade süreci başlatılır.',
        ],
      },
      {
        title: '5. İade Talebi İçin İletişim',
        paragraphs: [
          'İade talebinizi [DESTEK_EPOSTA] üzerinden, sipariş bilgileri ve açıklamanızla birlikte iletebilirsiniz.',
        ],
      },
      {
        title: '6. Shopier Ödemelerinde İade Süreci',
        paragraphs: [
          'Shopier üzerinden yapılan ödemelerde iade talebi önce destek ekibine iletilir, ardından işlem kayıtları doğrulanır.',
          'İade onaylandığında süreç Shopier ve ilgili banka/ödeme kuruluşu işlem sürelerine bağlı olarak tamamlanır.',
        ],
      },
    ],
  },
  iletisim: {
    slug: 'iletisim',
    title: 'İletişim',
    description: 'Ödeme, iade, hesap ve teknik destek konularında firma iletişim bilgileri ve başvuru kanalları.',
    intro: [
      'Ödeme, iade, hesap yönetimi ve teknik destek talepleriniz için aşağıdaki kanallardan bize ulaşabilirsiniz.',
      'Aşağıdaki alanlar placeholder olarak hazırlanmıştır; canlıya çıkmadan önce kurum bilgilerinizle güncelleyiniz.',
    ],
    sections: [
      {
        title: '1. Destek E-posta Adresi',
        paragraphs: ['[DESTEK_EPOSTA]'],
      },
      {
        title: '2. Firma / Marka Bilgisi',
        paragraphs: ['[MARKA_ADI] / [FIRMA_UNVAN]'],
      },
      {
        title: '3. Adres Bilgisi',
        paragraphs: ['[ADRES]'],
      },
      {
        title: '4. Vergi Bilgileri',
        paragraphs: ['Vergi Dairesi: [VERGI_DAIRESI]', 'Vergi No: [VERGI_NO]', 'MERSİS No: [MERSIS_NO]'],
      },
      {
        title: '5. Destek Süreci',
        bullets: [
          'Ödeme ve faturalama: Sipariş numarası/e-posta ile başvuru yapınız.',
          'İptal ve iade: İade nedeni ve işlem tarihini ekleyerek talep iletiniz.',
          'Hesap işlemleri: Hesap e-postası ve sorun detayını paylaşınız.',
          'Teknik destek: Hata ekranı, cihaz/tarayıcı bilgisi ve adımları belirtiniz.',
        ],
      },
    ],
  },
};

export function getLegalPage(slug: LegalPageSlug): LegalPageContent {
  return LEGAL_PAGES[slug];
}

export function getLegalPageMetadata(slug: LegalPageSlug): Metadata {
  const page = getLegalPage(slug);
  return {
    title: page.title,
    description: page.description,
    alternates: {
      canonical: `/${slug}`,
    },
    openGraph: {
      title: `${page.title} | Pathica`,
      description: page.description,
      type: 'article',
      url: `/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: `${page.title} | Pathica`,
      description: page.description,
    },
  };
}
