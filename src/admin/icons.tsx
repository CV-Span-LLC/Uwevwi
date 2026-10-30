import Svg, { Circle, Path, Rect } from 'react-native-svg';

export type IconName =
  | 'dashboard'
  | 'research'
  | 'exhibition'
  | 'images'
  | 'comments'
  | 'bell'
  | 'search'
  | 'plus-circle'
  | 'send'
  | 'trash'
  | 'arrow-right'
  | 'arrow-left'
  | 'chevron-down'
  | 'chevron-up'
  | 'chevron-right'
  | 'more'
  | 'eye'
  | 'eye-off'
  | 'check'
  | 'image'
  | 'user'
  | 'mail'
  | 'external'
  | 'calendar'
  | 'close'
  | 'logout'
  | 'edit';

/** Simple 24px outline icons, drawn here so the admin needs no icon font. */
export function Icon({ name, size = 18, color = '#171717', strokeWidth = 1.7 }: { name: IconName; size?: number; color?: string; strokeWidth?: number }) {
  const p = { stroke: color, strokeWidth, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, fill: 'none' };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === 'dashboard' ? (
        <>
          <Rect x={3.5} y={3.5} width={7} height={9} rx={1.5} {...p} />
          <Rect x={13.5} y={3.5} width={7} height={5} rx={1.5} {...p} />
          <Rect x={13.5} y={11.5} width={7} height={9} rx={1.5} {...p} />
          <Rect x={3.5} y={15.5} width={7} height={5} rx={1.5} {...p} />
        </>
      ) : null}
      {name === 'research' ? (
        <>
          <Path d="M5 4.5A1.5 1.5 0 0 1 6.5 3H19v15H6.5A1.5 1.5 0 0 0 5 19.5V4.5Z" {...p} />
          <Path d="M5 19.5A1.5 1.5 0 0 0 6.5 21H19v-3" {...p} />
          <Path d="M9 8h6M9 11.5h4" {...p} />
        </>
      ) : null}
      {name === 'exhibition' ? (
        <>
          <Rect x={3.5} y={4.5} width={17} height={12} rx={1.5} {...p} />
          <Path d="m3.5 14 4.5-4.5 4 4 3-3 5.5 5.5" {...p} />
          <Path d="M8 20.5h8M12 16.5v4" {...p} />
        </>
      ) : null}
      {name === 'images' ? (
        <>
          <Rect x={3.5} y={5.5} width={14} height={13} rx={1.5} {...p} />
          <Path d="M7 5.5V4h13.5v12.5H17.5" {...p} />
          <Circle cx={8} cy={10} r={1.3} {...p} />
          <Path d="m3.5 16 4.5-4 4 3.5 2-1.5 3.5 3" {...p} />
        </>
      ) : null}
      {name === 'comments' ? <Path d="M4 5.5A1.5 1.5 0 0 1 5.5 4h13A1.5 1.5 0 0 1 20 5.5v9a1.5 1.5 0 0 1-1.5 1.5H11l-4.5 4v-4h-1A1.5 1.5 0 0 1 4 14.5v-9Z" {...p} /> : null}
      {name === 'bell' ? (
        <>
          <Path d="M6 17V11a6 6 0 1 1 12 0v6l1.5 2h-15L6 17Z" {...p} />
          <Path d="M10 21h4" {...p} />
        </>
      ) : null}
      {name === 'search' ? (
        <>
          <Circle cx={11} cy={11} r={6.5} {...p} />
          <Path d="m20 20-4-4" {...p} />
        </>
      ) : null}
      {name === 'plus-circle' ? (
        <>
          <Circle cx={12} cy={12} r={9} {...p} />
          <Path d="M12 8v8M8 12h8" {...p} />
        </>
      ) : null}
      {name === 'send' ? <Path d="M21 3 10.5 13.5M21 3l-7 18-3.5-7.5L3 10l18-7Z" {...p} /> : null}
      {name === 'trash' ? (
        <>
          <Path d="M4 7h16M10 11v6M14 11v6" {...p} />
          <Path d="M6 7l1 12a1.5 1.5 0 0 0 1.5 1.4h7A1.5 1.5 0 0 0 17 19l1-12M9 7V4.5h6V7" {...p} />
        </>
      ) : null}
      {name === 'arrow-right' ? <Path d="M4 12h16m-6-6 6 6-6 6" {...p} /> : null}
      {name === 'arrow-left' ? <Path d="M20 12H4m6-6-6 6 6 6" {...p} /> : null}
      {name === 'chevron-down' ? <Path d="m6 9 6 6 6-6" {...p} /> : null}
      {name === 'chevron-up' ? <Path d="m6 15 6-6 6 6" {...p} /> : null}
      {name === 'chevron-right' ? <Path d="m9 6 6 6-6 6" {...p} /> : null}
      {name === 'more' ? (
        <>
          <Circle cx={12} cy={5.5} r={1.4} fill={color} />
          <Circle cx={12} cy={12} r={1.4} fill={color} />
          <Circle cx={12} cy={18.5} r={1.4} fill={color} />
        </>
      ) : null}
      {name === 'eye' ? (
        <>
          <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" {...p} />
          <Circle cx={12} cy={12} r={2.7} {...p} />
        </>
      ) : null}
      {name === 'eye-off' ? (
        <>
          <Path d="M4 4l16 16M9.9 5.8A9 9 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a16 16 0 0 1-2.9 3.6M6.3 7.7A16 16 0 0 0 2.5 12S6 18.5 12 18.5a9 9 0 0 0 3.2-.6" {...p} />
          <Path d="M10 10a2.7 2.7 0 0 0 3.9 3.7" {...p} />
        </>
      ) : null}
      {name === 'check' ? <Path d="m5 12.5 4.5 4.5L19 7.5" {...p} /> : null}
      {name === 'image' ? (
        <>
          <Rect x={3.5} y={4.5} width={17} height={15} rx={2} {...p} />
          <Circle cx={9} cy={10} r={1.6} {...p} />
          <Path d="m4 17 5-4.5 3.5 3 3-2.5 4.5 4" {...p} />
        </>
      ) : null}
      {name === 'user' ? (
        <>
          <Circle cx={12} cy={8} r={3.6} {...p} />
          <Path d="M5 20a7 7 0 0 1 14 0" {...p} />
        </>
      ) : null}
      {name === 'mail' ? (
        <>
          <Rect x={3} y={5.5} width={18} height={13} rx={2} {...p} />
          <Path d="m3.5 7 8.5 6.5L20.5 7" {...p} />
        </>
      ) : null}
      {name === 'external' ? <Path d="M14 4h6v6M20 4l-9 9M18 14v4.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" {...p} /> : null}
      {name === 'calendar' ? (
        <>
          <Rect x={3.5} y={5} width={17} height={15} rx={2} {...p} />
          <Path d="M3.5 10h17M8 3v4M16 3v4" {...p} />
        </>
      ) : null}
      {name === 'close' ? <Path d="m6 6 12 12M18 6 6 18" {...p} /> : null}
      {name === 'logout' ? <Path d="M10 4H6.5A1.5 1.5 0 0 0 5 5.5v13A1.5 1.5 0 0 0 6.5 20H10M15 8l4 4-4 4M19 12H9" {...p} /> : null}
      {name === 'edit' ? <Path d="M4 20h4l10.5-10.5a2.1 2.1 0 0 0-3-3L5 17v3Z M14 8l3 3" {...p} /> : null}
    </Svg>
  );
}
