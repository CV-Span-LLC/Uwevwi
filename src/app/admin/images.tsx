import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { View } from 'react-native';

import { Icon } from '@/admin/icons';
import { AdminShell, PageHeader } from '@/admin/shell';
import { A, AText, Btn, Card, Loading, errorText, useToast } from '@/admin/ui';
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
  Home: 'Image used on the homepage.',
  'About Us': 'Image used on the about us page.',
  Advisory: 'Images used on the Advisory page.',
  Stewardship: 'Image used on the Stewardship page.',
  Studio: 'Image used on the Studio page.',
  Research: 'Image used on the Research page',
};

function Tile({ slot, onChanged }: { slot: Slot; onChanged: () => void }) {
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
    <View style={{ flexGrow: 1, flexBasis: 320, flexDirection: 'row', gap: 16, alignItems: 'flex-start' }}>
      <View style={{ width: 182, height: 75, backgroundColor: '#e8e6df', overflow: 'hidden', borderRadius: 4 }}>
        <Image source={source} style={{ width: '100%', height: '100%' }} contentFit="cover" accessibilityLabel={`${slot.group} ${slot.label}`} />
      </View>
      <View style={{ gap: 6, flex: 1 }}>
        <AText kind="small">{slot.label}</AText>
        <AText kind="tiny" color={A.muted}>
          {slot.size}
        </AText>
        <View style={{ flexDirection: 'row', gap: 8, flexWrap: 'wrap' }}>
          <Btn label={busy ? 'Uploading…' : 'Change'} kind="secondary" small onPress={change} disabled={busy} />
          {slot.path ? <Btn label="Reset" kind="ghost" small onPress={reset} /> : null}
        </View>
      </View>
    </View>
  );
}

export default function WebsiteImages() {
  const { data, error, loading, reload } = useRemote(() => adminApi<Slot[]>('/site-images'));
  const groups = data ? [...new Set(data.map((s) => s.group))] : [];

  return (
    <AdminShell title="Website Images" maxWidth={900}>
      <PageHeader title="Website Images" subtitle="Manage the images used across your website. You can replace any image at any time by uploading a new one from your computer." />
      {!data ? (
        <Loading error={error} onRetry={reload} text={loading ? 'Loading images…' : undefined} />
      ) : (
        <View style={{ gap: 12 }}>
          {groups.map((group) => (
            <Card key={group} style={{ gap: 14, padding: 16 }}>
              <View style={{ gap: 2 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                  <Icon name="dashboard" size={15} color={A.muted} />
                  <AText kind="small">{group}</AText>
                </View>
                <AText kind="tiny" color={A.muted} style={{ marginLeft: 23 }}>
                  {DESCRIPTIONS[group]}
                </AText>
              </View>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                {data
                  .filter((s) => s.group === group)
                  .map((slot) => (
                    <Tile key={slot.key} slot={slot} onChanged={reload} />
                  ))}
              </View>
            </Card>
          ))}
        </View>
      )}
    </AdminShell>
  );
}
