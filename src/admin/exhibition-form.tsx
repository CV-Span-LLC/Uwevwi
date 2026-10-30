import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, ConfirmDialog, Field, ImageField, ImageGrid, Loading, Modal, errorText, statusBadge, useToast } from '@/admin/ui';
import { adminApi, assetUrl, type Artist, type Exhibition } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Form = {
  title: string;
  series: string;
  edition: string;
  dateLabel: string;
  location: string;
  intro: string;
  flyer: string | null;
  galleryHeading: string;
  galleryText: string;
  gallery: string[];
  artists: Artist[];
  noteHeading: string;
  noteText: string;
};

const EMPTY: Form = { title: '', series: '', edition: '', dateLabel: '', location: '', intro: '', flyer: null, galleryHeading: '', galleryText: '', gallery: [], artists: [], noteHeading: '', noteText: '' };
const BIO_LIMIT = 500;

function SectionCard({ number, title, subtitle, action, children }: { number: string; title: string; subtitle: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card style={{ gap: 16 }}>
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <View style={{ gap: 2, flex: 1 }}>
          <AText kind="label" style={{ fontSize: 15 }}>
            {number} {title}
          </AText>
          <AText kind="small" color={A.muted}>
            {subtitle}
          </AText>
        </View>
        {action}
      </View>
      {children}
    </Card>
  );
}

function ArtistModal({ visible, initial, onSave, onClose }: { visible: boolean; initial: Artist | null; onSave: (artist: Artist) => void; onClose: () => void }) {
  const { width } = useWindowDimensions();
  const [artist, setArtist] = useState<Artist>(initial ?? { name: '', bio: '', photo: null, works: [] });
  const [tried, setTried] = useState(false);

  const errors = { photo: !artist.photo && 'Add a photograph.', name: !artist.name.trim() && 'Enter the artist’s name.', bio: !artist.bio.trim() && 'Tell us about the artist.' };
  const submit = () => {
    setTried(true);
    if (errors.photo || errors.name || errors.bio) return;
    onSave({ ...artist, name: artist.name.trim(), bio: artist.bio.trim() });
  };

  return (
    <Modal visible={visible} title={initial ? 'Edit Artist' : 'Add Artist'} onClose={onClose} width={760}>
      <View style={{ flexDirection: width < 640 ? 'column' : 'row', gap: 20 }}>
        <View style={{ width: width < 640 ? '100%' : 200 }}>
          <ImageField label="Artist Photograph" required value={artist.photo} onChange={(v) => setArtist((a) => ({ ...a, photo: v }))} height={220} emptyText="Upload Photo" error={tried && errors.photo} />
        </View>
        <View style={{ flex: 1, gap: 16 }}>
          <Field label="Artist Name" required value={artist.name} onChangeText={(v) => setArtist((a) => ({ ...a, name: v }))} placeholder="e.g. Tunde Adeyemi" error={tried && errors.name} />
          <Field label="About the Artist" required value={artist.bio} onChangeText={(v) => setArtist((a) => ({ ...a, bio: v.slice(0, BIO_LIMIT) }))} multiline height={150} placeholder="Tell us about the artist…" error={tried && errors.bio} helper={`${artist.bio.length}/${BIO_LIMIT}`} />
        </View>
      </View>
      <View style={{ gap: 4 }}>
        <AText kind="label" style={{ fontSize: 15 }}>
          Artist’s Work
        </AText>
        <AText kind="small" color={A.muted}>
          Add images of the artist’s work from this exhibition.
        </AText>
      </View>
      <ImageGrid values={artist.works} onChange={(works) => setArtist((a) => ({ ...a, works }))} columns={4} tileHeight={110} addText="Add artists works" />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
        <Btn label="Cancel" kind="secondary" onPress={onClose} />
        <Btn label={initial ? 'Save Artist' : 'Add Artist'} onPress={submit} />
      </View>
    </Modal>
  );
}

function ArtistCard({ artist, onEdit, onRemove }: { artist: Artist; onEdit: () => void; onRemove: () => void }) {
  return (
    <View style={{ flexGrow: 1, flexBasis: 300, borderWidth: 1, borderColor: A.line, borderRadius: 10, padding: 12, gap: 10 }}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ width: 74, height: 90, borderRadius: 6, overflow: 'hidden', backgroundColor: A.field }}>{artist.photo ? <Image source={{ uri: assetUrl(artist.photo) }} style={{ width: '100%', height: '100%' }} contentFit="cover" /> : null}</View>
        <View style={{ flex: 1, gap: 4 }}>
          <AText kind="label" numberOfLines={2}>
            {artist.name}
          </AText>
          <AText kind="tiny" color={A.muted} numberOfLines={4}>
            {artist.bio || 'No biography yet.'}
          </AText>
        </View>
      </View>
      {artist.works.length > 0 ? (
        <View style={{ flexDirection: 'row', gap: 6 }}>
          {artist.works.slice(0, 4).map((w) => (
            <View key={w} style={{ width: 52, height: 52, borderRadius: 4, overflow: 'hidden', backgroundColor: A.field }}>
              <Image source={{ uri: assetUrl(w) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
            </View>
          ))}
        </View>
      ) : null}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <Btn label="Edit" kind="secondary" small icon="edit" onPress={onEdit} />
        <Btn label="Remove" kind="ghost" small icon="trash" onPress={onRemove} style={{ borderColor: 'transparent' }} />
      </View>
    </View>
  );
}

function FormBody({ id, initial, current }: { id?: number; initial: Form; current?: Exhibition }) {
  const toast = useToast();
  const { width } = useWindowDimensions();
  const [form, setForm] = useState<Form>(initial);
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState<'draft' | 'publish' | null>(null);
  const [artistModal, setArtistModal] = useState<{ index: number | null; key: number } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const set = <K extends keyof Form>(key: K, value: Form[K]) => setForm((f) => ({ ...f, [key]: value }));
  const editing = id !== undefined;
  const wide = width >= 720;

  const errors = {
    flyer: !form.flyer && 'Add the exhibition flyer.',
    title: !form.title.trim() && 'Enter the exhibition name.',
    dateLabel: !form.dateLabel.trim() && 'Enter the date and year.',
    location: !form.location.trim() && 'Enter the location.',
    intro: !form.intro.trim() && 'Add a short description.',
    galleryHeading: !form.galleryHeading.trim() && 'Enter a section heading.',
    galleryText: !form.galleryText.trim() && 'Add supporting text.',
  };
  const complete = Object.values(errors).every((e) => !e);

  const save = async (mode: 'draft' | 'publish') => {
    setTried(true);
    if (mode === 'draft' ? !form.title.trim() : !complete) {
      toast(mode === 'draft' ? 'Give the exhibition a name to save a draft.' : 'Please complete the highlighted fields.', 'error');
      return;
    }
    setBusy(mode);
    const body = { ...form, status: mode === 'publish' ? 'published' : 'draft' };
    try {
      if (editing) {
        await adminApi(`/exhibitions/${id}`, { method: 'PUT', body });
        toast(mode === 'publish' ? 'Exhibition published.' : 'Draft saved.');
      } else {
        const created = await adminApi<{ id: number }>('/exhibitions', { method: 'POST', body });
        toast(mode === 'publish' ? 'Exhibition published.' : 'Draft saved.');
        router.replace({ pathname: '/admin/exhibition/[id]', params: { id: created.id } });
      }
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(null);
    }
  };

  const remove = async () => {
    try {
      await adminApi(`/exhibitions/${id}`, { method: 'DELETE' });
      toast('Exhibition deleted.');
      router.replace('/admin/exhibition');
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  const saveArtist = (artist: Artist) => {
    const index = artistModal?.index;
    setForm((f) => ({ ...f, artists: index === null || index === undefined ? [...f.artists, artist] : f.artists.map((a, i) => (i === index ? artist : a)) }));
    setArtistModal(null);
  };

  return (
    <AdminShell title={editing ? 'Edit Exhibition' : 'New Exhibition'} maxWidth={1000}>
      <PageHeader
        back={{ label: 'Back', href: '/admin/exhibition' }}
        title={editing ? 'Edit Exhibition' : 'Create Exhibition'}
        subtitle="Create and manage the exhibitions, image, artists and more."
        actions={
          <>
            {current ? statusBadge(current.status) : null}
            {editing ? <Btn label="Delete" kind="ghost" icon="trash" onPress={() => setConfirmDelete(true)} style={{ borderColor: 'transparent' }} /> : null}
            <Btn label="Save Draft" kind="secondary" loading={busy === 'draft'} onPress={() => save('draft')} />
            <Btn label={current?.status === 'published' ? 'Update' : 'Publish'} icon="send" loading={busy === 'publish'} onPress={() => save('publish')} />
          </>
        }
      />
      <View style={{ gap: 16 }}>
        <SectionCard number="01" title="Introduction" subtitle="Give a brief overview of the exhibition">
          <View style={{ flexDirection: wide ? 'row' : 'column', gap: 20 }}>
            <View style={{ width: wide ? 190 : '100%' }}>
              <ImageField label="Exhibition Flyer" required value={form.flyer} onChange={(v) => set('flyer', v)} height={260} fit="contain" emptyText="Click to add exhibition flyer" error={tried && errors.flyer} />
            </View>
            <View style={{ flex: 1, gap: 14 }}>
              <Field label="Exhibition Name" required value={form.title} onChangeText={(v) => set('title', v)} placeholder="e.g. Imagination as Access" error={tried && errors.title} />
              <Field label="Date & Year" required value={form.dateLabel} onChangeText={(v) => set('dateLabel', v)} placeholder="Enter the date and year of event" error={tried && errors.dateLabel} />
              <Field label="Location" required value={form.location} onChangeText={(v) => set('location', v)} placeholder="e.g. Lagos, Nigeria" error={tried && errors.location} />
              <Field label="Short description / Introduction" required value={form.intro} onChangeText={(v) => set('intro', v)} multiline height={110} placeholder="Share a short introduction to the exhibition, its theme or intention…" error={tried && errors.intro} />
              <View style={{ flexDirection: wide ? 'row' : 'column', gap: 14 }}>
                <View style={{ flex: 1 }}>
                  <Field label="Series (optional)" value={form.series} onChangeText={(v) => set('series', v)} placeholder="e.g. Art for Hope Biennial" />
                </View>
                <View style={{ flex: 1 }}>
                  <Field label="Edition (optional)" value={form.edition} onChangeText={(v) => set('edition', v)} placeholder="e.g. 2026 · Inaugural Edition" />
                </View>
              </View>
            </View>
          </View>
        </SectionCard>

        <SectionCard number="02" title="Inside the Exhibition" subtitle="Show the space, atmosphere and key moments from the exhibition…">
          <Field label="Section Heading" required value={form.galleryHeading} onChangeText={(v) => set('galleryHeading', v)} placeholder="e.g. Inside Imagination as Access" error={tried && errors.galleryHeading} />
          <Field label="Supporting Text/ Quote" required value={form.galleryText} onChangeText={(v) => set('galleryText', v)} multiline height={80} placeholder="Add a short text or quote to introduce this section…" error={tried && errors.galleryText} />
          <ImageGrid values={form.gallery} onChange={(v) => set('gallery', v)} columns={wide ? 3 : 2} />
        </SectionCard>

        <SectionCard number="03" title="Meet the Artists" subtitle="Introduce the artists and showcase their work" action={<Btn label="Add artists" kind="secondary" small onPress={() => setArtistModal({ index: null, key: Date.now() })} />}>
          {form.artists.length === 0 ? (
            <View style={{ backgroundColor: A.field, borderRadius: 8, paddingVertical: 28, alignItems: 'center', gap: 6 }}>
              <Icon name="image" size={20} color={A.faint} />
              <AText kind="small" color={A.muted}>
                No artists added yet
              </AText>
            </View>
          ) : (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
              {form.artists.map((artist, i) => (
                <ArtistCard key={`${artist.name}-${i}`} artist={artist} onEdit={() => setArtistModal({ index: i, key: Date.now() })} onRemove={() => set('artists', form.artists.filter((_, n) => n !== i))} />
              ))}
            </View>
          )}
        </SectionCard>

        <SectionCard number="04" title="Curatorial Note" subtitle="Optional closing statement shown at the end of the exhibition page">
          <Field label="Note heading" value={form.noteHeading} onChangeText={(v) => set('noteHeading', v)} multiline height={80} placeholder="e.g. Imagination is the first access we all have…" />
          <Field label="Supporting text" value={form.noteText} onChangeText={(v) => set('noteText', v)} multiline height={80} placeholder="A short paragraph to follow the heading" />
        </SectionCard>
      </View>

      <ArtistModal key={artistModal?.key ?? 'closed'} visible={artistModal !== null} initial={artistModal?.index != null ? form.artists[artistModal.index] : null} onSave={saveArtist} onClose={() => setArtistModal(null)} />
      <ConfirmDialog visible={confirmDelete} title="Delete this exhibition?" message="It will be removed from the website. This cannot be undone." confirmLabel="Delete" danger onConfirm={remove} onCancel={() => setConfirmDelete(false)} />
    </AdminShell>
  );
}

export function NewExhibition() {
  return <FormBody initial={EMPTY} />;
}

export function EditExhibition({ id }: { id: number }) {
  const { data, error, loading, reload } = useRemote(() => adminApi<Exhibition>(`/exhibitions/${id}`), [id]);
  if (!data) {
    return (
      <AdminShell title="Edit Exhibition">
        <Loading error={error} onRetry={reload} text={loading ? 'Loading exhibition…' : undefined} />
      </AdminShell>
    );
  }
  const { title, series, edition, dateLabel, location, intro, flyer, galleryHeading, galleryText, gallery, artists, noteHeading, noteText } = data;
  return <FormBody key={`${data.id}-${data.updatedAt}`} id={id} current={data} initial={{ title, series, edition, dateLabel, location, intro, flyer, galleryHeading, galleryText, gallery, artists, noteHeading, noteText }} />;
}

