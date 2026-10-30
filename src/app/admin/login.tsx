import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { AuthScreen, TextLink } from '@/admin/auth-screen';
import { useAuth } from '@/admin/auth';
import { Icon } from '@/admin/icons';
import { A, AText, Btn, Field, errorText } from '@/admin/ui';

export default function Login() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [remember, setRemember] = useState(true);
  const [show, setShow] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async () => {
    if (busy) return;
    if (!email.trim() || !password) {
      setError('Enter your user name and password.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await signIn(email.trim(), password, remember);
    } catch (err) {
      setError(errorText(err));
      setBusy(false);
    }
  };

  return (
    <AuthScreen title="Welcome Back">
      <Field label="User Name" value={email} onChangeText={setEmail} placeholder="you@uwevwistudio.org" keyboardType="email-address" onSubmitEditing={submit} />
      <Field
        label="Password"
        value={password}
        onChangeText={setPassword}
        placeholder="Your password"
        secureTextEntry={!show}
        onSubmitEditing={submit}
        trailing={
          <Pressable accessibilityRole="button" accessibilityLabel={show ? 'Hide password' : 'Show password'} onPress={() => setShow((v) => !v)} hitSlop={8}>
            <Icon name={show ? 'eye-off' : 'eye'} size={18} color={A.muted} />
          </Pressable>
        }
      />
      <Pressable accessibilityRole="checkbox" accessibilityState={{ checked: remember }} onPress={() => setRemember((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <View style={{ width: 22, height: 22, borderRadius: 5, backgroundColor: remember ? A.accent : A.white, borderWidth: 1, borderColor: A.accent, alignItems: 'center', justifyContent: 'center' }}>
          {remember ? <Icon name="check" size={14} color={A.white} strokeWidth={2.4} /> : null}
        </View>
        <AText kind="small" color={A.accent}>
          Remember me on this computer
        </AText>
      </Pressable>
      {error ? (
        <AText kind="small" color={A.accent}>
          {error}
        </AText>
      ) : null}
      <Btn label="Log In" iconRight="arrow-right" onPress={submit} loading={busy} style={{ height: 52 }} />
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <View style={{ flex: 1, height: 1, backgroundColor: A.line }} />
        <AText kind="small" color={A.muted}>
          OR
        </AText>
        <View style={{ flex: 1, height: 1, backgroundColor: A.line }} />
      </View>
      <TextLink href="/admin/forgot-password" label="Forgot Password?" />
    </AuthScreen>
  );
}
