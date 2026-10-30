import { useState } from 'react';

import { AuthScreen, TextLink } from '@/admin/auth-screen';
import { A, AText, Btn, Field, errorText } from '@/admin/ui';
import { request } from '@/lib/api';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submit = async () => {
    if (busy) return;
    if (!/^\S+@\S+\.\S+$/.test(email.trim())) {
      setError('Enter the email address you sign in with.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await request('/api/admin/forgot-password', { method: 'POST', body: { email: email.trim() } });
      setSent(true);
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Reset password" subtitle="Enter your email and we will send you a link to choose a new password.">
      {sent ? (
        <AText color={A.muted} style={{ textAlign: 'center' }}>
          If that email belongs to an admin account, a reset link is on its way. The link works for one hour.
        </AText>
      ) : (
        <>
          <Field label="Email address" value={email} onChangeText={setEmail} placeholder="you@uwevwistudio.org" keyboardType="email-address" onSubmitEditing={submit} error={error ?? undefined} />
          <Btn label="Send reset link" iconRight="arrow-right" onPress={submit} loading={busy} style={{ height: 52 }} />
        </>
      )}
      <TextLink href="/admin/login" label="Back to log in" />
    </AuthScreen>
  );
}
