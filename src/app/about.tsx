import { Image } from 'expo-image';
import { View } from 'react-native';

import { PageHero, SectionTitle } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, useBreakpoint } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors, fonts, layout } from '@/theme';

const HERO = require('../../assets/figma/about-hero.jpg');
const FOUNDER = require('../../assets/figma/founder.jpg');
const ECO_MARK = require('../../assets/figma/eco-mark.svg');
const ECO_ICON = require('../../assets/figma/eco-icon.svg');
const QUOTE_OPEN = require('../../assets/figma/quote-open.svg');
const QUOTE_CLOSE = require('../../assets/figma/quote-close.svg');

const PRINCIPLES_INTRO = [
  { icon: require('../../assets/figma/pillar.svg'), text: 'Culture creates value.' },
  { icon: require('../../assets/figma/shield.svg'), text: 'Stewardship protects and grows value.' },
  { icon: require('../../assets/figma/infinity.svg'), text: 'Legacy ensures value endures.' },
];

const ECOSYSTEM = [
  {
    name: 'Uwevwi',
    tagline: 'CULTURAL ASSET ADVISORY',
    items: [
      { title: 'Collection Stewardship', text: 'Governance, documentation and conservation planning for collections.' },
      { title: 'Corporate Collections', text: 'Helping organisations build, manage and align collections with their values.' },
      { title: 'Research', text: 'Research-driven insights informing acquisitions, strategy and institutional practice.' },
      { title: 'Legacy Planning', text: 'Structures and frameworks that ensure continuity across generations.' },
    ],
  },
  {
    name: 'Uwevwi Studios',
    tagline: 'Creative & Cultural Initiatives',
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
  { icon: require('../../assets/figma/principle-research.svg'), title: 'Research-led', text: 'Every recommendation is grounded in rigorous research and strategic thinking' },
  { icon: require('../../assets/figma/who-collectors.svg'), title: 'Independent', text: 'We provide objective advice tailored to each client’s needs.' },
  { icon: require('../../assets/figma/principle-discreet.svg'), title: 'Discreet', text: 'We respect the confidentiality of our clients’ collections and engagements.' },
  { icon: require('../../assets/figma/who-family.svg'), title: 'Collaborative', text: 'We work alongside trusted specialists where additional expertise is required.' },
  { icon: require('../../assets/figma/infinity.svg'), title: 'Long-term', text: 'We focus on stewardship, continuity and enduring value rather than short-term outcomes.' },
];

function OurThinking() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section background={colors.background} paddingY={80}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: 'stretch', gap: isDesktop ? 0 : 40 }}>
        <View style={{ width: isDesktop ? 521 : '100%', gap: 24 }}>
          <Eyebrow>OUR THINKING</Eyebrow>
          <Txt variant="h2">
            We believe cultural assets should not only be acquired, they should be understood, governed and stewarded
            across generations.
          </Txt>
        </View>
        {isDesktop ? <View style={{ width: 4, height: 276, borderRadius: 100, backgroundColor: colors.borders }} /> : null}
        <View style={{ width: isDesktop ? 481 : '100%', gap: 18, justifyContent: 'center' }}>
          <Txt variant="h4">Our work is guided by three principles:</Txt>
          <View>
            {PRINCIPLES_INTRO.map((p) => (
              <View
                key={p.text}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 24, minHeight: 70, paddingVertical: 16, borderBottomWidth: 2, borderBottomColor: colors.borders }}
              >
                <Image source={p.icon} style={{ width: 42, height: 42 }} contentFit="contain" />
                <Txt style={{ flex: 1 }}>{p.text}</Txt>
              </View>
            ))}
          </View>
        </View>
      </View>
    </Section>
  );
}

function Ecosystem() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section paddingTop={80} paddingBottom={100} innerStyle={{ gap: 34 }}>
      <View style={{ maxWidth: 941 }}>
        <SectionTitle eyebrow="OUR ECOSYSTEM" title="An integrated approach to culture and legacy." />
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: 'stretch', gap: isDesktop ? 48 : 56 }}>
        {ECOSYSTEM.map((company, i) => (
          <View key={company.name} style={{ flex: 1, flexDirection: 'row', gap: 48 }}>
            {isDesktop && i === 1 ? <View style={{ width: 2, borderRadius: 100, backgroundColor: colors.borders }} /> : null}
            <View style={{ flex: 1, gap: 24 }}>
              <View style={{ gap: 14 }}>
                <Image source={ECO_MARK} style={{ width: 54, height: 54 }} contentFit="contain" />
                <Txt variant="h3">{company.name}</Txt>
                <Txt variant="large" color={colors.textSecondary}>
                  {company.tagline}
                </Txt>
              </View>
              <View>
                {company.items.map((item, idx) => (
                  <View
                    key={item.title}
                    style={{
                      flexDirection: 'row',
                      gap: 24,
                      paddingVertical: 13,
                      borderBottomWidth: idx === company.items.length - 1 ? 0 : 2,
                      borderBottomColor: colors.borders,
                    }}
                  >
                    <View style={{ width: 42, height: 77 }}>
                      <Image source={ECO_ICON} style={{ width: 42, height: 42 }} contentFit="contain" />
                      <Image source={ECO_ICON} style={{ width: 42, height: 42, marginTop: -7, transform: [{ scaleY: -1 }] }} contentFit="contain" />
                    </View>
                    <View style={{ flex: 1, gap: 4, justifyContent: 'center' }}>
                      <Txt>{item.title}</Txt>
                      <Txt variant="small" color={colors.textSecondary}>
                        {item.text}
                      </Txt>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

function Contribution() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section borderTop paddingY={80} innerStyle={{ gap: 24 }}>
      <Eyebrow>OUR CONTRIBUTION</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 28 }}>
        <View style={{ gap: 2, flexShrink: 1 }}>
          <Txt variant="h2">Preserving cultural heritage.</Txt>
          <Txt variant="h2">Strengthening cultural infrastructure.</Txt>
          <Txt variant="h2">Stewarding cultural value.</Txt>
        </View>
        <View style={{ width: isDesktop ? 420 : '100%' }}>
          <Txt>
            Our work contributes to broader social and economic outcomes through the stewardship of cultural assets, the
            preservation of cultural heritage, and the strengthening of cultural infrastructure across Africa.
          </Txt>
        </View>
      </View>
    </Section>
  );
}

function SdgAlignment() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section background={colors.background} paddingY={80} innerStyle={{ gap: 30 }}>
      <Txt variant="h4">SDG ALIGNMENT</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: isDesktop ? 40 : 32, rowGap: 36 }}>
        {SDGS.map((sdg) => (
          <View key={sdg.title} style={{ flexDirection: 'row', gap: 24, width: isDesktop ? '47%' : '100%', flexGrow: 1, flexBasis: isDesktop ? '45%' : '100%' }}>
            <Image source={sdg.image} style={{ width: isMobile ? 96 : 144, height: isMobile ? 96 : 144 }} contentFit="cover" />
            <View style={{ flex: 1, gap: 8 }}>
              <Txt>{sdg.title}</Txt>
              <Txt variant="small" color={colors.textSecondary}>
                {sdg.text}
              </Txt>
            </View>
          </View>
        ))}
      </View>
    </Section>
  );
}

function OurPrinciples() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section paddingY={80} innerStyle={{ gap: 29 }}>
      <Txt variant="h4">OUR PRINCIPLES</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' }}>
        {OUR_PRINCIPLES.map((p, i) => (
          <View
            key={p.title}
            style={{
              width: isDesktop ? '20%' : '50%',
              minHeight: 268,
              alignItems: 'center',
              gap: 24,
              paddingHorizontal: 40,
              paddingVertical: 30,
              borderRightWidth: isDesktop && i < OUR_PRINCIPLES.length - 1 ? 1.5 : 0,
              borderRightColor: colors.borders,
            }}
          >
            <Image source={p.icon} style={{ width: 42, height: 42 }} contentFit="contain" />
            <Txt align="center">{p.title}</Txt>
            <Txt variant="small" color={colors.textSecondary} align="center">
              {p.text}
            </Txt>
          </View>
        ))}
      </View>
    </Section>
  );
}

function Founder() {
  const { isDesktop, isMobile } = useBreakpoint();
  const founderImage = useSiteImage('about.founder', FOUNDER);
  return (
    <View style={{ backgroundColor: colors.accent }}>
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: isDesktop ? 60 : 36,
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          paddingRight: isDesktop ? 80 : 0,
          paddingBottom: isDesktop ? 0 : 48,
        }}
      >
        <View style={{ width: isDesktop ? 544 : '100%', height: isDesktop ? 656 : isMobile ? 420 : 560 }}>
          <Photo source={founderImage} position="top" />
        </View>
        <View style={{ flex: 1, gap: 34, paddingHorizontal: isDesktop ? 0 : isMobile ? 20 : 48 }}>
          <View style={{ gap: 24 }}>
            <Txt variant="overline" color={colors.white}>
              MEET THE FOUNDER
            </Txt>
            <View style={{ gap: 8 }}>
              <Txt variant="h1" color={colors.white}>
                Nazerin Gbinije
              </Txt>
              <Txt variant="large" color={colors.borders}>
                Founder & Cultural Strategist
              </Txt>
            </View>
            <View style={{ gap: 14 }}>
              <Txt variant="large" color={colors.white}>
                Nazerin Gbinije is the Founder of Uwevwi, a cultural asset advisory practice working at the
                intersection of art, governance and long-term stewardship. Her work explores how collections,
                institutions and cultural assets can be structured to create enduring value through research, advisory
                and strategic partnerships.
              </Txt>
              <Txt variant="large" color={colors.white}>
                Her research focuses on corporate collections, cultural asset governance, intergenerational
                stewardship, and the emerging relationship between art and finance in Africa. Through Uwevwi, she works
                with collectors, institutions and organisations seeking to build sustainable cultural legacies.
              </Txt>
            </View>
          </View>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Image source={QUOTE_OPEN} style={{ width: 19.5, height: 15.85, marginTop: 8 }} contentFit="contain" />
            <Txt variant="quote" color={colors.white} style={{ flex: 1, fontFamily: fonts.quote }}>
              The true value of a cultural asset is realised not at the moment of acquisition, but through the quality of
              its stewardship over time.
            </Txt>
            <View style={{ justifyContent: 'flex-end' }}>
              <Image source={QUOTE_CLOSE} style={{ width: 19.5, height: 15.85, marginBottom: 6, transform: [{ scaleY: -1 }, { rotate: '180deg' }] }} contentFit="contain" />
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

export default function About() {
  const heroImage = useSiteImage('about.hero', HERO);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="ABOUT UWEVWI"
        title="Stewardship Begins With Structure."
        titleWidth={403}
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
