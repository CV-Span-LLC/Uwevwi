import { Image } from 'expo-image';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { PixelWordmark } from '@/components/futuristic';
import { A, AText } from '@/admin/ui';
import { fonts } from '@/theme';

const LOGO_MARK = require('../../assets/figma/logo-mark.svg');
const LOGO_TEXT = require('../../assets/figma/logo-text.svg');

function Brand({ light }: { light?: boolean }) {
  const tint = light ? A.white : undefined;
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
      <Image source={LOGO_MARK} tintColor={tint} style={{ width: 30, height: 30 }} contentFit="contain" />
      <Image source={LOGO_TEXT} tintColor={tint} style={{ width: 112, height: 26 }} contentFit="contain" />
    </View>
  );
}

/** Split layout used by sign-in, forgot-password and reset-password. */
export function AuthScreen({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const split = width >= 900;
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: A.page }}>
      {split ? (
        <View style={{ width: '42%', maxWidth: 560, backgroundColor: A.sidebar, overflow: 'hidden' }}>
          <View style={{ position: 'absolute', left: 56, top: 0, bottom: 0, width: 3, backgroundColor: A.signal }} />
          <View style={{ flex: 1, paddingLeft: 96, paddingRight: 48, paddingVertical: 48, justifyContent: 'space-between' }}>
            <Brand light />
            <View style={{ gap: 20 }}>
              <AText kind="eyebrow" color={A.signal}>
                Uwevwi console
              </AText>
              <AText color={A.white} style={{ fontFamily: fonts.display, fontSize: 44, lineHeight: 48 }}>
                Stewarding cultural assets, one page at a time.
              </AText>
              <AText color="#a8a39a" style={{ maxWidth: 380 }}>
                Publish research, curate exhibitions, reply to visitors and keep the website images fresh, all from one place.
              </AText>
            </View>
            <View style={{ marginHorizontal: -96, marginRight: -48 }}>
              <PixelWordmark color="rgba(255,255,255,0.06)" crop={0.8} />
            </View>
          </View>
        </View>
      ) : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {!split ? (
          <View style={{ marginBottom: 28 }}>
            <Brand />
          </View>
        ) : null}
        <View style={{ width: '100%', maxWidth: 440, gap: 22 }}>
          <View style={{ gap: 8 }}>
            <AText color={A.text} style={{ fontFamily: fonts.display, fontSize: split ? 40 : 34, lineHeight: split ? 44 : 38 }}>
              {title}
            </AText>
            {subtitle ? <AText color={A.muted}>{subtitle}</AText> : null}
          </View>
          <View style={{ backgroundColor: A.white, borderRadius: 14, borderWidth: 1, borderColor: A.line, padding: split ? 28 : 20, gap: 18, boxShadow: '0 1px 2px rgba(23,23,23,0.04), 0 12px 32px rgba(23,23,23,0.05)' }}>{children}</View>
        </View>
      </ScrollView>
    </View>
  );
}

export function TextLink({ href, label }: { href: '/admin/login' | '/admin/forgot-password'; label: string }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link" style={{ alignSelf: 'center', padding: 4 }}>
        <AText kind="small" color={A.accent}>
          {label}
        </AText>
      </Pressable>
    </Link>
  );
}
