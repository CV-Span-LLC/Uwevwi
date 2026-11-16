import { Image, type ImageSource } from 'expo-image';
import { Link, type Href } from 'expo-router';
import type { ReactNode } from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  useWindowDimensions,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';

import {
  breakpointFor,
  colors,
  displayScale,
  layout,
  type,
  type Breakpoint,
  type TypeVariant,
} from '@/theme';

export function useBreakpoint(): { bp: Breakpoint; width: number; isDesktop: boolean; isMobile: boolean } {
  const { width } = useWindowDimensions();
  const bp = breakpointFor(width);
  return { bp, width, isDesktop: bp === 'desktop', isMobile: bp === 'mobile' };
}

export function gutterFor(bp: Breakpoint) {
  return bp === 'desktop' ? layout.gutterDesktop : bp === 'tablet' ? layout.gutterTablet : layout.gutterMobile;
}

type TxtProps = TextProps & {
  variant?: TypeVariant;
  color?: string;
  align?: TextStyle['textAlign'];
};

/** Text that follows the Figma type scale and shrinks display sizes on smaller screens. */
export function Txt({ variant = 'body', color = colors.text, align, style, ...rest }: TxtProps) {
  const { bp } = useBreakpoint();
  const base = type[variant];
  const scale = displayScale[bp][variant] ?? 1;
  const scaled: TextStyle =
    scale === 1
      ? base
      : { ...base, fontSize: Math.round(base.fontSize * scale), lineHeight: Math.round(base.lineHeight * scale) };
  return <Text {...rest} style={[scaled, { color }, align ? { textAlign: align } : null, style]} />;
}

/** Small mono label that opens most sections, e.g. "/OUR_PARTNERS". */
export function Eyebrow({ children, color = colors.accent, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  const text = typeof children === 'string' ? `/${children.trim().toUpperCase().replace(/\s+/g, '_')}` : children;
  return (
    <Txt variant="mono" color={color} style={style}>
      {text}
    </Txt>
  );
}

type SectionProps = {
  children: ReactNode;
  background?: string;
  /** Vertical padding in the 1440 design. Scaled down on mobile. */
  paddingY?: number;
  paddingTop?: number;
  paddingBottom?: number;
  borderTop?: boolean;
  style?: StyleProp<ViewStyle>;
  innerStyle?: StyleProp<ViewStyle>;
  /** Skip the horizontal gutter, for edge-to-edge media. */
  bleed?: boolean;
};

/** Full-width band with the site gutters and a 1200px content column. */
export function Section({
  children,
  background = colors.white,
  paddingY = 100,
  paddingTop,
  paddingBottom,
  borderTop,
  style,
  innerStyle,
  bleed,
}: SectionProps) {
  const { bp } = useBreakpoint();
  const gutter = bleed ? 0 : gutterFor(bp);
  const k = bp === 'mobile' ? 0.6 : bp === 'tablet' ? 0.8 : 1;
  return (
    <View
      style={[
        {
          backgroundColor: background,
          paddingHorizontal: gutter,
          paddingTop: Math.round((paddingTop ?? paddingY) * k),
          paddingBottom: Math.round((paddingBottom ?? paddingY) * k),
        },
        borderTop ? { borderTopWidth: 1, borderTopColor: colors.borders } : null,
        style,
      ]}
    >
      <View style={[{ width: '100%', maxWidth: layout.maxWidth - layout.gutterDesktop * 2, alignSelf: 'center' }, innerStyle]}>
        {children}
      </View>
    </View>
  );
}

const ARROW = require('../../assets/figma/arrow-right-white.svg');

/** Pressable state with the hover flag react-native-web adds. */
export type PressState = { pressed: boolean; hovered?: boolean };

export type Tone = 'accent' | 'signal' | 'ink' | 'light' | 'ghost';
const TONES: Record<Tone, { bg: string; fg: string; border: string }> = {
  accent: { bg: colors.accent, fg: colors.white, border: colors.accent },
  signal: { bg: colors.signal, fg: colors.white, border: colors.signal },
  ink: { bg: colors.darkSection, fg: colors.white, border: colors.darkSection },
  light: { bg: colors.white, fg: colors.darkSection, border: colors.white },
  ghost: { bg: 'transparent', fg: colors.white, border: '#6a665f' },
};

/** Square mono button with a trailing arrow. Renders a link when `href` is given. */
export function TechButton({
  label,
  href,
  onPress,
  tone = 'accent',
  small,
  style,
}: {
  label: string;
  href?: Href;
  onPress?: () => void;
  tone?: Tone;
  small?: boolean;
  style?: StyleProp<ViewStyle>;
}) {
  const t = TONES[tone];
  const body = ({ pressed, hovered }: PressState) => (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
        paddingHorizontal: small ? 14 : 22,
        paddingVertical: small ? 10 : 16,
        backgroundColor: t.bg,
        borderWidth: 1,
        borderColor: t.border,
        borderRadius: 2,
        opacity: pressed ? 0.8 : 1,
        transform: [{ translateY: hovered ? -2 : 0 }],
      }}
    >
      <Txt variant="mono" color={t.fg} numberOfLines={1} style={{ textTransform: 'uppercase' }}>
        {label}
      </Txt>
      <Image source={ARROW} tintColor={t.fg} style={{ width: 16, height: 16 }} contentFit="contain" />
    </View>
  );
  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable accessibilityRole="link" style={StyleSheet.flatten([{ alignSelf: 'flex-start' }, style])}>
          {body}
        </Pressable>
      </Link>
    );
  }
  return (
    <Pressable accessibilityRole="button" onPress={onPress} style={[{ alignSelf: 'flex-start' }, style]}>
      {body}
    </Pressable>
  );
}


type ButtonProps = { label: string; href?: Href; onPress?: () => void; style?: StyleProp<ViewStyle>; disabled?: boolean };

export function PrimaryButton({ disabled, ...props }: ButtonProps) {
  return <TechButton tone="accent" {...props} style={[props.style, disabled ? { opacity: 0.5 } : null]} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <TechButton tone="ink" {...props} />;
}

/** Remote-free image helper: fills its parent with `cover` by default. */
export function Photo({ source, style, contentFit = 'cover', position }: { source: ImageSource | number; style?: StyleProp<ViewStyle>; contentFit?: 'cover' | 'contain'; position?: string }) {
  return <Image source={source} style={[{ width: '100%', height: '100%' }, style as never]} contentFit={contentFit} contentPosition={position as never} />;
}

export function Divider({ color = colors.borders, thickness = 2, style }: { color?: string; thickness?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: thickness, backgroundColor: color, alignSelf: 'stretch' }, style]} />;
}
