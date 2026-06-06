import { cookies } from 'next/headers';
import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export function generateMetadata() {
  return getLegalPageMetadata('kullanim-kosullari', 'en');
}

export default function KullanimKosullariPage() {
  return <LegalPageTemplate page={getLegalPage('kullanim-kosullari', 'en')} />;
}
