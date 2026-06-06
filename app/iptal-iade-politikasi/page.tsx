import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('iptal-iade-politikasi', 'en');
}

export default function IptalIadePolitikasiPage() {
  return <LegalPageTemplate page={getLegalPage('iptal-iade-politikasi', 'en')} />;
}
