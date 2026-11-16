import type { ReactNode } from 'react';
import Svg, { Circle, Defs, G, Line, LinearGradient, Path, Pattern, RadialGradient, Rect, Stop } from 'react-native-svg';

import { colors } from '@/theme';

export type ArtName =
  | 'collectors'
  | 'family'
  | 'corporations'
  | 'designers'
  | 'hospitality'
  | 'museums'
  | 'foundations'
  | 'government';

type Palette = { ink: string; pop: string; tint: string; sand: string };

const REST = { ink: '#2b2927', pop: colors.accent };
const ACTIVE = { ink: '#f4f1ea', pop: colors.signal };

const range = (n: number) => Array.from({ length: n }, (_, i) => i);
const THIN = 0.8;

/** A four-point sparkle, used sparingly as a quiet accent. */
function Spark({ x, y, s = 5, fill }: { x: number; y: number; s?: number; fill: string }) {
  const k = s * 0.22;
  return (
    <Path
      d={`M${x} ${y - s} Q${x + k} ${y - k} ${x + s} ${y} Q${x + k} ${y + k} ${x} ${y + s} Q${x - k} ${y + k} ${x - s} ${y} Q${x - k} ${y - k} ${x} ${y - s} Z`}
      fill={fill}
      stroke="none"
    />
  );
}

/**
 * Fine-line illustrations on a 240 × 160 canvas. Hairline strokes in ink, soft burgundy and sand washes, and
 * a few small accents; each scene sits on the same faint halo so the set reads as one family.
 */
function Scene({ name, p, pop }: { name: ArtName; p: Palette; pop: string }): ReactNode {
  switch (name) {
    case 'collectors':
      return (
        <>
          <Path d="M96 8 L48 106 H144 Z" fill={p.sand} stroke="none" />
          <Path d="M72 26 L92 10 L112 26" strokeWidth={THIN} />
          <Circle cx={92} cy={10} r={1.8} fill={pop} stroke="none" />
          <Rect x={40} y={26} width={104} height={80} />
          <Rect x={46} y={32} width={92} height={68} strokeWidth={THIN} />
          <Rect x={50} y={36} width={84} height={60} fill={p.tint} stroke="none" />
          <Circle cx={82} cy={58} r={11} fill={p.tint} stroke={pop} />
          <Path d="M50 96 L82 70 L104 88 L120 76 L134 88 V96 Z" fill={p.sand} strokeWidth={1} />
          <Path d="M62 94 L78 80 M72 94 L86 82 M96 94 L104 88 M110 94 L120 84 M122 94 L130 88" strokeWidth={0.6} opacity={0.55} />
          <Rect x={76} y={113} width={36} height={8} strokeWidth={THIN} />
          <Line x1={82} y1={117} x2={106} y2={117} stroke={pop} strokeWidth={THIN} />
          <Rect x={158} y={87} width={52} height={7} fill={p.sand} />
          <Rect x={164} y={94} width={40} height={40} />
          <Path d="M174 98 V130 M184 98 V130 M194 98 V130" strokeWidth={0.6} opacity={0.5} />
          <Rect x={160} y={134} width={48} height={4} strokeWidth={THIN} />
          <Path d="M177 87 C167 73 169 61 180 57 H190 C201 61 203 73 193 87" fill={p.tint} />
          <Rect x={179} y={49} width={12} height={8} strokeWidth={THIN} />
          <Path d="M172 72 Q185 79 199 72" stroke={pop} strokeWidth={THIN} />
          <Circle cx={185} cy={66} r={1.4} fill={pop} stroke="none" />
        </>
      );
    case 'family':
      return (
        <>
          <Path d="M22 98 L80 50 L138 98" />
          <Path d="M34 90 V138 M126 90 V138" />
          <Rect x={103} y={56} width={10} height={22} strokeWidth={THIN} fill={p.sand} />
          <Path d="M68 138 V116 A12 12 0 0 1 92 116 V138" fill={p.tint} />
          <Circle cx={80} cy={82} r={8} strokeWidth={THIN} />
          <Path d="M72 82 H88 M80 74 V90" strokeWidth={0.6} />
          <Rect x={41} y={104} width={15} height={15} strokeWidth={THIN} fill={p.sand} />
          <Rect x={104} y={104} width={15} height={15} strokeWidth={THIN} fill={p.sand} />
          <Path d="M48.5 104 V119 M41 111.5 H56 M111.5 104 V119 M104 111.5 H119" strokeWidth={0.5} opacity={0.6} />
          <Path d="M138 102 C148 102 152 98 154 90" strokeDasharray="2 4" strokeWidth={THIN} />
          <Circle cx={184} cy={30} r={10} fill={p.tint} stroke={pop} />
          <Circle cx={184} cy={30} r={3.2} fill={pop} stroke="none" />
          <Path d="M184 40 V50 M160 50 H208 M160 50 V62 M208 50 V62" strokeWidth={1} />
          <Circle cx={160} cy={70} r={8} fill={p.sand} />
          <Circle cx={208} cy={70} r={8} fill={p.sand} />
          <Path d="M160 78 V90 M144 90 H176 M144 90 V102 M176 90 V102 M208 78 V102" strokeWidth={1} />
          <Circle cx={144} cy={110} r={6} />
          <Circle cx={176} cy={110} r={6} />
          <Circle cx={208} cy={110} r={6} fill={p.tint} stroke={pop} />
        </>
      );
    case 'corporations':
      return (
        <>
          <Rect x={52} y={32} width={66} height={106} fill={p.sand} />
          <Rect x={118} y={62} width={54} height={76} fill={p.tint} />
          <Rect x={172} y={88} width={36} height={50} fill={p.sand} />
          <Path d="M85 32 V14 M80 20 H90" strokeWidth={THIN} />
          <Circle cx={85} cy={12} r={2.2} fill={pop} stroke="none" />
          <Path d="M52 56 L96 32 M52 86 L118 48" strokeWidth={0.5} opacity={0.35} />
          {range(6).flatMap((r) =>
            range(3).map((c) => {
              const lit = (r === 1 && c === 1) || (r === 3 && c === 0) || (r === 4 && c === 2);
              return (
                <Rect key={`a${r}${c}`} x={62 + c * 19} y={42 + r * 14} width={10} height={7} strokeWidth={THIN} fill={lit ? pop : 'none'} fillOpacity={lit ? 0.7 : 1} stroke={lit ? pop : p.ink} />
              );
            }),
          )}
          {range(4).flatMap((r) =>
            range(2).map((c) => <Rect key={`b${r}${c}`} x={128 + c * 22} y={72 + r * 14} width={10} height={7} strokeWidth={THIN} />),
          )}
          {range(2).flatMap((r) =>
            range(2).map((c) => <Rect key={`c${r}${c}`} x={180 + c * 14} y={98 + r * 14} width={7} height={7} strokeWidth={THIN} />),
          )}
          <Path d="M77 138 V122 H93 V138" fill={p.tint} />
          <Path d="M150 138 V128 H168 V138" strokeWidth={THIN} />
        </>
      );
    case 'designers':
      return (
        <>
          <Rect x={92} y={72} width={70} height={48} fill={p.tint} stroke="none" />
          <Rect x={36} y={28} width={126} height={92} />
          <Path d="M92 28 V72 H162 M92 98 V120 M36 72 H64" />
          <Path d="M64 72 A16 16 0 0 1 80 88" stroke={pop} strokeWidth={THIN} />
          <Path d="M92 98 A14 14 0 0 1 106 112" stroke={pop} strokeWidth={THIN} />
          <Path d="M44 36 H84 M44 44 H70" strokeWidth={0.5} opacity={0.45} />
          <Path d="M36 134 H162 M36 129 V139 M162 129 V139" strokeWidth={THIN} />
          {range(8).map((i) => (
            <Line key={i} x1={36 + i * 18} y1={134} x2={36 + i * 18} y2={137} strokeWidth={0.6} />
          ))}
          <Circle cx={196} cy={30} r={6} fill={p.tint} stroke={pop} />
          <Circle cx={196} cy={30} r={1.6} fill={pop} stroke="none" />
          <Path d="M196 36 L180 96 M196 36 L214 96" />
          <Path d="M180 96 L176 105 M214 96 L218 105" strokeWidth={THIN} />
          <Path d="M182 108 Q197 96 212 108" strokeDasharray="2 4" stroke={pop} strokeWidth={THIN} />
          <Path d="M176 124 H220" strokeWidth={THIN} />
        </>
      );
    case 'hospitality':
      return (
        <>
          <Rect x={64} y={34} width={112} height={104} fill={p.sand} />
          <Rect x={90} y={14} width={60} height={20} fill={p.tint} />
          <Path d="M104 24 H136" stroke={pop} />
          <Circle cx={97} cy={24} r={1.4} fill={pop} stroke="none" />
          <Circle cx={143} cy={24} r={1.4} fill={pop} stroke="none" />
          {[76, 111, 146].map((x) => (
            <G key={x}>
              <Rect x={x} y={42} width={18} height={14} strokeWidth={THIN} />
              <Path d={`M${x + 9} 42 V56`} strokeWidth={0.5} />
            </G>
          ))}
          <Path d={`M54 84 L62 62 H178 L186 84 ${range(7).map(() => 'q-9.43 9 -18.86 0').join(' ')} Z`} fill={p.tint} />
          {range(6).map((i) => (
            <Line key={i} x1={80 + i * 19.7 - 7} y1={62} x2={72 + i * 19.7 - 7} y2={84} strokeWidth={0.5} opacity={0.5} />
          ))}
          <Path d="M106 138 V108 A14 14 0 0 1 134 108 V138" fill={p.tint} />
          <Circle cx={128} cy={120} r={1.6} fill={pop} stroke="none" />
          <Rect x={76} y={100} width={18} height={14} strokeWidth={THIN} />
          <Rect x={146} y={100} width={18} height={14} strokeWidth={THIN} />
          <Circle cx={205} cy={52} r={7} strokeWidth={THIN} />
          <Path d="M205 59 V84" strokeWidth={THIN} />
          <Rect x={195} y={84} width={20} height={26} rx={4} fill={p.tint} stroke={pop} />
          <Circle cx={205} cy={93} r={2.4} fill={pop} stroke="none" />
          <Path d="M200 101 H210 M200 105 H208" strokeWidth={0.6} stroke={pop} />
          <Rect x={28} y={120} width={20} height={18} fill={p.sand} />
          <Path d="M38 120 C28 108 28 100 38 90 C48 100 48 108 38 120 Z" fill={p.tint} stroke={pop} strokeWidth={1} />
          <Path d="M38 120 V96" strokeWidth={0.6} stroke={pop} />
        </>
      );
    case 'museums':
      return (
        <>
          <Path d="M36 62 L120 22 L204 62 Z" fill={p.sand} />
          <Path d="M52 58 L120 28 L188 58" strokeWidth={0.6} opacity={0.5} />
          <Circle cx={120} cy={47} r={6} fill={p.tint} stroke={pop} />
          {range(8).map((i) => {
            const a = (i / 8) * Math.PI * 2;
            return <Line key={i} x1={120 + Math.cos(a) * 9} y1={47 + Math.sin(a) * 9} x2={120 + Math.cos(a) * 13} y2={47 + Math.sin(a) * 13} stroke={pop} strokeWidth={0.7} />;
          })}
          <Rect x={40} y={62} width={160} height={10} />
          {range(6).map((i) => (
            <G key={i}>
              <Rect x={52 + i * 28} y={72} width={14} height={46} fill={i % 2 ? 'none' : p.tint} strokeWidth={1.1} />
              <Path d={`M${50 + i * 28} 72 H${68 + i * 28} M${50 + i * 28} 118 H${68 + i * 28}`} strokeWidth={THIN} />
              <Path d={`M${56 + i * 28} 78 V112 M${62 + i * 28} 78 V112`} strokeWidth={0.5} opacity={0.5} />
            </G>
          ))}
          <Rect x={36} y={118} width={168} height={7} fill={p.sand} strokeWidth={1.1} />
          <Rect x={28} y={125} width={184} height={13} strokeWidth={1.1} />
          <Path d="M28 131.5 H212" strokeWidth={0.5} opacity={0.5} />
        </>
      );
    case 'foundations':
      return (
        <>
          {range(4).map((i) => {
            const y = 134 - i * 14;
            return <Path key={i} d={`M54 ${y} V${y - 10} A34 9 0 0 1 122 ${y - 10} V${y} A34 9 0 0 1 54 ${y} Z`} fill={i % 2 ? 'none' : p.sand} />;
          })}
          <Path d="M54 82 A34 9 0 0 1 122 82 A34 9 0 0 1 54 82 Z" fill={p.tint} />
          <Path d="M88 82 C88 68 88 58 88 44" />
          <Path d="M88 58 C74 58 66 50 66 38 C80 38 88 46 88 58 Z" fill={p.tint} stroke={pop} />
          <Path d="M88 50 C102 50 110 42 110 30 C96 30 88 38 88 50 Z" fill={p.sand} />
          <Path d="M72 40 L84 54" strokeWidth={0.5} stroke={pop} />
          <Path d="M124 104 C146 104 158 98 168 94" strokeDasharray="2 4" strokeWidth={THIN} />
          <Circle cx={190} cy={64} r={34} strokeWidth={THIN} />
          <Circle cx={190} cy={64} r={27} strokeDasharray="1 5" strokeWidth={THIN} />
          <Path d="M190 82 C172 70 172 54 183 52 C187 51 190 54 190 57 C190 54 193 51 197 52 C208 54 208 70 190 82 Z" fill={p.tint} stroke={pop} />
          <Circle cx={190} cy={30} r={2} fill={pop} stroke="none" />
          <Circle cx={224} cy={64} r={2} fill={pop} stroke="none" />
        </>
      );
    case 'government':
      return (
        <>
          <Path d="M120 10 V32" strokeWidth={THIN} />
          <Path d="M120 10 H136 L132 15 L136 20 H120" fill={p.tint} stroke={pop} strokeWidth={1} />
          <Rect x={113} y={32} width={14} height={10} strokeWidth={THIN} />
          <Path d="M78 74 A42 36 0 0 1 162 74 Z" fill={p.tint} />
          <Path d="M120 42 V74 M100 48 V74 M140 48 V74 M88 58 V74 M152 58 V74" strokeWidth={0.6} opacity={0.6} />
          <Circle cx={120} cy={60} r={5} fill="none" stroke={pop} />
          <Rect x={80} y={74} width={80} height={9} fill={p.sand} />
          <Rect x={40} y={83} width={160} height={9} />
          {range(6).map((i) => (
            <G key={i}>
              <Rect x={52 + i * 28} y={92} width={12} height={32} strokeWidth={1.1} />
              <Path d={`M${58 + i * 28} 96 V120`} strokeWidth={0.5} opacity={0.5} />
            </G>
          ))}
          <Rect x={36} y={124} width={168} height={7} fill={p.sand} strokeWidth={1.1} />
          <Rect x={28} y={131} width={184} height={7} strokeWidth={1.1} />
        </>
      );
  }
}

/** Dotted blueprint backdrop that fills its container. */
export function DotGrid({ id, color }: { id: string; color: string }) {
  return (
    <Svg width="100%" height="100%" style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <Pattern id={id} width={18} height={18} patternUnits="userSpaceOnUse">
          <Circle cx={1.5} cy={1.5} r={1} fill={color} />
        </Pattern>
      </Defs>
      <Rect x={0} y={0} width="100%" height="100%" fill={`url(#${id})`} />
    </Svg>
  );
}

export function AudienceArt({ name, active, height, uid }: { name: ArtName; active: boolean; height: number; uid: string }) {
  const base = active ? ACTIVE : REST;
  const p: Palette = {
    ink: base.ink,
    pop: base.pop,
    tint: `url(#${uid}-t)`,
    sand: `url(#${uid}-s)`,
  };
  return (
    <Svg width="100%" height={height} viewBox="0 0 240 160" preserveAspectRatio="xMidYMid meet" style={{ position: 'absolute', top: 0, left: 0 }}>
      <Defs>
        <LinearGradient id={`${uid}-t`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={base.pop} stopOpacity={active ? 0.32 : 0.2} />
          <Stop offset="1" stopColor={base.pop} stopOpacity={0.04} />
        </LinearGradient>
        <LinearGradient id={`${uid}-s`} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor={base.ink} stopOpacity={active ? 0.16 : 0.09} />
          <Stop offset="1" stopColor={base.ink} stopOpacity={0.01} />
        </LinearGradient>
        <RadialGradient id={`${uid}-h`} cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={base.pop} stopOpacity={active ? 0.22 : 0.1} />
          <Stop offset="1" stopColor={base.pop} stopOpacity={0} />
        </RadialGradient>
      </Defs>
      <Circle cx={120} cy={76} r={70} fill={`url(#${uid}-h)`} />
      <Circle cx={120} cy={76} r={70} fill="none" stroke={base.ink} strokeOpacity={0.14} strokeWidth={0.8} strokeDasharray="1 5" />
      <Path d="M52 38 A70 70 0 0 1 120 6" fill="none" stroke={base.pop} strokeOpacity={0.55} strokeWidth={1} strokeLinecap="round" />
      <Spark x={26} y={34} s={5} fill={base.pop} />
      <Spark x={214} y={26} s={3.5} fill={base.ink} />
      <Spark x={212} y={116} s={4.5} fill={base.pop} />
      <Line x1={14} y1={138} x2={226} y2={138} stroke={base.ink} strokeOpacity={0.3} strokeWidth={1} strokeDasharray="1 5" strokeLinecap="round" />
      <G stroke={base.ink} strokeWidth={1.2} fill="none" strokeLinecap="round" strokeLinejoin="round">
        <Scene name={name} p={p} pop={base.pop} />
      </G>
    </Svg>
  );
}
