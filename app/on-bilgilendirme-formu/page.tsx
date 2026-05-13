import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('on-bilgilendirme-formu');

export default function OnBilgilendirmeFormuPage() {
  return <LegalPageTemplate page={getLegalPage('on-bilgilendirme-formu')} />;
}
