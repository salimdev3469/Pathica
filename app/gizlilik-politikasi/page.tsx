import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('gizlilik-politikasi', 'en');
}

export default function GizlilikPolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('gizlilik-politikasi', 'en')} />;
}
