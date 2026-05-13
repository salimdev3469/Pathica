import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('kullanim-kosullari');

export default function KullanimKosullariPage() {
  return <LegalPageTemplate page={getLegalPage('kullanim-kosullari')} />;
}
