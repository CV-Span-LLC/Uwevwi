import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { shortDate } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Empty, Loading, MenuButton, SearchField, Tabs, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, assetUrl, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Tab = 'all' | 'research' | 'journal' | 'commission' | 'draft';
type SortKey = 'title' | 'views' | 'updated';

const TYPE_SHORT: Record<ResearchSummary['type'], string> = { 'Research Paper': 'Research', Journal: 'Journal', 'Writers Commission': 'Commission' };

function SortHeader({ label, active, dir, onPress, style }: { label: string; active: boolean; dir: 'asc' | 'desc'; onPress: () => void; style?: object }) {
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={`Sort by ${label}`} onPress={onPress} style={[{ flexDirection: 'row', alignItems: 'center', gap: 4 }, style]}>
      <AText kind="eyebrow" color={active ? A.text : A.muted}>
        {label}
      </AText>
      {active ? <Icon name={dir === 'asc' ? 'chevron-up' : 'chevron-down'} size={12} color={A.text} /> : null}
    </Pressable>
  );
}

export default function ResearchList() {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<ResearchSummary[]>('/research'));
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' }>({ key: 'updated', dir: 'desc' });
  const [toDelete, setToDelete] = useState<ResearchSummary | null>(null);
  const table = width >= 900;

  const counts = useMemo(() => {
    const rows = data ?? [];
    return {
      all: rows.length,
      research: rows.filter((r) => r.type === 'Research Paper').length,
      journal: rows.filter((r) => r.type === 'Journal').length,
      commission: rows.filter((r) => r.type === 'Writers Commission').length,
      draft: rows.filter((r) => r.status === 'draft').length,
    };
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = (data ?? []).filter((r) => {
      if (tab === 'research' && r.type !== 'Research Paper') return false;
      if (tab === 'journal' && r.type !== 'Journal') return false;
      if (tab === 'commission' && r.type !== 'Writers Commission') return false;
      if (tab === 'draft' && r.status !== 'draft') return false;
      return !q || r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q) || r.excerpt.toLowerCase().includes(q);
    });
    const sign = sort.dir === 'asc' ? 1 : -1;
    return filtered.sort((a, b) => sign * (sort.key === 'title' ? a.title.localeCompare(b.title) : sort.key === 'views' ? a.views - b.views : a.updatedAt.localeCompare(b.updatedAt)));
  }, [data, tab, query, sort]);

  const toggleSort = (key: SortKey) => setSort((s) => (s.key === key ? { key, dir: s.dir === 'asc' ? 'desc' : 'asc' } : { key, dir: key === 'title' ? 'asc' : 'desc' }));

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await adminApi(`/research/${toDelete.id}`, { method: 'DELETE' });
      toast('Research deleted.');
      setToDelete(null);
      reload();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const edit = (r: ResearchSummary) => router.push({ pathname: '/admin/research/[id]', params: { id: r.id } });
  const menuFor = (r: ResearchSummary) => [
    { label: 'Edit', icon: 'edit' as const, onPress: () => edit(r) },
    ...(r.status === 'published' ? [{ label: 'View on website', icon: 'external' as const, onPress: () => router.push({ pathname: '/research/[slug]', params: { slug: r.slug } }) }] : []),
    { label: 'Delete', icon: 'trash' as const, danger: true, dividerBefore: true, onPress: () => setToDelete(r) },
  ];

  return (
    <AdminShell title="Research">
      <PageHeader
        title="Research"
        subtitle="Articles, journal entries and commissioned writing, published on the Research page."
        actions={<Btn label="New research" icon="plus" onPress={() => router.push('/admin/research/new')} />}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading research…' : undefined} />
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <View style={{ flexDirection: table ? 'row' : 'column', alignItems: table ? 'center' : 'stretch', justifyContent: 'space-between', gap: 12, padding: 16 }}>
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { key: 'all', label: 'All', count: counts.all },
                { key: 'research', label: 'Research', count: counts.research },
                { key: 'journal', label: 'Journal', count: counts.journal },
                { key: 'commission', label: 'Commission', count: counts.commission },
                { key: 'draft', label: 'Drafts', count: counts.draft },
              ]}
            />
            <SearchField value={query} onChangeText={setQuery} placeholder="Search research…" width={table ? 260 : '100%'} />
          </View>

          {table ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: A.field, borderTopWidth: 1, borderBottomWidth: 1, borderColor: A.line }}>
              <SortHeader label="Title" active={sort.key === 'title'} dir={sort.dir} onPress={() => toggleSort('title')} style={{ flex: 4 }} />
              <AText kind="eyebrow" color={A.muted} style={{ flex: 1.2 }}>
                Status
              </AText>
              <SortHeader label="Views" active={sort.key === 'views'} dir={sort.dir} onPress={() => toggleSort('views')} style={{ flex: 0.8 }} />
              <AText kind="eyebrow" color={A.muted} style={{ flex: 0.9 }}>
                Comments
              </AText>
              <SortHeader label="Updated" active={sort.key === 'updated'} dir={sort.dir} onPress={() => toggleSort('updated')} style={{ flex: 1.2 }} />
              <View style={{ width: 32 }} />
            </View>
          ) : (
            <View style={{ height: 1, backgroundColor: A.line }} />
          )}

          {rows.length === 0 ? (
            <Empty
              icon="research"
              text={query ? 'No research matches your search.' : tab === 'draft' ? 'No drafts. Everything is published.' : 'Nothing here yet.'}
              action={!query && tab === 'all' ? <Btn label="Write the first piece" icon="plus" small onPress={() => router.push('/admin/research/new')} /> : undefined}
            />
          ) : (
            rows.map((r, i) => (
              <Pressable
                key={r.id}
                accessibilityRole="link"
                onPress={() => edit(r)}
                style={({ hovered }: { hovered?: boolean }) => ({
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 16,
                  paddingHorizontal: 20,
                  paddingVertical: 12,
                  borderBottomWidth: i === rows.length - 1 ? 0 : 1,
                  borderBottomColor: A.line,
                  backgroundColor: hovered ? '#fbfaf8' : A.white,
                  zIndex: rows.length - i,
                })}
              >
                <View style={{ flex: 4, flexDirection: 'row', alignItems: 'center', gap: 14, minWidth: 0 }}>
                  <View style={{ width: 60, height: 46, borderRadius: 6, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
                    {r.image ? <Image source={{ uri: assetUrl(r.image) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                    <AText kind="label" numberOfLines={1} style={{ fontSize: 14 }}>
                      {r.title}
                    </AText>
                    <AText kind="tiny" color={A.muted} numberOfLines={1}>
                      {TYPE_SHORT[r.type]}
                      {r.part ? ` · ${r.part}` : ''}
                      {!table ? ` · ${shortDate(r.updatedAt)}` : ''}
                    </AText>
                  </View>
                </View>
                {table ? (
                  <>
                    <View style={{ flex: 1.2 }}>{statusBadge(r.status)}</View>
                    <AText kind="small" style={{ flex: 0.8 }}>
                      {r.views}
                    </AText>
                    <View style={{ flex: 0.9, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name="comments" size={13} color={A.faint} />
                      <AText kind="small">{r.comments}</AText>
                    </View>
                    <AText kind="small" color={A.muted} style={{ flex: 1.2 }}>
                      {shortDate(r.updatedAt)}
                    </AText>
                  </>
                ) : (
                  statusBadge(r.status)
                )}
                <MenuButton items={menuFor(r)} />
              </Pressable>
            ))
          )}
          <View style={{ paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: A.line }}>
            <AText kind="tiny" color={A.muted}>
              Showing {rows.length} of {counts.all}
            </AText>
          </View>
        </Card>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this research?" message={toDelete ? `“${toDelete.title}” and its comments will be permanently removed from the website.` : ''} confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
