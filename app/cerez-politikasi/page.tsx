import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('cerez-politikasi', 'en');
}

export default function CerezPolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('cerez-politikasi', 'en')} />;
}
