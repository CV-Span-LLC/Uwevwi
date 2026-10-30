import { router } from 'expo-router';
import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { MarkdownEditor } from '@/admin/editor';
import { dateTime } from '@/admin/format';
import { DateField, TimeField, splitIso, toIso } from '@/admin/pickers';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Field, ImageField, Loading, SelectField, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, RESEARCH_TYPES, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Detail = ResearchSummary & { content: string; publishAtRaw: string | null };

type Form = { title: string; type: string; excerpt: string; content: string; image: string | null; date: string; time: string };
const EMPTY: Form = { title: '', type: '', excerpt: '', content: '', image: null, date: '', time: '' };

function FormBody({ id, initial, detail }: { id?: number; initial: Form; detail?: Detail }) {
  const { width } = useWindowDimensions();
  const toast = useToast();
  const [form, setForm] = useState<Form>(initial);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<'draft' | 'publish' | 'save' | null>(null);
  const [confirm, setConfirm] = useState<'delete' | null>(null);
  const stacked = width < 1100;
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));

  const errors = {
    title: !form.title.trim() && 'Enter a title.',
    type: !form.type && 'Choose a research type.',
    excerpt: !form.excerpt.trim() && 'Add a short description.',
    content: !form.content.trim() && 'Add the content.',
  };
  const complete = !errors.title && !errors.type && !errors.excerpt && !errors.content;
  const schedule = toIso(form.date, form.time);

  const payload = (status?: 'draft' | 'published') => ({
    title: form.title,
    type: form.type,
    excerpt: form.excerpt,
    content: form.content,
    image: form.image,
    publishAt: schedule || '',
    status,
  });

  const save = async (mode: 'draft' | 'publish' | 'save') => {
    setTried(true);
    // A draft only needs a title; everything else is required to go live.
    if (mode === 'draft' ? !form.title.trim() || !form.type : !complete) {
      toast(mode === 'draft' ? 'Add a title and choose a type to save a draft.' : 'Please complete the highlighted fields.', 'error');
      return;
    }
    setBusy(mode);
    try {
      if (id === undefined) {
        const created = await adminApi<{ id: number }>('/research', { method: 'POST', body: payload(mode === 'publish' ? 'published' : 'draft') });
        toast(mode === 'publish' ? 'Research published.' : 'Draft saved.');
        router.replace({ pathname: '/admin/research/[id]', params: { id: created.id } });
      } else {
        const status = mode === 'publish' ? 'published' : mode === 'draft' ? 'draft' : undefined;
        await adminApi(`/research/${id}`, { method: 'PUT', body: payload(status) });
        toast(mode === 'draft' ? 'Moved to draft.' : mode === 'publish' ? 'Research published.' : 'Changes saved.');
        if (mode !== 'save') router.replace({ pathname: '/admin/research/[id]', params: { id } });
      }
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    if (id === undefined) return;
    try {
      await adminApi(`/research/${id}`, { method: 'DELETE' });
      toast('Research deleted.');
      router.replace('/admin/research');
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const editing = id !== undefined;
  const live = detail?.status === 'published' || detail?.status === 'scheduled';

  return (
    <AdminShell title={editing ? 'Edit Research' : 'New Research'}>
      <PageHeader
        back={{ label: editing ? 'Back to Research' : 'Back', href: '/admin/research' }}
        title={editing ? 'Edit Research' : 'New Research'}
        subtitle={editing ? 'Update your research articles.' : 'Write and publish research articles, journal and writers publications.'}
        actions={
          editing ? (
            <>
              {detail ? statusBadge(detail.status) : null}
              <Btn label="Save Changes" iconRight="external" loading={busy === 'save'} onPress={() => save('save')} />
            </>
          ) : (
            <>
              <Btn label="Save Draft" kind="secondary" loading={busy === 'draft'} onPress={() => save('draft')} />
              <Btn label="Publish" icon="send" loading={busy === 'publish'} onPress={() => save('publish')} />
            </>
          )
        }
      />
      <View style={{ flexDirection: stacked ? 'column' : 'row', gap: 16, alignItems: 'flex-start' }}>
        <Card style={{ flex: 1, width: stacked ? '100%' : undefined, gap: 18 }}>
          <Field label="Title" required value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. The Memory of Place" error={tried && errors.title} />
          <SelectField label="Research Type" required value={form.type} options={RESEARCH_TYPES} onChange={(v) => set('type', v)} placeholder="Select the research type" error={tried && errors.type} />
          <Field label="Short description / Excerpt" required value={form.excerpt} onChangeText={(v) => set('excerpt', v)} multiline height={90} placeholder="A brief summary of your research article. This will appear in listings." error={tried && errors.excerpt} />
          <View style={{ gap: 6 }}>
            <AText kind="label" color={A.accent}>
              Content *
            </AText>
            <MarkdownEditor value={form.content} onChange={(v) => set('content', v)} error={tried && !!errors.content} />
            {tried && errors.content ? (
              <AText kind="small" color={A.accent}>
                {errors.content}
              </AText>
            ) : (
              <AText kind="small" color={A.muted}>
                Use the toolbar for headings, bold, links, lists and quotes.
              </AText>
            )}
          </View>
        </Card>

        <View style={{ width: stacked ? '100%' : 300, gap: 16 }}>
          <Card style={{ gap: 12 }}>
            <ImageField label="Featured Image" value={form.image} onChange={(v) => set('image', v)} height={170} emptyText="Click to add featured image" />
          </Card>
          <Card style={{ gap: 14, zIndex: 5 }}>
            <AText kind="label">Schedule Release</AText>
            <AText kind="small" color={A.muted}>
              Release Date and time
            </AText>
            <TimeField value={form.time} onChange={(v) => set('time', v)} />
            <DateField value={form.date} onChange={(v) => set('date', v)} />
            <AText kind="tiny" color={A.muted}>
              Your research will be published at the date and time selected. Leave empty to publish immediately.
            </AText>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {editing ? <Btn label="Delete" kind="ghost" icon="trash" small onPress={() => setConfirm('delete')} style={{ borderColor: 'transparent' }} /> : <View />}
              <Btn label="Clear" kind="secondary" small onPress={() => setForm((f) => ({ ...f, date: '', time: '' }))} />
            </View>
          </Card>
          {editing && detail ? (
            <>
              <Card style={{ gap: 12 }}>
                <AText kind="label">Key Details</AText>
                <DetailRow label="Author" value={detail.author} />
                <DetailRow label="Published Date" value={live ? dateTime(detail.publishedAt) : 'Not published yet'} />
                <DetailRow label="Views" value={String(detail.views)} />
                <DetailRow label="Comments" value={String(detail.comments)} />
              </Card>
              <Card style={{ gap: 12 }}>
                <AText kind="label">Status & Visibility</AText>
                <DetailRow label="Status" value={detail.status === 'scheduled' ? 'Scheduled' : detail.status === 'published' ? 'Published' : 'Draft'} />
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                  {live ? <Btn label="Move to draft" kind="secondary" small loading={busy === 'draft'} onPress={() => save('draft')} /> : <Btn label="Publish" icon="send" small loading={busy === 'publish'} onPress={() => save('publish')} />}
                  <Btn label="Remove" kind="ghost" icon="trash" small onPress={() => setConfirm('delete')} style={{ borderColor: 'transparent' }} />
                </View>
              </Card>
            </>
          ) : null}
        </View>
      </View>
      <ConfirmDialog visible={confirm === 'delete'} title="Delete this research?" message="This permanently removes the piece and its comments from the site. This cannot be undone." confirmLabel="Delete" danger onConfirm={remove} onCancel={() => setConfirm(null)} />
    </AdminShell>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View style={{ gap: 4 }}>
      <AText kind="small" color={A.muted}>
        {label}
      </AText>
      <View style={{ backgroundColor: A.field, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 8 }}>
        <AText kind="small">{value}</AText>
      </View>
    </View>
  );
}

export function NewResearch() {
  return <FormBody initial={EMPTY} />;
}

export function EditResearch({ id }: { id: number }) {
  const { data, error, loading, reload } = useRemote(() => adminApi<Detail>(`/research/${id}`), [id]);

  if (!data) {
    return (
      <AdminShell title="Edit Research">
        <Loading error={error} onRetry={reload} text={loading ? 'Loading research…' : undefined} />
      </AdminShell>
    );
  }
  const { date, time } = splitIso(data.publishAtRaw);
  const initial: Form = { title: data.title, type: data.type, excerpt: data.excerpt, content: data.content, image: data.image, date, time };
  return <FormBody key={`${data.id}-${data.updatedAt}`} id={id} initial={initial} detail={data} />;
}
