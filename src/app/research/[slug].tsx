import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Linking, Pressable, ScrollView, View } from 'react-native';

import { Comments } from '@/components/comments';
import { SiteLayout } from '@/components/site-layout';
import { Photo, PrimaryButton, Section, Txt, useBreakpoint } from '@/components/ui';
import { ARTICLES, findEntry, type Article, type Block } from '@/data/research';
import { colors, fonts } from '@/theme';

const BACK = require('../../../assets/figma/arrow-left.svg');

function BackLink() {
  return (
    <Link href="/research" asChild>
      <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, alignSelf: 'flex-start' }}>
        <Image source={BACK} style={{ width: 24, height: 24, transform: [{ scaleX: -1 }] }} contentFit="contain" />
        <Txt variant="large" color={colors.accent}>
          Back
        </Txt>
      </Pressable>
    </Link>
  );
}

function ArticleHero({ title, byline, image }: { title: string; byline: string; image: number }) {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section background={colors.background} paddingTop={100} paddingBottom={80} innerStyle={{ gap: 24 }}>
      <BackLink />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: 40 }}>
        <View style={{ width: isDesktop ? 451 : '100%', height: isDesktop ? 608 : isMobile ? 360 : 480, borderRadius: 8, overflow: 'hidden' }}>
          <Photo source={image} />
        </View>
        <View style={{ flex: 1, gap: 24 }}>
          <Txt variant="hero">{title}</Txt>
          <Txt variant="large" color={colors.textSecondary}>
            {byline}
          </Txt>
        </View>
      </View>
    </Section>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.kind) {
    case 'heading':
      return <Txt variant="h3">{block.text}</Txt>;
    case 'subheading':
      return <Txt variant="large">{block.text}</Txt>;
    case 'p':
      return block.strong ? (
        <Txt variant="large">{block.text}</Txt>
      ) : (
        <Txt color={colors.textSecondary}>{block.text}</Txt>
      );
    case 'mixed':
      return (
        <Txt color={colors.textSecondary}>
          <Txt color={colors.text}>{block.lead}</Txt>
          {block.rest}
        </Txt>
      );
    case 'list':
      return (
        <View style={{ gap: 8 }}>
          {block.items.map((item, i) => (
            <View key={item} style={{ flexDirection: 'row', gap: 12 }}>
              <Txt style={{ width: 24 }}>{block.ordered === false ? '•' : `${i + 1}.`}</Txt>
              <Txt style={{ flex: 1 }}>{item}</Txt>
            </View>
          ))}
        </View>
      );
    case 'quote':
      return (
        <Txt variant="quote" style={{ fontFamily: fonts.quote }}>
          {block.text}
        </Txt>
      );
    case 'table':
      return <TableView head={block.head} rows={block.rows} />;
    case 'signature':
      return <Signature />;
  }
}

function TableView({ head, rows }: { head: string[]; rows: string[][] }) {
  const { isMobile } = useBreakpoint();
  const widths = [0.23, 0.49, 0.28];
  const minWidth = 760;
  return (
    <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={false}>
      <View style={{ minWidth: isMobile ? minWidth : undefined, width: isMobile ? minWidth : '100%', borderWidth: 1, borderColor: colors.darkSection, borderRadius: 8, overflow: 'hidden' }}>
        {[head, ...rows].map((row, r) => (
          <View
            key={r}
            style={{ flexDirection: 'row', borderBottomWidth: r === rows.length ? 0 : 1, borderBottomColor: colors.darkSection }}
          >
            {row.map((cell, c) => (
              <View
                key={c}
                style={{
                  flexBasis: `${widths[c] * 100}%`,
                  flexGrow: 1,
                  paddingHorizontal: r === 0 ? 24 : 28,
                  paddingVertical: 21,
                  alignItems: r === 0 ? 'center' : 'flex-start',
                  borderRightWidth: c === row.length - 1 ? 0 : 1,
                  borderRightColor: colors.darkSection,
                }}
              >
                <Txt variant={r === 0 ? 'large' : 'body'} color={r === 0 ? colors.text : colors.textSecondary}>
                  {cell}
                </Txt>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

function Signature() {
  return (
    <View style={{ gap: 0 }}>
      <Txt variant="quote" style={{ fontFamily: fonts.quote }}>
        Nazerin Gbinije
      </Txt>
      <Txt variant="quote" color={colors.textSecondary} style={{ fontFamily: fonts.quote, fontSize: 20, lineHeight: 30 }}>
        Founder & Cultural Strategist
      </Txt>
      <Txt color={colors.textSecondary}>Uwevwi Ltd</Txt>
      <View style={{ height: 26 }} />
      <Txt color={colors.textSecondary}>
        W:{' '}
        <Txt style={{ textDecorationLine: 'underline' }} color={colors.textSecondary} onPress={() => Linking.openURL('https://www.uwevwi.org/')}>
          www.uwevwi.org
        </Txt>
      </Txt>
      <Txt color={colors.textSecondary}>
        E:{' '}
        <Txt style={{ textDecorationLine: 'underline' }} color={colors.textSecondary} onPress={() => Linking.openURL('mailto:hello@uwevwi.org')}>
          hello@uwevwi.org
        </Txt>
      </Txt>
    </View>
  );
}

function FullArticle({ article }: { article: Article }) {
  return (
    <>
      <ArticleHero title={article.title} byline={article.byline} image={article.image} />
      <Section paddingTop={40} paddingBottom={60} innerStyle={{ maxWidth: 1000, gap: 24 }}>
        {article.blocks.map((block, i) => (
          <BlockView key={i} block={block} />
        ))}
      </Section>
      <Comments />
    </>
  );
}

function SummaryOnly({ slug }: { slug: string }) {
  const entry = findEntry(slug);
  if (!entry) return <NotFoundState />;
  return (
    <>
      <ArticleHero title={entry.title} byline={`UWEVWI STUDIOS · ${entry.dateLabel.toUpperCase()}`} image={entry.image} />
      <Section paddingTop={40} paddingBottom={80} innerStyle={{ maxWidth: 1000, gap: 24 }}>
        {entry.part ? <Txt variant="large">{entry.part}</Txt> : null}
        <Txt color={colors.textSecondary}>{entry.excerpt}</Txt>
        <Txt color={colors.textSecondary}>The full {entry.type.toLowerCase()} will be published soon.</Txt>
        <PrimaryButton label="Back to Research" href="/research" />
      </Section>
    </>
  );
}

function NotFoundState() {
  return (
    <Section background={colors.background} paddingY={140} innerStyle={{ gap: 24 }}>
      <BackLink />
      <Txt variant="h1">We could not find that piece.</Txt>
      <PrimaryButton label="Browse research" href="/research" />
    </Section>
  );
}

export default function ResearchArticle() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const article = ARTICLES[slug];
  return <SiteLayout>{article ? <FullArticle article={article} /> : <SummaryOnly slug={slug} />}</SiteLayout>;
}
