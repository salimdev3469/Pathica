import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('iletisim');

export default function IletisimPage() {
  return <LegalPageTemplate page={getLegalPage('iletisim')} />;
}
