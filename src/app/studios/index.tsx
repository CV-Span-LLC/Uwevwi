import { Pressable, View } from 'react-native';

import { CardGrid, PageHero, SectionTitle, SplitBand, type CardItem } from '@/components/blocks';
import { FramedPhoto, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, useBreakpoint } from '@/components/ui';
import { assetUrl, publicApi, type Exhibition } from '@/lib/api';
import { useSiteImage } from '@/lib/site-images';
import { useRemote } from '@/lib/use-remote';
import { colors } from '@/theme';

const HERO = require('../../../assets/figma/studios-hero.jpg');
const MOTION = require('../../../assets/figma/studios-motion.jpg');

const WHAT_WE_DO: CardItem[] = [
  { title: 'Exhibitions', text: 'Curating exhibitions that bring artists, artworks, ideas and audiences into conversation.' },
  { title: 'Public Programmes', text: 'Creating talks, conversations and cultural experiences that deepen engagement.' },
  { title: 'Artist Development', text: 'Supporting artists and contributing to the growth of the wider cultural ecosystem.' },
  { title: 'Cultural Initiatives', text: 'Developing creative projects that connect art, cultural institutions and communities.' },
];

const SELECTED_WORK = [
  { title: 'Spectrum & Strings Attached', kind: 'Exhibition', year: '2025', image: require('../../../assets/figma/work-spectrum.png') },
  { title: 'Art At The Mews', kind: 'Art Salon', year: '2025', image: require('../../../assets/figma/work-mews.png') },
  { title: 'A New Language of Presence', kind: 'Exhibition', year: '2025', image: require('../../../assets/figma/work-presence.png') },
];

function FeaturedExhibition() {
  const { isDesktop, isMobile } = useBreakpoint();
  const { data } = useRemote(() => publicApi<Exhibition[]>('/exhibitions'));
  const exhibition = data?.[0];
  if (!exhibition) return null;
  const title = exhibition.series || exhibition.title;
  return (
    <Section background={colors.background} paddingY={110} innerStyle={{ gap: 48 }}>
      <Eyebrow>Featured exhibition</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: isDesktop ? 80 : 40 }}>
        <View style={{ width: isDesktop ? 500 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
          {exhibition.flyer ? (
            <FramedPhoto source={{ uri: assetUrl(exhibition.flyer) as string }} contentFit="contain" position="top" height={isDesktop ? 620 : isMobile ? 440 : 640} />
          ) : null}
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24 }}>
          {exhibition.edition ? (
            <Txt variant="mono" color={colors.accent} style={{ textTransform: 'uppercase' }}>
              {exhibition.edition.split('·')[0].trim()}
            </Txt>
          ) : null}
          <Txt variant={title.length > 30 ? 'h1' : 'stack'}>{title}</Txt>
          {exhibition.series ? <Txt variant="h4">{exhibition.title}</Txt> : null}
          <View style={{ gap: 6, borderLeftWidth: 2, borderLeftColor: colors.accent, paddingLeft: 14 }}>
            <Txt variant="mono" color={colors.textSecondary}>
              {exhibition.dateLabel}
            </Txt>
            <Txt variant="mono" color={colors.textSecondary}>
              {exhibition.location}
            </Txt>
          </View>
          <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 520 }}>
            {`/ ${exhibition.intro}`}
          </Txt>
          <TechButton label="View exhibition" href={{ pathname: '/studios/[slug]', params: { slug: exhibition.slug } }} tone="ink" />
        </View>
      </View>
    </Section>
  );
}

function SelectedWork() {
  const { isDesktop } = useBreakpoint();
  return (
    <Section paddingY={110} innerStyle={{ gap: 48 }}>
      <SectionTitle eyebrow="Selected work" title="Recent programmes and exhibitions." />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: 16 }}>
        {SELECTED_WORK.map((work, i) => (
          <Pressable key={work.title} accessibilityRole="text" style={{ flex: isDesktop ? 1 : undefined }}>
            {({ hovered }: { hovered?: boolean }) => (
              <View style={{ backgroundColor: colors.background, padding: 8, gap: 16, borderWidth: 1, borderColor: hovered ? colors.darkSection : colors.borders }}>
                <View style={{ height: 380, overflow: 'hidden' }}>
                  <Photo source={work.image} position="top" style={{ transform: [{ scale: hovered ? 1.04 : 1 }] }} />
                </View>
                <View style={{ gap: 8, paddingHorizontal: 10, paddingBottom: 14 }}>
                  <Txt variant="mono" color={colors.accent} style={{ textTransform: 'uppercase' }}>
                    {`/${String(i + 1).padStart(2, '0')} · ${work.kind} · ${work.year}`}
                  </Txt>
                  <Txt variant="h4">{work.title}</Txt>
                </View>
              </View>
            )}
          </Pressable>
        ))}
      </View>
    </Section>
  );
}

export default function Studios() {
  const heroImage = useSiteImage('studio.hero', HERO);
  const motionImage = useSiteImage('studio.motion', MOTION);
  return (
    <SiteLayout>
      <PageHero
        eyebrow="UWEVWI STUDIOS"
        title="Creating spaces for art, culture and encounter."
        paragraphs={['We develop exhibitions, public programmes and creative initiatives that connect people with African art and culture.']}
        image={heroImage}
      />
      <FeaturedExhibition />
      <Section paddingY={110} innerStyle={{ gap: 48 }}>
        <SectionTitle eyebrow="What we do" title="Four ways we bring culture to life." />
        <CardGrid items={WHAT_WE_DO} desktop={4} tablet={2} minHeight={260} />
      </Section>
      <SelectedWork />
      <SplitBand background={colors.background} image={motionImage} eyebrow="Culture in motion" title="Art creates meaning when we experience it together." />
    </SiteLayout>
  );
}
