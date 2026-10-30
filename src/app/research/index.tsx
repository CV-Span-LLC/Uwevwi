import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { CtaBanner } from '@/components/blocks';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, PrimaryButton, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { FEATURED, JOURNAL, RESEARCH_HERO, type Entry } from '@/data/research';
import { colors, layout } from '@/theme';

const ARROW = require('../../../assets/figma/arrow-right-accent.svg');
const CHEVRON = require('../../../assets/figma/chevron-up.svg');

type Filter = 'ALL' | 'RESEARCH' | 'JOURNAL' | 'WRITERS COMMISSION';
const FILTERS: Filter[] = ['ALL', 'RESEARCH', 'JOURNAL', 'WRITERS COMMISSION'];

function Hero() {
  const { isDesktop, isMobile, bp } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ backgroundColor: colors.background }}>
      <View
        style={{
          flexDirection: isDesktop ? 'row' : 'column',
          alignItems: isDesktop ? 'center' : 'stretch',
          gap: isDesktop ? 36 : 36,
          paddingTop: isDesktop ? 60 : 32,
          paddingBottom: isDesktop ? 0 : 40,
          paddingLeft: gutter,
          paddingRight: isDesktop ? 0 : gutter,
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
        }}
      >
        <View style={{ width: isDesktop ? 494 : '100%', gap: 24 }}>
          <Eyebrow>RESEARCH</Eyebrow>
          <Txt variant="hero">The future of cultural assets will be shaped by evidence, not assumptions.</Txt>
          <Txt color={colors.textSecondary}>
            Our research explores the people, systems and markets that shape cultural value, from heritage and
            collections to governance, investment and stewardship.
          </Txt>
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, width: isDesktop ? undefined : '100%', height: isDesktop ? 800 : isMobile ? 340 : 520 }}>
          <Photo source={RESEARCH_HERO} />
        </View>
      </View>
    </View>
  );
}

function Featured() {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section paddingY={60} innerStyle={{ gap: 24 }}>
      <Eyebrow>FEATURED</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: 34 }}>
        <View style={{ width: isDesktop ? 595 : '100%', height: isDesktop ? 584 : isMobile ? 300 : 420, borderRadius: 8, overflow: 'hidden' }}>
          <Photo source={FEATURED.image} />
        </View>
        <View style={{ flex: 1, gap: 24 }}>
          <Eyebrow>RESEARCH</Eyebrow>
          <Txt variant="h1">{FEATURED.title}</Txt>
          <Txt color={colors.textSecondary}>{FEATURED.excerpt}</Txt>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <Txt color={colors.accent}>{FEATURED.part}</Txt>
            <View style={{ width: 4, height: 4, borderRadius: 100, backgroundColor: colors.accent }} />
            <Txt color={colors.accent}>{FEATURED.dateLabel}</Txt>
          </View>
          <PrimaryButton label="Read Research" href={{ pathname: '/research/[slug]', params: { slug: FEATURED.slug } }} />
        </View>
      </View>
    </Section>
  );
}

function FilterBar({ filter, onFilter, newestFirst, onSort }: { filter: Filter; onFilter: (f: Filter) => void; newestFirst: boolean; onSort: () => void }) {
  const { bp, isMobile } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ borderBottomWidth: 1, borderBottomColor: colors.borders, backgroundColor: colors.white }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 8 : 24,
          paddingHorizontal: gutter,
          paddingVertical: 12,
          minHeight: 68,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 32, alignItems: 'center', minHeight: 44 }}>
          {FILTERS.map((f) => (
            <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: f === filter }} onPress={() => onFilter(f)}>
              <Txt variant="nav" color={f === filter ? colors.accent : colors.darkSection}>
                {f}
              </Txt>
            </Pressable>
          ))}
        </ScrollView>
        <Pressable accessibilityRole="button" accessibilityLabel="Change sort order" onPress={onSort} style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
          <Txt variant="nav" color={colors.textSecondary}>
            Sort by
          </Txt>
          <Txt color={colors.accent}>{newestFirst ? 'Most recent' : 'Oldest first'}</Txt>
          <Image source={CHEVRON} style={{ width: 24, height: 24, transform: [{ rotate: newestFirst ? '180deg' : '0deg' }] }} contentFit="contain" />
        </Pressable>
      </View>
    </View>
  );
}

function Card({ entry }: { entry: Entry }) {
  return (
    <Link href={{ pathname: '/research/[slug]', params: { slug: entry.slug } }} asChild>
      <Pressable accessibilityRole="link" style={styles.card}>
        <View style={{ height: 217, borderRadius: 8, overflow: 'hidden' }}>
          <Photo source={entry.image} />
        </View>
        <Txt variant="caption">
          {entry.number}- {entry.type}
        </Txt>
        <Txt variant="h5">{entry.title}</Txt>
        <Txt variant="small" color={colors.textSecondary} numberOfLines={3} style={{ minHeight: 66 }}>
          {entry.excerpt}
        </Txt>
        <View style={{ flexDirection: 'row', justifyContent: entry.part ? 'space-between' : 'flex-end' }}>
          {entry.part ? (
            <Txt variant="small" color={colors.textSecondary}>
              {entry.part}
            </Txt>
          ) : null}
          <Txt variant="small" color={colors.textSecondary}>
            {entry.dateLabel}
          </Txt>
        </View>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12 }}>
          <Txt variant="button">Read {entry.type}</Txt>
          <Image source={ARROW} style={{ width: 24, height: 24 }} contentFit="contain" />
        </View>
      </Pressable>
    </Link>
  );
}

function Listing() {
  const { isDesktop, isMobile } = useBreakpoint();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [newestFirst, setNewestFirst] = useState(true);

  const entries = useMemo(() => {
    const base = filter === 'ALL' || filter === 'JOURNAL' ? JOURNAL : [];
    return [...base].sort((a, b) => (newestFirst ? b.date.localeCompare(a.date) : a.date.localeCompare(b.date)));
  }, [filter, newestFirst]);

  return (
    <>
      <FilterBar filter={filter} onFilter={setFilter} newestFirst={newestFirst} onSort={() => setNewestFirst((v) => !v)} />
      <Section paddingY={80}>
        {entries.length === 0 ? (
          <Txt color={colors.textSecondary} align="center">
            {filter === 'WRITERS COMMISSION'
              ? 'Commissioned writing will appear here.'
              : 'More research papers will appear here as they are published.'}
          </Txt>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', columnGap: 20, rowGap: 24 }}>
            {entries.map((entry) => (
              <View key={entry.slug} style={{ width: isDesktop ? '32.2%' : isMobile ? '100%' : '48.8%' }}>
                <Card entry={entry} />
              </View>
            ))}
          </View>
        )}
      </Section>
    </>
  );
}

export default function Research() {
  return (
    <SiteLayout>
      <Hero />
      <Featured />
      <Listing />
      <CtaBanner title="Interested in contributing to our research or commissioning a piece?" text="" label="Get in Touch" href="/contact" />
    </SiteLayout>
  );
}

const styles = StyleSheet.create({
  card: { gap: 12 },
});
