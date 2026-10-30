import { Linking, ScrollView, View } from 'react-native';
import type { ReactNode } from 'react';

import { Txt, useBreakpoint } from '@/components/ui';
import { colors, fonts } from '@/theme';

/**
 * A deliberately small Markdown subset, shared by the admin editor and the public article pages:
 * `## heading`, `### subheading`, `> quote`, `- bullets`, `1. numbers`, pipe tables,
 * **bold**, *italic* and [links](https://...). Blank lines separate blocks.
 */

type Inline = { text: string; bold?: boolean; italic?: boolean; href?: string };

export function parseInline(source: string): Inline[] {
  const out: Inline[] = [];
  const pattern = /\*\*(.+?)\*\*|\*(.+?)\*|\[([^\]]+)\]\(([^)\s]+)\)/g;
  let last = 0;
  for (const match of source.matchAll(pattern)) {
    const index = match.index ?? 0;
    if (index > last) out.push({ text: source.slice(last, index) });
    if (match[1] !== undefined) out.push({ text: match[1], bold: true });
    else if (match[2] !== undefined) out.push({ text: match[2], italic: true });
    else out.push({ text: match[3], href: match[4] });
    last = index + match[0].length;
  }
  if (last < source.length) out.push({ text: source.slice(last) });
  return out;
}

type Block =
  | { kind: 'h2' | 'h3' | 'quote' | 'p'; text: string }
  | { kind: 'ul' | 'ol'; items: string[] }
  | { kind: 'table'; head: string[]; rows: string[][] };

const cells = (line: string) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim());

export function parseBlocks(source: string): Block[] {
  const blocks: Block[] = [];
  for (const chunk of source.replace(/\r\n/g, '\n').split(/\n{2,}/)) {
    const lines = chunk.split('\n').filter((l) => l.trim() !== '');
    if (lines.length === 0) continue;
    const first = lines[0];
    if (first.startsWith('### ')) blocks.push({ kind: 'h3', text: first.slice(4) });
    else if (first.startsWith('## ')) blocks.push({ kind: 'h2', text: first.slice(3) });
    else if (first.startsWith('> ')) blocks.push({ kind: 'quote', text: lines.map((l) => l.replace(/^>\s?/, '')).join(' ') });
    else if (lines.every((l) => /^[-*] /.test(l))) blocks.push({ kind: 'ul', items: lines.map((l) => l.slice(2)) });
    else if (lines.every((l) => /^\d+\. /.test(l))) blocks.push({ kind: 'ol', items: lines.map((l) => l.replace(/^\d+\. /, '')) });
    else if (lines.length >= 2 && lines.every((l) => l.trim().startsWith('|'))) {
      const [head, , ...rows] = lines;
      blocks.push({ kind: 'table', head: cells(head), rows: rows.map(cells) });
    } else blocks.push({ kind: 'p', text: lines.join('\n') });
  }
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
            fontFamily: part.bold ? fonts.bodyMedium : undefined,
            fontStyle: part.italic ? 'italic' : undefined,
            textDecorationLine: part.href ? 'underline' : undefined,
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
                {block.text}
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
