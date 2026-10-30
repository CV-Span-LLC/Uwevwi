import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, PrimaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { assetUrl, publicApi, type Exhibition } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';
import { colors, layout } from '@/theme';

const ARROW = require('../../../assets/figma/arrow-left.svg');

const src = (path: string | null | undefined) => ({ uri: assetUrl(path) as string });

function Hero({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const [edition, ...rest] = exhibition.edition.split('·').map((p) => p.trim());
  return (
    <Section paddingTop={100} paddingBottom={80} innerStyle={{ gap: 24 }}>
      <Link href="/studios" asChild>
        <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, alignSelf: 'flex-start', paddingVertical: 20 }}>
          <Image source={ARROW} style={{ width: 24, height: 24, transform: [{ scaleX: -1 }] }} contentFit="contain" />
          <Txt variant="nav">Back to Studios</Txt>
        </Pressable>
      </Link>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', justifyContent: 'space-between', gap: 40 }}>
        <View style={{ width: isDesktop ? 448 : '100%', gap: 24, paddingTop: isDesktop ? 54 : 0 }}>
          <Eyebrow>{(exhibition.series || exhibition.title).toUpperCase()}</Eyebrow>
          <Txt variant="hero">{exhibition.title}</Txt>
          {edition ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <Txt variant="large" color={colors.textSecondary}>
                {edition}
              </Txt>
              {rest.length > 0 ? (
                <>
                  <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: colors.textSecondary }} />
                  <Txt variant="large" color={colors.textSecondary}>
                    {rest.join(' · ').toUpperCase()}
                  </Txt>
                </>
              ) : null}
            </View>
          ) : null}
          <Txt>{exhibition.intro}</Txt>
          <View style={{ gap: 8 }}>
            <Txt variant="small" color={colors.textSecondary}>
              {exhibition.dateLabel}
            </Txt>
            <Txt variant="small" color={colors.textSecondary}>
              {exhibition.location}
            </Txt>
          </View>
        </View>
        {exhibition.flyer ? (
          <View style={{ width: isDesktop ? 661 : '100%', height: isDesktop ? 816 : isMobile ? 440 : 640 }}>
            <Photo source={src(exhibition.flyer)} contentFit="contain" position={isDesktop ? 'top' : 'center'} />
          </View>
        ) : null}
      </View>
    </Section>
  );
}

function Experience({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  const cardW = isMobile ? 240 : 336;
  const cardH = isMobile ? 315 : 441;
  if (exhibition.gallery.length === 0) return null;
  return (
    <View style={{ backgroundColor: colors.background, paddingVertical: isMobile ? 48 : 80, gap: 24 }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          paddingHorizontal: gutter,
          flexDirection: isDesktop ? 'row' : 'column',
          justifyContent: 'space-between',
          alignItems: isDesktop ? 'flex-end' : 'flex-start',
          gap: 24,
        }}
      >
        <View style={{ width: isDesktop ? 583 : '100%', gap: 24 }}>
          <Eyebrow>EXHIBITION EXPERIENCE</Eyebrow>
          <Txt variant="h1">{exhibition.galleryHeading || exhibition.title}</Txt>
        </View>
        {exhibition.galleryText ? (
          <View style={{ width: isDesktop ? 429 : '100%' }}>
            <Txt color={colors.textSecondary}>{exhibition.galleryText}</Txt>
          </View>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: gutter }}>
        {exhibition.gallery.map((path) => (
          <View key={path} style={{ width: cardW, height: cardH, borderRadius: 12, overflow: 'hidden' }}>
            <Photo source={src(path)} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Artists({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const [selected, setSelected] = useState(0);
  const artists = exhibition.artists;
  if (artists.length === 0) return null;
  const artist = artists[Math.min(selected, artists.length - 1)];
  const bio = artist.bio.split(/\n{2,}/).filter(Boolean);
  return (
    <Section paddingY={80} innerStyle={{ gap: 34 }}>
      <View style={{ maxWidth: 644, gap: 24 }}>
        <Eyebrow>MEET THE ARTISTS</Eyebrow>
        <Txt variant="h1">{artists.length === 1 ? 'One artist. One perspective.' : `${artists.length} artists. ${artists.length} perspectives.`}</Txt>
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'flex-start' : 'stretch', justifyContent: 'space-between', gap: 32 }}>
        <View style={{ width: isDesktop ? 308 : '100%', height: isMobile ? 360 : 391, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background }}>
          {artist.photo ? <Photo source={src(artist.photo)} position="top" /> : null}
        </View>
        <View style={{ width: isDesktop ? 374 : '100%', gap: 16 }}>
          <Txt variant="h2">{artist.name}</Txt>
          {bio.map((p) => (
            <Txt key={p} color={colors.textSecondary}>
              {p}
            </Txt>
          ))}
        </View>
        {artist.works.length > 0 ? (
          <View style={{ width: isDesktop ? 438 : '100%', gap: 8 }}>
            {artist.works.slice(0, 2).map((work) => (
              <View key={work} style={{ width: '100%', height: isMobile ? 240 : 321, borderRadius: 8, overflow: 'hidden' }}>
                <Photo source={src(work)} />
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {artists.map((a, i) => {
          const active = i === selected;
          return (
            <Pressable
              key={`${a.name}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${a.name}`}
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(i)}
              style={{ width: isMobile ? 120 : 142, gap: 14 }}
            >
              <View style={{ height: 240, borderRadius: 8, overflow: 'hidden', borderWidth: active ? 0.58 : 0, borderColor: colors.accent, backgroundColor: colors.background }}>
                {a.photo ? <Photo source={src(a.photo)} /> : null}
              </View>
              <Txt variant="overline" color={active ? colors.accent : colors.textSecondary}>
                {a.name}
              </Txt>
            </Pressable>
          );
        })}
      </ScrollView>
    </Section>
  );
}

function CuratorialNote({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  if (!exhibition.noteHeading) return null;
  const background = exhibition.gallery[3] ?? exhibition.gallery[0] ?? exhibition.flyer;
  return (
    <View style={{ minHeight: isMobile ? 480 : 436, justifyContent: 'center', backgroundColor: colors.darkSection }}>
      {background ? (
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
          <Photo source={src(background)} />
        </View>
      ) : null}
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(51,51,51,0.45)' }} />
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'flex-start',
          gap: isDesktop ? 125 : 24,
          paddingHorizontal: gutter,
          paddingVertical: isMobile ? 48 : 0,
        }}
      >
        <View style={{ width: isDesktop ? 676 : '100%', gap: 24 }}>
          <Txt variant="large" color={colors.white}>
            CURATORIAL NOTE
          </Txt>
          <Txt variant="h1" color={colors.white}>
            {exhibition.noteHeading}
          </Txt>
        </View>
        {exhibition.noteText ? (
          <View style={{ width: isDesktop ? 382 : '100%' }}>
            <Txt variant="large" color={colors.white}>
              {exhibition.noteText}
            </Txt>
          </View>
        ) : null}
      </View>
    </View>
  );
}

export default function ExhibitionPage() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading, reload } = useRemote(() => publicApi<Exhibition>(`/exhibitions/${slug}`), [slug]);

  return (
    <SiteLayout>
      {data ? (
        <>
          <Hero exhibition={data} />
          <Experience exhibition={data} />
          <Artists exhibition={data} />
          <CuratorialNote exhibition={data} />
        </>
      ) : (
        <Section background={colors.background} paddingY={140} innerStyle={{ gap: 24 }}>
          <Txt variant="h1">{loading ? 'Loading the exhibition…' : error ?? 'We could not find that exhibition.'}</Txt>
          {!loading ? <PrimaryButton label="Try again" onPress={reload} /> : null}
          {!loading ? <PrimaryButton label="Back to Studios" href="/studios" /> : null}
        </Section>
      )}
    </SiteLayout>
  );
}
