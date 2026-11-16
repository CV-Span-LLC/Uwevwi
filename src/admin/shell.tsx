import { Image } from 'expo-image';
import { Link, router, usePathname, type Href } from 'expo-router';
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { Modal as RNModal, Platform, Pressable, ScrollView, TextInput, View, useWindowDimensions } from 'react-native';

import { useAuth } from '@/admin/auth';
import { Icon, type IconName } from '@/admin/icons';
import { A, AText, Avatar, DismissLayer, ToastProvider, shadowMd } from '@/admin/ui';
import { adminApi, type Exhibition, type ResearchSummary } from '@/lib/api';
import { useRemote } from '@/lib/use-remote';
import { fonts } from '@/theme';

const LOGO_MARK = require('../../assets/figma/logo-mark.svg');
const LOGO_TEXT = require('../../assets/figma/logo-text.svg');

type Counts = { fresh: number; enquiries: number };

type NavItem = { label: string; href: Href; match: string; icon: IconName; exact?: boolean; badge?: keyof Counts };
const GROUPS: { title?: string; items: NavItem[] }[] = [
  { items: [{ label: 'Dashboard', href: '/admin', match: '/admin', icon: 'dashboard', exact: true }] },
  {
    title: 'Content',
    items: [
      { label: 'Research', href: '/admin/research', match: '/admin/research', icon: 'research' },
      { label: 'Exhibitions', href: '/admin/exhibition', match: '/admin/exhibition', icon: 'exhibition' },
    ],
  },
  { title: 'Website', items: [{ label: 'Website images', href: '/admin/images', match: '/admin/images', icon: 'images' }] },
  {
    title: 'Engagement',
    items: [
      { label: 'Comments', href: '/admin/comments', match: '/admin/comments', icon: 'comments', badge: 'fresh' },
      { label: 'Enquiries', href: '/admin/enquiries', match: '/admin/enquiries', icon: 'mail', badge: 'enquiries' },
    ],
  },
];

const SIDEBAR = 244;
const TOPBAR = 60;

function Sidebar({ counts, onNavigate }: { counts: Counts; onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <View style={{ width: SIDEBAR, backgroundColor: A.sidebar, height: '100%' }}>
      <View style={{ height: TOPBAR, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 1, borderBottomColor: A.sidebarLine }}>
        <Link href="/admin" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Uwevwi admin home" onPress={onNavigate} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={LOGO_MARK} tintColor={A.white} style={{ width: 26, height: 26 }} contentFit="contain" />
            <Image source={LOGO_TEXT} tintColor={A.white} style={{ width: 96, height: 22.5 }} contentFit="contain" />
          </Pressable>
        </Link>
      </View>

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 18, paddingBottom: 12, paddingHorizontal: 12, gap: 4 }}>
        {GROUPS.map((group, gi) => (
          <View key={gi} style={{ gap: 2, marginBottom: 10 }}>
            {group.title ? (
              <AText kind="eyebrow" color="#6f6a63" style={{ paddingHorizontal: 10, paddingVertical: 8 }}>
                {group.title}
              </AText>
            ) : null}
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.match : pathname === item.match || pathname.startsWith(`${item.match}/`);
              const count = item.badge ? counts[item.badge] : 0;
              return (
                <Link key={item.label} href={item.href} asChild>
                  <Pressable accessibilityRole="link" accessibilityState={{ selected: active }} onPress={onNavigate}>
                    {({ hovered }: { hovered?: boolean }) => (
                      <View
                        style={{
                          flexDirection: 'row',
                          alignItems: 'center',
                          gap: 11,
                          paddingHorizontal: 10,
                          height: 38,
                          borderRadius: 8,
                          backgroundColor: active ? 'rgba(255,255,255,0.09)' : hovered ? 'rgba(255,255,255,0.05)' : 'transparent',
                        }}
                      >
                        <Icon name={item.icon} size={17} color={active ? A.white : A.sidebarText} />
                        <AText kind="label" color={active ? A.white : A.sidebarText} style={{ flex: 1, fontSize: 13.5 }}>
                          {item.label}
                        </AText>
                        {count > 0 ? (
                          <View style={{ minWidth: 20, height: 20, borderRadius: 10, paddingHorizontal: 6, backgroundColor: A.signal, alignItems: 'center', justifyContent: 'center' }}>
                            <AText kind="tiny" color={A.white} style={{ fontSize: 11, lineHeight: 14 }}>
                              {count > 99 ? '99+' : count}
                            </AText>
                          </View>
                        ) : null}
                        {active ? <View style={{ position: 'absolute', left: -12, top: 9, bottom: 9, width: 3, borderRadius: 2, backgroundColor: A.signal }} /> : null}
                      </View>
                    )}
                  </Pressable>
                </Link>
              );
            })}
          </View>
        ))}
      </ScrollView>

      <View style={{ padding: 12, gap: 6, borderTopWidth: 1, borderTopColor: A.sidebarLine }}>
        <Pressable
          accessibilityRole="link"
          onPress={() => {
            onNavigate?.();
            router.push('/');
          }}
          style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 11, paddingHorizontal: 10, height: 38, borderRadius: 8, backgroundColor: hovered ? 'rgba(255,255,255,0.05)' : 'transparent' })}
        >
          <Icon name="globe" size={17} color={A.sidebarText} />
          <AText kind="label" color={A.sidebarText} style={{ flex: 1, fontSize: 13.5 }}>
            View website
          </AText>
          <Icon name="external" size={14} color="#6f6a63" />
        </Pressable>
        <View style={{ zIndex: 5 }}>
          {menuOpen ? <DismissLayer onDismiss={() => setMenuOpen(false)} /> : null}
          {menuOpen ? (
            <View style={{ position: 'absolute', bottom: 56, left: 0, right: 0, backgroundColor: A.white, borderRadius: 10, padding: 4, boxShadow: shadowMd, zIndex: 10 }}>
              <Pressable
                accessibilityRole="button"
                onPress={signOut}
                style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 6, backgroundColor: hovered ? A.accentSoft : 'transparent' })}
              >
                <Icon name="logout" size={15} color={A.accent} />
                <AText kind="small" color={A.accent}>
                  Sign out
                </AText>
              </Pressable>
            </View>
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Account menu"
            onPress={() => setMenuOpen((v) => !v)}
            style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 8, borderRadius: 10, backgroundColor: menuOpen || hovered ? 'rgba(255,255,255,0.07)' : 'transparent', zIndex: 1 })}
          >
            <Avatar name={admin?.name ?? 'Admin'} size={34} tone="accent" />
            <View style={{ flex: 1 }}>
              <AText kind="label" color={A.white} numberOfLines={1} style={{ fontSize: 13 }}>
                {admin?.name ?? 'Admin'}
              </AText>
              <AText kind="tiny" color={A.sidebarText} numberOfLines={1}>
                {admin?.email ?? ''}
              </AText>
            </View>
            <Icon name={menuOpen ? 'chevron-down' : 'chevron-up'} size={15} color={A.sidebarText} />
          </Pressable>
        </View>
      </View>
    </View>
  );
}

// ---------------------------------------------------------------- command palette

type Command = { id: string; group: string; label: string; hint?: string; icon: IconName; href: Href };

const PAGE_COMMANDS: Command[] = [
  { id: 'p-dashboard', group: 'Go to', label: 'Dashboard', icon: 'dashboard', href: '/admin' },
  { id: 'p-research', group: 'Go to', label: 'Research', icon: 'research', href: '/admin/research' },
  { id: 'p-exhibition', group: 'Go to', label: 'Exhibitions', icon: 'exhibition', href: '/admin/exhibition' },
  { id: 'p-images', group: 'Go to', label: 'Website images', icon: 'images', href: '/admin/images' },
  { id: 'p-comments', group: 'Go to', label: 'Comments', icon: 'comments', href: '/admin/comments' },
  { id: 'p-enquiries', group: 'Go to', label: 'Enquiries', icon: 'mail', href: '/admin/enquiries' },
  { id: 'a-new-research', group: 'Create', label: 'New research', hint: 'Write an article, journal or commission', icon: 'plus', href: '/admin/research/new' },
  { id: 'a-new-exhibition', group: 'Create', label: 'New exhibition', hint: 'Add an exhibition to Studios', icon: 'plus', href: '/admin/exhibition/new' },
  { id: 'a-site', group: 'Website', label: 'View website', hint: 'Open the public site', icon: 'globe', href: '/' },
];

function CommandPalette({ onClose }: { onClose: () => void }) {
  const research = useRemote(() => adminApi<ResearchSummary[]>('/research'));
  const exhibitions = useRemote(() => adminApi<Exhibition[]>('/exhibitions'));
  const [query, setQuery] = useState('');
  const [index, setIndex] = useState(0);

  const results = useMemo(() => {
    const content: Command[] = [
      ...(research.data ?? []).map((r) => ({ id: `r-${r.id}`, group: 'Research', label: r.title, hint: r.type, icon: 'research' as const, href: { pathname: '/admin/research/[id]', params: { id: r.id } } as Href })),
      ...(exhibitions.data ?? []).map((e) => ({ id: `e-${e.id}`, group: 'Exhibitions', label: e.title, hint: e.series || 'Exhibition', icon: 'exhibition' as const, href: { pathname: '/admin/exhibition/[id]', params: { id: e.id } } as Href })),
    ];
    const q = query.trim().toLowerCase();
    const all = [...PAGE_COMMANDS, ...content];
    return (q ? all.filter((c) => c.label.toLowerCase().includes(q) || c.hint?.toLowerCase().includes(q)) : [...PAGE_COMMANDS, ...content.slice(0, 4)]).slice(0, 12);
  }, [query, research.data, exhibitions.data]);

  const active = Math.min(index, Math.max(results.length - 1, 0));
  const go = (c: Command) => {
    onClose();
    router.push(c.href);
  };

  return (
    <RNModal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable accessibilityLabel="Close search" onPress={onClose} style={{ flex: 1, backgroundColor: 'rgba(23,22,20,0.5)', alignItems: 'center', paddingTop: '12%', paddingHorizontal: 16 }}>
        <Pressable onPress={() => undefined} style={{ width: '100%', maxWidth: 620, backgroundColor: A.white, borderRadius: 14, overflow: 'hidden', boxShadow: shadowMd }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 18, height: 56, borderBottomWidth: 1, borderBottomColor: A.line }}>
            <Icon name="search" size={18} color={A.muted} />
            <TextInput
              autoFocus
              value={query}
              onChangeText={(v) => {
                setQuery(v);
                setIndex(0);
              }}
              placeholder="Search pages, research and exhibitions…"
              placeholderTextColor={A.faint}
              onKeyPress={(e) => {
                const key = e.nativeEvent.key;
                if (key === 'ArrowDown') setIndex(Math.min(active + 1, results.length - 1));
                else if (key === 'ArrowUp') setIndex(Math.max(active - 1, 0));
                else if (key === 'Enter' && results[active]) go(results[active]);
                else if (key === 'Escape') onClose();
              }}
              style={[{ flex: 1, fontFamily: fonts.body, fontSize: 15, color: A.text }, { outlineStyle: 'none' } as object]}
            />
            <View style={{ borderWidth: 1, borderColor: A.lineStrong, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2 }}>
              <AText kind="tiny" color={A.muted} style={{ fontFamily: fonts.mono }}>
                esc
              </AText>
            </View>
          </View>
          <ScrollView style={{ maxHeight: 420 }} contentContainerStyle={{ padding: 8 }} keyboardShouldPersistTaps="handled">
            {results.length === 0 ? (
              <AText color={A.muted} style={{ padding: 20, textAlign: 'center' }}>
                {research.loading || exhibitions.loading ? 'Searching…' : 'Nothing matches your search.'}
              </AText>
            ) : null}
            {results.map((c, i) => (
              <View key={c.id}>
                {i === 0 || results[i - 1].group !== c.group ? (
                  <AText kind="eyebrow" color={A.faint} style={{ paddingHorizontal: 10, paddingTop: i === 0 ? 4 : 12, paddingBottom: 6 }}>
                    {c.group}
                  </AText>
                ) : null}
                <Pressable
                  accessibilityRole="button"
                  onPress={() => go(c)}
                  onHoverIn={() => setIndex(i)}
                  style={{ flexDirection: 'row', alignItems: 'center', gap: 12, paddingHorizontal: 10, paddingVertical: 9, borderRadius: 8, backgroundColor: i === active ? A.field : 'transparent' }}
                >
                  <View style={{ width: 30, height: 30, borderRadius: 8, backgroundColor: i === active ? A.white : A.field, alignItems: 'center', justifyContent: 'center' }}>
                    <Icon name={c.icon} size={15} color={A.text} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AText kind="label" numberOfLines={1}>
                      {c.label}
                    </AText>
                    {c.hint ? (
                      <AText kind="tiny" color={A.muted} numberOfLines={1}>
                        {c.hint}
                      </AText>
                    ) : null}
                  </View>
                  {i === active ? <Icon name="arrow-right" size={15} color={A.muted} /> : null}
                </Pressable>
              </View>
            ))}
          </ScrollView>
          <View style={{ flexDirection: 'row', gap: 16, paddingHorizontal: 18, paddingVertical: 10, borderTopWidth: 1, borderTopColor: A.line, backgroundColor: A.field }}>
            <AText kind="tiny" color={A.muted}>
              ↑ ↓ to move
            </AText>
            <AText kind="tiny" color={A.muted}>
              ↵ to open
            </AText>
          </View>
        </Pressable>
      </Pressable>
    </RNModal>
  );
}

// ---------------------------------------------------------------- top bar

function IconButton({ icon, label, onPress, badge }: { icon: IconName; label: string; onPress: () => void; badge?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => ({ width: 38, height: 38, borderRadius: 9, alignItems: 'center', justifyContent: 'center', backgroundColor: hovered ? A.field : 'transparent' })}
    >
      <Icon name={icon} size={18} color={A.text} />
      {badge ? <View style={{ position: 'absolute', top: 8, right: 9, width: 8, height: 8, borderRadius: 4, backgroundColor: A.signal, borderWidth: 1.5, borderColor: A.white }} /> : null}
    </Pressable>
  );
}

function MenuPanel({ children, width = 280 }: { children: ReactNode; width?: number }) {
  return <View style={{ position: 'absolute', top: 44, right: 0, width, backgroundColor: A.white, borderRadius: 12, borderWidth: 1, borderColor: A.line, boxShadow: shadowMd, zIndex: 60, overflow: 'hidden' }}>{children}</View>;
}

function NewMenu() {
  const [open, setOpen] = useState(false);
  const items: { label: string; icon: IconName; href: Href }[] = [
    { label: 'New research', icon: 'research', href: '/admin/research/new' },
    { label: 'New exhibition', icon: 'exhibition', href: '/admin/exhibition/new' },
  ];
  return (
    <View style={{ zIndex: open ? 50 : 1 }}>
      {open ? <DismissLayer onDismiss={() => setOpen(false)} /> : null}
      <Pressable
        accessibilityRole="button"
        accessibilityLabel="Create new"
        onPress={() => setOpen((v) => !v)}
        style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, height: 36, paddingHorizontal: 12, borderRadius: 9, backgroundColor: hovered ? '#5a1d24' : A.accent, zIndex: 1 })}
      >
        <Icon name="plus" size={15} color={A.white} />
        <AText kind="label" color={A.white}>
          New
        </AText>
      </Pressable>
      {open ? (
        <MenuPanel width={210}>
          <View style={{ padding: 4 }}>
            {items.map((item) => (
              <Pressable
                key={item.label}
                accessibilityRole="button"
                onPress={() => {
                  setOpen(false);
                  router.push(item.href);
                }}
                style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 10, paddingVertical: 10, borderRadius: 7, backgroundColor: hovered ? A.field : 'transparent' })}
              >
                <Icon name={item.icon} size={16} color={A.muted} />
                <AText kind="small">{item.label}</AText>
              </Pressable>
            ))}
          </View>
        </MenuPanel>
      ) : null}
    </View>
  );
}

function Bell({ counts }: { counts: Counts }) {
  const [open, setOpen] = useState(false);
  const total = counts.fresh + counts.enquiries;
  const rows: { label: string; count: number; icon: IconName; href: Href }[] = [
    { label: counts.fresh === 1 ? 'new comment to review' : 'new comments to review', count: counts.fresh, icon: 'comments', href: '/admin/comments' },
    { label: counts.enquiries === 1 ? 'unread enquiry' : 'unread enquiries', count: counts.enquiries, icon: 'mail', href: '/admin/enquiries' },
  ];
  return (
    <View style={{ zIndex: open ? 50 : 1 }}>
      {open ? <DismissLayer onDismiss={() => setOpen(false)} /> : null}
      <View style={{ zIndex: 1 }}>
        <IconButton icon="bell" label={total ? `${total} notifications` : 'Notifications'} badge={total > 0} onPress={() => setOpen((v) => !v)} />
      </View>
      {open ? (
        <MenuPanel>
          <View style={{ paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 1, borderBottomColor: A.line }}>
            <AText kind="label">Notifications</AText>
          </View>
          {total === 0 ? (
            <View style={{ padding: 22, alignItems: 'center', gap: 8 }}>
              <Icon name="check-circle" size={22} color="#2f9e66" />
              <AText kind="small" color={A.muted}>
                You’re all caught up.
              </AText>
            </View>
          ) : (
            <View style={{ padding: 4 }}>
              {rows
                .filter((r) => r.count > 0)
                .map((r) => (
                  <Pressable
                    key={r.label}
                    accessibilityRole="link"
                    onPress={() => {
                      setOpen(false);
                      router.push(r.href);
                    }}
                    style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 12, padding: 10, borderRadius: 8, backgroundColor: hovered ? A.field : 'transparent' })}
                  >
                    <View style={{ width: 32, height: 32, borderRadius: 8, backgroundColor: A.accentSoft, alignItems: 'center', justifyContent: 'center' }}>
                      <Icon name={r.icon} size={16} color={A.accent} />
                    </View>
                    <AText kind="small" style={{ flex: 1 }}>
                      <AText kind="label">{r.count}</AText> {r.label}
                    </AText>
                    <Icon name="chevron-right" size={15} color={A.faint} />
                  </Pressable>
                ))}
            </View>
          )}
        </MenuPanel>
      ) : null}
    </View>
  );
}

/** The admin frame: dark rail, white top bar and a scrolling page area. */
export function AdminShell({ title, children, maxWidth = 1200 }: { title: string; children: ReactNode; maxWidth?: number }) {
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const pathname = usePathname();
  const [drawer, setDrawer] = useState(false);
  const [palette, setPalette] = useState(false);
  const [counts, setCounts] = useState<Counts>({ fresh: 0, enquiries: 0 });
  const lastPath = useRef(pathname);

  useEffect(() => {
    let active = true;
    adminApi<Counts>('/notifications').then((r) => active && setCounts(r), () => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);

  // Close the drawer after navigating.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setDrawer(false);
    }
  }, [pathname]);

  // Ctrl/Cmd + K opens search on the web.
  useEffect(() => {
    if (Platform.OS !== 'web') return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setPalette(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <ToastProvider>
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: A.page }}>
        {wide ? <Sidebar counts={counts} /> : null}
        <View style={{ flex: 1 }}>
          <View style={{ height: TOPBAR, backgroundColor: A.white, borderBottomWidth: 1, borderBottomColor: A.line, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, paddingHorizontal: wide ? 28 : 12, zIndex: 20 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
              {!wide ? <IconButton icon="menu" label="Open menu" onPress={() => setDrawer(true)} /> : null}
              <AText kind="small" color={A.muted}>
                Admin
              </AText>
              <AText kind="small" color={A.faint}>
                /
              </AText>
              <AText kind="label" numberOfLines={1} style={{ flexShrink: 1 }}>
                {title}
              </AText>
            </View>
            {width >= 760 ? (
              <Pressable
                accessibilityRole="button"
                accessibilityLabel="Search"
                onPress={() => setPalette(true)}
                style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 10, width: 300, height: 36, paddingHorizontal: 12, borderRadius: 9, backgroundColor: hovered ? '#eeece6' : A.field })}
              >
                <Icon name="search" size={15} color={A.faint} />
                <AText kind="small" color={A.faint} style={{ flex: 1 }}>
                  Search…
                </AText>
                <View style={{ borderWidth: 1, borderColor: A.lineStrong, borderRadius: 5, paddingHorizontal: 6, paddingVertical: 1 }}>
                  <AText kind="tiny" color={A.muted} style={{ fontFamily: fonts.mono, fontSize: 11 }}>
                    ⌘K
                  </AText>
                </View>
              </Pressable>
            ) : null}
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, justifyContent: 'flex-end' }}>
              {width < 760 ? <IconButton icon="search" label="Search" onPress={() => setPalette(true)} /> : null}
              <Bell counts={counts} />
              <NewMenu />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: wide ? 28 : 16, paddingBottom: 72 }}>
            <View style={{ width: '100%', maxWidth, alignSelf: 'center' }}>{children}</View>
          </ScrollView>
        </View>
        {!wide && drawer ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 60 }}>
            <Sidebar counts={counts} onNavigate={() => setDrawer(false)} />
            <Pressable accessibilityLabel="Close menu" onPress={() => setDrawer(false)} style={{ flex: 1, backgroundColor: 'rgba(23,22,20,0.5)' }} />
          </View>
        ) : null}
        {palette ? <CommandPalette onClose={() => setPalette(false)} /> : null}
      </View>
    </ToastProvider>
  );
}

/** Page heading under the top bar: optional back link, title, subtitle and actions. */
export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: ReactNode; back?: { label: string; href: Href } }) {
  const { width } = useWindowDimensions();
  const stacked = width < 760;
  return (
    <View style={{ gap: 12, marginBottom: 24 }}>
      {back ? (
        <Link href={back.href} asChild>
          <Pressable accessibilityRole="link" style={{ alignSelf: 'flex-start' }}>
            {({ hovered }: { hovered?: boolean }) => (
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, opacity: hovered ? 0.7 : 1 }}>
                <Icon name="arrow-left" size={14} color={A.muted} />
                <AText kind="small" color={A.muted}>
                  {back.label}
                </AText>
              </View>
            )}
          </Pressable>
        </Link>
      ) : null}
      <View style={{ flexDirection: stacked ? 'column' : 'row', justifyContent: 'space-between', alignItems: stacked ? 'flex-start' : 'flex-end', gap: 16 }}>
        <View style={{ gap: 6, flexShrink: 1 }}>
          <AText kind="title">{title}</AText>
          {subtitle ? (
            <AText kind="body" color={A.muted} style={{ maxWidth: 620 }}>
              {subtitle}
            </AText>
          ) : null}
        </View>
        {actions ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>{actions}</View> : null}
      </View>
    </View>
  );
}
