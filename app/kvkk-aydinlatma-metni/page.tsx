import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('kvkk-aydinlatma-metni');

export default function KvkkAydinlatmaMetniPage() {
  return <LegalPageTemplate page={getLegalPage('kvkk-aydinlatma-metni')} />;
}
