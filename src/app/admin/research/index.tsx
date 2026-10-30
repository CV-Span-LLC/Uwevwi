import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { dateTime } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Empty, Field, Loading, Tabs, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, assetUrl, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Tab = 'all' | 'research' | 'journal' | 'commission' | 'draft';

function Panel({ item, onDelete }: { item: ResearchSummary; onDelete: () => void }) {
  const label = item.type === 'Research Paper' ? 'research' : item.type === 'Journal' ? 'journal' : 'commission';
  return (
    <Card style={{ gap: 14, padding: 16 }}>
      <View style={{ height: 150, borderRadius: 8, overflow: 'hidden', backgroundColor: A.field }}>{item.image ? <Image source={{ uri: assetUrl(item.image) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}</View>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <AText kind="label" style={{ flex: 1 }}>
          {item.title}
        </AText>
        {statusBadge(item.status)}
      </View>
      <AText kind="tiny" color={A.muted}>
        {item.type} · {dateTime(item.updatedAt)}
      </AText>
      <AText kind="small" color={A.muted} numberOfLines={6}>
        {item.excerpt || 'No description yet.'}
      </AText>
      <Btn label={`Edit ${label}`} onPress={() => router.push({ pathname: '/admin/research/[id]', params: { id: item.id } })} />
      <View style={{ flexDirection: 'row', justifyContent: 'center', gap: 36, paddingTop: 6 }}>
        <View style={{ alignItems: 'center' }}>
          <AText kind="label">{item.views}</AText>
          <AText kind="tiny" color={A.muted}>
            Views
          </AText>
        </View>
        <View style={{ alignItems: 'center' }}>
          <AText kind="label">{item.comments}</AText>
          <AText kind="tiny" color={A.muted}>
            Comments
          </AText>
        </View>
      </View>
      <Btn label="Delete" kind="ghost" icon="trash" small onPress={onDelete} />
    </Card>
  );
}

export default function ResearchList() {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<ResearchSummary[]>('/research'));
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<ResearchSummary | null>(null);
  const stacked = width < 1100;

  const counts = useMemo(() => {
    const rows = data ?? [];
    return { all: rows.length, research: rows.filter((r) => r.type === 'Research Paper').length, journal: rows.filter((r) => r.type === 'Journal').length, commission: rows.filter((r) => r.type === 'Writers Commission').length, draft: rows.filter((r) => r.status === 'draft').length };
  }, [data]);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((r) => {
      if (tab === 'research' && r.type !== 'Research Paper') return false;
      if (tab === 'journal' && r.type !== 'Journal') return false;
      if (tab === 'commission' && r.type !== 'Writers Commission') return false;
      if (tab === 'draft' && r.status !== 'draft') return false;
      return !q || r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q);
    });
  }, [data, tab, query]);

  const selected = rows.find((r) => r.id === selectedId) ?? rows[0];

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

  return (
    <AdminShell title="Research">
      <PageHeader
        title="Research"
        subtitle="Manage and organize research articles, journals and writers publication"
        actions={
          <>
            <View style={{ width: stacked ? 200 : 240 }}>
              <Field value={query} onChangeText={setQuery} placeholder="Global search..." tone="white" trailing={<Icon name="search" size={16} color={A.muted} />} />
            </View>
            <Btn label="New Research" icon="plus-circle" onPress={() => router.push('/admin/research/new')} />
          </>
        }
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading research…' : undefined} />
      ) : (
        <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>
          <Card style={{ flex: 1, width: stacked ? '100%' : undefined, gap: 14, padding: 16 }}>
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { key: 'all', label: 'All', count: counts.all },
                { key: 'research', label: 'Research', count: counts.research },
                { key: 'journal', label: 'Journal', count: counts.journal },
                { key: 'commission', label: 'Writer commission', count: counts.commission },
                { key: 'draft', label: 'Draft', count: counts.draft },
              ]}
            />
            {rows.length === 0 ? (
              <Empty text={query ? 'No research matches your search.' : 'Nothing here yet.'} />
            ) : (
              <View style={{ borderWidth: 1, borderColor: A.line, borderRadius: 8, overflow: 'hidden' }}>
                {width >= 720 ? (
                  <View style={{ flexDirection: 'row', backgroundColor: A.field, paddingVertical: 10, paddingHorizontal: 12 }}>
                    <View style={{ width: 28 }} />
                    <AText kind="small" style={{ flex: 3 }}>Title</AText>
                    <AText kind="small" style={{ flex: 1.2 }}>Type</AText>
                    <AText kind="small" style={{ flex: 1.1 }}>Status</AText>
                    <AText kind="small" style={{ flex: 1.6 }}>Updated</AText>
                  </View>
                ) : null}
                {rows.map((r) => {
                  const active = r.id === selected?.id;
                  return (
                    <Pressable key={r.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => setSelectedId(r.id)} style={{ flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12, borderTopWidth: 1, borderTopColor: A.line, backgroundColor: active ? '#fbf6f4' : A.white }}>
                      <View style={{ width: 28 }}>
                        <View style={{ width: 16, height: 16, borderRadius: 3, borderWidth: 1, borderColor: active ? A.accent : A.line, backgroundColor: active ? A.accent : A.white, alignItems: 'center', justifyContent: 'center' }}>
                          {active ? <Icon name="check" size={11} color={A.white} strokeWidth={3} /> : null}
                        </View>
                      </View>
                      <AText kind="small" numberOfLines={1} style={{ flex: 3 }}>
                        {r.title}
                      </AText>
                      {width >= 720 ? (
                        <>
                          <AText kind="small" numberOfLines={1} style={{ flex: 1.2 }}>
                            {r.type}
                          </AText>
                          <View style={{ flex: 1.1 }}>{statusBadge(r.status)}</View>
                          <AText kind="tiny" color={A.muted} style={{ flex: 1.6 }}>
                            {dateTime(r.updatedAt)}
                          </AText>
                        </>
                      ) : (
                        statusBadge(r.status)
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>
          {selected ? (
            <View style={{ width: stacked ? '100%' : 290 }}>
              <Panel item={selected} onDelete={() => setToDelete(selected)} />
            </View>
          ) : null}
        </View>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this research?" message={toDelete ? `“${toDelete.title}” and its comments will be permanently removed.` : ''} confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
