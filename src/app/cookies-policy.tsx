import { LegalPage } from '@/components/legal-page';
import { COOKIES } from '@/data/legal';

export default function CookiesPolicy() {
  return <LegalPage doc={COOKIES} />;
}
