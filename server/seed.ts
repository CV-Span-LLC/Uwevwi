import { randomBytes } from 'node:crypto';
import { cpSync, existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

import { hashPassword } from './auth.ts';
import { get, logActivity, run, SERVER_DIR, UPLOAD_DIR } from './db.ts';

type SeedResearch = {
  slug: string;
  type: string;
  title: string;
  excerpt: string;
  part: string | null;
  publishAt: string;
  image: string;
  content: string;
};

type SeedExhibition = {
  slug: string;
  title: string;
  series: string;
  edition: string;
  dateLabel: string;
  location: string;
  intro: string;
  flyer: string;
  galleryHeading: string;
  galleryText: string;
  gallery: string[];
  artists: { name: string; bio: string; photo: string; works: string[] }[];
  noteHeading: string;
  noteText: string;
  /** When the show took place or was added; the newest published exhibition is the featured one. */
  createdAt?: string;
};

function bootstrapAdmin() {
  if (get('SELECT id FROM admins LIMIT 1')) return;
  const email = (process.env.ADMIN_EMAIL ?? 'admin@uwevwistudio.org').toLowerCase();
  const name = process.env.ADMIN_NAME ?? 'Nazerin Gbinije';
  const generated = !process.env.ADMIN_PASSWORD;
  const password = process.env.ADMIN_PASSWORD ?? randomBytes(9).toString('base64url');
  run('INSERT INTO admins (name, email, password_hash, created_at) VALUES (?, ?, ?, ?)', name, email, hashPassword(password), new Date().toISOString());
  console.log(`\nCreated the first admin account: ${email}`);
  if (generated) console.log(`Generated password (shown once, change it after signing in): ${password}\n`);
}

export function seedIfEmpty() {
  bootstrapAdmin();
  if (get('SELECT id FROM research LIMIT 1') || get('SELECT id FROM exhibitions LIMIT 1')) return;

  const seedDir = join(SERVER_DIR, 'seed');
  if (!existsSync(join(seedDir, 'content.json'))) return;
  cpSync(join(seedDir, 'images'), join(UPLOAD_DIR, 'seed'), { recursive: true });
  const content = JSON.parse(readFileSync(join(seedDir, 'content.json'), 'utf8')) as { research: SeedResearch[]; exhibitions: SeedExhibition[] };

  for (const r of content.research) {
    run(
      `INSERT INTO research (slug, title, type, excerpt, content, image, part, status, publish_at, author, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, 'published', ?, 'Nazerin Gbinije', ?, ?)`,
      r.slug, r.title, r.type, r.excerpt, r.content, r.image, r.part, r.publishAt, r.publishAt, r.publishAt,
    );
  }
  for (const e of content.exhibitions) {
    run(
      `INSERT INTO exhibitions (slug, title, series, edition, date_label, location, intro, flyer, gallery_heading, gallery_text, gallery, artists, note_heading, note_text, status, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published', ?, ?)`,
      e.slug, e.title, e.series, e.edition, e.dateLabel, e.location, e.intro, e.flyer, e.galleryHeading, e.galleryText,
      JSON.stringify(e.gallery), JSON.stringify(e.artists), e.noteHeading, e.noteText, e.createdAt ?? new Date().toISOString(), e.createdAt ?? new Date().toISOString(),
    );
  }

  // The conversation shown on the original article designs.
  const article = get<{ id: number }>("SELECT id FROM research WHERE slug = 'what-is-a-cultural-asset'");
  if (article) {
    const first = run(
      'INSERT INTO comments (research_id, name, email, body, likes, is_read, created_at) VALUES (?, ?, ?, ?, 4, 1, ?)',
      article.id,
      'Chidinma Chuck',
      'chidinma@example.com',
      'I would love to see more archive like this. It would add depth to the discussion and help younger generations understand the culture better.',
      new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
    );
    run(
      'INSERT INTO comments (research_id, parent_id, name, email, body, is_author, is_read, likes, created_at) VALUES (?, ?, ?, ?, ?, 1, 1, 4, ?)',
      article.id,
      Number(first.lastInsertRowid),
      'Nazerin Gbinije',
      'hello@uwevwistudio.org',
      'Thank you, Chidinma. We’re glad you found the archive meaningful.',
      new Date(Date.now() - 3600 * 1000).toISOString(),
    );
  }
  logActivity('Site content loaded', 'Existing research and exhibition content was added to the admin.');
}
