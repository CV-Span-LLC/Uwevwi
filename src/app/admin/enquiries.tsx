import { useMemo, useState } from 'react';
import { Linking, Pressable, View, useWindowDimensions } from 'react-native';

import { dateTime } from '@/admin/format';
import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Avatar, Badge, Btn, Card, ConfirmDialog, Empty, Loading, SearchField, Tabs, errorText, useToast } from '@/admin/ui';
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

function Detail({ enquiry, onToggleRead, onDelete, onBack }: { enquiry: Enquiry; onToggleRead: () => void; onDelete: () => void; onBack?: () => void }) {
  return (
    <View style={{ gap: 20, padding: 24 }}>
      {onBack ? <Btn label="All enquiries" kind="ghost" icon="arrow-left" small onPress={onBack} style={{ alignSelf: 'flex-start', marginLeft: -8 }} /> : null}
      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
        <Avatar name={enquiry.name} size={48} />
        <View style={{ flex: 1, gap: 2 }}>
          <AText kind="heading" style={{ fontSize: 22 }}>
            {enquiry.name}
          </AText>
          <Pressable accessibilityRole="link" onPress={() => Linking.openURL(`mailto:${enquiry.email}`)} style={{ alignSelf: 'flex-start' }}>
            <AText kind="small" color={A.accent}>
              {enquiry.email}
            </AText>
          </Pressable>
        </View>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10, alignItems: 'center' }}>
        <Badge tone="blue" label={enquiry.topic} dot={false} />
        {enquiry.organisation ? (
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
            <Icon name="user" size={13} color={A.faint} />
            <AText kind="small" color={A.muted}>
              {enquiry.organisation}
            </AText>
          </View>
        ) : null}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
          <Icon name="clock" size={13} color={A.faint} />
          <AText kind="small" color={A.muted}>
            {dateTime(enquiry.createdAt)}
          </AText>
        </View>
      </View>
      <View style={{ backgroundColor: A.field, borderRadius: 10, padding: 18, borderLeftWidth: 3, borderLeftColor: A.accent }}>
        <AText style={{ lineHeight: 24 }}>{enquiry.message}</AText>
      </View>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        <Btn label="Reply by email" icon="mail" onPress={() => Linking.openURL(replyLink(enquiry))} />
        <Btn label={enquiry.read ? 'Mark as unread' : 'Mark as read'} kind="secondary" onPress={onToggleRead} />
        <Btn label="Delete" kind="danger" icon="trash" onPress={onDelete} />
      </View>
    </View>
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
  const split = width >= 1000;

  const items = useMemo(() => (data ?? []).map((e) => ({ ...e, read: override[e.id] ?? e.read })), [data, override]);
  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((e) => (tab === 'all' || (tab === 'unread' ? !e.read : e.read)) && (!q || [e.name, e.email, e.organisation, e.topic, e.message].some((f) => f.toLowerCase().includes(q))));
  }, [items, tab, query]);
  const selected = rows.find((e) => e.id === selectedId) ?? (split ? rows[0] : undefined);

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

  const unread = items.filter((e) => !e.read).length;
  const showDetailOnly = !split && !!selected;

  return (
    <AdminShell title="Enquiries" maxWidth={1240}>
      <PageHeader title="Enquiries" subtitle="Messages sent through the contact form on your website." />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading enquiries…' : undefined} />
      ) : items.length === 0 ? (
        <Card>
          <Empty icon="inbox" text="No enquiries yet. Messages from the contact form will appear here." />
        </Card>
      ) : (
        <Card style={{ padding: 0, overflow: 'hidden', flexDirection: split ? 'row' : 'column', minHeight: 560 }}>
          {!showDetailOnly ? (
            <View style={{ width: split ? 400 : '100%', borderRightWidth: split ? 1 : 0, borderRightColor: A.line }}>
              <View style={{ gap: 12, padding: 16, borderBottomWidth: 1, borderBottomColor: A.line }}>
                <Tabs
                  active={tab}
                  onChange={setTab}
                  tabs={[
                    { key: 'all', label: 'All', count: items.length },
                    { key: 'unread', label: 'Unread', count: unread },
                    { key: 'read', label: 'Read', count: items.length - unread },
                  ]}
                />
                <SearchField value={query} onChangeText={setQuery} placeholder="Search enquiries…" width="100%" />
              </View>
              {rows.length === 0 ? <Empty text="No enquiries match." /> : null}
              {rows.map((e) => {
                const active = e.id === selected?.id && split;
                return (
                  <Pressable
                    key={e.id}
                    accessibilityRole="button"
                    accessibilityState={{ selected: active }}
                    onPress={() => open(e)}
                    style={({ hovered }: { hovered?: boolean }) => ({
                      flexDirection: 'row',
                      gap: 12,
                      padding: 16,
                      borderBottomWidth: 1,
                      borderBottomColor: A.line,
                      borderLeftWidth: 3,
                      borderLeftColor: active ? A.accent : 'transparent',
                      backgroundColor: active ? A.accentSoft : hovered ? '#fbfaf8' : A.white,
                    })}
                  >
                    <Avatar name={e.name} size={38} tone={e.read ? 'ink' : 'accent'} />
                    <View style={{ flex: 1, gap: 3 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                        {!e.read ? <View accessibilityLabel="Unread" style={{ width: 7, height: 7, borderRadius: 4, backgroundColor: A.signal }} /> : null}
                        <AText kind="label" style={{ flex: 1, fontFamily: e.read ? undefined : undefined }} numberOfLines={1}>
                          {e.name}
                        </AText>
                        <AText kind="tiny" color={A.muted}>
                          {timeAgo(e.createdAt)}
                        </AText>
                      </View>
                      <AText kind="tiny" color={A.accent}>
                        {e.topic}
                      </AText>
                      <AText kind="small" color={A.muted} numberOfLines={2}>
                        {e.message}
                      </AText>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ) : null}
          {split || showDetailOnly ? (
            <View style={{ flex: 1 }}>
              {selected ? (
                <Detail enquiry={selected} onToggleRead={() => setRead(selected, !selected.read)} onDelete={() => setToDelete(selected)} onBack={split ? undefined : () => setSelectedId(null)} />
              ) : (
                <Empty icon="mail" text="Select an enquiry to read it." />
              )}
            </View>
          ) : null}
        </Card>
      )}
      <ConfirmDialog visible={!!toDelete} title="Delete this enquiry?" message="It will be removed permanently." confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </AdminShell>
  );
}
