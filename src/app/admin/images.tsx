import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View, useWindowDimensions } from 'react-native';

import { shortDate } from '@/admin/format';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Badge, Btn, Loading, Panel, errorText, useToast } from '@/admin/ui';
import { adminApi, assetUrl, uploadImage } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';

type Slot = { key: string; group: string; label: string; size: string; path: string | null; updatedAt: string | null };

/** The bundled picture each slot shows until an admin replaces it. */
const DEFAULTS: Record<string, number> = {
  'home.hero': require('../../../assets/figma/home-hero.jpg'),
  'home.bottom': require('../../../assets/figma/home-bottom.jpg'),
  'about.hero': require('../../../assets/figma/about-hero.jpg'),
  'about.founder': require('../../../assets/figma/founder.jpg'),
  'advisory.hero': require('../../../assets/figma/advisory-hero.png'),
  'advisory.research': require('../../../assets/figma/advisory-research.jpg'),
  'stewardship.hero': require('../../../assets/figma/stewardship-hero.jpg'),
  'stewardship.bottom': require('../../../assets/figma/stewardship-beyond.jpg'),
  'studio.hero': require('../../../assets/figma/studios-hero.jpg'),
  'studio.motion': require('../../../assets/figma/studios-motion.jpg'),
  'research.hero': require('../../../assets/figma/research-hero.jpg'),
};

const DESCRIPTIONS: Record<string, string> = {
  Home: 'Shown on the home page: the hero photo and the purpose section.',
  'About Us': 'Shown on the About page.',
  Advisory: 'Shown on the Advisory page and in the services list on the home page.',
  Stewardship: 'Shown on the Stewardship page and in the services list on the home page.',
  Studio: 'Shown on the Studios page and in the services list on the home page.',
  Research: 'Shown on the Research page and in the services list on the home page.',
};

function Tile({ slot, onChanged, width }: { slot: Slot; onChanged: () => void; width: `${number}%` }) {
  const toast = useToast();
  const [busy, setBusy] = useState(false);
  const source = slot.path ? { uri: assetUrl(slot.path) } : DEFAULTS[slot.key];

  const change = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.9 });
      if (result.canceled || !result.assets[0]) return;
      const asset = result.assets[0];
      const path = await uploadImage({ uri: asset.uri, name: asset.fileName ?? undefined, type: asset.mimeType ?? undefined, webFile: asset.file ?? null });
      await adminApi(`/site-images/${slot.key}`, { method: 'PUT', body: { path } });
      toast(`${slot.group} ${slot.label.toLowerCase()} updated.`);
      onChanged();
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  const reset = async () => {
    try {
      await adminApi(`/site-images/${slot.key}`, { method: 'PUT', body: { path: null } });
      toast('Reset to the original image.');
      onChanged();
    } catch (err) {
      toast(errorText(err), 'error');
    }
  };

  return (
    <View style={{ width, borderWidth: 1, borderColor: A.line, borderRadius: 12, overflow: 'hidden', backgroundColor: A.white }}>
      <View style={{ height: 160, backgroundColor: A.field }}>
        <Image source={source} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={`${slot.group} ${slot.label}`} />
        <View style={{ position: 'absolute', top: 10, left: 10 }}>{slot.path ? <Badge tone="blue" label="Custom" /> : <Badge tone="grey" label="Original" />}</View>
      </View>
      <View style={{ padding: 14, gap: 12 }}>
        <View style={{ gap: 2 }}>
          <AText kind="label">{slot.label}</AText>
          <AText kind="tiny" color={A.muted}>
            {slot.size} px{slot.updatedAt && slot.path ? ` · changed ${shortDate(slot.updatedAt)}` : ''}
          </AText>
        </View>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Btn label={busy ? 'Uploading…' : 'Replace'} kind="secondary" small icon="image" onPress={change} disabled={busy} />
          {slot.path ? <Btn label="Reset" kind="ghost" small onPress={reset} /> : null}
        </View>
      </View>
    </View>
  );
}

export default function WebsiteImages() {
  const { width } = useWindowDimensions();
  const { data, error, loading, reload } = useRemote(() => adminApi<Slot[]>('/site-images'));
  const groups = data ? [...new Set(data.map((s) => s.group))] : [];
  const cols = width >= 1280 ? 3 : width >= 760 ? 2 : 1;
  const tileWidth: `${number}%` = cols === 3 ? '32%' : cols === 2 ? '48.8%' : '100%';
  const custom = (data ?? []).filter((s) => s.path).length;

  return (
    <AdminShell title="Website images" maxWidth={1160}>
      <PageHeader
        title="Website images"
        subtitle={data ? `${custom} of ${data.length} images replaced. Anything you don’t replace keeps its original photo.` : 'Replace the photographs used across the website.'}
      />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading images…' : undefined} />
      ) : (
        <View style={{ gap: 16 }}>
          {groups.map((group) => (
            <Panel key={group} title={group} subtitle={DESCRIPTIONS[group]}>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', rowGap: 16 }}>
                {data
                  .filter((s) => s.group === group)
                  .map((slot) => (
                    <Tile key={slot.key} slot={slot} onChanged={reload} width={tileWidth} />
                  ))}
                {Array.from({ length: (cols - (data.filter((s) => s.group === group).length % cols)) % cols }, (_, i) => (
                  <View key={`pad-${i}`} style={{ width: tileWidth }} />
                ))}
              </View>
            </Panel>
          ))}
        </View>
      )}
    </AdminShell>
  );
}
