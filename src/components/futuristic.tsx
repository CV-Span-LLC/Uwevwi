import type { ImageSource } from 'expo-image';
import { useEffect, useState, type ReactNode } from 'react';
import {
  Animated,
  Easing,
  Platform,
  Pressable,
  Text,
  View,
  type StyleProp,
  type ViewStyle,
} from 'react-native';

import { Photo, Txt, gutterFor, useBreakpoint, type PressState } from '@/components/ui';
import { colors, fonts, layout } from '@/theme';

export { TechButton } from '@/components/ui';


/** Small uppercase mono label with a leading slash, e.g. "/OUR_SERVICES". */
export function Label({ children, color = colors.accent }: { children: string; color?: string }) {
  return (
    <Txt variant="mono" color={color}>
      {`/${children.toUpperCase().replace(/\s+/g, '_')}`}
    </Txt>
  );
}

/** Centred 1440 column with the site gutters, for sections that draw their own backgrounds. */
export function Frame({ children, background, overflow }: { children: ReactNode; background: string; overflow?: 'hidden' }) {
  const { bp } = useBreakpoint();
  return (
    <View style={{ backgroundColor: background, overflow }}>
      <View style={{ width: '100%', maxWidth: layout.maxWidth, alignSelf: 'center', paddingHorizontal: gutterFor(bp) }}>{children}</View>
    </View>
  );
}

/** Vertical red rule that runs the full height of a dark section. */
export function SignalLine() {
  return <View style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: 3, backgroundColor: colors.signal }} />;
}

/** Four dots in a 2 × 2 cluster, the recurring mark from the sample. */
export function DotCluster({ size = 14, tones }: { size?: number; tones: [string, string, string, string] }) {
  return (
    <View style={{ width: size * 2 + 4, flexDirection: 'row', flexWrap: 'wrap', gap: 4 }}>
      {tones.map((c, i) => (
        <View key={i} style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: c }} />
      ))}
    </View>
  );
}

/** A "+" mark at each corner, like registration marks on a print proof. */
function Crosshairs({ color, inset = -9 }: { color: string; inset?: number }) {
  const mark = (pos: ViewStyle, key: string) => (
    <View key={key} pointerEvents="none" style={[{ position: 'absolute', width: 11, height: 11 }, pos]}>
      <View style={{ position: 'absolute', left: 5, top: 0, width: 1, height: 11, backgroundColor: color }} />
      <View style={{ position: 'absolute', top: 5, left: 0, height: 1, width: 11, backgroundColor: color }} />
    </View>
  );
  return (
    <>
      {mark({ top: inset, left: inset }, 'tl')}
      {mark({ top: inset, right: inset }, 'tr')}
      {mark({ bottom: inset, left: inset }, 'bl')}
      {mark({ bottom: inset, right: inset }, 'br')}
    </>
  );
}

/** A photo set in a white mount with registration marks and an optional corner badge. */
export function FramedPhoto({
  source,
  height,
  width,
  badge,
  marks = colors.textSecondary,
  frame = colors.white,
  position,
  contentFit,
  style,
}: {
  source: ImageSource | number;
  height: number;
  width?: number | `${number}%`;
  badge?: ReactNode;
  marks?: string;
  frame?: string;
  position?: string;
  contentFit?: 'cover' | 'contain';
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <View style={[{ width: width ?? '100%', height, backgroundColor: frame, padding: 8 }, style]}>
      <Photo source={source} position={position} contentFit={contentFit} />
      {badge ? <View style={{ position: 'absolute', left: 0, bottom: 0, backgroundColor: frame, padding: 12 }}>{badge}</View> : null}
      <Crosshairs color={marks} />
    </View>
  );
}

/** A thin line ending in an arrow head, e.g. the "→" before the last headline line. */
export function ArrowLine({ color = colors.accent, width, thickness = 1.5 }: { color?: string; width?: number; thickness?: number }) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', width, flex: width ? undefined : 1 }}>
      <View style={{ flex: 1, height: thickness, backgroundColor: color }} />
      <View
        style={{
          width: 10,
          height: 10,
          marginLeft: -9,
          borderTopWidth: thickness,
          borderRightWidth: thickness,
          borderColor: color,
          transform: [{ rotate: '45deg' }],
        }}
      />
    </View>
  );
}

/** A "+" that blinks, closing a headline like a terminal cursor. */
export function BlinkPlus({ color = colors.accent, size = 40 }: { color?: string; size?: number }) {
  const [opacity] = useState(() => new Animated.Value(1));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.15, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(opacity, { toValue: 1, duration: 700, easing: Easing.inOut(Easing.quad), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return <Animated.Text style={{ opacity, color, fontFamily: fonts.mono, fontSize: size, lineHeight: size * 1.1 }}>+</Animated.Text>;
}

/** A tall capsule with a dot that slides up and down: a quiet "scroll" cue. */
export function ScrollPill({ height = 230 }: { height?: number }) {
  const travel = height - 60;
  const [y] = useState(() => new Animated.Value(0));
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(y, { toValue: travel, duration: 1800, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
        Animated.timing(y, { toValue: 0, duration: 1800, easing: Easing.inOut(Easing.cubic), useNativeDriver: Platform.OS !== 'web' }),
      ]),
    );
    loop.start();
    return () => loop.stop();
  }, [y, travel]);
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      style={{ width: 46, height, borderRadius: 23, borderWidth: 1, borderColor: colors.borders, backgroundColor: 'rgba(255,255,255,0.55)', padding: 6 }}
    >
      <Animated.View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.borders, alignItems: 'center', justifyContent: 'center', transform: [{ translateY: y }] }}>
        <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: colors.accent }} />
      </Animated.View>
    </View>
  );
}

/** A faded pixel-font wordmark that scales to fill its container's width and is cropped at the baseline. */
export function PixelWordmark({ text = 'Uwevwi', color, crop = 1 }: { text?: string; color: string; crop?: number }) {
  const [width, setWidth] = useState(0);
  const size = Math.max(40, Math.min(width / (text.length * 0.62), 460));
  return (
    <View
      accessibilityElementsHidden
      importantForAccessibility="no-hide-descendants"
      onLayout={(e) => setWidth(e.nativeEvent.layout.width)}
      style={{ width: '100%', height: size * crop, overflow: 'hidden', alignItems: 'center' }}
    >
      <Text
        numberOfLines={1}
        style={{ fontFamily: fonts.pixel, fontSize: size, lineHeight: size, color, includeFontPadding: false, userSelect: 'none' }}
      >
        {text}
      </Text>
    </View>
  );
}

const BRACKET = ['..XX', '.XX.', 'XX..', 'X...', 'X...', 'X...', 'X...', 'XX..', '.XX.', '..XX'];

/** A bracket drawn as pixel blocks, framing the pull quote. */
export function PixelBracket({ side, color, cell = 14 }: { side: 'left' | 'right'; color: string; cell?: number }) {
  return (
    <View accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      {BRACKET.map((row, y) => (
        <View key={y} style={{ flexDirection: side === 'left' ? 'row' : 'row-reverse' }}>
          {row.split('').map((ch, x) => (
            <View key={x} style={{ width: cell, height: cell, backgroundColor: ch === 'X' ? color : 'transparent' }} />
          ))}
        </View>
      ))}
    </View>
  );
}

/** A looping horizontal marquee. Children are rendered twice for a seamless wrap. */
export function Ticker({ children, duration = 38000, reverse }: { children: ReactNode; duration?: number; reverse?: boolean }) {
  const [width, setWidth] = useState(0);
  const [x] = useState(() => new Animated.Value(0));
  useEffect(() => {
    if (!width) return;
    x.setValue(reverse ? -width : 0);
    const loop = Animated.loop(
      Animated.timing(x, { toValue: reverse ? 0 : -width, duration, easing: Easing.linear, useNativeDriver: Platform.OS !== 'web' }),
    );
    loop.start();
    return () => loop.stop();
  }, [width, duration, reverse, x]);
  return (
    <View style={{ overflow: 'hidden', width: '100%' }}>
      <Animated.View style={{ flexDirection: 'row', alignSelf: 'flex-start', transform: [{ translateX: x }] }}>
        <View onLayout={(e) => setWidth(e.nativeEvent.layout.width)} style={{ flexDirection: 'row', flexShrink: 0 }}>
          {children}
        </View>
        <View style={{ flexDirection: 'row', flexShrink: 0 }}>{children}</View>
      </Animated.View>
    </View>
  );
}

/** A card that restyles itself while hovered or pressed. */
export function HoverCard({
  children,
  style,
  hoverStyle,
  onPress,
  onHover,
}: {
  children: (active: boolean) => ReactNode;
  style?: StyleProp<ViewStyle>;
  hoverStyle?: ViewStyle;
  onPress?: () => void;
  onHover?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      onHoverIn={onHover}
      accessible={!!onPress}
      style={({ pressed, hovered }: PressState) => [style, pressed || hovered ? hoverStyle : null]}
    >
      {({ pressed, hovered }: PressState) => children(!!(pressed || hovered))}
    </Pressable>
  );
}
