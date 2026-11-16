import { Link, useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { Frame, FramedPhoto, SignalLine, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { assetUrl, publicApi, type Exhibition } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';
import { colors, layout } from '@/theme';

const src = (path: string | null | undefined) => ({ uri: assetUrl(path) as string });
const upper = { textTransform: 'uppercase' } as const;

function Hero({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const [edition, ...rest] = exhibition.edition.split('·').map((p) => p.trim());
  const chips = [edition, ...rest].filter(Boolean);
  return (
    <Frame background={colors.background}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borders }}>
        <Link href="/studios" asChild>
          <Pressable accessibilityRole="link">
            <Txt variant="mono" color={colors.accent}>
              ← BACK TO STUDIOS
            </Txt>
          </Pressable>
        </Link>
        <Txt variant="mono" color={colors.textSecondary} style={upper}>
          {`Studios / ${(exhibition.series || exhibition.title).slice(0, 28)}`}
        </Txt>
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: isDesktop ? 64 : 32, paddingVertical: isMobile ? 32 : 52 }}>
        {exhibition.flyer ? (
          <View style={{ width: isDesktop ? 340 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
            <FramedPhoto source={src(exhibition.flyer)} contentFit="contain" position="top" height={isDesktop ? 440 : isMobile ? 400 : 520} />
          </View>
        ) : null}
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 26 }}>
          <Eyebrow>{exhibition.series || exhibition.title}</Eyebrow>
          <Txt variant={exhibition.title.length > 40 ? 'h2' : 'h1'}>{exhibition.title}</Txt>
          {chips.length ? (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
              {chips.map((c) => (
                <View key={c} style={{ borderWidth: 1, borderColor: colors.borders, backgroundColor: colors.white, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 2 }}>
                  <Txt variant="mono" color={colors.text} style={upper}>
                    {c}
                  </Txt>
                </View>
              ))}
            </View>
          ) : null}
          <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 520 }}>
            {`/ ${exhibition.intro}`}
          </Txt>
          <View style={{ gap: 6, borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 14 }}>
            <Txt variant="mono" color={colors.textSecondary}>
              {exhibition.dateLabel}
            </Txt>
            <Txt variant="mono" color={colors.textSecondary}>
              {exhibition.location}
            </Txt>
          </View>
        </View>
      </View>
    </Frame>
  );
}

function Experience({ exhibition }: { exhibition: Exhibition }) {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  const cardW = isMobile ? 240 : 336;
  const cardH = isMobile ? 315 : 441;
  if (exhibition.gallery.length === 0) return null;
  return (
    <View style={{ backgroundColor: colors.white, paddingVertical: isMobile ? 56 : 100, gap: 40 }}>
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
        <View style={{ maxWidth: 640, gap: 20 }}>
          <Eyebrow>Exhibition experience</Eyebrow>
          <Txt variant="h2">{exhibition.galleryHeading || exhibition.title}</Txt>
        </View>
        {exhibition.galleryText ? (
          <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 440 }}>
            {`/ ${exhibition.galleryText}`}
          </Txt>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 12, paddingHorizontal: gutter }}>
        {exhibition.gallery.map((path, i) => (
          <View key={path} style={{ width: cardW, gap: 10 }}>
            <View style={{ height: cardH, backgroundColor: colors.background, padding: 6 }}>
              <Photo source={src(path)} />
            </View>
            <Txt variant="mono" color={colors.textSecondary}>
              {`/${String(i + 1).padStart(2, '0')}`}
            </Txt>
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
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: 48 }}>
      <View style={{ maxWidth: 680, gap: 20 }}>
        <Eyebrow>Meet the artists</Eyebrow>
        <Txt variant="h2">{artists.length === 1 ? 'One artist. One perspective.' : `${artists.length} artists. ${artists.length} perspectives.`}</Txt>
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'flex-start' : 'stretch', gap: 40 }}>
        <View style={{ width: isDesktop ? 320 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
          {artist.photo ? (
            <FramedPhoto source={src(artist.photo)} position="top" height={isMobile ? 360 : 400} />
          ) : (
            <View style={{ height: isMobile ? 360 : 400, backgroundColor: colors.white }} />
          )}
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 16 }}>
          <Txt variant="h2">{artist.name}</Txt>
          {bio.map((p) => (
            <Txt key={p} color={colors.textSecondary}>
              {p}
            </Txt>
          ))}
        </View>
        {artist.works.length > 0 ? (
          <View style={{ width: isDesktop ? 400 : '100%', gap: 10 }}>
            {artist.works.slice(0, 2).map((work) => (
              <View key={work} style={{ height: isMobile ? 240 : 300, backgroundColor: colors.white, padding: 6 }}>
                <Photo source={src(work)} />
              </View>
            ))}
          </View>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
        {artists.map((a, i) => {
          const active = i === selected;
          return (
            <Pressable
              key={`${a.name}-${i}`}
              accessibilityRole="button"
              accessibilityLabel={`Show ${a.name}`}
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(i)}
              style={{ width: isMobile ? 120 : 142, gap: 10 }}
            >
              <View style={{ height: 200, padding: 4, backgroundColor: colors.white, borderWidth: 1, borderColor: active ? colors.accent : colors.borders, opacity: active ? 1 : 0.75 }}>
                {a.photo ? <Photo source={src(a.photo)} /> : null}
              </View>
              <Txt variant="mono" color={active ? colors.accent : colors.textSecondary} numberOfLines={2}>
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
    <View style={{ minHeight: isMobile ? 480 : 480, justifyContent: 'center', backgroundColor: colors.darkSection, overflow: 'hidden' }}>
      {background ? (
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
          <Photo source={src(background)} />
        </View>
      ) : null}
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(23,22,20,0.78)' }} />
      <View style={{ width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: gutter }}>
        <View style={{ position: 'relative' }}>
          <SignalLine />
          <View
            style={{
              flexDirection: isDesktop ? 'row' : 'column',
              alignItems: isDesktop ? 'center' : 'flex-start',
              gap: isDesktop ? 100 : 28,
              paddingLeft: isMobile ? 28 : 84,
              paddingVertical: isMobile ? 56 : 96,
            }}
          >
            <View style={{ flex: isDesktop ? 1 : undefined, gap: 24 }}>
              <Eyebrow color={colors.signal}>Curatorial note</Eyebrow>
              <Txt variant="h1" color={colors.white}>
                {exhibition.noteHeading}
              </Txt>
            </View>
            {exhibition.noteText ? (
              <Txt variant="monoBody" color="rgba(255,255,255,0.8)" style={{ flex: isDesktop ? 1 : undefined, maxWidth: 440 }}>
                {`/ ${exhibition.noteText}`}
              </Txt>
            ) : null}
          </View>
        </View>
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
          <Eyebrow>{loading ? 'Loading' : 'Exhibition'}</Eyebrow>
          <Txt variant="h1">{loading ? 'Loading the exhibition…' : error ?? 'We could not find that exhibition.'}</Txt>
          {!loading ? <TechButton label="Try again" onPress={reload} tone="accent" /> : null}
          {!loading ? <TechButton label="Back to Studios" href="/studios" tone="ink" /> : null}
        </Section>
      )}
    </SiteLayout>
  );
}
