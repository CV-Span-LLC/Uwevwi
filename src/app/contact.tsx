import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Linking, Pressable, TextInput, View } from 'react-native';

import { DarkBand } from '@/components/blocks';
import { ArrowLine, BlinkPlus, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Section, Txt, useBreakpoint } from '@/components/ui';
import { ApiError, publicApi } from '@/lib/api';
import { colors, fonts } from '@/theme';

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

function FieldLabel({ text, required }: { text: string; required?: boolean }) {
  return (
    <Txt variant="mono" color={colors.darkSection}>
      {text}
      {required ? <Txt variant="mono" color={colors.accent}> *</Txt> : null}
    </Txt>
  );
}

function Hero() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <View>
      <DarkBand paddingY={72}>
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'flex-start', gap: 36 }}>
          <View style={{ gap: 22, maxWidth: 680 }}>
            <Eyebrow color={colors.signal}>Contact</Eyebrow>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <ArrowLine color={colors.signal} width={isMobile ? 44 : 72} />
              <BlinkPlus color={colors.signal} size={isMobile ? 24 : 32} />
            </View>
            <Txt variant="h1" color={colors.white}>
              Let’s Start a Conversation.
            </Txt>
          </View>
          <View style={{ gap: 18, maxWidth: 440 }}>
            <Txt variant="monoBody" color="rgba(255,255,255,0.78)">
              / Whether you are building a collection, managing cultural assets, exploring an acquisition or looking to
              develop a cultural programme, we would be glad to hear from you.
            </Txt>
            <Txt variant="mono" color="#8d877e">
              LAGOS, NIGERIA
            </Txt>
          </View>
        </View>
      </DarkBand>
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
      placeholderTextColor="#b3ada3"
      keyboardType={keyboardType}
      autoComplete={autoComplete}
      autoCapitalize={keyboardType ? 'none' : 'words'}
      style={[
        {
          height: 52,
          borderWidth: 1,
          borderColor: error ? colors.accent : colors.borders,
          backgroundColor: colors.white,
          borderRadius: 2,
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
          height: 52,
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderWidth: 1,
          borderColor: error ? colors.accent : colors.borders,
          backgroundColor: colors.white,
          borderRadius: 2,
          paddingHorizontal: 16,
        }}
      >
        <Txt color={value ? colors.text : '#b3ada3'}>{value || 'Select an enquiry type'}</Txt>
        <Image source={CHEVRON} style={{ width: 18, height: 18, transform: [{ rotate: open ? '180deg' : '0deg' }] }} contentFit="contain" />
      </Pressable>
      {open ? (
        <View
          style={{
            position: 'absolute',
            top: 56,
            left: 0,
            right: 0,
            backgroundColor: colors.white,
            borderWidth: 1,
            borderColor: colors.borders,
            borderRadius: 2,
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
  const { isDesktop, isMobile } = useBreakpoint();
  const [values, setValues] = useState<Values>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const set = (key: keyof Values) => (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  const emailOk = /^\S+@\S+\.\S+$/.test(values.email.trim());
  const errors = {
    name: !values.name.trim(),
    email: !emailOk,
    type: !values.type,
    message: !values.message.trim(),
  };
  const valid = !errors.name && !errors.email && !errors.type && !errors.message;

  const send = async () => {
    setSubmitted(true);
    setServerError(null);
    if (!valid || sending) return;
    setSending(true);
    try {
      await publicApi('/contact', {
        method: 'POST',
        body: { name: values.name, email: values.email, organisation: values.company, topic: values.type, message: values.message },
      });
      setSent(true);
      setValues(EMPTY);
      setSubmitted(false);
    } catch (err) {
      setServerError(err instanceof ApiError ? err.message : 'We could not send your enquiry. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const row = { flexDirection: isMobile ? ('column' as const) : ('row' as const), gap: 24 };

  return (
    <Section background={colors.background} paddingY={100} innerStyle={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 80 : 40 }}>
      <View style={{ width: isDesktop ? 320 : '100%', gap: 24 }}>
        <Eyebrow>Get in touch</Eyebrow>
        <Txt variant="h2">Tell us how we can help.</Txt>
        <Txt variant="monoBody" color={colors.textSecondary}>
          / Please fill in the form and we’ll get back to you as soon as possible.
        </Txt>
        <View style={{ gap: 10, borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 14 }}>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`mailto:${CONTACT_EMAIL}`)}>
            <Txt variant="mono" color={colors.darkSection}>
              {CONTACT_EMAIL}
            </Txt>
          </Pressable>
          <Txt variant="mono" color={colors.textSecondary}>
            LAGOS, NIGERIA
          </Txt>
        </View>
      </View>

      <View style={{ flex: isDesktop ? 1 : undefined, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borders, padding: isMobile ? 20 : 36, gap: 24 }}>
      {sent ? (
        <View style={{ backgroundColor: colors.background, borderWidth: 1, borderColor: colors.borders, padding: 28, gap: 14 }}>
          <Txt variant="h4">Thank you.</Txt>
          <Txt color={colors.textSecondary}>
            We have received your enquiry and will reply as soon as we can.
          </Txt>
          <TechButton label="Write another enquiry" onPress={() => setSent(false)} tone="ink" />
        </View>
      ) : (
        <>
          <View style={row}>
            <View style={{ flex: 1, gap: 8 }}>
              <FieldLabel text="FULL NAME" required />
              <Input value={values.name} onChangeText={set('name')} placeholder="Your name" error={submitted && errors.name} autoComplete="name" />
            </View>
            <View style={{ flex: 1, gap: 8 }}>
              <FieldLabel text="EMAIL ADDRESS" required />
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
              <FieldLabel text="ORGANISATION/COMPANY (OPTIONAL)" />
              <Input value={values.company} onChangeText={set('company')} placeholder="Company Name" autoComplete="organization" />
            </View>
            <View style={{ flex: 1, gap: 8, zIndex: 5 }}>
              <FieldLabel text="I’M INTERESTED IN" required />
              <EnquirySelect value={values.type} onChange={set('type')} error={submitted && errors.type} />
            </View>
          </View>
          <View style={{ gap: 8 }}>
            <FieldLabel text="MESSAGE" required />
            <TextInput
              value={values.message}
              onChangeText={set('message')}
              placeholder="Tell us a little about your enquiry....."
              placeholderTextColor="#b3ada3"
              multiline
              style={[
                {
                  height: 240,
                  borderWidth: 1,
                  borderColor: submitted && errors.message ? colors.accent : colors.borders,
                  backgroundColor: colors.white,
                  borderRadius: 2,
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
          {serverError ? (
            <Txt variant="small" color={colors.accent}>
              {serverError}
            </Txt>
          ) : null}
          <TechButton label={sending ? 'Sending…' : 'Send enquiry'} onPress={send} tone="accent" style={sending ? { opacity: 0.5 } : undefined} />
          <Txt variant="small" color={colors.textSecondary}>
            We use your details only to reply to your enquiry. See our{' '}
            <Link href="/privacy-policy" style={{ color: colors.accent, textDecorationLine: 'underline' }}>
              Privacy Policy
            </Link>
            .
          </Txt>
        </>
      )}
      </View>
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
