import { LegalPage } from '@/components/legal-page';
import { TERMS } from '@/data/legal';

export default function TermsOfUse() {
  return <LegalPage doc={TERMS} />;
}
