import { useMemo, useState } from 'react';
import { Linking, Pressable, View, useWindowDimensions } from 'react-native';

import { dateTime } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Badge, Btn, Card, ConfirmDialog, Empty, Field, Loading, Tabs, errorText, useToast } from '@/admin/ui';
import { adminApi, timeAgo } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Enquiry = { id: number; name: string; email: string; organisation: string; topic: string; message: string; read: boolean; createdAt: string };
type Tab = 'all' | 'unread' | 'read';

function replyLink(e: Enquiry): string {
  const subject = encodeURIComponent(`Re: ${e.topic} enquiry`);
  const quoted = e.message.split('\n').map((l) => `> ${l}`).join('\n');
  const body = encodeURIComponent(`Dear ${e.name},\n\n\n\nOn ${dateTime(e.createdAt)} you wrote:\n${quoted}`);
  return `mailto:${e.email}?subject=${subject}&body=${body}`;
}

function Detail({ enquiry, onToggleRead, onDelete }: { enquiry: Enquiry; onToggleRead: () => void; onDelete: () => void }) {
  return (
    <Card style={{ gap: 14 }}>
      <View style={{ gap: 4 }}>
        <AText kind="heading">{enquiry.name}</AText>
        <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`mailto:${enquiry.email}`)} style={{ alignSelf: 'flex-start' }}>
          <AText kind="small" color={A.accent}>
            {enquiry.email}
          </AText>
        </Pressable>
        {enquiry.organisation ? (
          <AText kind="small" color={A.muted}>
            {enquiry.organisation}
          </AText>
        ) : null}
      </View>
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        <Badge tone="blue" label={enquiry.topic} />
        <AText kind="tiny" color={A.muted}>
          {dateTime(enquiry.createdAt)}
        </AText>
      </View>
      <View style={{ backgroundColor: A.field, borderRadius: 8, padding: 14 }}>
        <AText color={A.text} style={{ lineHeight: 22 }}>
          {enquiry.message}
        </AText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Btn label="Reply by email" icon="mail" onPress={() => Linking.openURL(replyLink(enquiry))} />
        <Btn label={enquiry.read ? 'Mark as unread' : 'Mark as read'} kind="secondary" onPress={onToggleRead} />
        <Btn label="Delete" kind="ghost" icon="trash" onPress={onDelete} style={{ borderColor: 'transparent' }} />
      </View>
    </Card>
  );
}

export default function EnquiriesPage() {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<Enquiry[]>('/enquiries'));
  const [override, setOverride] = useState<Record<number, boolean>>({});
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [toDelete, setToDelete] = useState<Enquiry | null>(null);
  const stacked = width < 1000;

  const items = useMemo(() => (data ?? []).map((e) => ({ ...e, read: override[e.id] ?? e.read })), [data, override]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => (tab === 'all' || (tab === 'unread' ? !e.read : e.read)) && (!q || [e.name, e.email, e.organisation, e.topic, e.message].some((f) => f.toLowerCase().includes(q))));
  }, [items, tab, query]);
  const selected = rows.find((e) => e.id === selectedId);

  const setRead = async (e: Enquiry, read: boolean) => {
    setOverride((o) => ({ ...o, [e.id]: read }));
    try {
      await adminApi(`/enquiries/${e.id}/read`, { method: 'PUT', body: { read } });
    } catch (err) {
      setOverride((o) => ({ ...o, [e.id]: !read }));
      toast(errorText(err), 'error');
    }
  };

  const open = (e: Enquiry) => {
    setSelectedId(e.id);
    if (!e.read) setRead(e, true);
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await adminApi(`/enquiries/${toDelete.id}`, { method: 'DELETE' });
      toast('Enquiry deleted.');
      setToDelete(null);
      setSelectedId(null);
      reload();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  return (
    <AdminShell title="Enquiries" maxWidth={1100}>
      <PageHeader
        title="Enquiries"
        subtitle="Messages sent through the contact form on your website."
        actions={
          <View style={{ width: 240 }}>
            <Field value={query} onChangeText={setQuery} placeholder="Search enquiries..." tone="white" trailing={<Icon name="search" size={16} color={A.muted} />} />
          </View>
        }
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading enquiries…' : undefined} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: 'all', label: 'All', count: items.length },
              { key: 'unread', label: 'Unread', count: items.filter((e) => !e.read).length },
              { key: 'read', label: 'Read', count: items.filter((e) => e.read).length },
            ]}
          />
          {rows.length === 0 ? (
            <Empty text={items.length === 0 ? 'No enquiries yet. Messages from the contact form will appear here.' : 'No enquiries match.'} />
          ) : (
            <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>
              <View style={{ width: stacked ? '100%' : 400, gap: 8 }}>
                {rows.map((e) => {
                  const active = e.id === selected?.id;
                  return (
                    <Pressable key={e.id} accessibilityRole="button" accessibilityState={{ selected: active }} onPress={() => open(e)} style={{ backgroundColor: A.white, borderRadius: 10, padding: 14, gap: 6, borderWidth: 1, borderColor: active ? A.accent : 'transparent' }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!e.read ? <View accessibilityLabel="Unread" style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: A.accent }} /> : null}
                        <AText kind="label" style={{ flex: 1 }} numberOfLines={1}>
                          {e.name}
                        </AText>
                        <AText kind="tiny" color={A.muted}>
                          {timeAgo(e.createdAt)}
                        </AText>
                      </View>
                      <AText kind="small" color={A.accent}>
                        {e.topic}
                      </AText>
                      <AText kind="small" color={A.muted} numberOfLines={2}>
                        {e.message}
                      </AText>
                    </Pressable>
                  );
                })}
              </View>
              <View style={{ flex: 1, width: stacked ? '100%' : undefined }}>
                {selected ? <Detail enquiry={selected} onToggleRead={() => setRead(selected, !selected.read)} onDelete={() => setToDelete(selected)} /> : <Empty text="Select an enquiry to read it." />}
              </View>
            </View>
          )}
        </View>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this enquiry?" message="It will be removed permanently." confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
