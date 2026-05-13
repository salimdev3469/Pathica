import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('gizlilik-politikasi');

export default function GizlilikPolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('gizlilik-politikasi')} />;
}
