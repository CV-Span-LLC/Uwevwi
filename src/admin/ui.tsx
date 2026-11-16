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

/** Design tokens for the admin console. Light surfaces, one dark navigation rail, a single burgundy accent. */
export const A = {
  /** Dark navigation rail. */
  sidebar: '#1d1c1a',
  sidebarLine: '#34312d',
  sidebarText: '#a8a39a',
  page: '#f7f6f3',
  card: '#ffffff',
  line: '#e9e6df',
  lineStrong: '#d6d1c6',
  /** Quiet fill for inputs' disabled state, table headers and wells. */
  field: '#f4f2ee',
  text: '#1a1918',
  muted: '#6b6862',
  faint: '#a29d93',
  accent: '#6e252c',
  accentSoft: '#f6ecec',
  signal: '#e4492f',
  white: '#ffffff',
} as const;

const SHADOW_SM = '0 1px 2px rgba(23,23,23,0.04)';
const SHADOW_MD = '0 8px 24px rgba(23,23,23,0.10), 0 2px 6px rgba(23,23,23,0.06)';
export const shadowMd = SHADOW_MD;

const TONES = {
  green: { bg: '#e7f4ec', fg: '#1d6a43', dot: '#2f9e66' },
  yellow: { bg: '#fbf3dc', fg: '#8a6a00', dot: '#d9a400' },
  pink: { bg: '#fbe9e9', fg: '#9b2f3b', dot: '#d9485a' },
  blue: { bg: '#e8effc', fg: '#2a5bb3', dot: '#4b82e0' },
  grey: { bg: '#eeebe5', fg: '#6b6862', dot: '#a29d93' },
} as const;

type TextKind = 'title' | 'heading' | 'body' | 'small' | 'label' | 'tiny' | 'stat' | 'eyebrow';

const KINDS: Record<TextKind, TextStyle> = {
  title: { fontFamily: fonts.display, fontSize: 34, lineHeight: 40 },
  heading: { fontFamily: fonts.display, fontSize: 22, lineHeight: 28 },
  stat: { fontFamily: fonts.bodyMedium, fontSize: 30, lineHeight: 34, letterSpacing: -0.5 },
  body: { fontFamily: fonts.body, fontSize: 14, lineHeight: 21 },
  small: { fontFamily: fonts.body, fontSize: 13, lineHeight: 19 },
  tiny: { fontFamily: fonts.body, fontSize: 12, lineHeight: 17 },
  label: { fontFamily: fonts.bodyMedium, fontSize: 13, lineHeight: 18 },
  eyebrow: { fontFamily: fonts.monoMedium, fontSize: 11, lineHeight: 16, letterSpacing: 0.8, textTransform: 'uppercase' },
};

export function AText({ kind = 'body', color = A.text, style, children, numberOfLines }: { kind?: TextKind; color?: string; style?: StyleProp<TextStyle>; children?: ReactNode; numberOfLines?: number }) {
  return (
    <Text numberOfLines={numberOfLines} style={[KINDS[kind], { color }, style]}>
      {children}
    </Text>
  );
}

export function Card({ children, style }: { children: ReactNode; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ backgroundColor: A.card, borderRadius: 12, padding: 20, borderWidth: 1, borderColor: A.line, boxShadow: SHADOW_SM }, style]}>{children}</View>;
}

/** Card with a title row (title, optional subtitle and right-hand action) over its content. */
export function Panel({ title, subtitle, action, children, style, padded = true }: { title: string; subtitle?: string; action?: ReactNode; children: ReactNode; style?: StyleProp<ViewStyle>; padded?: boolean }) {
  return (
    <Card style={[{ padding: 0, overflow: 'visible' }, style]}>
      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: 20, paddingTop: 18, paddingBottom: 14 }}>
        <View style={{ flexShrink: 1, gap: 2 }}>
          <AText kind="label" style={{ fontSize: 14 }}>
            {title}
          </AText>
          {subtitle ? (
            <AText kind="tiny" color={A.muted}>
              {subtitle}
            </AText>
          ) : null}
        </View>
        {action}
      </View>
      <View style={{ borderTopWidth: 1, borderTopColor: A.line, padding: padded ? 20 : 0 }}>{children}</View>
    </Card>
  );
}

export function Badge({ tone, label, dot = true }: { tone: keyof typeof TONES; label: string; dot?: boolean }) {
  const t = TONES[tone];
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: t.bg, borderRadius: 100, paddingHorizontal: 10, paddingVertical: 3, alignSelf: 'flex-start' }}>
      {dot ? <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: t.dot }} /> : null}
      <AText kind="tiny" color={t.fg} style={{ fontFamily: fonts.bodyMedium }}>
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

export function Avatar({ name, size = 36, tone = 'ink' }: { name: string; size?: number; tone?: 'ink' | 'accent' | 'soft' }) {
  const initials = name.split(/\s+/).filter(Boolean).slice(0, 2).map((p) => p[0]?.toUpperCase()).join('') || '?';
  const bg = tone === 'accent' ? A.accent : tone === 'soft' ? A.accentSoft : A.sidebar;
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: bg, alignItems: 'center', justifyContent: 'center' }}>
      <AText color={tone === 'soft' ? A.accent : A.white} style={{ fontFamily: fonts.bodyMedium, fontSize: size * 0.36, lineHeight: size * 0.46 }}>
        {initials}
      </AText>
    </View>
  );
}

type BtnKind = 'primary' | 'secondary' | 'ghost' | 'danger' | 'dark';

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
  const fg = kind === 'primary' || kind === 'dark' ? A.white : kind === 'danger' ? A.accent : kind === 'ghost' ? A.muted : A.text;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed, hovered }: { pressed: boolean; hovered?: boolean }) => [
        {
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 7,
          paddingHorizontal: small ? 12 : 16,
          height: small ? 32 : 38,
          borderRadius: 8,
          backgroundColor:
            kind === 'primary' ? (hovered ? '#5a1d24' : A.accent) : kind === 'dark' ? (hovered ? '#34312d' : A.sidebar) : kind === 'ghost' ? (hovered ? A.field : 'transparent') : kind === 'danger' ? (hovered ? A.accentSoft : A.white) : hovered ? A.field : A.white,
          borderWidth: kind === 'primary' || kind === 'dark' || kind === 'ghost' ? 0 : 1,
          borderColor: kind === 'danger' ? '#e8cfd1' : A.lineStrong,
          opacity: disabled ? 0.5 : pressed ? 0.85 : 1,
        },
        style,
      ]}
    >
      {loading ? <ActivityIndicator size="small" color={fg} /> : icon ? <Icon name={icon} size={small ? 14 : 16} color={fg} /> : null}
      <AText kind="label" color={fg} style={small ? { fontSize: 12 } : null}>
        {label}
      </AText>
      {iconRight ? <Icon name={iconRight} size={small ? 14 : 16} color={fg} /> : null}
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
  leading,
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
  leading?: ReactNode;
  /** Kept so older call sites still compile; fields are always white now. */
  tone?: 'field' | 'white';
  editable?: boolean;
}) {
  const [focused, setFocused] = useState(false);
  return (
    <View style={{ gap: 6 }}>
      {label ? (
        <AText kind="label">
          {label}
          {required ? <AText kind="label" color={A.accent}> *</AText> : null}
        </AText>
      ) : null}
      <View
        style={{
          flexDirection: 'row',
          alignItems: multiline ? 'flex-start' : 'center',
          gap: 8,
          backgroundColor: editable ? A.white : A.field,
          borderWidth: 1,
          borderColor: error ? A.accent : focused ? A.text : A.lineStrong,
          borderRadius: 8,
          paddingHorizontal: 12,
          minHeight: multiline ? height : 42,
          boxShadow: focused ? '0 0 0 3px rgba(110,37,44,0.10)' : undefined,
        }}
      >
        {leading}
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
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          editable={editable}
          style={[
            {
              flex: 1,
              fontFamily: fonts.body,
              fontSize: 14,
              color: A.text,
              paddingVertical: multiline ? 11 : 0,
              minHeight: multiline ? (height ?? 80) - 2 : 40,
              textAlignVertical: multiline ? 'top' : 'center',
            },
            noOutline,
          ]}
        />
        {trailing}
      </View>
      {error ? (
        <AText kind="tiny" color={A.accent}>
          {error}
        </AText>
      ) : helper ? (
        <AText kind="tiny" color={A.muted}>
          {helper}
        </AText>
      ) : null}
    </View>
  );
}

/** Compact search input used in list toolbars. */
export function SearchField({ value, onChangeText, placeholder = 'Search…', width = 260 }: { value: string; onChangeText: (v: string) => void; placeholder?: string; width?: number | `${number}%` }) {
  return (
    <View style={{ width, maxWidth: '100%' }}>
      <Field value={value} onChangeText={onChangeText} placeholder={placeholder} leading={<Icon name="search" size={15} color={A.faint} />} trailing={value ? <Pressable accessibilityRole="button" accessibilityLabel="Clear search" onPress={() => onChangeText('')} hitSlop={8}><Icon name="close" size={14} color={A.muted} /></Pressable> : null} />
    </View>
  );
}

/** Invisible layer that closes a popover when anything outside it is pressed. */
export function DismissLayer({ onDismiss }: { onDismiss: () => void }) {
  return <Pressable accessibilityLabel="Close menu" onPress={onDismiss} style={{ position: 'absolute', top: -3000, left: -3000, right: -3000, bottom: -3000, zIndex: 0 }} />;
}

export function SelectField({ label, required, value, options, onChange, placeholder, error }: { label?: string; required?: boolean; value: string; options: string[]; onChange: (v: string) => void; placeholder?: string; error?: string | false }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ gap: 6, zIndex: open ? 20 : 1 }}>
      {label ? (
        <AText kind="label">
          {label}
          {required ? <AText kind="label" color={A.accent}> *</AText> : null}
        </AText>
      ) : null}
      {open ? <DismissLayer onDismiss={() => setOpen(false)} /> : null}
      <Pressable
        accessibilityRole="button"
        onPress={() => setOpen((v) => !v)}
        style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: A.white, borderWidth: 1, borderColor: error ? A.accent : open ? A.text : A.lineStrong, borderRadius: 8, height: 42, paddingHorizontal: 12, zIndex: 1 }}
      >
        <AText color={value ? A.text : A.faint}>{value || placeholder || 'Select'}</AText>
        <Icon name={open ? 'chevron-up' : 'chevron-down'} size={16} color={A.muted} />
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', top: label ? 72 : 48, left: 0, right: 0, backgroundColor: A.white, borderWidth: 1, borderColor: A.line, borderRadius: 10, padding: 4, zIndex: 30, boxShadow: SHADOW_MD }}>
          {options.map((option) => (
            <Pressable
              key={option}
              accessibilityRole="button"
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 9, borderRadius: 6, backgroundColor: hovered ? A.field : 'transparent' })}
            >
              <AText color={option === value ? A.accent : A.text}>{option}</AText>
              {option === value ? <Icon name="check" size={15} color={A.accent} /> : null}
            </Pressable>
          ))}
        </View>
      ) : null}
      {error ? (
        <AText kind="tiny" color={A.accent}>
          {error}
        </AText>
      ) : null}
    </View>
  );
}

/** Pill tabs with counts. */
export function Tabs<K extends string>({ tabs, active, onChange }: { tabs: { key: K; label: string; count?: number }[]; active: K; onChange: (key: K) => void }) {
  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6 }}>
      {tabs.map((tab) => {
        const selected = tab.key === active;
        return (
          <Pressable
            key={tab.key}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            onPress={() => onChange(tab.key)}
            style={({ hovered }: { hovered?: boolean }) => ({
              flexDirection: 'row',
              alignItems: 'center',
              gap: 8,
              paddingHorizontal: 12,
              height: 32,
              borderRadius: 100,
              backgroundColor: selected ? A.sidebar : hovered ? A.field : 'transparent',
            })}
          >
            <AText kind="label" color={selected ? A.white : A.muted} style={{ fontSize: 13 }}>
              {tab.label}
            </AText>
            {tab.count !== undefined ? (
              <View style={{ minWidth: 20, paddingHorizontal: 6, height: 18, borderRadius: 9, backgroundColor: selected ? 'rgba(255,255,255,0.16)' : A.field, alignItems: 'center', justifyContent: 'center' }}>
                <AText kind="tiny" color={selected ? A.white : A.muted} style={{ fontSize: 11, lineHeight: 14 }}>
                  {tab.count}
                </AText>
              </View>
            ) : null}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

export function Modal({ visible, title, onClose, children, width = 560 }: { visible: boolean; title: string; onClose: () => void; children: ReactNode; width?: number }) {
  return (
    <RNModal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close dialog" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(23,22,20,0.5)', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
        <Pressable onPress={() => undefined} style={{ width: '100%', maxWidth: width, maxHeight: '92%', backgroundColor: A.white, borderRadius: 14, boxShadow: SHADOW_MD, overflow: 'hidden' }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: A.line }}>
            <AText kind="label" style={{ fontSize: 15 }}>
              {title}
            </AText>
            <Pressable accessibilityRole="button" accessibilityLabel="Close" onPress={onClose} hitSlop={10} style={({ hovered }: { hovered?: boolean }) => ({ padding: 6, borderRadius: 6, backgroundColor: hovered ? A.field : 'transparent' })}>
              <Icon name="close" size={16} color={A.muted} />
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
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
        <Btn label="Cancel" kind="secondary" onPress={onCancel} />
        <Btn label={confirmLabel} kind={danger ? 'primary' : 'dark'} onPress={onConfirm} />
      </View>
    </Modal>
  );
}

export type MenuItem = { label: string; icon?: IconName; danger?: boolean; onPress: () => void; dividerBefore?: boolean };

export function MenuButton({ items, label = 'More actions' }: { items: MenuItem[]; label?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <View style={{ zIndex: open ? 40 : 1 }}>
      {open ? <DismissLayer onDismiss={() => setOpen(false)} /> : null}
      <Pressable accessibilityRole="button" accessibilityLabel={label} onPress={() => setOpen((v) => !v)} hitSlop={6} style={({ hovered }: { hovered?: boolean }) => ({ width: 32, height: 32, borderRadius: 8, alignItems: 'center', justifyContent: 'center', backgroundColor: open || hovered ? A.field : 'transparent', zIndex: 1 })}>
        <Icon name="more" size={17} color={A.text} />
      </Pressable>
      {open ? (
        <View style={{ position: 'absolute', top: 36, right: 0, minWidth: 200, backgroundColor: A.white, borderRadius: 10, borderWidth: 1, borderColor: A.line, padding: 4, zIndex: 50, boxShadow: SHADOW_MD }}>
          {items.map((item) => (
            <View key={item.label}>
              {item.dividerBefore ? <View style={{ height: 1, backgroundColor: A.line, marginVertical: 4 }} /> : null}
              <Pressable
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  item.onPress();
                }}
                style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 6, backgroundColor: hovered ? (item.danger ? A.accentSoft : A.field) : 'transparent' })}
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

/** Loading and error states for a whole screen: skeleton blocks while loading, a retry card on failure. */
export function Loading({ error, onRetry, text = 'Loading…' }: { error?: string; onRetry?: () => void; text?: string }) {
  if (error) {
    return (
      <Card style={{ alignItems: 'center', gap: 12, paddingVertical: 36 }}>
        <View style={{ width: 40, height: 40, borderRadius: 20, backgroundColor: A.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
          <Icon name="alert" size={20} color={A.accent} />
        </View>
        <AText color={A.accent}>{error}</AText>
        {onRetry ? <Btn label="Try again" kind="secondary" onPress={onRetry} small /> : null}
      </Card>
    );
  }
  return (
    <View accessibilityLabel={text} style={{ gap: 12 }}>
      {[0, 1, 2].map((i) => (
        <View key={i} style={{ height: i === 0 ? 96 : 64, borderRadius: 12, backgroundColor: A.line, opacity: 0.55 }} />
      ))}
    </View>
  );
}

export function Empty({ text, icon = 'inbox', action }: { text: string; icon?: IconName; action?: ReactNode }) {
  return (
    <View style={{ paddingVertical: 44, paddingHorizontal: 20, alignItems: 'center', gap: 12 }}>
      <View style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center' }}>
        <Icon name={icon} size={20} color={A.faint} />
      </View>
      <AText color={A.muted} style={{ textAlign: 'center', maxWidth: 360 }}>
        {text}
      </AText>
      {action}
    </View>
  );
}

/** Headline figure with a label and an optional supporting line. */
export function StatCard({ icon, label, value, hint, href, tone = 'neutral', onPress }: { icon: IconName; label: string; value: string | number; hint?: string; href?: string; tone?: 'neutral' | 'alert'; onPress?: () => void }) {
  const alert = tone === 'alert';
  return (
    <Pressable accessibilityRole={onPress ? 'link' : undefined} onPress={onPress} disabled={!onPress} style={{ flexGrow: 1, flexBasis: 200 }}>
      {({ hovered }: { hovered?: boolean }) => (
        <Card style={{ gap: 14, padding: 18, borderColor: hovered && onPress ? A.lineStrong : A.line }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
            <AText kind="eyebrow" color={A.muted}>
              {label}
            </AText>
            <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: alert ? A.accentSoft : A.field, alignItems: 'center', justifyContent: 'center' }}>
              <Icon name={icon} size={15} color={alert ? A.accent : A.text} />
            </View>
          </View>
          <AText kind="stat" color={alert ? A.accent : A.text}>
            {value}
          </AText>
          {hint ? (
            <AText kind="tiny" color={A.muted}>
              {hint}
            </AText>
          ) : null}
        </Card>
      )}
    </Pressable>
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
          <View accessibilityRole="alert" style={{ flexDirection: 'row', alignItems: 'center', gap: 10, backgroundColor: A.sidebar, paddingHorizontal: 16, paddingVertical: 12, borderRadius: 10, maxWidth: 480, boxShadow: SHADOW_MD }}>
            <Icon name={toast.tone === 'error' ? 'alert' : 'check-circle'} size={16} color={toast.tone === 'error' ? '#ff8a78' : '#5fd39a'} />
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

export async function pickAndUpload(): Promise<string | null> {
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
    <View style={{ gap: 8 }}>
      {label ? (
        <AText kind="label">
          {label}
          {required ? <AText kind="label" color={A.accent}> *</AText> : null}
        </AText>
      ) : null}
      {uri ? (
        <View style={{ gap: 10 }}>
          <View style={{ height, borderRadius: 10, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
            <Image source={{ uri }} style={{ width: '100%', height: '100%' }} contentFit={fit} />
          </View>
          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Btn label={busy ? 'Uploading…' : 'Replace'} kind="secondary" small icon="image" onPress={choose} disabled={busy} />
            <Btn label="Remove" kind="ghost" icon="trash" small onPress={() => onChange(null)} />
          </View>
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={choose}
          style={({ hovered }: { hovered?: boolean }) => ({ height, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: error ? A.accent : hovered ? A.text : A.lineStrong, backgroundColor: hovered ? A.field : A.white, alignItems: 'center', justifyContent: 'center', gap: 8 })}
        >
          <View style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={18} color={A.muted} />
          </View>
          <AText kind="small" color={A.muted}>
            {busy ? 'Uploading…' : emptyText}
          </AText>
        </Pressable>
      )}
      {error ? (
        <AText kind="tiny" color={A.accent}>
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
      <Pressable
        accessibilityRole="button"
        onPress={add}
        style={({ hovered }: { hovered?: boolean }) => ({ borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: hovered ? A.text : A.lineStrong, backgroundColor: hovered ? A.field : A.white, paddingVertical: 20, alignItems: 'center', gap: 6 })}
      >
        <Icon name="image" size={20} color={A.faint} />
        <AText kind="small" color={A.muted}>
          {busy ? 'Uploading…' : addText}
        </AText>
      </Pressable>
      {values.length > 0 ? (
        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
          {values.map((path, i) => (
            <View key={`${path}-${i}`} style={{ width, height: tileHeight, borderRadius: 10, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
              <Image source={{ uri: assetUrl(path) }} style={{ width: '100%', height: '100%' }} contentFit="cover" />
              <Pressable accessibilityRole="button" accessibilityLabel="Remove image" onPress={() => onChange(values.filter((_, n) => n !== i))} style={{ position: 'absolute', top: 6, right: 6, backgroundColor: 'rgba(255,255,255,0.94)', borderRadius: 12, padding: 5 }}>
                <Icon name="close" size={13} color={A.text} />
              </Pressable>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}
