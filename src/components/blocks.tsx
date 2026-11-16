import { Image, type ImageSource } from 'expo-image';
import type { Href } from 'expo-router';
import type { ReactNode } from 'react';
import { View } from 'react-native';

import { ArrowLine, Frame, FramedPhoto, HoverCard, PixelBracket, SignalLine, TechButton } from '@/components/futuristic';
import { DotGrid } from '@/components/illustrations';
import { Eyebrow, Photo, Section, Txt, useBreakpoint } from '@/components/ui';
import { colors } from '@/theme';

const upper = { textTransform: 'uppercase' } as const;

type PageHeroProps = {
  eyebrow: string;
  title: string;
  /** Body paragraphs under the title; they are joined into one short block. */
  paragraphs: string[];
  cta?: { label: string; href: Href };
  /** A small framed figure on the right. Pages without one run the text across the band. */
  image?: ImageSource | number;
  imagePosition?: string;
  /** Mono line in the accent colour under the title, e.g. a last-updated date. */
  meta?: string;
  /** Breadcrumb text. Defaults to "Home / {eyebrow}". */
  crumb?: string;
};

/**
 * Header of every inner page. Deliberately shorter and quieter than the home hero: a blueprint-dot band with a
 * breadcrumb, the title and a few lines of copy on the left, and a small framed figure on the right.
 */
export function PageHero({ eyebrow, title, paragraphs, cta, image, imagePosition, meta, crumb }: PageHeroProps) {
  const { isDesktop, isMobile } = useBreakpoint();
  const variant = title.length <= 40 ? 'h1' : title.length <= 72 ? 'h2' : 'h3';
  return (
    <View style={{ backgroundColor: colors.background, overflow: 'hidden', borderBottomWidth: 1, borderBottomColor: colors.borders }}>
      <DotGrid id={`hero-${eyebrow.length}`} color="#e4ddd0" />
      <Frame background="transparent">
        <View style={{ paddingTop: 20 }}>
          <Txt variant="mono" color={colors.textSecondary} style={upper}>
            {crumb ?? `Home / ${eyebrow}`}
          </Txt>
        </View>
        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'stretch',
            justifyContent: 'space-between',
            gap: isDesktop ? 64 : 32,
            paddingTop: isDesktop ? 36 : 28,
            paddingBottom: isDesktop ? 56 : 44,
          }}
        >
          <View style={{ flex: isDesktop ? 1 : undefined, gap: isMobile ? 18 : 22, maxWidth: 680 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
              <View style={{ width: 28, height: 3, backgroundColor: colors.accent }} />
              <Eyebrow>{eyebrow}</Eyebrow>
            </View>
            <Txt variant={variant}>{title}</Txt>
            {meta ? (
              <Txt variant="mono" color={colors.accent}>
                {meta}
              </Txt>
            ) : null}
            {paragraphs.length ? (
              <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 580 }}>
                {`/ ${paragraphs.join(' ')}`}
              </Txt>
            ) : null}
            {cta ? <TechButton label={cta.label} href={cta.href} tone="accent" /> : null}
          </View>
          {image ? (
            <View style={{ width: isDesktop ? 380 : '100%', gap: 10, paddingHorizontal: isDesktop ? 0 : 9 }}>
              <FramedPhoto source={image} position={imagePosition} height={isDesktop ? 240 : isMobile ? 180 : 220} />
              <Txt variant="mono" color={colors.textSecondary} style={upper}>
                {`/Fig. ${eyebrow}`}
              </Txt>
            </View>
          ) : null}
        </View>
      </Frame>
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

/** Closing call to action, set between a pair of pixel brackets. */
export function CtaBanner({ title, text, label, href, background = colors.white }: CtaBannerProps) {
  const { isMobile, isDesktop } = useBreakpoint();
  const cell = isDesktop ? 12 : isMobile ? 5 : 9;
  return (
    <Section background={background} paddingY={100}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 10 : 32 }}>
        <PixelBracket side="left" color={colors.darkSection} cell={cell} />
        <View style={{ flex: 1, maxWidth: 720, alignItems: 'center', gap: 22 }}>
          <Eyebrow>Start a conversation</Eyebrow>
          <Txt variant="h1" align="center">
            {title}
          </Txt>
          {text ? (
            <Txt variant="monoBody" color={colors.textSecondary} align="center">
              {text}
            </Txt>
          ) : null}
          <TechButton label={label} href={href} tone="accent" />
        </View>
        <PixelBracket side="right" color={colors.signal} cell={cell} />
      </View>
    </Section>
  );
}

/** Label + display heading, with optional mono copy on the right on wide screens. */
export function SectionHead({ eyebrow, title, text, dark }: { eyebrow: string; title: string; text?: string; dark?: boolean }) {
  const { isDesktop } = useBreakpoint();
  return (
    <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'flex-start', gap: 24 }}>
      <View style={{ gap: 20, flexShrink: 1, maxWidth: 680 }}>
        <Eyebrow color={dark ? colors.signal : colors.accent}>{eyebrow}</Eyebrow>
        <Txt variant="h2" color={dark ? colors.white : colors.text}>
          {title}
        </Txt>
      </View>
      {text ? (
        <Txt variant="monoBody" color={dark ? 'rgba(255,255,255,0.72)' : colors.textSecondary} style={{ maxWidth: 480 }}>
          {`/ ${text}`}
        </Txt>
      ) : null}
    </View>
  );
}

/** Label and heading in a column. */
export function SectionTitle({ eyebrow, title, children, width }: { eyebrow: string; title: string; children?: ReactNode; width?: number | `${number}%` }) {
  return (
    <View style={{ gap: 20, width }}>
      <Eyebrow>{eyebrow}</Eyebrow>
      <Txt variant="h2">{title}</Txt>
      {children}
    </View>
  );
}

export type CardItem = {
  title: string;
  text: string;
  /** Short bold line above the text. */
  lead?: string;
  tags?: string[];
  icon?: ImageSource | number;
  image?: ImageSource | number;
};

/** Bordered grid of numbered cards that flip to dark on hover. */
export function CardGrid({
  items,
  desktop = 3,
  tablet = 2,
  minHeight = 240,
  background = colors.white,
}: {
  items: CardItem[];
  desktop?: number;
  tablet?: number;
  minHeight?: number;
  background?: string;
}) {
  const { isDesktop, isMobile } = useBreakpoint();
  const cols = isDesktop ? desktop : isMobile ? 1 : tablet;
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: colors.borders }}>
      {items.map((item, i) => (
        <HoverCard
          key={item.title}
          style={{
            width: `${100 / cols}%`,
            minHeight: isMobile ? Math.min(minHeight, 200) : minHeight,
            padding: 26,
            gap: 28,
            justifyContent: 'flex-start',
            backgroundColor: background,
            borderRightWidth: 1,
            borderBottomWidth: 1,
            borderColor: colors.borders,
          }}
          hoverStyle={{ backgroundColor: colors.darkSection }}
        >
          {(on) => (
            <>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Txt variant="mono" color={on ? colors.signal : colors.accent}>
                  {`/${String(i + 1).padStart(2, '0')}`}
                </Txt>
                {item.icon ? <Image source={item.icon} tintColor={on ? colors.white : colors.darkSection} style={{ width: 30, height: 30 }} contentFit="contain" /> : null}
                {item.image ? <Image source={item.image} style={{ width: 56, height: 56 }} contentFit="cover" /> : null}
              </View>
              <View style={{ gap: 10 }}>
                <Txt variant="h4" color={on ? colors.white : colors.text}>
                  {item.title}
                </Txt>
                {item.lead ? (
                  <Txt variant="small" color={on ? colors.white : colors.text} style={{ fontFamily: 'Inter_500Medium' }}>
                    {item.lead}
                  </Txt>
                ) : null}
                <Txt variant="small" color={on ? 'rgba(255,255,255,0.72)' : colors.textSecondary}>
                  {item.text}
                </Txt>
                {item.tags ? (
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6, paddingTop: 4 }}>
                    {item.tags.map((t) => (
                      <View key={t} style={{ borderWidth: 1, borderColor: on ? colors.darkLine : colors.borders, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 2 }}>
                        <Txt variant="mono" color={on ? 'rgba(255,255,255,0.8)' : colors.textSecondary} style={upper}>
                          {t}
                        </Txt>
                      </View>
                    ))}
                  </View>
                ) : null}
              </View>
            </>
          )}
        </HoverCard>
      ))}
    </View>
  );
}

/** A dark band with the red rule down its left edge. */
export function DarkBand({ children, paddingY = 100 }: { children: ReactNode; paddingY?: number }) {
  const { isMobile } = useBreakpoint();
  return (
    <Frame background={colors.darkSection} overflow="hidden">
      <View>
        <SignalLine />
        <View style={{ paddingLeft: isMobile ? 28 : 84, paddingVertical: isMobile ? Math.round(paddingY * 0.6) : paddingY, gap: isMobile ? 40 : 56 }}>{children}</View>
      </View>
    </Frame>
  );
}

/** Image on one side, label / heading / copy / button on the other. */
export function SplitBand({
  image,
  eyebrow,
  title,
  text,
  cta,
  reverse,
  background = colors.white,
}: {
  image: ImageSource | number;
  eyebrow: string;
  title: string;
  text?: string;
  cta?: { label: string; href: Href };
  reverse?: boolean;
  background?: string;
}) {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section background={background} paddingY={100}>
      <View style={{ flexDirection: isDesktop ? (reverse ? 'row-reverse' : 'row') : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: isDesktop ? 80 : 40 }}>
        <View style={{ width: isDesktop ? 560 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
          <FramedPhoto source={image} height={isDesktop ? 400 : isMobile ? 260 : 340} frame={background === colors.white ? colors.background : colors.white} />
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24 }}>
          <Eyebrow>{eyebrow}</Eyebrow>
          <Txt variant="h2">{title}</Txt>
          {text ? (
            <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 480 }}>
              {`/ ${text}`}
            </Txt>
          ) : null}
          {cta ? <TechButton label={cta.label} href={cta.href} tone="ink" /> : null}
        </View>
      </View>
    </Section>
  );
}

/** Large pull quote between pixel brackets. */
export function BracketQuote({ eyebrow, text, note, byline, background = colors.white }: { eyebrow: string; text: string; note?: string; byline?: string; background?: string }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const cell = isDesktop ? 14 : isMobile ? 6 : 10;
  return (
    <Section background={background} paddingY={100}>
      <View style={{ alignItems: 'center', gap: 32 }}>
        <Eyebrow>{eyebrow}</Eyebrow>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 32 }}>
          <PixelBracket side="left" color={colors.darkSection} cell={cell} />
          <View style={{ flex: 1, maxWidth: 760, alignItems: 'center', gap: 28 }}>
            <Txt variant="h3" align="center">
              {text}
            </Txt>
            {note ? (
              <Txt variant="monoBody" color={colors.textSecondary} align="center">
                {note}
              </Txt>
            ) : null}
            {byline ? (
              <Txt variant="mono" color={colors.textSecondary} style={upper}>
                {byline}
              </Txt>
            ) : null}
          </View>
          <PixelBracket side="right" color={colors.signal} cell={cell} />
        </View>
      </View>
    </Section>
  );
}

/** Numbered steps joined by a line, e.g. Assessing → Structuring → Protecting → Continuing. */
export function Steps({ items }: { items: { title: string; text: string }[] }) {
  const { isDesktop } = useBreakpoint();
  return (
    <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 0 : 28 }}>
      {items.map((s, i) => (
        <View key={s.title} style={{ flex: 1, gap: 14, paddingRight: isDesktop ? 28 : 0 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={{ width: 34, height: 34, borderRadius: 17, borderWidth: 1, borderColor: colors.accent, alignItems: 'center', justifyContent: 'center', backgroundColor: colors.white }}>
              <Txt variant="mono" color={colors.accent}>
                {String(i + 1).padStart(2, '0')}
              </Txt>
            </View>
            {isDesktop && i < items.length - 1 ? <ArrowLine color={colors.borders} /> : null}
          </View>
          <Txt variant="h4">{s.title}</Txt>
          <Txt variant="small" color={colors.textSecondary}>
            {s.text}
          </Txt>
        </View>
      ))}
    </View>
  );
}

/** Full-width photo with a mono caption. */
export function ImageBand({ image, caption, height = 420, position = 'center' }: { image: ImageSource | number; caption?: string; height?: number; position?: string }) {
  const { isMobile } = useBreakpoint();
  return (
    <View style={{ height: isMobile ? Math.round(height * 0.55) : height, backgroundColor: colors.darkSection }}>
      <Photo source={image} position={position} />
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(23,23,23,0.18)' }} />
      {caption ? (
        <View style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: colors.white, paddingHorizontal: 18, paddingVertical: 12 }}>
          <Txt variant="mono" color={colors.textSecondary} style={upper}>
            {caption}
          </Txt>
        </View>
      ) : null}
    </View>
  );
}
