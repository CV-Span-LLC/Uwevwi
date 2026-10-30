import { Redirect, Stack, useSegments } from 'expo-router';
import { View } from 'react-native';

import { AuthProvider, useAuth } from '@/admin/auth';
import { A, AText } from '@/admin/ui';

const OPEN_ROUTES = ['login', 'forgot-password', 'reset-password'];

function Gate() {
  const { status } = useAuth();
  const segments = useSegments() as string[];
  const isOpen = OPEN_ROUTES.includes(segments[1] ?? '');

  if (status === 'loading') {
    return (
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: A.page }}>
        <AText color={A.muted}>Loading…</AText>
      </View>
    );
  }
  if (status === 'signed-out' && !isOpen) return <Redirect href="/admin/login" />;
  if (status === 'signed-in' && segments[1] === 'login') return <Redirect href="/admin" />;
  return <Stack screenOptions={{ headerShown: false, animation: 'none', contentStyle: { backgroundColor: A.page } }} />;
}

export default function AdminLayout() {
  return (
    <AuthProvider>
      <Gate />
    </AuthProvider>
  );
}
