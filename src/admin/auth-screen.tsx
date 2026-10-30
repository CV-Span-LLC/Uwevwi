import { Image } from 'expo-image';
import { Link } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { A, AText } from '@/admin/ui';
import { fonts } from '@/theme';

const LOGO_MARK = require('../../assets/figma/logo-mark.svg');
const LOGO_TEXT = require('../../assets/figma/logo-text.svg');
const WOMAN = require('../../assets/figma/ill-a.svg');
const DESK = require('../../assets/figma/ill-b.svg');

/** Split layout used by sign-in, forgot-password and reset-password. */
export function AuthScreen({ title, children, subtitle }: { title: string; subtitle?: string; children: ReactNode }) {
  const { width } = useWindowDimensions();
  const split = width >= 900;
  return (
    <View style={{ flex: 1, flexDirection: 'row', backgroundColor: A.page }}>
      {split ? (
        <View style={{ width: 480, backgroundColor: A.sidebar }}>
          <View style={{ height: 68, justifyContent: 'center', paddingHorizontal: 14, borderBottomWidth: 2, borderBottomColor: A.page }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <Image source={LOGO_MARK} style={{ width: 27, height: 27 }} contentFit="contain" />
              <Image source={LOGO_TEXT} style={{ width: 100, height: 23.5 }} contentFit="contain" />
            </View>
          </View>
          <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: 352, height: 316 }} accessibilityElementsHidden>
              <Image source={DESK} style={{ position: 'absolute', left: 0, top: 130.6, width: 350.3, height: 184.7 }} contentFit="contain" />
              <Image source={WOMAN} style={{ position: 'absolute', left: 87, top: 0, width: 172.9, height: 250.8 }} contentFit="contain" />
            </View>
          </View>
        </View>
      ) : null}
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ flexGrow: 1, alignItems: 'center', justifyContent: 'center', padding: 20 }}>
        {!split ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Image source={LOGO_MARK} style={{ width: 27, height: 27 }} contentFit="contain" />
            <Image source={LOGO_TEXT} style={{ width: 100, height: 23.5 }} contentFit="contain" />
          </View>
        ) : null}
        <View style={{ width: '100%', maxWidth: 537, backgroundColor: A.white, borderRadius: 12, paddingHorizontal: split ? 60 : 24, paddingVertical: split ? 80 : 36, gap: 24 }}>
          <View style={{ gap: 8, marginBottom: 12 }}>
            <AText kind="title" color={A.accent} style={{ textAlign: 'center', fontSize: split ? 56 : 40, lineHeight: split ? 68 : 46, fontFamily: fonts.display }}>
              {title}
            </AText>
            {subtitle ? (
              <AText color={A.muted} style={{ textAlign: 'center' }}>
                {subtitle}
              </AText>
            ) : null}
          </View>
          {children}
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
