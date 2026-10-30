import { Image } from 'expo-image';
import { View } from 'react-native';

import { PageHero } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, SecondaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, layout } from '@/theme';

const HERO = require('../../../assets/figma/studios-hero.jpg');
const FLYER = require('../../../assets/figma/afh-flyer.jpg');
const MOTION = require('../../../assets/figma/studios-motion.jpg');
const LINE = require('../../../assets/figma/line-16.svg');
const ARROW = require('../../../assets/figma/arrow-right-accent.svg');

const WHAT_WE_DO = [
  { n: '01', title: 'Exhibitions', text: 'Curating exhibitions that bring artists, artworks, ideas and audiences into conversation.' },
  { n: '02', title: 'Public Programmes', text: 'Creating talks, conversations and cultural experiences that deepen engagement.' },
  { n: '03', title: 'Artist Development', text: 'Supporting artists and contributing to the growth of the wider cultural ecosystem.' },
  { n: '04', title: 'Cultural Initiatives', text: 'Developing creative projects that connect art, cultural institutions and communities.' },
];

const SELECTED_WORK = [
  { title: 'Spectrum & Strings Attached', kind: 'Exhibition', year: '2025', image: require('../../../assets/figma/work-spectrum.png'), position: 'top' },
  { title: 'Art At The Mews', kind: 'Art Salon', year: '2025', image: require('../../../assets/figma/work-mews.png'), position: 'top' },
  { title: 'A New Language of Presence', kind: 'Exhibition', year: '2025', image: require('../../../assets/figma/work-presence.png'), position: 'top' },
];

function FeaturedExhibition() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section background={colors.background} paddingY={90} innerStyle={{ gap: 45 }}>
      <Eyebrow>FEATURED EXHIBITION</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 40 }}>
        <View style={{ width: isDesktop ? 661 : '100%', height: isDesktop ? 816 : isMobile ? 440 : 640 }}>
          <Photo source={FLYER} contentFit="contain" position="top" />
        </View>
        <View style={{ width: isDesktop ? 448 : '100%', gap: 24 }}>
          <Eyebrow>2026</Eyebrow>
          <Txt variant="hero">Art for Hope Biennial</Txt>
          <Txt variant="h4">Imagination as Access</Txt>
          <View style={{ gap: 8 }}>
            <Txt variant="small" color={colors.textSecondary}>
              18 - 31 July 2026
            </Txt>
            <Txt variant="small" color={colors.textSecondary}>
              Art Hotel, Victoria Island, Lagos
            </Txt>
          </View>
          <Txt>
            The inaugural Art for Hope Biennial brings together emerging voices, established artists and communities in
            a multi-disciplinary exhibition exploring imagination as a tool for access, inclusion and transformation.
          </Txt>
          <SecondaryButton label="View Exhibition" href="/studios/art-for-hope-biennial" />
        </View>
      </View>
    </Section>
  );
}

function WhatWeDo() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingY={80} innerStyle={{ gap: 24 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
        <Eyebrow>WHAT WE DO</Eyebrow>
        <Image source={LINE} style={{ flex: 1, height: 2 }} contentFit="fill" />
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {WHAT_WE_DO.map((item, i) => (
          <View
            key={item.n}
            style={{
              width: isDesktop ? '25%' : isMobile ? '100%' : '50%',
              gap: 16,
              paddingVertical: 10,
              paddingLeft: isDesktop && i === 0 ? 0 : isDesktop ? 40 : 0,
              paddingRight: 40,
              borderRightWidth: isDesktop && i < WHAT_WE_DO.length - 1 ? 2 : 0,
              borderRightColor: colors.borders,
              marginBottom: isDesktop ? 0 : 28,
            }}
          >
            <Txt variant="large" color={colors.accent}>
              {item.n}
            </Txt>
            <Txt variant="h4">{item.title}</Txt>
            <Txt color={colors.textSecondary}>{item.text}</Txt>
          </View>
        ))}
      </View>
    </Section>
  );
}

function SelectedWork() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingY={80} innerStyle={{ gap: 60 }}>
      <Eyebrow>SELECTED WORK</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: 12 }}>
        {SELECTED_WORK.map((work) => (
          <View
            key={work.title}
            style={{
              flex: isDesktop ? 1 : undefined,
              height: isMobile ? 420 : 466,
              borderRadius: 24,
              overflow: 'hidden',
              justifyContent: 'flex-end',
              backgroundColor: colors.background,
            }}
          >
            <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
              <Photo source={work.image} position={work.position} />
            </View>
            <View style={{ padding: 20 }}>
              <View style={{ backgroundColor: colors.background, borderRadius: 12, paddingHorizontal: 10, paddingVertical: 20, gap: 12, height: 112, justifyContent: 'center' }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                  <Txt variant="h4" numberOfLines={1} style={{ flexShrink: 1 }}>
                    {work.title}
                  </Txt>
                  <Image source={ARROW} style={{ width: 24, height: 24 }} contentFit="contain" />
                </View>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Txt color={colors.textSecondary}>{work.kind}</Txt>
                  <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: colors.textSecondary }} />
                  <Txt color={colors.textSecondary}>{work.year}</Txt>
                </View>
              </View>
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

function CultureInMotion() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: isDesktop ? 38 : 32,
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          paddingRight: isDesktop ? 120 : 0,
          paddingBottom: isDesktop ? 0 : 56,
        }}
      >
        <View style={{ width: isDesktop ? 663 : '100%', height: isDesktop ? 436 : isMobile ? 260 : 360 }}>
          <Photo source={MOTION} />
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24, paddingHorizontal: isDesktop ? 0 : gutter }}>
          <Txt variant="large" color={colors.textSecondary}>
            CULTURE IN MOTION
          </Txt>
          <Txt variant="h1">Art creates meaning when we experience it together.</Txt>
        </View>
      </View>
    </View>
  );
}

export default function Studios() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="UWEVWI STUDIOS"
        title="Creating spaces for art, culture and encounter."
        titleWidth={405}
        paragraphs={['We develop exhibitions, public programmes and creative initiatives that connect people with African art and culture.']}
        image={HERO}
      />
      <FeaturedExhibition />
      <WhatWeDo />
      <SelectedWork />
      <CultureInMotion />
    </SiteLayout>
  );
}
