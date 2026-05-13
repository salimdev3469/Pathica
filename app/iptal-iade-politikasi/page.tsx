import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('iptal-iade-politikasi');

export default function IptalIadePolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('iptal-iade-politikasi')} />;
}
