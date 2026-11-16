import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, View, useWindowDimensions } from 'react-native';

import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Avatar, Btn, Card, ConfirmDialog, Empty, Field, Loading, SearchField, Tabs, errorText, useToast } from '@/admin/ui';
import { adminApi, assetUrl, timeAgo, type CommentNode, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Entry = ResearchSummary & { fresh: number };
type Tab = 'all' | 'new' | 'visible' | 'hidden';

function CommentRow({ comment, isReply, onReply, onDelete }: { comment: CommentNode; isReply?: boolean; onReply: (c: CommentNode) => void; onDelete: (c: CommentNode) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 14 }}>
      <Avatar name={comment.name} size={isReply ? 32 : 38} tone={comment.isAuthor ? 'accent' : 'ink'} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <AText kind="label">{comment.name}</AText>
          {comment.isAuthor ? (
            <View style={{ backgroundColor: A.accentSoft, borderRadius: 100, paddingHorizontal: 8, paddingVertical: 1 }}>
              <AText kind="tiny" color={A.accent} style={{ fontSize: 11 }}>
                Author
              </AText>
            </View>
          ) : null}
          <AText kind="tiny" color={A.muted}>
            {timeAgo(comment.createdAt)}
          </AText>
        </View>
        <AText color="#3d3b38" style={{ lineHeight: 22 }}>
          {comment.body}
        </AText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5, marginRight: 10 }}>
            <Icon name="check" size={12} color={A.faint} />
            <AText kind="tiny" color={A.muted}>
              {comment.likes} like{comment.likes === 1 ? '' : 's'}
            </AText>
          </View>
          {!isReply ? <Btn label="Reply" kind="ghost" small icon="send" onPress={() => onReply(comment)} /> : null}
          <Btn label="Delete" kind="ghost" small icon="trash" onPress={() => onDelete(comment)} />
        </View>
      </View>
    </View>
  );
}

function Thread({ entry, onChanged }: { entry: Entry; onChanged: () => void }) {
  const toast = useToast();
  const { data, error, loading, reload } = useRemote(() => adminApi<CommentNode[]>(`/comments/entries/${entry.id}`), [entry.id]);
  const [replyTo, setReplyTo] = useState<CommentNode | null>(null);
  const [text, setText] = useState('');
  const [busy, setBusy] = useState(false);
  const [toDelete, setToDelete] = useState<CommentNode | null>(null);

  const sendReply = async () => {
    if (!replyTo || !text.trim() || busy) return;
    setBusy(true);
    try {
      await adminApi('/comments', { method: 'POST', body: { parentId: replyTo.id, text } });
      toast('Reply posted.');
      setReplyTo(null);
      setText('');
      reload();
      onChanged();
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const confirmDelete = async () => {
    if (!toDelete) return;
    try {
      await adminApi(`/comments/${toDelete.id}`, { method: 'DELETE' });
      toast('Comment deleted.');
      setToDelete(null);
      reload();
      onChanged();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const toggleHidden = async () => {
    try {
      await adminApi(`/research/${entry.id}/comments-hidden`, { method: 'PUT', body: { hidden: !entry.commentsHidden } });
      toast(entry.commentsHidden ? 'Comments are visible again.' : 'Comments are hidden from the website.');
      onChanged();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  return (
    <View style={{ borderTopWidth: 1, borderTopColor: A.line, backgroundColor: '#fbfaf8' }}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingHorizontal: 20, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: A.line }}>
        <AText kind="small" color={A.muted}>
          {entry.commentsHidden ? 'Comments are hidden from visitors.' : 'Comments are visible on the article.'}
        </AText>
        <Btn label={entry.commentsHidden ? 'Show on website' : 'Hide from website'} kind="secondary" small icon={entry.commentsHidden ? 'eye' : 'eye-off'} onPress={toggleHidden} />
      </View>
      <View style={{ paddingHorizontal: 20 }}>
        {!data ? <Loading error={error} onRetry={reload} text={loading ? 'Loading comments…' : undefined} /> : null}
        {data && data.length === 0 ? <Empty icon="comments" text="No comments on this piece yet." /> : null}
        {data?.map((c, idx) => (
          <View key={c.id} style={{ borderBottomWidth: idx === data.length - 1 ? 0 : 1, borderBottomColor: A.line }}>
            <CommentRow
              comment={c}
              onReply={(target) => {
                setReplyTo(target);
                setText('');
              }}
              onDelete={setToDelete}
            />
            {c.replies && c.replies.length > 0 ? (
              <View style={{ marginLeft: 19, paddingLeft: 22, borderLeftWidth: 2, borderLeftColor: A.line }}>
                {c.replies.map((r) => (
                  <CommentRow key={r.id} comment={r} isReply onReply={setReplyTo} onDelete={setToDelete} />
                ))}
              </View>
            ) : null}
            {replyTo?.id === c.id ? (
              <View style={{ gap: 10, paddingBottom: 16, marginLeft: 50 }}>
                <Field value={text} onChangeText={setText} placeholder={`Reply to ${c.name}…`} multiline height={96} />
                <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                  <Btn label="Cancel" kind="secondary" small onPress={() => setReplyTo(null)} />
                  <Btn label="Post reply" small icon="send" loading={busy} disabled={!text.trim()} onPress={sendReply} />
                </View>
              </View>
            ) : null}
          </View>
        ))}
      </View>
      <ConfirmDialog visible={!!toDelete} title="Delete this comment?" message="It will be removed from the website for good." confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </View>
  );
}

export default function CommentsPage() {
  const { width } = useWindowDimensions();
  const { data, error, loading, reload } = useRemote(() => adminApi<Entry[]>('/comments/entries'));
  const [tab, setTab] = useState<Tab>('all');
  const [query, setQuery] = useState('');
  const [openId, setOpenId] = useState<number | null>(null);
  const wide = width >= 820;

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (data ?? []).filter((e) => {
      if (tab === 'new' && e.fresh === 0) return false;
      if (tab === 'visible' && e.commentsHidden) return false;
      if (tab === 'hidden' && !e.commentsHidden) return false;
      return !q || e.title.toLowerCase().includes(q);
    });
  }, [data, tab, query]);
  const total = (data ?? []).reduce((n, e) => n + e.comments, 0);
  const fresh = (data ?? []).reduce((n, e) => n + e.fresh, 0);

  return (
    <AdminShell title="Comments" maxWidth={1040}>
      <PageHeader title="Comments" subtitle={data ? `${total} comment${total === 1 ? '' : 's'} across ${data.length} article${data.length === 1 ? '' : 's'}${fresh ? `, ${fresh} to review.` : '.'}` : 'Read and reply to comments from visitors on your research articles.'} />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading comments…' : undefined} />
      ) : (
        <View style={{ gap: 14 }}>
          <View style={{ flexDirection: wide ? 'row' : 'column', alignItems: wide ? 'center' : 'stretch', justifyContent: 'space-between', gap: 12 }}>
            <Tabs
              active={tab}
              onChange={setTab}
              tabs={[
                { key: 'all', label: 'All', count: data.length },
                { key: 'new', label: 'To review', count: data.filter((e) => e.fresh > 0).length },
                { key: 'visible', label: 'Visible', count: data.filter((e) => !e.commentsHidden).length },
                { key: 'hidden', label: 'Hidden', count: data.filter((e) => e.commentsHidden).length },
              ]}
            />
            <SearchField value={query} onChangeText={setQuery} placeholder="Search articles…" width={wide ? 260 : '100%'} />
          </View>
          {rows.length === 0 ? (
            <Card>
              <Empty icon="comments" text={query ? 'No articles match your search.' : tab === 'new' ? 'No comments waiting for review.' : 'Nothing here yet.'} />
            </Card>
          ) : null}
          {rows.map((e) => {
            const open = openId === e.id;
            return (
              <Card key={e.id} style={{ padding: 0, overflow: 'hidden' }}>
                <Pressable
                  accessibilityRole="button"
                  accessibilityState={{ expanded: open }}
                  onPress={() => setOpenId(open ? null : e.id)}
                  style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', gap: 16, alignItems: 'center', padding: 16, backgroundColor: hovered ? '#fbfaf8' : A.white })}
                >
                  <View style={{ width: wide ? 96 : 64, height: wide ? 64 : 48, borderRadius: 6, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
                    {e.image ? <Image source={{ uri: assetUrl(e.image) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}
                  </View>
                  <View style={{ flex: 1, gap: 4 }}>
                    <AText kind="label" style={{ fontSize: 14 }} numberOfLines={2}>
                      {e.title}
                    </AText>
                    <AText kind="tiny" color={A.muted}>
                      Published {new Date(e.publishedAt).getFullYear()}
                    </AText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                    {e.fresh > 0 ? (
                      <View style={{ backgroundColor: A.accentSoft, borderRadius: 100, paddingHorizontal: 9, paddingVertical: 2 }}>
                        <AText kind="tiny" color={A.accent} style={{ fontSize: 11 }}>
                          {e.fresh} new
                        </AText>
                      </View>
                    ) : null}
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name={e.commentsHidden ? 'eye-off' : 'comments'} size={14} color={A.muted} />
                      <AText kind="small" color={A.muted}>
                        {e.commentsHidden ? 'Hidden' : e.comments}
                      </AText>
                    </View>
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={A.muted} />
                  </View>
                </Pressable>
                {open ? <Thread entry={e} onChanged={reload} /> : null}
              </Card>
            );
          })}
        </View>
      )}
    </AdminShell>
  );
}
