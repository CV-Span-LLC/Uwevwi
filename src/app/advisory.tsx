import { BracketQuote, CardGrid, CtaBanner, PageHero, SectionHead, SectionTitle, SplitBand, type CardItem } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Section } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors } from '@/theme';

const HERO = require('../../assets/figma/advisory-hero.png');
const RESEARCH = require('../../assets/figma/advisory-research.jpg');

const SERVICES: CardItem[] = [
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

const THINKING: CardItem[] = [
  { icon: require('../../assets/figma/think-strategy.svg'), title: 'Strategy', text: 'Align cultural assets with institutional objectives and long-term visions.' },
  { icon: require('../../assets/figma/think-governance.svg'), title: 'Governance', text: 'Create the structures required to manage ownership and decision-making.' },
  { icon: require('../../assets/figma/think-stewardship.svg'), title: 'Stewardship', text: 'Protect cultural and financial value across time and generations.' },
];

export default function Advisory() {
  const heroImage = useSiteImage('advisory.hero', HERO);
  const researchImage = useSiteImage('advisory.research', RESEARCH);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="ADVISORY"
        title="Every Collection Deserves a Strategy."
        paragraphs={[
          'We provide independent, research-led advice to help organisations and collectors acquire, structure, govern and steward cultural assets for long-term value.',
        ]}
        cta={{ label: 'Request a Consultation', href: '/contact' }}
        image={heroImage}
      />
      <Section paddingY={110} innerStyle={{ gap: 56 }}>
        <SectionHead
          eyebrow="Our advisory"
          title="How we help clients build lasting value."
          text="Our advisory services are tailored to meet the unique needs of institutions, organisations and private clients."
        />
        <CardGrid items={SERVICES} desktop={3} tablet={2} minHeight={300} background={colors.background} />
      </Section>
      <BracketQuote
        eyebrow="Our role"
        background={colors.background}
        text="From acquisition to stewardship, we help clients make informed cultural asset decisions."
        note="Our role is to bring clarity, structure and independence to every stage of the cultural asset journey so value is created, protected and sustained for generations."
      />
      <Section paddingY={110} innerStyle={{ gap: 48 }}>
        <SectionTitle eyebrow="How we think" title="Three ways we look at every asset." />
        <CardGrid items={THINKING} desktop={3} tablet={3} minHeight={240} />
      </Section>
      <SplitBand
        background={colors.background}
        image={researchImage}
        eyebrow="Research driving practice"
        title="Better decisions begin with better understanding."
        text="Our research provides clients with market insights, sector analysis and strategic intelligence to support informed cultural asset decisions."
        cta={{ label: 'Explore Research', href: '/research' }}
      />
      <CtaBanner
        title="Have a cultural asset question?"
        text="Let’s discuss how we can help you build, manage and steward value that endures."
        label="Let's talk"
        href="/contact"
      />
    </SiteLayout>
  );
}
