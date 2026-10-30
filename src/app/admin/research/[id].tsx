import { useLocalSearchParams } from 'expo-router';

import { EditResearch } from '@/admin/research-form';

export default function EditResearchPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditResearch id={Number(id)} />;
}
