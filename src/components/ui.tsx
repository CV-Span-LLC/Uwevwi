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

/** Small uppercase accent label that opens most sections, e.g. "OUR PARTNERS". */
export function Eyebrow({ children, color = colors.accent, style }: { children: ReactNode; color?: string; style?: StyleProp<TextStyle> }) {
  return (
    <Txt variant="large" color={color} style={style}>
      {children}
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

const ARROW_WHITE = require('../../assets/figma/arrow-right-white.svg');
const ARROW_ACCENT = require('../../assets/figma/arrow-right-accent.svg');

type ButtonProps = {
  label: string;
  href?: Href;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
  disabled?: boolean;
};

function ButtonBody({ label, kind, pressed }: { label: string; kind: 'primary' | 'secondary'; pressed: boolean }) {
  const primary = kind === 'primary';
  return (
    <View
      style={[
        styles.button,
        primary ? styles.buttonPrimary : styles.buttonSecondary,
        pressed ? { opacity: 0.8 } : null,
      ]}
    >
      <Txt variant="button" color={primary ? colors.white : colors.accent} numberOfLines={1}>
        {label}
      </Txt>
      <Image source={primary ? ARROW_WHITE : ARROW_ACCENT} style={styles.arrow} contentFit="contain" />
    </View>
  );
}

function ButtonBase({ kind, ...props }: ButtonProps & { kind: 'primary' | 'secondary' }) {
  const { label, href, onPress, style, disabled } = props;
  if (href) {
    return (
      <Link href={href} asChild>
        <Pressable accessibilityRole="link" style={StyleSheet.flatten([styles.buttonWrap, style])}>
          {({ pressed }) => <ButtonBody label={label} kind={kind} pressed={pressed} />}
        </Pressable>
      </Link>
    );
  }
  return (
    <Pressable
      accessibilityRole="button"
      disabled={disabled}
      onPress={onPress}
      style={[styles.buttonWrap, disabled ? { opacity: 0.5 } : null, style]}
    >
      {({ pressed }) => <ButtonBody label={label} kind={kind} pressed={pressed} />}
    </Pressable>
  );
}

export function PrimaryButton(props: ButtonProps) {
  return <ButtonBase kind="primary" {...props} />;
}

export function SecondaryButton(props: ButtonProps) {
  return <ButtonBase kind="secondary" {...props} />;
}

/** Remote-free image helper: fills its parent with `cover` by default. */
export function Photo({ source, style, contentFit = 'cover', position }: { source: ImageSource | number; style?: StyleProp<ViewStyle>; contentFit?: 'cover' | 'contain'; position?: string }) {
  return <Image source={source} style={[{ width: '100%', height: '100%' }, style as never]} contentFit={contentFit} contentPosition={position as never} />;
}

export function Divider({ color = colors.borders, thickness = 2, style }: { color?: string; thickness?: number; style?: StyleProp<ViewStyle> }) {
  return <View style={[{ height: thickness, backgroundColor: color, alignSelf: 'stretch' }, style]} />;
}

const styles = StyleSheet.create({
  buttonWrap: { alignSelf: 'flex-start' },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
    paddingHorizontal: 40,
    paddingVertical: 20,
  },
  buttonPrimary: { backgroundColor: colors.accent, borderRadius: 8 },
  buttonSecondary: { borderBottomWidth: 1.5, borderBottomColor: colors.accent },
  arrow: { width: 24, height: 24 },
});
