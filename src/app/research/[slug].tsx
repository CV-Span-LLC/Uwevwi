import { Image } from 'expo-image';
import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Comments } from '@/components/comments';
import { SiteLayout } from '@/components/site-layout';
import { Photo, PrimaryButton, Section, Txt, useBreakpoint } from '@/components/ui';
import { assetUrl, formatDate, publicApi, type ResearchDetail } from '@/lib/api';
import { Markdown } from '@/lib/markdown';
import { useRemote } from '@/lib/use-remote';
import { colors } from '@/theme';

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

function ArticleHero({ title, byline, image }: { title: string; byline: string; image: string | null }) {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Section background={colors.background} paddingTop={100} paddingBottom={80} innerStyle={{ gap: 24 }}>
      <BackLink />
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: 40 }}>
        <View style={{ width: isDesktop ? 451 : '100%', height: isDesktop ? 608 : isMobile ? 360 : 480, borderRadius: 8, overflow: 'hidden' }}>
          {image ? <Photo source={{ uri: assetUrl(image) as string }} /> : null}
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

function Article({ entry }: { entry: ResearchDetail }) {
  const byline = `UWEVWI STUDIOS · ${entry.type === 'Research Paper' ? 'ARCHIVES' : entry.type.toUpperCase()} ${new Date(entry.publishedAt).getFullYear()}`;
  return (
    <>
      <ArticleHero title={entry.title} byline={byline} image={entry.image} />
      <Section paddingTop={40} paddingBottom={60} innerStyle={{ maxWidth: 1000, gap: 24 }}>
        {entry.content.trim() ? (
          <Markdown source={entry.content} />
        ) : (
          <>
            <Txt color={colors.textSecondary}>{entry.excerpt}</Txt>
            <Txt color={colors.textSecondary}>The full {entry.type === 'Research Paper' ? 'paper' : 'piece'} will be published soon. Published {formatDate(entry.publishedAt)}.</Txt>
            <PrimaryButton label="Back to Research" href="/research" />
          </>
        )}
      </Section>
      <Comments slug={entry.slug} initial={entry.comments} closed={entry.commentsHidden} />
    </>
  );
}

function Missing({ message, loading, onRetry }: { message: string; loading: boolean; onRetry: () => void }) {
  return (
    <Section background={colors.background} paddingY={140} innerStyle={{ gap: 24 }}>
      <BackLink />
      <Txt variant="h1">{loading ? 'Loading…' : message}</Txt>
      {!loading ? <PrimaryButton label="Try again" onPress={onRetry} /> : null}
      {!loading ? <PrimaryButton label="Browse research" href="/research" /> : null}
    </Section>
  );
}

export default function ResearchArticle() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading, reload } = useRemote(() => publicApi<ResearchDetail>(`/research/${slug}`), [slug]);
  return <SiteLayout>{data ? <Article entry={data} /> : <Missing message={error ?? 'We could not find that piece.'} loading={loading} onRetry={reload} />}</SiteLayout>;
}
