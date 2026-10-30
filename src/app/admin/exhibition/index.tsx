import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useMemo, useState } from 'react';
import { View } from 'react-native';

import { shortDate } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Empty, Field, Loading, MenuButton, Tabs, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, assetUrl, type Exhibition } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Tab = 'all' | 'draft' | 'published' | 'hidden';

export default function ExhibitionList() {
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<Exhibition[]>('/exhibitions'));
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [toDelete, setToDelete] = useState<Exhibition | null>(null);

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((e) => (tab === 'all' || e.status === tab) && (!q || e.title.toLowerCase().includes(q) || e.series.toLowerCase().includes(q)));
  }, [data, tab, query]);
  const count = (s: Exhibition['status']) => (data ?? []).filter((e) => e.status === s).length;

  const setStatus = async (e: Exhibition, status: Exhibition['status']) => {
    try {
      await adminApi(`/exhibitions/${e.id}/status`, { method: 'PATCH', body: { status } });
      toast(status === 'hidden' ? 'Hidden from the Studio page.' : 'Exhibition is now visible.');
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

  return (
    <AdminShell title="Exhibition" maxWidth={1000}>
      <PageHeader
        title="Exhibition"
        subtitle="Manage your events."
        actions={
          <>
            <View style={{ width: 240 }}>
              <Field value={query} onChangeText={setQuery} placeholder="Global search..." tone="white" trailing={<Icon name="search" size={16} color={A.muted} />} />
            </View>
            <Btn label="New Exhibition" icon="send" onPress={() => router.push('/admin/exhibition/new')} />
          </>
        }
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading exhibitions…' : undefined} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: 'all', label: 'All', count: data.length },
              { key: 'draft', label: 'Draft', count: count('draft') },
              { key: 'published', label: 'Published', count: count('published') },
              { key: 'hidden', label: 'Hidden', count: count('hidden') },
            ]}
          />
          {rows.length === 0 ? <Empty text={query ? 'No exhibitions match your search.' : 'No exhibitions here yet.'} /> : null}
          {rows.map((e, idx) => {
            const images = e.gallery.length + e.artists.reduce((n, a) => n + a.works.length, 0);
            return (
              <Card key={e.id} style={{ flexDirection: 'row', gap: 16, padding: 14, zIndex: rows.length - idx }}>
                <View style={{ width: 96, height: 120, borderRadius: 4, overflow: 'hidden', backgroundColor: A.field }}>{e.flyer ? <Image source={{ uri: assetUrl(e.flyer) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}</View>
                <View style={{ flex: 1, gap: 6 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 10 }}>
                    <View style={{ flex: 1, gap: 2 }}>
                      <AText kind="label" style={{ fontSize: 15 }}>
                        {e.title}
                      </AText>
                      {e.series ? (
                        <AText kind="small" color={A.muted}>
                          {e.series}
                        </AText>
                      ) : null}
                    </View>
                    {statusBadge(e.status)}
                    <MenuButton
                      items={[
                        { label: 'Edit', icon: 'edit', onPress: () => router.push({ pathname: '/admin/exhibition/[id]', params: { id: e.id } }) },
                        { label: 'View', icon: 'eye', onPress: () => router.push({ pathname: '/studios/[slug]', params: { slug: e.slug } }) },
                        e.status === 'published'
                          ? { label: 'Hide from Studio', icon: 'eye-off', dividerBefore: true, onPress: () => setStatus(e, 'hidden') }
                          : { label: 'Make visible', icon: 'eye', dividerBefore: true, onPress: () => setStatus(e, 'published') },
                        { label: 'Delete', icon: 'trash', danger: true, dividerBefore: true, onPress: () => setToDelete(e) },
                      ]}
                    />
                  </View>
                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
                    <AText kind="tiny" color={A.muted}>
                      {e.dateLabel || 'Date to be confirmed'}
                    </AText>
                    <AText kind="tiny" color={A.muted}>
                      Location: {e.location || '—'}
                    </AText>
                    <AText kind="tiny" color={A.muted}>
                      Updated {shortDate(e.updatedAt)}
                    </AText>
                  </View>
                  <AText kind="small" color={A.muted} numberOfLines={2}>
                    {e.intro || 'No description yet.'}
                  </AText>
                  <View style={{ flexDirection: 'row', gap: 16 }}>
                    <AText kind="tiny" color={A.muted}>
                      {e.artists.length} artist{e.artists.length === 1 ? '' : 's'}
                    </AText>
                    <AText kind="tiny" color={A.muted}>
                      {images} image{images === 1 ? '' : 's'}
                    </AText>
                  </View>
                </View>
              </Card>
            );
          })}
        </View>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this exhibition?" message={toDelete ? `“${toDelete.title}” will be removed from the website. This cannot be undone.` : ''} confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
