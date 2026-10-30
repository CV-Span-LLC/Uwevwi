import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, PrimaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, fonts, layout } from '@/theme';

const PATTERN = require('../../assets/figma/contact-pattern.svg');
const CHEVRON = require('../../assets/figma/chevron-down.svg');

const CONTACT_EMAIL = 'hello@uwevwistudio.org';

const ENQUIRY_TYPES = [
  'Advisory',
  'Stewardship',
  'Studios & Exhibitions',
  'Research & Commissions',
  'Something else',
];

const noOutline = { outlineStyle: 'none' } as object;

function Label({ text, required }: { text: string; required?: boolean }) {
  return (
    <Txt variant="small">
      {text}
      {required ? <Txt variant="small" color={colors.accent}> *</Txt> : null}
    </Txt>
  );
}

function Hero() {
  const { isDesktop, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ backgroundColor: colors.accent, overflow: 'hidden' }}>
      <Image
        source={PATTERN}
        contentFit="cover"
        style={{ position: 'absolute', top: -120, left: 0, right: 0, height: 560, opacity: 0.4 }}
      />
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          paddingHorizontal: gutter,
          paddingTop: isDesktop ? 100 : 56,
          paddingBottom: isDesktop ? 65 : 48,
        }}
      >
        <View style={{ maxWidth: 616, gap: 24 }}>
          <Txt variant="large" color={colors.white}>
            CONTACT
          </Txt>
          <View style={{ maxWidth: 452 }}>
            <Txt variant="hero" color={colors.white}>
              Let’s Start a Conversation.
            </Txt>
          </View>
          <View style={{ maxWidth: 430, gap: 24 }}>
            <Txt color={colors.white}>
              Whether you are building a collection, managing cultural assets, exploring an acquisition or looking to
              develop a cultural programme, we would be glad to hear from you.
            </Txt>
            <Txt variant="small" color={colors.white}>
              Lagos, Nigeria
            </Txt>
          </View>
        </View>
      </View>
    </View>
  );
}

type Values = { name: string; email: string; company: string; type: string; message: string };
const EMPTY: Values = { name: '', email: '', company: '', type: '', message: '' };

function Input({
  value,
  onChangeText,
  placeholder,
  error,
  keyboardType,
  autoComplete,
}: {
  value: string;
  onChangeText: (t: string) => void;
  placeholder: string;
  error?: boolean;
  keyboardType?: 'email-address';
  autoComplete?: 'name' | 'email' | 'organization';
}) {
  return (
    <TextInput
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={colors.borders}
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      autoCapitalize={keyboardType ? 'none' : 'words'}
      style={[
        {
          height: 48,
          borderWidth: 1,
          borderColor: error ? colors.accent : colors.borders,
          borderRadius: 8,
          paddingHorizontal: 16,
          fontFamily: fonts.body,
          fontSize: 16,
          color: colors.text,
        },
        noOutline,
      ]}
    />
  );
}

function EnquirySelect({ value, onChange, error }: { value: string; onChange: (v: string) => void; error?: boolean }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: 5 }}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Enquiry type"
        onPress={() => setOpen((v) => !v)}
        style={{
          height: 48,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: error ? colors.accent : colors.borders,
          borderRadius: 8,
          paddingHorizontal: 16,
        }}
      >
        <Txt color={value ? colors.text : colors.borders}>{value || 'Select an enquiry type'}</Txt>
        <Image source={CHEVRON} style={{ width: 18, height: 18, transform: [{ rotate: open ? '180deg' : '0deg' }] }} contentFit="contain" />
      </Pressable>
      {open ? (
        <View
          style={{
            position: 'absolute',
            top: 52,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.borders,
            borderRadius: 8,
            paddingVertical: 4,
          }}
        >
          {ENQUIRY_TYPES.map((t) => (
            <Pressable
              key={t}
              accessibilityRole="button"
              onPress={() => {
                onChange(t);
                setOpen(false);
              }}
              style={{ paddingHorizontal: 16, paddingVertical: 12 }}
            >
              <Txt color={t === value ? colors.accent : colors.text}>{t}</Txt>
            </Pressable>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function EnquiryForm() {
  const { isMobile } = useBreakpoint();
  const [values, setValues] = useState<Values>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);

  const set = (key: keyof Values) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const emailOk = /^\S+@\S+\.\S+$/.test(values.email.trim());
  const errors = {
    name: !values.name.trim(),
    email: !emailOk,
    type: !values.type,
    message: !values.message.trim(),
  };
  const valid = !errors.name && !errors.email && !errors.type && !errors.message;

  const send = () => {
    setSubmitted(true);
    if (!valid) return;
    const lines = [
      `Name: ${values.name.trim()}`,
      `Email: ${values.email.trim()}`,
      values.company.trim() ? `Organisation: ${values.company.trim()}` : null,
      `Interested in: ${values.type}`,
      '',
      values.message.trim(),
    ].filter((l): l is string => l !== null);
    const url = `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(`Enquiry: ${values.type}`)}&body=${encodeURIComponent(lines.join('\n'))}`;
    Linking.openURL(url).catch(() => undefined);
    setSent(true);
    setValues(EMPTY);
    setSubmitted(false);
  };

  const row = { flexDirection: isMobile ? ('column' as const) : ('row' as const), gap: 24 };

  return (
    <Section paddingTop={65} paddingBottom={80} borderTop innerStyle={{ gap: 24 }} style={{ borderBottomWidth: 1, borderBottomColor: colors.borders }}>
      <Eyebrow>GET IN TOUCH</Eyebrow>
      <Txt variant="h1">Tell us how we can help.</Txt>
      <Txt color={colors.textSecondary}>
        Please fill in the form below and we’ll get back to you as soon as possible.
      </Txt>

      {sent ? (
        <View style={{ backgroundColor: colors.background, borderRadius: 8, padding: 24, gap: 12 }}>
          <Txt variant="h4">Thank you.</Txt>
          <Txt color={colors.textSecondary}>
            Your enquiry is ready in your email app. Send it to {CONTACT_EMAIL} and we will reply as soon as we can.
          </Txt>
          <PrimaryButton label="Write another enquiry" onPress={() => setSent(false)} />
        </View>
      ) : (
        <>
          <View style={row}>
            <View style={{ flex: 1, gap: 8 }}>
              <Label text="FULL NAME" required />
              <Input value={values.name} onChangeText={set('name')} placeholder="Your name" error={submitted && errors.name} autoComplete="name" />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <Label text="EMAIL ADDRESS" required />
              <Input
                value={values.email}
                onChangeText={set('email')}
                placeholder="you@company.com"
                error={submitted && errors.email}
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>
          </View>
          <View style={[row, { zIndex: 5 }]}>
            <View style={{ flex: 1, gap: 8 }}>
              <Label text="ORGANISATION/COMPANY (OPTIONAL)" />
              <Input value={values.company} onChangeText={set('company')} placeholder="Company Name" autoComplete="organization" />
            </View>
            <View style={{ flex: 1, gap: 8, zIndex: 5 }}>
              <Label text="I’M INTERESTED IN" required />
              <EnquirySelect value={values.type} onChange={set('type')} error={submitted && errors.type} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <Label text="MESSAGE" required />
            <TextInput
              value={values.message}
              onChangeText={set('message')}
              placeholder="Tell us a little about your enquiry....."
              placeholderTextColor={colors.borders}
              multiline
              style={[
                {
                  height: 275,
                  borderWidth: 1,
                  borderColor: submitted && errors.message ? colors.accent : colors.borders,
                  borderRadius: 8,
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  fontFamily: fonts.body,
                  fontSize: 16,
                  lineHeight: 26,
                  color: colors.text,
                  textAlignVertical: 'top',
                },
                noOutline,
              ]}
            />
          </View>
          {submitted && !valid ? (
            <Txt variant="small" color={colors.accent}>
              Please complete your name, a valid email address, the enquiry type and your message.
            </Txt>
          ) : null}
          <PrimaryButton label="Send Enquiry" onPress={send} />
          <Txt variant="small" color={colors.textSecondary}>
            We use your details only to reply to your enquiry. See our{' '}
            <Link href="/privacy-policy" style={{ color: colors.accent, textDecorationLine: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </Txt>
        </>
      )}
      <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)} style={{ alignSelf: 'flex-start' }}>
        <Txt variant="small" color={colors.textSecondary}>
          Or write to us directly at {CONTACT_EMAIL}
        </Txt>
      </Pressable>
    </Section>
  );
}

export default function Contact() {
  return (
    <SiteLayout>
      <Hero />
      <EnquiryForm />
    </SiteLayout>
  );
}
