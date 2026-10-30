import type { ImageSource } from 'expo-image';
import type { Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { Eyebrow, Photo, PrimaryButton, SecondaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, layout } from '@/theme';

type PageHeroProps = {
  eyebrow: string;
  title: string;
  /** Body paragraphs under the title. */
  paragraphs: string[];
  cta?: { label: string; href: Href };
  image: ImageSource | number;
  imagePosition?: string;
  background?: string;
  titleWidth?: number;
};

/** Split hero used at the top of every inner page: copy on the left, a tall image bleeding off the right edge. */
export function PageHero({ eyebrow, title, paragraphs, cta, image, imagePosition, background = colors.white, titleWidth = 471 }: PageHeroProps) {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ backgroundColor: background }}>
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: isDesktop ? 38 : 36,
          paddingTop: isDesktop ? 60 : 32,
          paddingBottom: isDesktop ? 0 : 40,
          paddingLeft: gutter,
          paddingRight: isDesktop ? 0 : gutter,
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
        }}
      >
        <View style={{ width: isDesktop ? 486 : '100%', gap: 24 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <View style={{ width: isDesktop ? titleWidth : '100%' }}>
            <Txt variant="hero">{title}</Txt>
          </View>
          {paragraphs.map((p) => (
            <Txt key={p} color={colors.textSecondary}>
              {p}
            </Txt>
          ))}
          {cta ? <PrimaryButton label={cta.label} href={cta.href} /> : null}
        </View>
        <View
          style={{
            flex: isDesktop ? 1 : undefined,
            width: isDesktop ? undefined : '100%',
            height: isDesktop ? 800 : isMobile ? 340 : 520,
          }}
        >
          <Photo source={image} position={imagePosition} />
        </View>
      </View>
    </View>
  );
}

type CtaBannerProps = {
  title: string;
  text: string;
  label: string;
  href: Href;
  background?: string;
};

/** Centered closing call to action on a cream band. */
export function CtaBanner({ title, text, label, href, background = colors.background }: CtaBannerProps) {
  return (
    <Section background={background} paddingY={54} innerStyle={{ alignItems: 'center', gap: 24, paddingVertical: 20 }}>
      <Txt variant="h1" align="center">
        {title}
      </Txt>
      {text ? (
        <Txt color={colors.textSecondary} align="center">
          {text}
        </Txt>
      ) : null}
      <SecondaryButton label={label} href={href} />
    </Section>
  );
}

/** Eyebrow + display heading pair that opens a section. */
export function SectionTitle({ eyebrow, title, children, width }: { eyebrow: string; title: string; children?: ReactNode; width?: number | `${number}%` }) {
  return (
    <View style={{ gap: 24, width }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Txt variant="h2">{title}</Txt>
      {children}
    </View>
  );
}
