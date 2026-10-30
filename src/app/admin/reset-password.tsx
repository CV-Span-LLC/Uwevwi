import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';

import { AuthScreen, TextLink } from '@/admin/auth-screen';
import { A, AText, Btn, Field, errorText } from '@/admin/ui';
import { request } from '@/lib/api';

export default function ResetPassword() {
  const { token } = useLocalSearchParams<{ token?: string }>();
  const router = useRouter();
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    if (password.length < 10) return setError('Use at least 10 characters.');
    if (password !== confirm) return setError('The two passwords do not match.');
    setBusy(true);
    setError(null);
    try {
      await request('/api/admin/reset-password', { method: 'POST', body: { token, password } });
      setDone(true);
      setTimeout(() => router.replace('/admin/login'), 1800);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="New password" subtitle="Choose a password of at least 10 characters.">
      {!token ? (
        <AText color={A.accent} style={{ textAlign: 'center' }}>
          This reset link is missing its token. Request a new one.
        </AText>
      ) : done ? (
        <AText color={A.muted} style={{ textAlign: 'center' }}>
          Your password has been changed. Taking you to log in…
        </AText>
      ) : (
        <>
          <Field label="New password" value={password} onChangeText={setPassword} secureTextEntry placeholder="At least 10 characters" />
          <Field label="Confirm password" value={confirm} onChangeText={setConfirm} secureTextEntry placeholder="Repeat the password" onSubmitEditing={submit} error={error ?? undefined} />
          <Btn label="Save password" iconRight="arrow-right" onPress={submit} loading={busy} style={{ height: 52 }} />
        </>
      )}
      <TextLink href="/admin/forgot-password" label="Request a new link" />
    </AuthScreen>
  );
}
