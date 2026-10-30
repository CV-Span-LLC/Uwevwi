import { Image } from 'expo-image';
import { View } from 'react-native';

import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, PrimaryButton, SecondaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors, layout } from '@/theme';

const HERO = require('../../assets/figma/home-hero.jpg');
const FULL_WIDTH = require('../../assets/figma/home-full-width.jpg');
const FULL_WIDTH_BOTTOM = require('../../assets/figma/home-bottom.jpg');
const ARROW = require('../../assets/figma/arrow-1.svg');

const PARTNERS_TOP = [
  { source: require('../../assets/figma/partner-arco.png'), width: 209, height: 43, name: 'ARCO Group' },
  { source: require('../../assets/figma/partner-miliki.png'), width: 167, height: 43, name: 'Miliki' },
  { source: require('../../assets/figma/partner-vascan.png'), width: 139, height: 43, name: 'Vascan' },
];
const PARTNERS_BOTTOM = [
  { source: require('../../assets/figma/partner-slum2school.png'), width: 151, height: 100, name: 'Slum2School' },
  { source: require('../../assets/figma/partner-art-for-hope.png'), width: 89, height: 100, name: 'Art for Hope Biennial' },
  { source: require('../../assets/figma/partner-ysma.png'), width: 118, height: 102, name: 'YSMA' },
  { source: require('../../assets/figma/partner-srs.png'), width: 165, height: 100, name: 'SRS Collection' },
];

const LIFECYCLE = [
  { label: 'DISCOVER', icon: require('../../assets/figma/life-discover.svg') },
  { label: 'ACQUIRE', icon: require('../../assets/figma/life-acquire.svg') },
  { label: 'DOCUMENT', icon: require('../../assets/figma/life-document.svg') },
  { label: 'GOVERN', icon: require('../../assets/figma/life-govern.svg') },
  { label: 'TRANSFER', icon: require('../../assets/figma/life-transfer.svg') },
  { label: 'PRESERVE', icon: require('../../assets/figma/life-preserve.svg') },
  { label: 'ACTIVATE', icon: require('../../assets/figma/life-activate.svg') },
];

const QUESTIONS = [
  'What do we own?',
  'How should it be governed?',
  'What is it worth?',
  'How can it support institutional identity?',
  'Is it properly documented?',
  'How will it be transferred across generations?',
];

const AUDIENCES = [
  { label: 'Collectors', icon: require('../../assets/figma/who-collectors.svg') },
  { label: 'Family Offices', icon: require('../../assets/figma/who-family.svg') },
  { label: 'Corporations', icon: require('../../assets/figma/who-corporation.svg') },
  { label: 'Designers & Architects', icon: require('../../assets/figma/who-designers.svg') },
  { label: 'Hospitality & Real Estate', icon: require('../../assets/figma/who-hospitality.svg') },
  { label: 'Museum & Cultural Institutions', icon: require('../../assets/figma/pillar.svg') },
  { label: 'Foundations', icon: require('../../assets/figma/who-foundations.svg') },
  { label: 'Government Agencies', icon: require('../../assets/figma/capitol.svg') },
];

function Hero() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  const heroImage = useSiteImage('home.hero', HERO);
  return (
    <View
      style={{
        backgroundColor: colors.white,
        flexDirection: isDesktop ? 'row' : 'column',
        alignItems: 'center',
        gap: isDesktop ? 36 : 40,
        paddingTop: isDesktop ? 60 : 32,
        paddingLeft: gutter,
        paddingRight: isDesktop ? 0 : gutter,
        width: '100%',
        maxWidth: layout.maxWidth,
        alignSelf: 'center',
        paddingBottom: isDesktop ? 0 : 40,
      }}
    >
      <View style={{ width: isDesktop ? 506 : '100%', gap: 24 }}>
        <View style={{ gap: 18 }}>
          <Txt variant="hero">Stewarding Cultural Assets.</Txt>
          <Txt variant="hero">Building Enduring Legacies.</Txt>
        </View>
        <Txt variant="large" color={colors.textSecondary}>
          Cultural assets are becoming an increasingly important part of institutional identity, private wealth and
          intergenerational legacy.
        </Txt>
        <Txt variant="large" color={colors.textSecondary}>
          We help organizations, collectors and institutions acquire, govern, steward and activate cultural assets
          through research-led advisory and long-term strategic thinking.
        </Txt>
        <View style={{ paddingTop: 6 }}>
          <PrimaryButton label="Request a Consultation" href="/contact" />
        </View>
      </View>
      <View
        style={{
          flex: isDesktop ? 1 : undefined,
          width: isDesktop ? undefined : '100%',
          height: isDesktop ? 800 : isMobile ? 340 : 520,
        }}
      >
        <Photo source={heroImage} />
      </View>
    </View>
  );
}

function BeyondArtMarket() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section background={colors.background}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: 'center', gap: 28 }}>
        <View style={{ width: isDesktop ? 359 : '100%' }}>
          <Txt variant="h2">Beyond the Art Market.</Txt>
        </View>
        <View style={{ width: isDesktop ? 805 : '100%', padding: isDesktop ? 10 : 0, gap: 20 }}>
          <Txt>
            The future of cultural assets extends far beyond acquisition. Collections require governance. Corporate
            commissions require strategy. Artist estates require continuity. Institutions require stewardship.
          </Txt>
          <Txt>
            As cultural assets appreciate in financial, historical and social significance, they demand the same
            professional infrastructure applied to every other strategic asset.
          </Txt>
        </View>
      </View>
    </Section>
  );
}

function Partners() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'flex-end' : 'stretch', gap: isDesktop ? 80 : 48 }}>
        <View style={{ flex: 1, gap: 24 }}>
          <Eyebrow>OUR PARTNERS</Eyebrow>
          <View style={{ gap: 32 }}>
            <Txt variant="h1">Collectors, institutions, organisations, and cultural leaders.</Txt>
            <View style={{ gap: 26 }}>
              <Txt color={colors.textSecondary}>
                We partner with those who believe contemporary African art is more than something to acquire, it is
                something to preserve, steward, and share.
              </Txt>
              <Txt color={colors.textSecondary}>
                Our work spans private collections, corporate and hospitality environments, public institutions, and
                mission-driven organisations committed to creating lasting cultural value.
              </Txt>
            </View>
          </View>
        </View>
        <View style={{ flex: 1, gap: 32 }}>
          <View style={{ gap: 24 }}>
            <Txt variant="h6">SELECTED COLLABORATION</Txt>
            <Txt color={colors.textSecondary}>
              A selection of organisations and institutions we have partnered with. Many engagements remain
              confidential at the request of our clients.
            </Txt>
          </View>
          <View style={{ gap: 24 }}>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 22, paddingVertical: 10 }}>
              {PARTNERS_TOP.map((p) => (
                <Image key={p.name} source={p.source} accessibilityLabel={p.name} style={{ width: p.width, height: p.height }} contentFit="contain" />
              ))}
            </View>
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 12, paddingVertical: 10 }}>
              {PARTNERS_BOTTOM.map((p) => (
                <Image key={p.name} source={p.source} accessibilityLabel={p.name} style={{ width: p.width, height: p.height }} contentFit="contain" />
              ))}
            </View>
          </View>
        </View>
      </View>
    </Section>
  );
}

function Purpose() {
  const { bp, isDesktop, isMobile } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ minHeight: isMobile ? 380 : 436, justifyContent: 'center' }}>
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
        <Photo source={FULL_WIDTH} />
      </View>
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(23,23,23,0.45)' }} />
      <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(23,23,23,0.26)' }} />
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          alignItems: isDesktop ? 'flex-end' : 'flex-start',
          paddingHorizontal: gutter,
          paddingVertical: isMobile ? 56 : 100,
        }}
      >
        <View style={{ width: isDesktop ? 795 : '100%', gap: 20 }}>
          <Txt variant="large" color={colors.white}>
            OUR PURPOSE
          </Txt>
          <Txt variant="h1" color={colors.white}>
            We exist to help our clients build the structures that protect value, strengthen identity and secure legacy
            across generations.
          </Txt>
        </View>
      </View>
    </View>
  );
}

function Lifecycle() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingY={120} innerStyle={{ gap: 54 }}>
      <Eyebrow>THE CULTURAL ASSET LIFECYCLE</Eyebrow>
      <View style={{ width: isDesktop ? 544 : '100%' }}>
        <Txt variant="h2">The Cultural Asset Lifecycle</Txt>
      </View>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: isDesktop ? 'space-between' : 'flex-start',
          flexWrap: isDesktop ? 'nowrap' : 'wrap',
          alignItems: 'flex-start',
          rowGap: 32,
          columnGap: isDesktop ? 0 : isMobile ? 16 : 40,
        }}
      >
        {LIFECYCLE.map((step, i) => (
          <View key={step.label} style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
            <View style={{ alignItems: 'center', width: isMobile ? 76 : 88 }}>
              <View
                style={{
                  width: 66,
                  height: 66,
                  borderRadius: 33,
                  borderWidth: 1,
                  borderColor: colors.borders,
                  backgroundColor: colors.white,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Image source={step.icon} style={{ width: 24, height: 24 }} contentFit="contain" />
              </View>
              <View
                style={{
                  marginTop: -14,
                  backgroundColor: colors.white,
                  borderRadius: 100,
                  paddingHorizontal: 3,
                  paddingVertical: 4,
                }}
              >
                <Txt variant="caption">{String(i + 1).padStart(2, '0')}</Txt>
              </View>
              <Txt variant="overline" align="center" style={{ marginTop: 0 }}>
                {step.label}
              </Txt>
            </View>
            {isDesktop && i < LIFECYCLE.length - 1 ? (
              <Image source={ARROW} style={{ width: 65.4, height: 11.5, marginTop: 27.5, marginLeft: 20 }} contentFit="contain" />
            ) : null}
          </View>
        ))}
      </View>
      <Txt color={colors.textSecondary}>
        Value is created through ownership, but preserved through governance, stewardship and continuity. Our work helps
        clients manage cultural assets across every stage of that journey.
      </Txt>
    </Section>
  );
}

function AdvisoryQuestions() {
  const { isMobile } = useBreakpoint();
  return (
    <Section borderTop paddingTop={100} paddingBottom={80} innerStyle={{ gap: 20, alignItems: 'flex-end' }}>
      <View style={{ alignSelf: 'stretch', gap: 20 }}>
        <Eyebrow>ADVISORY</Eyebrow>
        <Txt variant="h2">We help clients answer critical questions such as:</Txt>
      </View>
      <View style={{ alignSelf: 'stretch', flexDirection: 'row', flexWrap: 'wrap', columnGap: 94, rowGap: 16, marginTop: 4 }}>
        {QUESTIONS.map((q) => (
          <View
            key={q}
            style={{
              width: isMobile ? '100%' : '47%',
              flexGrow: 1,
              flexBasis: isMobile ? '100%' : '45%',
              borderBottomWidth: 2,
              borderBottomColor: colors.borders,
              paddingVertical: 16,
              justifyContent: 'center',
            }}
          >
            <Txt variant="h3">{q}</Txt>
          </View>
        ))}
      </View>
      <SecondaryButton label="Explore Advisory" href="/advisory" />
    </Section>
  );
}

function WhoWeWorkWith() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingTop={120} paddingBottom={80}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: isDesktop ? 54 : 32 }}>
        <View style={{ width: isDesktop ? 225 : '100%', gap: 20 }}>
          <Eyebrow>WHO WE WORK WITH</Eyebrow>
          <Txt variant="h2">Who We Work With</Txt>
        </View>
        <View style={{ flex: isDesktop ? undefined : 1, width: isDesktop ? 921 : '100%', flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
          {AUDIENCES.map((a) => (
            <View
              key={a.label}
              style={{
                width: isMobile ? '48.8%' : '32.8%',
                height: 164,
                backgroundColor: colors.background,
                borderRadius: 8,
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                paddingHorizontal: 16,
              }}
            >
              <Image source={a.icon} style={{ width: 42, height: 42 }} contentFit="contain" />
              <Txt align="center" color={colors.darkSection} style={{ maxWidth: 164 }}>
                {a.label}
              </Txt>
            </View>
          ))}
        </View>
      </View>
    </Section>
  );
}

function ResearchStrip() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section background={colors.background} paddingY={80}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'center' : 'flex-start', gap: 28 }}>
        <View style={{ gap: 20 }}>
          <Eyebrow>RESEARCH DRIVING PRACTICE</Eyebrow>
          <Txt variant="h2">Research Driving Practice</Txt>
        </View>
        <View style={{ width: isDesktop ? 506 : '100%' }}>
          <Txt>
            Our advisory work is informed by ongoing research into Nigeria’s evolving cultural asset ecosystem, examining
            governance, private wealth, institutional collections, corporate patronage and intergenerational stewardship.
          </Txt>
        </View>
      </View>
    </Section>
  );
}

export default function Home() {
  const { isMobile } = useBreakpoint();
  const bottomImage = useSiteImage('home.bottom', FULL_WIDTH_BOTTOM);
  return (
    <SiteLayout>
      <Hero />
      <BeyondArtMarket />
      <Partners />
      <Purpose />
      <Lifecycle />
      <AdvisoryQuestions />
      <WhoWeWorkWith />
      <View style={{ height: isMobile ? 240 : 436 }}>
        <Photo source={bottomImage} />
      </View>
      <ResearchStrip />
    </SiteLayout>
  );
}
