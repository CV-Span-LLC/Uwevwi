import { Image } from 'expo-image';
import { useMemo, useState } from 'react';
import { Pressable, View } from 'react-native';

import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Empty, Field, Loading, Tabs, errorText, useToast } from '@/admin/ui';
import { adminApi, assetUrl, timeAgo, type CommentNode, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';
import { fonts } from '@/theme';

type Entry = ResearchSummary & { fresh: number };
type Tab = 'all' | 'visible' | 'hidden';

const initials = (name: string) => name.split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

function Avatar({ name, small }: { name: string; small?: boolean }) {
  const size = small ? 36 : 44;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: '#1f1f1f', alignItems: 'center', justifyContent: 'center' }}>
      <AText color={A.white} style={{ fontFamily: fonts.quote, fontSize: small ? 14 : 17 }}>
        {initials(name)}
      </AText>
    </View>
  );
}

function CommentRow({ comment, isReply, onReply, onDelete }: { comment: CommentNode; isReply?: boolean; onReply: (c: CommentNode) => void; onDelete: (c: CommentNode) => void }) {
  return (
    <View style={{ flexDirection: 'row', gap: 12, paddingVertical: 12 }}>
      <Avatar name={comment.name} small={isReply} />
      <View style={{ flex: 1, gap: 6 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <AText kind="label" style={{ fontFamily: fonts.display, fontSize: 18 }}>
            {comment.name}
          </AText>
          {comment.isAuthor ? (
            <View style={{ backgroundColor: A.accent, borderRadius: 6, paddingHorizontal: 8, paddingVertical: 2 }}>
              <AText kind="tiny" color={A.white}>
                Author
              </AText>
            </View>
          ) : null}
          <AText kind="tiny" color={A.muted}>
            {timeAgo(comment.createdAt)}
          </AText>
        </View>
        <AText color={A.muted}>{comment.body}</AText>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 16 }}>
          <AText kind="tiny" color={A.accent}>
            {comment.likes} like{comment.likes === 1 ? '' : 's'}
          </AText>
          {!isReply ? (
            <Pressable accessibilityRole="button" onPress={() => onReply(comment)}>
              <AText kind="tiny" color={A.text}>
                Reply
              </AText>
            </Pressable>
          ) : null}
          <Pressable accessibilityRole="button" onPress={() => onDelete(comment)}>
            <AText kind="tiny" color={A.accent}>
              Delete
            </AText>
          </Pressable>
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
    <View style={{ borderTopWidth: 1, borderTopColor: A.line, marginTop: 14, paddingTop: 8 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', paddingBottom: 4 }}>
        <Btn label={entry.commentsHidden ? 'Show comments on website' : 'Hide comments from website'} kind="secondary" small icon={entry.commentsHidden ? 'eye' : 'eye-off'} onPress={toggleHidden} />
      </View>
      {!data ? <Loading error={error} onRetry={reload} text={loading ? 'Loading comments…' : undefined} /> : null}
      {data && data.length === 0 ? <Empty text="No comments on this piece yet." /> : null}
      {data?.map((c) => (
        <View key={c.id} style={{ borderBottomWidth: 1, borderBottomColor: A.line }}>
          <CommentRow comment={c} onReply={(target) => { setReplyTo(target); setText(''); }} onDelete={setToDelete} />
          {c.replies && c.replies.length > 0 ? (
            <View style={{ marginLeft: 22, paddingLeft: 18, borderLeftWidth: 2, borderLeftColor: A.line }}>
              {c.replies.map((r) => (
                <CommentRow key={r.id} comment={r} isReply onReply={setReplyTo} onDelete={setToDelete} />
              ))}
            </View>
          ) : null}
          {replyTo?.id === c.id ? (
            <View style={{ gap: 10, paddingBottom: 14, marginLeft: 56 }}>
              <Field value={text} onChangeText={setText} placeholder={`Reply to ${c.name}…`} multiline height={90} tone="white" />
              <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
                <Btn label="Cancel" kind="secondary" small onPress={() => setReplyTo(null)} />
                <Btn label="Post reply" small loading={busy} disabled={!text.trim()} onPress={sendReply} />
              </View>
            </View>
          ) : null}
        </View>
      ))}
      <ConfirmDialog visible={!!toDelete} title="Delete this comment?" message="It will be removed from the website for good." confirmLabel="Delete" danger onConfirm={confirmDelete} onCancel={() => setToDelete(null)} />
    </View>
  );
}

export default function CommentsPage() {
  const { data, error, loading, reload } = useRemote(() => adminApi<Entry[]>('/comments/entries'));
  const [tab, setTab] = useState<Tab>('all');
  const [openId, setOpenId] = useState<number | null>(null);

  const rows = useMemo(() => (data ?? []).filter((e) => tab === 'all' || (tab === 'hidden' ? e.commentsHidden : !e.commentsHidden)), [data, tab]);

  return (
    <AdminShell title="Comments" maxWidth={980}>
      <PageHeader title="Comments" subtitle="Manage and response to comments from visitors on your research articles." />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading comments…' : undefined} />
      ) : (
        <View style={{ gap: 14 }}>
          <Tabs
            active={tab}
            onChange={setTab}
            tabs={[
              { key: 'all', label: 'All', count: data.length },
              { key: 'visible', label: 'Visible', count: data.filter((e) => !e.commentsHidden).length },
              { key: 'hidden', label: 'Hidden', count: data.filter((e) => e.commentsHidden).length },
            ]}
          />
          {rows.length === 0 ? <Empty text="Nothing here yet." /> : null}
          {rows.map((e) => {
            const open = openId === e.id;
            return (
              <Card key={e.id} style={{ padding: 14 }}>
                <Pressable accessibilityRole="button" accessibilityState={{ expanded: open }} onPress={() => setOpenId(open ? null : e.id)} style={{ flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
                  <View style={{ width: 132, height: 80, borderRadius: 4, overflow: 'hidden', backgroundColor: A.field }}>{e.image ? <Image source={{ uri: assetUrl(e.image) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}</View>
                  <View style={{ flex: 1, gap: 8 }}>
                    <AText kind="heading" style={{ fontSize: 18, lineHeight: 24 }} numberOfLines={2}>
                      {e.title}
                    </AText>
                    <AText kind="tiny" color={A.muted}>
                      Published • {new Date(e.publishedAt).getFullYear()}
                    </AText>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Icon name={e.commentsHidden ? 'eye-off' : 'comments'} size={14} color={A.muted} />
                      <AText kind="tiny" color={A.muted}>
                        {e.commentsHidden ? 'Hidden Comments' : `${e.comments} comment${e.comments === 1 ? '' : 's'}`}
                      </AText>
                      {e.fresh > 0 ? (
                        <View style={{ backgroundColor: '#fbd3d8', borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1 }}>
                          <AText kind="tiny" color="#9b2f3b">
                            {e.fresh} new
                          </AText>
                        </View>
                      ) : null}
                    </View>
                    <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={A.text} />
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
