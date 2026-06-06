import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('mesafeli-satis-sozlesmesi', 'en');
}

export default function MesafeliSatisSozlesmesiPage() {
  return <LegalPageTemplate page={getLegalPage('mesafeli-satis-sozlesmesi', 'en')} />;
}
