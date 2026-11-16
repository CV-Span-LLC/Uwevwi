import { Image } from 'expo-image';
import { Link, type Href } from 'expo-router';
import { useEffect, useState } from 'react';
import { Animated, Easing, Platform, Pressable, View } from 'react-native';

import {
  ArrowLine,
  BlinkPlus,
  DotCluster,
  FramedPhoto,
  Frame,
  HoverCard,
  Label,
  PixelBracket,
  PixelWordmark,
  ScrollPill,
  SignalLine,
  TechButton,
  Ticker,
} from '@/components/futuristic';
import { AudienceArt, DotGrid, type ArtName } from '@/components/illustrations';
import { SiteLayout } from '@/components/site-layout';
import { Photo, Section, Txt, useBreakpoint } from '@/components/ui';
import { assetUrl, publicApi, type ResearchSummary } from '@/lib/api';
import { useSiteImage } from '@/lib/site-images';
import { useRemote } from '@/lib/use-remote';
import { colors } from '@/theme';

const HERO = require('../../assets/figma/home-hero.jpg');
const BOTTOM = require('../../assets/figma/home-bottom.jpg');
const ADVISORY_IMAGE = require('../../assets/figma/advisory-hero.png');
const STEWARDSHIP_IMAGE = require('../../assets/figma/stewardship-hero.jpg');
const RESEARCH_IMAGE = require('../../assets/figma/research-hero.jpg');
const STUDIOS_IMAGE = require('../../assets/figma/studios-hero.jpg');

const upper = { textTransform: 'uppercase' } as const;
const DIM = 'rgba(255,255,255,0.3)';
const SOFT = 'rgba(255,255,255,0.72)';

const PARTNERS = [
  { source: require('../../assets/figma/partner-arco.png'), width: 209, height: 43, name: 'ARCO Group' },
  { source: require('../../assets/figma/partner-miliki.png'), width: 167, height: 43, name: 'Miliki' },
  { source: require('../../assets/figma/partner-vascan.png'), width: 264, height: 82, name: 'Vascan' },
  { source: require('../../assets/figma/partner-slum2school.png'), width: 151, height: 100, name: 'Slum2School' },
  { source: require('../../assets/figma/partner-art-for-hope.png'), width: 89, height: 100, name: 'Art for Hope Biennial' },
  { source: require('../../assets/figma/partner-ysma.png'), width: 118, height: 102, name: 'YSMA' },
  { source: require('../../assets/figma/partner-srs.png'), width: 165, height: 100, name: 'SRS Collection' },
];

const LIFECYCLE = [
  { label: 'Discover', icon: require('../../assets/figma/life-discover.svg') },
  { label: 'Acquire', icon: require('../../assets/figma/life-acquire.svg') },
  { label: 'Document', icon: require('../../assets/figma/life-document.svg') },
  { label: 'Govern', icon: require('../../assets/figma/life-govern.svg') },
  { label: 'Transfer', icon: require('../../assets/figma/life-transfer.svg') },
  { label: 'Preserve', icon: require('../../assets/figma/life-preserve.svg') },
  { label: 'Activate', icon: require('../../assets/figma/life-activate.svg') },
];

const QUESTIONS = [
  'What do we own?',
  'How should it be governed?',
  'What is it worth?',
  'How can it support institutional identity?',
  'Is it properly documented?',
  'How will it be transferred across generations?',
];

const AUDIENCES: { label: string; art: ArtName; text: string }[] = [
  { label: 'Collectors', art: 'collectors', text: 'Private collectors building meaningful collections.' },
  { label: 'Family Offices', art: 'family', text: 'Families planning for generational continuity.' },
  { label: 'Corporations', art: 'corporations', text: 'Organisations integrating culture into their legacy.' },
  { label: 'Designers & Architects', art: 'designers', text: 'Creatives collaborating on culturally anchored projects.' },
  { label: 'Hospitality & Real Estate', art: 'hospitality', text: 'Developers and operators enhancing cultural narratives.' },
  { label: 'Museums & Cultural Institutions', art: 'museums', text: 'Institutions safeguarding collections held in public trust.' },
  { label: 'Foundations', art: 'foundations', text: 'Philanthropic bodies investing in culture and heritage.' },
  { label: 'Government Agencies', art: 'government', text: 'Public agencies safeguarding national cultural assets.' },
];

const HASHTAGS = ['#CulturalAssets', '#Governance', '#Stewardship', '#Research', '#Legacy'];

type ServiceItem = { key: string; title: string; href: Href; text: string; tags: string[] };
const SERVICES: ServiceItem[] = [
  {
    key: 'advisory',
    title: 'Advisory',
    href: '/advisory',
    text: 'Independent, research-led guidance on strategy, acquisition, collection reviews and market intelligence, so every decision about a cultural asset is informed.',
    tags: ['Strategy', 'Acquisition', 'Collection Reviews', 'Market Intelligence'],
  },
  {
    key: 'stewardship',
    title: 'Stewardship',
    href: '/stewardship',
    text: 'Documentation, governance, preservation and legacy planning that protect cultural and financial value across generations.',
    tags: ['Documentation', 'Governance', 'Preservation', 'Legacy'],
  },
  {
    key: 'research',
    title: 'Research',
    href: '/research',
    text: 'Evidence on the people, systems and markets that shape cultural value, from heritage and collections to governance, investment and stewardship.',
    tags: ['Research Papers', 'Journal', 'Writers Commission'],
  },
  {
    key: 'studios',
    title: 'Studios',
    href: '/studios',
    text: 'Exhibitions, public programmes and cultural initiatives that bring artists, ideas and audiences into conversation.',
    tags: ['Exhibitions', 'Public Programmes', 'Artist Development'],
  },
];

// ---------------------------------------------------------------- hero

function Hero() {
  const { isDesktop, isMobile } = useBreakpoint();
  const heroImage = useSiteImage('home.hero', HERO);
  return (
    <Frame background={colors.background} overflow="hidden">
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          paddingVertical: 16,
          borderBottomWidth: 1,
          borderBottomColor: colors.borders,
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: isMobile ? 14 : 28 }}>
          {['Advisory', 'Stewardship', 'Research'].slice(0, isMobile ? 2 : 3).map((t) => (
            <Txt key={t} variant="mono" color={colors.textSecondary} style={upper}>
              {t}
            </Txt>
          ))}
        </View>
        {isDesktop ? (
          <Txt variant="mono" color={colors.textSecondary}>
            LAGOS, NG · 6.5244° N 3.3792° E
          </Txt>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: isDesktop ? 56 : 44,
          paddingTop: isDesktop ? 72 : 40,
        }}
      >
        <View style={{ width: isDesktop ? 400 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
          <FramedPhoto
            source={heroImage}
            height={isDesktop ? 520 : isMobile ? 360 : 520}
            badge={<DotCluster size={12} tones={[colors.accent, colors.darkSection, colors.darkSection, colors.accent]} />}
          />
        </View>
        {isDesktop ? <ScrollPill /> : null}
        <View style={{ flex: isDesktop ? 1 : undefined, gap: isMobile ? 28 : 36 }}>
          <View>
            <Txt variant="stack" style={upper}>
              Stewarding
            </Txt>
            <Txt variant="stack" style={upper}>
              Cultural assets.
            </Txt>
            <Txt variant="stack" style={upper}>
              Building enduring
            </Txt>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <ArrowLine width={isMobile ? 44 : 96} />
              <Txt variant="stack" style={upper}>
                Legacies
              </Txt>
              <BlinkPlus size={isMobile ? 28 : 44} />
            </View>
          </View>
          <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 520 }}>
            {'/ '}Cultural assets are becoming central to institutional identity, private wealth and intergenerational
            legacy. We help organisations, collectors and institutions acquire, govern, steward and activate them through
            research-led advisory and long-term strategic thinking.
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            <TechButton label="Request a consultation" href="/contact" tone="accent" />
            <TechButton label="Explore advisory" href="/advisory" tone="ink" />
          </View>
        </View>
      </View>

      <View style={{ marginTop: isDesktop ? 72 : 48 }}>
        <PixelWordmark color="#ddd6ca" />
      </View>
    </Frame>
  );
}

// ---------------------------------------------------------------- purpose + lifecycle

const ROW = 56;

function Lifecycle() {
  const { isDesktop, isMobile } = useBreakpoint();
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const [y] = useState(() => new Animated.Value(0));

  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => setActive((a) => (a + 1) % LIFECYCLE.length), 2600);
    return () => clearInterval(id);
  }, [paused]);

  useEffect(() => {
    const move = Animated.timing(y, { toValue: active * ROW, duration: 420, easing: Easing.out(Easing.cubic), useNativeDriver: Platform.OS !== 'web' });
    move.start();
    return () => move.stop();
  }, [active, y]);

  const choose = (i: number) => {
    setPaused(true);
    setActive(i);
  };

  return (
    <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'flex-start' : 'stretch', gap: isDesktop ? 40 : 36 }}>
      <View style={{ width: isDesktop ? 300 : '100%', gap: 18 }}>
        <Label color={colors.signal}>The cultural asset lifecycle</Label>
        <Txt variant="monoBody" color={SOFT}>
          Value is created through ownership, but preserved through governance, stewardship and continuity. Our work helps
          clients manage cultural assets across every stage of that journey.
        </Txt>
      </View>

      {isDesktop ? (
        <View style={{ flex: 1, height: ROW * LIFECYCLE.length }}>
          <Animated.View style={{ position: 'absolute', left: 0, right: 0, top: 0, height: ROW, justifyContent: 'center', transform: [{ translateY: y }] }}>
            <ArrowLine color={colors.signal} />
          </Animated.View>
        </View>
      ) : null}

      <View style={{ width: isDesktop ? 340 : '100%' }}>
        {LIFECYCLE.map((step, i) => {
          const on = i === active;
          return (
            <Pressable
              key={step.label}
              accessibilityRole="button"
              accessibilityState={{ selected: on }}
              onPress={() => choose(i)}
              onHoverIn={() => choose(i)}
              style={{ height: ROW, flexDirection: 'row', alignItems: 'center', gap: 16, borderBottomWidth: 1, borderBottomColor: colors.darkLine }}
            >
              <Txt variant="mono" color={on ? colors.signal : DIM} style={{ width: 26 }}>
                {String(i + 1).padStart(2, '0')}
              </Txt>
              <Txt variant="h3" color={on ? colors.white : DIM} style={[upper, { fontSize: on ? (isMobile ? 26 : 34) : isMobile ? 20 : 24, lineHeight: on ? 40 : 30, flex: 1 }]}>
                {step.label}
              </Txt>
              <Image source={step.icon} tintColor={on ? colors.white : DIM} style={{ width: 22, height: 22 }} contentFit="contain" />
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

function Purpose() {
  const { isDesktop, isMobile } = useBreakpoint();
  const image = useSiteImage('home.bottom', BOTTOM);
  return (
    <Frame background={colors.darkSection} overflow="hidden">
      <View>
        <SignalLine />
        <View style={{ paddingLeft: isMobile ? 28 : 84, paddingVertical: isMobile ? 64 : 112, gap: isMobile ? 56 : 88 }}>
          <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'stretch', gap: 44 }}>
            <View style={{ gap: 28, flexShrink: 1 }}>
              <DotCluster size={13} tones={['#4a4641', '#4a4641', colors.signal, colors.white]} />
              <View>
                <Txt variant="stack" color={DIM} style={upper}>
                  Protecting value.
                </Txt>
                <Txt variant="stack" color={DIM} style={upper}>
                  Strengthening identity.
                </Txt>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Txt variant="stack" color={colors.white} style={upper}>
                    Securing legacy
                  </Txt>
                  <BlinkPlus color={colors.signal} size={isMobile ? 26 : 44} />
                </View>
              </View>
            </View>
            <View style={{ width: isDesktop ? 420 : '100%' }}>
              <FramedPhoto source={image} height={isDesktop ? 300 : isMobile ? 230 : 320} marks="#6a665f" />
            </View>
          </View>

          <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 56 : 36 }}>
            <View style={{ width: isDesktop ? 330 : '100%', gap: 22 }}>
              <View style={{ alignSelf: 'flex-start', backgroundColor: '#272522', borderWidth: 1, borderColor: colors.darkLine, paddingHorizontal: 20, paddingVertical: 14 }}>
                <Txt variant="h4" color={colors.white}>
                  Beyond the art market.
                </Txt>
              </View>
              <View style={{ gap: 4 }}>
                {HASHTAGS.map((h) => (
                  <Txt key={h} variant="mono" color="#8d877e">
                    {h}
                  </Txt>
                ))}
              </View>
            </View>
            <View style={{ flex: isDesktop ? 1 : undefined, gap: 18, maxWidth: 560 }}>
              <Label color={colors.signal}>Our purpose</Label>
              <Txt variant="monoBody" color={SOFT}>
                We exist to help our clients build the structures that protect value, strengthen identity and secure legacy
                across generations.
              </Txt>
              <Txt variant="monoBody" color={SOFT}>
                The future of cultural assets extends far beyond acquisition. Collections require governance. Corporate
                commissions require strategy. Artist estates require continuity. Institutions require stewardship.
              </Txt>
            </View>
          </View>

          <Lifecycle />
        </View>
      </View>
    </Frame>
  );
}

// ---------------------------------------------------------------- services

function Services() {
  const { isDesktop, isMobile } = useBreakpoint();
  const [active, setActive] = useState(0);
  const images = [
    useSiteImage('advisory.hero', ADVISORY_IMAGE),
    useSiteImage('stewardship.hero', STEWARDSHIP_IMAGE),
    useSiteImage('research.hero', RESEARCH_IMAGE),
    useSiteImage('studio.hero', STUDIOS_IMAGE),
  ];
  const current = SERVICES[active];

  return (
    <Section paddingY={110} innerStyle={{ gap: isMobile ? 36 : 56 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Label>Our services</Label>
        <Txt variant="mono" color={colors.textSecondary}>
          {`(${String(SERVICES.length).padStart(2, '0')})`}
        </Txt>
      </View>

      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'flex-end' : 'stretch', gap: isDesktop ? 72 : 36 }}>
        <View style={{ width: isDesktop ? 380 : '100%', gap: 14 }}>
          <FramedPhoto source={images[active]} height={isDesktop ? 440 : isMobile ? 300 : 400} frame={colors.background} />
          <Txt variant="mono" color={colors.textSecondary}>
            {`/${current.key.toUpperCase()}_${String(active + 1).padStart(2, '0')}`}
          </Txt>
        </View>

        <View style={{ flex: isDesktop ? 1 : undefined, gap: isMobile ? 32 : 48 }}>
          <View>
            {SERVICES.map((s, i) => {
              const on = i === active;
              const distance = Math.abs(i - active);
              return (
                <Pressable
                  key={s.key}
                  accessibilityRole="button"
                  accessibilityState={{ selected: on }}
                  onPress={() => setActive(i)}
                  onHoverIn={() => setActive(i)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 16, minHeight: isMobile ? 56 : 84 }}
                >
                  <View style={{ width: isMobile ? 36 : 110 }}>{on ? <ArrowLine /> : null}</View>
                  <Txt variant="stack" color={on ? colors.darkSection : colors.textSecondary} style={{ opacity: on ? 1 : Math.max(0.18, 0.5 - distance * 0.12) }}>
                    {s.title}
                  </Txt>
                </Pressable>
              );
            })}
          </View>

          <View style={{ flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', gap: 28 }}>
            <View style={{ flex: isMobile ? undefined : 1, gap: 16, maxWidth: 460 }}>
              <Txt variant="monoBody" color={colors.textSecondary}>
                {`/ ${current.text}`}
              </Txt>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
                {current.tags.map((t) => (
                  <View key={t} style={{ borderWidth: 1, borderColor: colors.borders, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 2 }}>
                    <Txt variant="mono" color={colors.text} style={upper}>
                      {t}
                    </Txt>
                  </View>
                ))}
              </View>
            </View>
            <View style={{ gap: 10 }}>
              <TechButton label={`Explore ${current.title}`} href={current.href} tone="accent" />
              <TechButton label="Get in touch" href="/contact" tone="ink" />
            </View>
          </View>
        </View>
      </View>
    </Section>
  );
}

// ---------------------------------------------------------------- questions

function useColumns(desktop: number, tablet: number) {
  const { isDesktop, isMobile } = useBreakpoint();
  return isDesktop ? desktop : isMobile ? 1 : tablet;
}

function Questions() {
  const { isMobile } = useBreakpoint();
  const cols = useColumns(3, 2);
  return (
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: isMobile ? 36 : 56 }}>
      <View style={{ gap: 20 }}>
        <Label>Advisory</Label>
        <Txt variant="h2" style={{ maxWidth: 900 }}>
          We help clients answer critical questions such as:
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 1, borderLeftWidth: 1, borderColor: colors.borders }}>
        {QUESTIONS.map((q, i) => (
          <HoverCard
            key={q}
            style={{
              width: `${100 / cols}%`,
              minHeight: isMobile ? 150 : 220,
              padding: 24,
              justifyContent: 'space-between',
              backgroundColor: colors.white,
              borderRightWidth: 1,
              borderBottomWidth: 1,
              borderColor: colors.borders,
            }}
            hoverStyle={{ backgroundColor: colors.darkSection }}
          >
            {(on) => (
              <>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Txt variant="mono" color={on ? colors.signal : colors.accent}>
                    {`Q/${String(i + 1).padStart(2, '0')}`}
                  </Txt>
                  <Txt variant="mono" color={on ? colors.white : colors.textSecondary}>
                    +
                  </Txt>
                </View>
                <Txt variant="h4" color={on ? colors.white : colors.text}>
                  {q}
                </Txt>
              </>
            )}
          </HoverCard>
        ))}
      </View>
      <TechButton label="Explore advisory" href="/advisory" tone="ink" />
    </Section>
  );
}

// ---------------------------------------------------------------- audiences

function Audiences() {
  const { isDesktop, isMobile } = useBreakpoint();
  const cols = isDesktop ? 4 : isMobile ? 1 : 2;
  const width: `${number}%` = cols === 4 ? '23.9%' : cols === 2 ? '49.3%' : '100%';
  return (
    <Section paddingY={110} innerStyle={{ gap: isMobile ? 36 : 56 }}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'flex-start', gap: 28 }}>
        <View style={{ gap: 20 }}>
          <Label>Audience</Label>
          <Txt variant="h2">Who we work with</Txt>
        </View>
        <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 480 }}>
          {'/ '}Cultural assets are an increasingly important part of institutional identity, private wealth and
          intergenerational legacy. We work with the people and institutions responsible for them.
        </Txt>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
        {AUDIENCES.map((a, i) => (
          <HoverCard
            key={a.label}
            style={{ width, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borders }}
            hoverStyle={{ borderColor: colors.darkSection, transform: [{ translateY: -4 }] }}
          >
            {(on) => (
              <>
                <View style={{ height: isMobile ? 190 : 176, backgroundColor: on ? colors.darkSection : colors.background, overflow: 'hidden' }}>
                  <DotGrid id={`dots-${i}`} color={on ? '#3a3733' : '#ddd6ca'} />
                  <AudienceArt name={a.art} active={on} height={isMobile ? 190 : 176} uid={`aud${i}`} />
                  <View style={{ position: 'absolute', left: 14, top: 12 }}>
                    <Txt variant="mono" color={on ? colors.signal : colors.accent}>
                      {`/${String(i + 1).padStart(2, '0')}`}
                    </Txt>
                  </View>
                </View>
                <View style={{ padding: 20, gap: 10, minHeight: 128 }}>
                  <Txt variant="h5">{a.label}</Txt>
                  <Txt variant="small" color={colors.textSecondary}>
                    {a.text}
                  </Txt>
                </View>
              </>
            )}
          </HoverCard>
        ))}
      </View>
    </Section>
  );
}

// ---------------------------------------------------------------- partners

function Partners() {
  const { isDesktop, isMobile } = useBreakpoint();
  const k = isMobile ? 0.8 : 1.1;
  return (
    <Section background={colors.background} paddingY={100} innerStyle={{ gap: isMobile ? 36 : 56 }}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 36 }}>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24, maxWidth: 640 }}>
          <Label>Selected collaboration</Label>
          <Txt variant="h2">Collectors, institutions, organisations and cultural leaders.</Txt>
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 16, maxWidth: 520 }}>
          <Txt variant="monoBody" color={colors.textSecondary}>
            {'/ '}We partner with those who believe contemporary African art is more than something to acquire. It is
            something to preserve, steward and share.
          </Txt>
          <Txt variant="monoBody" color={colors.textSecondary}>
            A selection of the organisations we have worked with is shown below. Many engagements remain confidential at
            the request of our clients.
          </Txt>
        </View>
      </View>
      <View style={{ marginHorizontal: -(isMobile ? 20 : isDesktop ? 120 : 48), borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borders, backgroundColor: colors.white }}>
        <Ticker>
          {PARTNERS.map((p) => (
            <View key={p.name} style={{ height: 150 * k, paddingHorizontal: 44, justifyContent: 'center', borderRightWidth: 1, borderRightColor: colors.borders }}>
              <Image source={p.source} accessibilityLabel={p.name} style={{ width: p.width * k, height: p.height * k }} contentFit="contain" />
            </View>
          ))}
        </Ticker>
      </View>
    </Section>
  );
}

// ---------------------------------------------------------------- pull quote

function PullQuote() {
  const { isDesktop, isMobile } = useBreakpoint();
  const cell = isDesktop ? 14 : isMobile ? 6 : 10;
  return (
    <Section paddingY={110}>
      <View style={{ alignItems: 'center', gap: 32 }}>
        <Label>Perspective</Label>
        <View style={{ width: '100%', flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: isMobile ? 12 : 32 }}>
          <PixelBracket side="left" color={colors.darkSection} cell={cell} />
          <View style={{ flex: 1, maxWidth: 760, alignItems: 'center', gap: 28 }}>
            <Txt variant="h3" align="center">
              As cultural assets appreciate in financial, historical and social significance, they demand the same
              professional infrastructure applied to every other strategic asset.
            </Txt>
            <Txt variant="mono" color={colors.textSecondary}>
              UWEVWI STUDIOS
            </Txt>
          </View>
          <PixelBracket side="right" color={colors.signal} cell={cell} />
        </View>
      </View>
    </Section>
  );
}

// ---------------------------------------------------------------- research

const TYPE_LABEL: Record<ResearchSummary['type'], string> = {
  'Research Paper': 'Research',
  Journal: 'Journal',
  'Writers Commission': 'Commission',
};

function ResearchCard({ entry, index, width }: { entry: ResearchSummary; index: number; width: `${number}%` }) {
  return (
    <Link href={{ pathname: '/research/[slug]', params: { slug: entry.slug } }} asChild>
      <Pressable accessibilityRole="link" style={{ width }}>
        {({ hovered }: { hovered?: boolean }) => (
          <View style={{ gap: 14, padding: 8, backgroundColor: colors.white }}>
            <View style={{ aspectRatio: 4 / 3, backgroundColor: colors.background, overflow: 'hidden' }}>
              {entry.image ? <Photo source={{ uri: assetUrl(entry.image) as string }} style={{ transform: [{ scale: hovered ? 1.04 : 1 }] }} /> : null}
              <View style={{ position: 'absolute', left: 0, top: 0, backgroundColor: colors.darkSection, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Txt variant="mono" color={colors.white} style={upper}>
                  {TYPE_LABEL[entry.type]}
                </Txt>
              </View>
            </View>
            <View style={{ gap: 10, paddingHorizontal: 8, paddingBottom: 12 }}>
              <Txt variant="mono" color={colors.accent}>
                {`/${String(index + 1).padStart(2, '0')} · ${new Date(entry.publishedAt).getFullYear()}`}
              </Txt>
              <Txt variant="h5" numberOfLines={2}>
                {entry.title}
              </Txt>
              <Txt variant="small" color={colors.textSecondary} numberOfLines={3}>
                {entry.excerpt}
              </Txt>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function ResearchStrip() {
  const { isDesktop, isMobile } = useBreakpoint();
  const { data, loading } = useRemote(() => publicApi<ResearchSummary[]>('/research'));
  const latest = (data ?? []).slice(0, 3);
  const width: `${number}%` = isDesktop ? '32.4%' : '100%';
  return (
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: isMobile ? 36 : 56 }}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'flex-end' : 'flex-start', gap: 28 }}>
        <View style={{ gap: 20 }}>
          <Label>Latest research</Label>
          <Txt variant="h2">Research driving practice.</Txt>
        </View>
        <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 500 }}>
          {'/ '}Our advisory work is informed by ongoing research into Nigeria’s evolving cultural asset ecosystem, examining
          governance, private wealth, institutional collections, corporate patronage and intergenerational stewardship.
        </Txt>
      </View>
      {loading || latest.length ? (
        <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 14 }}>
          {loading
            ? [0, 1, 2].map((i) => <View key={i} style={{ width, height: 360, backgroundColor: colors.white, opacity: 0.6 }} />)
            : latest.map((entry, i) => <ResearchCard key={entry.id} entry={entry} index={i} width={width} />)}
        </View>
      ) : null}
      <Link href="/research" asChild>
        <Pressable accessibilityRole="link" style={{ alignSelf: 'stretch' }}>
          {({ hovered }: { hovered?: boolean }) => (
            <View style={{ backgroundColor: hovered ? colors.darkSection : colors.accent, paddingVertical: 18, paddingHorizontal: 22, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
              <Txt variant="mono" color={colors.white}>
                SHOW ALL RESEARCH
              </Txt>
              <Txt variant="mono" color={colors.white}>
                →
              </Txt>
            </View>
          )}
        </Pressable>
      </Link>
    </Section>
  );
}

export default function Home() {
  return (
    <SiteLayout>
      <Hero />
      <Purpose />
      <Services />
      <Questions />
      <Audiences />
      <Partners />
      <PullQuote />
      <ResearchStrip />
    </SiteLayout>
  );
}
