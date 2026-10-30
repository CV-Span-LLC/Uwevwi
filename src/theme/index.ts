import { Platform, type TextStyle } from 'react-native';

export const colors = {
  white: '#ffffff',
  background: '#f5f2ec',
  borders: '#dcd7ce',
  accent: '#6e252c',
  text: '#171717',
  textSecondary: '#6b6862',
  darkSection: '#1d1c1a',
} as const;

export const fonts = {
  display: 'CormorantGaramond_400Regular',
  body: 'Inter_400Regular',
  bodyMedium: 'Inter_500Medium',
  header: 'Manrope_400Regular',
  quote: Platform.select({ ios: 'Georgia', android: 'serif', default: 'Georgia, serif' }) as string,
} as const;

/** Page gutters and max content width from the 1440px desktop frames. */
export const layout = {
  maxWidth: 1440,
  gutterDesktop: 120,
  gutterTablet: 48,
  gutterMobile: 20,
  navHeight: 68,
} as const;

export type Breakpoint = 'mobile' | 'tablet' | 'desktop';

export function breakpointFor(width: number): Breakpoint {
  if (width >= 1100) return 'desktop';
  if (width >= 720) return 'tablet';
  return 'mobile';
}

/** Type scale from the Figma text styles. Large display sizes shrink on small screens. */
export const type = {
  hero: { fontFamily: fonts.display, fontSize: 64, lineHeight: 68 },
  h1: { fontFamily: fonts.display, fontSize: 52, lineHeight: 56 },
  h2: { fontFamily: fonts.display, fontSize: 40, lineHeight: 44 },
  h3: { fontFamily: fonts.display, fontSize: 32, lineHeight: 36 },
  h4: { fontFamily: fonts.display, fontSize: 26, lineHeight: 32 },
  h5: { fontFamily: fonts.display, fontSize: 24, lineHeight: 30 },
  h6: { fontFamily: fonts.header, fontSize: 24, lineHeight: 32 },
  large: { fontFamily: fonts.bodyMedium, fontSize: 18, lineHeight: 28 },
  body: { fontFamily: fonts.body, fontSize: 16, lineHeight: 26 },
  small: { fontFamily: fonts.body, fontSize: 14, lineHeight: 22 },
  caption: { fontFamily: fonts.body, fontSize: 12, lineHeight: 18 },
  overline: { fontFamily: fonts.bodyMedium, fontSize: 12, lineHeight: 16 },
  button: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 20 },
  nav: { fontFamily: fonts.bodyMedium, fontSize: 14, lineHeight: 18 },
  quote: { fontFamily: fonts.quote, fontSize: 24, lineHeight: 34 },
} satisfies Record<string, TextStyle>;

export type TypeVariant = keyof typeof type;

/** Scale factor applied to a display size on narrower screens. */
export const displayScale: Record<Breakpoint, Partial<Record<TypeVariant, number>>> = {
  desktop: {},
  tablet: { hero: 0.85, h1: 0.85, h2: 0.9 },
  mobile: { hero: 0.6, h1: 0.62, h2: 0.75, h3: 0.8, h4: 0.9 },
};
