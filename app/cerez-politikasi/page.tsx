import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('cerez-politikasi');

export default function CerezPolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('cerez-politikasi')} />;
}
