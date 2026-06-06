import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('kvkk-aydinlatma-metni', 'en');
}

export default function KvkkAydinlatmaMetniPage() {
  return <LegalPageTemplate page={getLegalPage('kvkk-aydinlatma-metni', 'en')} />;
}
