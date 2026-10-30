import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, layout } from '@/theme';

const FLYER = require('../../../assets/figma/afh-flyer.jpg');
const ARROW = require('../../../assets/figma/arrow-left.svg');

const GALLERY = [
  require('../../../assets/figma/ex-gallery-1.jpg'),
  require('../../../assets/figma/ex-gallery-2.jpg'),
  require('../../../assets/figma/ex-gallery-3.jpg'),
  require('../../../assets/figma/ex-gallery-4.jpg'),
  require('../../../assets/figma/ex-gallery-5.jpg'),
  require('../../../assets/figma/ex-gallery-6.jpg'),
  require('../../../assets/figma/ex-gallery-7.jpg'),
  require('../../../assets/figma/ex-gallery-8.jpg'),
  require('../../../assets/figma/ex-gallery-9.jpg'),
  require('../../../assets/figma/ex-gallery-10.jpg'),
];

type Artist = {
  name: string;
  thumb: number;
  /** Only the featured artist has a bio and artwork in the design. */
  role?: string;
  bio?: string[];
  portrait?: number;
  artwork?: number;
  artworkTitle?: string;
  artworkMedium?: string;
};

const ARTISTS: Artist[] = [
  {
    name: 'Morenikeji Ebunoluwa Joshua',
    thumb: require('../../../assets/figma/ex-artist-1.jpg'),
    role: 'Visual Artist',
    bio: [
      'Joshua is an 11-year-old visual artist whose practice centres on pencil sketching, with a portfolio of over 300 works to his name.',
      'He is the Global Child Prodigy Award Winner 2025, recognised among the Top 100 child prodigies in the world, and Winner of the African Children of the Year Award 2025 (South Africa).',
    ],
    portrait: require('../../../assets/figma/ex-artist-feature.jpg'),
    artwork: require('../../../assets/figma/ex-artist-art.jpg'),
    artworkTitle: 'Our Culture. Our Tradition',
    artworkMedium: 'Coloured Pencil on Cardboard',
  },
  { name: 'Egaerhi Lilias Keyan', thumb: require('../../../assets/figma/ex-artist-2.jpg') },
  { name: 'Akintomide Aluko', thumb: require('../../../assets/figma/ex-artist-3.jpg') },
  { name: 'Elizabeth Peterson', thumb: require('../../../assets/figma/ex-artist-4.jpg') },
  { name: 'Chinedu Chidebe', thumb: require('../../../assets/figma/ex-artist-5.jpg') },
  { name: 'Adeniran Odumbo', thumb: require('../../../assets/figma/ex-artist-6.jpg') },
  { name: 'Olukunle Adenle', thumb: require('../../../assets/figma/ex-artist-7.jpg') },
  { name: 'Patrick Ozuma', thumb: require('../../../assets/figma/ex-artist-8.jpg') },
];

function Hero() {
  const { isDesktop, isMobile } = useBreakpoint();
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
          <Eyebrow>ART FOR HOPE BIENNIAL</Eyebrow>
          <Txt variant="hero">Imagination as Access</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
            <Txt variant="large" color={colors.textSecondary}>
              2026
            </Txt>
            <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: colors.textSecondary }} />
            <Txt variant="large" color={colors.textSecondary}>
              INAUGURAL EDITION
            </Txt>
          </View>
          <Txt>
            The inaugural Art for Hope Biennial brings together emerging voices, established artists and communities in
            a multi-disciplinary exhibition exploring imagination as a tool for access, inclusion and transformation.
          </Txt>
          <View style={{ gap: 8 }}>
            <Txt variant="small" color={colors.textSecondary}>
              18 - 31 July 2026
            </Txt>
            <Txt variant="small" color={colors.textSecondary}>
              Art Hotel, Victoria Island, Lagos
            </Txt>
          </View>
        </View>
        <View style={{ width: isDesktop ? 661 : '100%', height: isDesktop ? 816 : isMobile ? 440 : 640 }}>
          <Photo source={FLYER} contentFit="contain" position={isDesktop ? 'top' : 'center'} />
        </View>
      </View>
    </Section>
  );
}

function Experience() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  const cardW = isMobile ? 240 : 336;
  const cardH = isMobile ? 315 : 441;
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
          <Txt variant="h1">Inside Imagination as Access</Txt>
        </View>
        <View style={{ width: isDesktop ? 429 : '100%' }}>
          <Txt color={colors.textSecondary}>
            A glimpse into the moments, conversations, activities and experiences that shaped the inaugural Biennial.
          </Txt>
        </View>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10, paddingHorizontal: gutter }}>
        {GALLERY.map((src, i) => (
          <View key={i} style={{ width: cardW, height: cardH, borderRadius: 12, overflow: 'hidden' }}>
            <Photo source={src} />
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

function Artists() {
  const { isDesktop, isMobile } = useBreakpoint();
  const [selected, setSelected] = useState(0);
  const artist = ARTISTS[selected];
  return (
    <Section paddingY={80} innerStyle={{ gap: 34 }}>
      <View style={{ maxWidth: 644, gap: 24 }}>
        <Eyebrow>MEET THE ARTISTS</Eyebrow>
        <Txt variant="h1">Eight artists. Eight perspectives.</Txt>
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', justifyContent: 'space-between', gap: 32 }}>
        <View style={{ width: isDesktop ? 308 : '100%', height: isMobile ? 360 : 391, borderRadius: 8, overflow: 'hidden', backgroundColor: colors.background }}>
          <Photo source={artist.portrait ?? artist.thumb} position="top" />
        </View>
        <View style={{ width: isDesktop ? 374 : '100%', gap: 16 }}>
          <Txt variant="h2">{artist.name}</Txt>
          {artist.role ? (
            <Txt variant="large" color={colors.textSecondary}>
              {artist.role}
            </Txt>
          ) : null}
          {artist.bio?.map((p) => (
            <Txt key={p} color={colors.textSecondary}>
              {p}
            </Txt>
          ))}
        </View>
        {artist.artwork ? (
          <View style={{ width: isDesktop ? 438 : '100%', gap: 8, alignItems: 'center' }}>
            <View style={{ width: '100%', height: isMobile ? 240 : 321, borderRadius: 8, overflow: 'hidden' }}>
              <Photo source={artist.artwork} />
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
              <Txt color={colors.textSecondary}>{artist.artworkTitle}</Txt>
              <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: colors.textSecondary }} />
              <Txt color={colors.textSecondary}>{artist.artworkMedium}</Txt>
            </View>
          </View>
        ) : null}
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
        {ARTISTS.map((a, i) => {
          const active = i === selected;
          return (
            <Pressable
              key={a.name}
              accessibilityRole="button"
              accessibilityLabel={`Show ${a.name}`}
              accessibilityState={{ selected: active }}
              onPress={() => setSelected(i)}
              style={{ width: isMobile ? 120 : 142, gap: 14 }}
            >
              <View
                style={{
                  height: 240,
                  borderRadius: 8,
                  overflow: 'hidden',
                  borderWidth: active ? 0.58 : 0,
                  borderColor: colors.accent,
                }}
              >
                <Photo source={a.thumb} />
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

function CuratorialNote() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ minHeight: isMobile ? 480 : 436, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Photo source={GALLERY[3]} />
      </View>
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
            Imagination is the first access we all have: to dream, to question, to believe in more.
          </Txt>
        </View>
        <View style={{ width: isDesktop ? 382 : '100%' }}>
          <Txt variant="large" color={colors.white}>
            This Biennial is a celebration of that power. A power that lives in every child, every artist, and every
            community.
          </Txt>
        </View>
      </View>
    </View>
  );
}

export default function ArtForHopeBiennial() {
  return (
    <SiteLayout>
      <Hero />
      <Experience />
      <Artists />
      <CuratorialNote />
    </SiteLayout>
  );
}
