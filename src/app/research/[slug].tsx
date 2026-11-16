import { Link, useLocalSearchParams } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Comments } from '@/components/comments';
import { Frame, FramedPhoto, TechButton } from '@/components/futuristic';
import { SiteLayout } from '@/components/site-layout';
import { Eyebrow, Section, Txt, useBreakpoint } from '@/components/ui';
import { assetUrl, formatDate, publicApi, type ResearchDetail } from '@/lib/api';
import { Markdown } from '@/lib/markdown';
import { useRemote } from '@/lib/use-remote';
import { colors } from '@/theme';

function BackLink() {
  return (
    <Link href="/research" asChild>
      <Pressable accessibilityRole="link" style={{ alignSelf: 'flex-start' }}>
        <Txt variant="mono" color={colors.accent}>
          ← BACK TO RESEARCH
        </Txt>
      </Pressable>
    </Link>
  );
}

function ArticleHero({ title, label, byline, image }: { title: string; label: string; byline: string; image: string | null }) {
  const { isDesktop, isMobile } = useBreakpoint();
  return (
    <Frame background={colors.background}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: colors.borders }}>
        <BackLink />
        <Txt variant="mono" color={colors.textSecondary} style={{ textTransform: 'uppercase' }}>
          {`Research / ${label}`}
        </Txt>
      </View>
      <View style={{ flexDirection: isDesktop ? 'row' : 'column', alignItems: isDesktop ? 'center' : 'stretch', gap: isDesktop ? 64 : 32, paddingVertical: isMobile ? 32 : 52 }}>
        {image ? (
          <View style={{ width: isDesktop ? 300 : '100%', paddingHorizontal: isDesktop ? 0 : 9 }}>
            <FramedPhoto source={{ uri: assetUrl(image) as string }} height={isDesktop ? 400 : isMobile ? 300 : 380} />
          </View>
        ) : null}
        <View style={{ flex: isDesktop ? 1 : undefined, gap: 26 }}>
          <Txt variant={title.length > 60 ? 'h2' : 'h1'}>{title}</Txt>
          <Txt variant="mono" color={colors.textSecondary}>
            {byline}
          </Txt>
        </View>
      </View>
    </Frame>
  );
}

function Article({ entry }: { entry: ResearchDetail }) {
  const label = entry.type === 'Research Paper' ? 'Research' : entry.type === 'Writers Commission' ? 'Commission' : 'Journal';
  const byline = `UWEVWI STUDIOS · ${entry.type === 'Research Paper' ? 'ARCHIVES' : entry.type.toUpperCase()} ${new Date(entry.publishedAt).getFullYear()}`;
  return (
    <>
      <ArticleHero title={entry.title} label={label} byline={byline} image={entry.image} />
      <Section paddingTop={80} paddingBottom={80} innerStyle={{ maxWidth: 1000, gap: 24 }}>
        {entry.content.trim() ? (
          <Markdown source={entry.content} />
        ) : (
          <>
            <Txt variant="monoBody" color={colors.textSecondary}>{`/ ${entry.excerpt}`}</Txt>
            <Txt variant="monoBody" color={colors.textSecondary}>
              The full {entry.type === 'Research Paper' ? 'paper' : 'piece'} will be published soon. Published {formatDate(entry.publishedAt)}.
            </Txt>
            <TechButton label="Back to research" href="/research" tone="ink" />
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
      <Eyebrow>{loading ? 'Loading' : 'Not found'}</Eyebrow>
      <Txt variant="h1">{loading ? 'Loading…' : message}</Txt>
      {!loading ? <TechButton label="Try again" onPress={onRetry} tone="accent" /> : null}
      {!loading ? <TechButton label="Browse research" href="/research" tone="ink" /> : null}
    </Section>
  );
}

export default function ResearchArticle() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  const { data, error, loading, reload } = useRemote(() => publicApi<ResearchDetail>(`/research/${slug}`), [slug]);
  return <SiteLayout>{data ? <Article entry={data} /> : <Missing message={error ?? 'We could not find that piece.'} loading={loading} onRetry={reload} />}</SiteLayout>;
}
