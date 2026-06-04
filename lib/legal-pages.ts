import type { Metadata } from 'next';
import type { Locale } from '@/lib/locale';

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

const LEGAL_PAGE_LINKS_TR: Array<{ href: `/${LegalPageSlug}`; label: string }> = [
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası' },
  { href: '/cerez-politikasi', label: 'Çerez Politikası' },
  { href: '/kvkk-aydinlatma-metni', label: 'KVKK Aydınlatma Metni' },
  { href: '/kullanim-kosullari', label: 'Kullanım Koşulları' },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi' },
  { href: '/on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu' },
  { href: '/iptal-iade-politikasi', label: 'İptal ve İade Politikası' },
  { href: '/iletisim', label: 'İletişim' },
];

const LEGAL_PAGE_LINKS_EN: Array<{ href: `/${LegalPageSlug}`; label: string }> = [
  { href: '/gizlilik-politikasi', label: 'Privacy Policy' },
  { href: '/cerez-politikasi', label: 'Cookie Policy' },
  { href: '/kvkk-aydinlatma-metni', label: 'KVKK Disclosure Notice' },
  { href: '/kullanim-kosullari', label: 'Terms and Conditions' },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Distance Sales Agreement' },
  { href: '/on-bilgilendirme-formu', label: 'Pre-Information Form' },
  { href: '/iptal-iade-politikasi', label: 'Cancellation and Refund Policy' },
  { href: '/iletisim', label: 'Contact' },
];

export function getLegalPageLinks(locale: Locale): Array<{ href: `/${LegalPageSlug}`; label: string }> {
  return locale === 'tr' ? LEGAL_PAGE_LINKS_TR : LEGAL_PAGE_LINKS_EN;
}

export const LEGAL_PAGE_LINKS = LEGAL_PAGE_LINKS_TR;

export const CHECKOUT_CONSENT_DOCUMENTS: Array<{ href: string; label: string; suffix: string }> = [
  { href: '/on-bilgilendirme-formu', label: 'Ön Bilgilendirme Formu', suffix: "'nu" },
  { href: '/mesafeli-satis-sozlesmesi', label: 'Mesafeli Satış Sözleşmesi', suffix: "'ni" },
  { href: '/kullanim-kosullari', label: 'Kullanım Koşulları', suffix: "'nı" },
  { href: '/gizlilik-politikasi', label: 'Gizlilik Politikası', suffix: "'nı" },
  { href: '/cerez-politikasi', label: 'Çerez Politikası', suffix: "'nı" },
  { href: '/kvkk-aydinlatma-metni', label: 'KVKK Aydınlatma Metni', suffix: "'ni" },
];

const LEGAL_PAGES_TR: Record<LegalPageSlug, LegalPageContent> = {
  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Gizlilik Politikası',
    description: 'Kişisel verilerin nasıl toplandığı, işlendiği, saklandığı ve korunduğuna ilişkin genel bilgilendirme metni.',
    intro: [
      'Bu metin, AKA YAZILIM tarafından sunulan dijital hizmetlerde kişisel verilerin korunmasına ilişkin genel çerçeveyi açıklar.',
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
        title: '3. Ödeme Süreci (Lemon Squeezy)',
        paragraphs: [
          'Ödeme işlemleri Lemon Squeezy altyapısı üzerinden yürütülür. Kart numarası, son kullanma tarihi, CVV gibi ödeme kartı verileri tarafımızca saklanmaz ve işlenmez.',
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
          'Gizlilik talepleriniz için: akasalimserhat@gmail.com',
          'Veri sorumlusu: AKA YAZILIM',
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
          'Çerez kullanımı ve kişisel verilerin işlenmesi hakkında talepleriniz için: akasalimserhat@gmail.com',
          'Veri sorumlusu: AKA YAZILIM',
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
          'Veri sorumlusu: AKA YAZILIM',
          'MERSİS No: [MERSIS_NO] | Vergi Dairesi/No: [VERGI_DAIRESI] / [VERGI_NO]',
          'E-posta: akasalimserhat@gmail.com',
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
          'Ödeme altyapısı sağlayıcıları (örn. Lemon Squeezy) ve finansal operasyon tarafları.',
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
          'KVKK başvurularınızı akasalimserhat@gmail.com adresine iletebilirsiniz.',
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
      'Bu koşullar, AKA YAZILIM tarafından sunulan dijital hizmetlerin kullanım esaslarını düzenler.',
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
          'Ödeme hizmeti Lemon Squeezy altyapısıyla yürütülür; ödeme tamamlanmadan ücretli haklar aktive edilmeyebilir.',
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
          'Platformun yazılımı, tasarımı, içerikleri, marka unsurları ve dokümantasyonu üzerindeki tüm haklar AKA YAZILIM ve/veya lisans sağlayıcılarına aittir.',
        ],
      },
      {
        title: '9. Uyuşmazlık ve İletişim',
        paragraphs: [
          'Uyuşmazlıklarda öncelikle iyi niyetli çözüm ve destek kanalları işletilir.',
          'İletişim: akasalimserhat@gmail.com',
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
          'Satıcı: AKA YAZILIM, [VERGI_DAIRESI], [VERGI_NO], akasalimserhat@gmail.com',
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
          'Ödeme, Lemon Squeezy ödeme altyapısı üzerinden tahsil edilir. Kart verileri satıcı sisteminde tutulmaz.',
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
          'Unvan: AKA YAZILIM',
          'E-posta: akasalimserhat@gmail.com',
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
          'Ödemeler Lemon Squeezy aracılığıyla güvenli ödeme adımında tamamlanır. Kart bilgileri satıcı sisteminde saklanmaz.',
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
          'Ödeme, kullanım, iptal/iade ve teknik destek talepleriniz için: akasalimserhat@gmail.com',
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
          'İade talebinizi akasalimserhat@gmail.com üzerinden, sipariş bilgileri ve açıklamanızla birlikte iletebilirsiniz.',
        ],
      },
      {
        title: '6. Lemon Squeezy Ödemelerinde İade Süreci',
        paragraphs: [
          'Lemon Squeezy üzerinden yapılan ödemelerde iade talebi önce destek ekibine iletilir, ardından işlem kayıtları doğrulanır.',
          'İade onaylandığında süreç Lemon Squeezy ve ilgili banka/ödeme kuruluşu işlem sürelerine bağlı olarak tamamlanır.',
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
      'İletişim ve destek için aşağıdaki resmi kanalları kullanabilirsiniz.',
    ],
    sections: [
      {
        title: '1. Destek E-posta Adresi',
        paragraphs: ['akasalimserhat@gmail.com'],
      },
      {
        title: '2. Firma / Marka Bilgisi',
        paragraphs: ['AKA YAZILIM'],
      },
      {
        title: '3. Destek Süreci',
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

const LEGAL_PAGES_EN: Record<LegalPageSlug, LegalPageContent> = {
  'gizlilik-politikasi': {
    slug: 'gizlilik-politikasi',
    title: 'Privacy Policy',
    description: 'General information about how personal data is collected, processed, stored, and protected.',
    intro: [
      'This policy explains the general framework for personal data protection in digital services provided by AKA YAZILIM.',
      'This text is a general template and may require legal review before final publication.',
    ],
    sections: [
      {
        title: '1. Data We Collect',
        bullets: [
          'Identity and contact data: full name, email, and account details.',
          'Transaction data: purchase requests, package details, payment verification status, and timestamps.',
          'Technical data: IP address, device information, browser details, session logs, and security records.',
        ],
      },
      {
        title: '2. User Account and Data Security',
        paragraphs: [
          'Account-related information is processed only for service delivery, account management, and security operations.',
          'Reasonable technical and administrative safeguards are applied, but no online transmission method is fully risk-free.',
        ],
      },
      {
        title: '3. Payment Processing (Lemon Squeezy)',
        paragraphs: [
          'Payments are processed via Lemon Squeezy. Card details such as card number, expiry date, and CVV are not stored by us.',
          'Limited payment-related transaction data may be processed for order verification and accounting obligations.',
        ],
      },
      {
        title: '4. Cookies and Analytics',
        paragraphs: [
          'Cookies and similar technologies may be used to improve service performance, usability, and security.',
          'If analytics tools are used, collected data is generally evaluated in aggregated or non-directly identifiable formats.',
        ],
      },
      {
        title: '5. Purposes of Processing',
        bullets: [
          'Account creation, session management, and access control.',
          'Purchase processing, payment verification, and invoicing.',
          'Support handling, service quality improvement, and abuse prevention.',
          'Compliance with legal retention, reporting, and audit obligations.',
        ],
      },
      {
        title: '6. Third-Party Services',
        paragraphs: [
          'Third-party providers may be used for payments, infrastructure, email delivery, analytics, and hosting.',
          'Data sharing with such providers is limited to what is necessary for service setup and operations.',
        ],
      },
      {
        title: '7. Data Retention',
        paragraphs: [
          'Personal data is retained for as long as required by the processing purpose and applicable legal periods.',
          'At the end of retention periods, data is deleted, destroyed, or anonymized.',
        ],
      },
      {
        title: '8. User Rights',
        bullets: [
          'Learn whether your personal data is processed.',
          'Request information, correction, or updates regarding processed data.',
          'Request deletion/destruction when legal conditions are met.',
          'Exercise objection, complaint, and other rights under applicable law.',
        ],
      },
      {
        title: '9. Contact',
        paragraphs: ['Privacy requests: akasalimserhat@gmail.com', 'Data controller: AKA YAZILIM'],
      },
    ],
  },
  'cerez-politikasi': {
    slug: 'cerez-politikasi',
    title: 'Cookie Policy',
    description: 'Information on cookie types, purposes, retention periods, and preference management.',
    intro: [
      'This policy provides information about cookies and similar technologies used on our website.',
      'You can manage your cookie preferences from the cookie panel and the footer link at any time.',
    ],
    sections: [
      {
        title: '1. What Is a Cookie?',
        paragraphs: [
          'Cookies are small text files stored on your device through your browser when you visit a website.',
          'Cookies can be used for session continuity, security, remembering preferences, and service performance measurement.',
        ],
      },
      {
        title: '2. Cookie Categories',
        bullets: [
          'Strictly Necessary Cookies: required for core site functionality and authentication.',
          'Analytics Cookies: used to measure performance and generate usage statistics.',
          'Marketing Cookies: may be used for campaign measurement and personalized content processes.',
        ],
      },
      {
        title: '3. Legal Basis and Consent',
        paragraphs: [
          'Strictly necessary cookies may be used based on legal exemptions where technically required for service delivery.',
          'Non-essential analytics and marketing cookies are activated only after explicit consent.',
          'The cookie panel provides options such as accept all, strictly necessary only, and custom preferences.',
        ],
      },
      {
        title: '4. Retention Periods',
        bullets: [
          'Session cookies: deleted when the browser session ends.',
          'Persistent cookies: stored for a defined period and then automatically deleted.',
          'Preference cookies: stored for a limited period to remember your consent choices.',
        ],
      },
      {
        title: '5. First-Party and Third-Party Cookies',
        paragraphs: [
          'First-party cookies are set directly by our website.',
          'Third-party cookies may be set by integrated analytics or service providers.',
          'When third-party cookies are used, technical and administrative controls are applied in line with applicable law.',
        ],
      },
      {
        title: '6. Managing Cookie Preferences',
        bullets: [
          'You can accept, reject, or customize categories from the cookie panel.',
          'You can update preferences later via the footer cookie settings link.',
          'You may also delete or block cookies in your browser settings; some features may then not function properly.',
        ],
      },
      {
        title: '7. Contact',
        paragraphs: ['For cookie and personal data requests: akasalimserhat@gmail.com', 'Data controller: AKA YAZILIM'],
      },
    ],
  },
  'kvkk-aydinlatma-metni': {
    slug: 'kvkk-aydinlatma-metni',
    title: 'KVKK Disclosure Notice',
    description: 'General disclosure notice on personal data processing under Law No. 6698 (KVKK).',
    intro: [
      'This notice has been prepared to fulfill the data controller disclosure obligation under the Turkish Personal Data Protection Law (KVKK).',
      'This is a general template and may require organization-specific updates.',
    ],
    sections: [
      {
        title: '1. Data Controller',
        paragraphs: [
          'Data controller: AKA YAZILIM',
          'MERSIS No: [MERSIS_NO] | Tax Office/No: [VERGI_DAIRESI] / [VERGI_NO]',
          'Email: akasalimserhat@gmail.com',
        ],
      },
      {
        title: '2. Personal Data Processed',
        bullets: [
          'Identity and contact information (name, email, phone, etc.).',
          'Usage and transaction records (account activity, purchases, support requests).',
          'Technical data (IP, device details, sessions, and logs).',
          'Financial transaction data (payment amount, order code, timestamps).',
        ],
      },
      {
        title: '3. Processing Purposes',
        bullets: [
          'Service delivery, account management, and technical support operations.',
          'Payment processing and financial/accounting operations.',
          'Security, error detection, fraud prevention, and audit activities.',
          'Compliance with statutory obligations.',
        ],
      },
      {
        title: '4. Legal Grounds',
        paragraphs: [
          'Personal data may be processed based on contract necessity, legal obligations, legitimate interests of the controller, and explicit consent where required.',
        ],
      },
      {
        title: '5. Potential Data Recipients',
        bullets: [
          'Payment infrastructure providers (e.g., Lemon Squeezy) and financial operations parties.',
          'Hosting, software, security, analytics, and email service providers.',
          'Legally authorized public authorities and judicial bodies.',
        ],
      },
      {
        title: '6. Data Collection Methods',
        paragraphs: [
          'Personal data may be collected electronically via website forms, account creation flows, payment steps, support channels, cookies, and logs.',
        ],
      },
      {
        title: '7. Rights Under KVKK',
        bullets: [
          'Learn whether personal data is being processed.',
          'Request information if personal data has been processed.',
          'Learn the purpose of processing and whether data is used accordingly.',
          'Know third parties to whom data is transferred domestically/abroad.',
          'Request correction of incomplete or inaccurate data.',
          'Request deletion/destruction under Article 7 of KVKK.',
          'Claim compensation for damages caused by unlawful processing.',
        ],
      },
      {
        title: '8. Application and Contact Method',
        paragraphs: [
          'You can submit KVKK requests to akasalimserhat@gmail.com.',
          'Applications should clearly include full name, contact details, request subject, and identity verification details.',
        ],
      },
    ],
  },
  'kullanim-kosullari': {
    slug: 'kullanim-kosullari',
    title: 'Terms and Conditions',
    description: 'General terms governing platform use, user responsibilities, and service conditions.',
    intro: [
      'These terms govern the use of digital services provided by AKA YAZILIM.',
      'By using the service, you agree to these terms.',
    ],
    sections: [
      {
        title: '1. Service Description',
        paragraphs: [
          'The platform is a web service that enables users to access digital content/tools, manage accounts, and complete purchases.',
        ],
      },
      {
        title: '2. User Account and Responsibilities',
        bullets: [
          'Users are responsible for keeping account information accurate and up to date.',
          'Users must maintain account security, including password confidentiality and reporting unauthorized access.',
          'Users agree to use the platform in compliance with applicable laws and good-faith principles.',
        ],
      },
      {
        title: '3. Prohibited Use',
        bullets: [
          'Unauthorized access attempts, abuse of security testing, or attempts to block or disrupt the service.',
          'Unauthorized sharing of third-party personal data, copyright infringement, or unlawful content creation.',
          'Using the service for spam, fraud, illegal promotion, or unfair commercial gain.',
        ],
      },
      {
        title: '4. Use of Digital Services/Products',
        paragraphs: [
          'Purchased digital rights and features may only be used within the relevant user account.',
          'Usage rights are personal, non-transferable, and may not be resold commercially.',
        ],
      },
      {
        title: '5. Pricing',
        paragraphs: [
          'Paid packages are offered at the prices listed on the pricing page.',
          'Payments are processed via Lemon Squeezy infrastructure, and paid rights may remain inactive until payment is completed.',
        ],
      },
      {
        title: '6. Service Changes or Termination',
        paragraphs: [
          'Platform features, pricing, or scope of use may be updated with prior notice.',
          'Account access may be temporarily or permanently restricted in cases of unlawful use or security risk.',
        ],
      },
      {
        title: '7. Limitation of Liability',
        paragraphs: [
          'The service is provided at the best technically feasible level, but uninterrupted or error-free operation is not guaranteed.',
          'To the extent permitted by law, liability limits apply to indirect damages, data loss, and interruptions caused by third-party services.',
        ],
      },
      {
        title: '8. Intellectual Property',
        paragraphs: [
          'All rights related to the platform software, design, content, brand assets, and documentation belong to AKA YAZILIM and/or its licensors.',
        ],
      },
      {
        title: '9. Disputes and Contact',
        paragraphs: [
          'In case of disputes, the parties will first seek a good-faith resolution through support channels.',
          'Contact: akasalimserhat@gmail.com',
        ],
      },
    ],
  },
  'mesafeli-satis-sozlesmesi': {
    slug: 'mesafeli-satis-sozlesmesi',
    title: 'Distance Sales Agreement',
    description: 'General agreement template defining rights and obligations in digital service/product sales.',
    intro: [
      'This agreement is a template governing seller and buyer rights/obligations for online purchases.',
      'You should adapt the final agreement text to your specific business model and legal obligations.',
    ],
    sections: [
      {
        title: '1. Parties',
        paragraphs: [
          'Seller: AKA YAZILIM, [VERGI_DAIRESI], [VERGI_NO], akasalimserhat@gmail.com',
          'Buyer: [ALICI_AD_SOYAD], [ALICI_EPOSTA], [ALICI_ADRES] (based on order and account records).',
        ],
      },
      {
        title: '2. Service/Product Information',
        paragraphs: [
          'Purchased digital service/product is limited to the package name, scope, usage rights, and any defined usage period.',
        ],
      },
      {
        title: '3. Pricing and Payment',
        paragraphs: [
          'The sale price is the total amount displayed in the order summary.',
          'Payments are collected via Lemon Squeezy. Card data is not stored in the seller system.',
        ],
      },
      {
        title: '4. Delivery / Provision of Digital Service',
        paragraphs: [
          'Digital services are made accessible via the account after payment confirmation.',
          'In case of technical delays, support is provided within a reasonable period.',
        ],
      },
      {
        title: '5. Right of Withdrawal and Exceptions',
        paragraphs: [
          'The right of withdrawal in distance sales is evaluated under applicable consumer law.',
          'For digital content/services, legal exceptions may apply once performance starts or usage begins.',
        ],
      },
      {
        title: '6. Refund Conditions',
        paragraphs: [
          'Refund requests are assessed based on usage status, technical error conditions, and transaction logs.',
          'Approved refunds are completed according to payment provider and bank processing times.',
        ],
      },
      {
        title: '7. Dispute Resolution',
        paragraphs: [
          'Parties first seek resolution through support channels.',
          'For legal proceedings, applicable law, consumer arbitration committees, and competent courts apply.',
        ],
      },
      {
        title: '8. Entry into Force',
        paragraphs: ['This agreement enters into force electronically when the buyer approves it during payment.'],
      },
    ],
  },
  'on-bilgilendirme-formu': {
    slug: 'on-bilgilendirme-formu',
    title: 'Pre-Information Form',
    description: 'Pre-purchase information on sale, payment, delivery, and withdrawal rights.',
    intro: [
      'This form is provided to inform consumers before completing a purchase.',
      'The following content is a general template and should be adapted to your operation model.',
    ],
    sections: [
      {
        title: '1. Seller Information',
        paragraphs: [
          'Company: AKA YAZILIM',
          'Email: akasalimserhat@gmail.com',
          'Tax Office/No: [VERGI_DAIRESI] / [VERGI_NO]',
        ],
      },
      {
        title: '2. Main Characteristics of the Service',
        paragraphs: [
          'Purchased package may include digital features, credits/limits, or platform usage rights defined in the selected plan.',
        ],
      },
      {
        title: '3. Total Price',
        paragraphs: ['The total sales amount is clearly shown on the purchase screen and submitted for user approval before payment.'],
      },
      {
        title: '4. Payment Method',
        paragraphs: ['Payments are completed via Lemon Squeezy secure checkout. Card information is not stored in the seller system.'],
      },
      {
        title: '5. Use of Digital Service',
        paragraphs: [
          'Digital rights are assigned to the user account after payment confirmation.',
          'Technical requirements and account responsibilities are additionally defined in the Terms and Conditions.',
        ],
      },
      {
        title: '6. Right of Withdrawal Information',
        paragraphs: ['Withdrawal rights and exceptions are evaluated based on distance sales law and the execution status of digital services.'],
      },
      {
        title: '7. Contact and Support',
        paragraphs: [
          'For payment, usage, cancellation/refund, and technical support requests: akasalimserhat@gmail.com',
          'Target response time on business days: [X] hours.',
        ],
      },
    ],
  },
  'iptal-iade-politikasi': {
    slug: 'iptal-iade-politikasi',
    title: 'Cancellation and Refund Policy',
    description: 'General policy for cancellation, refund, and support flows in digital services/products.',
    intro: [
      'This policy explains cancellation and refund practices for digital services/products in a transparent way.',
      'Final practices are evaluated together with legal obligations, payment provider rules, and technical records.',
    ],
    sections: [
      {
        title: '1. General Approach for Digital Service/Product Purchases',
        paragraphs: ['Refund requests are reviewed case by case according to service nature and usage status.'],
      },
      {
        title: '2. Refund Request Before Service Use',
        paragraphs: ['If the purchased service/product has not been used, requests submitted within a reasonable period are evaluated.'],
      },
      {
        title: '3. Refund Status After Service Use',
        paragraphs: [
          'If the service has been partially/fully used, refund eligibility is determined by usage level, delivered value, and technical records.',
        ],
      },
      {
        title: '4. Faulty or Technically Problematic Transactions',
        paragraphs: [
          'For duplicate charges, failed delivery, or technical errors, remediation is prioritized and refund processes are started when necessary.',
        ],
      },
      {
        title: '5. Contact for Refund Requests',
        paragraphs: ['You can submit your refund request to akasalimserhat@gmail.com with order details and your explanation.'],
      },
      {
        title: '6. Refund Process for Lemon Squeezy Payments',
        paragraphs: [
          'For Lemon Squeezy payments, requests are first received by support and then verified against transaction logs.',
          'Once approved, refund completion depends on Lemon Squeezy and the related bank/payment institution processing times.',
        ],
      },
    ],
  },
  iletisim: {
    slug: 'iletisim',
    title: 'Contact',
    description: 'Official contact channels for payment, refund, account, and technical support requests.',
    intro: [
      'For payment, refund, account management, and technical support requests, please use the channels below.',
      'Only official support channels listed here should be used for legal and operational requests.',
    ],
    sections: [
      {
        title: '1. Support Email Address',
        paragraphs: ['akasalimserhat@gmail.com'],
      },
      {
        title: '2. Company Information',
        paragraphs: ['AKA YAZILIM'],
      },
      {
        title: '3. Support Process',
        bullets: [
          'Payments and billing: include order number and account email in your request.',
          'Cancellation and refunds: include refund reason and transaction date.',
          'Account issues: share account email and issue details clearly.',
          'Technical support: include error screen, device/browser details, and reproduction steps.',
        ],
      },
    ],
  },
};

export function getLegalPage(slug: LegalPageSlug, locale: Locale = 'tr'): LegalPageContent {
  return locale === 'tr' ? LEGAL_PAGES_TR[slug] : LEGAL_PAGES_EN[slug];
}

export function getLegalPageMetadata(slug: LegalPageSlug, locale: Locale = 'tr'): Metadata {
  const page = getLegalPage(slug, locale);
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
