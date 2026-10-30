import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, View } from 'react-native';

import { CtaBanner, PageHero } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, SecondaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, layout } from '@/theme';

const HERO = require('../../assets/figma/advisory-hero.png');
const RESEARCH = require('../../assets/figma/advisory-research.jpg');
const ADD = require('../../assets/figma/add-circle.svg');
const MINUS = require('../../assets/figma/minus-circle.svg');
const DOT = require('../../assets/figma/dot.svg');

const SERVICES = [
  {
    title: 'Corporate Collections',
    text: 'We advise organisations on building, managing and stewarding corporate collections that strengthen institutional identity and create long-term cultural value.',
    tags: ['Collection Strategy', 'Governance', 'Documentation', 'Stewardship'],
  },
  {
    title: 'Private Collections',
    text: 'We support collectors and families in shaping, structuring and safeguarding private collections so they are understood, documented and ready to be passed on.',
    tags: ['Collection Planning', 'Documentation', 'Succession', 'Stewardship'],
  },
  {
    title: 'Cultural Asset Strategy',
    text: 'We align cultural assets with institutional objectives, defining the policies and long-term vision that guide how they are acquired, held and activated.',
    tags: ['Vision', 'Policy', 'Positioning', 'Activation'],
  },
  {
    title: 'Market Intelligence',
    text: 'Our research gives clients market insights, sector analysis and strategic intelligence to support informed cultural asset decisions.',
    tags: ['Market Insight', 'Sector Analysis', 'Research'],
  },
  {
    title: 'Acquisition Advisory',
    text: 'We provide independent, research-led guidance on what to acquire and why, so every addition strengthens the collection and its purpose.',
    tags: ['Discovery', 'Due Diligence', 'Acquisition', 'Provenance'],
  },
  {
    title: 'Collection Reviews',
    text: 'We assess what a collection holds, how it is recorded and governed, and what it needs next, then set out a clear path to long-term care.',
    tags: ['Assessment', 'Documentation', 'Risk', 'Recommendations'],
  },
];

const THINKING = [
  { icon: require('../../assets/figma/think-strategy.svg'), title: 'STRATEGY', text: 'Align cultural assets with institutional objectives and long-term visions.' },
  { icon: require('../../assets/figma/think-governance.svg'), title: 'GOVERNANCE', text: 'Create the structures required to manage ownership and decision-making.' },
  { icon: require('../../assets/figma/think-stewardship.svg'), title: 'STEWARDSHIP', text: 'Protect cultural and financial value across time and generations.' },
];

function ServiceRow({ index, item, open, onToggle }: { index: number; item: (typeof SERVICES)[number]; open: boolean; onToggle: () => void }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityState={{ expanded: open }}
      onPress={onToggle}
      style={{ borderBottomWidth: 2, borderBottomColor: colors.borders, paddingVertical: 20, gap: 14 }}
    >
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 16 }}>
        <Txt variant="small" style={{ width: 39 }}>
          {String(index + 1).padStart(2, '0')}
        </Txt>
        <Txt variant="large" style={{ flex: 1 }}>
          {item.title}
        </Txt>
        <Image source={open ? MINUS : ADD} style={{ width: 24, height: 24 }} contentFit="contain" />
      </View>
      {open ? (
        <View style={{ gap: 14 }}>
          <Txt>{item.text}</Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', rowGap: 6, columnGap: 6 }}>
            {item.tags.map((tag, i) => (
              <View key={tag} style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Txt variant="small">{tag}</Txt>
                {i < item.tags.length - 1 ? <Image source={DOT} style={{ width: 6, height: 6 }} contentFit="contain" /> : null}
              </View>
            ))}
          </View>
        </View>
      ) : null}
    </Pressable>
  );
}

function OurAdvisory() {
  const { isDesktop } = useBreakpoint();
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  return (
    <Section background={colors.background}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 40 }}>
        <View style={{ width: isDesktop ? 394 : '100%', gap: 24 }}>
          <Eyebrow>OUR ADVISORY</Eyebrow>
          <Txt variant="h2">How we help clients build lasting value.</Txt>
          <Txt color={colors.textSecondary}>
            Our advisory services are tailored to meet the unique needs of institutions, organisations and private
            clients.
          </Txt>
        </View>
        <View style={{ width: isDesktop ? 555 : '100%', gap: 4 }}>
          {SERVICES.map((item, i) => (
            <ServiceRow
              key={item.title}
              index={i}
              item={item}
              open={openIndex === i}
              onToggle={() => setOpenIndex(openIndex === i ? null : i)}
            />
          ))}
        </View>
      </View>
    </Section>
  );
}

function QuoteBand() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section paddingTop={80} paddingBottom={50}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: 'center', gap: 28, paddingHorizontal: isDesktop ? 50 : 0 }}>
        <View style={{ width: isDesktop ? 513 : '100%' }}>
          <Txt variant="h2">From acquisition to stewardship, we help clients make informed cultural asset decisions.</Txt>
        </View>
        <View style={{ width: isDesktop ? 430 : '100%' }}>
          <Txt variant="large" color={colors.textSecondary}>
            Our role is to bring clarity, structure and independence to every stage of the cultural asset journey so
            value is created, protected and sustained for generations.
          </Txt>
        </View>
      </View>
    </Section>
  );
}

function HowWeThink() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section borderTop paddingTop={40} paddingBottom={60} innerStyle={{ gap: 24 }}>
      <Txt variant="h4">HOW WE THINK</Txt>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between' }}>
        {THINKING.map((card, i) => (
          <View
            key={card.title}
            style={{
              flex: 1,
              gap: 16,
              paddingLeft: 14,
              paddingRight: 34,
              paddingVertical: 26,
              borderRightWidth: isDesktop && i < THINKING.length - 1 ? 2 : 0,
              borderRightColor: colors.borders,
              borderBottomWidth: !isDesktop && i < THINKING.length - 1 ? 2 : 0,
              borderBottomColor: colors.borders,
            }}
          >
            <Image source={card.icon} style={{ width: 76, height: 76 }} contentFit="contain" />
            <Txt>{card.title}</Txt>
            <Txt color={colors.textSecondary}>{card.text}</Txt>
          </View>
        ))}
      </View>
    </Section>
  );
}

function ResearchBand() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
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
        <Photo source={RESEARCH} />
        <View style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, backgroundColor: 'rgba(0,0,0,0.2)' }} />
      </View>
      <View style={{ flex: isDesktop ? undefined : 1, width: isDesktop ? 535 : '100%', gap: 24, paddingHorizontal: isDesktop ? 0 : gutter }}>
        <Eyebrow>RESEARCH DRIVING PRACTICE</Eyebrow>
        <Txt variant="h2">Better decisions begin with better understanding.</Txt>
        <Txt color={colors.textSecondary}>
          Our research provides clients with market insights, sector analysis and strategic intelligence to support
          informed cultural asset decisions.
        </Txt>
        <SecondaryButton label="Explore Research" href="/research" />
      </View>
    </View>
  );
}

export default function Advisory() {
  return (
    <SiteLayout>
      <PageHero
        eyebrow="ADVISORY"
        title="Every Collection Deserves a Strategy."
        paragraphs={[
          'We provide independent, research-led advice to help organisations and collectors acquire, structure, govern and steward cultural assets for long-term value.',
        ]}
        cta={{ label: 'Request a Consultation', href: '/contact' }}
        image={HERO}
      />
      <OurAdvisory />
      <QuoteBand />
      <HowWeThink />
      <ResearchBand />
      <CtaBanner
        title="Have a cultural asset question?"
        text="Let’s discuss how we can help you build, manage and steward value that endures."
        label="Let's talk"
        href="/contact"
      />
    </SiteLayout>
  );
}
