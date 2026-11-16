import { parseBlocks, parseInline } from '@/lib/markdown';

/** Converters between the site's Markdown subset and the HTML the visual editor edits (web only). */

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const safeHref = (href: string) => (/^(https?:\/\/|mailto:|tel:|\/|#)/i.test(href) ? href : '#');

function inlineHtml(source: string): string {
  return parseInline(source)
    .map((p) => {
      let t = esc(p.text).replace(/\n/g, '<br>');
      if (p.code) t = `<code>${t}</code>`;
      if (p.bold) t = `<strong>${t}</strong>`;
      if (p.italic) t = `<em>${t}</em>`;
      if (p.strike) t = `<s>${t}</s>`;
      if (p.href) t = `<a href="${esc(safeHref(p.href))}">${t}</a>`;
      return t;
    })
    .join('');
}

/** HTML for an uploaded image, keeping its stored path so it can be saved back to Markdown. */
export function imageHtml(path: string, alt: string, resolve: (path: string) => string): string {
  const src = path.startsWith('/uploads') ? resolve(path) : path;
  return `<img src="${esc(src)}" data-path="${esc(path)}" alt="${esc(alt)}">`;
}

export function markdownToHtml(markdown: string, resolve: (path: string) => string): string {
  const html = parseBlocks(markdown)
    .map((block) => {
      switch (block.kind) {
        case 'h2':
          return `<h2>${esc(block.text)}</h2>`;
        case 'h3':
          return `<h3>${esc(block.text)}</h3>`;
        case 'quote':
          return `<blockquote>${inlineHtml(block.text)}</blockquote>`;
        case 'ul':
        case 'ol':
          return `<${block.kind}>${block.items.map((i) => `<li>${inlineHtml(i)}</li>`).join('')}</${block.kind}>`;
        case 'table':
          return `<table><tbody><tr>${block.head.map((c) => `<th>${inlineHtml(c)}</th>`).join('')}</tr>${block.rows
            .map((r) => `<tr>${r.map((c) => `<td>${inlineHtml(c)}</td>`).join('')}</tr>`)
            .join('')}</tbody></table>`;
        case 'image':
          return `<p>${imageHtml(block.src, block.alt, resolve)}</p>`;
        case 'hr':
          return '<hr>';
        case 'code':
          return `<pre><code>${esc(block.text)}</code></pre>`;
        default:
          return `<p>${inlineHtml(block.text)}</p>`;
      }
    })
    .join('');
  return html || '<p><br></p>';
}

// ---------------------------------------------------------------- HTML -> Markdown

const BLOCK_TAGS = new Set(['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'BLOCKQUOTE', 'TABLE', 'HR', 'PRE', 'FIGURE']);

/** Wraps `inner` in `mark` without letting the markers swallow surrounding spaces. */
function wrap(mark: string, inner: string): string {
  const match = inner.match(/^(\s*)([\s\S]*?)(\s*)$/);
  if (!match || !match[2]) return inner;
  return `${match[1]}${mark}${match[2]}${mark}${match[3]}`;
}

function imageMarkdown(el: Element): string {
  const path = el.getAttribute('data-path') || el.getAttribute('src') || '';
  const alt = (el.getAttribute('alt') ?? '').replace(/[[\]\n]/g, ' ').trim();
  return path ? `![${alt}](${path.replace(/\s/g, '%20')})` : '';
}

function inline(node: Node): string {
  if (node.nodeType === 3) return (node.textContent ?? '').replace(/ /g, ' ');
  if (node.nodeType !== 1) return '';
  const el = node as HTMLElement;
  const kids = () => Array.from(el.childNodes).map(inline).join('');
  switch (el.tagName) {
    case 'BR':
      return '\n';
    case 'B':
    case 'STRONG':
      return wrap('**', kids());
    case 'I':
    case 'EM':
      return wrap('*', kids());
    case 'S':
    case 'STRIKE':
    case 'DEL':
      return wrap('~~', kids());
    case 'CODE':
      return wrap('`', el.textContent ?? '');
    case 'A': {
      const href = el.getAttribute('href') ?? '';
      const text = kids();
      return href && text.trim() ? `[${text.replace(/[[\]]/g, '')}](${href.replace(/\s/g, '%20').replace(/\)/g, '%29')})` : text;
    }
    case 'SPAN': {
      let text = kids();
      const weight = Number.parseInt(el.style.fontWeight, 10);
      if (el.style.fontWeight === 'bold' || weight >= 600) text = wrap('**', text);
      if (el.style.fontStyle === 'italic') text = wrap('*', text);
      return text;
    }
    case 'IMG':
      return imageMarkdown(el);
    default:
      return kids();
  }
}

const clean = (text: string) =>
  text
    .split('\n')
    .map((l) => l.replace(/[ \t]+/g, ' ').trim())
    .filter((l, i, all) => l !== '' || (i > 0 && i < all.length - 1 && all[i - 1] !== ''))
    .join('\n')
    .trim();

function flow(parent: Node, out: string[]) {
  let buffer = '';
  const flush = () => {
    const text = clean(buffer);
    if (text) out.push(text);
    buffer = '';
  };
  for (const node of Array.from(parent.childNodes)) {
    if (node.nodeType !== 1) {
      buffer += inline(node);
      continue;
    }
    const el = node as HTMLElement;
    const tag = el.tagName;
    if (tag === 'IMG') {
      flush();
      out.push(imageMarkdown(el));
    } else if (BLOCK_TAGS.has(tag)) {
      flush();
      block(el, out);
    } else buffer += inline(el);
  }
  flush();
}

function block(el: HTMLElement, out: string[]) {
  const tag = el.tagName;
  switch (tag) {
    case 'H1':
    case 'H2':
      if (el.textContent?.trim()) out.push(`## ${el.textContent.trim().replace(/\s+/g, ' ')}`);
      return;
    case 'H3':
    case 'H4':
    case 'H5':
    case 'H6':
      if (el.textContent?.trim()) out.push(`### ${el.textContent.trim().replace(/\s+/g, ' ')}`);
      return;
    case 'UL':
    case 'OL': {
      const items = Array.from(el.children)
        .filter((c) => c.tagName === 'LI')
        .map((li) =>
          clean(
            Array.from(li.childNodes)
              .filter((c) => !(c.nodeType === 1 && ['UL', 'OL'].includes((c as HTMLElement).tagName)))
              .map(inline)
              .join(''),
          ).replace(/\n+/g, ' '),
        )
        .filter(Boolean);
      if (items.length) out.push(items.map((t, i) => (tag === 'OL' ? `${i + 1}. ${t}` : `- ${t}`)).join('\n'));
      return;
    }
    case 'BLOCKQUOTE': {
      const parts: string[] = [];
      flow(el, parts);
      const text = parts.join(' ').replace(/\n+/g, ' ').trim();
      if (text) out.push(`> ${text}`);
      return;
    }
    case 'TABLE': {
      const rows = Array.from(el.querySelectorAll('tr')).map((tr) => Array.from(tr.children).map((c) => clean(inline(c)).replace(/\n+/g, ' ').replace(/\|/g, '/') || ' '));
      if (!rows.length) return;
      const width = Math.max(...rows.map((r) => r.length));
      const line = (r: string[]) => `| ${Array.from({ length: width }, (_, i) => r[i] ?? ' ').join(' | ')} |`;
      out.push([line(rows[0]), `| ${Array.from({ length: width }, () => '---').join(' | ')} |`, ...rows.slice(1).map(line)].join('\n'));
      return;
    }
    case 'HR':
      out.push('---');
      return;
    case 'PRE':
      out.push(`\`\`\`\n${(el.textContent ?? '').replace(/\n+$/, '')}\n\`\`\``);
      return;
    default:
      flow(el, out);
  }
}

/** The Markdown for everything currently inside the editor element. */
export function htmlToMarkdown(root: HTMLElement): string {
  const out: string[] = [];
  flow(root, out);
  return out.join('\n\n');
}
