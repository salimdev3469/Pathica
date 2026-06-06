import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('on-bilgilendirme-formu', locale);
}

export default function OnBilgilendirmeFormuPage() {
  return <LegalPageTemplate page={getLegalPage('on-bilgilendirme-formu', locale)} />;
}
