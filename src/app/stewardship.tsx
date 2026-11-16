import { CardGrid, CtaBanner, ImageBand, PageHero, SectionHead, SectionTitle, Steps, type CardItem } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Section } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors } from '@/theme';

const HERO = require('../../assets/figma/stewardship-hero.jpg');
const BEYOND = require('../../assets/figma/stewardship-beyond.jpg');

const PILLARS: CardItem[] = [
  { title: 'Documentation', lead: 'Know what you own.', text: 'We create accurate records and provenance trails that establish clarity and support informed decisions.' },
  { title: 'Governance', lead: 'Structure ownership and decision making.', text: 'We help define frameworks, policies and roles that ensure accountability and alignment with your values.' },
  { title: 'Preservation & Restoration', lead: 'Protect physical and cultural value.', text: 'We implement conservation strategies that maintain integrity and extend the life of your assets.' },
  { title: 'Legacy', lead: 'Ensure continuity across generations.', text: 'We develop legacy and disposition plans that preserve meaning and enable future stewardship.' },
];

const CONTINUITY = [
  { title: 'Assessing', text: 'Understanding what exists and its cultural, historical and financial value.' },
  { title: 'Structuring', text: 'Creating governance structures and policies for responsible stewardship.' },
  { title: 'Protecting', text: 'Protecting cultural value through risk management and conservation.' },
  { title: 'Continuing', text: 'Ensuring long-term continuity through planning, transition and legacy strategies.' },
];

const SUPPORTED: CardItem[] = [
  { title: 'Collectors', text: 'Private collectors building meaningful collections.' },
  { title: 'Family Offices', text: 'Families planning for generational continuity.' },
  { title: 'Corporations', text: 'Organisations integrating culture into their legacy.' },
  { title: 'Museums & Cultural Institutions', text: 'Institutions safeguarding collections held in public trust.' },
  { title: 'Hospitality & Real Estate', text: 'Developers and operators enhancing cultural narratives.' },
  { title: 'Designers & Architects', text: 'Creatives collaborating on culturally anchored projects.' },
];

export default function Stewardship() {
  const heroImage = useSiteImage('stewardship.hero', HERO);
  const bottomImage = useSiteImage('stewardship.bottom', BEYOND);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="STEWARDSHIP"
        title="Ownership Is Only the Beginning."
        paragraphs={[
          'We help institutions and private collectors safeguard what they own through documentation, governance, preservation and legacy planning. So cultural assets remain protected and relevant for generations to come.',
        ]}
        cta={{ label: "Let's talk", href: '/contact' }}
        image={heroImage}
      />
      <Section paddingY={110} innerStyle={{ gap: 56 }}>
        <SectionHead
          eyebrow="Our pillars"
          title="The four pillars of stewardship."
          text="Our stewardship approach is built on four essential pillars that ensure cultural assets are understood, protected and carried forward."
        />
        <CardGrid items={PILLARS} desktop={4} tablet={2} minHeight={340} />
      </Section>
      <Section background={colors.background} paddingY={110} innerStyle={{ gap: 56 }}>
        <SectionHead
          eyebrow="Beyond acquisition"
          title="Stewardship creates continuity."
          text="We go beyond acquisition to build systems that sustain value, relevance and impact over time."
        />
        <Steps items={CONTINUITY} />
      </Section>
      <ImageBand image={bottomImage} caption="/ Stewardship · continuity" height={440} />
      <Section paddingY={110} innerStyle={{ gap: 48 }}>
        <SectionTitle eyebrow="Who we support" title="Who stewardship serves." />
        <CardGrid items={SUPPORTED} desktop={3} tablet={2} minHeight={200} />
      </Section>
      <CtaBanner
        title="What happens to what you own next?"
        text="Let’s discuss how we can help you document, govern, preserve and plan for the future of your collection."
        label="Discuss Your Collection"
        href="/contact"
      />
    </SiteLayout>
  );
}
