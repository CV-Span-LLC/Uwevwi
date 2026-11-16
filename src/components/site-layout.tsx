import { Image } from 'expo-image';
import { Link, usePathname, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';

import { Label, PixelWordmark, SignalLine, TechButton } from '@/components/futuristic';
import { Txt, gutterFor, useBreakpoint } from '@/components/ui';
import { colors, layout } from '@/theme';

type NavItem = { label: string; footerLabel: string; href: Href; match: string };

export const NAV: NavItem[] = [
  { label: 'HOME', footerLabel: 'Home', href: '/', match: '/' },
  { label: 'ABOUT', footerLabel: 'About', href: '/about', match: '/about' },
  { label: 'ADVISORY', footerLabel: 'Advisory', href: '/advisory', match: '/advisory' },
  { label: 'STEWARDSHIP', footerLabel: 'Stewardship', href: '/stewardship', match: '/stewardship' },
  { label: 'STUDIOS', footerLabel: 'Studios', href: '/studios', match: '/studios' },
  { label: 'RESEARCH', footerLabel: 'Research', href: '/research', match: '/research' },
  { label: 'CONTACT', footerLabel: 'Contact', href: '/contact', match: '/contact' },
];

const LEGAL_LINKS: { label: string; href: Href }[] = [
  { label: 'Privacy Policy', href: '/privacy-policy' },
  { label: 'Terms of Use', href: '/terms-of-use' },
  { label: 'Cookies', href: '/cookies-policy' },
];

const LOGO_MARK = require('../../assets/figma/logo-mark.svg');
const LOGO_TEXT = require('../../assets/figma/logo-text.svg');
/** Set `url` on each network once the profile links are known; tiles without one are not clickable. */
const SOCIALS: { name: string; url?: string; path: string }[] = [
  {
    name: 'Facebook',
    path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z',
  },
  {
    name: 'X',
    path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z',
  },
  {
    name: 'Instagram',
    path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z',
  },
  {
    name: 'LinkedIn',
    path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z',
  },
  {
    name: 'YouTube',
    path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z',
  },
];

function SocialLinks() {
  return (
    <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
      {SOCIALS.map((s) => {
        const tile = (hovered?: boolean) => (
          <View
            style={{
              width: 36,
              height: 36,
              borderWidth: 1,
              borderColor: hovered ? colors.signal : colors.darkLine,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Svg width={15} height={15} viewBox="0 0 24 24" accessibilityLabel={s.name}>
              <Path d={s.path} fill={hovered ? colors.signal : colors.white} />
            </Svg>
          </View>
        );
        const url = s.url;
        return url ? (
          <Pressable key={s.name} accessibilityRole="link" accessibilityLabel={s.name} onPress={() => Linking.openURL(url)}>
            {({ hovered }: { hovered?: boolean }) => tile(hovered)}
          </Pressable>
        ) : (
          <View key={s.name} accessibilityLabel={s.name}>
            {tile()}
          </View>
        );
      })}
    </View>
  );
}

function isActive(pathname: string, match: string) {
  return match === '/' ? pathname === '/' : pathname === match || pathname.startsWith(`${match}/`);
}

function Logo({ light, small }: { light?: boolean; small?: boolean }) {
  const tint = light ? colors.white : undefined;
  return (
    <Link href="/" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Uwevwi home" style={styles.logo}>
        <Image source={LOGO_MARK} tintColor={tint} style={{ width: small ? 34 : 41.29, height: small ? 34 : 41.29 }} contentFit="contain" />
        <Image source={LOGO_TEXT} tintColor={tint} style={{ width: small ? 127 : 154.875, height: small ? 29.7 : 36.2 }} contentFit="contain" />
      </Pressable>
    </Link>
  );
}

/** Desktop links. Contact is the button on the right, so it is left out here. */
const BAR_LINKS = NAV.filter((n) => n.label !== 'CONTACT');

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  return (
    <Link href={item.href} asChild>
      <Pressable accessibilityRole="link" accessibilityState={{ selected: active }}>
        {({ hovered }: { hovered?: boolean }) => (
          <View style={{ paddingVertical: 8, borderBottomWidth: 1.5, borderBottomColor: active ? colors.accent : hovered ? colors.borders : 'transparent' }}>
            <Txt variant="mono" color={active || hovered ? colors.accent : colors.darkSection}>
              {item.label}
            </Txt>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Navbar() {
  const pathname = usePathname();
  const { isDesktop, bp } = useBreakpoint();
  const [open, setOpen] = useState(false);
  const lastPath = useRef(pathname);

  // Close the mobile menu whenever the route changes.
  useEffect(() => {
    if (lastPath.current !== pathname) {
      lastPath.current = pathname;
      setOpen(false);
    }
  }, [pathname]);

  const gutter = gutterFor(bp);
  return (
    <View style={styles.navWrap}>
      <View style={[styles.navBar, { paddingHorizontal: gutter }]}>
        <Logo />
        {isDesktop ? (
          <View style={styles.navLinks}>
            {BAR_LINKS.map((item) => (
              <NavLink key={item.label} item={item} active={isActive(pathname, item.match)} />
            ))}
            <TechButton label="Get in touch" href="/contact" tone="ink" small style={{ marginLeft: 12 }} />
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={open ? 'Close menu' : 'Open menu'}
            accessibilityState={{ expanded: open }}
            onPress={() => setOpen((v) => !v)}
            hitSlop={12}
            style={[styles.burger, open ? { backgroundColor: colors.darkSection, borderColor: colors.darkSection } : null]}
          >
            <View style={[styles.burgerLine, open ? { backgroundColor: colors.white, transform: [{ translateY: 3.5 }, { rotate: '45deg' }] } : null]} />
            <View style={[styles.burgerLine, open ? { backgroundColor: colors.white, transform: [{ translateY: -3.5 }, { rotate: '-45deg' }] } : null]} />
          </Pressable>
        )}
      </View>
      {!isDesktop && open ? (
        <View style={styles.menu}>
          <SignalLine />
          <View style={{ paddingLeft: gutter + 12, paddingRight: gutter, paddingTop: 12, paddingBottom: 28 }}>
            {NAV.map((item, i) => {
              const active = isActive(pathname, item.match);
              return (
                <Link key={item.label} href={item.href} asChild>
                  <Pressable accessibilityRole="link" style={styles.menuItem}>
                    <Txt variant="mono" color={active ? colors.signal : '#8d877e'} style={{ width: 28 }}>
                      {String(i + 1).padStart(2, '0')}
                    </Txt>
                    <Txt variant="h4" color={active ? colors.white : 'rgba(255,255,255,0.72)'} style={{ textTransform: 'uppercase', flex: 1 }}>
                      {item.footerLabel}
                    </Txt>
                    {active ? <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.signal }} /> : null}
                  </Pressable>
                </Link>
              );
            })}
            <View style={{ paddingTop: 22 }}>
              <TechButton label="Request a consultation" href="/contact" tone="signal" />
            </View>
          </View>
        </View>
      ) : null}
    </View>
  );
}

function FooterColumn({ label, children, style }: { label: string; children: ReactNode; style?: object }) {
  return (
    <View style={[{ gap: 20 }, style]}>
      <Label color={colors.signal}>{label}</Label>
      {children}
    </View>
  );
}

function FooterLink({ label, href, index }: { label: string; href: Href; index?: number }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link">
        {({ hovered }: { hovered?: boolean }) => (
          <View style={{ flexDirection: 'row', alignItems: 'baseline', gap: 10 }}>
            {index !== undefined ? (
              <Txt variant="mono" color="#6f6a63">
                {String(index + 1).padStart(2, '0')}
              </Txt>
            ) : null}
            <Txt variant="small" color={hovered ? colors.white : 'rgba(255,255,255,0.7)'}>
              {label}
            </Txt>
          </View>
        )}
      </Pressable>
    </Link>
  );
}

function Footer() {
  const { bp, isDesktop, isMobile } = useBreakpoint();
  const gutter = gutterFor(bp);
  const links = NAV.filter((n) => n.label !== 'HOME');
  return (
    <View style={{ backgroundColor: colors.darkSection, overflow: 'hidden' }}>
      <View style={{ width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: gutter }}>
        <View>
          <SignalLine />
          <View style={{ paddingLeft: isMobile ? 28 : 84, paddingTop: isMobile ? 56 : 88, gap: isMobile ? 48 : 72 }}>
            <View style={{ flexDirection: isDesktop ? 'row' : 'column', justifyContent: 'space-between', gap: isDesktop ? 40 : 44 }}>
              <View style={{ gap: 22, maxWidth: 340, flex: isDesktop ? 1 : undefined }}>
                <Logo light />
                <Txt variant="h5" color="rgba(255,255,255,0.72)">
                  Preserving African Imagination Across Time
                </Txt>
              </View>
              <FooterColumn label="Navigation" style={{ width: isDesktop ? 220 : '100%' }}>
                <View style={{ flexDirection: 'row', gap: 32 }}>
                  {[links.slice(0, 3), links.slice(3)].map((col, ci) => (
                    <View key={ci} style={{ gap: 14 }}>
                      {col.map((item, i) => (
                        <FooterLink key={item.label} label={item.footerLabel} href={item.href} index={ci * 3 + i} />
                      ))}
                    </View>
                  ))}
                </View>
              </FooterColumn>
              <FooterColumn label="Contact" style={{ width: isDesktop ? 210 : '100%' }}>
                <View style={{ gap: 12 }}>
                  <Txt variant="small" color="rgba(255,255,255,0.7)">
                    hello@uwevwistudio.org
                  </Txt>
                  <Txt variant="small" color="rgba(255,255,255,0.7)">
                    Lagos, Nigeria
                  </Txt>
                </View>
                <SocialLinks />
              </FooterColumn>
              <FooterColumn label="Work with us" style={{ width: isDesktop ? 230 : '100%' }}>
                <Txt variant="small" color="rgba(255,255,255,0.7)">
                  Research-led advisory for collectors, institutions and organisations.
                </Txt>
                <TechButton label="Request a consultation" href="/contact" tone="signal" />
              </FooterColumn>
            </View>

            <View style={{ gap: 0 }}>
              <PixelWordmark color="rgba(255,255,255,0.07)" crop={0.86} />
              <View
                style={{
                  flexDirection: isMobile ? 'column' : 'row',
                  justifyContent: 'space-between',
                  alignItems: isMobile ? 'flex-start' : 'center',
                  gap: 12,
                  borderTopWidth: 1,
                  borderTopColor: colors.darkLine,
                  paddingVertical: 22,
                }}
              >
                <Txt variant="mono" color="#8d877e">
                  {`© UWEVWI ${new Date().getFullYear()}. ALL RIGHTS RESERVED.`}
                </Txt>
                <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 20 }}>
                  {LEGAL_LINKS.map((item) => (
                    <Link key={item.label} href={item.href} asChild>
                      <Pressable accessibilityRole="link">
                        {({ hovered }: { hovered?: boolean }) => (
                          <Txt variant="mono" color={hovered ? colors.white : '#8d877e'} style={{ textTransform: 'uppercase' }}>
                            {item.label}
                          </Txt>
                        )}
                      </Pressable>
                    </Link>
                  ))}
                </View>
              </View>
            </View>
          </View>
        </View>
      </View>
    </View>
  );
}

/** Page frame shared by every screen: sticky navbar, scrolling content, footer. */
export function SiteLayout({ children }: { children: ReactNode }) {
  return (
    <View style={{ flex: 1, backgroundColor: colors.white }}>
      <ScrollView stickyHeaderIndices={[0]} showsVerticalScrollIndicator={false} contentContainerStyle={{ flexGrow: 1 }}>
        <Navbar />
        <View style={{ flex: 1 }}>{children}</View>
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  navWrap: { backgroundColor: colors.white, zIndex: 10, borderBottomWidth: 1, borderBottomColor: colors.borders },
  navBar: {
    height: layout.navHeight,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.white,
    width: '100%',
    maxWidth: layout.maxWidth,
    alignSelf: 'center',
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 18 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 30 },
  burger: { width: 40, height: 40, justifyContent: 'center', alignItems: 'center', gap: 7, borderWidth: 1, borderColor: colors.borders, borderRadius: 2 },
  burgerLine: { width: 18, height: 1.5, backgroundColor: colors.darkSection },
  menu: { backgroundColor: colors.darkSection },
  menuItem: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: colors.darkLine },
});
