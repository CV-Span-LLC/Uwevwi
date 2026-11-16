import { Image } from 'expo-image';
import { Link, router, type Href } from 'expo-router';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { greeting, shortDate, updatedLabel } from '@/admin/format';
import { Icon, type IconName } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Avatar, Btn, Card, Loading, Panel, StatCard, statusBadge } from '@/admin/ui';
import { useAuth } from '@/admin/auth';
import { adminApi, assetUrl, timeAgo, type Exhibition, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Dashboard = {
  research: { published: number; draft: number; scheduled: number };
  exhibitions: { published: number; draft: number; hidden: number };
  comments: { total: number; fresh: number };
  imagesUpdatedAt: string | null;
  activity: { title: string; detail: string; createdAt: string }[];
  recentResearch: ResearchSummary[];
  recentExhibitions: Exhibition[];
  recentComments: { id: number; name: string; body: string; title: string; createdAt: string; status: 'new' | 'replied' | 'read' }[];
};

type Counts = { fresh: number; enquiries: number };

function activityIcon(title: string): IconName {
  const t = title.toLowerCase();
  if (t.includes('enquiry')) return 'mail';
  if (t.includes('comment')) return 'comments';
  if (t.includes('image')) return 'images';
  if (t.includes('exhibition')) return 'exhibition';
  if (t.includes('research')) return 'research';
  return 'dashboard';
}

function SeeAll({ label, href }: { label: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link">
        {({ hovered }: { hovered?: boolean }) => (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: hovered ? 0.7 : 1 }}>
            <AText kind="small" color={A.accent}>
              {label}
            </AText>
            <Icon name="arrow-right" size={13} color={A.accent} />
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Row({ children, onPress, last }: { children: React.ReactNode; onPress?: () => void; last?: boolean }) {
  return (
    <Pressable
      accessibilityRole={onPress ? 'link' : undefined}
      onPress={onPress}
      disabled={!onPress}
      style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: last ? 0 : 1, borderBottomColor: A.line, backgroundColor: hovered && onPress ? A.field : 'transparent' })}
    >
      {children}
    </Pressable>
  );
}

function Thumb({ uri, width = 56, height = 44 }: { uri: string | null | undefined; width?: number; height?: number }) {
  return (
    <View style={{ width, height, borderRadius: 6, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
      {uri ? <Image source={{ uri: assetUrl(uri) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
    </View>
  );
}

function Attention({ data, counts }: { data: Dashboard; counts: Counts }) {
  const items: { label: string; detail: string; icon: IconName; href: Href; urgent?: boolean }[] = [];
  if (counts.fresh > 0) items.push({ label: `${counts.fresh} comment${counts.fresh === 1 ? '' : 's'} to review`, detail: 'Visitors are waiting for a reply.', icon: 'comments', href: '/admin/comments', urgent: true });
  if (counts.enquiries > 0) items.push({ label: `${counts.enquiries} unread enquir${counts.enquiries === 1 ? 'y' : 'ies'}`, detail: 'New messages from the contact form.', icon: 'mail', href: '/admin/enquiries', urgent: true });
  if (data.research.draft > 0) items.push({ label: `${data.research.draft} research draft${data.research.draft === 1 ? '' : 's'}`, detail: 'Finish and publish when ready.', icon: 'research', href: '/admin/research' });
  if (data.research.scheduled > 0) items.push({ label: `${data.research.scheduled} scheduled to publish`, detail: 'Going live automatically.', icon: 'clock', href: '/admin/research' });
  if (data.exhibitions.draft > 0) items.push({ label: `${data.exhibitions.draft} exhibition draft${data.exhibitions.draft === 1 ? '' : 's'}`, detail: 'Not visible on the website yet.', icon: 'exhibition', href: '/admin/exhibition' });

  return (
    <Panel title="Needs attention" subtitle={items.length ? 'Things worth a look today.' : undefined} padded={false}>
      {items.length === 0 ? (
        <View style={{ padding: 24, flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <Icon name="check-circle" size={22} color="#2f9e66" />
          <AText color={A.muted}>Everything is up to date. Nothing needs your attention.</AText>
        </View>
      ) : (
        items.map((item, i) => (
          <Row key={item.label} onPress={() => router.push(item.href)} last={i === items.length - 1}>
            <View style={{ width: 34, height: 34, borderRadius: 9, backgroundColor: item.urgent ? A.accentSoft : A.field, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={item.icon} size={16} color={item.urgent ? A.accent : A.text} />
            </View>
            <View style={{ flex: 1 }}>
              <AText kind="label">{item.label}</AText>
              <AText kind="tiny" color={A.muted}>
                {item.detail}
              </AText>
            </View>
            <Icon name="chevron-right" size={16} color={A.faint} />
          </Row>
        ))
      )}
    </Panel>
  );
}

function RecentContent({ data }: { data: Dashboard }) {
  const rows = [
    ...data.recentResearch.map((r) => ({ key: `r${r.id}`, kind: 'Research', title: r.title, image: r.image, status: r.status, updatedAt: r.updatedAt, href: { pathname: '/admin/research/[id]', params: { id: r.id } } as Href })),
    ...data.recentExhibitions.map((e) => ({ key: `e${e.id}`, kind: 'Exhibition', title: e.title, image: e.flyer, status: e.status, updatedAt: e.updatedAt, href: { pathname: '/admin/exhibition/[id]', params: { id: e.id } } as Href })),
  ]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .slice(0, 6);
  return (
    <Panel title="Recently updated" subtitle="Research and exhibitions you worked on last." padded={false} action={<SeeAll label="All research" href="/admin/research" />}>
      {rows.length === 0 ? <AText color={A.muted} style={{ padding: 24 }}>Nothing published yet.</AText> : null}
      {rows.map((r, i) => (
        <Row key={r.key} onPress={() => router.push(r.href)} last={i === rows.length - 1}>
          <Thumb uri={r.image} />
          <View style={{ flex: 1, gap: 3 }}>
            <AText kind="label" numberOfLines={1}>
              {r.title}
            </AText>
            <AText kind="tiny" color={A.muted}>
              {r.kind} · {updatedLabel(r.updatedAt)}
            </AText>
          </View>
          {statusBadge(r.status)}
        </Row>
      ))}
    </Panel>
  );
}

function RecentComments({ data }: { data: Dashboard }) {
  return (
    <Panel title="Latest comments" padded={false} action={<SeeAll label="All comments" href="/admin/comments" />}>
      {data.recentComments.length === 0 ? <AText color={A.muted} style={{ padding: 24 }}>No comments yet.</AText> : null}
      {data.recentComments.map((c, i) => (
        <Row key={c.id} onPress={() => router.push('/admin/comments')} last={i === data.recentComments.length - 1}>
          <Avatar name={c.name} size={36} />
          <View style={{ flex: 1, gap: 2 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <AText kind="label">{c.name}</AText>
              <AText kind="tiny" color={A.muted}>
                {timeAgo(c.createdAt)}
              </AText>
            </View>
            <AText kind="small" color={A.muted} numberOfLines={1}>
              {c.body}
            </AText>
            <AText kind="tiny" color={A.faint} numberOfLines={1}>
              on {c.title}
            </AText>
          </View>
          {c.status === 'new' ? (
            <View style={{ backgroundColor: A.accentSoft, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 2 }}>
              <AText kind="tiny" color={A.accent} style={{ fontSize: 11 }}>
                New
              </AText>
            </View>
          ) : c.status === 'replied' ? (
            <Icon name="check" size={15} color="#2f9e66" />
          ) : null}
        </Row>
      ))}
    </Panel>
  );
}

function Activity({ data }: { data: Dashboard }) {
  return (
    <Panel title="Activity" subtitle="Latest changes across the site.">
      {data.activity.length === 0 ? <AText color={A.muted}>Nothing yet.</AText> : null}
      <View>
        {data.activity.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', gap: 12 }}>
            <View style={{ alignItems: 'center' }}>
              <View style={{ width: 28, height: 28, borderRadius: 14, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center' }}>
                <Icon name={activityIcon(item.title)} size={13} color={A.text} />
              </View>
              {i < data.activity.length - 1 ? <View style={{ width: 1, flex: 1, backgroundColor: A.line, marginVertical: 2 }} /> : null}
            </View>
            <View style={{ flex: 1, paddingBottom: i < data.activity.length - 1 ? 16 : 0, gap: 1 }}>
              <AText kind="label">{item.title}</AText>
              <AText kind="small" color={A.muted} numberOfLines={2}>
                {item.detail}
              </AText>
              <AText kind="tiny" color={A.faint}>
                {timeAgo(item.createdAt)}
              </AText>
            </View>
          </View>
        ))}
      </View>
    </Panel>
  );
}

function TopResearch() {
  const { data } = useRemote(() => adminApi<ResearchSummary[]>('/research'));
  const top = [...(data ?? [])].filter((r) => r.status === 'published').sort((a, b) => b.views - a.views).slice(0, 5);
  const max = Math.max(1, ...top.map((r) => r.views));
  return (
    <Panel title="Most viewed" subtitle="Published research by page views.">
      {!data ? <AText color={A.muted}>Loading…</AText> : null}
      {data && top.length === 0 ? <AText color={A.muted}>No published research yet.</AText> : null}
      <View style={{ gap: 14 }}>
        {top.map((r) => (
          <Pressable key={r.id} accessibilityRole="link" onPress={() => router.push({ pathname: '/admin/research/[id]', params: { id: r.id } })} style={{ gap: 6 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
              <AText kind="small" numberOfLines={1} style={{ flex: 1 }}>
                {r.title}
              </AText>
              <AText kind="label">{r.views}</AText>
            </View>
            <View style={{ height: 6, borderRadius: 3, backgroundColor: A.field, overflow: 'hidden' }}>
              <View style={{ width: `${Math.max(r.views > 0 ? 4 : 0, (r.views / max) * 100)}%`, height: '100%', backgroundColor: A.accent, borderRadius: 3 }} />
            </View>
          </Pressable>
        ))}
      </View>
    </Panel>
  );
}

function SiteImagesCard({ data }: { data: Dashboard }) {
  return (
    <Card style={{ flexDirection: 'row', alignItems: 'center', gap: 14, padding: 18 }}>
      <View style={{ width: 40, height: 40, borderRadius: 10, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name="images" size={18} color={A.text} />
      </View>
      <View style={{ flex: 1 }}>
        <AText kind="label">Website images</AText>
        <AText kind="tiny" color={A.muted}>
          {data.imagesUpdatedAt ? `Last changed ${shortDate(data.imagesUpdatedAt)}` : 'Using the original images'}
        </AText>
      </View>
      <Btn label="Manage" kind="secondary" small onPress={() => router.push('/admin/images')} />
    </Card>
  );
}

export default function DashboardPage() {
  const { width } = useWindowDimensions();
  const { admin } = useAuth();
  const { data, error, loading, reload } = useRemote(() => adminApi<Dashboard>('/dashboard'));
  const notes = useRemote(() => adminApi<Counts>('/notifications'));
  const counts = notes.data ?? { fresh: data?.comments.fresh ?? 0, enquiries: 0 };
  const split = width >= 1180;
  const first = admin?.name?.split(/\s+/)[0] ?? 'Admin';

  return (
    <AdminShell title="Dashboard" maxWidth={1240}>
      <PageHeader
        title={`${greeting()}, ${first}`}
        subtitle="Here’s what’s happening across your website."
        actions={
          <>
            <Btn label="View website" kind="secondary" icon="globe" onPress={() => router.push('/')} />
            <Btn label="New research" icon="plus" onPress={() => router.push('/admin/research/new')} />
          </>
        }
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading your dashboard…' : undefined} />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <StatCard icon="research" label="Research" value={data.research.published} hint={`${data.research.draft} draft · ${data.research.scheduled} scheduled`} onPress={() => router.push('/admin/research')} />
            <StatCard icon="exhibition" label="Exhibitions" value={data.exhibitions.published} hint={`${data.exhibitions.draft} draft · ${data.exhibitions.hidden} hidden`} onPress={() => router.push('/admin/exhibition')} />
            <StatCard icon="comments" label="Comments" value={data.comments.total} hint={data.comments.fresh > 0 ? `${data.comments.fresh} to review` : 'All reviewed'} tone={data.comments.fresh > 0 ? 'alert' : 'neutral'} onPress={() => router.push('/admin/comments')} />
            <StatCard icon="mail" label="Enquiries" value={counts.enquiries} hint={counts.enquiries === 1 ? 'unread message' : 'unread messages'} tone={counts.enquiries > 0 ? 'alert' : 'neutral'} onPress={() => router.push('/admin/enquiries')} />
          </View>

          <View style={{ flexDirection: split ? 'row' : 'column', gap: 16, alignItems: 'flex-start' }}>
            <View style={{ flex: split ? 1.6 : undefined, width: split ? undefined : '100%', gap: 16 }}>
              <Attention data={data} counts={counts} />
              <RecentContent data={data} />
              <RecentComments data={data} />
            </View>
            <View style={{ flex: split ? 1 : undefined, width: split ? undefined : '100%', gap: 16 }}>
              <Activity data={data} />
              <TopResearch />
              <SiteImagesCard data={data} />
            </View>
          </View>
        </View>
      )}
    </AdminShell>
  );
}
