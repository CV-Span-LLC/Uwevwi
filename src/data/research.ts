import { RITUAL_PAPER } from '@/data/research-paper';

export type EntryType = 'Research' | 'Journal';

export type Entry = {
  slug: string;
  type: EntryType;
  /** Position within its type, shown as "01- Journal". */
  number?: string;
  title: string;
  excerpt: string;
  /** Short label shown above the date, e.g. "Part I". */
  part?: string;
  /** ISO date, used for sorting. */
  date: string;
  dateLabel: string;
  image: number;
};

export const RESEARCH_HERO = require('../../assets/figma/research-hero.jpg');

const LEGIBLE_EXCERPT =
  'Why the future of a collection depends less on what it is worth, and more on whether its intelligence can travel with it.';

export const FEATURED: Entry = {
  slug: 'from-ritual-to-violation',
  type: 'Research',
  title: 'From Ritual to Violation: The Misuse of the Aluedhor Fertility Rites in Ozoro, Delta State.',
  excerpt:
    'This paper examines the Aluedhor festival of Ozoro as a case study in the erosion of traditional values and the subsequent weaponization of cultural licence.',
  part: 'UWEVWI FIRST ARCHIVE PAPER',
  date: '2026-07-01',
  dateLabel: '2026',
  image: require('../../assets/figma/research-featured.jpg'),
};

export const JOURNAL: Entry[] = [
  {
    slug: 'what-is-a-cultural-asset',
    type: 'Journal',
    number: '01',
    title: 'What Is a Cultural Asset?',
    excerpt: 'A $200,000 collection can hang in two different collectors’ homes and be worth two entirely different things.',
    date: '2026-08-09',
    dateLabel: '09 August 2026',
    image: require('../../assets/figma/journal-1.jpg'),
  },
  {
    slug: 'possession-is-not-a-strategy',
    type: 'Journal',
    number: '02',
    title: 'Possession Is Not a Strategy',
    excerpt:
      'Possession alone is inadequate; it requires an infrastructure that allows its identity, history, and value to remain intelligible as it moves through transactions, institutions, risk, succession, and time.',
    date: '2026-08-16',
    dateLabel: '16 August 2026',
    image: require('../../assets/figma/journal-2.jpg'),
  },
  {
    slug: 'infrastructure-before-capital',
    type: 'Journal',
    number: '03',
    title: 'Infrastructure Before Capital',
    excerpt:
      'Financial institutions do not discount cultural holdings because of market volatility, they discount them because of unquantified information risk.',
    date: '2026-08-23',
    dateLabel: '23 August 2026',
    image: require('../../assets/figma/journal-3.jpg'),
  },
  {
    slug: 'the-architecture-of-legibility',
    type: 'Journal',
    number: '04',
    title: 'The Architecture of Legibility',
    excerpt: LEGIBLE_EXCERPT,
    date: '2026-08-30',
    dateLabel: '30 August 2026',
    image: require('../../assets/figma/journal-4.jpg'),
  },
  {
    slug: 'what-makes-an-artwork-institutionally-viable',
    type: 'Journal',
    number: '05',
    title: 'What Makes an Artwork Institutionally Viable?',
    excerpt:
      'Moving beyond passion and decoration: the conditions that allow an artwork to be understood, trusted, and used within formal systems.',
    date: '2026-08-30',
    dateLabel: '30 August 2026',
    image: require('../../assets/figma/journal-5.jpg'),
  },
  {
    slug: 'mature-markets-legible-to-wealth-part-1',
    type: 'Journal',
    number: '06',
    title: 'How Mature Markets Made Cultural Assets Legible to Wealth',
    excerpt: LEGIBLE_EXCERPT,
    part: 'Part I',
    date: '2026-09-12',
    dateLabel: '12 September 2026',
    image: require('../../assets/figma/journal-6.jpg'),
  },
  {
    slug: 'mature-markets-legible-to-wealth-part-2',
    type: 'Journal',
    number: '07',
    title: 'How Mature Markets Made Cultural Assets Legible to Wealth',
    excerpt: LEGIBLE_EXCERPT,
    part: 'Part II',
    date: '2026-09-20',
    dateLabel: '20 September 2026',
    image: require('../../assets/figma/journal-7.jpg'),
  },
  {
    slug: 'mature-markets-legible-to-wealth-part-3',
    type: 'Journal',
    number: '08',
    title: 'How Mature Markets Made Cultural Assets Legible to Wealth',
    excerpt: LEGIBLE_EXCERPT,
    part: 'Part III',
    date: '2026-09-20',
    dateLabel: '20 September 2026',
    image: require('../../assets/figma/journal-8.jpg'),
  },
];

export const ALL_ENTRIES: Entry[] = [FEATURED, ...JOURNAL];

export function findEntry(slug: string): Entry | undefined {
  return ALL_ENTRIES.find((e) => e.slug === slug);
}

/** Body blocks for a full article page. */
export type Block =
  | { kind: 'heading'; text: string }
  | { kind: 'p'; text: string; strong?: boolean }
  | { kind: 'mixed'; lead: string; rest: string }
  | { kind: 'list'; items: string[]; ordered?: boolean }
  | { kind: 'quote'; text: string }
  | { kind: 'subheading'; text: string }
  | { kind: 'table'; head: string[]; rows: string[][] }
  | { kind: 'signature' };

export type Article = {
  title: string;
  byline: string;
  image: number;
  blocks: Block[];
};

export const ARTICLES: Record<string, Article> = {
  'from-ritual-to-violation': RITUAL_PAPER,
  'what-is-a-cultural-asset': {
    title: 'What is a Cultural Asset?',
    byline: 'UWEVWI STUDIOS · ARCHIVES 2026',
    image: JOURNAL[0].image,
    blocks: [
      { kind: 'heading', text: 'Introduction' },
      { kind: 'p', text: 'A $200,000 collection can hang in two different collectors’ homes and be worth two entirely different things.' },
      {
        kind: 'p',
        text: 'In one home, it comes with a provenance file, a condition report, a fine-art insurance policy, and an estate plan. In the other, it comes with a story the owner tells at dinner parties. Both owners believe they possess the same value. Only one of them possesses an asset.',
      },
      { kind: 'p', text: 'The difference is neither the artwork nor the price. The difference is what the object can do once it leaves the room it is hanging in.' },
      {
        kind: 'p',
        text: 'Loving a piece of art, knowing it is good, even knowing it is valuable, that is recognition. It happens in the eye and the gut, and it is real. But recognition dies with the person who has it. It does not survive a conversation with a bank evaluating collateral, an insurer pricing risk, a lawyer handling probate, or an heir inheriting the wall it hangs on.',
      },
      {
        kind: 'mixed',
        lead: 'A cultural asset is what recognition becomes once it has been made legible to someone else. ',
        rest: 'Not more beautiful. Not more important. Just readable by people who were not in the room when it was acquired.',
      },
      { kind: 'heading', text: 'The Gap Between Market Value and Infrastructure' },
      {
        kind: 'p',
        text: 'Deloitte Art & Finance reporting estimates that nearly $1 trillion in art and collectibles will change hands globally over the next decade as part of an unprecedented intergenerational wealth transfer. Yet across West Africa, where secondary markets remain heavily concentrated and predominantly informal, the vast majority of private and corporate holdings lack the foundational documentation required to participate in this shifting financial landscape.',
      },
      {
        kind: 'p',
        text: 'When an asset cannot be verified independently, its value cannot circulate. It cannot be used as loan collateral, it cannot be insured accurately against loss, and it cannot pass cleanly between generations without risking severe value erosion.',
      },
      { kind: 'p', text: 'Strip it down, and a cultural asset is an object surrounded by four verifiable structures:' },
      {
        kind: 'list',
        items: [
          'A documented history: Who created it, who has owned it, where it has been exhibited. Without this, a work has no provenance.',
          'A verifiable condition: What physical state it is in today, tracked and conserved over time rather than assumed.',
          'A defensible value: A valuation grounded in transparent market metrics that holds up under independent scrutiny, not just the owner’s confidence.',
          'A path forward: A legal succession structure and an executor who understands what happens to the collection next.',
        ],
      },
      {
        kind: 'p',
        text: 'Take any one of those away and you still have art. You just do not have an asset. You have something that is only valuable for as long as one specific person is alive to explain it.',
      },
      {
        kind: 'quote',
        text: '“Call it a cultural asset, and the governance frameworks that apply to equities or real estate (documentation, valuation, risk management, succession) suddenly apply here too. Call it "just art," and none of them do.”',
      },
      {
        kind: 'p',
        text: 'That is the entire function of the term. It is not a fancier name for a painting. It is an assertion about what kind of thing the object is, and what is owed to it.',
      },
      {
        kind: 'p',
        text: 'Most collectors already know this instinctively about the works they love most. They just have not asked the single question the term is actually demanding:',
      },
      { kind: 'quote', text: '“If I were not in the room to explain this, would it still make sense to anyone else?”' },
      {
        kind: 'p',
        text: 'That question, far more than any price tag, is what separates a collection of valuable objects from an enduring legacy.',
      },
      {
        kind: 'p',
        text: 'Building the future of cultural wealth in West Africa. At Uwevwi, we advise collectors, families, and institutions on transforming physical artworks into structured, institutionally legible cultural assets.',
      },
      {
        kind: 'p',
        text: 'Subscribe to the Uwevwi newsletter for ongoing insights on collection stewardship, art finance, and cultural asset management.',
      },
      {
        kind: 'p',
        strong: true,
        text: 'This is the first installment in Uwevwi’s series examining the information mechanics of cultural wealth, governance, and institutional legibility across growth markets.',
      },
      { kind: 'signature' },
    ],
  },
};
