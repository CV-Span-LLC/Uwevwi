import { Image } from 'expo-image';
import { Link, usePathname, type Href } from 'expo-router';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Section, SecondaryButton, Txt, gutterFor, useBreakpoint } from '@/components/ui';
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
const LOGO_MARK_LG = require('../../assets/figma/logo-mark-lg.svg');
const LOGO_TEXT_LG = require('../../assets/figma/logo-text-lg.svg');
const SOCIAL = [
  require('../../assets/figma/social-facebook.svg'),
  require('../../assets/figma/social-instagram.svg'),
  require('../../assets/figma/social-linkedin.svg'),
  require('../../assets/figma/social-substack.svg'),
];

function isActive(pathname: string, match: string) {
  return match === '/' ? pathname === '/' : pathname === match || pathname.startsWith(`${match}/`);
}

function Logo() {
  return (
    <Link href="/" asChild>
      <Pressable accessibilityRole="link" accessibilityLabel="Uwevwi home" style={styles.logo}>
        <Image source={LOGO_MARK} style={{ width: 41.29, height: 41.29 }} contentFit="contain" />
        <Image source={LOGO_TEXT} style={{ width: 154.875, height: 36.2 }} contentFit="contain" />
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
            {NAV.map((item) => (
              <Link key={item.label} href={item.href} asChild>
                <Pressable accessibilityRole="link">
                  <Txt variant="nav" color={isActive(pathname, item.match) ? colors.accent : colors.darkSection}>
                    {item.label}
                  </Txt>
                </Pressable>
              </Link>
            ))}
          </View>
        ) : (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={open ? 'Close menu' : 'Open menu'}
            onPress={() => setOpen((v) => !v)}
            hitSlop={12}
            style={styles.burger}
          >
            <View style={[styles.burgerLine, open ? { transform: [{ translateY: 7 }, { rotate: '45deg' }] } : null]} />
            <View style={[styles.burgerLine, open ? { opacity: 0 } : null]} />
            <View style={[styles.burgerLine, open ? { transform: [{ translateY: -7 }, { rotate: '-45deg' }] } : null]} />
          </Pressable>
        )}
      </View>
      {!isDesktop && open ? (
        <View style={[styles.menu, { paddingHorizontal: gutter }]}>
          {NAV.map((item) => (
            <Link key={item.label} href={item.href} asChild>
              <Pressable accessibilityRole="link" style={styles.menuItem}>
                <Txt variant="large" color={isActive(pathname, item.match) ? colors.accent : colors.darkSection}>
                  {item.label}
                </Txt>
              </Pressable>
            </Link>
          ))}
        </View>
      ) : null}
    </View>
  );
}

function FooterColumn({ title, children, style }: { title: string; children: ReactNode; style?: object }) {
  return (
    <View style={[{ gap: 20 }, style]}>
      <Txt variant="large">{title}</Txt>
      {children}
    </View>
  );
}

function FooterLink({ label, href }: { label: string; href: Href }) {
  return (
    <Link href={href} asChild>
      <Pressable accessibilityRole="link">
        <Txt variant="small" color={colors.textSecondary}>
          {label}
        </Txt>
      </Pressable>
    </Link>
  );
}

function Footer() {
  const { isDesktop, isMobile } = useBreakpoint();
  const links = NAV.filter((n) => n.label !== 'HOME');
  const col1 = links.slice(0, 3);
  const col2 = links.slice(3);
  return (
    <View>
      <Section background={colors.white} paddingTop={44} paddingBottom={0}>
        <View style={[styles.footerTop, !isDesktop && { flexDirection: 'column', gap: 40 }]}>
          <View style={{ alignItems: 'flex-end', gap: 10, alignSelf: isMobile ? 'flex-start' : undefined }}>
            <View style={[styles.logo, { gap: 30.6 }]}>
              <Image source={LOGO_MARK_LG} style={{ width: 70, height: 70 }} contentFit="contain" />
              <Image source={LOGO_TEXT_LG} style={{ width: 262.56, height: 61.37 }} contentFit="contain" />
            </View>
            <Txt variant="h5" color={colors.textSecondary} style={{ alignSelf: 'stretch' }}>
              Preserving African Imagination Across Time
            </Txt>
          </View>
          <FooterColumn title="LINKS" style={{ width: 224 }}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              {[col1, col2].map((col, i) => (
                <View key={i} style={{ gap: 18 }}>
                  {col.map((item) => (
                    <FooterLink key={item.label} label={item.footerLabel} href={item.href} />
                  ))}
                </View>
              ))}
            </View>
          </FooterColumn>
          <FooterColumn title="CONTACT" style={{ width: 190 }}>
            <View style={{ gap: 18 }}>
              <Txt variant="small" color={colors.textSecondary}>
                hello@uwevwistudio.org
              </Txt>
              <Txt variant="small" color={colors.textSecondary}>
                Lagos, Nigeria
              </Txt>
              <View style={{ flexDirection: 'row', gap: 14 }}>
                {SOCIAL.map((src, i) => (
                  <Image key={i} source={src} style={{ width: 20, height: 20 }} contentFit="contain" />
                ))}
              </View>
            </View>
          </FooterColumn>
          <FooterColumn title="WORK WITH US" style={{ width: 230 }}>
            <SecondaryButton label="Request a Consultation" href="/contact" style={styles.footerCta} />
          </FooterColumn>
        </View>
      </Section>
      <Section background={colors.white} paddingTop={0} paddingBottom={0} style={{ paddingTop: 0 }}>
        <View style={[styles.copyright, isMobile && { flexDirection: 'column', alignItems: 'flex-start', gap: 12 }]}>
          <Txt variant="small" color={colors.textSecondary}>
            © Uwevwi 2025. All rights reserved.
          </Txt>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 14 }}>
            {LEGAL_LINKS.map((item) => (
              <FooterLink key={item.label} label={item.label} href={item.href} />
            ))}
          </View>
        </View>
      </Section>
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
  navWrap: { backgroundColor: colors.white, zIndex: 10 },
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
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  burger: { width: 28, height: 28, justifyContent: 'center', gap: 5 },
  burgerLine: { height: 2, backgroundColor: colors.darkSection, borderRadius: 2 },
  menu: { backgroundColor: colors.white, borderTopWidth: 1, borderTopColor: colors.borders, paddingBottom: 12 },
  menuItem: { paddingVertical: 14 },
  footerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', paddingBottom: 76 },
  footerCta: { paddingHorizontal: 0, paddingRight: 0 },
  copyright: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 2,
    borderTopColor: colors.borders,
    paddingVertical: 24,
  },
});
