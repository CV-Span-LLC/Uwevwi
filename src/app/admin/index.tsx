import { Image } from 'expo-image';
import { Link } from 'expo-router';
import { Pressable, View } from 'react-native';

import { Icon, type IconName } from '@/admin/icons';
import { greeting, shortDate, updatedLabel } from '@/admin/format';
import { AdminShell } from '@/admin/shell';
import { A, AText, Card, Loading, statusBadge } from '@/admin/ui';
import { adminApi, assetUrl, timeAgo, type Exhibition, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';
import { fonts } from '@/theme';

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

function IconTile({ name }: { name: IconName }) {
  return (
    <View style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: '#e8f1fb', alignItems: 'center', justifyContent: 'center' }}>
      <Icon name={name} size={17} color="#1f2a44" />
    </View>
  );
}

function Stat({ icon, title, figures }: { icon: IconName; title: string; figures: { value: string | number; label: string }[] }) {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 220, gap: 18 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
        <IconTile name={icon} />
        <AText kind="label">{title}</AText>
      </View>
      <View style={{ flexDirection: 'row', gap: 0 }}>
        {figures.map((f, i) => (
          <View key={f.label} style={{ flex: 1, gap: 4, paddingLeft: i === 0 ? 0 : 14, borderLeftWidth: i === 0 ? 0 : 1, borderLeftColor: A.line }}>
            <AText kind="stat">{f.value}</AText>
            <AText kind="small" color={A.muted}>
              {f.label}
            </AText>
          </View>
        ))}
      </View>
    </Card>
  );
}

function SectionCard({ title, subtitle, link, children }: { title: string; subtitle?: string; link?: { label: string; href: '/admin/research' | '/admin/exhibition' | '/admin/comments' }; children: React.ReactNode }) {
  return (
    <Card style={{ flexGrow: 1, flexBasis: 420, gap: 8 }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 6 }}>
        <View>
          <AText kind="heading" style={{ fontSize: 20 }}>
            {title}
          </AText>
          {subtitle ? (
            <AText kind="small" color={A.muted}>
              {subtitle}
            </AText>
          ) : null}
        </View>
        {link ? (
          <Link href={link.href} asChild>
            <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <AText kind="small" color={A.muted}>
                {link.label}
              </AText>
              <Icon name="arrow-right" size={14} color={A.muted} />
            </Pressable>
          </Link>
        ) : null}
      </View>
      {children}
    </Card>
  );
}

export default function DashboardPage() {
  const { data, error, loading, reload } = useRemote(() => adminApi<Dashboard>('/dashboard'));

  return (
    <AdminShell title="Dashboard">
      <View style={{ gap: 4, marginBottom: 22 }}>
        <AText kind="title">{greeting()}, Admin</AText>
        <AText color={A.muted}>Here’s what’s happening across your website.</AText>
      </View>
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading your dashboard…' : undefined} />
      ) : (
        <View style={{ gap: 16 }}>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <Stat icon="research" title="Research" figures={[{ value: data.research.published, label: 'Published' }, { value: data.research.draft, label: 'Draft' }]} />
            <Stat icon="exhibition" title="Exhibitions" figures={[{ value: data.exhibitions.published, label: 'Published' }, { value: data.exhibitions.draft, label: 'Draft' }, { value: data.exhibitions.hidden, label: 'Hidden' }]} />
            <Stat icon="comments" title="Comment" figures={[{ value: data.comments.total, label: 'Total' }, { value: data.comments.fresh, label: 'New/Un-replied' }]} />
            <Card style={{ flexGrow: 1, flexBasis: 220, gap: 18 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <IconTile name="images" />
                <AText kind="label">Website Images</AText>
              </View>
              <View style={{ gap: 6 }}>
                <AText kind="small">Last updated</AText>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="calendar" size={14} color={A.muted} />
                  <AText kind="small" color={A.muted}>
                    {data.imagesUpdatedAt ? shortDate(data.imagesUpdatedAt) : 'Not changed yet'}
                  </AText>
                </View>
              </View>
            </Card>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <SectionCard title="Recent Activity" subtitle="Latest updates across your website.">
              {data.activity.length === 0 ? <AText color={A.muted}>Nothing yet.</AText> : null}
              {data.activity.map((item, i) => (
                <View key={i} style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: A.line }}>
                  <IconTile name="dashboard" />
                  <View style={{ flex: 1, gap: 2 }}>
                    <AText kind="label">{item.title}</AText>
                    <AText kind="small" color={A.muted} numberOfLines={1}>
                      {item.detail}
                    </AText>
                  </View>
                  <AText kind="tiny" color={A.muted}>
                    {timeAgo(item.createdAt)}
                  </AText>
                </View>
              ))}
            </SectionCard>

            <SectionCard title="Recent Research" link={{ label: 'View all research', href: '/admin/research' }}>
              {data.recentResearch.map((r) => (
                <Link key={r.id} href={{ pathname: '/admin/research/[id]', params: { id: r.id } }} asChild>
                  <Pressable accessibilityRole="link" style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: A.line }}>
                    <View style={{ width: 88, height: 66, borderRadius: 4, overflow: 'hidden', backgroundColor: A.field }}>
                      {r.image ? <Image source={{ uri: assetUrl(r.image) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                    </View>
                    <View style={{ flex: 1, gap: 8 }}>
                      <AText kind="small" numberOfLines={2}>
                        {r.title}
                      </AText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        {statusBadge(r.status)}
                        <AText kind="small" color={A.muted}>
                          {updatedLabel(r.updatedAt)}
                        </AText>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              ))}
              {data.recentResearch.length === 0 ? <AText color={A.muted}>No research yet.</AText> : null}
            </SectionCard>
          </View>

          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 16 }}>
            <SectionCard title="Recent Exhibitions" link={{ label: 'View all exhibitions', href: '/admin/exhibition' }}>
              {data.recentExhibitions.map((e) => (
                <Link key={e.id} href={{ pathname: '/admin/exhibition/[id]', params: { id: e.id } }} asChild>
                  <Pressable accessibilityRole="link" style={{ flexDirection: 'row', gap: 12, paddingVertical: 10, borderTopWidth: 1, borderTopColor: A.line }}>
                    <View style={{ width: 50, height: 66, borderRadius: 4, overflow: 'hidden', backgroundColor: A.field }}>
                      {e.flyer ? <Image source={{ uri: assetUrl(e.flyer) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                    </View>
                    <View style={{ flex: 1, gap: 8 }}>
                      <AText kind="small">{e.title}</AText>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                        {statusBadge(e.status)}
                        <AText kind="small" color={A.muted}>
                          {updatedLabel(e.updatedAt)}
                        </AText>
                      </View>
                    </View>
                  </Pressable>
                </Link>
              ))}
              {data.recentExhibitions.length === 0 ? <AText color={A.muted}>No exhibitions yet.</AText> : null}
            </SectionCard>

            <SectionCard title="Recent Comments" link={{ label: 'View all comments', href: '/admin/comments' }}>
              {data.recentComments.map((c) => (
                <Link key={c.id} href="/admin/comments" asChild>
                  <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 12, borderTopWidth: 1, borderTopColor: A.line }}>
                    <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
                      <AText color={A.white} style={{ fontFamily: fonts.quote, fontSize: 16 }}>
                        {c.name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase()}
                      </AText>
                    </View>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AText kind="label">{c.name}</AText>
                      <AText kind="small" color={A.muted} numberOfLines={1}>
                        From {c.title}
                      </AText>
                      <AText kind="tiny" color={A.muted} numberOfLines={1}>
                        {c.body}
                      </AText>
                    </View>
                    <View style={{ alignItems: 'flex-end', gap: 6 }}>
                      <AText kind="tiny" color={A.muted}>
                        {timeAgo(c.createdAt)}
                      </AText>
                      {c.status === 'replied' ? <StatusPill label="Replied" /> : c.status === 'new' ? <StatusPill label="New" /> : null}
                    </View>
                    <Icon name="chevron-right" size={16} color={A.text} />
                  </Pressable>
                </Link>
              ))}
              {data.recentComments.length === 0 ? <AText color={A.muted}>No comments yet.</AText> : null}
            </SectionCard>
          </View>
        </View>
      )}
    </AdminShell>
  );
}

function StatusPill({ label }: { label: string }) {
  return (
    <View style={{ backgroundColor: '#fbd3d8', borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3 }}>
      <AText kind="tiny" color="#9b2f3b">
        {label}
      </AText>
    </View>
  );
}
