import { Image } from 'expo-image';
import { Link, router, usePathname, type Href } from 'expo-router';
import { useEffect, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, View, useWindowDimensions } from 'react-native';

import { useAuth } from '@/admin/auth';
import { Icon, type IconName } from '@/admin/icons';
import { A, AText, ToastProvider } from '@/admin/ui';
import { adminApi } from '@/lib/api';

const LOGO_MARK = require('../../assets/figma/logo-mark.svg');
const LOGO_TEXT = require('../../assets/figma/logo-text.svg');

type NavItem = { label: string; href: Href; match: string; icon: IconName; exact?: boolean };
const GROUPS: { title?: string; items: NavItem[] }[] = [
  { items: [{ label: 'Dashboard', href: '/admin', match: '/admin', icon: 'dashboard', exact: true }] },
  {
    title: 'Content',
    items: [
      { label: 'Research', href: '/admin/research', match: '/admin/research', icon: 'research' },
      { label: 'Exhibition', href: '/admin/exhibition', match: '/admin/exhibition', icon: 'exhibition' },
    ],
  },
  { title: 'Website', items: [{ label: 'Website Images', href: '/admin/images', match: '/admin/images', icon: 'images' }] },
  {
    title: 'Engagement',
    items: [
      { label: 'Comments', href: '/admin/comments', match: '/admin/comments', icon: 'comments' },
      { label: 'Enquiries', href: '/admin/enquiries', match: '/admin/enquiries', icon: 'mail' },
    ],
  },
];

const SIDEBAR = 240;
const TOPBAR = 68;

function Clock() {
  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 30_000);
    return () => clearInterval(id);
  }, []);
  const label = now.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true }).toLowerCase();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
      <AText kind="label">Time</AText>
      <AText kind="tiny" color={A.muted}>
        {label}
      </AText>
    </View>
  );
}

function Sidebar({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const { admin, signOut } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const initials = (admin?.name ?? 'A').split(/\s+/).slice(0, 2).map((p) => p[0]).join('').toUpperCase();

  return (
    <View style={{ width: SIDEBAR, backgroundColor: A.sidebar, height: '100%' }}>
      <View style={{ height: TOPBAR, justifyContent: 'center', paddingHorizontal: 20, borderBottomWidth: 2, borderBottomColor: A.page }}>
        <Link href="/admin" asChild>
          <Pressable accessibilityRole="link" accessibilityLabel="Uwevwi admin home" onPress={onNavigate} style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Image source={LOGO_MARK} style={{ width: 27, height: 27 }} contentFit="contain" />
            <Image source={LOGO_TEXT} style={{ width: 100, height: 23.5 }} contentFit="contain" />
          </Pressable>
        </Link>
      </View>
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingTop: 28, paddingBottom: 12 }}>
        {GROUPS.map((group, gi) => (
          <View key={gi} style={{ marginBottom: 6 }}>
            {group.title ? (
              <View style={{ paddingHorizontal: 20, paddingVertical: 10 }}>
                <AText kind="body">{group.title}</AText>
              </View>
            ) : null}
            {group.items.map((item) => {
              const active = item.exact ? pathname === item.match : pathname === item.match || pathname.startsWith(`${item.match}/`);
              return (
                <Link key={item.label} href={item.href} asChild>
                  <Pressable
                    accessibilityRole="link"
                    accessibilityState={{ selected: active }}
                    onPress={onNavigate}
                    style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginLeft: 12, marginVertical: 3, paddingHorizontal: 12, height: 40, borderTopLeftRadius: 8, borderBottomLeftRadius: 8, backgroundColor: active ? A.page : '#e6e2da' }}
                  >
                    <Icon name={item.icon} size={16} color={active ? A.accent : A.muted} />
                    <AText kind="small" color={active ? A.accent : A.muted}>
                      {item.label}
                    </AText>
                  </Pressable>
                </Link>
              );
            })}
          </View>
        ))}
      </ScrollView>
      <View style={{ padding: 12 }}>
        {menuOpen ? (
          <View style={{ backgroundColor: A.white, borderRadius: 10, paddingVertical: 6, marginBottom: 8 }}>
            <Pressable accessibilityRole="link" onPress={() => router.push('/')} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Icon name="external" size={15} color={A.muted} />
              <AText kind="small">View website</AText>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={signOut} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, paddingHorizontal: 14, paddingVertical: 10 }}>
              <Icon name="logout" size={15} color={A.accent} />
              <AText kind="small" color={A.accent}>
                Sign out
              </AText>
            </Pressable>
          </View>
        ) : null}
        <Pressable accessibilityRole="button" accessibilityLabel="Account menu" onPress={() => setMenuOpen((v) => !v)} style={{ flexDirection: 'row', alignItems: 'center', gap: 10, padding: 6 }}>
          <View style={{ width: 34, height: 34, borderRadius: 17, backgroundColor: A.accent, alignItems: 'center', justifyContent: 'center' }}>
            <AText kind="small" color={A.white}>
              {initials}
            </AText>
          </View>
          <AText style={{ flex: 1 }} numberOfLines={1}>
            {admin?.name ?? 'Admin'}
          </AText>
          <Icon name={menuOpen ? 'chevron-up' : 'chevron-down'} size={16} color={A.text} />
        </Pressable>
      </View>
    </View>
  );
}

function Bell() {
  const [counts, setCounts] = useState({ fresh: 0, enquiries: 0 });
  const pathname = usePathname();
  const fresh = counts.fresh + counts.enquiries;
  useEffect(() => {
    let active = true;
    adminApi<{ fresh: number; enquiries: number }>('/notifications').then((r) => active && setCounts(r), () => undefined);
    return () => {
      active = false;
    };
  }, [pathname]);
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={fresh ? `${counts.fresh} new comments, ${counts.enquiries} new enquiries` : 'Notifications'} onPress={() => router.push(counts.fresh === 0 && counts.enquiries > 0 ? '/admin/enquiries' : '/admin/comments')} style={{ width: 36, height: 36, borderRadius: 8, backgroundColor: A.white, alignItems: 'center', justifyContent: 'center' }}>
      <Icon name="bell" size={18} color={A.text} />
      {fresh > 0 ? <View style={{ position: 'absolute', top: 7, right: 8, width: 8, height: 8, borderRadius: 4, backgroundColor: '#d92d3f' }} /> : null}
    </Pressable>
  );
}

/** The admin frame: sidebar, top bar and a scrolling page area. */
export function AdminShell({ title, children, maxWidth = 1160 }: { title: string; children: ReactNode; maxWidth?: number }) {
  const { width } = useWindowDimensions();
  const wide = width >= 960;
  const [drawer, setDrawer] = useState(false);

  return (
    <ToastProvider>
      <View style={{ flex: 1, flexDirection: 'row', backgroundColor: A.page }}>
        {wide ? <Sidebar /> : null}
        <View style={{ flex: 1 }}>
          <View style={{ height: TOPBAR, backgroundColor: A.sidebar, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: wide ? 28 : 16 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 }}>
              {!wide ? (
                <Pressable accessibilityRole="button" accessibilityLabel="Open menu" onPress={() => setDrawer(true)} hitSlop={10}>
                  <View style={{ gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <View key={i} style={{ width: 20, height: 2, backgroundColor: A.text, borderRadius: 2 }} />
                    ))}
                  </View>
                </Pressable>
              ) : null}
              <AText kind="label" color={A.accent} numberOfLines={1}>
                {title}
              </AText>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 24 }}>
              {width >= 520 ? <Clock /> : null}
              <Bell />
            </View>
          </View>
          <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: wide ? 28 : 16, paddingBottom: 60 }}>
            <View style={{ width: '100%', maxWidth, alignSelf: 'flex-start' }}>{children}</View>
          </ScrollView>
        </View>
        {!wide && drawer ? (
          <View style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, flexDirection: 'row', zIndex: 60 }}>
            <Sidebar onNavigate={() => setDrawer(false)} />
            <Pressable accessibilityLabel="Close menu" onPress={() => setDrawer(false)} style={{ flex: 1, backgroundColor: 'rgba(23,23,23,0.4)' }} />
          </View>
        ) : null}
      </View>
    </ToastProvider>
  );
}

/** Page heading used under the top bar: title, subtitle and optional actions. */
export function PageHeader({ title, subtitle, actions, back }: { title: string; subtitle?: string; actions?: ReactNode; back?: { label: string; href: Href } }) {
  const { width } = useWindowDimensions();
  return (
    <View style={{ gap: 10, marginBottom: 20 }}>
      {back ? (
        <Link href={back.href} asChild>
          <Pressable accessibilityRole="link" style={{ flexDirection: 'row', alignItems: 'center', gap: 6, alignSelf: 'flex-start' }}>
            <Icon name="arrow-left" size={14} color={A.muted} />
            <AText kind="small" color={A.muted}>
              {back.label}
            </AText>
          </Pressable>
        </Link>
      ) : null}
      <View style={{ flexDirection: width < 640 ? 'column' : 'row', justifyContent: 'space-between', alignItems: width < 640 ? 'flex-start' : 'flex-end', gap: 14 }}>
        <View style={{ gap: 4, flexShrink: 1 }}>
          <AText kind="title">{title}</AText>
          {subtitle ? (
            <AText kind="body" color={A.muted}>
              {subtitle}
            </AText>
          ) : null}
        </View>
        {actions ? <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>{actions}</View> : null}
      </View>
    </View>
  );
}
