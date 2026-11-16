import { Image } from 'expo-image';
import { View } from 'react-native';

import { CardGrid, DarkBand, PageHero, SectionHead, SectionTitle } from '@/components/blocks';
import { DotCluster, Frame, FramedPhoto, SignalLine } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Section, Txt, useBreakpoint } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors, fonts } from '@/theme';

const HERO = require('../../assets/figma/about-hero.jpg');
const FOUNDER = require('../../assets/figma/founder.jpg');
const ECO_MARK = require('../../assets/figma/eco-mark.svg');

const PRINCIPLES_INTRO = [
  { icon: require('../../assets/figma/pillar.svg'), text: 'Culture creates value.' },
  { icon: require('../../assets/figma/shield.svg'), text: 'Stewardship protects and grows value.' },
  { icon: require('../../assets/figma/infinity.svg'), text: 'Legacy ensures value endures.' },
];

const ECOSYSTEM = [
  {
    name: 'Uwevwi',
    tagline: 'Cultural asset advisory',
    items: [
      { title: 'Collection Stewardship', text: 'Governance, documentation and conservation planning for collections.' },
      { title: 'Corporate Collections', text: 'Helping organisations build, manage and align collections with their values.' },
      { title: 'Research', text: 'Research-driven insights informing acquisitions, strategy and institutional practice.' },
      { title: 'Legacy Planning', text: 'Structures and frameworks that ensure continuity across generations.' },
    ],
  },
  {
    name: 'Uwevwi Studios',
    tagline: 'Creative and cultural initiatives',
    items: [
      { title: 'Exhibitions', text: 'Curating and producing exhibitions that inspire dialogue and deepen understanding.' },
      { title: 'Public Programmes', text: 'Talks, workshops and learning experiences that connect culture and community.' },
      { title: 'Artist Development', text: 'Supporting artists through mentorship, visibility and professional development.' },
      { title: 'Community Engagement', text: 'Building meaningful connections between culture, people and place.' },
    ],
  },
];

const SDGS = [
  { image: require('../../assets/figma/sdg-4.png'), title: 'Quality Education', text: 'Supporting learning through exhibitions, public programmes, research and cultural education.' },
  { image: require('../../assets/figma/sdg-11.png'), title: 'Sustainable Cities & Communities', text: 'Safeguarding cultural heritage and strengthening cultural infrastructure for future generations.' },
  { image: require('../../assets/figma/sdg-8.jpg'), title: 'Decent Work & Economic Growth', text: 'Strengthening the creative economy by supporting artists, collectors, cultural practitioners and institutions.' },
  { image: require('../../assets/figma/sdg-17.png'), title: 'Partnerships for the Goals', text: 'Building cross-sector collaborations between culture, business, philanthropy and public institutions.' },
];

const OUR_PRINCIPLES = [
  { icon: require('../../assets/figma/principle-research.svg'), title: 'Research-led', text: 'Every recommendation is grounded in rigorous research and strategic thinking.' },
  { icon: require('../../assets/figma/who-collectors.svg'), title: 'Independent', text: 'We provide objective advice tailored to each client’s needs.' },
  { icon: require('../../assets/figma/principle-discreet.svg'), title: 'Discreet', text: 'We respect the confidentiality of our clients’ collections and engagements.' },
  { icon: require('../../assets/figma/who-family.svg'), title: 'Collaborative', text: 'We work alongside trusted specialists where additional expertise is required.' },
  { icon: require('../../assets/figma/infinity.svg'), title: 'Long-term', text: 'We focus on stewardship, continuity and enduring value rather than short-term outcomes.' },
];

function OurThinking() {
  const { isDesktop } = useBreakpoint();
  return (
    <DarkBand paddingY={110}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: isDesktop ? 80 : 40 }}>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24, maxWidth: 560 }}>
          <Eyebrow color={colors.signal}>Our thinking</Eyebrow>
          <Txt variant="h2" color={colors.white}>
            We believe cultural assets should not only be acquired, they should be understood, governed and stewarded
            across generations.
          </Txt>
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 20, maxWidth: 520 }}>
          <Txt variant="monoBody" color="rgba(255,255,255,0.72)">
            / Our work is guided by three principles:
          </Txt>
          <View>
            {PRINCIPLES_INTRO.map((p, i) => (
              <View key={p.text} style={{ flexDirection: 'row', alignItems: 'center', gap: 20, minHeight: 72, borderBottomWidth: 1, borderBottomColor: colors.darkLine }}>
                <Txt variant="mono" color={colors.signal} style={{ width: 26 }}>
                  {String(i + 1).padStart(2, '0')}
                </Txt>
                <Txt variant="h5" color={colors.white} style={{ flex: 1 }}>
                  {p.text}
                </Txt>
                <Image source={p.icon} tintColor={colors.white} style={{ width: 28, height: 28 }} contentFit="contain" />
              </View>
            ))}
          </View>
        </View>
      </View>
    </DarkBand>
  );
}

function Ecosystem() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section paddingY={110} innerStyle={{ gap: 56 }}>
      <SectionHead eyebrow="Our ecosystem" title="An integrated approach to culture and legacy." />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', gap: isDesktop ? 32 : 56 }}>
        {ECOSYSTEM.map((company) => (
          <View key={company.name} style={{ flex: 1, gap: 24 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
              <Image source={ECO_MARK} style={{ width: 48, height: 48 }} contentFit="contain" />
              <View style={{ gap: 2 }}>
                <Txt variant="h3">{company.name}</Txt>
                <Txt variant="mono" color={colors.textSecondary} style={{ textTransform: 'uppercase' }}>
                  {company.tagline}
                </Txt>
              </View>
            </View>
            <CardGrid items={company.items} desktop={2} tablet={2} minHeight={220} background={colors.background} />
          </View>
        ))}
      </View>
    </Section>
  );
}

function Contribution() {
  const { isDesktop } = useBreakpoint();
  const lines = ['Preserving cultural heritage.', 'Strengthening cultural infrastructure.', 'Stewarding cultural value.'];
  return (
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: 40 }}>
      <Eyebrow>Our contribution</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 40 }}>
        <View style={{ flexShrink: 1 }}>
          {lines.map((l, i) => (
            <View key={l} style={{ flexDirection: 'row', alignItems: 'baseline', gap: 18, paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: colors.borders }}>
              <Txt variant="mono" color={colors.accent}>
                {String(i + 1).padStart(2, '0')}
              </Txt>
              <Txt variant="h2" style={{ flexShrink: 1 }}>
                {l}
              </Txt>
            </View>
          ))}
        </View>
        <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 420 }}>
          / Our work contributes to broader social and economic outcomes through the stewardship of cultural assets, the
          preservation of cultural heritage, and the strengthening of cultural infrastructure across Africa.
        </Txt>
      </View>
    </Section>
  );
}

function SdgAlignment() {
  return (
    <Section paddingY={110} innerStyle={{ gap: 48 }}>
      <SectionTitle eyebrow="SDG alignment" title="Aligned with the Sustainable Development Goals." />
      <CardGrid items={SDGS} desktop={4} tablet={2} minHeight={280} />
    </Section>
  );
}

function OurPrinciples() {
  return (
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: 48 }}>
      <SectionTitle eyebrow="Our principles" title="How we work." />
      <CardGrid items={OUR_PRINCIPLES} desktop={5} tablet={2} minHeight={300} />
    </Section>
  );
}

function Founder() {
  const { isDesktop, isMobile } = useBreakpoint();
  const founderImage = useSiteImage('about.founder', FOUNDER);
  return (
    <Frame background={colors.darkSection} overflow="hidden">
      <View>
        <SignalLine />
        <View
          style={{
            flexDirection: isDesktop ? 'row' : 'column',
            alignItems: isDesktop ? 'center' : 'stretch',
            gap: isDesktop ? 72 : 40,
            paddingLeft: isMobile ? 28 : 84,
            paddingVertical: isMobile ? 64 : 110,
          }}
        >
          <View style={{ width: isDesktop ? 400 : '100%', paddingRight: isDesktop ? 0 : 9 }}>
            <FramedPhoto
              source={founderImage}
              position="top"
              height={isDesktop ? 540 : isMobile ? 380 : 480}
              marks="#6a665f"
              badge={<DotCluster size={12} tones={[colors.accent, colors.darkSection, colors.darkSection, colors.accent]} />}
            />
          </View>
          <View style={{ flex: isDesktop ? 1 : undefined, gap: 30 }}>
            <View style={{ gap: 10 }}>
              <Eyebrow color={colors.signal}>Meet the founder</Eyebrow>
              <Txt variant="h1" color={colors.white}>
                Nazerin Gbinije
              </Txt>
              <Txt variant="mono" color="#8d877e" style={{ textTransform: 'uppercase' }}>
                Founder & Cultural Strategist
              </Txt>
            </View>
            <View style={{ gap: 14, maxWidth: 600 }}>
              <Txt variant="monoBody" color="rgba(255,255,255,0.78)">
                Nazerin Gbinije is the Founder of Uwevwi, a cultural asset advisory practice working at the intersection
                of art, governance and long-term stewardship. Her work explores how collections, institutions and
                cultural assets can be structured to create enduring value through research, advisory and strategic
                partnerships.
              </Txt>
              <Txt variant="monoBody" color="rgba(255,255,255,0.78)">
                Her research focuses on corporate collections, cultural asset governance, intergenerational stewardship,
                and the emerging relationship between art and finance in Africa. Through Uwevwi, she works with
                collectors, institutions and organisations seeking to build sustainable cultural legacies.
              </Txt>
            </View>
            <View style={{ borderLeftWidth: 2, borderLeftColor: colors.signal, paddingLeft: 20, maxWidth: 600 }}>
              <Txt variant="quote" color={colors.white} style={{ fontFamily: fonts.quote }}>
                The true value of a cultural asset is realised not at the moment of acquisition, but through the quality
                of its stewardship over time.
              </Txt>
            </View>
          </View>
        </View>
      </View>
    </Frame>
  );
}

export default function About() {
  const heroImage = useSiteImage('about.hero', HERO);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="ABOUT UWEVWI"
        title="Stewardship Begins With Structure."
        paragraphs={[
          'Across Africa, collections are becoming increasingly valuable, artist estates are expanding, and institutions are investing in culture as part of their identity.',
          'Yet governance, documentation and long-term stewardship have not kept pace.',
          'Uwevwi was established to help close that gap.',
          'We work at the intersection of cultural strategy, research and advisory, helping clients build the structures that allow cultural assets to endure.',
        ]}
        image={heroImage}
      />
      <OurThinking />
      <Ecosystem />
      <Contribution />
      <SdgAlignment />
      <OurPrinciples />
      <Founder />
    </SiteLayout>
  );
}
