import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';
import { LOCALE_COOKIE_NAME, normalizeLocale } from '@/lib/locale';

export function generateMetadata() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);
  return getLegalPageMetadata('mesafeli-satis-sozlesmesi', locale);
}

export default function MesafeliSatisSozlesmesiPage() {
  const locale = normalizeLocale(cookies().get(LOCALE_COOKIE_NAME)?.value);

  return <LegalPageTemplate page={getLegalPage('mesafeli-satis-sozlesmesi', locale)} />;
}
