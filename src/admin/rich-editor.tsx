import { useCallback, useEffect, useRef, useState, type ClipboardEvent as ReactClipboardEvent, type DragEvent as ReactDragEvent, type MouseEvent as ReactMouseEvent } from 'react';
import { Image } from 'expo-image';
import { Platform, Pressable, View } from 'react-native';

import { MarkdownEditor } from '@/admin/editor';
import { Icon, type IconName } from '@/admin/icons';
import { A, AText, Btn, Field, Modal, errorText, pickAndUpload, useToast } from '@/admin/ui';
import { assetUrl, uploadImage } from '@/lib/api';
import { htmlToMarkdown, imageHtml, markdownToHtml } from '@/lib/markdown-html';
import { fonts } from '@/theme';

/**
 * Rich-text editor for research content. On the web it is a visual (WYSIWYG) editor that reads and writes the
 * site's Markdown, so what you see while writing is what the article page shows. Other platforms fall back to
 * the Markdown editor.
 */

const CSS = `
.uw-rte{position:relative;outline:none;min-height:440px;padding:26px 30px 40px;font-family:Inter_400Regular,Inter,system-ui,sans-serif;font-size:15.5px;line-height:1.75;color:#3d3b38;caret-color:#6e252c;word-break:break-word}
.uw-rte h2{font-family:CormorantGaramond_400Regular,Georgia,serif;font-size:32px;line-height:1.15;font-weight:400;color:#171717;margin:1.3em 0 .5em}
.uw-rte h3{font-family:Inter_500Medium,Inter,sans-serif;font-size:18px;line-height:1.4;font-weight:500;color:#171717;margin:1.2em 0 .4em}
.uw-rte p{margin:0 0 1.1em}
.uw-rte strong,.uw-rte b{font-family:Inter_500Medium,Inter,sans-serif;color:#171717;font-weight:500}
.uw-rte blockquote{margin:1.3em 0;padding:2px 0 2px 20px;border-left:3px solid #6e252c;font-family:Georgia,serif;font-size:21px;line-height:1.5;color:#171717}
.uw-rte ul,.uw-rte ol{margin:0 0 1.1em;padding-left:28px}
.uw-rte li{margin:0 0 .35em}
.uw-rte a{color:#6e252c;text-decoration:underline;cursor:text}
.uw-rte img{display:block;max-width:100%;height:auto;margin:10px 0;border-radius:6px;cursor:pointer;background:#f4f2ee}
.uw-rte img.uw-selected{outline:3px solid #6e252c;outline-offset:2px}
.uw-rte hr{border:none;border-top:1px solid #d6d1c6;margin:1.8em 0}
.uw-rte table{border-collapse:collapse;width:100%;margin:1.2em 0}
.uw-rte td,.uw-rte th{border:1px solid #d6d1c6;padding:10px 12px;vertical-align:top;min-width:60px}
.uw-rte th{background:#f4f2ee;font-family:Inter_500Medium,Inter,sans-serif;font-weight:500;text-align:left;color:#171717}
.uw-rte pre{background:#1d1c1a;color:#f4f1ea;padding:14px 16px;border-radius:8px;overflow:auto;font-family:JetBrainsMono_400Regular,monospace;font-size:13px;line-height:1.6;margin:1.2em 0;white-space:pre-wrap}
.uw-rte code{font-family:JetBrainsMono_400Regular,monospace;background:#f4f2ee;padding:1px 5px;border-radius:4px;font-size:.88em}
.uw-rte pre code{background:transparent;padding:0}
.uw-rte.uw-empty:before{content:attr(data-placeholder);position:absolute;left:30px;top:26px;color:#a29d93;pointer-events:none}
`;

type Active = { bold: boolean; italic: boolean; strike: boolean; ul: boolean; ol: boolean; block: string };
const IDLE: Active = { bold: false, italic: false, strike: false, ul: false, ol: false, block: 'p' };

const BLOCK_LABELS: Record<string, string> = { p: 'Paragraph', h2: 'Heading', h3: 'Subheading', blockquote: 'Quote', pre: 'Code block' };

const resolveImage = (path: string) => assetUrl(path) ?? path;

function Tool({ label, hint, onPress, active, icon, style, disabled }: { label?: string; hint: string; onPress: () => void; active?: boolean; icon?: IconName; style?: object; disabled?: boolean }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={hint}
      accessibilityState={{ selected: !!active, disabled }}
      disabled={disabled}
      onPress={onPress}
      style={({ hovered }: { hovered?: boolean }) => ({
        minWidth: 32,
        height: 32,
        paddingHorizontal: label && label.length > 2 ? 9 : 6,
        borderRadius: 7,
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
        gap: 5,
        backgroundColor: active ? A.accentSoft : hovered ? A.field : 'transparent',
        opacity: disabled ? 0.4 : 1,
      })}
    >
      {icon ? <Icon name={icon} size={16} color={active ? A.accent : A.text} /> : null}
      {label ? (
        <AText kind="small" color={active ? A.accent : A.text} style={[{ fontSize: 13 }, style]}>
          {label}
        </AText>
      ) : null}
    </Pressable>
  );
}

/** Writes straight to the DOM image the editor is showing. */
function setImageAlt(img: HTMLImageElement, alt: string) {
  img.alt = alt;
}

const Divider = () => <View style={{ width: 1, height: 20, backgroundColor: A.line, marginHorizontal: 4 }} />;

type Dialog = 'link' | 'image' | 'table' | null;

function WebEditor({ value, onChange, error, minHeight }: { value: string; onChange: (v: string) => void; error?: boolean; minHeight: number }) {
  const toast = useToast();
  const ref = useRef<HTMLDivElement>(null);
  const saved = useRef<Range | null>(null);
  const [active, setActive] = useState<Active>(IDLE);
  const [dialog, setDialog] = useState<Dialog>(null);
  const [styleMenu, setStyleMenu] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [alt, setAlt] = useState('');
  const [picked, setPicked] = useState('');

  const words = value.trim() ? value.replace(/[#>*`~|\-![\]()]/g, ' ').trim().split(/\s+/).length : 0;

  const sync = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    onChange(htmlToMarkdown(el));
    el.classList.toggle('uw-empty', !el.textContent?.trim() && !el.querySelector('img,table,hr'));
  }, [onChange]);

  const readState = useCallback(() => {
    const block = (document.queryCommandValue('formatBlock') || 'p').toString().toLowerCase().replace(/[<>]/g, '');
    setActive({
      bold: document.queryCommandState('bold'),
      italic: document.queryCommandState('italic'),
      strike: document.queryCommandState('strikeThrough'),
      ul: document.queryCommandState('insertUnorderedList'),
      ol: document.queryCommandState('insertOrderedList'),
      block: block in BLOCK_LABELS ? block : block === 'h1' ? 'h2' : 'p',
    });
  }, []);

  // Fill the editor once, and keep the last selection so toolbar clicks can act on it.
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (!document.getElementById('uw-rte-css')) {
      const style = document.createElement('style');
      style.id = 'uw-rte-css';
      style.textContent = CSS;
      document.head.appendChild(style);
    }
    el.innerHTML = markdownToHtml(value, resolveImage);
    el.classList.toggle('uw-empty', !el.textContent?.trim() && !el.querySelector('img,table,hr'));
    try {
      document.execCommand('defaultParagraphSeparator', false, 'p');
    } catch {
      // Older browsers ignore this.
    }
    const onSelection = () => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0 || !el.contains(selection.anchorNode)) return;
      saved.current = selection.getRangeAt(0).cloneRange();
      readState();
    };
    document.addEventListener('selectionchange', onSelection);
    return () => document.removeEventListener('selectionchange', onSelection);
    // The editor is filled once; later edits flow the other way (editor to form).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const restore = () => {
    const el = ref.current;
    if (!el) return;
    el.focus();
    const selection = window.getSelection();
    if (selection && saved.current) {
      selection.removeAllRanges();
      selection.addRange(saved.current);
    }
  };

  const exec = (command: string, arg?: string) => {
    restore();
    document.execCommand(command, false, arg);
    sync();
    readState();
  };

  const insertHtml = (html: string) => exec('insertHTML', html);

  const setBlock = (tag: string) => {
    setStyleMenu(false);
    exec('formatBlock', tag);
  };

  const uploadAndInsert = useCallback(
    async (file: File) => {
      try {
        const path = await uploadImage({ uri: URL.createObjectURL(file), name: file.name, type: file.type, webFile: file });
        insertHtml(`<p>${imageHtml(path, '', resolveImage)}</p><p><br></p>`);
        toast('Image added.');
      } catch (err) {
        toast(errorText(err), 'error');
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  const onPaste = (e: ReactClipboardEvent<HTMLDivElement>) => {
    const file = Array.from(e.clipboardData.files).find((f) => f.type.startsWith('image/'));
    e.preventDefault();
    if (file) {
      uploadAndInsert(file);
      return;
    }
    const text = e.clipboardData.getData('text/plain');
    if (!text) return;
    // Pasted Markdown is rendered; anything else becomes clean paragraphs without the source page's styling.
    const looksLikeMarkdown = /^(#{2,3} |[-*] |\d+\. |> |\|)/m.test(text) || /\*\*|\]\(/.test(text);
    const html = looksLikeMarkdown
      ? markdownToHtml(text, resolveImage)
      : text
          .split(/\n{2,}/)
          .map((p) => `<p>${p.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/\n/g, '<br>')}</p>`)
          .join('');
    document.execCommand('insertHTML', false, html);
    sync();
  };

  const onDrop = (e: ReactDragEvent<HTMLDivElement>) => {
    const file = Array.from(e.dataTransfer.files).find((f) => f.type.startsWith('image/'));
    if (!file) return;
    e.preventDefault();
    uploadAndInsert(file);
  };

  const onClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    el.querySelectorAll('img.uw-selected').forEach((n) => n.classList.remove('uw-selected'));
    const target = e.target as HTMLElement;
    if (target.tagName === 'IMG') {
      target.classList.add('uw-selected');
      setImage(target as HTMLImageElement);
      setAlt((target as HTMLImageElement).alt);
    } else setImage(null);
  };

  const openDialog = (kind: Exclude<Dialog, null>) => {
    // Remember what was selected before the dialog takes focus.
    const selection = window.getSelection();
    if (selection && selection.rangeCount && ref.current?.contains(selection.anchorNode)) saved.current = selection.getRangeAt(0).cloneRange();
    setPicked(saved.current?.toString() ?? '');
    setDialog(kind);
  };

  return (
    <View style={{ borderWidth: 1, borderColor: error ? A.accent : A.lineStrong, borderRadius: 10, backgroundColor: A.white }}>
      <View
        style={[
          { flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center', gap: 2, padding: 8, borderBottomWidth: 1, borderBottomColor: A.line, backgroundColor: '#fbfaf8', borderTopLeftRadius: 9, borderTopRightRadius: 9, zIndex: 20 },
          { position: 'sticky', top: 0 } as object,
        ]}
      >
        <Tool icon="undo" hint="Undo" onPress={() => exec('undo')} />
        <Tool icon="redo" hint="Redo" onPress={() => exec('redo')} />
        <Divider />
        <View style={{ zIndex: 30 }}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Text style"
            onPress={() => setStyleMenu((v) => !v)}
            style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', gap: 6, height: 32, minWidth: 118, paddingHorizontal: 10, borderRadius: 7, backgroundColor: styleMenu || hovered ? A.field : 'transparent', justifyContent: 'space-between' })}
          >
            <AText kind="small" style={{ fontSize: 13 }}>
              {BLOCK_LABELS[active.block] ?? 'Paragraph'}
            </AText>
            <Icon name="chevron-down" size={14} color={A.muted} />
          </Pressable>
          {styleMenu ? (
            <View style={{ position: 'absolute', top: 36, left: 0, width: 210, backgroundColor: A.white, borderRadius: 10, borderWidth: 1, borderColor: A.line, padding: 4, boxShadow: '0 8px 24px rgba(23,23,23,0.12)' }}>
              {(
                [
                  ['p', 'Paragraph', { fontFamily: fonts.body, fontSize: 14 }],
                  ['h2', 'Heading', { fontFamily: fonts.display, fontSize: 22 }],
                  ['h3', 'Subheading', { fontFamily: fonts.bodyMedium, fontSize: 15 }],
                  ['blockquote', 'Quote', { fontFamily: fonts.quote, fontSize: 15, fontStyle: 'italic' as const }],
                  ['pre', 'Code block', { fontFamily: fonts.mono, fontSize: 12 }],
                ] as const
              ).map(([tag, label, look]) => (
                <Pressable
                  key={tag}
                  accessibilityRole="button"
                  onPress={() => setBlock(tag)}
                  style={({ hovered }: { hovered?: boolean }) => ({ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 10, paddingVertical: 8, borderRadius: 6, backgroundColor: hovered ? A.field : 'transparent' })}
                >
                  <AText style={look}>{label}</AText>
                  {active.block === tag ? <Icon name="check" size={14} color={A.accent} /> : null}
                </Pressable>
              ))}
            </View>
          ) : null}
        </View>
        <Divider />
        <Tool label="B" hint="Bold" active={active.bold} onPress={() => exec('bold')} style={{ fontFamily: fonts.bodyMedium }} />
        <Tool label="I" hint="Italic" active={active.italic} onPress={() => exec('italic')} style={{ fontStyle: 'italic' }} />
        <Tool label="S" hint="Strikethrough" active={active.strike} onPress={() => exec('strikeThrough')} style={{ textDecorationLine: 'line-through' }} />
        <Tool label="</>" hint="Inline code" onPress={() => {
          const text = window.getSelection()?.toString() || saved.current?.toString() || 'code';
          insertHtml(`<code>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;')}</code>&nbsp;`);
        }} style={{ fontFamily: fonts.mono, fontSize: 12 }} />
        <Divider />
        <Tool label="• List" hint="Bulleted list" active={active.ul} onPress={() => exec('insertUnorderedList')} />
        <Tool label="1. List" hint="Numbered list" active={active.ol} onPress={() => exec('insertOrderedList')} />
        <Tool label="❝" hint="Quote" active={active.block === 'blockquote'} onPress={() => setBlock(active.block === 'blockquote' ? 'p' : 'blockquote')} />
        <Divider />
        <Tool label="Link" hint="Insert link" onPress={() => openDialog('link')} />
        <Tool icon="image" label="Image" hint="Insert image" onPress={() => openDialog('image')} />
        <Tool label="Table" hint="Insert table" onPress={() => openDialog('table')} />
        <Tool label="―" hint="Divider" onPress={() => insertHtml('<hr><p><br></p>')} />
        <Divider />
        <Tool label="Clear" hint="Clear formatting" onPress={() => exec('removeFormat')} />
      </View>

      {image ? (
        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: 10, padding: 10, borderBottomWidth: 1, borderBottomColor: A.line, backgroundColor: A.accentSoft }}>
          <View style={{ flex: 1 }}>
            <Field
              label="Image caption (also used as alt text)"
              value={alt}
              onChangeText={(v) => {
                setAlt(v);
                setImageAlt(image, v);
                sync();
              }}
              placeholder="Describe the image"
            />
          </View>
          <Btn
            label="Remove image"
            kind="danger"
            icon="trash"
            onPress={() => {
              image.remove();
              setImage(null);
              sync();
            }}
          />
        </View>
      ) : null}

      <div
        ref={ref}
        className="uw-rte"
        contentEditable
        suppressContentEditableWarning
        spellCheck
        role="textbox"
        aria-multiline="true"
        aria-label="Content"
        data-placeholder="Start writing your research content…"
        style={{ minHeight }}
        onInput={sync}
        onPaste={onPaste}
        onDrop={onDrop}
        onClick={onClick}
        onBlur={() => setStyleMenu(false)}
      />

      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', paddingHorizontal: 14, paddingVertical: 9, borderTopWidth: 1, borderTopColor: A.line, backgroundColor: '#fbfaf8', borderBottomLeftRadius: 9, borderBottomRightRadius: 9 }}>
        <AText kind="tiny" color={A.muted}>
          {words} {words === 1 ? 'word' : 'words'} · {Math.max(1, Math.round(words / 220))} min read
        </AText>
        <AText kind="tiny" color={A.muted}>
          Paste or drop images straight into the text
        </AText>
      </View>

      {dialog === 'link' ? <LinkDialog initialText={picked} onClose={() => setDialog(null)} onApply={(text, url) => {
        setDialog(null);
        restore();
        if (picked) document.execCommand('createLink', false, url);
        else document.execCommand('insertHTML', false, `<a href="${url.replace(/"/g, '&quot;')}">${(text || url).replace(/&/g, '&amp;').replace(/</g, '&lt;')}</a>&nbsp;`);
        sync();
      }} onRemove={() => {
        setDialog(null);
        exec('unlink');
      }} /> : null}
      {dialog === 'image' ? <ImageDialog onClose={() => setDialog(null)} onInsert={(path, caption) => {
        setDialog(null);
        insertHtml(`<p>${imageHtml(path, caption, resolveImage)}</p><p><br></p>`);
      }} /> : null}
      {dialog === 'table' ? <TableDialog onClose={() => setDialog(null)} onInsert={(rows, cols) => {
        setDialog(null);
        const head = Array.from({ length: cols }, (_, i) => `<th>Heading ${i + 1}</th>`).join('');
        const body = Array.from({ length: rows - 1 }, () => `<tr>${Array.from({ length: cols }, () => '<td><br></td>').join('')}</tr>`).join('');
        insertHtml(`<table><tbody><tr>${head}</tr>${body}</tbody></table><p><br></p>`);
      }} /> : null}
    </View>
  );
}

function LinkDialog({ initialText, onApply, onRemove, onClose }: { initialText: string; onApply: (text: string, url: string) => void; onRemove: () => void; onClose: () => void }) {
  const [text, setText] = useState(initialText);
  const [url, setUrl] = useState('https://');
  const valid = /^(https?:\/\/\S+\.\S+|mailto:\S+|\/\S*)$/i.test(url.trim());
  return (
    <Modal visible title="Insert link" onClose={onClose} width={480}>
      {!initialText ? <Field label="Text to show" value={text} onChangeText={setText} placeholder="e.g. Read the full report" /> : <AText color={A.muted}>Linking “{initialText}”</AText>}
      <Field label="Web address" value={url} onChangeText={setUrl} placeholder="https://example.com" keyboardType="url" autoCapitalize="none" error={url.trim().length > 8 && !valid && 'Enter a full address that starts with https://'} onSubmitEditing={() => valid && onApply(text, url.trim())} />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 10 }}>
        <Btn label="Remove link" kind="ghost" onPress={onRemove} />
        <View style={{ flexDirection: 'row', gap: 10 }}>
          <Btn label="Cancel" kind="secondary" onPress={onClose} />
          <Btn label="Apply" disabled={!valid} onPress={() => onApply(text, url.trim())} />
        </View>
      </View>
    </Modal>
  );
}

function ImageDialog({ onInsert, onClose }: { onInsert: (path: string, caption: string) => void; onClose: () => void }) {
  const toast = useToast();
  const [path, setPath] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [busy, setBusy] = useState(false);

  const choose = async () => {
    if (busy) return;
    setBusy(true);
    try {
      const uploaded = await pickAndUpload();
      if (uploaded) setPath(uploaded);
    } catch (err) {
      toast(errorText(err), 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal visible title="Insert image" onClose={onClose} width={520}>
      {path ? (
        <View style={{ gap: 10 }}>
          <View style={{ height: 220, borderRadius: 10, overflow: 'hidden', backgroundColor: A.field, borderWidth: 1, borderColor: A.line }}>
            <Image source={{ uri: assetUrl(path) }} style={{ width: '100%', height: '100%' }} contentFit="contain" />
          </View>
          <Btn label={busy ? 'Uploading…' : 'Choose a different image'} kind="secondary" small icon="image" onPress={choose} disabled={busy} style={{ alignSelf: 'flex-start' }} />
        </View>
      ) : (
        <Pressable
          accessibilityRole="button"
          onPress={choose}
          style={({ hovered }: { hovered?: boolean }) => ({ height: 170, borderRadius: 10, borderWidth: 1.5, borderStyle: 'dashed', borderColor: hovered ? A.text : A.lineStrong, backgroundColor: hovered ? A.field : A.white, alignItems: 'center', justifyContent: 'center', gap: 10 })}
        >
          <View style={{ width: 42, height: 42, borderRadius: 21, backgroundColor: A.field, alignItems: 'center', justifyContent: 'center' }}>
            <Icon name="image" size={20} color={A.muted} />
          </View>
          <AText kind="label">{busy ? 'Uploading…' : 'Upload an image'}</AText>
          <AText kind="tiny" color={A.muted}>
            JPG, PNG or WebP. You can also paste or drop images into the editor.
          </AText>
        </Pressable>
      )}
      <Field label="Caption (also used as alt text)" value={caption} onChangeText={setCaption} placeholder="Describe the image for readers and screen readers" />
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
        <Btn label="Cancel" kind="secondary" onPress={onClose} />
        <Btn label="Insert image" icon="check" disabled={!path} onPress={() => path && onInsert(path, caption.trim())} />
      </View>
    </Modal>
  );
}

function TableDialog({ onInsert, onClose }: { onInsert: (rows: number, cols: number) => void; onClose: () => void }) {
  const [rows, setRows] = useState('3');
  const [cols, setCols] = useState('3');
  const r = Math.min(20, Math.max(2, Number.parseInt(rows, 10) || 0));
  const c = Math.min(8, Math.max(1, Number.parseInt(cols, 10) || 0));
  const ok = Number.parseInt(rows, 10) >= 2 && Number.parseInt(cols, 10) >= 1;
  return (
    <Modal visible title="Insert table" onClose={onClose} width={420}>
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <View style={{ flex: 1 }}>
          <Field label="Rows (including heading)" value={rows} onChangeText={setRows} keyboardType="number-pad" />
        </View>
        <View style={{ flex: 1 }}>
          <Field label="Columns" value={cols} onChangeText={setCols} keyboardType="number-pad" />
        </View>
      </View>
      <AText kind="tiny" color={A.muted}>
        The first row becomes the heading. Up to 20 rows and 8 columns.
      </AText>
      <View style={{ flexDirection: 'row', justifyContent: 'flex-end', gap: 10 }}>
        <Btn label="Cancel" kind="secondary" onPress={onClose} />
        <Btn label="Insert table" disabled={!ok} onPress={() => onInsert(r, c)} />
      </View>
    </Modal>
  );
}

/** The content field: visual editor by default, with a Markdown view for anyone who prefers raw text. */
export function RichEditor({ value, onChange, error, minHeight = 440 }: { value: string; onChange: (v: string) => void; error?: boolean; minHeight?: number }) {
  const [mode, setMode] = useState<'visual' | 'markdown'>('visual');
  if (Platform.OS !== 'web') return <MarkdownEditor value={value} onChange={onChange} error={error} minHeight={minHeight} />;
  return (
    <View style={{ gap: 10 }}>
      <View style={{ flexDirection: 'row', alignSelf: 'flex-end', backgroundColor: A.field, borderRadius: 9, padding: 3 }}>
        {(['visual', 'markdown'] as const).map((m) => (
          <Pressable key={m} accessibilityRole="button" accessibilityState={{ selected: mode === m }} onPress={() => setMode(m)} style={{ paddingHorizontal: 12, height: 28, borderRadius: 7, justifyContent: 'center', backgroundColor: mode === m ? A.white : 'transparent', boxShadow: mode === m ? '0 1px 2px rgba(23,23,23,0.08)' : undefined }}>
            <AText kind="small" color={mode === m ? A.text : A.muted} style={{ fontSize: 12.5 }}>
              {m === 'visual' ? 'Visual' : 'Markdown'}
            </AText>
          </Pressable>
        ))}
      </View>
      {mode === 'visual' ? <WebEditor key="visual" value={value} onChange={onChange} error={error} minHeight={minHeight} /> : <MarkdownEditor key="markdown" value={value} onChange={onChange} error={error} minHeight={minHeight} />}
    </View>
  );
}
