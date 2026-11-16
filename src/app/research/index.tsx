import { Link } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, ScrollView, View } from 'react-native';

import { CtaBanner, PageHero } from '@/components/blocks';
import { FramedPhoto, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Photo, Section, Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { assetUrl, formatDate, publicApi, type ResearchSummary } from '@/lib/api';
import { useSiteImage } from '@/lib/site-images';
import { useRemote } from '@/lib/use-remote';
import { colors, layout } from '@/theme';

const RESEARCH_HERO = require('../../../assets/figma/research-hero.jpg');

type Filter = 'ALL' | 'RESEARCH' | 'JOURNAL' | 'WRITERS COMMISSION';
const FILTERS: Filter[] = ['ALL', 'RESEARCH', 'JOURNAL', 'WRITERS COMMISSION'];

const typeLabel = (type: ResearchSummary['type']) => (type === 'Research Paper' ? 'Research' : type === 'Writers Commission' ? 'Commission' : 'Journal');

function Featured({ entry }: { entry: ResearchSummary | undefined }) {
  const { isDesktop, isMobile } = useBreakpoint();
  if (!entry) return null;
  return (
    <Section background={colors.white} paddingY={110} innerStyle={{ gap: 48 }}>
      <Eyebrow>Featured</Eyebrow>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: isDesktop ? 80 : 40 }}>
        <View style={{ width: isDesktop ? 540 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
          {entry.image ? (
            <FramedPhoto source={{ uri: assetUrl(entry.image) as string }} height={isDesktop ? 520 : isMobile ? 320 : 440} frame={colors.background} />
          ) : null}
        </View>
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 24 }}>
          <Txt variant="mono" color={colors.accent} style={{ textTransform: 'uppercase' }}>
            {`${typeLabel(entry.type)} · ${new Date(entry.publishedAt).getFullYear()}`}
          </Txt>
          <Txt variant="h1">{entry.title}</Txt>
          <Txt variant="monoBody" color={colors.textSecondary} style={{ maxWidth: 520 }}>
            {`/ ${entry.excerpt}`}
          </Txt>
          <Txt variant="mono" color={colors.textSecondary}>
            {entry.author === 'Admin' ? 'UWEVWI ARCHIVE' : 'UWEVWI STUDIOS ARCHIVE'}
          </Txt>
          <TechButton label="Read research" href={{ pathname: '/research/[slug]', params: { slug: entry.slug } }} tone="accent" />
        </View>
      </View>
    </Section>
  );
}

function FilterBar({ filter, onFilter, newestFirst, onSort }: { filter: Filter; onFilter: (f: Filter) => void; newestFirst: boolean; onSort: () => void }) {
  const { bp, isMobile } = useBreakpoint();
  const gutter = gutterFor(bp);
  return (
    <View style={{ borderTopWidth: 1, borderBottomWidth: 1, borderColor: colors.borders, backgroundColor: colors.background }}>
      <View
        style={{
          width: '100%',
          maxWidth: layout.maxWidth,
          alignSelf: 'center',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: isMobile ? 4 : 24,
          paddingHorizontal: gutter,
          paddingVertical: 8,
          minHeight: 64,
        }}
      >
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 28, alignItems: 'center', minHeight: 44 }}>
          {FILTERS.map((f) => {
            const on = f === filter;
            return (
              <Pressable key={f} accessibilityRole="button" accessibilityState={{ selected: on }} onPress={() => onFilter(f)}>
                <View style={{ paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: on ? colors.accent : 'transparent' }}>
                  <Txt variant="mono" color={on ? colors.accent : colors.darkSection}>
                    {f}
                  </Txt>
                </View>
              </Pressable>
            );
          })}
        </ScrollView>
        <Pressable accessibilityRole="button" accessibilityLabel="Change sort order" onPress={onSort} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
          <Txt variant="mono" color={colors.textSecondary}>
            SORT BY
          </Txt>
          <Txt variant="mono" color={colors.accent}>
            {`${newestFirst ? 'MOST RECENT' : 'OLDEST FIRST'} ${newestFirst ? '↓' : '↑'}`}
          </Txt>
        </Pressable>
      </View>
    </View>
  );
}

function Card({ entry, number }: { entry: ResearchSummary; number: string }) {
  const label = typeLabel(entry.type);
  return (
    <Link href={{ pathname: '/research/[slug]', params: { slug: entry.slug } }} asChild>
      <Pressable accessibilityRole="link">
        {({ hovered }: { hovered?: boolean }) => (
          <View style={{ gap: 14, padding: 8, backgroundColor: colors.white, borderWidth: 1, borderColor: hovered ? colors.darkSection : colors.borders }}>
            <View style={{ height: 230, overflow: 'hidden', backgroundColor: colors.background }}>
              {entry.image ? <Photo source={{ uri: assetUrl(entry.image) as string }} style={{ transform: [{ scale: hovered ? 1.04 : 1 }] }} /> : null}
              <View style={{ position: 'absolute', left: 0, top: 0, backgroundColor: colors.darkSection, paddingHorizontal: 10, paddingVertical: 6 }}>
                <Txt variant="mono" color={colors.white} style={{ textTransform: 'uppercase' }}>
                  {label}
                </Txt>
              </View>
            </View>
            <View style={{ gap: 10, paddingHorizontal: 10, paddingBottom: 12 }}>
              <Txt variant="mono" color={colors.accent}>
                {`/${number}${entry.part ? ` · ${entry.part.toUpperCase()}` : ''}`}
              </Txt>
              <Txt variant="h5">{entry.title}</Txt>
              <Txt variant="small" color={colors.textSecondary} numberOfLines={3} style={{ minHeight: 66 }}>
                {entry.excerpt}
              </Txt>
              <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6 }}>
                <Txt variant="mono" color={colors.textSecondary}>
                  {formatDate(entry.publishedAt)}
                </Txt>
                <Txt variant="mono" color={hovered ? colors.accent : colors.darkSection}>
                  {`READ ${label.toUpperCase()} →`}
                </Txt>
              </View>
            </View>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Listing({ entries, featured }: { entries: ResearchSummary[]; featured: ResearchSummary | undefined }) {
  const { isDesktop, isMobile } = useBreakpoint();
  const [filter, setFilter] = useState<Filter>('ALL');
  const [newestFirst, setNewestFirst] = useState(true);

  // Numbers count up from the oldest piece of each type.
  const numbers = useMemo(() => {
    const result = new Map<string, string>();
    const counts: Record<string, number> = {};
    [...entries]
      .sort((a, b) => a.publishedAt.localeCompare(b.publishedAt))
      .forEach((e) => {
        counts[e.type] = (counts[e.type] ?? 0) + 1;
        result.set(e.slug, String(counts[e.type]).padStart(2, '0'));
      });
    return result;
  }, [entries]);

  const shown = useMemo(() => {
    const wanted = filter === 'RESEARCH' ? 'Research Paper' : filter === 'JOURNAL' ? 'Journal' : filter === 'WRITERS COMMISSION' ? 'Writers Commission' : null;
    return entries
      .filter((e) => (wanted ? e.type === wanted : e.slug !== featured?.slug))
      .sort((a, b) => (newestFirst ? b.publishedAt.localeCompare(a.publishedAt) : a.publishedAt.localeCompare(b.publishedAt)));
  }, [entries, featured, filter, newestFirst]);

  return (
    <>
      <FilterBar filter={filter} onFilter={setFilter} newestFirst={newestFirst} onSort={() => setNewestFirst((v) => !v)} />
      <Section background={colors.background} paddingY={80}>
        {shown.length === 0 ? (
          <Txt variant="monoBody" color={colors.textSecondary} align="center">
            {filter === 'WRITERS COMMISSION' ? 'Commissioned writing will appear here.' : 'More will appear here as it is published.'}
          </Txt>
        ) : (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
            {shown.map((entry) => (
              <View key={entry.slug} style={{ width: isDesktop ? '32.4%' : isMobile ? '100%' : '49.2%' }}>
                <Card entry={entry} number={numbers.get(entry.slug) ?? '01'} />
              </View>
            ))}
          </View>
        )}
      </Section>
    </>
  );
}

export default function Research() {
  const { data, error, loading, reload } = useRemote(() => publicApi<ResearchSummary[]>('/research'));
  const heroImage = useSiteImage('research.hero', RESEARCH_HERO);
  const featured = data?.find((e) => e.type === 'Research Paper');
  return (
    <SiteLayout>
      <PageHero
        eyebrow="RESEARCH"
        title="The future of cultural assets will be shaped by evidence, not assumptions."
        paragraphs={[
          'Our research explores the people, systems and markets that shape cultural value, from heritage and collections to governance, investment and stewardship.',
        ]}
        image={heroImage}
      />
      <Featured entry={featured} />
      {data ? (
        <Listing entries={data} featured={featured} />
      ) : (
        <Section background={colors.background} paddingY={80} innerStyle={{ alignItems: 'center', gap: 16 }}>
          <Txt variant="monoBody" color={colors.textSecondary}>
            {loading ? 'Loading research…' : error}
          </Txt>
          {!loading ? <TechButton label="Try again" onPress={reload} tone="accent" /> : null}
        </Section>
      )}
      <CtaBanner title="Interested in contributing to our research or commissioning a piece?" text="" label="Get in Touch" href="/contact" />
    </SiteLayout>
  );
}
