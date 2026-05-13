import LegalPageTemplate from '@/components/legal/LegalPageTemplate';
import { getLegalPage, getLegalPageMetadata } from '@/lib/legal-pages';

export const metadata = getLegalPageMetadata('mesafeli-satis-sozlesmesi');

export default function MesafeliSatisSozlesmesiPage() {
  return <LegalPageTemplate page={getLegalPage('mesafeli-satis-sozlesmesi')} />;
}
