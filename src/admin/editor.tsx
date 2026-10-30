import { useRef, useState, type ComponentRef } from 'react';
import { Pressable, TextInput, View } from 'react-native';

import { A, AText } from '@/admin/ui';
import { Markdown } from '@/lib/markdown';
import { fonts } from '@/theme';

type Selection = { start: number; end: number };

type Tool = { label: string; hint: string; apply: (text: string, sel: Selection) => { text: string; sel: Selection } };

function wrap(before: string, after: string, placeholder: string): Tool['apply'] {
  return (text, { start, end }) => {
    const chosen = text.slice(start, end) || placeholder;
    const next = text.slice(0, start) + before + chosen + after + text.slice(end);
    return { text: next, sel: { start: start + before.length, end: start + before.length + chosen.length } };
  };
}

function linePrefix(prefix: string | ((n: number) => string)): Tool['apply'] {
  return (text, { start, end }) => {
    const lineStart = text.lastIndexOf('\n', start - 1) + 1;
    const lineEndRaw = text.indexOf('\n', end);
    const lineEnd = lineEndRaw === -1 ? text.length : lineEndRaw;
    const block = text.slice(lineStart, lineEnd);
    const lines = block.split('\n').map((line, i) => (typeof prefix === 'string' ? prefix : prefix(i + 1)) + line.replace(/^(#{1,3} |> |[-*] |\d+\. )/, ''));
    const replaced = lines.join('\n');
    return { text: text.slice(0, lineStart) + replaced + text.slice(lineEnd), sel: { start: lineStart, end: lineStart + replaced.length } };
  };
}

const TOOLS: Tool[] = [
  { label: 'H2', hint: 'Heading', apply: linePrefix('## ') },
  { label: 'H3', hint: 'Subheading', apply: linePrefix('### ') },
  { label: 'B', hint: 'Bold', apply: wrap('**', '**', 'bold text') },
  { label: 'I', hint: 'Italic', apply: wrap('*', '*', 'italic text') },
  { label: 'Link', hint: 'Link', apply: (text, sel) => {
      const chosen = text.slice(sel.start, sel.end) || 'link text';
      const insert = `[${chosen}](https://)`;
      return { text: text.slice(0, sel.start) + insert + text.slice(sel.end), sel: { start: sel.start + chosen.length + 3, end: sel.start + insert.length - 1 } };
    } },
  { label: '• List', hint: 'Bulleted list', apply: linePrefix('- ') },
  { label: '1. List', hint: 'Numbered list', apply: linePrefix((n) => `${n}. `) },
  { label: 'Quote', hint: 'Quote', apply: linePrefix('> ') },
];

/** Plain-text Markdown editor with a formatting toolbar and a live preview. */
export function MarkdownEditor({ value, onChange, error, minHeight = 420 }: { value: string; onChange: (v: string) => void; error?: boolean; minHeight?: number }) {
  const [mode, setMode] = useState<'write' | 'preview'>('write');
  const [selection, setSelection] = useState<Selection>({ start: 0, end: 0 });
  const [forced, setForced] = useState<Selection | undefined>();
  const input = useRef<ComponentRef<typeof TextInput>>(null);

  const run = (tool: Tool) => {
    const result = tool.apply(value, selection);
    onChange(result.text);
    setSelection(result.sel);
    setForced(result.sel);
    input.current?.focus();
  };

  return (
    <View style={{ borderWidth: 1, borderColor: error ? A.accent : A.line, borderRadius: 8, backgroundColor: A.white, overflow: 'hidden' }}>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 4, padding: 8, borderBottomWidth: 1, borderBottomColor: A.line, backgroundColor: A.field }}>
        {TOOLS.map((tool) => (
          <Pressable key={tool.label} accessibilityRole="button" accessibilityLabel={tool.hint} disabled={mode === 'preview'} onPress={() => run(tool)} style={{ paddingHorizontal: 9, paddingVertical: 6, borderRadius: 6, opacity: mode === 'preview' ? 0.4 : 1 }}>
            <AText kind="small" style={{ fontFamily: tool.label === 'B' ? fonts.bodyMedium : fonts.body, fontStyle: tool.label === 'I' ? 'italic' : 'normal' }}>
              {tool.label}
            </AText>
          </Pressable>
        ))}
        <View style={{ flex: 1 }} />
        {(['write', 'preview'] as const).map((m) => (
          <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: mode === m }} onPress={() => setMode(m)} style={{ paddingHorizontal: 10, paddingVertical: 6, borderRadius: 6, backgroundColor: mode === m ? A.white : 'transparent' }}>
            <AText kind="small" color={mode === m ? A.accent : A.muted}>
              {m === 'write' ? 'Write' : 'Preview'}
            </AText>
          </Pressable>
        ))}
      </View>
      {mode === 'write' ? (
        <TextInput
          ref={input}
          value={value}
          onChangeText={onChange}
          onSelectionChange={(e) => {
            setSelection(e.nativeEvent.selection);
            setForced(undefined);
          }}
          selection={forced}
          multiline
          placeholder="Start writing your research content…"
          placeholderTextColor={A.faint}
          style={[{ minHeight, padding: 16, fontFamily: fonts.body, fontSize: 14, lineHeight: 22, color: A.text, textAlignVertical: 'top' }, { outlineStyle: 'none' } as object]}
        />
      ) : (
        <View style={{ minHeight, padding: 16 }}>{value.trim() ? <Markdown source={value} gap={16} /> : <AText color={A.muted}>Nothing to preview yet.</AText>}</View>
      )}
    </View>
  );
}
