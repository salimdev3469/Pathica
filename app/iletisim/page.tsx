import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('iletisim', locale);
}

export default function IletisimPage() {
  return <LegalPageTemplate page={getLegalPage('iletisim', locale)} />;
}
