import { LegalPage } from '@/components/legal-page';
import { PRIVACY } from '@/data/legal';

export default function PrivacyPolicy() {
  return <LegalPage doc={PRIVACY} />;
}
