import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import {
  ActivityIndicator,
  Modal as RNModal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
  type StyleProp,
  type TextInputProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import { Icon, type IconName } from '@/admin/icons';
import { ApiError, assetUrl, uploadImage } from '@/lib/api';
import { fonts } from '@/theme';

export const A = {
  sidebar: '#dcd7ce',
  page: '#f5f2ec',
  card: '#ffffff',
  line: '#e7e2d9',
  field: '#f5f2ec',
  text: '#171717',
  muted: '#6b6862',
  faint: '#a9a49b',
  accent: '#6e252c',
  white: '#ffffff',
} as const;

const TONES = {
  green: { bg: '#cdf5e0', fg: '#1b6b45' },
  yellow: { bg: '#fdf0c1', fg: '#8a6a00' },
  pink: { bg: '#fbd3d8', fg: '#9b2f3b' },
  blue: { bg: '#dbe8ff', fg: '#2a5bb3' },
  grey: { bg: '#ebe7df', fg: '#6b6862' },
} as const;

type TextKind = 'title' | 'heading' | 'body' | 'small' | 'label' | 'tiny' | 'stat';

const KINDS: Record<TextKind, TextStyle> = {
  title: { fontFamily: fonts.display, fontSize: 36, lineHeight: 42 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  stat: { fontFamily: fonts.body, fontSize: 26, lineHeight: 32 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 20 },
  small: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  tiny: { fontFamily: fonts.body, fontSize: 11, lineHeight: 16 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
};

export function AText({ kind = 'body', color = A.text, style, children, numberOfLines }: { kind?: TextKind; color?: string; style?: StyleProp<TextStyle>; children?: ReactNode; numberOfLines?: number }) {
  return (
    <Text numberOfLines={numberOfLines} style={[KINDS[kind], { color }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: A.card, borderRadius: 12, padding: 20 }, style]}>{children}</View>;
}

export function Badge({ tone, label }: { tone: keyof typeof TONES; label: string }) {
  return (
    <View style={{ backgroundColor: TONES[tone].bg, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      <AText kind="small" color={TONES[tone].fg}>
        {label}
      </AText>
    </View>
  );
}

export function statusBadge(status: string) {
  const map: Record<string, { tone: keyof typeof TONES; label: string }> = {
    published: { tone: 'green', label: 'Published' },
    draft: { tone: 'yellow', label: 'Draft' },
    hidden: { tone: 'pink', label: 'Hidden' },
    scheduled: { tone: 'blue', label: 'Scheduled' },
  };
  const entry = map[status] ?? { tone: 'grey' as const, label: status };
  return <Badge tone={entry.tone} label={entry.label} />;
}

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger';

export function Btn({
  label,
  onPress,
  kind = 'primary',
  icon,
  iconRight,
  disabled,
  loading,
  small,
  style,
}: {
  label: string;
  onPress?: () => void;
  kind?: BtnKind;
  icon?: IconName;
  iconRight?: IconName;
  disabled?: boolean;
  loading?: boolean;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const fg = kind === 'primary' ? A.white : kind === 'danger' ? A.accent : kind === 'ghost' ? A.muted : A.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingHorizontal: small ? 14 : 20,
          height: small ? 32 : 40,
          borderRadius: 8,
          backgroundColor: kind === 'primary' ? A.accent : A.white,
          borderWidth: kind === 'primary' ? 0 : 1,
          borderColor: kind === 'ghost' ? 'transparent' : A.line,
          opacity: disabled ? 0.5 : pressed ? 0.8 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon ? <Icon name={icon} size={16} color={fg} /> : null}
      <AText kind="label" color={fg}>
        {label}
      </AText>
      {iconRight ? <Icon name={iconRight} size={16} color={fg} /> : null}
    </Pressable>
  );
}

const noOutline = { outlineStyle: 'none' } as object;

export function Field({
  label,
  required,
  value,
  onChangeText,
  placeholder,
  multiline,
  height,
  error,
  helper,
  secureTextEntry,
  keyboardType,
  autoCapitalize,
  onSubmitEditing,
  trailing,
  tone = 'field',
  editable = true,
}: {
  label?: string;
  required?: boolean;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  multiline?: boolean;
  height?: number;
  error?: string | false;
  helper?: string;
  secureTextEntry?: boolean;
  keyboardType?: TextInputProps['keyboardType'];
  autoCapitalize?: TextInputProps['autoCapitalize'];
  onSubmitEditing?: () => void;
  trailing?: ReactNode;
  tone?: 'field' | 'white';
  editable?: boolean;
}) {
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AText kind="label" color={A.accent}>
          {label}
          {required ? ' *' : ''}
        </AText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          backgroundColor: tone === 'white' ? A.white : A.field,
          borderWidth: 1,
          borderColor: error ? A.accent : A.line,
          borderRadius: 8,
          paddingHorizontal: 12,
          minHeight: multiline ? height : 44,
        }}
      >
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={A.faint}
          multiline={multiline}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? (keyboardType === 'email-address' ? 'none' : 'sentences')}
          onSubmitEditing={onSubmitEditing}
          editable={editable}
          style={[
            {
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 14,
              color: A.text,
              paddingVertical: multiline ? 12 : 0,
              minHeight: multiline ? (height ?? 80) - 2 : 42,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            noOutline,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <AText kind="small" color={A.accent}>
          {error}
        </AText>
      ) : helper ? (
        <AText kind="small" color={A.muted}>
          {helper}
        </AText>
      ) : null}
    </View>
  );
}

export function SelectField({ label, required, value, options, onChange, placeholder, error }: { label?: string; required?: boolean; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string; error?: string | false }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 6, zIndex: open ? 20 : 1 }}>
      {label ? (
        <AText kind="label" color={A.accent}>
          {label}
          {required ? ' *' : ''}
        </AText>
      ) : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: A.field, borderWidth: 1, borderColor: error ? A.accent : A.line, borderRadius: 8, height: 44, paddingHorizontal: 12 }}
      >
        <AText color={value ? A.text : A.faint}>{value || placeholder || 'Select'}</AText>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={A.muted} />
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', top: label ? 74 : 50, left: 0, right: 0, backgroundColor: A.white, borderWidth: 1, borderColor: A.line, borderRadius: 8, paddingVertical: 4, zIndex: 30 }}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={{ paddingHorizontal: 12, paddingVertical: 10 }}
            >
              <AText color={option === value ? A.accent : A.text}>{option}</AText>
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? (
        <AText kind="small" color={A.accent}>
          {error}
        </AText>
      ) : null}
    </View>
  );
}

export function Tabs<K extends string>({ tabs, active, onChange }: { tabs: { key: K; label: string; count?: number }[]; active: K; onChange: (key: K) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 28 }}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable key={tab.key} accessibilityRole="button" accessibilityState={{ selected }} onPress={() => onChange(tab.key)} style={{ paddingVertical: 8, borderBottomWidth: 2, borderBottomColor: selected ? A.text : 'transparent' }}>
            <AText kind="body" color={selected ? A.text : A.muted}>
              {tab.label}
              {tab.count !== undefined ? `  (${tab.count})` : ''}
            </AText>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Modal({ visible, title, onClose, children, width = 560 }: { visible: boolean; title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close dialog" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(23,23,23,0.45)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => undefined} style={{ width: '100%', maxWidth: width, maxHeight: '92%', backgroundColor: A.page, borderRadius: 12 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1, borderBottomColor: A.line }}>
            <AText kind="heading">{title}</AText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10}>
              <Icon name="close" size={18} color={A.muted} />
            </Pressable>
          </View>
          <ScrollView contentContainerStyle={{ padding: 20, gap: 16 }}>{children}</ScrollView>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

export function ConfirmDialog({ visible, title, message, confirmLabel, danger, onConfirm, onCancel }: { visible: boolean; title: string; message: string; confirmLabel: string; danger?: boolean; onConfirm: () => void; onCancel: () => void }) {
  return (
    <Modal visible={visible} title={title} onClose={onCancel} width={440}>
      <AText color={A.muted}>{message}</AText>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 12 }}>
        <Btn label="Cancel" kind="secondary" onPress={onCancel} />
        <Btn label={confirmLabel} kind={danger ? 'danger' : 'primary'} onPress={onConfirm} />
      </View>
    </Modal>
  );
}

export type MenuItem = { label: string; icon?: IconName; danger?: boolean; onPress: () => void; dividerBefore?: boolean };

export function MenuButton({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 40 : 1 }}>
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setOpen((v) => !v)} hitSlop={8} style={{ padding: 4 }}>
        <Icon name="more" size={18} color={A.text} />
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', top: 28, right: 0, minWidth: 190, backgroundColor: A.white, borderRadius: 10, borderWidth: 1, borderColor: A.line, paddingVertical: 6, zIndex: 50 }}>
          {items.map((item) => (
            <View key={item.label}>
              {item.dividerBefore ? <View style={{ height: 1, backgroundColor: A.line, marginVertical: 4 }} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  item.onPress();
                }}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 9 }}
              >
                {item.icon ? <Icon name={item.icon} size={15} color={item.danger ? A.accent : A.muted} /> : null}
                <AText kind="small" color={item.danger ? A.accent : A.text}>
                  {item.label}
                </AText>
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

export function Loading({ error, onRetry, text = 'Loading…' }: { error?: string; onRetry?: () => void; text?: string }) {
  return (
    <View style={{ padding: 40, alignItems: 'center', gap: 12 }}>
      <AText color={error ? A.accent : A.muted}>{error ?? text}</AText>
      {error && onRetry ? <Btn label="Try again" kind="secondary" onPress={onRetry} small /> : null}
    </View>
  );
}

export function Empty({ text }: { text: string }) {
  return (
    <View style={{ padding: 32, alignItems: 'center' }}>
      <AText color={A.muted}>{text}</AText>
    </View>
  );
}

// ---------- toasts ----------

type ToastValue = (message: string, tone?: 'success' | 'error') => void;
const ToastContext = createContext<ToastValue>(() => undefined);
export const useToast = () => useContext(ToastContext);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<{ message: string; tone: 'success' | 'error'; id: number } | null>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = useCallback<ToastValue>((message, tone = 'success') => {
    if (timer.current) clearTimeout(timer.current);
    setToast({ message, tone, id: Date.now() });
    timer.current = setTimeout(() => setToast(null), 3500);
  }, []);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    [],
  );
  const value = useMemo(() => show, [show]);
  return (
    <ToastContext.Provider value={value}>
      {children}
      {toast ? (
        <View pointerEvents="none" style={{ position: 'absolute', left: 0, right: 0, bottom: 24, alignItems: 'center', zIndex: 100 }}>
          <View accessibilityRole="alert" style={{ backgroundColor: toast.tone === 'error' ? A.accent : A.text, paddingHorizontal: 18, paddingVertical: 12, borderRadius: 10, maxWidth: 480 }}>
            <AText kind="body" color={A.white}>
              {toast.message}
            </AText>
          </View>
        </View>
      ) : null}
    </ToastContext.Provider>
  );
}

export const errorText = (err: unknown) => (err instanceof ApiError ? err.message : 'Something went wrong. Please try again.');

// ---------- images ----------

async function pickAndUpload(): Promise<string | null> {
  const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], allowsMultipleSelection: false, quality: 0.85 });
  if (result.canceled || !result.assets[0]) return null;
  const asset = result.assets[0];
  return uploadImage({ uri: asset.uri, name: asset.fileName ?? undefined, type: asset.mimeType ?? undefined, webFile: asset.file ?? null });
}

export function ImageField({
  label,
  value,
  onChange,
  required,
  height = 180,
  emptyText = 'Click to add image',
  fit = 'cover',
  error,
}: {
  label?: string;
  value: string | null;
  onChange: (path: string | null) => void;
  required?: boolean;
  height?: number;
  emptyText?: string;
  fit?: 'cover' | 'contain';
  error?: string | false;
}) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const choose = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const path = await pickAndUpload();
      if (path) onChange(path);
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };
  const uri = assetUrl(value);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AText kind="label" color={A.accent}>
          {label}
          {required ? ' *' : ''}
        </AText>
      ) : null}
      {uri ? (
        <View style={{ gap: 8 }}>
          <View style={{ height, borderRadius: 8, overflow: 'hidden', backgroundColor: A.field }}>
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit={fit} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Btn label={busy ? 'Uploading…' : 'Change'} kind="secondary" small onPress={choose} disabled={busy} />
            <Btn label="Remove" kind="ghost" icon="trash" small onPress={() => onChange(null)} style={{ borderColor: 'transparent' }} />
          </View>
        </View>
      ) : (
        <Pressable accessibilityRole="button" onPress={choose} style={{ height, borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: error ? A.accent : A.line, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center', gap: 8 }}>
          <Icon name="image" size={22} color={A.faint} />
          <AText kind="small" color={A.muted}>
            {busy ? 'Uploading…' : emptyText}
          </AText>
        </Pressable>
      )}
      {error ? (
        <AText kind="small" color={A.accent}>
          {error}
        </AText>
      ) : null}
    </View>
  );
}

/** A grid of images with an add tile, for exhibition galleries and artists' works. */
export function ImageGrid({ values, onChange, columns = 3, tileHeight = 150, addText = 'Click to add upload images' }: { values: string[]; onChange: (paths: string[]) => void; columns?: number; tileHeight?: number; addText?: string }) {
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const add = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const path = await pickAndUpload();
      if (path) onChange([...values, path]);
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };
  const width = `${100 / columns - 1.2}%` as `${number}%`;
  return (
    <View style={{ gap: 12 }}>
      <Pressable accessibilityRole="button" onPress={add} style={{ borderRadius: 8, borderWidth: 1, borderStyle: 'dashed', borderColor: A.line, backgroundColor: A.field, paddingVertical: 20, alignItems: 'center', gap: 6 }}>
        <Icon name="image" size={20} color={A.faint} />
        <AText kind="small" color={A.muted}>
          {busy ? 'Uploading…' : addText}
        </AText>
      </Pressable>
      {values.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {values.map((path, i) => (
            <View key={`${path}-${i}`} style={{ width, height: tileHeight, borderRadius: 8, overflow: 'hidden', backgroundColor: A.field }}>
              <Image source={{ uri: assetUrl(path) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <Pressable accessibilityRole="button" accessibilityLabel="Remove image" onPress={() => onChange(values.filter((_, n) => n !== i))} style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.92)', borderRadius: 12, padding: 4 }}>
                <Icon name="close" size={14} color={A.text} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
