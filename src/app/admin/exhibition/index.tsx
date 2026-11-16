import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { shortDate } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Empty, Loading, MenuButton, SearchField, Tabs, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, assetUrl, type Exhibition } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Tab = 'all' | 'draft' | 'published' | 'hidden';

export default function ExhibitionList() {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<Exhibition[]>('/exhibitions'));
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<Exhibition | null>(null);
  const table = width >= 900;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? [])
      .filter((e) => (tab === 'all' || e.status === tab) && (!q || e.title.toLowerCase().includes(q) || e.series.toLowerCase().includes(q) || e.location.toLowerCase().includes(q)))
      .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }, [data, tab, query]);
  const count = (s: Exhibition['status']) => (data ?? []).filter((e) => e.status === s).length;

  const setStatus = async (e: Exhibition, status: Exhibition['status']) => {
    try {
      await adminApi(`/exhibitions/${e.id}/status`, { method: 'PATCH', body: { status } });
      toast(status === 'hidden' ? 'Hidden from the Studios page.' : 'Exhibition is now visible.');
      reload();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await adminApi(`/exhibitions/${toDelete.id}`, { method: 'DELETE' });
      toast('Exhibition deleted.');
      setToDelete(null);
      reload();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const edit = (e: Exhibition) => router.push({ pathname: '/admin/exhibition/[id]', params: { id: e.id } });

  return (
    <AdminShell title="Exhibitions">
      <PageHeader
        title="Exhibitions"
        subtitle="Events and shows presented on the Studios page."
        actions={<Btn label="New exhibition" icon="plus" onPress={() => router.push('/admin/exhibition/new')} />}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading exhibitions…' : undefined} />
      ) : (
        <Card style={{ padding: 0, overflow: 'visible' }}>
          <View style={{ flexDirection: table ? 'row' : 'column', alignItems: table ? 'center' : 'stretch', justifyContent: 'space-between', gap: 12, padding: 16 }}>
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { key: 'all', label: 'All', count: data.length },
                { key: 'published', label: 'Published', count: count('published') },
                { key: 'draft', label: 'Drafts', count: count('draft') },
                { key: 'hidden', label: 'Hidden', count: count('hidden') },
              ]}
            />
            <SearchField value={query} onChangeText={setQuery} placeholder="Search exhibitions…" width={table ? 260 : '100%'} />
          </View>
          {table ? (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16, paddingHorizontal: 20, paddingVertical: 10, backgroundColor: A.field, borderTopWidth: 1, borderBottomWidth: 1, borderColor: A.line }}>
              <AText kind="eyebrow" color={A.muted} style={{ flex: 4 }}>
                Exhibition
              </AText>
              <AText kind="eyebrow" color={A.muted} style={{ flex: 1.2 }}>
                Status
              </AText>
              <AText kind="eyebrow" color={A.muted} style={{ flex: 2 }}>
                Dates and place
              </AText>
              <AText kind="eyebrow" color={A.muted} style={{ flex: 1 }}>
                Content
              </AText>
              <AText kind="eyebrow" color={A.muted} style={{ flex: 1 }}>
                Updated
              </AText>
              <View style={{ width: 32 }} />
            </View>
          ) : (
            <View style={{ height: 1, backgroundColor: A.line }} />
          )}
          {rows.length === 0 ? (
            <Empty icon="exhibition" text={query ? 'No exhibitions match your search.' : 'No exhibitions here yet.'} action={!query && tab === 'all' ? <Btn label="Add an exhibition" icon="plus" small onPress={() => router.push('/admin/exhibition/new')} /> : undefined} />
          ) : (
            rows.map((e, i) => {
              const images = e.gallery.length + e.artists.reduce((n, a) => n + a.works.length, 0);
              return (
                <Pressable
                  key={e.id}
                  accessibilityRole="link"
                  onPress={() => edit(e)}
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
                    <View style={{ width: 46, height: 60, borderRadius: 6, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
                      {e.flyer ? <Image source={{ uri: assetUrl(e.flyer) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                    </View>
                    <View style={{ flex: 1, gap: 3, minWidth: 0 }}>
                      <AText kind="label" numberOfLines={1} style={{ fontSize: 14 }}>
                        {e.title}
                      </AText>
                      <AText kind="tiny" color={A.muted} numberOfLines={1}>
                        {e.series || 'Exhibition'}
                        {!table ? ` · ${shortDate(e.updatedAt)}` : ''}
                      </AText>
                    </View>
                  </View>
                  {table ? (
                    <>
                      <View style={{ flex: 1.2 }}>{statusBadge(e.status)}</View>
                      <View style={{ flex: 2, gap: 2 }}>
                        <AText kind="small" numberOfLines={1}>
                          {e.dateLabel || 'Date to be confirmed'}
                        </AText>
                        <AText kind="tiny" color={A.muted} numberOfLines={1}>
                          {e.location || '—'}
                        </AText>
                      </View>
                      <View style={{ flex: 1, gap: 2 }}>
                        <AText kind="small">
                          {e.artists.length} artist{e.artists.length === 1 ? '' : 's'}
                        </AText>
                        <AText kind="tiny" color={A.muted}>
                          {images} image{images === 1 ? '' : 's'}
                        </AText>
                      </View>
                      <AText kind="small" color={A.muted} style={{ flex: 1 }}>
                        {shortDate(e.updatedAt)}
                      </AText>
                    </>
                  ) : (
                    statusBadge(e.status)
                  )}
                  <MenuButton
                    items={[
                      { label: 'Edit', icon: 'edit', onPress: () => edit(e) },
                      ...(e.status === 'published' ? [{ label: 'View on website', icon: 'external' as const, onPress: () => router.push({ pathname: '/studios/[slug]', params: { slug: e.slug } }) }] : []),
                      e.status === 'published'
                        ? { label: 'Hide from Studios', icon: 'eye-off', dividerBefore: true, onPress: () => setStatus(e, 'hidden') }
                        : { label: 'Make visible', icon: 'eye', dividerBefore: true, onPress: () => setStatus(e, 'published') },
                      { label: 'Delete', icon: 'trash', danger: true, dividerBefore: true, onPress: () => setToDelete(e) },
                    ]}
                  />
                </Pressable>
              );
            })
          )}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 20, paddingVertical: 12, borderTopWidth: 1, borderTopColor: A.line }}>
            <Icon name="alert" size={13} color={A.faint} />
            <AText kind="tiny" color={A.muted}>
              Only published exhibitions appear on the website. The newest is featured on the Studios page and the rest are listed under Selected work, each linking to its own page.
            </AText>
          </View>
        </Card>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this exhibition?" message={toDelete ? `“${toDelete.title}” will be removed from the website. This cannot be undone.` : ''} confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
