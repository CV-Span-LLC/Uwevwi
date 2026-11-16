import { Image } from 'expo-image';
import { useState, type ReactNode } from 'react';
import { Linking, ScrollView, View } from 'react-native';

import { Txt, useBreakpoint } from '@/components/ui';
import { assetUrl } from '@/lib/api';
import { colors, fonts } from '@/theme';

/**
 * The Markdown subset shared by the admin editor and the public article pages:
 * `## heading`, `### subheading`, `> quote`, `- bullets`, `1. numbers`, pipe tables, `---` dividers,
 * fenced code blocks, `![caption](/uploads/file.jpg)` images, and inline **bold**, *italic*, ~~strike~~,
 * `code` and [links](https://...). Blank lines separate blocks.
 */

type Inline = { text: string; bold?: boolean; italic?: boolean; strike?: boolean; code?: boolean; href?: string };

export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|~~(.+?)~~|`([^`]+)`|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ text: source.slice(last, index) });
    if (match[1] !== undefined) out.push({ text: match[1], bold: true });
    else if (match[2] !== undefined) out.push({ text: match[2], italic: true });
    else if (match[3] !== undefined) out.push({ text: match[3], strike: true });
    else if (match[4] !== undefined) out.push({ text: match[4], code: true });
    else out.push({ text: match[5], href: match[6] });
    last = index + match[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last) });
  return out;
}

export type Block =
  | { kind: 'h2' | 'h3' | 'quote' | 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'image'; alt: string; src: string }
  | { kind: 'code'; text: string }
  | { kind: 'hr' };

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

function blockFromLines(lines: string[]): Block {
  const first = lines[0];
  const image = lines.length === 1 ? first.trim().match(/^!\[(.*?)\]\((\S+?)\)$/) : null;
  if (image) return { kind: 'image', alt: image[1], src: image[2] };
  if (lines.length === 1 && /^(-{3,}|\*{3,}|_{3,})$/.test(first.trim())) return { kind: 'hr' };
  if (first.startsWith('### ')) return { kind: 'h3', text: first.slice(4) };
  if (first.startsWith('## ')) return { kind: 'h2', text: first.slice(3) };
  if (first.startsWith('> ')) return { kind: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') };
  if (lines.every((l) => /^[-*] /.test(l))) return { kind: 'ul', items: lines.map((l) => l.slice(2)) };
  if (lines.every((l) => /^\d+\. /.test(l))) return { kind: 'ol', items: lines.map((l) => l.replace(/^\d+\. /, '')) };
  if (lines.length >= 2 && lines.every((l) => l.trim().startsWith('|'))) {
    const [head, , ...rows] = lines;
    return { kind: 'table', head: cells(head), rows: rows.map(cells) };
  }
  return { kind: 'p', text: lines.join('\n') };
}

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  let current: string[] = [];
  let code: string[] | null = null;
  const flush = () => {
    if (current.length) blocks.push(blockFromLines(current));
    current = [];
  };
  for (const line of source.replace(/\r\n/g, '\n').split('\n')) {
    if (line.trim().startsWith('```')) {
      if (code === null) {
        flush();
        code = [];
      } else {
        blocks.push({ kind: 'code', text: code.join('\n') });
        code = null;
      }
    } else if (code !== null) code.push(line);
    else if (line.trim() === '') flush();
    else current.push(line);
  }
  if (code !== null) blocks.push({ kind: 'code', text: code.join('\n') });
  flush();
  return blocks;
}

function Inlines({ source, color = colors.textSecondary }: { source: string; color?: string }) {
  return (
    <>
      {parseInline(source).map((part, i) => (
        <Txt
          key={i}
          color={part.bold ? colors.text : part.href ? colors.accent : color}
          style={{
            fontFamily: part.code ? fonts.mono : part.bold ? fonts.bodyMedium : undefined,
            fontStyle: part.italic ? 'italic' : undefined,
            textDecorationLine: part.href ? 'underline' : part.strike ? 'line-through' : undefined,
            backgroundColor: part.code ? colors.background : undefined,
            fontSize: part.code ? 14 : undefined,
          }}
          onPress={part.href ? () => Linking.openURL(part.href as string) : undefined}
        >
          {part.text}
        </Txt>
      ))}
    </>
  );
}

function Table({ head, rows }: { head: string[]; rows: string[][] }) {
  const { isMobile } = useBreakpoint();
  const minWidth = 760;
  return (
    <ScrollView horizontal={isMobile} showsHorizontalScrollIndicator={false}>
      <View style={{ width: isMobile ? minWidth : '100%', borderWidth: 1, borderColor: colors.darkSection, borderRadius: 8, overflow: 'hidden' }}>
        {[head, ...rows].map((row, r) => (
          <View key={r} style={{ flexDirection: 'row', borderBottomWidth: r === rows.length ? 0 : 1, borderBottomColor: colors.darkSection }}>
            {row.map((cell, c) => (
              <View
                key={c}
                style={{
                  flex: c === 1 ? 2 : 1,
                  paddingHorizontal: 24,
                  paddingVertical: 20,
                  alignItems: r === 0 ? 'center' : 'flex-start',
                  borderRightWidth: c === row.length - 1 ? 0 : 1,
                  borderRightColor: colors.darkSection,
                }}
              >
                <Txt variant={r === 0 ? 'large' : 'body'} color={r === 0 ? colors.text : colors.textSecondary}>
                  {cell}
                </Txt>
              </View>
            ))}
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

/** An uploaded or linked picture at its natural proportions, captioned with its alt text. */
function MdImage({ src, alt }: { src: string; alt: string }) {
  const [ratio, setRatio] = useState(16 / 10);
  const uri = src.startsWith('/uploads') ? assetUrl(src) : src;
  return (
    <View style={{ gap: 10 }}>
      <Image
        source={{ uri }}
        accessibilityLabel={alt}
        contentFit="cover"
        style={{ width: '100%', aspectRatio: ratio, borderRadius: 4, backgroundColor: colors.background }}
        onLoad={(e) => {
          const { width, height } = e.source;
          if (width && height) setRatio(width / height);
        }}
      />
      {alt ? (
        <Txt variant="mono" color={colors.textSecondary}>
          {alt}
        </Txt>
      ) : null}
    </View>
  );
}

export function Markdown({ source, gap = 24 }: { source: string; gap?: number }): ReactNode {
  const blocks = parseBlocks(source);
  return (
    <View style={{ gap }}>
      {blocks.map((block, i) => {
        switch (block.kind) {
          case 'h2':
            return (
              <Txt key={i} variant="h3">
                {block.text}
              </Txt>
            );
          case 'h3':
            return (
              <Txt key={i} variant="large">
                {block.text}
              </Txt>
            );
          case 'quote':
            return (
              <Txt key={i} variant="quote" style={{ fontFamily: fonts.quote }}>
                <Inlines source={block.text} color={colors.text} />
              </Txt>
            );
          case 'ul':
          case 'ol':
            return (
              <View key={i} style={{ gap: 8 }}>
                {block.items.map((item, n) => (
                  <View key={n} style={{ flexDirection: 'row', gap: 12 }}>
                    <Txt style={{ width: 24 }}>{block.kind === 'ol' ? `${n + 1}.` : '•'}</Txt>
                    <Txt style={{ flex: 1 }} color={colors.textSecondary}>
                      <Inlines source={item} />
                    </Txt>
                  </View>
                ))}
              </View>
            );
          case 'table':
            return <Table key={i} head={block.head} rows={block.rows} />;
          case 'image':
            return <MdImage key={i} src={block.src} alt={block.alt} />;
          case 'hr':
            return <View key={i} style={{ height: 1, backgroundColor: colors.borders }} />;
          case 'code':
            return (
              <ScrollView key={i} horizontal showsHorizontalScrollIndicator={false} style={{ backgroundColor: colors.darkSection, borderRadius: 8 }} contentContainerStyle={{ padding: 16 }}>
                <Txt variant="monoBody" color="#f4f1ea">
                  {block.text}
                </Txt>
              </ScrollView>
            );
          default:
            return (
              <Txt key={i} color={colors.textSecondary}>
                <Inlines source={block.text} />
              </Txt>
            );
        }
      })}
    </View>
  );
}
