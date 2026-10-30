import { useLocalSearchParams } from 'expo-router';

import { EditExhibition } from '@/admin/exhibition-form';

export default function EditExhibitionPage() {
  const { id } = useLocalSearchParams<{ id: string }>();
  return <EditExhibition id={Number(id)} />;
}
