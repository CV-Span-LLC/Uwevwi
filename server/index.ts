import { randomBytes } from 'node:crypto';
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

import { serve } from '@hono/node-server';
import { serveStatic } from '@hono/node-server/serve-static';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import {
  bearer,
  clearAttempts,
  consumeResetToken,
  createResetToken,
  createSession,
  destroySession,
  hashPassword,
  requireAdmin,
  revokeAllSessions,
  tooManyAttempts,
  verifyPassword,
  type Admin,
} from './auth.ts';
import { all, get, logActivity, now, run, UPLOAD_DIR, uniqueSlug } from './db.ts';
import { seedIfEmpty } from './seed.ts';

type Env = { Variables: { admin: Admin } };

const PORT = Number(process.env.PORT ?? 8787);
const APP_URL = process.env.APP_URL ?? 'http://localhost:8092';

const app = new Hono<Env>();
app.use('*', cors({ origin: '*', allowHeaders: ['Content-Type', 'Authorization'], allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'] }));
app.use('/uploads/*', serveStatic({ root: './server', onFound: (_p, c) => c.header('Cache-Control', 'public, max-age=3600') }));
app.onError((err, c) => {
  if (err instanceof HttpError) return c.json({ error: err.message }, err.status);
  console.error(err);
  return c.json({ error: 'Something went wrong on our side.' }, 500);
});

class HttpError extends Error {
  status: 400 | 401 | 403 | 404 | 413 | 429;
  constructor(status: 400 | 401 | 403 | 404 | 413 | 429, message: string) {
    super(message);
    this.status = status;
  }
}

// ---------- helpers ----------

function text(value: unknown, field: string, opts: { max?: number; required?: boolean } = {}): string {
  const s = typeof value === 'string' ? value.trim() : '';
  if (opts.required && !s) throw new HttpError(400, `${field} is required.`);
  if (s.length > (opts.max ?? 5000)) throw new HttpError(400, `${field} is too long.`);
  return s;
}

function emailOf(value: unknown): string {
  const s = text(value, 'Email', { required: true, max: 200 }).toLowerCase();
  if (!/^\S+@\S+\.\S+$/.test(s)) throw new HttpError(400, 'Enter a valid email address.');
  return s;
}

async function body(c: { req: { json: () => Promise<unknown> } }): Promise<Record<string, unknown>> {
  try {
    const parsed = await c.req.json();
    return parsed && typeof parsed === 'object' ? (parsed as Record<string, unknown>) : {};
  } catch {
    throw new HttpError(400, 'Invalid request.');
  }
}

function pathOrNull(value: unknown): string | null {
  const s = typeof value === 'string' ? value.trim() : '';
  if (!s) return null;
  if (!/^\/uploads\/[\w./-]+$/.test(s) || s.includes('..')) throw new HttpError(400, 'Invalid image.');
  return s;
}

function pathList(value: unknown): string[] {
  return Array.isArray(value) ? value.map(pathOrNull).filter((p): p is string => p !== null) : [];
}

const idParam = (value: string) => {
  const id = Number(value);
  if (!Number.isInteger(id)) throw new HttpError(404, 'Not found.');
  return id;
};

// ---------- research ----------

type ResearchRow = {
  id: number;
  slug: string;
  title: string;
  type: string;
  excerpt: string;
  content: string;
  image: string | null;
  part: string | null;
  status: string;
  publish_at: string | null;
  author: string;
  views: number;
  comments_hidden: number;
  created_at: string;
  updated_at: string;
};

const RESEARCH_TYPES = ['Research Paper', 'Journal', 'Writers Commission'];

function researchStatus(r: ResearchRow): 'draft' | 'scheduled' | 'published' {
  if (r.status !== 'published') return 'draft';
  return r.publish_at && r.publish_at > now() ? 'scheduled' : 'published';
}

const publishedDate = (r: ResearchRow) => r.publish_at ?? r.created_at;

function commentCount(researchId: number): number {
  return get<{ n: number }>('SELECT COUNT(*) AS n FROM comments WHERE research_id = ?', researchId)?.n ?? 0;
}

function researchSummary(r: ResearchRow) {
  return {
    id: r.id,
    slug: r.slug,
    title: r.title,
    type: r.type,
    excerpt: r.excerpt,
    image: r.image,
    part: r.part,
    status: researchStatus(r),
    publishedAt: publishedDate(r),
    updatedAt: r.updated_at,
    views: r.views,
    comments: commentCount(r.id),
    commentsHidden: r.comments_hidden === 1,
    author: r.author,
  };
}

function researchInput(data: Record<string, unknown>, current?: ResearchRow) {
  const type = text(data.type, 'Research type', { required: true });
  if (!RESEARCH_TYPES.includes(type)) throw new HttpError(400, 'Choose a research type.');
  const publishAtRaw = text(data.publishAt, 'Release date');
  let publishAt: string | null = null;
  if (publishAtRaw) {
    const date = new Date(publishAtRaw);
    if (Number.isNaN(date.getTime())) throw new HttpError(400, 'Enter a valid release date.');
    publishAt = date.toISOString();
  }
  return {
    title: text(data.title, 'Title', { required: true, max: 300 }),
    type,
    excerpt: text(data.excerpt, 'Short description', { max: 1000 }),
    content: text(data.content, 'Content', { max: 200_000 }),
    image: pathOrNull(data.image),
    publishAt: publishAt ?? current?.publish_at ?? null,
    explicitNoDate: publishAtRaw === '' && data.publishAt !== undefined,
  };
}

// ---------- exhibitions ----------

type ExhibitionRow = {
  id: number;
  slug: string;
  title: string;
  series: string;
  edition: string;
  date_label: string;
  location: string;
  intro: string;
  flyer: string | null;
  gallery_heading: string;
  gallery_text: string;
  gallery: string;
  artists: string;
  note_heading: string;
  note_text: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type Artist = { name: string; bio: string; photo: string | null; works: string[] };

const parseJson = <T>(value: string, fallback: T): T => {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
};

function exhibitionShape(e: ExhibitionRow) {
  return {
    id: e.id,
    slug: e.slug,
    title: e.title,
    series: e.series,
    edition: e.edition,
    dateLabel: e.date_label,
    location: e.location,
    intro: e.intro,
    flyer: e.flyer,
    galleryHeading: e.gallery_heading,
    galleryText: e.gallery_text,
    gallery: parseJson<string[]>(e.gallery, []),
    artists: parseJson<Artist[]>(e.artists, []),
    noteHeading: e.note_heading,
    noteText: e.note_text,
    status: e.status,
    updatedAt: e.updated_at,
  };
}

function exhibitionInput(data: Record<string, unknown>) {
  const status = text(data.status, 'Status') || 'draft';
  if (!['draft', 'published', 'hidden'].includes(status)) throw new HttpError(400, 'Invalid status.');
  const artists: Artist[] = (Array.isArray(data.artists) ? data.artists : []).slice(0, 50).map((raw) => {
    const a = (raw ?? {}) as Record<string, unknown>;
    return {
      name: text(a.name, 'Artist name', { required: true, max: 200 }),
      bio: text(a.bio, 'About the artist', { max: 2000 }),
      photo: pathOrNull(a.photo),
      works: pathList(a.works).slice(0, 30),
    };
  });
  const published = status === 'published';
  const title = text(data.title, 'Exhibition name', { required: published, max: 200 }) || 'Untitled exhibition';
  return {
    title,
    series: text(data.series, 'Series', { max: 200 }),
    edition: text(data.edition, 'Edition', { max: 200 }),
    dateLabel: text(data.dateLabel, 'Date & year', { required: published, max: 200 }),
    location: text(data.location, 'Location', { required: published, max: 300 }),
    intro: text(data.intro, 'Short description', { required: published, max: 3000 }),
    flyer: pathOrNull(data.flyer),
    galleryHeading: text(data.galleryHeading, 'Section heading', { max: 300 }),
    galleryText: text(data.galleryText, 'Supporting text', { max: 2000 }),
    gallery: pathList(data.gallery).slice(0, 60),
    artists,
    noteHeading: text(data.noteHeading, 'Curatorial note', { max: 500 }),
    noteText: text(data.noteText, 'Curatorial note text', { max: 2000 }),
    status,
  };
}

// ---------- site images ----------

export const IMAGE_SLOTS = [
  { key: 'home.hero', group: 'Home', label: 'Hero Image', size: '796× 800' },
  { key: 'home.bottom', group: 'Home', label: 'Bottom Image', size: '1440 × 436' },
  { key: 'about.hero', group: 'About Us', label: 'Hero Image', size: '796× 800' },
  { key: 'about.founder', group: 'About Us', label: 'Founder Image', size: '544 × 656' },
  { key: 'advisory.hero', group: 'Advisory', label: 'Hero Image', size: '796× 800' },
  { key: 'advisory.research', group: 'Advisory', label: 'Research Driven Practice', size: '796× 800' },
  { key: 'stewardship.hero', group: 'Stewardship', label: 'Hero Image', size: '796× 800' },
  { key: 'stewardship.bottom', group: 'Stewardship', label: 'Bottom Image', size: '1440 × 436' },
  { key: 'studio.hero', group: 'Studio', label: 'Hero Image', size: '796× 800' },
  { key: 'studio.motion', group: 'Studio', label: 'Culture in Motion', size: '663 × 436' },
  { key: 'research.hero', group: 'Research', label: 'Hero Image', size: '796× 800' },
];

// ---------- public API ----------

const pub = new Hono<Env>();

pub.get('/site-images', (c) => {
  const rows = all<{ key: string; path: string | null }>('SELECT key, path FROM site_images');
  return c.json(Object.fromEntries(rows.map((r) => [r.key, r.path])));
});

pub.get('/research', (c) => {
  const rows = all<ResearchRow>(
    `SELECT * FROM research WHERE status = 'published' AND (publish_at IS NULL OR publish_at <= ?) ORDER BY COALESCE(publish_at, created_at) DESC`,
    now(),
  );
  return c.json(rows.map(researchSummary));
});

type CommentRow = {
  id: number;
  research_id: number;
  parent_id: number | null;
  name: string;
  email: string;
  body: string;
  is_author: number;
  likes: number;
  is_read: number;
  created_at: string;
};

const commentShape = (m: CommentRow) => ({
  id: m.id,
  name: m.name,
  body: m.body,
  isAuthor: m.is_author === 1,
  likes: m.likes,
  createdAt: m.created_at,
});

function commentTree(researchId: number) {
  const rows = all<CommentRow>('SELECT * FROM comments WHERE research_id = ? ORDER BY created_at ASC', researchId);
  const top = rows.filter((r) => r.parent_id === null);
  return top
    .map((t) => ({ ...commentShape(t), replies: rows.filter((r) => r.parent_id === t.id).map(commentShape) }))
    .reverse();
}

function publishedResearch(slug: string): ResearchRow {
  const row = get<ResearchRow>(
    `SELECT * FROM research WHERE slug = ? AND status = 'published' AND (publish_at IS NULL OR publish_at <= ?)`,
    slug,
    now(),
  );
  if (!row) throw new HttpError(404, 'We could not find that piece.');
  return row;
}

pub.get('/research/:slug', (c) => {
  const row = publishedResearch(c.req.param('slug'));
  run('UPDATE research SET views = views + 1 WHERE id = ?', row.id);
  return c.json({
    ...researchSummary(row),
    content: row.content,
    comments: row.comments_hidden === 1 ? [] : commentTree(row.id),
  });
});

pub.post('/research/:slug/comments', async (c) => {
  const row = publishedResearch(c.req.param('slug'));
  if (row.comments_hidden === 1) throw new HttpError(403, 'Comments are closed for this piece.');
  const data = await body(c);
  const name = text(data.name, 'Your name', { required: true, max: 100 });
  const email = emailOf(data.email);
  const comment = text(data.text, 'Comment', { required: true, max: 3000 });
  let parentId: number | null = null;
  if (data.parentId !== undefined && data.parentId !== null) {
    const parent = get<{ id: number; parent_id: number | null }>('SELECT id, parent_id FROM comments WHERE id = ? AND research_id = ?', Number(data.parentId), row.id);
    if (!parent) throw new HttpError(400, 'That comment no longer exists.');
    parentId = parent.parent_id ?? parent.id;
  }
  if (tooManyAttempts(`comment:${email}`, 10, 60 * 60 * 1000)) throw new HttpError(429, 'You are commenting too quickly. Please try again later.');
  const result = run(
    'INSERT INTO comments (research_id, parent_id, name, email, body, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    row.id,
    parentId,
    name,
    email,
    comment,
    now(),
  );
  logActivity('New comment', `${name} commented on ${row.title}`);
  const created = get<CommentRow>('SELECT * FROM comments WHERE id = ?', Number(result.lastInsertRowid))!;
  return c.json({ ...commentShape(created), replies: [], parentId }, 201);
});

pub.post('/comments/:id/like', async (c) => {
  const data = await body(c);
  const delta = data.liked === false ? -1 : 1;
  const id = idParam(c.req.param('id'));
  run('UPDATE comments SET likes = MAX(0, likes + ?) WHERE id = ?', delta, id);
  const row = get<{ likes: number }>('SELECT likes FROM comments WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  return c.json({ likes: row.likes });
});

pub.get('/exhibitions', (c) => {
  const rows = all<ExhibitionRow>("SELECT * FROM exhibitions WHERE status = 'published' ORDER BY created_at DESC");
  return c.json(rows.map(exhibitionShape));
});

pub.get('/exhibitions/:slug', (c) => {
  const row = get<ExhibitionRow>("SELECT * FROM exhibitions WHERE slug = ? AND status = 'published'", c.req.param('slug'));
  if (!row) throw new HttpError(404, 'We could not find that exhibition.');
  return c.json(exhibitionShape(row));
});

const ENQUIRY_TOPICS = ['Advisory', 'Stewardship', 'Studios & Exhibitions', 'Research & Commissions', 'Something else'];

pub.post('/contact', async (c) => {
  const data = await body(c);
  const name = text(data.name, 'Full name', { required: true, max: 150 });
  const email = emailOf(data.email);
  const topic = text(data.topic, 'Enquiry type', { required: true });
  if (!ENQUIRY_TOPICS.includes(topic)) throw new HttpError(400, 'Choose an enquiry type.');
  const message = text(data.message, 'Message', { required: true, max: 5000 });
  const organisation = text(data.organisation, 'Organisation', { max: 200 });
  if (tooManyAttempts(`contact:${email}`, 5, 60 * 60 * 1000)) throw new HttpError(429, 'You have sent several enquiries already. Please try again later.');
  run('INSERT INTO enquiries (name, email, organisation, topic, message, created_at) VALUES (?, ?, ?, ?, ?, ?)', name, email, organisation, topic, message, now());
  logActivity('New enquiry', `${name} sent an enquiry about ${topic}`);
  console.log(`[enquiry] ${name} <${email}> about ${topic}`);
  return c.json({ ok: true }, 201);
});

app.route('/api/public', pub);

// ---------- admin API ----------

const admin = new Hono<Env>();

admin.post('/login', async (c) => {
  const data = await body(c);
  const email = emailOf(data.email);
  const password = typeof data.password === 'string' ? data.password : '';
  const key = `login:${email}`;
  if (tooManyAttempts(key)) throw new HttpError(429, 'Too many attempts. Please wait a few minutes and try again.');
  const row = get<{ id: number; name: string; email: string; password_hash: string }>('SELECT * FROM admins WHERE email = ?', email);
  if (!row || !verifyPassword(password, row.password_hash)) throw new HttpError(401, 'Incorrect email or password.');
  clearAttempts(key);
  const session = createSession(row.id, data.remember === true);
  return c.json({ token: session.token, expiresAt: session.expiresAt, admin: { id: row.id, name: row.name, email: row.email } });
});

admin.post('/forgot-password', async (c) => {
  const data = await body(c);
  const email = emailOf(data.email);
  if (tooManyAttempts(`forgot:${email}`, 5, 60 * 60 * 1000)) throw new HttpError(429, 'Please wait before asking again.');
  const row = get<{ id: number }>('SELECT id FROM admins WHERE email = ?', email);
  if (row) {
    const token = createResetToken(row.id);
    // No email provider is configured yet, so the link is printed to the server console.
    console.log(`[password reset] ${email}: ${APP_URL}/admin/reset-password?token=${token}`);
  }
  return c.json({ ok: true });
});

admin.post('/reset-password', async (c) => {
  const data = await body(c);
  const token = text(data.token, 'Token', { required: true });
  const password = typeof data.password === 'string' ? data.password : '';
  if (password.length < 10) throw new HttpError(400, 'Use at least 10 characters for your password.');
  const adminId = consumeResetToken(token);
  if (!adminId) throw new HttpError(400, 'This reset link is invalid or has expired.');
  run('UPDATE admins SET password_hash = ? WHERE id = ?', hashPassword(password), adminId);
  revokeAllSessions(adminId);
  return c.json({ ok: true });
});

admin.use('*', async (c, next) => {
  const path = new URL(c.req.url).pathname;
  if (/\/(login|forgot-password|reset-password)$/.test(path)) return next();
  return requireAdmin(c, next);
});

admin.get('/me', (c) => c.json({ admin: c.get('admin') }));

admin.post('/logout', (c) => {
  const token = bearer(c);
  if (token) destroySession(token);
  return c.json({ ok: true });
});

// uploads

const IMAGE_TYPES: Record<string, string> = { 'image/jpeg': 'jpg', 'image/png': 'png', 'image/webp': 'webp', 'image/gif': 'gif' };

admin.post('/upload', async (c) => {
  const form = await c.req.parseBody();
  const file = form.file;
  if (!(file instanceof File)) throw new HttpError(400, 'Choose an image to upload.');
  const ext = IMAGE_TYPES[file.type];
  if (!ext) throw new HttpError(400, 'Upload a JPG, PNG, WebP or GIF image.');
  if (file.size > 10 * 1024 * 1024) throw new HttpError(413, 'That image is larger than 10MB.');
  const name = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  writeFileSync(join(UPLOAD_DIR, name), Buffer.from(await file.arrayBuffer()));
  return c.json({ path: `/uploads/${name}` }, 201);
});

admin.get('/notifications', (c) => {
  const fresh = get<{ n: number }>('SELECT COUNT(*) AS n FROM comments WHERE is_read = 0 AND is_author = 0')?.n ?? 0;
  return c.json({ fresh });
});

// dashboard

admin.get('/dashboard', (c) => {
  const researchRows = all<ResearchRow>('SELECT * FROM research ORDER BY updated_at DESC');
  const statuses = researchRows.map(researchStatus);
  const exhibitions = all<ExhibitionRow>('SELECT * FROM exhibitions ORDER BY updated_at DESC');
  const commentTotals = get<{ total: number; fresh: number }>('SELECT COUNT(*) AS total, SUM(CASE WHEN is_read = 0 AND is_author = 0 THEN 1 ELSE 0 END) AS fresh FROM comments');
  const lastImage = get<{ updated_at: string }>('SELECT updated_at FROM site_images WHERE path IS NOT NULL ORDER BY updated_at DESC LIMIT 1');
  const recentComments = all<CommentRow & { title: string }>(
    `SELECT c.*, r.title FROM comments c JOIN research r ON r.id = c.research_id WHERE c.is_author = 0 ORDER BY c.created_at DESC LIMIT 3`,
  ).map((m) => ({
    id: m.id,
    name: m.name,
    body: m.body,
    title: m.title,
    createdAt: m.created_at,
    status: get('SELECT 1 FROM comments WHERE parent_id = ? AND is_author = 1', m.id) ? 'replied' : m.is_read ? 'read' : 'new',
  }));
  return c.json({
    research: {
      published: statuses.filter((s) => s === 'published').length,
      draft: statuses.filter((s) => s === 'draft').length,
      scheduled: statuses.filter((s) => s === 'scheduled').length,
    },
    exhibitions: {
      published: exhibitions.filter((e) => e.status === 'published').length,
      draft: exhibitions.filter((e) => e.status === 'draft').length,
      hidden: exhibitions.filter((e) => e.status === 'hidden').length,
    },
    comments: { total: commentTotals?.total ?? 0, fresh: commentTotals?.fresh ?? 0 },
    imagesUpdatedAt: lastImage?.updated_at ?? null,
    activity: all('SELECT title, detail, created_at AS createdAt FROM activity ORDER BY id DESC LIMIT 4'),
    recentResearch: researchRows.slice(0, 3).map(researchSummary),
    recentExhibitions: exhibitions.slice(0, 3).map(exhibitionShape),
    recentComments,
  });
});

// research

admin.get('/research', (c) => {
  const q = (c.req.query('q') ?? '').toLowerCase();
  const rows = all<ResearchRow>('SELECT * FROM research ORDER BY updated_at DESC').filter((r) => !q || r.title.toLowerCase().includes(q) || r.type.toLowerCase().includes(q));
  return c.json(rows.map(researchSummary));
});

admin.get('/research/:id', (c) => {
  const row = get<ResearchRow>('SELECT * FROM research WHERE id = ?', idParam(c.req.param('id')));
  if (!row) throw new HttpError(404, 'Not found.');
  return c.json({ ...researchSummary(row), content: row.content, publishAtRaw: row.publish_at });
});

admin.post('/research', async (c) => {
  const payload = await body(c);
  const data = researchInput(payload);
  const status = payload.status === 'published' ? 'published' : 'draft';
  const publishAt = status === 'published' ? (data.publishAt ?? now()) : data.publishAt;
  const slug = uniqueSlug('research', data.title);
  const stamp = now();
  const result = run(
    `INSERT INTO research (slug, title, type, excerpt, content, image, status, publish_at, author, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    slug, data.title, data.type, data.excerpt, data.content, data.image, status, publishAt, c.get('admin').name, stamp, stamp,
  );
  logActivity(status === 'published' ? 'Research published' : 'Research drafted', `${data.title} was ${status === 'published' ? 'published' : 'saved as a draft'}.`);
  return c.json({ id: Number(result.lastInsertRowid), slug }, 201);
});

admin.put('/research/:id', async (c) => {
  const id = idParam(c.req.param('id'));
  const current = get<ResearchRow>('SELECT * FROM research WHERE id = ?', id);
  if (!current) throw new HttpError(404, 'Not found.');
  const payload = await body(c);
  const input = researchInput(payload, current);
  const status = payload.status === 'published' || payload.status === 'draft' ? payload.status : current.status;
  // Publishing with no date publishes now; clearing the date on a draft clears the schedule.
  let publishAt = input.explicitNoDate ? null : input.publishAt;
  if (status === 'published' && !publishAt && !current.publish_at) publishAt = now();
  const slug = current.slug;
  run(
    `UPDATE research SET title = ?, type = ?, excerpt = ?, content = ?, image = ?, status = ?, publish_at = ?, updated_at = ? WHERE id = ?`,
    input.title, input.type, input.excerpt, input.content, input.image, status, publishAt, now(), id,
  );
  if (status === 'published' && current.status !== 'published') logActivity('Research published', `${input.title} was published.`);
  else logActivity('Research updated', `${input.title} was updated.`);
  return c.json({ id, slug });
});

admin.delete('/research/:id', (c) => {
  const id = idParam(c.req.param('id'));
  const row = get<ResearchRow>('SELECT * FROM research WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  run('DELETE FROM research WHERE id = ?', id);
  logActivity('Research deleted', `${row.title} was deleted.`);
  return c.json({ ok: true });
});

// exhibitions

admin.get('/exhibitions', (c) => {
  const q = (c.req.query('q') ?? '').toLowerCase();
  const rows = all<ExhibitionRow>('SELECT * FROM exhibitions ORDER BY updated_at DESC').filter((e) => !q || e.title.toLowerCase().includes(q) || e.series.toLowerCase().includes(q));
  return c.json(rows.map(exhibitionShape));
});

admin.get('/exhibitions/:id', (c) => {
  const row = get<ExhibitionRow>('SELECT * FROM exhibitions WHERE id = ?', idParam(c.req.param('id')));
  if (!row) throw new HttpError(404, 'Not found.');
  return c.json(exhibitionShape(row));
});

admin.post('/exhibitions', async (c) => {
  const data = exhibitionInput(await body(c));
  const slug = uniqueSlug('exhibitions', data.title);
  const stamp = now();
  const result = run(
    `INSERT INTO exhibitions (slug, title, series, edition, date_label, location, intro, flyer, gallery_heading, gallery_text, gallery, artists, note_heading, note_text, status, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    slug, data.title, data.series, data.edition, data.dateLabel, data.location, data.intro, data.flyer, data.galleryHeading, data.galleryText,
    JSON.stringify(data.gallery), JSON.stringify(data.artists), data.noteHeading, data.noteText, data.status, stamp, stamp,
  );
  logActivity(data.status === 'published' ? 'Exhibition published' : 'Exhibition created', `${data.title} was ${data.status === 'published' ? 'published' : 'saved'}.`);
  return c.json({ id: Number(result.lastInsertRowid), slug }, 201);
});

admin.put('/exhibitions/:id', async (c) => {
  const id = idParam(c.req.param('id'));
  const current = get<ExhibitionRow>('SELECT * FROM exhibitions WHERE id = ?', id);
  if (!current) throw new HttpError(404, 'Not found.');
  const data = exhibitionInput(await body(c));
  run(
    `UPDATE exhibitions SET title = ?, series = ?, edition = ?, date_label = ?, location = ?, intro = ?, flyer = ?, gallery_heading = ?, gallery_text = ?,
       gallery = ?, artists = ?, note_heading = ?, note_text = ?, status = ?, updated_at = ? WHERE id = ?`,
    data.title, data.series, data.edition, data.dateLabel, data.location, data.intro, data.flyer, data.galleryHeading, data.galleryText,
    JSON.stringify(data.gallery), JSON.stringify(data.artists), data.noteHeading, data.noteText, data.status, now(), id,
  );
  logActivity('Exhibition updated', `${data.title} was updated.`);
  return c.json({ id, slug: current.slug });
});

admin.patch('/exhibitions/:id/status', async (c) => {
  const id = idParam(c.req.param('id'));
  const status = text((await body(c)).status, 'Status');
  if (!['draft', 'published', 'hidden'].includes(status)) throw new HttpError(400, 'Invalid status.');
  const row = get<ExhibitionRow>('SELECT * FROM exhibitions WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  run('UPDATE exhibitions SET status = ?, updated_at = ? WHERE id = ?', status, now(), id);
  logActivity('Exhibition updated', `${row.title} is now ${status}.`);
  return c.json({ ok: true });
});

admin.delete('/exhibitions/:id', (c) => {
  const id = idParam(c.req.param('id'));
  const row = get<ExhibitionRow>('SELECT * FROM exhibitions WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  run('DELETE FROM exhibitions WHERE id = ?', id);
  logActivity('Exhibition deleted', `${row.title} was deleted.`);
  return c.json({ ok: true });
});

// website images

admin.get('/site-images', (c) => {
  const rows = all<{ key: string; path: string | null; updated_at: string }>('SELECT * FROM site_images');
  const byKey = new Map(rows.map((r) => [r.key, r]));
  return c.json(IMAGE_SLOTS.map((slot) => ({ ...slot, path: byKey.get(slot.key)?.path ?? null, updatedAt: byKey.get(slot.key)?.updated_at ?? null })));
});

admin.put('/site-images/:key', async (c) => {
  const key = c.req.param('key');
  const slot = IMAGE_SLOTS.find((s) => s.key === key);
  if (!slot) throw new HttpError(404, 'Unknown image.');
  const path = pathOrNull((await body(c)).path);
  run('INSERT INTO site_images (key, path, updated_at) VALUES (?, ?, ?) ON CONFLICT(key) DO UPDATE SET path = excluded.path, updated_at = excluded.updated_at', key, path, now());
  logActivity('Website image changed', `${slot.group} ${slot.label.toLowerCase()} was ${path ? 'updated' : 'reset to the original'}.`);
  return c.json({ ok: true });
});

// comments

admin.get('/comments/entries', (c) => {
  const rows = all<ResearchRow>("SELECT * FROM research WHERE status = 'published' ORDER BY COALESCE(publish_at, created_at) DESC");
  return c.json(
    rows.map((r) => ({
      ...researchSummary(r),
      fresh: get<{ n: number }>('SELECT COUNT(*) AS n FROM comments WHERE research_id = ? AND is_read = 0 AND is_author = 0', r.id)?.n ?? 0,
    })),
  );
});

admin.get('/comments/entries/:id', (c) => {
  const id = idParam(c.req.param('id'));
  const row = get<ResearchRow>('SELECT * FROM research WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  const thread = commentTree(id);
  // Opening a thread marks its comments as read.
  run('UPDATE comments SET is_read = 1 WHERE research_id = ?', id);
  return c.json(thread);
});

admin.put('/research/:id/comments-hidden', async (c) => {
  const id = idParam(c.req.param('id'));
  const hidden = (await body(c)).hidden === true ? 1 : 0;
  const row = get<ResearchRow>('SELECT * FROM research WHERE id = ?', id);
  if (!row) throw new HttpError(404, 'Not found.');
  run('UPDATE research SET comments_hidden = ? WHERE id = ?', hidden, id);
  logActivity('Comments updated', `Comments on ${row.title} are now ${hidden ? 'hidden' : 'visible'}.`);
  return c.json({ ok: true });
});

admin.post('/comments', async (c) => {
  const data = await body(c);
  const parent = get<{ id: number; research_id: number; parent_id: number | null }>('SELECT id, research_id, parent_id FROM comments WHERE id = ?', Number(data.parentId));
  if (!parent) throw new HttpError(404, 'That comment no longer exists.');
  const reply = text(data.text, 'Reply', { required: true, max: 3000 });
  const me = c.get('admin');
  const result = run(
    'INSERT INTO comments (research_id, parent_id, name, email, body, is_author, is_read, created_at) VALUES (?, ?, ?, ?, ?, 1, 1, ?)',
    parent.research_id, parent.parent_id ?? parent.id, me.name, me.email, reply, now(),
  );
  const research = get<ResearchRow>('SELECT title FROM research WHERE id = ?', parent.research_id);
  logActivity('Comment replied', `You replied to a comment on ${research?.title ?? 'a piece'}.`);
  return c.json({ id: Number(result.lastInsertRowid) }, 201);
});

admin.delete('/comments/:id', (c) => {
  run('DELETE FROM comments WHERE id = ?', idParam(c.req.param('id')));
  return c.json({ ok: true });
});

app.route('/api/admin', admin);
app.get('/api/health', (c) => c.json({ ok: true }));
app.notFound((c) => c.json({ error: 'Not found.' }, 404));

// ---------- start ----------

seedIfEmpty();

serve({ fetch: app.fetch, port: PORT }, (info) => {
  console.log(`Uwevwi API listening on http://localhost:${info.port}`);
});
