import { Image } from 'expo-image';
import { View } from 'react-native';

import { CtaBanner, PageHero } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, useBreakpoint } from '@/components/ui';
import { useSiteImage } from '@/lib/site-images';
import { colors } from '@/theme';

const HERO = require('../../assets/figma/stewardship-hero.jpg');
const BEYOND = require('../../assets/figma/stewardship-beyond.jpg');
const LINE = require('../../assets/figma/line.svg');

const PILLARS = [
  { n: '01', title: 'Documentation', lead: 'Know what you own.', text: 'We create accurate records and provenance trails that establish clarity and support informed decisions.' },
  { n: '02', title: 'Governance', lead: 'Structure ownership and decision making.', text: 'We help define frameworks, policies and roles that ensure accountability and alignment with your values.' },
  { n: '03', title: 'Preservation & Restoration', lead: 'Protect physical and cultural value.', text: 'We implement conservation strategies that maintain integrity and extend the life of your assets.' },
  { n: '04', title: 'Legacy', lead: 'Ensure continuity across generations.', text: 'We develop legacy and disposition plans that preserve meaning and enable future stewardship.' },
];

const CONTINUITY = [
  { title: 'Assessing', text: 'Understanding what exists and its cultural, historical and financial value.' },
  { title: 'Structuring', text: 'Creating governance structures and policies for responsible stewardship.' },
  { title: 'Protecting', text: 'Protecting cultural value through risk management and conservation.' },
  { title: 'Continuing', text: 'Ensuring long-term continuity through planning, transition and legacy strategies.' },
];

const SUPPORTED = [
  { n: '01', title: 'Collectors', text: 'Private collectors building meaningful collections.' },
  { n: '02', title: 'Family Offices', text: 'Families planning for generational continuity.' },
  { n: '03', title: 'Corporations', text: 'Organisations integrating culture into their legacy.' },
  { n: '04', title: 'Museums & Cultural Institutions', text: 'Institutions safeguarding collections held in public trust.' },
  { n: '05', title: 'Hospitality & Real Estate', text: 'Developers and operators enhancing cultural narratives.' },
  { n: '06', title: 'Designers & Architects', text: 'Creatives collaborating on culturally anchored projects.' },
];

function Pillars() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingY={90} innerStyle={{ gap: 62 }}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'flex-start', gap: isDesktop ? 114 : 24 }}>
        <View style={{ width: isDesktop ? 280 : '100%', gap: 24 }}>
          <Eyebrow>OUR PILLARS</Eyebrow>
          <Txt variant="h2">The Four Pillars Of Stewardship</Txt>
        </View>
        <View style={{ width: isDesktop ? 562 : '100%' }}>
          <Txt color={colors.textSecondary}>
            Our stewardship approach is built on four essential pillars that ensure cultural assets are understood,
            protected and carried forward.
          </Txt>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {PILLARS.map((p, i) => (
          <View
            key={p.n}
            style={{
              width: isDesktop ? '25%' : isMobile ? '100%' : '50%',
              gap: 16,
              paddingVertical: 10,
              paddingLeft: isDesktop && i === 0 ? 0 : 40,
              paddingRight: 40,
              borderRightWidth: isDesktop && i < PILLARS.length - 1 ? 2 : 0,
              borderRightColor: colors.borders,
              marginBottom: isDesktop ? 0 : 32,
            }}
          >
            <Txt variant="large" color={colors.accent}>
              {p.n}
            </Txt>
            <Txt variant="h4">{p.title}</Txt>
            <View style={{ width: 40, height: 2, borderRadius: 100, backgroundColor: colors.accent }} />
            <Txt>{p.lead}</Txt>
            <Txt variant="small" color={colors.textSecondary}>
              {p.text}
            </Txt>
          </View>
        ))}
      </View>
    </Section>
  );
}

function BeyondAcquisition() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section background={colors.background} paddingY={88} innerStyle={{ gap: 24 }}>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', alignItems: isDesktop ? 'center' : 'flex-start', gap: 24 }}>
        <View style={{ width: isDesktop ? 315 : '100%', gap: 24 }}>
          <Eyebrow>BEYOND ACQUISITION</Eyebrow>
          <Txt variant="h2">Stewardship Creates Continuity.</Txt>
        </View>
        <View style={{ width: isDesktop ? 436 : '100%' }}>
          <Txt color={colors.text}>
            We go beyond acquisition to build systems that sustain value, relevance and impact over time.
          </Txt>
        </View>
      </View>
      {isDesktop ? (
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 22 }}>
          {CONTINUITY.map((_, i) => (
            <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 22, flex: i < CONTINUITY.length - 1 ? 1 : undefined }}>
              <Txt variant="large" color={colors.accent}>
                {String(i + 1).padStart(2, '0')}
              </Txt>
              {i < CONTINUITY.length - 1 ? <Image source={LINE} style={{ flex: 1, height: 1 }} contentFit="fill" /> : null}
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 28, columnGap: 24 }}>
        {CONTINUITY.map((c, i) => (
          <View key={c.title} style={{ width: isDesktop ? 200 : '100%', flexGrow: isDesktop ? 0 : 1, gap: 6 }}>
            {!isDesktop ? (
              <Txt variant="large" color={colors.accent}>
                {String(i + 1).padStart(2, '0')}
              </Txt>
            ) : null}
            <Txt variant="h4">{c.title}</Txt>
            <Txt color={colors.textSecondary}>{c.text}</Txt>
          </View>
        ))}
      </View>
    </Section>
  );
}

function WhoWeSupport() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingTop={100} paddingBottom={86} innerStyle={{ gap: 49 }}>
      <Eyebrow>WHO WE SUPPORT</Eyebrow>
      <Txt variant="h2">Who Stewardship Serves.</Txt>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
        {SUPPORTED.map((s, i) => {
          const col = isDesktop ? i % 3 : isMobile ? 0 : i % 2;
          const cols = isDesktop ? 3 : isMobile ? 1 : 2;
          const row = Math.floor(i / cols);
          return (
            <View
              key={s.n}
              style={{
                width: `${100 / cols}%`,
                flexDirection: 'row',
                gap: 24,
                minHeight: 168,
                paddingTop: row > 0 || !isDesktop ? 38 : 0,
                paddingBottom: 24,
                paddingLeft: col === 0 ? 0 : 34,
                paddingRight: 34,
                borderRightWidth: col < cols - 1 ? 2 : 0,
                borderRightColor: colors.borders,
                borderTopWidth: row > 0 ? 2 : 0,
                borderTopColor: colors.borders,
              }}
            >
              <Txt variant="large" color={colors.accent}>
                {s.n}
              </Txt>
              <View style={{ flex: 1, gap: 14 }}>
                <Txt variant="h4">{s.title}</Txt>
                <Txt color={colors.textSecondary}>{s.text}</Txt>
              </View>
            </View>
          );
        })}
      </View>
    </Section>
  );
}

export default function Stewardship() {
  const { isMobile } = useBreakpoint();
  const heroImage = useSiteImage('stewardship.hero', HERO);
  const bottomImage = useSiteImage('stewardship.bottom', BEYOND);
  return (
    <SiteLayout>
      <PageHero
        background={colors.background}
        eyebrow="STEWARDSHIP"
        title="Ownership Is Only the Beginning."
        paragraphs={[
          'We help institutions and private collectors safeguard what they own through documentation, governance, preservation and legacy planning. So cultural assets remain protected and relevant for generations to come.',
        ]}
        cta={{ label: "Let's talk", href: '/contact' }}
        image={heroImage}
      />
      <Pillars />
      <BeyondAcquisition />
      <View style={{ height: isMobile ? 240 : 436 }}>
        <Photo source={bottomImage} position="center" />
      </View>
      <WhoWeSupport />
      <CtaBanner
        title="What happens to what you own next?"
        text="Let’s discuss how we can help you document, govern, preserve and plan for the future of your collection."
        label="Discuss Your Collection"
        href="/contact"
      />
    </SiteLayout>
  );
}
